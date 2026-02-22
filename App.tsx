
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  User, UserTag, UserStatus, AppState, Transaction, Task,
  COIN_TO_INR_RATE, AppSettings, AdminLog
} from './types';
import Dashboard from './pages/Dashboard';
import Mining from './pages/Mining';
import SpinWheel from './pages/SpinWheel';
import Wallet from './pages/Wallet';
import Referral from './pages/Referral';
import Videos from './pages/Videos';
import Tasks from './pages/Tasks';
import AdminPanel from './pages/AdminPanel';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Navigation from './components/Navigation';
import AdOverlay from './components/AdOverlay';
import Header from './components/Header';
import { ShieldOff, RefreshCw, Server, Ban, UserCog } from 'lucide-react';
import { BackendAI } from './geminiService';

interface AppContextType {
  state: AppState & { isAdBlockerActive: boolean; isAdminSession: boolean; theme: 'light' | 'dark' };
  updateUser: (updates: Partial<User>) => void;
  updateLogo: (url: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  addCoins: (amount: number, method: string) => boolean;
  addTask: (title: string, reward: number) => void;
  completeTask: (taskId: string, proof?: string) => Promise<boolean>;
  playAd: (onComplete: () => void, type: 'REWARD' | 'REQUIRED') => void;
  login: (email: string, name: string, referralCode?: string) => void;
  logout: () => void;
  toggleTheme: () => void;
  buyPass: () => void;
  withdraw: (upiId: string, amount: number) => string | null;
  setActiveTab: (tab: string) => void;
  calculateRiskScore: (user: User) => number;
  checkAdBlocker: () => Promise<boolean>;
  logAdminAction: (action: string, targetId: string, details: string) => void;
  adminActions: {
    approveWithdrawal: (userId: string, txId: string) => void;
    rejectWithdrawal: (userId: string, txId: string) => void;
    setWalletFrozen: (userId: string, frozen: boolean, reason?: string) => void;
    setUserStatus: (userId: string, status: UserStatus, reason?: string, durationMs?: number) => void;
    modifyCoins: (userId: string, amount: number) => void;
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
  systemNotification: "Welcome to STK Earning! VIP members get 2x Mining rewards!",
  appVersion: "1.0.0",
  minVersionRequired: "1.0.0",
  dailyCapNormal: 100,
  dailyBonusReward: 5,
  adRewardCoins: 1,
  referralReward: 50,
  miningDurationNormal: 24 * 60 * 60 * 1000,
  miningDurationVIP: 12 * 60 * 60 * 1000,
  miningRewardNormal: 25,
  miningRewardVIP: 40,
  miningBoostAdsRequired: 20,
  spinRewards: [1, 2, 3, 5, 2, 4, 1, 10],
  maxDailySpinsNormal: 5,
  withdrawalFeeNormal: 7.5,
  minWithdrawalCoins: 500,
  withdrawalCooldownHours: 24
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
      settings: parsed?.settings || DEFAULT_SETTINGS,
      logs: parsed?.logs || [],
      isAdBlockerActive: false,
      isAdminSession: parsed?.isAdminSession || false,
      theme: parsed?.theme || 'dark'
    };
  });

  const [activeTab, setActiveTab] = useState('home');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
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

  // Daily Reset Effect
  useEffect(() => {
    if (!state.currentUser) return;
    const now = Date.now();
    const lastReset = state.currentUser.lastResetTimestamp || 0;
    const dayInMs = 24 * 60 * 60 * 1000;

    if (now - lastReset >= dayInMs) {
      updateUser({
        dailyEarned: 0,
        adsWatchedToday: 0,
        spinsToday: 0,
        extraSpinWatchedToday: false,
        dailyRewardClaimed: false,
        lastResetTimestamp: now
      });
    }
  }, [state.currentUser?.id, state.currentUser?.lastResetTimestamp]);

  // Task Synchronization Effect
  useEffect(() => {
    if (!state.currentUser || state.isAdminSession) return;
    const user = state.currentUser;
    const tasks = [...user.tasks];
    let changed = false;

    tasks.forEach(task => {
      if (task.type === 'SYSTEM' && !task.completed) {
        let newProgress = task.progress || 0;
        if (task.id === 't1') newProgress = user.adsWatchedToday || 0;
        if (task.id === 't2') newProgress = user.spinsToday || 0;
        if (task.id === 't3') newProgress = user.referralHistory?.length || 0;

        if (newProgress !== task.progress) {
          task.progress = newProgress;
          changed = true;
        }
      }
    });

    if (changed) {
      updateUser({ tasks });
    }
  }, [
    state.currentUser?.adsWatchedToday, 
    state.currentUser?.spinsToday, 
    state.currentUser?.referralHistory?.length,
    updateUser
  ]);

  useEffect(() => {
    checkAdBlocker();
    const interval = setInterval(checkAdBlocker, 30000);
    return () => clearInterval(interval);
  }, [checkAdBlocker]);

  useEffect(() => {
    localStorage.setItem('stk_app_state', JSON.stringify(state));
    const isVIP = state.currentUser?.tag === UserTag.PASS;
    const effectiveTheme = isVIP ? state.theme : 'dark';
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const updateLogo = (url: string) => setState(prev => ({ ...prev, logoUrl: url }));
  const updateSettings = (updates: Partial<AppSettings>) => setState(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));

  const addCoins = useCallback((amount: number, method: string): boolean => {
    if (!state.currentUser) return false;
    if (state.settings.adsEnabled && state.isAdBlockerActive) {
      alert("Reward Blocked: Please disable your ad-blocker to receive coins.");
      return false;
    }
    const isPass = state.currentUser.tag === UserTag.PASS;
    const todayEarned = state.currentUser.dailyEarned || 0;
    if (!isPass && todayEarned + amount > state.settings.dailyCapNormal && amount > 0) {
      const allowed = state.settings.dailyCapNormal - todayEarned;
      if (allowed <= 0) {
        alert("Daily earning cap reached!");
        return false;
      }
      amount = allowed;
    }
    const transaction: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      amount,
      type: amount >= 0 ? 'EARN' : 'ADJUST',
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

  const addTask = useCallback((title: string, reward: number) => {
    if (!state.currentUser) return;
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      reward,
      type: 'CUSTOM',
      completed: false
    };
    updateUser({ tasks: [...state.currentUser.tasks, newTask] });
  }, [state.currentUser, updateUser]);

  const completeTask = useCallback(async (taskId: string, proof?: string) => {
    if (!state.currentUser) return false;
    const task = state.currentUser.tasks.find(t => t.id === taskId);
    if (!task) return false;

    if (task.type === 'CUSTOM' && proof) {
      const result = await BackendAI.verifyTaskProof(task, proof);
      if (!result.success) {
        alert(`Verification Failed: ${result.reason}`);
        return false;
      }
    }

    const success = addCoins(task.reward, `Task: ${task.title}`);
    if (success) {
      updateUser({
        tasks: state.currentUser.tasks.map(t => t.id === taskId ? { ...t, completed: true, proof } : t)
      });
      return true;
    }
    return false;
  }, [state.currentUser, addCoins, updateUser]);

  const playAd = (onComplete: () => void, type: 'REWARD' | 'REQUIRED') => {
    if (!state.settings.adsEnabled) { onComplete(); return; }
    if (state.currentUser?.adsBlocked) { alert("System Restriction: Ad access suspended."); return; }
    if (state.isAdBlockerActive) { alert("Please disable your ad-blocker to watch ads."); return; }
    setAdConfig({ type, onComplete });
  };

  const login = (email: string, name: string, referralCode?: string) => {
    const isAdmin = email === 'admin@stk.com';
    let user = state.allUsers.find(u => u.email === email);
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
        dailyRewardClaimed: false,
        spinsToday: 0,
        extraSpinWatchedToday: false,
        status: UserStatus.ACTIVE,
        walletFrozen: false,
        adsBlocked: false,
        tasks: [
          { id: 't1', title: 'WATCH 5 ADS', reward: 10, type: 'SYSTEM', completed: false, progress: 0, totalRequired: 5 },
          { id: 't2', title: 'SPIN THE WHEEL 3 TIMES', reward: 15, type: 'SYSTEM', completed: false, progress: 0, totalRequired: 3 },
          { id: 't3', title: 'INVITE 1 FRIEND', reward: 50, type: 'SYSTEM', completed: false, progress: 0, totalRequired: 1 }
        ],
        transactions: [],
        referralHistory: [],
        passHistory: [],
        is2xMiningUnlocked: false,
        adsFor2xMining: 0,
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
  };

  const logout = () => { 
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    setState(prev => ({ ...prev, currentUser: null, isLoggedIn: false, isAdminSession: false })); 
    setActiveTab('home'); 
  };
  const toggleTheme = useCallback(() => {
    setState(prev => {
      const isVIP = prev.currentUser?.tag === UserTag.PASS;
      if (!isVIP) { alert("Elite Feature: Theme customization is for VIP members."); return prev; }
      return { ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' };
    });
  }, []);

  const buyPass = useCallback(() => {
    const confirmBuy = window.confirm("Activate VIP Status? Enjoy zero fees, 2x mining, and custom themes for 30 days.");
    if (!confirmBuy) return;
    setState(prev => {
      if (!prev.currentUser) return prev;
      const now = Date.now();
      const updatedUser = {
        ...prev.currentUser,
        tag: UserTag.PASS,
        passPurchaseTimestamp: now,
        passHistory: [{ date: now, type: 'PURCHASE' }, ...(prev.currentUser.passHistory || [])]
      };
      return { ...prev, currentUser: updatedUser, allUsers: prev.allUsers.map(u => u.id === updatedUser.id ? updatedUser : u) };
    });
    alert("VIP Upgrade Successful! Welcome to the Elite Tier.");
  }, []);

  const withdraw = (upiId: string, amount: number): string | null => {
    if (!state.currentUser) return "User session error";
    if (state.currentUser.walletFrozen) return "Your wallet is frozen.";
    if (state.currentUser.coins < amount) return "Insufficient balance";
    if (amount < state.settings.minWithdrawalCoins) return `Minimum withdrawal is ${state.settings.minWithdrawalCoins} coins.`;
    const cooldownMs = (state.settings.withdrawalCooldownHours || 24) * 60 * 60 * 1000;
    const nextAllowed = (state.currentUser.lastWithdrawalTimestamp || 0) + cooldownMs;
    if (Date.now() < nextAllowed) return "Withdrawal Cooldown: Please wait before next request.";
    const upiRegex = /^[\w\.-]+@[\w\.-]+$/;
    if (!upiRegex.test(upiId)) return "Invalid UPI ID format.";
    const tx: Transaction = {
      id: 'WD-' + Math.random().toString(36).substring(2, 9),
      amount, type: 'WITHDRAW', method: 'UPI: ' + upiId, status: 'PENDING', timestamp: Date.now()
    };
    updateUser({ coins: state.currentUser.coins - amount, transactions: [tx, ...state.currentUser.transactions], upiId, lastWithdrawalTimestamp: Date.now() });
    return null;
  };

  const logAdminAction = useCallback((action: string, targetId: string, details: string) => {
    const newLog: AdminLog = { id: Math.random().toString(36).substring(2, 9), adminId: 'SUPER_ADMIN', action, targetId, details, timestamp: Date.now() };
    setState(prev => ({ ...prev, logs: [newLog, ...prev.logs] }));
  }, []);

  const adminActions = {
    approveWithdrawal: (userId: string, txId: string) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => u.id !== userId ? u : { ...u, transactions: u.transactions.map(t => t.id === txId ? { ...t, status: 'COMPLETED' as const } : t) });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('PAYOUT_APPROVE', userId, `Approved payout ${txId}`);
    },
    rejectWithdrawal: (userId: string, txId: string) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => {
          if (u.id !== userId) return u;
          const tx = u.transactions.find(t => t.id === txId);
          return { ...u, coins: u.coins + (tx?.amount || 0), transactions: u.transactions.map(t => t.id === txId ? { ...t, status: 'REJECTED' as const } : t) };
        });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('PAYOUT_REJECT', userId, `Rejected payout ${txId}`);
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
    modifyCoins: (userId: string, amount: number) => {
      setState(prev => {
        const newAllUsers = prev.allUsers.map(u => u.id !== userId ? u : { ...u, coins: Math.max(0, u.coins + amount) });
        const updated = newAllUsers.find(u => u.id === userId);
        return { ...prev, allUsers: newAllUsers, currentUser: prev.currentUser?.id === userId ? (updated || null) : prev.currentUser };
      });
      logAdminAction('COIN_ADJUST', userId, `Adjusted by ${amount}`);
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
      if (showAdminLogin) return <AdminLogin onLogin={login} onBack={() => setShowAdminLogin(false)} />;
      return <Login onLogin={login} onAdminClick={() => setShowAdminLogin(true)} />;
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
      if (!state.isAdminSession) {
        setActiveTab('home');
        return <Dashboard />;
      }
      return <AdminPanel />;
    }
    if (activeTab === 'privacy') return <PrivacyPolicy />;
    if (activeTab === 'faq') return <FAQ />;
    if (activeTab === 'tasks') return <Tasks />;
    switch (activeTab) {
      case 'home': return <Dashboard />;
      case 'mining': return <Mining />;
      case 'spin': return <SpinWheel />;
      case 'wallet': return <Wallet />;
      case 'invite': return <Referral />;
      case 'videos': return <Videos />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppContext.Provider value={{
      state, updateUser, updateLogo, updateSettings, addCoins, addTask, completeTask, playAd, login, logout, 
      toggleTheme, buyPass, withdraw, setActiveTab, calculateRiskScore: () => 0,
      checkAdBlocker, logAdminAction, adminActions
    }}>
      <div className="flex flex-col h-screen max-w-md mx-auto bg-white dark:bg-gray-950 shadow-2xl relative overflow-hidden transition-colors duration-300">
        {state.isLoggedIn && activeTab !== 'admin' && activeTab !== 'privacy' && <Header isAdmin={state.isAdminSession && activeTab === 'admin'} />}
        {state.isLoggedIn && activeTab === 'admin' && <Header isAdmin={true} />}
        {state.isAdminSession && state.currentUser?.email !== 'admin@stk.com' && activeTab !== 'admin' && (
           <div className="bg-orange-600 text-white px-4 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest z-[100]">
              <div className="flex items-center gap-2"><UserCog size={14} /> <span>Admin Control</span></div>
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
