
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { 
  PlayCircle, Zap, Crown, Gift, Timer, Info, CheckCircle2, 
  ChevronRight, Sparkles, Calendar, Clock, Star, TrendingUp, 
  Wallet, ArrowRight, Coins, Bell, Pickaxe, Disc, ShieldCheck,
  Award, Trophy, User as UserIcon, Heart, Share2, Flame, Rocket,
  Activity, ArrowUpRight, UserPlus, Target, BarChart3, Layers,
  Sun, Moon, CloudSun, X, Fingerprint, Cpu, Scan, 
  ZapOff, Zap as ZapIcon, Globe, ShieldAlert, Terminal, Radio
} from 'lucide-react';
import { UserTag, COIN_TO_INR_RATE } from '../types';
import { playSound } from '../audioUtils';

// --- VISUAL COMPONENTS ---

const TechGrid: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.1] overflow-hidden z-0">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] animate-float" />
  </div>
);

const FloatingParticle: React.FC<{ index: number }> = ({ index }) => {
  const style = useMemo(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${15 + Math.random() * 10}s`,
  }), [index]);

  return (
    <div className="absolute w-1 h-1 bg-blue-500/20 rounded-full animate-float-particle pointer-events-none z-0" style={style} />
  );
};

const Dashboard: React.FC = () => {
  const { state, playAd, addCoins, updateUser, buyPass, setActiveTab, logActivity } = useApp();
  const { currentUser, settings } = state;
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showNotification, setShowNotification] = useState(true);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "System Online", sub: "Good Morning", icon: <Sun className="text-yellow-400" size={18} /> };
    if (hour < 18) return { text: "Network Active", sub: "Good Afternoon", icon: <CloudSun className="text-orange-400" size={18} /> };
    return { text: "Secure Session", sub: "Good Evening", icon: <Moon className="text-indigo-400" size={18} /> };
  }, []);

  useEffect(() => {
    if (!currentUser?.dailyRewardClaimed) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const nextReset = (currentUser.lastResetTimestamp || Date.now()) + (24 * 60 * 60 * 1000);
      const diff = nextReset - now;
      if (diff <= 0) {
        setTimeLeft('Ready!');
        clearInterval(timer);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentUser?.dailyRewardClaimed, currentUser?.lastResetTimestamp]);

  if (!currentUser) return null;

  const isPassUser = currentUser.tag === UserTag.PASS;
  const dailyCap = settings.dailyCapNormal;
  const progressPercent = isPassUser ? 100 : Math.min(100, ((currentUser.dailyEarned || 0) / dailyCap) * 100);

  // Mining Status
  const isMiningActive = currentUser.miningStartedAt && Date.now() < (currentUser.miningStartedAt + (isPassUser ? settings.miningDurationVIP : settings.miningDurationNormal));

  const handleClaimDailyBonus = () => {
    if (currentUser.dailyRewardClaimed) return;
    playAd(() => {
      const success = addCoins(settings.dailyBonusReward, 'Daily Bonus');
      if (success) {
        updateUser({ dailyRewardClaimed: true, lastResetTimestamp: Date.now() });
        logActivity(currentUser.id, currentUser.name, 'DAILY_BONUS', `Claimed ${settings.dailyBonusReward} coins`);
      }
    }, 'REQUIRED');
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-1000 relative overflow-hidden bg-gray-50 dark:bg-gray-950 pb-32 min-h-full">
      <TechGrid />
      {[...Array(12)].map((_, i) => <FloatingParticle key={i} index={i} />)}

      {/* 1. Welcoming Hero & Identity Snapshot */}
      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-center px-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <Terminal size={12} className="text-blue-500" />
               <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] italic">{greeting.text}</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Dashboard
            </h1>
          </div>
          <div className="flex gap-2">
             <button onClick={() => { playSound('tap'); setActiveTab('wallet'); }} className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-800 text-blue-600 transition-all active:scale-90">
                <Wallet size={22} />
             </button>
             <button className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-800 text-gray-400 transition-all active:scale-90 relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
             </button>
          </div>
        </div>

        {/* Cinematic Asset Vault Card */}
        <div className="relative group overflow-hidden rounded-[40px] shadow-2xl transition-all duration-700 border border-white/20 dark:border-white/5 bg-white dark:bg-gray-900">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 opacity-10 dark:opacity-20" />
           <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_50%)] animate-spin-slow pointer-events-none" />
           
           <div className="relative z-10 p-8 space-y-8">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50">
                  <Wallet size={12} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Total Balance</span>
                </div>
                
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-2xl font-black text-gray-400 dark:text-gray-500 italic">₹</span>
                  <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter italic tabular-nums leading-none drop-shadow-sm">
                    {(currentUser.coins * COIN_TO_INR_RATE).toFixed(0)}<span className="text-2xl opacity-40">.{(currentUser.coins * COIN_TO_INR_RATE).toFixed(2).split('.')[1]}</span>
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-[24px] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-2 shadow-inner">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Coins size={20} className="text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-gray-900 dark:text-white tabular-nums leading-none">{currentUser.coins.toLocaleString()}</p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">STK Coins</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-[24px] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-2 shadow-inner relative overflow-hidden">
                  {isPassUser && <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10" />}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPassUser ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-500/30' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500'}`}>
                    {isPassUser ? <Crown size={20} /> : <TrendingUp size={20} />}
                  </div>
                  <div className="text-center relative z-10">
                    <p className="text-lg font-black text-gray-900 dark:text-white tabular-nums leading-none">+{currentUser.dailyEarned.toLocaleString()}</p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Earned Today</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-[28px] border border-blue-100 dark:border-blue-800/30 space-y-4">
                 <div className="flex justify-between items-end px-1">
                    <div className="flex items-center gap-2">
                       <Activity size={14} className="text-blue-500 animate-pulse" />
                       <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Daily Capacity</span>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase italic tracking-tighter">
                       {isPassUser ? 'UNLIMITED' : `${Math.floor(progressPercent)}% USED`}
                    </span>
                 </div>
                 <div className="h-3 bg-blue-100 dark:bg-gray-900 rounded-full overflow-hidden p-0.5 border border-blue-200 dark:border-gray-800 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${isPassUser ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} 
                      style={{ width: `${Math.min(100, progressPercent)}%` }} 
                    >
                       <div className="absolute inset-0 animate-shimmer-wave bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. Primary Operations (High-Impact CTAs) */}
      <div className="grid grid-cols-2 gap-5 relative z-10">
        {/* EXTRACTION HUB (MINING) */}
        <div 
          onClick={() => { playSound('tap'); setActiveTab('mining'); }}
          className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-[44px] p-6 shadow-xl border border-blue-100 dark:border-gray-700 flex flex-col items-center text-center gap-4 active:scale-95 transition-all relative overflow-hidden"
        >
          <div className="absolute top-[-20%] right-[-20%] p-4 opacity-[0.05] group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
             <Pickaxe size={180} />
          </div>
          
          <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center shadow-2xl transition-all duration-500 ${isMiningActive ? 'bg-blue-600 text-white shadow-blue-500/40 animate-pulse' : 'bg-white dark:bg-gray-800 text-blue-500 shadow-blue-500/10'}`}>
             <Pickaxe size={40} className={isMiningActive ? 'animate-pickaxe' : 'group-hover:rotate-12 transition-transform'} />
          </div>
          
          <div className="space-y-1 relative z-10">
             <h4 className="text-xl font-black uppercase italic tracking-tighter text-blue-900 dark:text-blue-100">Mining</h4>
             <p className="text-[9px] font-black text-blue-600/60 dark:text-blue-400/60 uppercase tracking-widest leading-none">Automated Earnings</p>
          </div>

          <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${isMiningActive ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : 'bg-white/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>
             <Activity size={12} className={isMiningActive ? 'animate-pulse' : ''} /> {isMiningActive ? 'Active' : 'Standby'}
          </div>
        </div>

        {/* FORTUNE HUB (SPIN) */}
        <div 
          onClick={() => { playSound('tap'); setActiveTab('spin'); }}
          className="group bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 rounded-[44px] p-6 shadow-xl border border-orange-100 dark:border-gray-700 flex flex-col items-center text-center gap-4 active:scale-95 transition-all relative overflow-hidden"
        >
          <div className="absolute top-[-20%] right-[-20%] p-4 opacity-[0.05] group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none">
             <Disc size={180} />
          </div>

          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-orange-500/30 group-hover:scale-110 transition-all duration-500">
             <Disc size={40} className="animate-spin-slow" />
          </div>

          <div className="space-y-1 relative z-10">
             <h4 className="text-xl font-black uppercase italic tracking-tighter text-orange-900 dark:text-orange-100">Lucky Spin</h4>
             <p className="text-[9px] font-black text-orange-600/60 dark:text-orange-400/60 uppercase tracking-widest leading-none">Win Big Rewards</p>
          </div>

          <div className="px-5 py-2 bg-white/50 dark:bg-gray-800/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
             <ZapIcon size={12} fill="currentColor" /> {isPassUser ? '∞ TURNS' : `${settings.maxDailySpinsNormal - currentUser.spinsToday} LEFT`}
          </div>
        </div>
      </div>

      {/* 3. Daily Bonus Section (Guided Action) */}
      <div 
        onClick={handleClaimDailyBonus}
        className={`relative z-10 p-6 rounded-[40px] border-2 transition-all active:scale-[0.98] group overflow-hidden ${
          currentUser.dailyRewardClaimed 
          ? 'bg-gray-100 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-60' 
          : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-500/30 shadow-2xl'
        }`}
      >
        {!currentUser.dailyRewardClaimed && (
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1),transparent_70%)] animate-pulse" />
        )}
        <div className="flex items-center justify-between relative z-10">
           <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center shadow-xl transition-all duration-500 group-hover:rotate-12 ${
                currentUser.dailyRewardClaimed ? 'bg-gray-200 dark:bg-gray-800 text-gray-400' : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/30'
              }`}>
                <Gift size={32} className={currentUser.dailyRewardClaimed ? '' : 'animate-bounce'} />
              </div>
              <div className="space-y-1">
                <h4 className={`text-xl font-black uppercase italic tracking-tighter ${currentUser.dailyRewardClaimed ? 'text-gray-500 dark:text-gray-400' : 'text-green-900 dark:text-green-100'}`}>Daily Reward</h4>
                <p className={`text-[10px] font-black uppercase tracking-widest ${currentUser.dailyRewardClaimed ? 'text-gray-400 dark:text-gray-500' : 'text-green-600/80 dark:text-green-400/80'}`}>
                  {currentUser.dailyRewardClaimed ? `Next in: ${timeLeft}` : `Claim +${settings.dailyBonusReward} STK`}
                </p>
              </div>
           </div>
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${currentUser.dailyRewardClaimed ? 'bg-gray-200 dark:bg-gray-800 text-gray-400' : 'bg-white dark:bg-green-900/40 text-green-600 dark:text-green-400 shadow-sm'}`}>
              {currentUser.dailyRewardClaimed ? <CheckCircle2 size={24} /> : <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />}
           </div>
        </div>
      </div>

      {/* 4. Secondary Services (Quick Grid) */}
      <div className="grid grid-cols-1 gap-4 relative z-10">
         <div 
          onClick={() => setActiveTab('videos')}
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-[40px] border border-purple-100 dark:border-purple-900/30 flex items-center justify-between active:scale-95 transition-all group shadow-lg"
         >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-[28px] flex items-center justify-center shadow-xl shadow-purple-500/20 group-hover:scale-110 transition-transform">
                 <PlayCircle size={36} fill="currentColor" className="text-white" />
              </div>
              <div className="space-y-1">
                <span className="text-xl font-black uppercase italic tracking-tighter text-purple-900 dark:text-purple-100">Watch & Earn</span>
                <p className="text-[10px] font-black text-purple-600/60 dark:text-purple-400/60 uppercase tracking-widest">Instant STK Rewards</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
               <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
      </div>

      {/* 5. VIP Monthly Pass - Call to Ascension */}
      {!isPassUser && (
        <div 
          onClick={() => { playSound('tap'); setActiveTab('pass'); }} 
          className="bg-gray-950 dark:bg-black rounded-[56px] p-10 shadow-4xl relative overflow-hidden group border border-white/10 active:scale-95 transition-all z-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1),transparent_70%)]" />
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
             <Crown size={180} />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-18 h-18 bg-gradient-to-br from-yellow-400 to-orange-600 text-blue-950 rounded-[28px] flex items-center justify-center shadow-3xl animate-float p-4">
                 <Crown size={32} fill="currentColor" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.5em] italic">VIP Upgrade</p>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">VIP ELITE</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-white/5 p-6 rounded-[36px] border border-white/5 backdrop-blur-md">
               {[
                 { text: "Unlimited Earnings", icon: <TrendingUp size={12} /> },
                 { text: "Zero Withdrawal Fees", icon: <Zap size={12} /> },
                 { text: "2X Faster Mining", icon: <Cpu size={12} /> },
                 { text: "Custom Theme Access", icon: <Layers size={12} /> }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className="text-yellow-500">{item.icon}</div>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{item.text}</span>
                 </div>
               ))}
            </div>
            
            <button className="w-full bg-white text-gray-950 py-5 rounded-3xl font-black text-[12px] uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4 transition-all border-b-[6px] border-gray-200 active:border-b-0 active:translate-y-1">
               ACTIVATE SUPREME ACCESS <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Global Broadcast Notification */}
      {showNotification && settings.systemNotification && (
        <div className="fixed bottom-32 left-6 right-6 z-50 bg-blue-600 text-white p-5 rounded-[32px] flex items-center justify-between shadow-4xl animate-in slide-in-from-bottom-20 duration-700 border border-white/20 backdrop-blur-lg">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                 <Sparkles size={18} className="text-yellow-300 animate-pulse" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed max-w-[200px]">
                {settings.systemNotification}
              </p>
           </div>
           <button onClick={() => setShowNotification(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all"><X size={16} /></button>
        </div>
      )}

      {/* App Version */}
      <div className="pt-10 pb-4 text-center">
        <p className="text-[9px] font-black text-gray-300 dark:text-gray-800 uppercase tracking-[0.5em] cursor-default select-none">
          STK Network v{settings.appVersion}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
