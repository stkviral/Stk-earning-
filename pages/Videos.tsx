
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { PlayCircle, Zap, TrendingUp, History, Coins, ArrowRight, ShieldCheck, Activity, Flame, Sparkles, ZapOff, ShieldOff, AlertTriangle } from 'lucide-react';
import { MAX_DAILY_ADS, AD_GAP_MS, AD_REWARD_COINS } from '../types';

const Videos: React.FC = () => {
  const { state, playAd, addCoins, updateUser } = useApp();
  const { currentUser, isAdBlockerActive, settings } = state;
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    
    // Manage interval for reward video cooldown
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = AD_GAP_MS - (now - currentUser.lastAdTimestamp);
      setTimeLeft(Math.max(0, Math.ceil(diff / 1000)));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentUser?.lastAdTimestamp]);

  if (!currentUser) return null;

  const handleWatchAd = () => {
    if (settings.adsEnabled && isAdBlockerActive) {
      alert("Please disable your ad-blocker to watch reward videos.");
      return;
    }

    if (currentUser.adsWatchedToday >= MAX_DAILY_ADS) {
      alert(`You have reached today's limit (${MAX_DAILY_ADS}/${MAX_DAILY_ADS})!`);
      return;
    }

    if (timeLeft > 0) {
      alert(`Please wait ${timeLeft}s for the next video.`);
      return;
    }

    // playAd will instantly call the callback if settings.adsEnabled is false
    playAd(() => {
      const success = addCoins(AD_REWARD_COINS, 'Video Watch');
      if (success) {
        updateUser({
          adsWatchedToday: (currentUser.adsWatchedToday || 0) + 1,
          lastAdTimestamp: Date.now()
        });
      }
    }, 'REWARD');
  };

  const progress = (currentUser.adsWatchedToday / MAX_DAILY_ADS) * 100;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700 pb-32 max-w-md mx-auto relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="text-center space-y-2 pt-4 relative z-10">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 dark:bg-blue-400/10 px-4 py-1.5 rounded-full text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest border border-blue-600/20">
          <Activity size={12} className="animate-pulse" /> Live Status <Activity size={12} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic leading-tight">
          Watch & Earn
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
          {settings.adsEnabled ? 'Watch videos to earn free coins' : 'VIP Mode: Instant Rewards Active'}
        </p>
      </div>

      <div className="relative flex flex-col items-center py-8">
        <div className="relative w-64 h-64 flex items-center justify-center">
           <div className={`absolute inset-0 rounded-full border-4 border-dashed border-blue-500/10 animate-spin-slow`} />
           <div className={`absolute inset-10 rounded-full border-2 border-dashed border-blue-500/20 animate-orbit-ccw`} />
           
           <div className={`w-40 h-40 rounded-[48px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col items-center justify-center border-2 border-gray-100 dark:border-gray-800 transition-all duration-500 ${timeLeft > 0 || (settings.adsEnabled && isAdBlockerActive) ? 'grayscale opacity-50' : 'scale-105'}`}>
              <div className={`relative ${timeLeft === 0 && (!settings.adsEnabled || !isAdBlockerActive) ? 'animate-bounce' : ''}`}>
                 {settings.adsEnabled && isAdBlockerActive ? (
                   <ShieldOff size={64} className="text-orange-500" />
                 ) : (
                   <PlayCircle size={64} className={timeLeft === 0 ? 'text-blue-600' : 'text-gray-300'} />
                 )}
                 {timeLeft === 0 && (!settings.adsEnabled || !isAdBlockerActive) && <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />}
              </div>
              <div className="mt-2 text-center">
                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                 <p className={`text-[10px] font-black uppercase ${settings.adsEnabled && isAdBlockerActive ? 'text-red-500' : (timeLeft === 0 ? 'text-green-500' : 'text-orange-500')}`}>
                   {settings.adsEnabled && isAdBlockerActive ? 'BLOCKED' : (timeLeft === 0 ? 'Ready' : `Wait ${timeLeft}s`)}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {settings.adsEnabled && isAdBlockerActive && (
        <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-[32px] border-2 border-red-100 dark:border-red-900/30 flex items-center gap-4 animate-in zoom-in-95">
           <AlertTriangle className="text-red-600 shrink-0" size={24} />
           <p className="text-[10px] font-black text-red-900 dark:text-red-400 uppercase leading-relaxed tracking-tight">
             Earning is disabled because an ad-blocker is active. Turn it off to continue watching videos.
           </p>
        </div>
      )}

      {!settings.adsEnabled && (
        <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-[32px] border-2 border-green-100 dark:border-green-900/30 flex items-center gap-4 animate-in zoom-in-95">
           <Sparkles className="text-green-600 shrink-0" size={24} />
           <p className="text-[10px] font-black text-green-900 dark:text-green-400 uppercase leading-relaxed tracking-tight">
             Premium Rewards Mode: Ads are currently disabled. You can claim rewards instantly!
           </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-[48px] p-8 shadow-2xl border-2 border-gray-50 dark:border-gray-800 space-y-8 relative overflow-hidden">
        <div className="space-y-4">
           <div className="flex justify-between items-end px-1">
              <div className="flex items-center gap-2">
                 <Flame size={14} className="text-orange-500" />
                 <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Daily Progress</span>
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800">
                {currentUser.adsWatchedToday} / {MAX_DAILY_ADS}
              </span>
           </div>
           <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden p-1 border border-gray-100 dark:border-gray-700 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-600 rounded-full transition-all duration-1000 relative overflow-hidden" 
                style={{ width: `${progress}%` }}
              >
                 <div className="absolute inset-0 animate-shimmer-wave bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
           </div>
        </div>

        <button 
           onClick={handleWatchAd}
           disabled={timeLeft > 0 || currentUser.adsWatchedToday >= MAX_DAILY_ADS || (settings.adsEnabled && isAdBlockerActive)}
           className={`w-full py-6 rounded-[32px] font-black text-xl shadow-2xl transition-all border-b-8 uppercase tracking-widest flex items-center justify-center gap-4 group ${
             timeLeft > 0 || currentUser.adsWatchedToday >= MAX_DAILY_ADS || (settings.adsEnabled && isAdBlockerActive)
             ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 cursor-not-allowed grayscale'
             : 'bg-blue-600 border-blue-900 text-white active:scale-95 shadow-blue-500/20'
           }`}
        >
           {settings.adsEnabled && isAdBlockerActive ? (
             <>
               <ShieldOff size={24} /> LOCKED
             </>
           ) : timeLeft > 0 ? (
             <>
               <ZapOff size={24} className="opacity-50" />
               Wait...
             </>
           ) : (
             <>
               <Zap size={24} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
               {settings.adsEnabled ? 'Watch Video' : 'Claim Reward'}
               <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
             </>
           )}
        </button>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-gray-50 dark:bg-gray-800/80 p-5 rounded-[28px] border border-gray-100 dark:border-gray-700 text-center space-y-1">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Reward</p>
              <div className="flex items-center justify-center gap-1">
                 <span className="text-sm font-black text-gray-900 dark:text-white">{(AD_REWARD_COINS).toFixed(2)}</span>
                 <Coins size={12} className="text-yellow-500" />
              </div>
           </div>
           <div className="bg-gray-50 dark:bg-gray-800/80 p-5 rounded-[28px] border border-gray-100 dark:border-gray-700 text-center space-y-1">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Network</p>
              <div className="flex items-center justify-center gap-1">
                 <span className="text-sm font-black text-green-500 uppercase">Optimal</span>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-[40px] border-2 border-blue-50 dark:border-blue-900/30 shadow-lg relative z-10 flex items-start gap-4">
         <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <ShieldCheck size={24} />
         </div>
         <div className="space-y-1">
            <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Earning Tips</h4>
            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-relaxed tracking-widest">
              Do not use VPN. Ensure you have a stable internet connection to receive coins instantly.
            </p>
         </div>
      </div>

    </div>
  );
};

export default Videos;
