
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
  const { state, playAd, claimDailyCheckIn, setActiveTab, logActivity, updateDeviceClaim } = useApp();
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

  const dailyCap = settings.dailyCapNormal;
  const progressPercent = Math.min(100, ((currentUser.dailyEarned || 0) / dailyCap) * 100);

  // Mining Status
  const isMiningActive = currentUser.miningStartedAt && Date.now() < (currentUser.miningStartedAt + settings.miningDurationNormal);

  const currentDay = (currentUser.streakDays || 0) % 7 + 1;
  const rewardAmount = currentDay === 7 ? 25 : 5;

  const hasWatchedAd = currentUser.adsWatchedToday > 0;
  const hasActivity = currentUser.miningCyclesToday > 0 || currentUser.spinsToday > 0;
  
  const lastDeviceClaim = state.deviceClaims[currentUser.deviceId] || 0;
  const isDeviceClaimedToday = Date.now() - lastDeviceClaim < 24 * 60 * 60 * 1000;
  
  const canClaim = hasWatchedAd && hasActivity && !isDeviceClaimedToday;

  const handleClaimDailyBonus = () => {
    if (currentUser.dailyRewardClaimed) return;
    if (isDeviceClaimedToday) {
      alert("Reward already claimed on this device today.");
      return;
    }
    if (!canClaim) {
      alert("Please watch at least 1 ad and complete 1 mining or spin session today to unlock the daily reward.");
      return;
    }
    
    claimDailyCheckIn();
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
                  <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter italic tabular-nums leading-none drop-shadow-sm">
                    {currentUser.coins.toLocaleString()}
                  </span>
                  <span className="text-2xl font-black text-gray-400 dark:text-gray-500 italic">STK</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-[24px] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-2 shadow-inner">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-500 font-black">₹</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-gray-900 dark:text-white tabular-nums leading-none">{(currentUser.coins * COIN_TO_INR_RATE).toFixed(2)}</p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Cash Value</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-[24px] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-2 shadow-inner relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500">
                    <TrendingUp size={20} />
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
                       {`${Math.floor(progressPercent)}% USED`}
                    </span>
                 </div>
                 <div className="h-3 bg-blue-100 dark:bg-gray-900 rounded-full overflow-hidden p-0.5 border border-blue-200 dark:border-gray-800 shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500" 
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
             <ZapIcon size={12} fill="currentColor" /> {`${settings.maxDailySpinsNormal - currentUser.spinsToday} LEFT`}
          </div>
        </div>
      </div>

      {/* 3. 7-Day Check-In Section */}
      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-end px-1">
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">7-Day Check-In</h3>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            {currentUser.dailyRewardClaimed ? `Next in: ${timeLeft}` : 'Available Now'}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
          {/* Progress Bar */}
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 -translate-y-1/2 rounded-full z-0" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full z-0 transition-all duration-1000"
              style={{ width: `${((currentDay - 1) / 6) * 100}%` }}
            />
            
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const isCompleted = day < currentDay || (day === currentDay && currentUser.dailyRewardClaimed);
              const isCurrent = day === currentDay && !currentUser.dailyRewardClaimed;
              
              return (
                <div key={day} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
                    isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' :
                    isCurrent ? 'bg-yellow-400 text-blue-900 shadow-lg shadow-yellow-400/30 animate-bounce' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={14} /> : `D${day}`}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${
                    isCompleted || isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                  }`}>
                    REWARD
                  </span>
                </div>
              );
            })}
          </div>

          {/* Claim Button & Conditions */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${hasWatchedAd ? 'text-green-500' : 'text-gray-400'}`}>
                {hasWatchedAd ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-gray-300 dark:border-gray-700" />}
                Watch 1 Ad Today ({currentUser.adsWatchedToday}/1)
              </div>
              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${hasActivity ? 'text-green-500' : 'text-gray-400'}`}>
                {hasActivity ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-gray-300 dark:border-gray-700" />}
                Complete 1 Mining or Spin
              </div>
              {isDeviceClaimedToday && !currentUser.dailyRewardClaimed && (
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500">
                  <ShieldAlert size={12} />
                  Device limit reached
                </div>
              )}
            </div>

            <button
              onClick={handleClaimDailyBonus}
              disabled={currentUser.dailyRewardClaimed || !canClaim || isDeviceClaimedToday}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                currentUser.dailyRewardClaimed ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' :
                (canClaim && !isDeviceClaimedToday) ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 active:scale-95' :
                'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentUser.dailyRewardClaimed ? 'Claimed Today' : 
               isDeviceClaimedToday ? 'Device Limit Reached' :
               !canClaim ? 'Complete Tasks to Unlock' : 
               `Claim Reward`}
            </button>
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
