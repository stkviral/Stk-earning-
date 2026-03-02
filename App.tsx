
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  User, UserTag, UserStatus, AppState, Transaction,
  COIN_TO_INR_RATE, AppSettings, AdminLog, ActivityLog, ADMIN_EMAIL
} from './types';
import Dashboard from './pages/Dashboard';
import Mining from './pages/Mining';
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
import Navigation from './components/Navigation';
import AdOverlay from './components/AdOverlay';
import Header from './components/Header';
import { ShieldOff, RefreshCw, Server, Ban } from 'lucide-react';
import { BackendAI } from './geminiService';

interface AppContextType {
  state: AppState & { isAdBlockerActive: boolean; isAdminSession: boolean; theme: 'light' | 'dark' };
  updateUser: (updates: Partial<User>) => void;
  updateLogo: (url: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  addCoins: (amount: number, method: string, type?: Transaction['type']) => boolean;
  claimMiningReward: () => boolean;
  claimSpinReward: (reward: number) => boolean;
  claimDailyCheckIn: () => boolean;
  playAd: (onComplete: () => void, type: 'REWARD' | 'REQUIRED') => void;
  login: (email: string, name: string, referralCode?: string) => void;
  logout: () => void;
  toggleTheme: () => void;
  withdraw: (upiId: string, amount: number) => string | null;
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
    resetCooldowns: (userId: string, type: 'MINING' | 'SPIN' | 'ALL', reason: string) => void;
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
  miningEnabled: true,
  spinEnabled: true,
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
  miningDurationNormal: 24 * 60 * 60 * 1000,
  miningRewardNormal: 10,
  miningCyclesPerDayNormal: 3,
  spinRewards: [1, 2, 3, 5, 10],
  maxDailySpinsNormal: 3,
  spinCooldownMinutes: 0,
  withdrawalFeeNormal: 0,
  minWithdrawalCoins: 5000,
  withdrawalCooldownHours: 48,
  paymentQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=stk@upi&pn=STK%20Earning&am=500&cu=INR",
  adminUpiId: "stk@upi",
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

  const updateUser = useCallback((updates: Partial<User>) => {
    setState(prev => {
      if (!prev.currentUser) return prev;
      const updatedUser = { ...prev.currentUser, ...updates, lastActiveAt: Date.now() };
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
    const now = Date.now();
    const lastReset = state.currentUser.lastResetTimestamp || 0;
    const dayInMs = 24 * 60 * 60 * 1000;

    const updates: Partial<User> = {};

    // Daily Reset
    if (now - lastReset >= dayInMs) {
      const missedDay = now - lastReset >= dayInMs * 2;
      Object.assign(updates, {
        dailyEarned: 0,
        adsWatchedToday: 0,
        spinsToday: 0,
        extraSpinWatchedToday: false,
        dailyRewardClaimed: false,
        lastResetTimestamp: now,
        streakDays: missedDay ? 0 : state.currentUser.streakDays
      });
    }

    if (Object.keys(updates).length > 0) {
      updateUser(updates);
    }
  }, [state.currentUser?.id, state.currentUser?.lastResetTimestamp]);

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
      coins: state.currentUser.coins + amount,
      dailyEarned: todayEarned + (amount > 0 ? amount : 0),
      transactions: [transaction, ...state.currentUser.transactions]
    });
    return true;
  }, [state.currentUser, state.settings, state.isAdBlockerActive, updateUser]);

  const claimMiningReward = useCallback((): boolean => {
    if (!state.currentUser) return false;
    const reward = state.settings.miningRewardNormal; // Should be 10
    const success = addCoins(reward, 'Mining Reward', 'MINING');
    if (success) {
      updateUser({
        miningStartedAt: 0,
        miningLastClaimedAt: Date.now(),
        miningClaimed: true,
        miningCyclesToday: (state.currentUser.miningCyclesToday || 0) + 1,
      });
      logActivity(state.currentUser.id, state.currentUser.name, 'MINING_CLAIM', `Claimed ${reward} coins`);
    }
    return success;
  }, [state.currentUser, state.settings.miningRewardNormal, addCoins, updateUser, logActivity]);

  const claimSpinReward = useCallback((reward: number): boolean => {
    if (!state.currentUser) return false;
    const success = addCoins(reward, 'Spin Reward', 'SPIN');
    if (success) {
      updateUser({
        spinsToday: (state.currentUser.spinsToday || 0) + 1,
        lastSpinTimestamp: Date.now()
      });
      logActivity(state.currentUser.id, state.currentUser.name, 'SPIN_CLAIM', `Won ${reward} coins`);
    }
    return success;
  }, [state.currentUser, addCoins, updateUser, logActivity]);

  const claimDailyCheckIn = useCallback((): boolean => {
    if (!state.currentUser) return false;
    const currentDay = (state.currentUser.streakDays || 0) % 7 + 1;
    const reward = currentDay === 7 ? 25 : 5;
    
    const success = addCoins(reward, 'Daily Check-In', 'CHECKIN');
    if (success) {
      updateUser({ 
        dailyRewardClaimed: true, 
        streakDays: (state.currentUser.streakDays || 0) + 1
      });
      updateDeviceClaim(state.currentUser.deviceId, Date.now());
      logActivity(state.currentUser.id, state.currentUser.name, 'DAILY_BONUS', `Claimed Day ${currentDay} reward (${reward} coins)`);
    }
    return success;
  }, [state.currentUser, addCoins, updateUser, updateDeviceClaim, logActivity]);

  const playAd = useCallback((onComplete: () => void, type: 'REWARD' | 'REQUIRED') => {
    if (!state.settings.adsEnabled) { onComplete(); return; }
    if (state.currentUser?.adsBlocked) { 
      alert("System Restriction: Ad access suspended."); 
      onComplete(); // Call onComplete to unblock UI, but the action might fail inside onComplete
      return; 
    }
    if (state.isAdBlockerActive) { 
      alert("Please disable your ad-blocker to watch ads."); 
      // We don't call onComplete here because we want the user to fix the ad-blocker and try again
      // But we need a way to reset the 'pending' state in components.
      // So we'll return a boolean or just call onComplete with a flag.
      // For now, let's just call onComplete to avoid stuck UI, but components should check isAdBlockerActive.
      onComplete(); 
      return; 
    }
    setAdConfig({ type, onComplete });
  }, [state.settings.adsEnabled, state.currentUser?.adsBlocked, state.isAdBlockerActive]);

  const logAdminAction = useCallback((action: string, targetId: string, details: string) => {
    const newLog: AdminLog = { id: Math.random().toString(36).substring(2, 9), adminId: 'SUPER_ADMIN', action, targetId, details, timestamp: Date.now() };
    setState(prev => ({ ...prev, logs: [newLog, ...prev.logs] }));
  }, []);

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
        miningClaimed: false,
        miningCyclesToday: 0,
        dailyRewardClaimed: false,
        streakDays: 0,
        spinsToday: 0,
        lastSpinTimestamp: 0,
        extraSpinWatchedToday: false,
        status: UserStatus.ACTIVE,
        walletFrozen: false,
        adsBlocked: false,
        transactions: [],
        referralHistory: [],
        deviceId: 'DEV-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        lastIp: '192.168.1.' + Math.floor(Math.random() * 255),
        riskScore: 0,
        earningVelocity: 0,
        lastActiveAt: Date.now()
      };
      setState(prev => ({ ...prev, allUsers: [...prev.allUsers, user!] }));
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
    updateUser({ coins: state.currentUser.coins - amount, transactions: [tx, ...state.currentUser.transactions], upiId, lastWithdrawalTimestamp: Date.now() });
    logActivity(state.currentUser.id, state.currentUser.name, 'WITHDRAW_REQUEST', `Requested ₹${(finalAmount * COIN_TO_INR_RATE).toFixed(2)} to ${upiId} (Fee: ${feeAmount} coins)`);
    return null;
  };

  const adminActions = {
    approveWithdrawal: (userId: string, txId: string, paymentTxId?: string) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => u.id !== userId ? u : { ...u, transactions: u.transactions.map(t => t.id === txId ? { ...t, status: 'COMPLETED' as const, paymentTxId } : t) });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('PAYOUT_APPROVE', userId, `Approved payout ${txId}${paymentTxId ? ` (TxID: ${paymentTxId})` : ''}`);
    },
    rejectWithdrawal: (userId: string, txId: string, rejectionReason: string) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => {
          if (u.id !== userId) return u;
          const tx = u.transactions.find(t => t.id === txId);
          return { ...u, coins: u.coins + (tx?.amount || 0), transactions: u.transactions.map(t => t.id === txId ? { ...t, status: 'REJECTED' as const, rejectionReason } : t) };
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
          return { ...u, coins: Math.max(0, u.coins + amount), transactions: [tx, ...u.transactions] };
        });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('COIN_ADJUST', userId, `Adjusted ${amount} coins. Reason: ${reason}`);
    },
    resetCooldowns: (userId: string, type: 'MINING' | 'SPIN' | 'ALL', reason: string) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => {
          if (u.id !== userId) return u;
          const updates: Partial<User> = {};
          if (type === 'MINING' || type === 'ALL') {
             updates.miningStartedAt = undefined;
             updates.miningClaimed = false;
          }
          if (type === 'SPIN' || type === 'ALL') {
             updates.spinsToday = 0;
             updates.lastSpinTimestamp = 0;
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
      case 'mining': return <Mining />;
      case 'spin': return <SpinWheel />;
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

  return (
    <AppContext.Provider value={{
      state, updateUser, updateLogo, updateSettings, addCoins, 
      claimMiningReward, claimSpinReward, claimDailyCheckIn,
      playAd, login, logout, 
      toggleTheme, withdraw, setActiveTab, calculateRiskScore,
      checkAdBlocker, logAdminAction, logActivity, updateDeviceClaim, adminActions
    }}>
      <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-white dark:bg-gray-950 shadow-2xl relative overflow-hidden transition-colors duration-300">
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
        {adConfig && <AdOverlay type={adConfig.type} onClose={() => { adConfig.onComplete(); setAdConfig(null); }} />}
      </div>
    </AppContext.Provider>
  );
};

export default App;
