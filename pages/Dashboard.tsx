
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { 
  PlayCircle, Zap, Crown, Gift, Timer, Info, CheckCircle2, 
  ChevronRight, Sparkles, Calendar, Clock, Star, TrendingUp, 
  Wallet, ArrowRight, Coins, Bell, Pickaxe, Disc, ShieldCheck,
  Award, Trophy, User as UserIcon, Heart, Share2, Flame, Rocket,
  Activity, ArrowUpRight, UserPlus, Target, BarChart3, Layers,
  Sun, Moon, CloudSun, X, Fingerprint, Cpu, Scan, 
  ZapOff, Zap as ZapIcon, Globe, ShieldAlert, Terminal, Radio, Users
} from 'lucide-react';
import { playSound } from '../audioUtils';

const Dashboard: React.FC = () => {
  const { state, isDeviceLimitReached, getServerTime, playAd, claimDailyCheckIn, setActiveTab, logActivity, updateDeviceClaim } = useApp();
  const { currentUser, settings } = state;
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showNotification, setShowNotification] = useState(true);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "System Online", sub: "Good Morning", icon: <Sun className="text-yellow-500" size={18} /> };
    if (hour < 18) return { text: "Network Active", sub: "Good Afternoon", icon: <CloudSun className="text-orange-500" size={18} /> };
    return { text: "Secure Session", sub: "Good Evening", icon: <Moon className="text-indigo-500" size={18} /> };
  }, []);

  useEffect(() => {
    if (!currentUser?.dailyRewardClaimed) return;
    const timer = setInterval(() => {
      const now = getServerTime();
      const nextReset = (currentUser.lastResetTimestamp || getServerTime()) + (24 * 60 * 60 * 1000);
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
  }, [currentUser?.dailyRewardClaimed, currentUser?.lastResetTimestamp, getServerTime]);

  if (!currentUser) return null;

  const dailyCap = settings.dailyCapNormal;
  const progressPercent = Math.min(100, ((currentUser.dailyEarned || 0) / dailyCap) * 100);

  const currentDay = currentUser.dailyRewardClaimed 
    ? currentUser.streakDays
    : (currentUser.streakDays || 0) + 1;

  const currentStreak = currentUser.streakDays || 0;
  const activeMultiplier = currentStreak >= 7 ? 2.0 : 1.0 + currentStreak * 0.1;
  const rewardAmount = currentDay === 7 ? 30 : 5;

  const hasWatchedAd = currentUser.adsWatchedToday > 0;
  const hasActivity = currentUser.spinsToday > 0;
  
  const lastDeviceClaim = state.deviceClaims[currentUser.deviceId] || 0;
  const isDeviceClaimedToday = getServerTime() - lastDeviceClaim < 24 * 60 * 60 * 1000;
  
  const canClaim = hasWatchedAd && hasActivity && !isDeviceClaimedToday && !isDeviceLimitReached;

  const handleClaimDailyBonus = () => {
    if (isDeviceLimitReached) {
      alert("Maximum accounts reached on this device");
      return;
    }
    if (currentUser.dailyRewardClaimed) return;
    if (isDeviceClaimedToday) {
      alert("Reward already claimed on this device today.");
      return;
    }
    if (!canClaim) {
      alert("Please watch at least 1 ad and complete 1 spin session today to unlock the daily reward.");
      return;
    }
    
    claimDailyCheckIn();
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 relative overflow-hidden bg-gray-50 dark:bg-gray-950 pb-32 min-h-full">
      
      {/* Global Broadcast Notification */}
      {showNotification && settings.systemNotification && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-3 flex items-start gap-3 shadow-sm relative z-10 animate-in slide-in-from-top-2">
           <div className="bg-blue-100 dark:bg-blue-800 p-1.5 rounded-lg shrink-0">
              <Radio size={16} className="text-blue-600 dark:text-blue-400 animate-pulse" />
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">Global Broadcast</p>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-snug">{settings.systemNotification}</p>
           </div>
           <button onClick={() => setShowNotification(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
              <X size={14} />
           </button>
        </div>
      )}

      {/* 1. Earning Multiplier Snapshot */}
      <div className="relative z-10 space-y-6">
        <div className="relative group overflow-hidden rounded-[32px] shadow-xl transition-all duration-500 border border-orange-100 dark:border-orange-900/30 bg-white dark:bg-gray-900">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 dark:from-orange-900/20 to-transparent opacity-80" />
          <div className="relative z-10 p-6 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Flame size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-600/80 dark:text-orange-400/80 mb-0.5">Active Boost</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black italic text-gray-900 dark:text-white leading-none">
                      {activeMultiplier.toFixed(1)}x
                    </span>
                    <span className="text-[10px] font-bold text-orange-500 uppercase">Multiplier</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-0.5">Current Streak</p>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-xl font-black italic text-orange-500 leading-none">{currentStreak}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Days</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-950/40 backdrop-blur-sm border border-orange-100/50 dark:border-orange-900/30 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                  <Rocket size={12} className="text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Keep streak to increase earnings!</span>
              </div>
              <button 
                onClick={() => { playSound('tap'); setActiveTab('spin'); }}
                className="text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
              >
                Earn Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Action Hub (3 Circular Icons) */}
      <div className="grid grid-cols-3 gap-2 relative z-10 mt-8">

        {/* SPIN */}
        <div 
          onClick={() => { playSound('tap'); setActiveTab('spin'); }}
          className="flex flex-col items-center gap-2 cursor-pointer group relative"
        >
          <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center text-purple-600 dark:text-purple-400 group-active:scale-95 transition-all">
             <Disc size={24} />
          </div>
          <div className="absolute top-0 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Spin</span>
        </div>

        {/* WATCH VIDEO */}
        <div 
          onClick={() => { playSound('tap'); setActiveTab('videos'); }}
          className="flex flex-col items-center gap-2 cursor-pointer group relative"
        >
          <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center text-yellow-600 dark:text-yellow-400 group-active:scale-95 transition-all">
             <PlayCircle size={24} />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Watch Video</span>
        </div>

        {/* WITHDRAWAL */}
        <div 
          onClick={() => { playSound('tap'); setActiveTab('wallet'); }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center text-orange-600 dark:text-orange-400 group-active:scale-95 transition-all">
             <Wallet size={24} />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Withdrawal</span>
        </div>
      </div>

      {/* 4. 7-Day Check-In Section */}
      <div className="relative z-10 space-y-4 mt-8">
        <div className="flex justify-between items-end px-1">
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">7-Day Check-In</h3>
          <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {currentUser.dailyRewardClaimed ? `Next in: ${timeLeft}` : 'Available Now'}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
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
                    isCurrent ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/30 animate-bounce' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={14} /> : `D${day}`}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${
                    isCompleted || isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                  }`}>
                    DAY {day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Claim Button & Conditions */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${hasWatchedAd ? 'text-green-500' : 'text-gray-400'}`}>
                {hasWatchedAd ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-gray-200 dark:border-gray-700" />}
                Watch 1 Ad Today ({currentUser.adsWatchedToday}/1)
              </div>
              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${hasActivity ? 'text-green-500' : 'text-gray-400'}`}>
                {hasActivity ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-gray-200 dark:border-gray-700" />}
                Complete 1 Spin
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
                'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              {currentUser.dailyRewardClaimed ? 'Claimed Today' : 
               isDeviceClaimedToday ? 'Device Limit Reached' :
               !canClaim ? 'Complete Tasks to Unlock' : 
               `Claim ${rewardAmount} Coins`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
