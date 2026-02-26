
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { useApp } from '../App';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Crown, 
  Calendar,
  Hash,
  Sparkles,
  History,
  Activity,
  ArrowLeftRight,
  Coins,
  Loader2,
  Lock,
  Scan,
  Cpu,
  Fingerprint,
  Zap,
  Globe,
  ShieldAlert,
  Terminal,
  Layers,
  PieChart,
  Network,
  AlertTriangle
} from 'lucide-react';
import { MIN_WITHDRAWAL_COINS, COIN_TO_INR_RATE, UserTag, Transaction } from '../types';
import { playSound } from '../audioUtils';

type TransactionFilter = 'ALL' | 'EARN' | 'WITHDRAW';

const TransactionItem: React.FC<{ tx: Transaction }> = ({ tx }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const isWithdraw = tx.type === 'WITHDRAW';
  const isCompleted = tx.status === 'COMPLETED';
  const isPending = tx.status === 'PENDING';
  const isRejected = tx.status === 'REJECTED';

  const progressSteps = [
    { label: 'Submitted', done: true, time: 'Instant' },
    { label: 'Verifying', done: isCompleted || isRejected, active: isPending, time: '1-2h' },
    { label: 'Payout', done: isCompleted, active: false, time: '2-24h' }
  ];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => { playSound('tap'); setShowDetails(!showDetails); }}
      className={`group relative overflow-hidden bg-white dark:bg-gray-900 rounded-[28px] border transition-all duration-500 cursor-pointer ${
        showDetails ? 'border-blue-400 dark:border-blue-500/50 shadow-xl ring-1 ring-blue-100 dark:ring-blue-900/20' : 'border-gray-100 dark:border-gray-800 shadow-sm hover:border-gray-200 dark:hover:border-gray-700'
      }`}
    >
      <div className="p-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            isWithdraw 
              ? (isRejected ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20') 
              : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
          } ${showDetails ? 'scale-110 rotate-6' : 'group-hover:scale-105'}`}>
            {isWithdraw ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
          </div>
          <div>
            <p className="text-[13px] font-black text-gray-900 dark:text-white uppercase italic tracking-tight leading-none truncate max-w-[140px]">
              {tx.method}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${
                isCompleted ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
                isRejected ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                'bg-orange-500/10 text-orange-600 border-orange-500/20'
              }`}>
                {tx.status}
              </span>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Clock size={8} />
                {new Date(tx.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg font-black tracking-tighter tabular-nums ${isWithdraw ? 'text-red-600' : 'text-green-600'}`}>
            {isWithdraw ? '-' : '+'} {tx.amount.toLocaleString()}
          </span>
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">STK Coins</p>
        </div>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 space-y-4">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-100 dark:via-gray-800 to-transparent" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction ID</p>
                  <p className="text-[9px] font-mono font-bold text-gray-600 dark:text-gray-300 break-all bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800">{tx.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.2em]">Cash Value</p>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter italic">₹{(tx.amount * COIN_TO_INR_RATE).toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-2xl flex flex-col gap-3 border border-blue-100/50 dark:border-blue-800/30">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={14} className="text-blue-500" />
                       <span className="text-[8px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">Network Verified</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Secured</span>
                    </div>
                 </div>

                 {isWithdraw && !isRejected && (
                   <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Payout Timeline</span>
                        <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest italic">Est. 24h</span>
                     </div>
                     <div className="flex items-center gap-2">
                        {progressSteps.map((step, i) => (
                          <React.Fragment key={i}>
                            <div className="flex flex-col items-center gap-1 flex-1">
                              <div className={`w-full h-1 rounded-full transition-all duration-1000 ${step.done ? 'bg-green-500' : (step.active ? 'bg-blue-500 animate-pulse' : 'bg-gray-200 dark:bg-gray-800')}`} />
                              <div className="flex justify-between w-full px-0.5">
                                <span className={`text-[5px] font-black uppercase ${step.done ? 'text-green-600' : (step.active ? 'text-blue-500' : 'text-gray-400')}`}>{step.label}</span>
                                <span className="text-[5px] font-bold text-gray-400 opacity-50">{step.time}</span>
                              </div>
                            </div>
                            {i < progressSteps.length - 1 && <div className="w-0.5 h-0.5 rounded-full bg-gray-200 dark:bg-gray-800 mt-[-6px]" />}
                          </React.Fragment>
                        ))}
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Wallet: React.FC = () => {
  const { state, withdraw, setActiveTab, updateUser } = useApp();
  const { currentUser, settings } = state;
  const [upiId, setUpiId] = useState(currentUser?.upiId || '');
  const [withdrawAmount, setWithdrawAmount] = useState<number | string>(500);
  const [filter, setFilter] = useState<TransactionFilter>('ALL');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpiValid, setIsUpiValid] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  const balanceControls = useAnimation();
  const prevCoins = useRef(currentUser?.coins);

  useEffect(() => {
    if (currentUser && prevCoins.current !== undefined && currentUser.coins !== prevCoins.current) {
      const isIncrease = currentUser.coins > prevCoins.current;
      balanceControls.start({
        scale: [1, 1.05, 1],
        color: isIncrease ? ['#ffffff', '#4ade80', '#ffffff'] : ['#ffffff', '#f87171', '#ffffff'],
        transition: { duration: 0.5 }
      });
      prevCoins.current = currentUser.coins;
    } else if (currentUser && prevCoins.current === undefined) {
      prevCoins.current = currentUser.coins;
    }
  }, [currentUser?.coins, balanceControls]);

  // Ensure user data is synced/fetched immediately upon component mount
  useEffect(() => {
    if (currentUser) {
      // Trigger a state sync to ensure we have the most up-to-date transaction data
      updateUser({});
      // Simulate network delay for fetching transactions
      const timer = setTimeout(() => {
        setIsLoadingTransactions(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const upiRegex = /^[\w\.-]+@[\w\.-]+$/;
    setIsUpiValid(upiRegex.test(upiId));
  }, [upiId]);

  useEffect(() => {
    if (!currentUser?.lastWithdrawalTimestamp) return;
    const interval = setInterval(() => {
      const cooldownMs = (settings.withdrawalCooldownHours || 24) * 60 * 60 * 1000;
      const nextAllowed = (currentUser.lastWithdrawalTimestamp || 0) + cooldownMs;
      const remaining = nextAllowed - Date.now();
      if (remaining <= 0) {
        setCooldownRemaining(null);
        clearInterval(interval);
      } else {
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        setCooldownRemaining(`${h}h ${m}m`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentUser?.lastWithdrawalTimestamp, settings.withdrawalCooldownHours]);

  if (!currentUser) return null;

  const currentBalanceINR = currentUser.coins * COIN_TO_INR_RATE;
  const isPass = currentUser.tag === UserTag.PASS;
  const feePercent = isPass ? 0 : settings.withdrawalFeeNormal;
  
  const numAmount = typeof withdrawAmount === 'string' ? parseInt(withdrawAmount) || 0 : withdrawAmount;
  const grossINR = numAmount * COIN_TO_INR_RATE;
  const feeINR = grossINR * (feePercent / 100);
  const netINR = grossINR - feeINR;

  const minThreshold = settings.minWithdrawalCoins || MIN_WITHDRAWAL_COINS;
  const progressToMin = Math.min(100, (currentUser.coins / minThreshold) * 100);

  const handleWithdrawInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUpiValid || cooldownRemaining || numAmount < minThreshold || currentUser.coins < numAmount) return;
    playSound('tap');
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = async () => {
    setIsProcessing(true);
    playSound('ignite');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const error = withdraw(upiId, numAmount);
    if (error) {
      alert(error);
    } else {
      playSound('collect');
      setShowConfirmModal(false);
      setWithdrawAmount(500);
    }
    setIsProcessing(false);
  };

  const filteredTransactions = useMemo(() => {
    return [...currentUser.transactions]
      .filter(tx => {
        if (filter === 'ALL') return true;
        return tx.type === filter;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [currentUser.transactions, filter]);

  return (
    <div className="p-4 space-y-6 pb-32 animate-in fade-in duration-1000 bg-gray-50 dark:bg-gray-950 min-h-full overflow-hidden transition-colors">
      
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-blue-600/10 dark:from-blue-600/20 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse-slow pointer-events-none" />

      <div className="flex justify-between items-center px-2 relative z-10">
         <div className="space-y-1">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] italic">Wallet Terminal</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">Wallet</h1>
         </div>
         <button 
           onClick={() => setActiveTab('faq')}
           className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-800 text-gray-400 transition-all active:scale-90"
         >
           <PieChart size={20} />
         </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-blue-600 rounded-[32px] blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />
        <div className="relative z-10 bg-gray-950 dark:bg-black p-6 rounded-[32px] border border-white/10 shadow-3xl overflow-hidden">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full animate-pulse" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-20 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <p className="text-[9px] font-black text-blue-300 uppercase tracking-[0.5em] opacity-60">Total Balance</p>
                <div className="flex flex-col">
                  <motion.div animate={balanceControls} className="flex items-baseline gap-3">
                    <span className="text-sm font-black text-blue-400 italic">₹</span>
                    <span className="text-5xl font-black tracking-tighter italic tabular-nums leading-none">
                      {currentBalanceINR.toFixed(0)}<span className="text-2xl opacity-30">.{currentBalanceINR.toFixed(2).split('.')[1]}</span>
                    </span>
                  </motion.div>
                  <div className="flex items-center gap-3 mt-6">
                    <motion.div animate={balanceControls} className="bg-white/5 backdrop-blur-2xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2.5 shadow-inner">
                      <Coins size={14} className="text-yellow-400" />
                      <span className="text-[11px] font-black uppercase tracking-tighter tabular-nums">{currentUser.coins.toLocaleString()} COINS</span>
                    </motion.div>
                    {isPass && (
                      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-blue-950 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl shadow-yellow-500/20 animate-in zoom-in-50 duration-500">
                         <Crown size={12} fill="currentColor" />
                         <span className="text-[9px] font-black uppercase italic">Elite Tier</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/5 backdrop-blur-3xl rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl group-hover:rotate-12 transition-all duration-700 group-hover:scale-110">
                <Fingerprint size={32} className="text-blue-400 opacity-60" />
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-end px-1">
                <div className="flex items-center gap-2.5">
                   <Activity size={16} className="text-blue-500 animate-pulse" />
                   <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Network Threshold</p>
                </div>
                <p className={`text-[10px] font-black uppercase tracking-tighter italic ${progressToMin >= 100 ? 'text-blue-400 animate-pulse' : 'text-gray-500'}`}>
                  {progressToMin >= 100 ? 'PAYOUT AUTH READY' : `${Math.floor(progressToMin)}% SYNCED`}
                </p>
              </div>
              <div className="h-4 bg-black/60 p-1.5 rounded-full border border-white/5 shadow-inner overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${
                    progressToMin >= 100 
                      ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]' 
                      : 'bg-blue-600/30'
                  }`}
                  style={{ width: `${progressToMin}%` }}
                >
                   <div className="absolute inset-0 animate-shimmer-wave bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[48px] p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
           <Layers size={180} />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center shadow-lg transition-all duration-700 ${cooldownRemaining ? 'bg-orange-500/10 text-orange-600' : 'bg-blue-600 text-white shadow-blue-500/30'}`}>
              {cooldownRemaining ? <Clock size={32} className="animate-pulse" /> : <ArrowLeftRight size={32} />}
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">Withdrawal</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest ${cooldownRemaining ? 'text-orange-500' : 'text-gray-400'}`}>
                {cooldownRemaining ? `Next Withdrawal in: ${cooldownRemaining}` : 'Transfer your earnings to UPI'}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
             <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Estimated Time</span>
             <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase italic">2 - 24 Hours</span>
          </div>
        </div>

        {/* Withdrawal Progress Roadmap */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/20 via-blue-600/40 to-blue-600/20" />
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                 <Activity size={12} className="text-blue-500 animate-pulse" />
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Payout Roadmap</span>
              </div>
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest italic">Live Network Status</span>
           </div>
           <div className="flex items-center gap-4">
              {[
                { label: 'Request', time: 'Instant', icon: <Zap size={10} /> },
                { label: 'Audit', time: '1-2h', icon: <ShieldCheck size={10} /> },
                { label: 'Payout', time: '2-24h', icon: <ArrowUpRight size={10} /> }
              ].map((step, i) => (
                <div key={i} className="flex-1 space-y-2">
                   <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                         {step.icon}
                      </div>
                      <div className="h-0.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500/30 w-full animate-shimmer-wave" />
                      </div>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{step.label}</span>
                      <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">{step.time}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <form onSubmit={handleWithdrawInitiate} className="space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Hash size={12} className="text-blue-500" /> Target Endpoint
              </label>
              {upiId && (
                <div className={`flex items-center gap-1.5 animate-in slide-in-from-right-2`}>
                   <span className={`text-[8px] font-black uppercase tracking-widest ${isUpiValid ? 'text-green-500' : 'text-red-500'}`}>
                     {isUpiValid ? 'SIGNAL SECURE' : 'INVALID FORMAT'}
                   </span>
                   {isUpiValid ? <CheckCircle2 size={14} className="text-green-500" /> : <ShieldAlert size={14} className="text-red-500" />}
                </div>
              )}
            </div>
            <div className="relative group">
              <input 
                type="text"
                placeholder="handle@bank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                className={`w-full bg-gray-50 dark:bg-gray-800 border-2 p-5 rounded-[28px] text-base font-black text-gray-900 dark:text-white outline-none transition-all shadow-inner placeholder:text-gray-300 dark:placeholder:text-gray-600 ${
                  upiId ? (isUpiValid ? 'border-green-100 dark:border-green-500/30 focus:border-green-500' : 'border-red-100 dark:border-red-500/30 focus:border-red-500') : 'border-gray-100 dark:border-gray-700 focus:border-blue-600'
                }`}
                disabled={!!cooldownRemaining}
                required
              />
              <div className="absolute right-7 top-1/2 -translate-y-1/2 transition-all">
                 {upiId ? (isUpiValid ? <Zap size={22} className="text-green-500 fill-current animate-pulse" /> : <AlertTriangle size={22} className="text-red-500" />) : <Globe size={22} className="text-gray-300" />}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
               <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Withdrawal Amount</label>
               <div className="bg-blue-50 dark:bg-blue-900/40 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800">
                  <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase">Min Withdrawal: {minThreshold}</span>
               </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {[500, 1000, 2500].map(val => (
                <button
                  key={val}
                  type="button"
                  disabled={!!cooldownRemaining}
                  onClick={() => { playSound('tap'); setWithdrawAmount(val); }}
                  className={`py-6 rounded-[28px] transition-all duration-500 border-2 flex flex-col items-center justify-center gap-1.5 active:scale-95 relative overflow-hidden ${
                    numAmount === val 
                    ? 'bg-blue-600 text-white border-blue-400 shadow-xl scale-105' 
                    : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-blue-200'
                  } ${cooldownRemaining ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                >
                  {numAmount === val && <div className="absolute top-0 left-0 w-full h-1 bg-white/20 animate-shimmer-wave" />}
                  <span className="text-xl font-black tracking-tighter italic tabular-nums">{val}</span>
                  <span className="text-[8px] font-black uppercase opacity-60">₹{(val * COIN_TO_INR_RATE).toFixed(0)}</span>
                </button>
              ))}
            </div>

            <div className="relative group">
               <div className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Coins size={22} />
               </div>
               <input 
                 type="number"
                 placeholder="Custom Amount..."
                 value={withdrawAmount}
                 onChange={(e) => setWithdrawAmount(e.target.value)}
                 disabled={!!cooldownRemaining}
                 className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 p-5 pl-16 rounded-[28px] text-base font-black text-gray-900 dark:text-white focus:border-blue-600 outline-none transition-all shadow-inner tabular-nums"
               />
            </div>
          </div>

          <div className="bg-gray-950 p-8 rounded-[48px] border border-white/5 flex items-center justify-between shadow-3xl relative overflow-hidden">
             <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-blue-600/10 blur-[50px] rounded-full pointer-events-none" />
             <div className="space-y-1 relative z-10">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] italic">Net Payout</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-sm font-black text-blue-500 italic">₹</span>
                   <span className="text-5xl font-black text-white italic tracking-tighter tabular-nums">{netINR.toFixed(2)}</span>
                </div>
             </div>
             <div className="text-right relative z-10 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Platform Fee</p>
                <p className={`text-[11px] font-black uppercase tracking-tighter ${isPass ? 'text-green-500' : 'text-red-500'}`}>
                  {isPass ? 'FREE' : `-₹${feeINR.toFixed(1)}`}
                </p>
             </div>
          </div>

          <button 
            type="submit"
            disabled={currentUser.coins < numAmount || numAmount < minThreshold || !isUpiValid || !!cooldownRemaining}
            className={`w-full py-6 rounded-[32px] font-black text-xl shadow-3xl transition-all border-b-[8px] uppercase tracking-widest flex items-center justify-center gap-5 group relative overflow-hidden ${
              currentUser.coins < numAmount || numAmount < minThreshold || !isUpiValid || !!cooldownRemaining
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-40 grayscale'
              : 'bg-blue-600 text-white border-blue-900 shadow-blue-500/30 active:scale-95 active:border-b-[4px] active:translate-y-2'
            }`}
          >
            {cooldownRemaining ? (
               <><Lock size={32} /> COOLDOWN ACTIVE</>
            ) : (
               <>
                <div className="p-2.5 bg-white/20 rounded-2xl group-hover:rotate-12 transition-transform duration-500">
                   <Zap size={28} fill="currentColor" />
                </div>
                WITHDRAW NOW
               </>
            )}
          </button>
        </form>
      </div>

      <div className="space-y-8 pt-6 relative z-10">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-[22px] flex items-center justify-center border border-gray-100 dark:border-gray-800 shadow-sm">
                <History className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">History Logs</h3>
           </div>
           <div className="flex gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              {(['ALL', 'WITHDRAW'] as TransactionFilter[]).map(f => (
                <button 
                  key={f} 
                  onClick={() => { playSound('tap'); setFilter(f); }}
                  className={`text-[9px] font-black uppercase px-5 py-3 rounded-xl transition-all duration-500 ${filter === f ? 'bg-blue-600 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                >
                  {f === 'ALL' ? 'Everything' : 'Payouts'}
                </button>
              ))}
           </div>
        </div>

        <motion.div 
          layout
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {isLoadingTransactions ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20 bg-white dark:bg-gray-900 rounded-[48px] border-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-[32px] flex items-center justify-center mb-5">
                  <Loader2 size={40} className="text-blue-500 animate-spin" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 animate-pulse">Syncing Ledger...</p>
              </motion.div>
            ) : filteredTransactions.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20 bg-white dark:bg-gray-900 rounded-[48px] border-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center opacity-40"
              >
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-[32px] flex items-center justify-center mb-5">
                  <PieChart size={40} className="text-gray-300 dark:text-gray-700" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Zero Node Activity</p>
              </motion.div>
            ) : (
              filteredTransactions.slice(0, 30).map((tx, index) => (
                <TransactionItem key={tx.id} tx={tx} />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-950/98 backdrop-blur-[30px] animate-in fade-in duration-500">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[64px] p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-10 animate-in zoom-in-95 duration-500 relative overflow-hidden border border-white/10 border-b-[24px] border-b-blue-600">
            <div className="text-center space-y-5">
              <div className="w-28 h-28 bg-blue-600 text-white rounded-[44px] flex items-center justify-center mx-auto relative group shadow-3xl shadow-blue-500/40">
                 <div className="absolute inset-0 bg-blue-500 rounded-[44px] animate-ping scale-110 opacity-20" />
                 <ShieldCheck size={64} className="relative z-10 group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Confirm</h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest px-8 mt-2 leading-relaxed opacity-80">
                  Confirm your withdrawal request?
                </p>
              </div>
            </div>

            <div className="space-y-8 bg-gray-50 dark:bg-gray-800/80 p-8 rounded-[56px] border border-gray-100 dark:border-gray-700 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                 <Scan size={120} />
              </div>
              
              <div className="space-y-5 border-b-2 border-dashed border-gray-200 dark:border-gray-700 pb-8">
                <div className="flex justify-between items-center px-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">STK Coins Deducted</p>
                   <p className="text-lg font-black text-blue-600 dark:text-blue-400 tracking-tight tabular-nums">{numAmount.toLocaleString()} STK</p>
                </div>

                <div className="flex justify-between items-center px-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Cash Value</p>
                   <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight tabular-nums">₹{grossINR.toFixed(2)}</p>
                </div>
                
                <div className="flex justify-between items-center px-1">
                   <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Fee</p>
                      {isPass && <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[8px] font-black px-2 py-0.5 rounded-lg border border-green-200 dark:border-green-800 uppercase">WAIVED</span>}
                   </div>
                   <p className={`text-lg font-black ${isPass ? 'text-green-500' : 'text-red-500'} tracking-tight tabular-nums`}>
                     {isPass ? '₹0.00' : `-₹${feeINR.toFixed(2)}`}
                   </p>
                </div>
              </div>

              <div className="pt-2 px-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest italic">Net Transfer Amount</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black text-blue-500 italic">₹</span>
                  <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter italic tabular-nums leading-none">
                    {netINR.toFixed(0)}<span className="text-2xl opacity-30">.{netINR.toFixed(2).split('.')[1]}</span>
                  </span>
                </div>
              </div>

              <div className="mt-8 p-6 bg-white dark:bg-gray-950 rounded-[32px] border border-gray-100 dark:border-gray-700/50 flex items-center gap-5">
                 <div className="w-14 h-14 bg-indigo-600/10 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                    <Hash size={28} />
                 </div>
                 <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Destination Protocol</p>
                    <p className="text-[13px] font-black text-gray-900 dark:text-white truncate uppercase italic tracking-tighter">{upiId}</p>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleFinalConfirm}
                disabled={isProcessing}
                className={`w-full py-8 rounded-[40px] font-black text-2xl shadow-3xl transition-all border-b-[12px] border-blue-900 uppercase tracking-widest flex items-center justify-center gap-5 group relative overflow-hidden ${isProcessing ? 'bg-blue-400' : 'bg-blue-600 text-white active:scale-95 active:border-b-[4px] active:translate-y-2'}`}
              >
                {isProcessing ? (
                   <Loader2 className="animate-spin" size={32} />
                ) : (
                  <>
                    <Zap size={32} fill="currentColor" className="group-hover:scale-110 transition-transform duration-700" />
                    CONFIRM
                  </>
                )}
              </button>
              
              {!isProcessing && (
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-5 text-gray-400 hover:text-red-500 font-black text-[11px] uppercase tracking-[0.5em] transition-colors flex items-center justify-center gap-2"
                >
                  <X size={16} /> Abort Session
                </button>
              )}
            </div>
            
            <div className="flex flex-col items-center gap-5 pt-6 border-t border-gray-100 dark:border-gray-800">
               <div className="flex items-center gap-2.5 opacity-30 grayscale group-hover:grayscale-0 transition-all">
                  <ShieldCheck size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest">STK Payout Guard v2.4</p>
               </div>
               <div className="w-full h-10 flex gap-[2px] items-center opacity-[0.07] px-6">
                  {[...Array(60)].map((_, i) => (
                    <div key={i} className="bg-gray-950 dark:bg-white flex-1 rounded-full" style={{ height: `${20 + Math.random() * 80}%` }} />
                  ))}
               </div>
            </div>
          </div>
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

export default Wallet;
