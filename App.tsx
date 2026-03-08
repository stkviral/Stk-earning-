
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  User, UserTag, UserStatus, AppState, Transaction,
  COIN_TO_INR_RATE, AppSettings, AdminLog, ActivityLog, ADMIN_EMAIL
} from './types';
import Dashboard from './pages/Dashboard';
import SpinWheel from './pages/SpinWheel';
import Wallet from './pages/Wallet';
import Referral from './pages/Referral';
import Videos from './pages/Videos';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Login from './pages/Login';
import Leaderboard from './pages/Leaderboard';
import ScratchCard from './pages/ScratchCard';
import Navigation from './components/Navigation';
import AdOverlay from './components/AdOverlay';
import Header from './components/Header';
import { ShieldOff, RefreshCw, Server, Ban } from 'lucide-react';
import { BackendAI } from './geminiService';

interface AppContextType {
  state: AppState & { isAdBlockerActive: boolean; isAdminSession: boolean; theme: 'light' | 'dark' };
  isDeviceLimitReached: boolean;
  getServerTime: () => number;
  updateUser: (updates: Partial<User>) => void;
  updateLogo: (url: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  addCoins: (amount: number, method: string, type?: Transaction['type']) => boolean;
  claimSpinReward: (reward: number) => boolean;
  claimScratchReward: (reward: number) => boolean;
  claimDailyCheckIn: () => boolean;
  playAd: (onReward: () => void, type: 'REWARD' | 'REQUIRED', onClose?: () => void) => void;
  login: (email: string, name: string, referralCode?: string) => void;
  logout: () => void;
  toggleTheme: () => void;
  withdraw: (upiId: string, amount: number) => string | null;
  cancelWithdrawal: (txId: string) => string | null;
  setActiveTab: (tab: string) => void;
  calculateRiskScore: (user: User) => number;
  checkAdBlocker: () => Promise<boolean>;
  logAdminAction: (action: string, targetId: string, details: string) => void;
  logActivity: (userId: string, userName: string, action: string, details: string) => void;
  updateDeviceClaim: (deviceId: string, timestamp: number) => void;
  adminActions: {
    approveWithdrawal: (userId: string, txId: string, paymentTxId?: string) => void;
    rejectWithdrawal: (userId: string, txId: string, rejectionReason: string) => void;
    setWalletFrozen: (userId: string, frozen: boolean, reason?: string) => void;
    setUserStatus: (userId: string, status: UserStatus, reason?: string, durationMs?: number) => void;
    modifyCoins: (userId: string, amount: number, reason: string) => void;
    resetCooldowns: (userId: string, type: 'SPIN' | 'ALL', reason: string) => void;
    updateUserSettings: (userId: string, updates: Partial<User>) => void;
    impersonateUser: (userId: string) => void;
  }
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const DEFAULT_SETTINGS: AppSettings = {
  maintenanceMode: false,
  spinEnabled: true,
  scratchEnabled: true,
  videosEnabled: true,
  referralsEnabled: true,
  adsEnabled: true,
  withdrawalsEnabled: true,
  systemNotification: "Welcome to STK Earning!",
  appVersion: "1.0.0",
  minVersionRequired: "1.0.0",
  dailyCapNormal: 200,
  dailyBonusReward: 5,
  adRewardCoins: 1,
  referralReward: 50,
  spinRewards: [1, 2, 3, 5, 10],
  maxDailySpinsNormal: 3,
  spinCooldownMinutes: 0,
  scratchRewards: [2, 4, 6, 8, 15],
  maxDailyScratchesNormal: 3,
  scratchCooldownMinutes: 0,
  scratchProbabilities: { "2": 40, "4": 30, "6": 20, "8": 9, "15": 1 },
  withdrawalFeeNormal: 0,
  minWithdrawalCoins: 5000,
  withdrawalCooldownHours: 48,
  maxDailyAds: 20,
  dailyWithdrawalLimit: 5000,
  spinProbabilities: { "1": 40, "2": 30, "3": 20, "5": 9, "10": 1 },
  emergencyRewardReduction: 0,
  globalRewardMultiplier: 1
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState & { isAdBlockerActive: boolean; isAdminSession: boolean; theme: 'light' | 'dark' }>(() => {
    const saved = localStorage.getItem('stk_app_state');
    const parsed = saved ? JSON.parse(saved) : null;
    return {
      currentUser: parsed?.currentUser || null,
      allUsers: parsed?.allUsers || [],
      isLoggedIn: !!parsed?.currentUser,
      logoUrl: parsed?.logoUrl || '',
      settings: { ...DEFAULT_SETTINGS, ...(parsed?.settings || {}) },
      logs: parsed?.logs || [],
      activityLogs: parsed?.activityLogs || [],
      adminUsers: parsed?.adminUsers || [{ email: ADMIN_EMAIL, role: 'SUPER_ADMIN', requires2FA: false }],
      deviceClaims: parsed?.deviceClaims || {},
      isAdBlockerActive: false,
      isAdminSession: parsed?.currentUser?.email === ADMIN_EMAIL || (parsed?.adminUsers || []).some((u: any) => u.email === parsed?.currentUser?.email),
      theme: parsed?.theme || 'dark'
    };
  });

  const [activeTab, setActiveTab] = useState('home');
  const [adConfig, setAdConfig] = useState<{ type: 'REWARD' | 'REQUIRED'; onComplete: () => void } | null>(null);
  const lastRewardTimeRef = React.useRef<number>(0);
  const timeOffsetRef = React.useRef<number>(0);

  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
        const data = await res.json();
        const serverTime = data.unixtime * 1000;
        timeOffsetRef.current = serverTime - Date.now();
      } catch (e) {
        console.warn('Failed to fetch server time, relying on device time', e);
      }
    };
    fetchServerTime();
  }, []);

  const getServerTime = useCallback(() => {
    return Date.now() + timeOffsetRef.current;
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setState(prev => {
      if (!prev.currentUser) return prev;
      const updatedUser = { 
        ...prev.currentUser, 
        transactions: prev.currentUser.transactions || [],
        referralHistory: prev.currentUser.referralHistory || [],
        ...updates, 
        lastActiveAt: Date.now() 
      };
      return {
        ...prev,
        currentUser: updatedUser,
        allUsers: prev.allUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
      };
    });
  }, []);

  const checkAdBlocker = useCallback(async () => {
    let detected = false;
    const dummy = document.createElement('div');
    dummy.innerHTML = '&nbsp;';
    dummy.className = 'adsbox ad-banner ad-placement pub_300x250 text-ads';
    dummy.setAttribute('style', 'position: absolute; top: -1000px; left: -1000px; width: 1px; height: 1px; display: block !important;');
    document.body.appendChild(dummy);
    
    try {
      const testUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      await fetch(new Request(testUrl), { method: 'HEAD', mode: 'no-cors', cache: 'no-store' });
    } catch (e) {
      detected = true;
    }

    const styles = window.getComputedStyle(dummy);
    if (styles.display === 'none' || styles.visibility === 'hidden' || dummy.offsetHeight === 0) {
      detected = true;
    }
    document.body.removeChild(dummy);

    setState(prev => ({ ...prev, isAdBlockerActive: detected }));
    return detected;
  }, []);

  // Daily Reset & Pass Expiry Effect
  useEffect(() => {
    if (!state.currentUser) return;
    const now = getServerTime();
    const lastReset = state.currentUser.lastResetTimestamp || 0;
    const dayInMs = 24 * 60 * 60 * 1000;

    const updates: Partial<User> = {};

    // Daily Reset
    if (now - lastReset >= dayInMs) {
      const missedDay = now - lastReset >= dayInMs * 2;
      let newStreak = state.currentUser.streakDays || 0;
      if (missedDay || newStreak >= 7) {
        newStreak = 0;
      }
      Object.assign(updates, {
        dailyEarned: 0,
        adsWatchedToday: 0,
        spinsToday: 0,
        extraSpinWatchedToday: false,
        scratchesToday: 0,
        extraScratchWatchedToday: false,
        dailyRewardClaimed: false,
        lastResetTimestamp: now,
        streakDays: newStreak
      });
    }

    if (Object.keys(updates).length > 0) {
      updateUser(updates);
    }
  }, [state.currentUser?.id, state.currentUser?.lastResetTimestamp, getServerTime]);

  useEffect(() => {
    checkAdBlocker();
    const interval = setInterval(checkAdBlocker, 30000);
    return () => clearInterval(interval);
  }, [checkAdBlocker]);

  useEffect(() => {
    localStorage.setItem('stk_app_state', JSON.stringify(state));
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const updateLogo = (url: string) => setState(prev => ({ ...prev, logoUrl: url }));
  const updateSettings = (updates: Partial<AppSettings>) => setState(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  const updateDeviceClaim = (deviceId: string, timestamp: number) => setState(prev => ({ ...prev, deviceClaims: { ...prev.deviceClaims, [deviceId]: timestamp } }));

  const logActivity = useCallback((userId: string, userName: string, action: string, details: string) => {
    const newLog: ActivityLog = { 
      id: Math.random().toString(36).substring(2, 9), 
      userId, 
      userName, 
      action, 
      details, 
      timestamp: Date.now() 
    };
    setState(prev => ({ 
      ...prev, 
      activityLogs: [newLog, ...(prev.activityLogs || [])].slice(0, 100) 
    }));
  }, []);

  const addCoins = useCallback((baseAmount: number, method: string, type: Transaction['type'] = 'ADJUST'): boolean => {
    if (!state.currentUser) return false;
    if (state.currentUser.status === UserStatus.SUSPENDED) {
      alert(`Account Suspended: ${state.currentUser.statusReason || 'Violation of terms'}`);
      return false;
    }
    if (state.settings.adsEnabled && state.isAdBlockerActive) {
      alert("Reward Blocked: Please disable your ad-blocker to receive coins.");
      return false;
    }
    
    // Apply global multiplier and emergency reduction
    let amount = baseAmount;
    if (amount > 0) {
      amount = Math.floor(amount * (state.settings.globalRewardMultiplier || 1));
      if (state.settings.emergencyRewardReduction > 0) {
        amount = Math.floor(amount * (1 - (state.settings.emergencyRewardReduction / 100)));
      }
    }

    const todayEarned = state.currentUser.dailyEarned || 0;
    const dailyCap = state.settings.dailyCapNormal;

    if (todayEarned + amount > dailyCap && amount > 0) {
      const allowed = dailyCap - todayEarned;
      if (allowed <= 0) {
        alert("Daily earning cap reached!");
        return false;
      }
      amount = allowed;
    }

    const transaction: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      userId: state.currentUser.id,
      amount,
      type,
      method,
      status: 'COMPLETED',
      timestamp: Date.now()
    };
    updateUser({
      coins: (state.currentUser.coins || 0) + amount,
      dailyEarned: todayEarned + (amount > 0 ? amount : 0),
      transactions: [transaction, ...(state.currentUser.transactions || [])]
    });
    return true;
  }, [state.currentUser, state.settings, state.isAdBlockerActive, updateUser]);

  const claimSpinReward = useCallback((reward: number): boolean => {
    if (!state.currentUser) return false;
    const multiplier = state.currentUser.streakDays >= 7 ? 2.0 : 1.0 + (state.currentUser.streakDays || 0) * 0.1;
    const finalReward = Math.round(reward * multiplier);
    
    const success = addCoins(finalReward, 'Spin Reward', 'SPIN');
    if (success) {
      updateUser({
        spinsToday: (state.currentUser.spinsToday || 0) + 1,
        lastSpinTimestamp: getServerTime()
      });
      logActivity(state.currentUser.id, state.currentUser.name, 'SPIN_CLAIM', `Won ${finalReward} coins (Base: ${reward}, Multiplier: ${multiplier.toFixed(1)}x)`);
    }
    return success;
  }, [state.currentUser, addCoins, updateUser, logActivity, getServerTime]);

  const claimScratchReward = useCallback((reward: number): boolean => {
    if (!state.currentUser) return false;
    const multiplier = state.currentUser.streakDays >= 7 ? 2.0 : 1.0 + (state.currentUser.streakDays || 0) * 0.1;
    const finalReward = Math.round(reward * multiplier);
    
    const success = addCoins(finalReward, 'Scratch Reward', 'SPIN'); // Using SPIN type for now
    if (success) {
      updateUser({
        scratchesToday: (state.currentUser.scratchesToday || 0) + 1,
        lastScratchTimestamp: getServerTime()
      });
      logActivity(state.currentUser.id, state.currentUser.name, 'SCRATCH_CLAIM', `Won ${finalReward} coins (Base: ${reward}, Multiplier: ${multiplier.toFixed(1)}x)`);
    }
    return success;
  }, [state.currentUser, addCoins, updateUser, logActivity, getServerTime]);

  const claimDailyCheckIn = useCallback((): boolean => {
    if (!state.currentUser) return false;
    const currentStreak = state.currentUser.streakDays || 0;
    const currentDay = currentStreak + 1;
    
    const baseReward = 5;
    let reward = baseReward;
    if (currentDay === 7) {
      reward += 25; // Extra weekly bonus
    }
    
    const success = addCoins(reward, 'Daily Check-In', 'CHECKIN');
    if (success) {
      updateUser({ 
        dailyRewardClaimed: true, 
        streakDays: currentDay
      });
      updateDeviceClaim(state.currentUser.deviceId, getServerTime());
      logActivity(state.currentUser.id, state.currentUser.name, 'DAILY_BONUS', `Claimed Day ${currentDay} reward (${reward} coins)`);
    }
    return success;
  }, [state.currentUser, addCoins, updateUser, updateDeviceClaim, logActivity, getServerTime]);

  const playAd = useCallback((onReward: () => void, type: 'REWARD' | 'REQUIRED', onClose?: () => void) => {
    if (state.currentUser?.status === UserStatus.SUSPENDED) {
      alert(`Account Suspended: ${state.currentUser?.statusReason || 'Violation of terms'}`);
      if (onClose) onClose();
      return;
    }
    const now = getServerTime();
    if (now - lastRewardTimeRef.current < 20000) {
      alert("Please wait before earning again.");
      if (onClose) onClose();
      return;
    }
    
    if (!state.settings.adsEnabled) { 
      lastRewardTimeRef.current = getServerTime();
      onReward(); 
      if (onClose) onClose();
      return; 
    }
    if (state.currentUser?.adsBlocked) { 
      alert("System Restriction: Ad access suspended."); 
      onReward(); // Call onReward to unblock UI, but the action might fail inside onReward
      if (onClose) onClose();
      return; 
    }
    if (state.isAdBlockerActive) { 
      alert("Please disable your ad-blocker to watch ads."); 
      if (onClose) onClose();
      return; 
    }
    
    // Add random delay between 500ms and 1500ms to prevent instant auto-clicker triggers
    setTimeout(() => {
      setAdConfig({ 
        type, 
        onReward: () => {
          lastRewardTimeRef.current = getServerTime();
          onReward();
        },
        onClose: () => {
          if (onClose) onClose();
          setAdConfig(null);
        }
      });
    }, Math.random() * 1000 + 500);
  }, [state.settings.adsEnabled, state.currentUser?.adsBlocked, state.isAdBlockerActive, getServerTime]);

  const logAdminAction = useCallback((action: string, targetId: string, details: string) => {
    const newLog: AdminLog = { id: Math.random().toString(36).substring(2, 9), adminId: 'SUPER_ADMIN', action, targetId, details, timestamp: Date.now() };
    setState(prev => ({ ...prev, logs: [newLog, ...prev.logs] }));
  }, []);

  const getPersistentDeviceId = () => {
    let deviceId = localStorage.getItem('stk_device_id');
    if (!deviceId) {
      deviceId = 'DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem('stk_device_id', deviceId);
    }
    return deviceId;
  };

  const login = (email: string, name: string, referralCode?: string) => {
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    let user = state.allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        coins: 0,
        tag: UserTag.NORMAL,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referredBy: referralCode,
        dailyEarned: 0,
        lastResetTimestamp: Date.now(),
        adsWatchedToday: 0,
        lastAdTimestamp: 0,
        dailyRewardClaimed: false,
        streakDays: 0,
        spinsToday: 0,
        lastSpinTimestamp: 0,
        extraSpinWatchedToday: false,
        scratchesToday: 0,
        lastScratchTimestamp: 0,
        extraScratchWatchedToday: false,
        status: UserStatus.ACTIVE,
        walletFrozen: false,
        adsBlocked: false,
        transactions: [],
        referralHistory: [],
        deviceId: getPersistentDeviceId(),
        lastIp: '192.168.1.' + Math.floor(Math.random() * 255),
        riskScore: 0,
        earningVelocity: 0,
        lastActiveAt: Date.now()
      };
      setState(prev => ({ ...prev, allUsers: [...prev.allUsers, user!] }));
    } else {
      // Update existing user's device ID to the persistent one if it's different
      const persistentId = getPersistentDeviceId();
      if (user.deviceId !== persistentId) {
        user.deviceId = persistentId;
        setState(prev => ({
          ...prev,
          allUsers: prev.allUsers.map(u => u.id === user!.id ? { ...u, deviceId: persistentId } : u)
        }));
      }
    }
    setState(prev => ({ ...prev, currentUser: user!, isLoggedIn: true, isAdminSession: isAdmin }));
    setActiveTab(isAdmin ? 'admin' : 'home');
    if (!isAdmin) {
      logActivity(user!.id, user!.name, 'LOGIN', `User logged in from ${user!.lastIp}`);
    }
  };

  const logout = () => { 
    console.log("App: logout called");
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (e) {
      console.warn("Google logout failed", e);
    }
    setState(prev => ({ ...prev, currentUser: null, isLoggedIn: false, isAdminSession: false })); 
    setActiveTab('home'); 
  };
  const toggleTheme = useCallback(() => {
    setState(prev => {
      return { ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' };
    });
  }, []);

  const withdraw = (upiId: string, amount: number): string | null => {
    if (!state.currentUser) return "User session error";
    if (state.currentUser.status === UserStatus.SUSPENDED) return `Account Suspended: ${state.currentUser.statusReason || 'Violation of terms'}`;
    if (!state.settings.withdrawalsEnabled) return "Withdrawals are temporarily disabled by the administrator.";
    if (state.currentUser.walletFrozen) return "Your wallet is frozen.";
    if (state.currentUser.coins < amount) return "Insufficient balance";
    if (amount < state.settings.minWithdrawalCoins) return `Minimum withdrawal is ${state.settings.minWithdrawalCoins} coins.`;
    const cooldownMs = (state.settings.withdrawalCooldownHours || 48) * 60 * 60 * 1000;
    const nextAllowed = (state.currentUser.lastWithdrawalTimestamp || 0) + cooldownMs;
    if (Date.now() < nextAllowed) return "Withdrawal Cooldown: Please wait before next request.";
    const upiRegex = /^[\w\.-]+@[\w\.-]+$/;
    if (!upiRegex.test(upiId)) return "Invalid UPI ID format.";
    
    const feePercentage = state.settings.withdrawalFeeNormal;
    const feeAmount = Math.floor(amount * (feePercentage / 100));
    const finalAmount = amount - feeAmount;

    const tx: Transaction = {
      id: 'WD-' + Math.random().toString(36).substring(2, 9),
      userId: state.currentUser.id,
      amount: finalAmount, type: 'WITHDRAWAL', method: `UPI: ${upiId} (Fee: ${feeAmount})`, status: 'PENDING', timestamp: Date.now()
    };
    
    const newTransactions = [tx, ...(state.currentUser.transactions || [])];
    updateUser({ coins: state.currentUser.coins - amount, transactions: newTransactions, upiId, lastWithdrawalTimestamp: Date.now() });
    
    // Also update allUsers
    setState(prev => ({
      ...prev,
      allUsers: prev.allUsers.map(u => u.id === prev.currentUser!.id ? { ...u, coins: u.coins - amount, transactions: newTransactions, upiId, lastWithdrawalTimestamp: Date.now() } : u)
    }));
    
    logActivity(state.currentUser.id, state.currentUser.name, 'WITHDRAW_REQUEST', `Requested ₹${(finalAmount * COIN_TO_INR_RATE).toFixed(2)} to ${upiId} (Fee: ${feeAmount} coins)`);
    return null;
  };

  const cancelWithdrawal = (txId: string): string | null => {
    if (!state.currentUser) return "User session error";
    const txIndex = (state.currentUser.transactions || []).findIndex(t => t.id === txId);
    if (txIndex === -1) return "Transaction not found";
    
    const tx = state.currentUser.transactions[txIndex];
    if (tx.status !== 'PENDING') return "Only pending withdrawals can be cancelled";
    
    const feeMatch = tx.method.match(/Fee: (\d+)/);
    const feeAmount = feeMatch ? parseInt(feeMatch[1]) : 0;
    const refundAmount = tx.amount + feeAmount;

    const updatedTx: Transaction = { ...tx, status: 'REJECTED', rejectionReason: 'Cancelled by user' };
    const newTransactions = [...(state.currentUser.transactions || [])];
    newTransactions[txIndex] = updatedTx;

    updateUser({
      coins: state.currentUser.coins + refundAmount,
      transactions: newTransactions,
      lastWithdrawalTimestamp: 0 // Reset cooldown
    });
    
    // Also update allUsers
    setState(prev => ({
      ...prev,
      allUsers: prev.allUsers.map(u => u.id === prev.currentUser!.id ? { ...u, coins: u.coins + refundAmount, transactions: newTransactions, lastWithdrawalTimestamp: 0 } : u)
    }));

    logActivity(state.currentUser.id, state.currentUser.name, 'WITHDRAW_CANCEL', `Cancelled withdrawal ${txId} and refunded ${refundAmount} coins`);
    return null;
  };

  const adminActions = {
    approveWithdrawal: (userId: string, txId: string, paymentTxId?: string) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => u.id !== userId ? u : { ...u, transactions: (u.transactions || []).map(t => t.id === txId ? { ...t, status: 'COMPLETED' as const, paymentTxId } : t) });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('PAYOUT_APPROVE', userId, `Approved payout ${txId}${paymentTxId ? ` (TxID: ${paymentTxId})` : ''}`);
    },
    rejectWithdrawal: (userId: string, txId: string, rejectionReason: string) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => {
          if (u.id !== userId) return u;
          const tx = (u.transactions || []).find(t => t.id === txId);
          return { ...u, coins: u.coins + (tx?.amount || 0), transactions: (u.transactions || []).map(t => t.id === txId ? { ...t, status: 'REJECTED' as const, rejectionReason } : t) };
        });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('PAYOUT_REJECT', userId, `Rejected payout ${txId}. Reason: ${rejectionReason}`);
    },
    setWalletFrozen: (userId: string, frozen: boolean, reason?: string) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => u.id !== userId ? u : { ...u, walletFrozen: frozen });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction(frozen ? 'WALLET_FREEZE' : 'WALLET_UNFREEZE', userId, reason || '');
    },
    setUserStatus: (userId: string, status: UserStatus, reason?: string) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => u.id !== userId ? u : { ...u, status, statusReason: reason });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('STATUS_OVERRIDE', userId, `Status set to ${status}`);
    },
    modifyCoins: (userId: string, amount: number, reason: string) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => {
          if (u.id !== userId) return u;
          const tx: Transaction = {
            id: 'ADJ-' + Math.random().toString(36).substring(2, 9),
            userId: u.id,
            amount,
            type: 'ADJUST',
            method: reason,
            status: 'COMPLETED',
            timestamp: Date.now()
          };
          return { ...u, coins: Math.max(0, u.coins + amount), transactions: [tx, ...(u.transactions || [])] };
        });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('COIN_ADJUST', userId, `Adjusted ${amount} coins. Reason: ${reason}`);
    },
    resetCooldowns: (userId: string, type: 'SPIN' | 'SCRATCH' | 'ALL', reason: string) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => {
          if (u.id !== userId) return u;
          const updates: Partial<User> = {};
          if (type === 'SPIN' || type === 'ALL') {
             updates.spinsToday = 0;
             updates.lastSpinTimestamp = 0;
          }
          if (type === 'SCRATCH' || type === 'ALL') {
             updates.scratchesToday = 0;
             updates.lastScratchTimestamp = 0;
          }
          return { ...u, ...updates };
        });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('RESET_COOLDOWN', userId, `Reset ${type} cooldown. Reason: ${reason}`);
    },
    updateUserSettings: (userId: string, updates: Partial<User>) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => u.id !== userId ? u : { ...u, ...updates });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
    },
    impersonateUser: (userId: string) => {
      const user = state.allUsers.find(u => u.id === userId);
      if (!user) return alert("User not found!");
      setState(prev => ({ ...prev, currentUser: user }));
      setActiveTab('home');
    }
  };

  const renderContent = () => {
    if (!state.isLoggedIn) {
      return <Login onLogin={login} />;
    }
    if (state.currentUser?.status === UserStatus.BANNED && !state.isAdminSession) {
      return (
        <div className="flex flex-col h-full items-center justify-center p-8 text-center space-y-6">
           <Ban size={48} className="text-red-600 animate-bounce" />
           <h2 className="text-3xl font-black text-white italic">Access Denied</h2>
           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Account purged.</p>
           <button onClick={logout} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl">Sign Out</button>
        </div>
      );
    }
    if (state.settings.maintenanceMode && !state.isAdminSession) {
      return (
        <div className="flex flex-col h-full items-center justify-center p-8 text-center space-y-8 bg-gray-950">
           <Server size={48} className="text-orange-600 animate-pulse" />
           <h2 className="text-3xl font-black text-white italic">Maintenance</h2>
           <button onClick={logout} className="px-8 py-3 bg-gray-900 text-gray-500 rounded-full font-black text-xs uppercase border border-gray-800">Disconnect</button>
        </div>
      );
    }
    if (activeTab === 'admin') {
      if (state.currentUser?.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setActiveTab('home');
        return <Dashboard />;
      }
      return <AdminPanel />;
    }
    if (activeTab === 'privacy') return <PrivacyPolicy />;
    if (activeTab === 'faq') return <FAQ />;
    if (activeTab === 'profile') return <Profile />;
    switch (activeTab) {
      case 'home': return <Dashboard />;
      case 'spin': return <SpinWheel />;
      case 'scratch': return <ScratchCard />;
      case 'wallet': return <Wallet />;
      case 'invite': return <Referral />;
      case 'videos': return <Videos />;
      case 'leaderboard': return <Leaderboard />;
      default: return <Dashboard />;
    }
  };

  const calculateRiskScore = useCallback((user: User) => {
    let score = 0;
    
    // Check for shared Device ID
    const sharedDevice = state.allUsers.filter(u => u.deviceId === user.deviceId && u.id !== user.id).length;
    if (sharedDevice > 0) score += sharedDevice * 20;

    // Check for shared IP
    const sharedIp = state.allUsers.filter(u => u.lastIp === user.lastIp && u.id !== user.id).length;
    if (sharedIp > 0) score += sharedIp * 10;

    // Check earning velocity (if they earned more than daily cap)
    const dailyCap = state.settings.dailyCapNormal;
    if (user.dailyEarned > dailyCap * 2) score += 30;

    // Check referral abuse (if many referrals have same IP)
    const suspiciousReferrals = state.allUsers.filter(u => u.referredBy === user.referralCode && u.lastIp === user.lastIp).length;
    if (suspiciousReferrals > 0) score += suspiciousReferrals * 25;

    return Math.min(100, score);
  }, [state.allUsers, state.settings.dailyCapNormal]);

  const isDeviceLimitReached = state.currentUser ? state.allUsers.filter(u => u.deviceId === state.currentUser?.deviceId).length > 3 : false;

  return (
    <AppContext.Provider value={{
      state, isDeviceLimitReached, getServerTime, updateUser, updateLogo, updateSettings, addCoins, 
      claimSpinReward, claimScratchReward, claimDailyCheckIn,
      playAd, login, logout, 
      toggleTheme, withdraw, cancelWithdrawal, setActiveTab, calculateRiskScore,
      checkAdBlocker, logAdminAction, logActivity, updateDeviceClaim, adminActions
    }}>
      <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-gray-50 dark:bg-gray-950 shadow-2xl relative overflow-hidden transition-colors duration-300">
        {state.isLoggedIn && <Header isAdmin={state.isAdminSession} />}
        {state.isAdminSession && activeTab !== 'admin' && (
           <div className="bg-orange-600 text-white px-4 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest z-[100]">
              <div className="flex items-center gap-2"><Server size={14} /> <span>Admin Control</span></div>
              <button onClick={() => setActiveTab('admin')} className="bg-white/20 px-2 py-1 rounded-lg">Panel</button>
           </div>
        )}
        <main className="flex-1 overflow-y-auto no-scrollbar relative">
          {state.settings.adsEnabled && state.isAdBlockerActive && state.isLoggedIn && activeTab !== 'admin' && !state.settings.maintenanceMode && (
            <div className="mx-6 mt-4 p-4 bg-red-600 rounded-[28px] text-white flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><ShieldOff size={20} className="animate-pulse" /><span className="text-[10px] font-black uppercase">Ad-Blocker Active</span></div>
                <button onClick={checkAdBlocker} className="p-2 bg-white/20 rounded-xl"><RefreshCw size={14} /></button>
              </div>
            </div>
          )}
          {renderContent()}
        </main>
        {state.isLoggedIn && activeTab !== 'admin' && activeTab !== 'privacy' && !state.settings.maintenanceMode && (
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
        {adConfig && <AdOverlay type={adConfig.type} onReward={adConfig.onReward} onClose={adConfig.onClose} />}
      </div>
    </AppContext.Provider>
  );
};

export default App;
