
import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { 
  Disc, Trophy, Sparkles, Coins, Gift, Lock, 
  Star, Zap, Loader2, ShieldCheck, Fingerprint, Activity,
  ShieldOff, ShieldAlert, PlusCircle
} from 'lucide-react';
import { playSound } from '../audioUtils';

const SpinWheel: React.FC = () => {
  const { state, isDeviceLimitReached, playAd, claimSpinReward, updateUser, setActiveTab, logActivity } = useApp();
  const { currentUser, settings, isAdBlockerActive } = state;
  const [spinning, setSpinning] = useState(false);
  const [isWobbling, setIsWobbling] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastReward, setLastReward] = useState<number | null>(null);
  const [winningSegmentIndex, setWinningSegmentIndex] = useState<number | null>(null);
  const [isAdPending, setIsAdPending] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!currentUser || !settings.spinCooldownMinutes) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const cooldownMs = settings.spinCooldownMinutes * 60 * 1000;
      const diff = cooldownMs - (now - (currentUser.lastSpinTimestamp || 0));
      setCooldownTime(Math.max(0, Math.ceil(diff / 1000)));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentUser?.lastSpinTimestamp, settings.spinCooldownMinutes]);

  if (!currentUser) return null;

  const multiplier = currentUser.streakDays >= 7 ? 2.0 : 1.0 + (currentUser.streakDays || 0) * 0.1;
  const finalReward = lastReward !== null ? Math.round(lastReward * multiplier) : null;

  if (!settings.spinEnabled) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-[32px] flex items-center justify-center">
           <Lock size={64} className="text-gray-300 dark:text-gray-700" />
        </div>
        <div className="space-y-2">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter dark:text-white">Spin Wheel Offline</h2>
           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest max-w-[240px] leading-relaxed">The prize wheel system is currently under maintenance.</p>
        </div>
        <button onClick={() => setActiveTab('home')} className="bg-blue-600 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl transition-all border-b-4 border-blue-900">Return to Terminal</button>
      </div>
    );
  }

  const maxSpins = settings.maxDailySpinsNormal;
  const remainingSpins = maxSpins - currentUser.spinsToday;

  const handleSpin = async () => {
    if (isDeviceLimitReached) {
      alert("Maximum accounts reached on this device");
      return;
    }
    if (isAdBlockerActive) {
      alert("Verification Failed: Please disable your ad-blocker.");
      return;
    }

    if (remainingSpins <= 0) {
      alert("No spins left! Watch an ad to unlock one extra turn or wait for tomorrow.");
      return;
    }

    if (spinning || isWobbling || isAdPending) return;

    if (cooldownTime > 0) {
      alert(`Spin Cooldown: Please wait ${cooldownTime}s.`);
      return;
    }

    playSound('tap');
    setLastReward(null);
    setWinningSegmentIndex(null);
    setIsWobbling(true);

    setTimeout(() => {
      setIsWobbling(false);
      setSpinning(true);
      playSound('ignite');
      
      // Use probability weights to select reward
      let totalWeight = 0;
      const weights = settings.spinRewards.map(reward => {
        const weight = settings.spinProbabilities[reward.toString()] || 1;
        totalWeight += weight;
        return weight;
      });
      
      let randomNum = Math.random() * totalWeight;
      let selectedRewardIndex = 0;
      for (let i = 0; i < weights.length; i++) {
        randomNum -= weights[i];
        if (randomNum <= 0) {
          selectedRewardIndex = i;
          break;
        }
      }

      const segmentIndex = selectedRewardIndex;
      const segmentAngle = 360 / settings.spinRewards.length;
      const extraRotations = 10 * 360; 
      const currentAngleOffset = rotation % 360;
      const finalSegmentAngle = (settings.spinRewards.length - segmentIndex) * segmentAngle - (segmentAngle / 2);
      const newRotation = rotation + extraRotations + (finalSegmentAngle - currentAngleOffset);
      
      setRotation(newRotation);

      // Wheel stops
      setTimeout(() => {
        setSpinning(false);
        playSound('complete');
        setIsAdPending(true);
        
        // MANDATORY AD AFTER EVERY SPIN
        playAd(() => {
          setWinningSegmentIndex(segmentIndex);
          setLastReward(settings.spinRewards[segmentIndex]);
          setIsAdPending(false);
          logActivity(currentUser.id, currentUser.name, 'SPIN_RESULT', `Won ${settings.spinRewards[segmentIndex]} coins from wheel`);
        }, 'REQUIRED');
        
      }, 4000); 
    }, 600);
  };

  const handleClaimReward = () => {
    if (lastReward === null || isAdBlockerActive || isAdPending) return;

    setIsAdPending(true);
    // MANDATORY AD BEFORE EVERY CLAIM
    playAd(() => {
      const success = claimSpinReward(lastReward!);
      if (success) {
        playSound('collect');
        setLastReward(null);
        setWinningSegmentIndex(null);
      }
      setIsAdPending(false);
    }, 'REQUIRED');
  };

  const handleUnlockExtraSpin = () => {
    if (currentUser.extraSpinWatchedToday || isAdBlockerActive || isAdPending) return;
    
    setIsAdPending(true);
    playAd(() => {
      // Logic: Decrease spinsToday to effectively give 1 more spin
      updateUser({ 
        spinsToday: Math.max(0, currentUser.spinsToday - 1),
        extraSpinWatchedToday: true 
      });
      setIsAdPending(false);
      playSound('complete');
      alert("Extra turn unlocked! Use it now.");
    }, 'REQUIRED');
  };

  return (
    <div className="p-4 space-y-4 flex flex-col items-center min-h-full pb-28 bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-hidden relative">
      <div className="text-center space-y-1.5 pt-4 relative z-10">
        <h2 className={`text-2xl font-black tracking-tighter uppercase italic leading-none transition-colors duration-500 ${isAdBlockerActive ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>Lucky Spin</h2>
        <div className="flex items-center justify-center gap-2">
           <Sparkles size={12} className="text-orange-500 animate-pulse" />
           <p className="text-[8px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-[0.4em]">Spin & Win STK Coins</p>
           <Sparkles size={12} className="text-orange-500 animate-pulse" />
        </div>
      </div>

      <div className={`relative w-48 h-48 flex items-center justify-center shrink-0 z-10 ${isWobbling ? 'animate-wobble' : ''}`}>
        {isAdBlockerActive && (
          <div className="absolute inset-0 z-40 rounded-full bg-gray-950/80 backdrop-blur-md flex flex-col items-center justify-center border-4 border-red-600 animate-in fade-in zoom-in-95 duration-500 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
             <ShieldOff size={48} className="text-red-500 animate-pulse mb-2" />
             <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Ad-Blocker Active</span>
          </div>
        )}

        <div className={`absolute inset-0 rounded-full border-[10px] shadow-xl flex items-center justify-center transition-all duration-700 ${isAdBlockerActive ? 'border-red-900 bg-red-950 grayscale' : 'border-blue-700 dark:border-blue-900 bg-blue-800 dark:bg-gray-900 shadow-blue-500/20'}`}>
          {[...Array(24)].map((_, i) => (
            <div key={i} className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-300 ${spinning ? 'bg-white shadow-[0_0_10px_white] scale-125' : 'bg-white/40 shadow-sm'}`} style={{ transform: `rotate(${i * 15}deg) translateY(-82px)` }} />
          ))}
        </div>
        
        <div ref={wheelRef} className={`absolute inset-4 rounded-full border-2 border-white/20 shadow-xl overflow-hidden transition-all duration-[4000ms] ease-[cubic-bezier(0.2,0,0.1,1)] ${isAdBlockerActive ? 'grayscale opacity-20' : ''}`} style={{ transform: `rotate(${rotation}deg)` }}>
          {settings.spinRewards.map((val, i) => {
            const angle = 360 / settings.spinRewards.length;
            const darkVibrantColors = ['#dc2626', '#d97706', '#059669', '#2563eb', '#4f46e5', '#7c3aed', '#c026d3', '#db2777'];
            return (
              <div key={i} className="absolute top-0 left-0 w-full h-full origin-center" style={{ transform: `rotate(${i * angle}deg)` }}>
                <div className={`w-full h-full relative transition-all duration-500 ${winningSegmentIndex === i ? 'animate-segment-bounce' : ''}`}>
                  <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                    <path d={`M50,50 L50,0 A50,50 0 0,1 ${50 + 50 * Math.sin(angle * Math.PI / 180)},${50 - 50 * Math.cos(angle * Math.PI / 180)} Z`} fill={darkVibrantColors[i % darkVibrantColors.length]} />
                  </svg>
                  <div className={`absolute top-4 left-1/2 -translate-x-1/2 font-black text-white text-base flex flex-col items-center drop-shadow-lg transition-transform ${winningSegmentIndex === i ? 'scale-150' : ''}`} style={{ transform: `rotate(${angle / 2}deg)` }}>
                    <span>{val}</span>
                    <Coins size={10} className="opacity-80 mt-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-50">
          <div className={`w-6 h-10 rounded-b-xl shadow-xl border-x-2 border-b-2 border-white transition-colors ${isAdBlockerActive ? 'bg-red-600' : 'bg-blue-600 dark:bg-blue-500'}`} />
          <div className={`w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] mx-auto transition-colors ${isAdBlockerActive ? 'border-t-red-600' : 'border-t-blue-600 dark:border-t-blue-500'}`} />
        </div>

        <div className="relative z-50 w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-gray-100 dark:border-gray-700 transition-transform group hover:scale-105">
           <div className={`absolute inset-1.5 border-2 border-dashed border-blue-500/20 rounded-full ${spinning ? 'animate-spin-slow' : ''}`} />
           {isAdPending ? <Loader2 className="text-blue-600 animate-spin" size={24} /> : <Disc className={`text-blue-600 dark:text-blue-400 ${spinning ? 'animate-spin' : ''}`} size={24} />}
        </div>
      </div>

      <div className="w-full max-w-xs space-y-4 relative z-10">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-600/10 transition-opacity opacity-0 group-hover:opacity-100" />
          <div className="flex items-center gap-3 relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-800/50`}>
              <Star size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic">Turn Supply</p>
              <p className="text-xs font-black text-gray-900 dark:text-white uppercase italic">Standard Yield</p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl text-[9px] font-black shadow-md transition-all bg-blue-600 text-white">
             {remainingSpins} LEFT
          </div>
        </div>

        <div className="space-y-2">
          <button 
            onClick={handleSpin}
            disabled={spinning || isWobbling || remainingSpins <= 0 || isAdBlockerActive || isAdPending}
            className={`w-full py-5 rounded-3xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group border-b-8 active:scale-95 ${isAdBlockerActive || isAdPending || remainingSpins <= 0 ? 'bg-gray-200 border-gray-400 opacity-40 grayscale text-gray-400' : 'bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 text-white border-blue-900 shadow-blue-500/30'}`}
          >
            {spinning || isAdPending ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                <Zap size={24} fill="currentColor" className="group-hover:scale-125 transition-transform" />
                SPIN NOW
              </>
            )}
          </button>

          {remainingSpins <= 0 && !currentUser.extraSpinWatchedToday && (
             <button 
               onClick={handleUnlockExtraSpin}
               disabled={isAdPending || isAdBlockerActive}
               className="w-full py-3 bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-blue-900 rounded-2xl text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
             >
                <PlusCircle size={16} /> Restore Energy
             </button>
          )}
        </div>
      </div>

      {lastReward !== null && !spinning && (
        <div className="fixed inset-0 bg-gray-950/98 backdrop-blur-3xl flex items-center justify-center p-4 z-[200] animate-in fade-in duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-[48px] p-8 w-full max-w-sm text-center shadow-4xl relative overflow-hidden animate-in zoom-in-95 duration-500 border-2 border-white/10 dark:border-gray-800">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 via-indigo-500 to-purple-500" />
            
            <div className="relative mb-6">
               <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-30 animate-pulse" />
               <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-3xl flex items-center justify-center mx-auto relative z-10 shadow-3xl border-4 border-white dark:border-gray-800 rotate-6 transition-transform hover:rotate-12">
                 <Trophy size={40} className="text-white animate-bounce" />
               </div>
            </div>

            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tighter uppercase italic">Jackpot!</h3>
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-6">Disbursement ready</p>

            <div className="bg-gray-50 dark:bg-black/50 rounded-[32px] py-6 px-4 my-6 border-2 border-gray-100 dark:border-gray-800 shadow-inner flex flex-col items-center justify-center gap-1">
               <div className="flex items-center gap-3">
                  <Coins className="text-yellow-500 animate-pulse" size={32} />
                  <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums italic">{finalReward}</span>
               </div>
               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">COINS WON</span>
               {multiplier > 1 && (
                 <span className="text-[10px] font-black text-orange-500 mt-2">
                   Includes {multiplier.toFixed(1)}x Streak Bonus!
                 </span>
               )}
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleClaimReward}
                disabled={isAdPending}
                className={`w-full py-5 rounded-3xl font-black text-xl shadow-xl flex items-center justify-center gap-3 transition-all bg-green-600 text-white border-b-8 border-green-900 active:scale-95 shadow-green-500/30 ${isAdPending ? 'opacity-50 grayscale' : ''}`}
              >
                {isAdPending ? <Loader2 className="animate-spin" /> : <><Gift size={24} /> CLAIM COINS</>}
              </button>
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
                <ShieldCheck size={10} className="text-blue-500" />
                Auth Required
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinWheel;
