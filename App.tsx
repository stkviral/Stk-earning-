
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  User, UserTag, UserStatus, AppState, Transaction,
  COIN_TO_INR_RATE, AppSettings, AdminLog, ActivityLog, ADMIN_EMAIL, SuspiciousActivityLog
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
import Onboarding from './components/Onboarding';
import { ShieldOff, RefreshCw, Server, Ban } from 'lucide-react';
import { BackendAI } from './geminiService';
import { supabase } from './supabase';

interface AppContextType {
  state: AppState & { isAdBlockerActive: boolean; isAdminSession: boolean; theme: 'light' | 'dark' };
  isDeviceLimitReached: boolean;
  getServerTime: () => number;
  updateUser: (updates: Partial<User>) => void;
  updateLogo: (url: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  addCoins: (amount: number, method: string, type?: Transaction['type']) => Promise<boolean>;
  claimSpinReward: (reward: number) => Promise<boolean>;
  claimScratchReward: (reward: number) => Promise<boolean>;
  claimDailyCheckIn: () => Promise<boolean>;
  playAd: (onReward: () => void, type: 'REWARD' | 'REQUIRED', onClose?: () => void, onError?: () => void) => void;
  login: (email: string, name: string, referralCode?: string) => void;
  logout: () => void;
  toggleTheme: () => void;
  withdraw: (upiId: string, amount: number) => Promise<string | null>;
  cancelWithdrawal: (txId: string) => Promise<string | null>;
  setActiveTab: (tab: string) => void;
  calculateRiskScore: (user: User) => number;
  checkAdBlocker: () => Promise<boolean>;
  logAdminAction: (action: string, targetId: string, details: string) => void;
  logActivity: (userId: string, userName: string, action: string, details: string) => void;
  logSuspiciousActivity: (userId: string, userName: string, reason: string, details: string) => void;
  updateDeviceClaim: (deviceId: string, timestamp: number) => void;
  adminActions: {
    approveWithdrawal: (userId: string, txId: string, paymentTxId?: string) => Promise<void>;
    rejectWithdrawal: (userId: string, txId: string, rejectionReason: string) => Promise<void>;
    setWalletFrozen: (userId: string, frozen: boolean, reason?: string) => void;
    setUserStatus: (userId: string, status: UserStatus, reason?: string, durationMs?: number) => void;
    modifyCoins: (userId: string, amount: number, reason: string) => void;
    resetCooldowns: (userId: string, type: 'SPIN' | 'SCRATCH' | 'ALL', reason: string) => void;
    resetStreak: (userId: string, reason: string) => void;
    updateUserSettings: (userId: string, updates: Partial<User>) => void;
    impersonateUser: (userId: string) => void;
    clearDeviceLimitForUser: (userId: string) => void;
    clearDeviceLimitForDevice: (deviceId: string) => Promise<void>;
    removeDeviceExemption: (deviceId: string) => Promise<void>;
    resetDeviceRestrictions: () => Promise<void>;
    unbindDeviceForUser: (userId: string) => Promise<void>;
    unbindAllDevices: () => Promise<void>;
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
  maxDailySpinsNormal: 50,
  spinCooldownMinutes: 0,
  spinAdRequired: false,
  scratchRewards: [2, 4, 6, 8, 15],
  maxDailyScratchesNormal: 30,
  scratchCooldownMinutes: 0,
  scratchAdRequired: false,
  scratchProbabilities: { "2": 40, "4": 30, "6": 20, "8": 9, "15": 1 },
  withdrawalFeeNormal: 0,
  minWithdrawalCoins: 1000,
  maxWithdrawalCoins: 10000,
  manualWithdrawalApproval: true,
  withdrawalCooldownHours: 24,
  maxDailyAds: 20,
  adCooldownMinutes: 0,
  videoAdRequired: false,
  dailyWithdrawalLimit: 5000,
  spinProbabilities: { "1": 40, "2": 30, "3": 20, "5": 9, "10": 1 },
  emergencyRewardReduction: 0,
  globalRewardMultiplier: 1,
  deviceLimitEnabled: true,
  maxAccountsPerDevice: 3,
  exemptDevices: [],
  dailyRewardBudget: 100000,
  autoRewardBalancing: false,
  rewardDelayMs: 2000,
  autoFlagWithdrawals: true,
  dailyBonusRewards: [5, 10, 15, 20, 25, 30, 50],
  dailyBonusResetDays: 7
};

const getPersistentDeviceId = () => {
  let deviceId = localStorage.getItem('stk_device_id');
  if (!deviceId) {
    deviceId = 'DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    localStorage.setItem('stk_device_id', deviceId);
  }
  return deviceId;
};

const mapSupabaseUserToUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    name: dbUser.name || dbUser.email?.split('@')[0] || 'User',
    email: dbUser.email,
    role: dbUser.role || 'user',
    avatar: dbUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbUser.email}`,
    coins: dbUser.coins || 0,
    tag: dbUser.tag || UserTag.NORMAL,
    referralCode: dbUser.referralCode || Math.random().toString(36).substring(2, 8).toUpperCase(),
    referredBy: dbUser.referredBy,
    dailyEarned: dbUser.dailyEarned || 0,
    lastResetTimestamp: dbUser.lastResetTimestamp || Date.now(),
    createdAt: dbUser.created_at ? new Date(dbUser.created_at).getTime() : Date.now(),
    adsWatchedToday: dbUser.adsWatchedToday || 0,
    lastAdTimestamp: dbUser.lastAdTimestamp || 0,
    dailyRewardClaimed: dbUser.dailyRewardClaimed || false,
    streakDays: dbUser.streakDays || 0,
    lastCheckInTimestamp: dbUser.lastCheckInTimestamp || 0,
    spinsToday: dbUser.spinsToday || 0,
    lastSpinTimestamp: dbUser.lastSpinTimestamp || 0,
    extraSpinWatchedToday: dbUser.extraSpinWatchedToday || false,
    scratchesToday: dbUser.scratchesToday || 0,
    lastScratchTimestamp: dbUser.lastScratchTimestamp || 0,
    extraScratchWatchedToday: dbUser.extraScratchWatchedToday || false,
    status: dbUser.status || UserStatus.ACTIVE,
    walletFrozen: dbUser.walletFrozen || false,
    adsBlocked: dbUser.adsBlocked || false,
    lastIp: dbUser.lastIp || '192.168.1.' + Math.floor(Math.random() * 255),
    riskScore: dbUser.riskScore || 0,
    earningVelocity: dbUser.earningVelocity || 0,
    lastActiveAt: dbUser.lastActiveAt || Date.now(),
    deviceId: dbUser.deviceId,
    deviceLimitBlocked: dbUser.deviceLimitBlocked || false,
    deviceLimitExempt: dbUser.deviceLimitExempt || false,
    customDeviceLimit: dbUser.customDeviceLimit,
    transactions: dbUser.transactions || [],
    referralHistory: dbUser.referralHistory || []
  };
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState & { isAdBlockerActive: boolean; isAdminSession: boolean; theme: 'light' | 'dark' }>(() => {
    const saved = localStorage.getItem('stk_app_state');
    const parsed = saved ? JSON.parse(saved) : null;

    return {
      currentUser: null,
      allUsers: [],
      isLoggedIn: false,
      logoUrl: parsed?.logoUrl || '',
      settings: { ...DEFAULT_SETTINGS, ...(parsed?.settings || {}) },
      logs: parsed?.logs || [],
      activityLogs: parsed?.activityLogs || [],
      suspiciousActivityLogs: parsed?.suspiciousActivityLogs || [],
      adminUsers: parsed?.adminUsers || [{ email: ADMIN_EMAIL, role: 'SUPER_ADMIN', requires2FA: false }],
      deviceClaims: parsed?.deviceClaims || {},
      isAdBlockerActive: false,
      isAdminSession: false,
      theme: parsed?.theme || 'dark'
    };
  });

  const [activeTab, setActiveTab] = useState('home');
  const [adConfig, setAdConfig] = useState<{ type: 'REWARD' | 'REQUIRED'; onReward: () => void; onClose: () => void; onError?: () => void } | null>(null);
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

  useEffect(() => {
    const fetchAllUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error("Error fetching all users from Supabase:", error);
        return;
      }
      if (data) {
        const users = data.map(mapSupabaseUserToUser);
        setState(prev => {
          // Merge fetched users with existing allUsers to avoid overwriting recent local updates
          const newAllUsers = [...users];
          prev.allUsers.forEach(localUser => {
            const index = newAllUsers.findIndex(u => u.id === localUser.id);
            if (index === -1) {
              newAllUsers.push(localUser);
            } else {
              // Keep local updates if they are newer (e.g., lastActiveAt)
              if (localUser.lastActiveAt > newAllUsers[index].lastActiveAt) {
                newAllUsers[index] = { ...newAllUsers[index], ...localUser };
              }
            }
          });
          
          // Update currentUser reference if it exists
          const newCurrentUser = prev.currentUser 
            ? newAllUsers.find(u => u.id === prev.currentUser!.id) || prev.currentUser
            : null;

          return { ...prev, allUsers: newAllUsers, currentUser: newCurrentUser };
        });
      }
    };
    fetchAllUsers();
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

      // Sync account data to Supabase
      const supabaseUpdates: any = { ...updates };
      // Remove fields that might not exist in Supabase or shouldn't be updated directly
      delete supabaseUpdates.id;
      delete supabaseUpdates.createdAt;
      
      if (Object.keys(supabaseUpdates).length > 0) {
        supabase.from('users').update(supabaseUpdates).eq('id', updatedUser.id).then(({ error }) => {
          if (error) console.error("Failed to sync account data to Supabase", error);
        });
      }

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
    const stateToSave = {
      ...state,
      allUsers: undefined,
      currentUser: undefined
    };
    
    localStorage.setItem('stk_app_state', JSON.stringify(stateToSave));
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const updateLogo = (url: string) => setState(prev => ({ ...prev, logoUrl: url }));
  const updateSettings = (updates: Partial<AppSettings>) => setState(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  const updateDeviceClaim = (deviceId: string, timestamp: number) => setState(prev => ({ ...prev, deviceClaims: { ...prev.deviceClaims, [deviceId]: timestamp } }));

  const logSuspiciousActivity = useCallback((userId: string, userName: string, reason: string, details: string) => {
    const newLog: SuspiciousActivityLog = { 
      id: Math.random().toString(36).substring(2, 9), 
      userId, userName, reason, details, timestamp: getServerTime() 
    };
    setState(prev => ({ ...prev, suspiciousActivityLogs: [newLog, ...(prev.suspiciousActivityLogs || [])].slice(0, 500) }));
  }, [getServerTime]);

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

  const addCoins = useCallback(async (baseAmount: number, method: string, type: Transaction['type'] = 'ADJUST'): Promise<boolean> => {
    if (!state.currentUser) return false;
    if (state.currentUser.status === UserStatus.SUSPENDED) {
      alert(`Account Suspended: ${state.currentUser.statusReason || 'Violation of terms'}`);
      return false;
    }
    if (state.settings.adsEnabled && state.isAdBlockerActive) {
      alert("Reward Blocked: Please disable your ad-blocker to receive coins.");
      return false;
    }

    // Auto-clicker protection (actions too fast)
    const now = getServerTime();
    if (!state.isAdminSession && !state.currentUser.fraudDetectionExempt && now - lastRewardTimeRef.current < 500 && baseAmount > 0) {
      logSuspiciousActivity(state.currentUser.id, state.currentUser.name, 'AUTO_CLICKER', `Claimed ${baseAmount} coins in under 500ms`);
      return false;
    }
    lastRewardTimeRef.current = now;
    
    // Apply global multiplier and emergency reduction
    let amount = baseAmount;
    if (amount > 0) {
      amount = Math.floor(amount * (state.settings.globalRewardMultiplier || 1));
      if (state.settings.emergencyRewardReduction > 0) {
        amount = Math.floor(amount * (1 - (state.settings.emergencyRewardReduction / 100)));
      }
      
      // Dynamic Reward Balancer
      if (type !== 'WITHDRAWAL' && type !== 'ADJUST') {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        const dailyCoinsIssued = (state.activityLogs || [])
          .filter(l => l.timestamp > todayStart && (l.action === 'SPIN_CLAIM' || l.action === 'SCRATCH_CLAIM' || l.action === 'DAILY_BONUS' || l.action === 'AD_REWARD'))
          .reduce((acc, log) => {
            const match = log.details.match(/Won (\d+)/) || log.details.match(/\((\d+) coins\)/);
            return acc + (match ? parseInt(match[1]) : 0);
          }, 0);

        if (dailyCoinsIssued >= (state.settings.dailyRewardBudget || 100000)) {
          amount = Math.max(1, Math.floor(amount * 0.5)); // Reduce by 50% if budget reached
          logSuspiciousActivity('SYSTEM', 'SYSTEM', 'BUDGET_REACHED', `Daily reward budget reached. Reduced reward from ${baseAmount} to ${amount}.`);
        }
      }
    }

    const todayEarned = state.currentUser.dailyEarned || 0;
    const dailyCap = state.settings.dailyCapNormal;

    // Abnormal farming detection
    if (!state.isAdminSession && !state.currentUser.fraudDetectionExempt && amount > dailyCap * 0.5 && type !== 'REFERRAL' && type !== 'WITHDRAWAL') {
       logSuspiciousActivity(state.currentUser.id, state.currentUser.name, 'ABNORMAL_FARMING', `Attempted to claim unusually large amount: ${amount} via ${method}`);
       // Don't block, but flag it
    }

    if (!state.isAdminSession && !state.currentUser.rewardLimitExempt && todayEarned + amount > dailyCap && amount > 0) {
      const allowed = dailyCap - todayEarned;
      if (allowed <= 0) {
        alert("Daily earning cap reached!");
        return false;
      }
      amount = allowed;
    }

    // Fetch current balance from Supabase
    const { data: dbUser, error: fetchError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', state.currentUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Failed to fetch current balance:", fetchError);
      alert("Failed to process reward. Please try again.");
      return false;
    }

    const currentCoins = dbUser?.coins || 0;
    const newCoins = currentCoins + amount;

    const transaction: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      userId: state.currentUser.id,
      amount,
      type,
      method,
      status: 'COMPLETED',
      timestamp: now
    };

    const newTransactions = [transaction, ...(state.currentUser.transactions || [])];

    // Update Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: newCoins, transactions: newTransactions })
      .eq('id', state.currentUser.id);

    if (updateError) {
      console.error("Failed to update balance:", updateError);
      alert("Failed to process reward. Please try again.");
      return false;
    }
    
    // Update local state without triggering another Supabase sync for coins
    setState(prev => {
      if (!prev.currentUser) return prev;
      const updatedUser = { 
        ...prev.currentUser, 
        coins: newCoins,
        dailyEarned: todayEarned + (amount > 0 ? amount : 0),
        transactions: newTransactions,
        lastActiveAt: Date.now() 
      };
      return {
        ...prev,
        currentUser: updatedUser,
        allUsers: prev.allUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
      };
    });
    
    return true;
  }, [state.currentUser, state.settings, state.activityLogs, state.isAdBlockerActive, getServerTime, logSuspiciousActivity]);

  const getActiveMultiplier = (streak: number) => {
    if (!streak) return 1.0;
    const dayInCycle = ((streak - 1) % 7) + 1;
    if (dayInCycle === 7) return 2.0;
    return 1.0 + (dayInCycle - 1) * 0.1;
  };

  const claimSpinReward = useCallback(async (reward: number): Promise<boolean> => {
    if (!state.currentUser) return false;
    if (state.settings.rewardDelayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, state.settings.rewardDelayMs));
    }
    const multiplier = getActiveMultiplier(state.currentUser.streakDays || 0);
    const finalReward = Math.round(reward * multiplier);
    
    const success = await addCoins(finalReward, 'Spin Reward', 'SPIN');
    if (success) {
      logActivity(state.currentUser.id, state.currentUser.name, 'SPIN_CLAIM', `Won ${finalReward} coins (Base: ${reward}, Multiplier: ${multiplier.toFixed(1)}x)`);
    }
    return success;
  }, [state.currentUser, state.settings.rewardDelayMs, addCoins, logActivity]);

  const claimScratchReward = useCallback(async (reward: number): Promise<boolean> => {
    if (!state.currentUser) return false;
    if (state.settings.rewardDelayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, state.settings.rewardDelayMs));
    }
    const multiplier = getActiveMultiplier(state.currentUser.streakDays || 0);
    const finalReward = Math.round(reward * multiplier);
    
    const success = await addCoins(finalReward, 'Scratch Reward', 'SPIN'); // Using SPIN type for now
    if (success) {
      logActivity(state.currentUser.id, state.currentUser.name, 'SCRATCH_CLAIM', `Won ${finalReward} coins (Base: ${reward}, Multiplier: ${multiplier.toFixed(1)}x)`);
    }
    return success;
  }, [state.currentUser, state.settings.rewardDelayMs, addCoins, logActivity]);

  const claimDailyCheckIn = useCallback(async (): Promise<boolean> => {
    if (!state.currentUser) return false;
    const currentStreak = state.currentUser.streakDays || 0;
    const currentDay = currentStreak + 1;
    
    const baseReward = 5;
    let reward = baseReward;
    if (currentDay === 7) {
      reward += 25; // Extra weekly bonus
    }
    
    const success = await addCoins(reward, 'Daily Check-In', 'CHECKIN');
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

  const playAd = useCallback((onReward: () => void, type: 'REWARD' | 'REQUIRED', onClose?: () => void, onError?: () => void) => {
    if (state.currentUser?.status === UserStatus.SUSPENDED) {
      alert(`Account Suspended: ${state.currentUser?.statusReason || 'Violation of terms'}`);
      if (onClose) onClose();
      return;
    }
    const now = getServerTime();
    if (type === 'REWARD' && now - lastRewardTimeRef.current < 5000) {
      alert("Please wait 5 seconds before earning again.");
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
        },
        onError: () => {
          if (onError) onError();
          setAdConfig(null);
        }
      });
    }, Math.random() * 1000 + 500);
  }, [state.settings.adsEnabled, state.currentUser?.adsBlocked, state.isAdBlockerActive, getServerTime]);

  const logAdminAction = useCallback((action: string, targetId: string, details: string) => {
    const newLog: AdminLog = { id: Math.random().toString(36).substring(2, 9), adminId: 'SUPER_ADMIN', action, targetId, details, timestamp: Date.now() };
    setState(prev => ({ ...prev, logs: [newLog, ...prev.logs] }));
  }, []);

  const login = async (email: string, name: string, referralCode?: string, supabaseUser?: any) => {
    let user = state.allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user && supabaseUser) {
      user = mapSupabaseUserToUser(supabaseUser);
    }

    const isAdmin = supabaseUser?.role === 'admin' || user?.role === 'admin' || email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const persistentId = getPersistentDeviceId();
    
    let isDeviceBlocked = false;
    let isWhitelisted = false;

    if (!isAdmin && state.settings.deviceLimitEnabled) {
      try {
        const { data: device, error } = await supabase.from('devices').select('*').eq('device_id', persistentId).single();
        
        if (error && error.code === 'PGRST116') {
           // Device not found, insert it
           await supabase.from('devices').insert([{
             device_id: persistentId,
             account_count: 1,
             is_whitelisted: false
           }]);
        } else if (device) {
           isWhitelisted = device.is_whitelisted;
           let currentCount = device.account_count || 0;
           const limit = user?.customDeviceLimit ?? state.settings.maxAccountsPerDevice ?? 3;
           
           // If user is new to this device, check limit BEFORE incrementing if it's a completely new user
           if (!user) {
             if (!isWhitelisted && currentCount >= limit) {
               isDeviceBlocked = true;
             } else {
               currentCount += 1;
               await supabase.from('devices').update({ account_count: currentCount }).eq('device_id', persistentId);
             }
           } else if (user.deviceId !== persistentId) {
             // Decrement count on old device if it exists
             if (user.deviceId) {
               try {
                 const { data: oldDevice } = await supabase.from('devices').select('account_count').eq('device_id', user.deviceId).single();
                 if (oldDevice && oldDevice.account_count > 0) {
                   await supabase.from('devices').update({ account_count: oldDevice.account_count - 1 }).eq('device_id', user.deviceId);
                 }
               } catch (e) {
                 console.error("Failed to decrement old device count", e);
               }
             }
             
             currentCount += 1;
             await supabase.from('devices').update({ account_count: currentCount }).eq('device_id', persistentId);
             if (!isWhitelisted && currentCount > limit) {
               isDeviceBlocked = true;
             }
           } else {
             if (!isWhitelisted && currentCount > limit) {
               isDeviceBlocked = true;
             }
           }
        }
      } catch (err) {
        console.error("Device check failed:", err);
        // Fallback to local logic
        const accountsOnDevice = state.allUsers.filter(u => u.deviceId === persistentId).length;
        const limit = user?.customDeviceLimit ?? state.settings.maxAccountsPerDevice ?? 3;
        if (!state.settings.exemptDevices?.includes(persistentId) && accountsOnDevice >= limit) {
           isDeviceBlocked = true;
        }
      }
    }

    if (!user) {
      // Check device limit for NEW accounts
      if (isDeviceBlocked) {
        alert(`Device limit reached. You cannot create more than ${state.settings.maxAccountsPerDevice ?? 3} accounts on this device.`);
        return;
      }

      user = {
        id: supabaseUser?.id || Math.random().toString(36).substring(2, 9),
        name,
        email,
        role: supabaseUser?.role || 'user',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        coins: supabaseUser?.coins || 0,
        tag: UserTag.NORMAL,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referredBy: referralCode,
        dailyEarned: 0,
        lastResetTimestamp: Date.now(),
        createdAt: supabaseUser?.created_at ? new Date(supabaseUser.created_at).getTime() : Date.now(),
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
        deviceId: persistentId,
        lastIp: '192.168.1.' + Math.floor(Math.random() * 255),
        riskScore: 0,
        earningVelocity: 0,
        lastActiveAt: Date.now()
      };
      setState(prev => {
        let updatedAllUsers = [...prev.allUsers, user!];
        
        // Handle referral reward
        if (referralCode) {
          const referrerIndex = updatedAllUsers.findIndex(u => u.referralCode === referralCode);
          if (referrerIndex !== -1) {
            const referrer = updatedAllUsers[referrerIndex];
            const reward = prev.settings.referralReward || 50;
            const updatedReferrer = {
              ...referrer,
              coins: referrer.coins + reward,
              referralHistory: [
                ...(referrer.referralHistory || []),
                {
                  referredUserId: user!.id,
                  referredUserName: user!.name,
                  timestamp: Date.now(),
                  reward: reward
                }
              ]
            };
            updatedAllUsers[referrerIndex] = updatedReferrer;
            
            // Sync referrer to Supabase
            supabase.from('users').update({ 
              coins: updatedReferrer.coins,
              referralHistory: updatedReferrer.referralHistory
            }).eq('id', referrer.id).then(({ error }) => {
              if (error) console.error("Failed to update referrer in Supabase", error);
            });
          }
        }
        
        return { ...prev, allUsers: updatedAllUsers };
      });
    } else {
      // Update existing user's data from Supabase
      if (supabaseUser) {
        user = mapSupabaseUserToUser(supabaseUser);
        setState(prev => {
          const exists = prev.allUsers.some(u => u.id === user!.id);
          return {
            ...prev,
            allUsers: exists 
              ? prev.allUsers.map(u => u.id === user!.id ? user! : u)
              : [...prev.allUsers, user!]
          };
        });
      }

      // Update existing user's device ID to the persistent one if it's different
      if (user.deviceId !== persistentId) {
        if (isDeviceBlocked) {
          alert(`Device limit reached. You cannot log into this account on this device.`);
          return;
        }
        user.deviceId = persistentId;
        setState(prev => ({
          ...prev,
          allUsers: prev.allUsers.map(u => u.id === user!.id ? { ...u, deviceId: persistentId } : u)
        }));
        supabase.from('users').update({ deviceId: persistentId }).eq('id', user.id).then(({ error }) => {
          if (error) console.error("Failed to sync deviceId to Supabase", error);
        });
      }
      
      if (user.deviceLimitBlocked !== isDeviceBlocked) {
        user.deviceLimitBlocked = isDeviceBlocked;
        setState(prev => ({
          ...prev,
          allUsers: prev.allUsers.map(u => u.id === user!.id ? { ...u, deviceLimitBlocked: isDeviceBlocked } : u)
        }));
        supabase.from('users').update({ deviceLimitBlocked: isDeviceBlocked }).eq('id', user.id).then(({ error }) => {
          if (error) console.error("Failed to sync deviceLimitBlocked to Supabase", error);
        });
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
    supabase.auth.signOut().catch(console.error);
    setState(prev => ({ ...prev, currentUser: null, isLoggedIn: false, isAdminSession: false })); 
    setActiveTab('home'); 
  };

  const loginRef = React.useRef(login);
  useEffect(() => {
    loginRef.current = login;
  }, [login]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        const { user } = session;
        const email = user.email || '';
        const name = user.user_metadata?.full_name || email.split('@')[0];
        
        // Check if user exists in Supabase
        const { data: existingUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching user from Supabase:", error);
          // Still try to login with what we have if there's a network error, but don't overwrite
          loginRef.current(email, name, undefined, null);
          return;
        }

        const deviceId = getPersistentDeviceId();
        const pendingReferralCode = localStorage.getItem('pending_referral_code') || undefined;
        if (pendingReferralCode) {
          localStorage.removeItem('pending_referral_code');
        }

        if (!existingUser) {
          // Create new user in Supabase
          const newUser = {
            id: user.id,
            email: email,
            role: 'user',
            coins: 0,
            referredBy: pendingReferralCode,
            created_at: new Date().toISOString()
          };
          const { error: insertError } = await supabase.from('users').insert([newUser]);
          if (insertError) {
            console.error("Error inserting new user:", insertError);
          }
          loginRef.current(email, name, pendingReferralCode, newUser);
        } else {
          loginRef.current(email, name, undefined, existingUser);
        }
      } else if (event === 'SIGNED_OUT') {
        setState(prev => ({ ...prev, currentUser: null, isLoggedIn: false, isAdminSession: false })); 
        setActiveTab('home');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const toggleTheme = useCallback(() => {
    setState(prev => {
      return { ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' };
    });
  }, []);

  const calculateRiskScore = useCallback((user: User) => {
    if (user.fraudDetectionExempt || user.role === 'admin' || user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() || state.adminUsers.some(a => a.email.toLowerCase() === user.email.toLowerCase())) return 0;
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
  }, [state.allUsers, state.settings.dailyCapNormal, state.adminUsers]);

  const withdraw = async (upiId: string, amount: number): Promise<string | null> => {
    if (!state.currentUser) return "User session error";
    if (state.currentUser.status === UserStatus.SUSPENDED) return `Account Suspended: ${state.currentUser.statusReason || 'Violation of terms'}`;
    if (!state.settings.withdrawalsEnabled) return "Withdrawals are temporarily disabled by the administrator.";
    if (state.currentUser.walletFrozen) return "Your wallet is frozen.";
    if (state.currentUser.coins < amount) return "Insufficient balance";
    if (amount < state.settings.minWithdrawalCoins) return `Minimum withdrawal is ${state.settings.minWithdrawalCoins} coins.`;
    const cooldownMs = (state.settings.withdrawalCooldownHours || 24) * 60 * 60 * 1000;
    const nextAllowed = (state.currentUser.lastWithdrawalTimestamp || 0) + cooldownMs;
    if (Date.now() < nextAllowed) return "Withdrawal Cooldown: Please wait before next request.";
    const upiRegex = /^[\w\.-]+@[\w\.-]+$/;
    if (!upiRegex.test(upiId)) return "Invalid UPI ID format.";
    
    const feePercentage = state.settings.withdrawalFeeNormal;
    const feeAmount = Math.floor(amount * (feePercentage / 100));
    const finalAmount = amount - feeAmount;

    let txStatus: Transaction['status'] = 'PENDING';
    let txMethod = `UPI: ${upiId} (Fee: ${feeAmount})`;

    // Withdrawal Risk Filter
    if (state.settings.autoFlagWithdrawals && !state.isAdminSession && !state.currentUser.withdrawalFlagExempt) {
      const riskScore = calculateRiskScore(state.currentUser);
      if (riskScore > 50) {
        txMethod += ' [FLAGGED: HIGH RISK]';
        logSuspiciousActivity(state.currentUser.id, state.currentUser.name, 'HIGH_RISK_WITHDRAWAL', `User with risk score ${riskScore} requested withdrawal of ${amount} coins.`);
      }
    }

    const txId = 'WD-' + Math.random().toString(36).substring(2, 9);
    const now = Date.now();

    // Insert into Supabase withdrawals table
    const { error: insertError } = await supabase.from('withdrawals').insert([{
      id: txId,
      user_id: state.currentUser.id,
      amount: finalAmount,
      status: 'pending',
      upi_id: upiId,
      created_at: new Date(now).toISOString()
    }]);

    if (insertError) {
      console.error("Failed to create withdrawal request:", insertError);
      return "Failed to process withdrawal request. Please try again.";
    }

    const tx: Transaction = {
      id: txId,
      userId: state.currentUser.id,
      amount: finalAmount, type: 'WITHDRAWAL', method: txMethod, status: txStatus, timestamp: now
    };
    
    const newTransactions = [tx, ...(state.currentUser.transactions || [])];
    
    // Do not deduct coins yet, just record the transaction and update lastWithdrawalTimestamp
    updateUser({ transactions: newTransactions, upiId, lastWithdrawalTimestamp: now });
    
    logActivity(state.currentUser.id, state.currentUser.name, 'WITHDRAW_REQUEST', `Requested ₹${(finalAmount * COIN_TO_INR_RATE).toFixed(2)} to ${upiId} (Fee: ${feeAmount} coins)`);
    return null;
  };

  const cancelWithdrawal = async (txId: string): Promise<string | null> => {
    if (!state.currentUser) return "User session error";
    const txIndex = (state.currentUser.transactions || []).findIndex(t => t.id === txId);
    if (txIndex === -1) return "Transaction not found";
    
    const tx = state.currentUser.transactions[txIndex];
    if (tx.status !== 'PENDING') return "Only pending withdrawals can be cancelled";
    
    const feeMatch = tx.method.match(/Fee: (\d+)/);
    const feeAmount = feeMatch ? parseInt(feeMatch[1]) : 0;
    const refundAmount = tx.amount + feeAmount;

    // Update Supabase
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({ status: 'cancelled' })
      .eq('id', txId)
      .eq('user_id', state.currentUser.id);

    if (updateError) {
      console.error("Failed to cancel withdrawal:", updateError);
      return "Failed to cancel withdrawal. Please try again.";
    }

    const updatedTx: Transaction = { ...tx, status: 'REJECTED', rejectionReason: 'Cancelled by user' };
    const newTransactions = [...(state.currentUser.transactions || [])];
    newTransactions[txIndex] = updatedTx;

    updateUser({
      transactions: newTransactions,
      lastWithdrawalTimestamp: 0 // Reset cooldown
    });

    logActivity(state.currentUser.id, state.currentUser.name, 'WITHDRAW_CANCEL', `Cancelled withdrawal ${txId}`);
    return null;
  };

  const adminActions = {
    approveWithdrawal: async (userId: string, txId: string, paymentTxId?: string) => {
      const user = state.allUsers.find(u => u.id === userId);
      if (!user) return alert("User not found");
      const tx = (user.transactions || []).find(t => t.id === txId);
      if (!tx) return alert("Transaction not found");

      const feeMatch = tx.method.match(/Fee: (\d+)/);
      const feeAmount = feeMatch ? parseInt(feeMatch[1]) : 0;
      const deductAmount = tx.amount + feeAmount;

      if (user.coins < deductAmount) {
        alert("User does not have enough coins to fulfill this withdrawal.");
        return;
      }

      const newCoins = user.coins - deductAmount;

      const newTransactions = (user.transactions || []).map(t => t.id === txId ? { ...t, status: 'COMPLETED' as const, paymentTxId } : t);

      // Update Supabase users table
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ coins: newCoins, transactions: newTransactions })
        .eq('id', userId);

      if (userUpdateError) {
        console.error("Failed to deduct coins in Supabase", userUpdateError);
        return alert("Failed to deduct coins. Please try again.");
      }

      // Update Supabase withdrawals table
      const { error: withdrawalUpdateError } = await supabase
        .from('withdrawals')
        .update({ status: 'completed' })
        .eq('id', txId)
        .eq('user_id', userId);

      if (withdrawalUpdateError) {
        console.error("Failed to update withdrawal status in Supabase", withdrawalUpdateError);
        // We might want to revert the coin deduction here, but for simplicity we'll just alert
        alert("Failed to update withdrawal status. Coins were deducted.");
      }

      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => {
          if (u.id !== userId) return u;
          return { 
            ...u, 
            coins: newCoins,
            transactions: newTransactions
          };
        });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('PAYOUT_APPROVE', userId, `Approved payout ${txId}${paymentTxId ? ` (TxID: ${paymentTxId})` : ''}`);
    },
    rejectWithdrawal: async (userId: string, txId: string, rejectionReason: string) => {
      // Update Supabase withdrawals table
      const { error: withdrawalUpdateError } = await supabase
        .from('withdrawals')
        .update({ status: 'rejected' })
        .eq('id', txId)
        .eq('user_id', userId);

      if (withdrawalUpdateError) {
        console.error("Failed to update withdrawal status in Supabase", withdrawalUpdateError);
        return alert("Failed to update withdrawal status. Please try again.");
      }

      const user = state.allUsers.find(u => u.id === userId);
      if (user) {
        const newTransactions = (user.transactions || []).map(t => t.id === txId ? { ...t, status: 'REJECTED' as const, rejectionReason } : t);
        supabase.from('users').update({ transactions: newTransactions }).eq('id', userId).then(({ error }) => {
          if (error) console.error("Failed to sync rejected transaction to Supabase", error);
        });
      }

      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => {
          if (u.id !== userId) return u;
          // Do not add coins back since they were never deducted
          return { 
            ...u, 
            transactions: (u.transactions || []).map(t => t.id === txId ? { ...t, status: 'REJECTED' as const, rejectionReason } : t) 
          };
        });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('PAYOUT_REJECT', userId, `Rejected payout ${txId}. Reason: ${rejectionReason}`);
    },
    setWalletFrozen: (userId: string, frozen: boolean, reason?: string) => {
      supabase.from('users').update({ walletFrozen: frozen }).eq('id', userId).then(({ error }) => {
        if (error) console.error("Failed to sync wallet frozen status to Supabase", error);
      });
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => u.id !== userId ? u : { ...u, walletFrozen: frozen });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction(frozen ? 'WALLET_FREEZE' : 'WALLET_UNFREEZE', userId, reason || '');
    },
    setUserStatus: (userId: string, status: UserStatus, reason?: string) => {
      supabase.from('users').update({ status, statusReason: reason }).eq('id', userId).then(({ error }) => {
        if (error) console.error("Failed to sync user status to Supabase", error);
      });
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
          const newCoins = Math.max(0, u.coins + amount);
          
          // Sync to Supabase
          const newTransactions = [tx, ...(u.transactions || [])];
          supabase.from('users').update({ coins: newCoins, transactions: newTransactions }).eq('id', u.id).then(({ error }) => {
            if (error) console.error("Failed to sync admin coin adjustment to Supabase", error);
          });
          
          return { ...u, coins: newCoins, transactions: newTransactions };
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
          
          supabase.from('users').update(updates).eq('id', u.id).then(({ error }) => {
            if (error) console.error("Failed to sync cooldown reset to Supabase", error);
          });
          
          return { ...u, ...updates };
        });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('RESET_COOLDOWN', userId, `Reset ${type} cooldown. Reason: ${reason}`);
    },
    resetStreak: (userId: string, reason: string) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => {
          if (u.id !== userId) return u;
          const updates = { streakDays: 0, dailyRewardClaimed: false };
          supabase.from('users').update(updates).eq('id', u.id).then(({ error }) => {
            if (error) console.error("Failed to sync streak reset to Supabase", error);
          });
          return { ...u, ...updates };
        });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('RESET_STREAK', userId, `Reset daily streak. Reason: ${reason}`);
    },
    updateUserSettings: (userId: string, updates: Partial<User>) => {
      // Sync to Supabase
      const supabaseUpdates: any = { ...updates };
      delete supabaseUpdates.id;
      delete supabaseUpdates.createdAt;
      
      if (Object.keys(supabaseUpdates).length > 0) {
        supabase.from('users').update(supabaseUpdates).eq('id', userId).then(({ error }) => {
          if (error) console.error("Failed to sync admin user settings update to Supabase", error);
        });
      }

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
    },
    clearDeviceLimitForUser: (userId: string) => {
      supabase.from('users').update({ deviceLimitExempt: true }).eq('id', userId).then(({ error }) => {
        if (error) console.error("Failed to sync device limit exemption to Supabase", error);
      });
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => u.id !== userId ? u : { ...u, deviceLimitExempt: true });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('DEVICE_LIMIT_EXEMPT', userId, 'Exempted user from device limits');
    },
    clearDeviceLimitForDevice: async (deviceId: string) => {
      try {
        await supabase.from('devices').update({ is_whitelisted: true }).eq('device_id', deviceId);
      } catch (err) {
        console.error("Failed to whitelist device in Supabase", err);
      }
      setState(prev => {
        const newExempt = [...(prev.settings.exemptDevices || [])];
        if (!newExempt.includes(deviceId)) newExempt.push(deviceId);
        return { ...prev, settings: { ...prev.settings, exemptDevices: newExempt } };
      });
      logAdminAction('DEVICE_LIMIT_EXEMPT_DEVICE', 'SYSTEM', `Exempted device ${deviceId} from limits`);
    },
    removeDeviceExemption: async (deviceId: string) => {
      try {
        await supabase.from('devices').update({ is_whitelisted: false }).eq('device_id', deviceId);
      } catch (err) {
        console.error("Failed to un-whitelist device in Supabase", err);
      }
      setState(prev => {
        const newExempt = (prev.settings.exemptDevices || []).filter(id => id !== deviceId);
        return { ...prev, settings: { ...prev.settings, exemptDevices: newExempt } };
      });
      logAdminAction('DEVICE_LIMIT_UNEXEMPT_DEVICE', 'SYSTEM', `Removed exemption for device ${deviceId}`);
    },
    resetDeviceRestrictions: async () => {
      try {
        await supabase.from('devices').update({ account_count: 0, is_whitelisted: false }).neq('device_id', '');
        await supabase.from('users').update({ deviceLimitExempt: false, deviceLimitBlocked: false, customDeviceLimit: null }).neq('id', '');
      } catch (err) {
        console.error("Failed to reset devices in Supabase", err);
      }
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => ({ ...u, deviceLimitExempt: false, deviceLimitBlocked: false, customDeviceLimit: undefined }));
        const newCurrentUser = prev.currentUser ? { ...prev.currentUser, deviceLimitExempt: false, deviceLimitBlocked: false, customDeviceLimit: undefined } : null;
        return { ...prev, allUsers: newAllUsers, currentUser: newCurrentUser, settings: { ...prev.settings, exemptDevices: [] } };
      });
      logAdminAction('DEVICE_LIMIT_RESET', 'SYSTEM', 'Reset all device limit exemptions globally');
    },
    unbindDeviceForUser: async (userId: string) => {
      const user = state.allUsers.find(u => u.id === userId);
      if (user && user.deviceId) {
        try {
          // Decrement account count in Supabase
          const { data: deviceData } = await supabase.from('devices').select('account_count').eq('device_id', user.deviceId).single();
          if (deviceData && deviceData.account_count > 0) {
            await supabase.from('devices').update({ account_count: deviceData.account_count - 1 }).eq('device_id', user.deviceId);
          }
        } catch (err) {
          console.error("Failed to decrement device account count in Supabase", err);
        }
      }
      supabase.from('users').update({ deviceId: null, deviceLimitBlocked: false }).eq('id', userId).then(({ error }) => {
        if (error) console.error("Failed to sync device unbind to Supabase", error);
      });
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => u.id === userId ? { ...u, deviceId: undefined, deviceLimitBlocked: false } : u);
        const newCurrentUser = prev.currentUser?.id === userId ? { ...prev.currentUser, deviceId: undefined, deviceLimitBlocked: false } : prev.currentUser;
        return { ...prev, allUsers: newAllUsers, currentUser: newCurrentUser };
      });
      logAdminAction('DEVICE_UNBIND', userId, 'Unbound device from user');
    },
    unbindAllDevices: async () => {
      try {
        await supabase.from('devices').update({ account_count: 0 }).neq('device_id', '');
        await supabase.from('users').update({ deviceId: null, deviceLimitBlocked: false, deviceLimitExempt: false, customDeviceLimit: null }).neq('id', '');
      } catch (err) {
        console.error("Failed to unbind all devices in Supabase", err);
      }
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => ({ ...u, deviceId: undefined, deviceLimitBlocked: false, deviceLimitExempt: false, customDeviceLimit: undefined }));
        const newCurrentUser = prev.currentUser ? { ...prev.currentUser, deviceId: undefined, deviceLimitBlocked: false, deviceLimitExempt: false, customDeviceLimit: undefined } : null;
        return { ...prev, allUsers: newAllUsers, currentUser: newCurrentUser, settings: { ...prev.settings, exemptDevices: [] } };
      });
      logAdminAction('DEVICE_UNBIND_ALL', 'SYSTEM', 'Unbound all devices and reset limits globally');
    }
  };

  const renderContent = () => {
    if (!state.isLoggedIn) {
      return <Login />;
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
      if (state.currentUser?.role !== 'admin' && state.currentUser?.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
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

  const isDeviceLimitReached = React.useMemo(() => {
    if (!state.currentUser || !state.settings.deviceLimitEnabled) return false;
    if (state.isAdminSession || state.currentUser.deviceLimitExempt) return false;
    if (state.currentUser.deviceLimitBlocked) return true;
    if (state.settings.exemptDevices?.includes(state.currentUser.deviceId)) return false;
    
    const usersOnDevice = state.allUsers.filter(u => u.deviceId === state.currentUser?.deviceId);
    const limit = state.currentUser.customDeviceLimit ?? state.settings.maxAccountsPerDevice ?? 3;
    
    if (usersOnDevice.length <= limit) return false;

    // Sort users by creation time to ensure the oldest accounts are allowed and only the excess newer accounts are blocked.
    const sortedUsers = [...usersOnDevice].sort((a, b) => {
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      if (timeA !== timeB) return timeA - timeB;
      return a.id.localeCompare(b.id);
    });
    const allowedUsers = sortedUsers.slice(0, limit);
    
    return !allowedUsers.some(u => u.id === state.currentUser?.id);
  }, [state.currentUser, state.settings, state.isAdminSession, state.allUsers]);

  return (
    <AppContext.Provider value={{
      state, isDeviceLimitReached, getServerTime, updateUser, updateLogo, updateSettings, addCoins, 
      claimSpinReward, claimScratchReward, claimDailyCheckIn,
      playAd, login, logout, 
      toggleTheme, withdraw, cancelWithdrawal, setActiveTab, calculateRiskScore,
      checkAdBlocker, logAdminAction, logActivity, logSuspiciousActivity, updateDeviceClaim, adminActions
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
        {adConfig && <AdOverlay type={adConfig.type} onReward={adConfig.onReward} onClose={adConfig.onClose} onError={adConfig.onError} />}
        <Onboarding />
      </div>
    </AppContext.Provider>
  );
};

export default App;
