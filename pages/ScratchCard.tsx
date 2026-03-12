import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { 
  Gift, Trophy, Sparkles, Coins, Lock, 
  Star, Zap, Loader2, ShieldOff, PlusCircle
} from 'lucide-react';
import { playSound } from '../audioUtils';

const ScratchCard: React.FC = () => {
  const { state, isDeviceLimitReached, getServerTime, playAd, claimScratchReward, updateUser, setActiveTab, logActivity } = useApp();
  const { currentUser, settings, isAdBlockerActive } = state;
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [reward, setReward] = useState<number | null>(null);
  const [isAdPending, setIsAdPending] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser || !settings.scratchCooldownMinutes) return;
    
    const interval = setInterval(() => {
      const now = getServerTime();
      const cooldownMs = settings.scratchCooldownMinutes * 60 * 1000;
      const diff = cooldownMs - (now - (currentUser.lastScratchTimestamp || 0));
      setCooldownTime(Math.max(0, Math.ceil(diff / 1000)));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentUser?.lastScratchTimestamp, settings.scratchCooldownMinutes, getServerTime]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || isRevealed || !reward) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Fill with scratchable layer
    ctx.fillStyle = '#9ca3af'; // Gray-400
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some pattern/text to the scratch layer
    ctx.fillStyle = '#6b7280'; // Gray-500
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2);

    // Reset state
    setScratchedPercentage(0);
  }, [reward, isRevealed]);

  if (!currentUser) return null;

  const multiplier = currentUser.streakDays >= 7 ? 2.0 : 1.0 + (currentUser.streakDays || 0) * 0.1;
  const finalReward = reward !== null ? Math.round(reward * multiplier) : null;

  if (!settings.scratchEnabled) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-[32px] flex items-center justify-center">
           <Lock size={64} className="text-gray-300 dark:text-gray-700" />
        </div>
        <div className="space-y-2">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter dark:text-white">Scratch Offline</h2>
           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest max-w-[240px] leading-relaxed">The scratch card system is currently under maintenance.</p>
        </div>
        <button onClick={() => setActiveTab('home')} className="bg-blue-600 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl transition-all border-b-4 border-blue-900">Return to Terminal</button>
      </div>
    );
  }

  const maxScratches = settings.maxDailyScratchesNormal;
  const remainingScratches = maxScratches - (currentUser.scratchesToday || 0);

  const handleStartScratch = () => {
    if (isDeviceLimitReached) {
      alert("Maximum accounts reached on this device");
      return;
    }
    if (isAdBlockerActive) {
      alert("Verification Failed: Please disable your ad-blocker.");
      return;
    }

    if (remainingScratches <= 0) {
      alert("No scratches left! Watch an ad to unlock one extra card or wait for tomorrow.");
      return;
    }

    if (cooldownTime > 0) {
      alert(`Scratch Cooldown: Please wait ${cooldownTime}s.`);
      return;
    }

    if (isAdPending) return;

    // Select reward
    let totalWeight = 0;
    const weights = settings.scratchRewards.map(r => {
      const weight = settings.scratchProbabilities[r.toString()] || 1;
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

    setReward(settings.scratchRewards[selectedRewardIndex]);
    setIsRevealed(false);
    setScratchedPercentage(0);
    playSound('tap');

    // Deduct scratch immediately to prevent refresh exploits
    updateUser({
      scratchesToday: (currentUser.scratchesToday || 0) + 1,
      lastScratchTimestamp: getServerTime()
    });
  };

  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching || isRevealed || !canvasRef.current || !reward) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Subtle haptic feedback while scratching (throttled by the browser usually, but we can just call it)
    if (navigator.vibrate && Math.random() > 0.8) navigator.vibrate(5);

    calculateScratchedArea();
  };

  const calculateScratchedArea = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparentPixels = 0;
    const totalPixels = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const percentage = (transparentPixels / totalPixels) * 100;
    setScratchedPercentage(percentage);

    if (percentage > 50 && !isRevealed) {
      handleReveal();
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
    playSound('complete');
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    
    // Clear the rest of the canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (settings.scratchAdRequired) {
      setIsAdPending(true);
      playAd(() => {
        setIsAdPending(false);
        logActivity(currentUser.id, currentUser.name, 'SCRATCH_RESULT', `Won ${reward} coins from scratch card`);
      }, 'REQUIRED', () => setIsAdPending(false));
    } else {
      logActivity(currentUser.id, currentUser.name, 'SCRATCH_RESULT', `Won ${reward} coins from scratch card`);
    }
  };

  const handleClaimReward = () => {
    if (reward === null || isAdBlockerActive || isAdPending) return;

    const claim = async () => {
      setIsAdPending(true);
      const success = await claimScratchReward(reward!);
      if (success) {
        playSound('collect');
        setReward(null);
        setIsRevealed(false);
      }
      setIsAdPending(false);
    };

    if (settings.scratchAdRequired) {
      setIsAdPending(true);
      playAd(claim, 'REQUIRED', () => setIsAdPending(false));
    } else {
      claim();
    }
  };

  const handleUnlockExtraScratch = () => {
    if (currentUser.extraScratchWatchedToday || isAdBlockerActive || isAdPending) return;
    
    setIsAdPending(true);
    playAd(() => {
      updateUser({ 
        scratchesToday: Math.max(0, (currentUser.scratchesToday || 0) - 1),
        extraScratchWatchedToday: true 
      });
      setIsAdPending(false);
      playSound('complete');
      alert("Extra card unlocked! Use it now.");
    }, 'REQUIRED', () => setIsAdPending(false));
  };

  return (
    <div className="p-4 space-y-4 flex flex-col items-center min-h-full pb-28 bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-hidden relative">
      <div className="text-center space-y-1.5 pt-4 relative z-10">
        <h2 className={`text-2xl font-black tracking-tighter uppercase italic leading-none transition-colors duration-500 ${isAdBlockerActive ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>Lucky Scratch</h2>
        <div className="flex items-center justify-center gap-2">
           <Sparkles size={12} className="text-orange-500 animate-pulse" />
           <p className="text-[8px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-[0.4em]">Scratch & Win STK Coins</p>
           <Sparkles size={12} className="text-orange-500 animate-pulse" />
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
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic">Card Supply</p>
              <p className="text-xs font-black text-gray-900 dark:text-white uppercase italic">Standard Yield</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="px-3 py-1.5 rounded-xl text-[9px] font-black shadow-md transition-all bg-blue-600 text-white">
               {remainingScratches} LEFT
            </div>
            <div className="text-[9px] font-black text-orange-500 uppercase tracking-widest">
               {multiplier.toFixed(1)}x Multiplier
            </div>
          </div>
        </div>

        {/* Scratch Card Area */}
        <div className="relative w-full aspect-square bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-4 border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center">
          {isAdBlockerActive && (
            <div className="absolute inset-0 z-40 bg-gray-950/80 backdrop-blur-md flex flex-col items-center justify-center border-4 border-red-600 animate-in fade-in zoom-in-95 duration-500">
               <ShieldOff size={48} className="text-red-500 animate-pulse mb-2" />
               <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Ad-Blocker Active</span>
            </div>
          )}

          {!reward ? (
            <div className="text-center space-y-4 p-6">
              <Gift size={48} className="mx-auto text-blue-500 opacity-50" />
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Click below to get a new scratch card</p>
            </div>
          ) : (
            <div ref={containerRef} className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 transition-transform duration-300 ${isScratching ? 'scale-[0.98]' : 'scale-100'}`}>
              <div className="text-center">
                <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">{reward}</span>
                <div className="flex items-center justify-center gap-1 mt-2 text-orange-500">
                  <Coins size={16} />
                  <span className="text-sm font-bold uppercase tracking-widest">Coins</span>
                </div>
              </div>
              
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full cursor-crosshair touch-none transition-opacity duration-500 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onMouseDown={() => setIsScratching(true)}
                onMouseUp={() => setIsScratching(false)}
                onMouseLeave={() => setIsScratching(false)}
                onMouseMove={scratch}
                onTouchStart={() => setIsScratching(true)}
                onTouchEnd={() => setIsScratching(false)}
                onTouchMove={scratch}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          {!reward ? (
            <button 
              onClick={handleStartScratch}
              disabled={remainingScratches <= 0 || isAdBlockerActive || isAdPending}
              className={`w-full py-5 rounded-3xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group border-b-8 active:scale-95 ${isAdBlockerActive || isAdPending || remainingScratches <= 0 ? 'bg-gray-200 border-gray-400 opacity-40 grayscale text-gray-400' : 'bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 text-white border-blue-900 shadow-blue-500/30'}`}
            >
              {isAdPending ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  <Gift size={24} fill="currentColor" className="group-hover:scale-125 transition-transform" />
                  GET CARD
                </>
              )}
            </button>
          ) : (
             <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
               <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                 {isRevealed ? "Card Revealed!" : "Scratch to Reveal!"}
               </p>
             </div>
          )}

          {remainingScratches <= 0 && !currentUser.extraScratchWatchedToday && !reward && (
             <button 
               onClick={handleUnlockExtraScratch}
               disabled={isAdPending || isAdBlockerActive}
               className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 border-2 border-orange-600 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
             >
                <PlusCircle size={16} /> Watch Ad for Extra Card
             </button>
          )}
        </div>
      </div>

      {isRevealed && reward !== null && (
        <div className="fixed inset-0 bg-gray-950/98 backdrop-blur-3xl flex items-center justify-center p-4 z-[200] animate-in fade-in duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-[48px] p-8 w-full max-w-sm text-center shadow-4xl relative overflow-hidden animate-in zoom-in-95 duration-500 border-2 border-white/10 dark:border-gray-800">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 via-indigo-500 to-purple-500" />
            
            <div className="relative mb-6">
               <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-30 animate-pulse" />
               <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-3xl flex items-center justify-center mx-auto relative z-10 shadow-3xl border-4 border-white dark:border-gray-800 rotate-6 transition-transform hover:rotate-12">
                 <Trophy size={40} className="text-white animate-bounce" />
               </div>
            </div>

            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tighter uppercase italic">You Won!</h3>
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
                className="w-full py-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[24px] font-black text-lg uppercase tracking-widest shadow-xl border-b-4 border-blue-900 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isAdPending ? <Loader2 className="animate-spin" size={24} /> : 'Claim Reward'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScratchCard;
