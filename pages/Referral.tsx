
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { 
  Share2, Copy, Gift, Users, Clock, CheckCircle2, 
  History, Sparkles, TrendingUp, ArrowRight, UserPlus, 
  Heart, Coins, IndianRupee, Trophy, Medal, Star, ChevronRight, Lock
} from 'lucide-react';
import { COIN_TO_INR_RATE } from '../types';

const Referral: React.FC = () => {
  const { state, setActiveTab } = useApp();
  const { currentUser, settings } = state;

  const [animatedEarned, setAnimatedEarned] = useState(0);

  const totalReferrals = currentUser?.referralHistory.length || 0;
  const totalEarned = currentUser?.referralHistory.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const totalEarnedINR = totalEarned * COIN_TO_INR_RATE;

  useEffect(() => {
    if (totalEarned === 0) return;
    let start = 0;
    const end = totalEarned;
    const duration = 1500;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedEarned(end);
        clearInterval(timer);
      } else {
        setAnimatedEarned(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [totalEarned]);

  if (!currentUser) return null;

  if (!settings.referralsEnabled) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[500px] text-center space-y-4">
        <Lock size={64} className="text-gray-300 dark:text-gray-700" />
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Referral Hub Offline</h2>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest max-w-[200px]">The recruitment program is currently suspended by administration.</p>
        <button onClick={() => setActiveTab('home')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Back to Terminal</button>
      </div>
    );
  }

  const getReferralTier = () => {
    if (totalReferrals >= 10) return { name: 'Legend', icon: <Trophy className="text-yellow-400" />, color: 'text-yellow-400' };
    if (totalReferrals >= 5) return { name: 'Pro', icon: <Medal className="text-indigo-400" />, color: 'text-indigo-400' };
    return { name: 'Starter', icon: <Star className="text-blue-400" />, color: 'text-blue-400' };
  };

  const tier = getReferralTier();

  const copyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    alert("Code copied successfully!");
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700 pb-32 max-w-md mx-auto relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="text-center space-y-2 pt-4 relative z-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic leading-tight">Invite & Earn</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Share with friends and earn together</p>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[56px] p-10 text-center text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shimmer-wave" />
        <div className="relative z-10">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[36px] flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20">
            <Gift size={48} className="text-yellow-300 animate-float" />
          </div>
          <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">Bonus: {settings.referralReward} STK</h2>
          <p className="text-indigo-100 text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-8 leading-relaxed">
            Per friend who completes their first withdrawal
          </p>
          
          <div className="space-y-4">
             <div className="bg-black/20 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 space-y-3">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Personal Code</p>
                <div className="flex items-center gap-3">
                   <div className="flex-1 bg-white/10 p-4 rounded-2xl text-2xl font-black tracking-[0.4em] text-center border border-white/10">{currentUser.referralCode}</div>
                   <button onClick={copyCode} className="p-4 bg-white text-indigo-900 rounded-2xl active:scale-95 shadow-xl"><Copy size={24} /></button>
                </div>
             </div>
             <button className="w-full bg-white text-indigo-900 py-6 rounded-[32px] font-black text-lg uppercase tracking-widest shadow-2xl active:scale-95 transition-all border-b-8 border-indigo-100">
               <Share2 size={24} /> INVITE FRIENDS
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white dark:bg-gray-900 p-6 rounded-[40px] border-2 border-gray-50 dark:border-gray-800 text-center shadow-xl space-y-2">
            <p className="text-[9px] font-black text-gray-400 uppercase">Yield</p>
            <p className="text-xl font-black text-indigo-600">{animatedEarned} STK</p>
         </div>
         <div className="bg-white dark:bg-gray-900 p-6 rounded-[40px] border-2 border-gray-50 dark:border-gray-800 text-center shadow-xl space-y-2">
            <p className="text-[9px] font-black text-gray-400 uppercase">Growth</p>
            <p className="text-xl font-black text-green-600">{totalReferrals} New</p>
         </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-[48px] border-2 border-indigo-50 dark:border-indigo-900/30 shadow-xl space-y-4">
         <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Rules</h4>
         <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed tracking-wider">Rewards are added instantly when your friend completes their first withdrawal. Fake accounts will be banned.</p>
      </div>
    </div>
  );
};

export default Referral;
