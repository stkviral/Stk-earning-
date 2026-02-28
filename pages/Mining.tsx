
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../App';
import { 
  Pickaxe, CheckCircle2, Loader2, Sparkles, 
  Activity, Timer, Lock, Info, HelpCircle,
  Gift, Cpu, Star, Clock, ShieldCheck, Zap,
  TrendingUp, ZapIcon
} from 'lucide-react';
import { UserTag } from '../types';
import { playSound } from '../audioUtils';

// --- VISUAL COMPONENTS ---

const TechGrid: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07] overflow-hidden z-0">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-float" />
  </div>
);

const Particle: React.FC<{ index: number; isPremium: boolean }> = ({ index, isPremium }) => {
  const style = useMemo(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 80;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    return {
      '--tw-translate-x': `${x}px`,
      '--tw-translate-y': `${-y}px`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${1.5 + Math.random()}s`,
      left: '50%',
      top: '50%',
    } as React.CSSProperties;
  }, []);

  return (
    <div 
      className={`absolute w-1 h-1 rounded-full animate-spark pointer-events-none z-20 ${
        isPremium ? 'bg-orange-400 shadow-[0_0_10px_#fb923c]' : 'bg-blue-400 shadow-[0_0_8px_#60a5fa]'
      }`}
      style={style}
    />
  );
};

const ElectricArc: React.FC<{ color: string; delay: string; rotation: string }> = ({ color, delay, rotation }) => (
  <div className={`absolute inset-[-20%] pointer-events-none ${rotation}`} style={{ animationDelay: delay }}>
    <svg className="w-full h-full animate-pulse-slow opacity-60" viewBox="0 0 100 100">
      <path 
        d="M 50,10 A 40,40 0 0,1 90,50" 
        fill="none" 
        stroke={color} 
        strokeWidth="0.8" 
        strokeDasharray="1, 4"
        className="animate-shimmer-wave"
      />
    </svg>
  </div>
);

const TapRipple: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div 
    className="absolute pointer-events-none w-12 h-12 border-2 border-white/40 rounded-full animate-ping z-[100]"
    style={{ left: x - 24, top: y - 24 }}
  />
);

const Mining: React.FC = () => {
  const { state, playAd, addCoins, updateUser, setActiveTab, logActivity } = useApp();
  const { currentUser, isAdBlockerActive, settings } = state;
  const [adsWatchedToStart, setAdsWatchedToStart] = useState(0);
  const [adsWatchedToClaim, setAdsWatchedToClaim] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  if (!settings.miningEnabled) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-[32px] flex items-center justify-center shadow-inner">
           <Lock size={40} className="text-gray-300 dark:text-gray-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">Mining Offline</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] max-w-[200px]">System is currently suspended.</p>
        </div>
        <button onClick={() => setActiveTab('home')} className="bg-blue-600 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all border-b-4 border-blue-900">Return to Hub</button>
      </div>
    );
  }

  const isBoosted = currentUser.is2xMiningUnlocked;
  const finalReward = isBoosted ? settings.miningRewardNormal * 2 : settings.miningRewardNormal;
  
  const effectiveDuration = settings.miningDurationNormal;
  const maxCycles = settings.miningCyclesPerDayNormal;
  const cyclesToday = currentUser.miningCyclesToday || 0;
  const hasReachedDailyLimit = cyclesToday >= maxCycles;

  const miningStartedAt = currentUser.miningStartedAt || 0;
  const lastClaimedAt = currentUser.miningLastClaimedAt || 0;
  const miningEndedAt = miningStartedAt + effectiveDuration;
  const cooldownEndedAt = lastClaimedAt + settings.miningDurationNormal;

  const isMiningActive = miningStartedAt > 0 && currentTime < miningEndedAt;
  const isMiningComplete = miningStartedAt > 0 && currentTime >= miningEndedAt;
  const isCooldownActive = currentTime < cooldownEndedAt && !isMiningActive && !isMiningComplete;

  const progressPercent = isMiningActive ? Math.min(100, ((currentTime - miningStartedAt) / effectiveDuration) * 100) : (isMiningComplete ? 100 : 0);
  const isVisualPremium = isBoosted;

  const handleStartMining = () => {
    if (isMiningActive || isMiningComplete || isCooldownActive || isProcessing || hasReachedDailyLimit) return;
    if (isAdBlockerActive) return alert("Ad-Blocker Detected: Please disable it to start mining.");
    
    playSound('ignite');
    updateUser({ miningStartedAt: Date.now(), miningClaimed: false });
    logActivity(currentUser.id, currentUser.name, 'MINING_START', `Started mining reactor`);
  };

  const handleClaimReward = () => {
    if (!isMiningComplete || isProcessing) return;
    if (isAdBlockerActive) return alert("Ad-Blocker Detected: Please disable it to claim rewards.");

    setIsProcessing(true);
    playAd(() => {
      const nextCount = adsWatchedToClaim + 1;
      setAdsWatchedToClaim(nextCount);
      if (nextCount >= 2) {
        const success = addCoins(finalReward, 'Mining Reward');
        if (success) {
          playSound('collect');
          updateUser({
            miningStartedAt: 0,
            miningLastClaimedAt: Date.now(),
            miningClaimed: true,
            miningCyclesToday: cyclesToday + 1,
            is2xMiningUnlocked: false
          });
          logActivity(currentUser.id, currentUser.name, 'MINING_CLAIM', `Claimed ${finalReward} coins`);
        }
        setAdsWatchedToClaim(0);
      }
      setIsProcessing(false);
    }, 'REQUIRED');
  };

  const handleCoreTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMiningActive) return;
    playSound('tap');
    if (navigator.vibrate) navigator.vibrate(10);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };

  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-700 bg-gray-50 dark:bg-gray-950 min-h-full overflow-hidden relative">
      <TechGrid />
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />

      {/* Guided Header */}
      <div className="text-center space-y-1 pt-2 relative z-10">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none flex items-center justify-center gap-2">
           {isVisualPremium && <ZapIcon size={24} className="text-orange-500 fill-current animate-pulse" />}
           Mining
        </h2>
        <div className="flex items-center justify-center gap-1.5">
           <span className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">Automated Mining</span>
           <button onClick={() => setShowTooltip(showTooltip === 'main' ? null : 'main')} className="text-blue-500 hover:scale-110 transition-transform"><HelpCircle size={12} /></button>
        </div>
      </div>

      {/* Status Steps */}
      <div className="grid grid-cols-3 gap-2 relative z-10 px-1">
         {[
           { label: 'Ignite', active: !isMiningActive && !isMiningComplete && !isCooldownActive, done: isMiningActive || isMiningComplete, icon: <Zap size={12} /> },
           { label: 'Extract', active: isMiningActive, done: isMiningComplete, icon: <Cpu size={12} /> },
           { label: 'Stabilize', active: isMiningComplete, done: false, icon: <Gift size={12} /> }
         ].map((step, i) => (
           <div key={i} className={`p-2.5 rounded-xl border text-center space-y-1 transition-all duration-500 ${step.active ? 'bg-blue-600 border-blue-400 text-white scale-105 shadow-lg' : (step.done ? 'bg-green-500/10 border-green-500/30 text-green-500 opacity-60' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400')}`}>
              <div className="flex justify-center">{step.done ? <CheckCircle2 size={12} /> : step.icon}</div>
              <p className="text-[7px] font-black uppercase tracking-widest leading-none">{step.label}</p>
           </div>
         ))}
      </div>

      {/* REACTION CORE - ADVANCED VISUALS */}
      <div className="relative py-4 flex flex-col items-center justify-center">
         {isVisualPremium && isMiningActive && (
            <>
               <ElectricArc color="#fb923c" delay="0s" rotation="rotate-0" />
               <ElectricArc color="#fde047" delay="0.5s" rotation="rotate-120" />
               <ElectricArc color="#fbbf24" delay="1s" rotation="rotate-240" />
            </>
         )}

         <div 
           onClick={handleCoreTap}
           className={`relative w-48 h-48 flex items-center justify-center group cursor-pointer transition-transform ${isMiningActive ? 'active:scale-110' : 'active:scale-95'}`}
         >
            <div className={`absolute inset-0 rounded-full border-2 border-dashed border-blue-500/10 ${isMiningActive ? 'animate-spin-slow' : ''}`} />
            
            <div 
              className={`relative w-32 h-32 rounded-3xl bg-white dark:bg-gray-900 shadow-xl flex items-center justify-center border-4 border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-700 ${isMiningActive ? 'shadow-blue-500/20 border-blue-400' : (isMiningComplete ? 'shadow-green-500/20 border-green-500' : '')} ${isVisualPremium && isMiningActive ? 'animate-plasma-glow border-orange-500' : ''}`}
              style={{ boxShadow: isMiningActive ? `0 0 ${15 + progressPercent/3}px ${isVisualPremium ? 'rgba(249, 115, 22, 0.4)' : 'rgba(59, 130, 246, 0.3)'}` : 'none' }}
            >
               {/* Plasma Liquid Fill */}
               <div 
                 className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out opacity-20 dark:opacity-40 ${isVisualPremium ? 'bg-gradient-to-t from-orange-600 to-yellow-400' : 'bg-gradient-to-t from-blue-600 to-cyan-400'}`}
                 style={{ height: `${progressPercent}%` }}
               >
                  <div className="absolute top-0 left-0 right-0 h-4 bg-white/20 animate-shimmer-wave blur-sm" />
               </div>

               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-all duration-500 ${isMiningActive ? (isVisualPremium ? 'bg-orange-600 text-white shadow-xl shadow-orange-500/50' : 'bg-blue-600 text-white shadow-lg') : (isMiningComplete ? 'bg-green-500 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-300')}`}>
                     {isMiningComplete ? <CheckCircle2 size={40} /> : <Pickaxe size={40} className={isMiningActive ? 'animate-pickaxe' : ''} />}
                  </div>
                  <div className="mt-4">
                     <p className={`text-xs font-black uppercase tracking-tighter ${isMiningComplete ? 'text-green-500' : (isMiningActive ? 'text-blue-500 animate-pulse' : 'text-gray-400')}`}>
                       {isMiningComplete ? 'Coins Ready' : (isMiningActive ? (isVisualPremium ? '2X HYPERDRIVE' : 'MINING IN PROGRESS') : 'SYSTEM IDLE')}
                     </p>
                  </div>
               </div>

               {/* Particle Emitter */}
               {isMiningActive && [...Array(isVisualPremium ? 25 : 12)].map((_, i) => (
                  <Particle key={i} index={i} isPremium={isVisualPremium} />
               ))}
               
               {ripples.map(r => <TapRipple key={r.id} x={r.x} y={r.y} />)}
            </div>
         </div>
      </div>

      {/* Controls & Tooltips */}
      <div className="bg-white dark:bg-gray-900 rounded-[40px] p-6 shadow-xl border border-gray-100 dark:border-gray-800 space-y-5 relative z-10">
         
         {showTooltip === 'main' && (
           <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-600" />
                    <h4 className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">Process Guide</h4>
                 </div>
                 <button onClick={() => setShowTooltip(null)} className="text-gray-400"><Info size={12} /></button>
              </div>
              <ul className="space-y-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest list-disc pl-4">
                 <li>Watch <span className="text-blue-600">3 ads</span> to ignite the core.</li>
                 <li>Cycle time: <span className="text-blue-600">24H</span> (12H for VIP).</li>
                 <li>Stabilize with <span className="text-blue-600">3 ads</span> to claim coins.</li>
                 <li className="text-orange-500">VIP Pass: Zero ads + 2x yield.</li>
              </ul>
           </div>
         )}

         <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
               <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-gray-500 uppercase">Mining Progress</span>
               </div>
               <span className="text-xs font-black text-blue-600 italic tracking-tighter">{Math.floor(progressPercent)}% COMPLETE</span>
            </div>
            <div className="h-4 bg-gray-50 dark:bg-black p-1 rounded-full border border-gray-100 dark:border-gray-800 shadow-inner">
               <div 
                 className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${isMiningComplete ? 'bg-green-500' : (isVisualPremium ? 'bg-gradient-to-r from-orange-400 to-yellow-500' : 'bg-blue-600')}`} 
                 style={{ width: `${progressPercent}%` }}
               >
                  <div className="absolute inset-0 bg-white/30 animate-shimmer-wave" />
               </div>
            </div>
         </div>

         {isMiningComplete ? (
            <div className="space-y-4">
              <button 
                onClick={handleClaimReward}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-green-500/30 border-b-[6px] border-green-900 active:scale-95 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-3"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={28} /> : (
                    <>
                        <Gift size={28} />
                        <span className="uppercase tracking-widest">
                            {isPass ? "CLAIM COINS" : (adsWatchedToClaim < 2 ? `VERIFY CLAIM ${adsWatchedToClaim + 1}/2` : "CLAIM REWARDS")}
                        </span>
                    </>
                )}
              </button>
            </div>
         ) : isMiningActive ? (
            <div className="w-full bg-blue-50 dark:bg-blue-900/20 py-6 rounded-[32px] border-2 border-dashed border-blue-200 dark:border-blue-800 text-center flex flex-col items-center gap-2 group">
               <div className="flex items-center gap-2">
                  <Activity size={14} className="text-blue-500 animate-pulse" />
                  <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">MINING ACTIVE</p>
               </div>
               <div className="flex items-center gap-2 text-gray-900 dark:text-white font-black text-3xl tracking-tighter tabular-nums italic">
                  <Timer size={24} className="text-blue-500 group-hover:rotate-180 transition-transform duration-1000" />
                  {(() => {
                    const diff = miningEndedAt - currentTime;
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    return `${h}h ${m}m ${s}s`;
                  })()}
               </div>
            </div>
         ) : isCooldownActive ? (
            <div className="w-full bg-gray-50 dark:bg-gray-800/50 py-6 rounded-[32px] border-2 border-dashed border-gray-100 dark:border-gray-800 text-center flex flex-col items-center gap-1 opacity-60">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">CORE RECHARGE</p>
               <div className="flex items-center gap-2 text-gray-400 font-black text-2xl tracking-tighter italic">
                  <Clock size={22} />
                  {(() => {
                    const diff = cooldownEndedAt - currentTime;
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    return `${h}h ${m}m`;
                  })()}
               </div>
            </div>
         ) : hasReachedDailyLimit ? (
            <div className="w-full bg-gray-50 dark:bg-gray-800/50 py-6 rounded-[32px] border-2 border-dashed border-gray-100 dark:border-gray-800 text-center flex flex-col items-center gap-1 opacity-60">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">DAILY LIMIT REACHED</p>
               <div className="flex items-center gap-2 text-gray-400 font-black text-xl tracking-tighter italic">
                  <Clock size={22} />
                  Come back tomorrow
               </div>
            </div>
         ) : (
            <div className="space-y-4">
              <button 
                onClick={handleStartMining}
                disabled={isProcessing}
                className={`w-full py-6 rounded-[32px] font-black text-xl shadow-3xl border-b-[8px] transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden ${isVisualPremium ? 'bg-orange-600 border-orange-900 text-white shadow-orange-500/30' : 'bg-blue-600 border-blue-900 text-white shadow-blue-500/30'} active:scale-95 active:border-b-0 active:translate-y-2`}
              >
                <div className="flex items-center gap-3 relative z-10">
                   {isProcessing ? <Loader2 className="animate-spin" size={28} /> : <Pickaxe size={28} className="group-hover:rotate-45 transition-transform" />}
                   <span className="uppercase tracking-widest">START REACTOR</span>
                </div>
              </button>
            </div>
         )}
      </div>

      <div className="bg-white dark:bg-gray-900 p-5 rounded-[32px] border border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-lg relative z-10">
         <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <ShieldCheck size={24} />
         </div>
         <div className="space-y-0.5">
            <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Earning Protocol</h4>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-none tracking-widest">
              Secured & Verified STK Network Node
            </p>
         </div>
      </div>
    </div>
  );
};

export default Mining;
