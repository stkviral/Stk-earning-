
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

const TransactionItem: React.FC<{ tx: Transaction; onCancel?: (txId: string) => void }> = ({ tx, onCancel }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const isWithdraw = tx.type === 'WITHDRAW' || (tx.type === 'ADJUST' && tx.amount < 0);
  const isCompleted = tx.status === 'COMPLETED';
  const isPending = tx.status === 'PENDING';
  const isRejected = tx.status === 'REJECTED';
  const displayAmount = Math.abs(tx.amount);

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
              ? (isRejected ? 'bg-red-50 text-red-500 dark:bg-red-500/20 dark:text-red-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400') 
              : 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
          } ${showDetails ? 'scale-110 rotate-6' : 'group-hover:scale-105'}`}>
            {isWithdraw ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
          </div>
          <div>
            <p className="text-[13px] font-black text-gray-900 dark:text-white uppercase italic tracking-tight leading-none truncate max-w-[140px]">
              {tx.method}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${
                isCompleted ? 'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30' : 
                isRejected ? 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' :
                'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30'
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
          <span className={`text-lg font-black tracking-tighter tabular-nums ${isWithdraw ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {isWithdraw ? '-' : '+'} {displayAmount.toLocaleString()}
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
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter italic">₹{(displayAmount * COIN_TO_INR_RATE).toFixed(2)}</p>
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
                       <span className="text-[8px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Secured</span>
                    </div>
                 </div>

                 {isWithdraw && !isRejected && (
                   <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Payout Timeline</span>
                        <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest italic">Est. 48h</span>
                     </div>
                     <div className="flex items-center gap-2">
                        {progressSteps.map((step, i) => (
                          <React.Fragment key={i}>
                            <div className="flex flex-col items-center gap-1 flex-1">
                              <div className={`w-full h-1 rounded-full transition-all duration-1000 ${step.done ? 'bg-green-500' : (step.active ? 'bg-blue-500 animate-pulse' : 'bg-gray-200 dark:bg-gray-800')}`} />
                              <div className="flex justify-between w-full px-0.5">
                                <span className={`text-[5px] font-black uppercase ${step.done ? 'text-green-600 dark:text-green-400' : (step.active ? 'text-blue-500' : 'text-gray-400')}`}>{step.label}</span>
                                <span className="text-[5px] font-bold text-gray-400 opacity-50">{step.time}</span>
                              </div>
                            </div>
                            {i < progressSteps.length - 1 && <div className="w-0.5 h-0.5 rounded-full bg-gray-200 dark:bg-gray-800 mt-[-6px]" />}
                          </React.Fragment>
                        ))}
                     </div>
                   </div>
                 )}

                 {isWithdraw && isPending && onCancel && (
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       if (window.confirm("Are you sure you want to cancel this withdrawal?")) {
                         onCancel(tx.id);
                       }
                     }}
                     className="mt-2 w-full py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                   >
                     Cancel Withdrawal
                   </button>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

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

const Wallet: React.FC = () => {
  const { state, withdraw, cancelWithdrawal, setActiveTab, updateUser } = useApp();
  const { currentUser, settings } = state;
  const [upiId, setUpiId] = useState(currentUser?.upiId || '');
  const [withdrawAmount, setWithdrawAmount] = useState<number | string>(500);
  const [filter, setFilter] = useState<TransactionFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpiValid, setIsUpiValid] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  const ITEMS_PER_PAGE = 10;

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
  const feePercent = settings.withdrawalFeeNormal || 0;
  
  const numAmount = typeof withdrawAmount === 'string' ? parseInt(withdrawAmount) || 0 : withdrawAmount;
  const grossINR = numAmount * COIN_TO_INR_RATE;
  const feeINR = grossINR * (feePercent / 100);
  const netINR = isNaN(grossINR - feeINR) ? 0 : (grossINR - feeINR);

  const minThreshold = settings.minWithdrawalCoins || 5000;
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
        if (filter === 'EARN') return tx.type !== 'WITHDRAW' && tx.amount > 0;
        return tx.type === filter;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [currentUser.transactions, filter]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const handleFilterChange = (f: TransactionFilter) => {
    playSound('tap');
    setFilter(f);
    setCurrentPage(1);
  };

  return (
    <div className="p-4 space-y-6 pb-32 animate-in fade-in duration-500 bg-transparent min-h-full overflow-hidden transition-colors relative">
      <div className="flex justify-between items-center px-2 relative z-10">
         <div className="space-y-1">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic">Wallet Terminal</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">Wallet</h1>
         </div>
         <button 
           onClick={() => setActiveTab('faq')}
           className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 transition-all active:scale-90"
         >
           <PieChart size={20} />
         </button>
      </div>

      <div className="relative group">
        <div className="relative z-10 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[32px] shadow-xl overflow-hidden">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          
          <div className="relative z-20 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <p className="text-[9px] font-black text-blue-200 uppercase tracking-[0.5em] opacity-80">Total Balance</p>
                <div className="flex flex-col">
                  <motion.div animate={balanceControls} className="flex items-baseline gap-3">
                    <span className="text-5xl font-black tracking-tighter italic tabular-nums leading-none text-white">
                      {currentUser.coins.toLocaleString()}
                    </span>
                    <span className="text-sm font-black text-blue-200 italic">STK</span>
                  </motion.div>
                  <div className="flex items-center gap-3 mt-6">
                    <motion.div animate={balanceControls} className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2.5 shadow-inner">
                      <span className="text-[11px] font-black uppercase tracking-tighter tabular-nums text-green-300">₹{currentBalanceINR.toFixed(2)}</span>
                    </motion.div>
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-lg group-hover:rotate-12 transition-all duration-700 group-hover:scale-110">
                <Fingerprint size={32} className="text-blue-200" />
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-end px-1">
                <div className="flex items-center gap-2.5">
                   <Activity size={16} className="text-blue-300 animate-pulse" />
                   <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Network Threshold</p>
                </div>
                <p className={`text-[10px] font-black uppercase tracking-tighter italic ${progressToMin >= 100 ? 'text-green-300 animate-pulse' : 'text-blue-200'}`}>
                  {progressToMin >= 100 ? 'PAYOUT AUTH READY' : `${Math.floor(progressToMin)}% SYNCED`}
                </p>
              </div>
              <div className="h-4 bg-black/20 p-1.5 rounded-full border border-white/10 shadow-inner overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${
                    progressToMin >= 100 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.6)]' 
                      : 'bg-blue-400/50'
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

      <div className="bg-white dark:bg-gray-900 rounded-[48px] p-6 shadow-xl border border-gray-100 dark:border-gray-800 space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
           <Layers size={180} className="text-gray-900 dark:text-white" />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center shadow-sm transition-all duration-700 ${cooldownRemaining ? 'bg-orange-50 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'}`}>
              {cooldownRemaining ? <Clock size={32} className="animate-pulse" /> : <ArrowLeftRight size={32} />}
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">Withdrawal</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest ${cooldownRemaining ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {cooldownRemaining ? `Next Withdrawal in: ${cooldownRemaining}` : 'Transfer your earnings to UPI'}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
             <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Estimated Time</span>
             <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase italic">24 - 48 Hours</span>
          </div>
        </div>

        {/* Withdrawal Progress Roadmap */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/10 via-blue-500/30 to-blue-500/10 dark:from-blue-400/20 dark:via-blue-400/40 dark:to-blue-400/20" />
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                 <Activity size={12} className="text-blue-500 animate-pulse" />
                 <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Payout Roadmap</span>
              </div>
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic">Live Network Status</span>
           </div>
           <div className="flex items-center gap-4">
              {[
                { label: 'Request', time: 'Instant', icon: <Zap size={10} /> },
                { label: 'Audit', time: '1-2h', icon: <ShieldCheck size={10} /> },
                { label: 'Payout', time: '24-48h', icon: <ArrowUpRight size={10} /> }
              ].map((step, i) => (
                <div key={i} className="flex-1 space-y-2">
                   <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center shadow-sm">
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
              <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
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
                className={`w-full bg-gray-50 dark:bg-gray-800/50 border-2 p-5 rounded-[28px] text-base font-black text-gray-900 dark:text-white outline-none transition-all shadow-inner placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                  upiId ? (isUpiValid ? 'border-green-500/30 focus:border-green-500' : 'border-red-500/30 focus:border-red-500') : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                }`}
                disabled={!!cooldownRemaining}
                required
              />
              <div className="absolute right-7 top-1/2 -translate-y-1/2 transition-all">
                 {upiId ? (isUpiValid ? <Zap size={22} className="text-green-500 fill-current animate-pulse" /> : <AlertTriangle size={22} className="text-red-500" />) : <Globe size={22} className="text-gray-300 dark:text-gray-600" />}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
               <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Withdrawal Amount</label>
               <div className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <span className="text-[9px] font-black uppercase">Min Withdrawal: {minThreshold}</span>
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
                    ? 'bg-blue-500 text-white border-blue-600 shadow-xl scale-105' 
                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  } ${cooldownRemaining ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                >
                  {numAmount === val && <div className="absolute top-0 left-0 w-full h-1 bg-white/20 animate-shimmer-wave" />}
                  <span className="text-xl font-black tracking-tighter italic tabular-nums">{val}</span>
                  <span className="text-[8px] font-black uppercase opacity-80">₹{(val * COIN_TO_INR_RATE).toFixed(0)}</span>
                </button>
              ))}
            </div>

            <div className="relative group">
               <div className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <Coins size={22} />
               </div>
               <input 
                 type="number"
                 placeholder="Custom Amount..."
                 value={withdrawAmount}
                 onChange={(e) => setWithdrawAmount(e.target.value)}
                 disabled={!!cooldownRemaining}
                 className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 p-5 pl-16 rounded-[28px] text-base font-black text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all shadow-inner tabular-nums placeholder:text-gray-400 dark:placeholder:text-gray-500"
               />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[48px] border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm relative overflow-hidden">
             <div className="space-y-1 relative z-10">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] italic">Net Payout</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-sm font-black text-blue-500 italic">₹</span>
                   <span className="text-5xl font-black text-gray-900 dark:text-white italic tracking-tighter tabular-nums">{netINR.toFixed(2)}</span>
                </div>
             </div>
             <div className="text-right relative z-10 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Platform Fee</p>
                <p className="text-[11px] font-black uppercase tracking-tighter text-red-500">
                  -₹{feeINR.toFixed(1)}
                </p>
             </div>
          </div>

          <button 
            type="submit"
            disabled={currentUser.coins < numAmount || numAmount < minThreshold || !isUpiValid || !!cooldownRemaining}
            className={`w-full py-6 rounded-[32px] font-black text-xl shadow-xl transition-all border-b-[8px] uppercase tracking-widest flex items-center justify-center gap-5 group relative overflow-hidden ${
              currentUser.coins < numAmount || numAmount < minThreshold || !isUpiValid || !!cooldownRemaining
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed grayscale'
              : 'bg-blue-500 text-white border-blue-700 shadow-blue-500/30 active:scale-95 active:border-b-[4px] active:translate-y-2'
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
                <History className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">History Logs</h3>
           </div>
           <div className="flex gap-2 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              {(['ALL', 'EARN', 'WITHDRAW'] as TransactionFilter[]).map(f => (
                <button 
                  key={f} 
                  onClick={() => handleFilterChange(f)}
                  className={`text-[9px] font-black uppercase px-4 py-3 rounded-xl transition-all duration-500 ${filter === f ? 'bg-blue-500 text-white shadow-lg scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  {f === 'ALL' ? 'All' : f === 'EARN' ? 'Earn' : 'Payouts'}
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
                className="text-center py-20 bg-white dark:bg-gray-900 rounded-[48px] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center"
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
                className="text-center py-20 bg-white dark:bg-gray-900 rounded-[48px] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center opacity-60"
              >
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-[32px] flex items-center justify-center mb-5">
                  <PieChart size={40} className="text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-gray-500">Zero Node Activity</p>
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {paginatedTransactions.map((tx, index) => (
                  <TransactionItem 
                    key={tx.id} 
                    tx={tx} 
                    onCancel={(txId) => {
                      const error = cancelWithdrawal(txId);
                      if (error) alert(error);
                      else alert("Withdrawal cancelled successfully.");
                    }} 
                  />
                ))}
                
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 px-2">
                    <button 
                      onClick={() => { playSound('tap'); setCurrentPage(p => Math.max(1, p - 1)); }}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      Previous
                    </button>
                    <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => { playSound('tap'); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/80 dark:bg-black/80 backdrop-blur-[10px] animate-in fade-in duration-500">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[64px] p-10 shadow-2xl space-y-10 animate-in zoom-in-95 duration-500 relative overflow-hidden border border-gray-100 dark:border-gray-800 border-b-[24px] border-b-blue-500">
            <div className="text-center space-y-5">
              <div className="w-28 h-28 bg-blue-500 text-white rounded-[44px] flex items-center justify-center mx-auto relative group shadow-xl shadow-blue-500/30">
                 <div className="absolute inset-0 bg-blue-400 rounded-[44px] animate-ping scale-110 opacity-20" />
                 <ShieldCheck size={64} className="relative z-10 group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Confirm</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest px-8 mt-2 leading-relaxed">
                  Confirm your withdrawal request?
                </p>
              </div>
            </div>

            <div className="space-y-8 bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[56px] border border-gray-100 dark:border-gray-800 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
                 <Scan size={120} className="text-gray-900 dark:text-white" />
              </div>
              
              <div className="space-y-5 border-b-2 border-dashed border-gray-200 dark:border-gray-700 pb-8">
                <div className="flex justify-between items-center px-1">
                   <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">STK Coins Deducted</p>
                   <p className="text-lg font-black text-blue-500 tracking-tight tabular-nums">{numAmount.toLocaleString()} STK</p>
                </div>

                <div className="flex justify-between items-center px-1">
                   <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Gross Cash Value</p>
                   <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight tabular-nums">₹{grossINR.toFixed(2)}</p>
                </div>
                
                <div className="flex justify-between items-center px-1">
                   <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Platform Fee</p>
                   </div>
                   <p className="text-lg font-black text-red-500 tracking-tight tabular-nums">
                     -₹{feeINR.toFixed(2)}
                   </p>
                </div>
              </div>

              <div className="pt-2 px-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">Net Transfer Amount</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black text-blue-500 italic">₹</span>
                  <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter italic tabular-nums leading-none">
                    {netINR.toFixed(2).split('.')[0]}<span className="text-2xl opacity-40">.{netINR.toFixed(2).split('.')[1]}</span>
                  </span>
                </div>
              </div>

              <div className="mt-8 p-6 bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 flex items-center gap-5 shadow-sm">
                 <div className="w-14 h-14 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30">
                    <Hash size={28} />
                 </div>
                 <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Destination Protocol</p>
                    <p className="text-[13px] font-black text-gray-900 dark:text-white truncate uppercase italic tracking-tighter">{upiId}</p>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleFinalConfirm}
                disabled={isProcessing}
                className={`w-full py-8 rounded-[40px] font-black text-2xl shadow-xl transition-all border-b-[12px] border-blue-700 uppercase tracking-widest flex items-center justify-center gap-5 group relative overflow-hidden ${isProcessing ? 'bg-blue-400' : 'bg-blue-500 text-white active:scale-95 active:border-b-[4px] active:translate-y-2'}`}
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
                  className="w-full py-5 text-gray-400 dark:text-gray-500 hover:text-red-500 font-black text-[11px] uppercase tracking-[0.5em] transition-colors flex items-center justify-center gap-2"
                >
                  <X size={16} /> Abort Session
                </button>
              )}
            </div>
            
            <div className="flex flex-col items-center gap-5 pt-6 border-t border-gray-100 dark:border-gray-800">
               <div className="flex items-center gap-2.5 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                  <ShieldCheck size={18} className="text-gray-900 dark:text-white" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">STK Payout Guard v2.4</p>
               </div>
               <div className="w-full h-10 flex gap-[2px] items-center opacity-[0.05] dark:opacity-[0.1] px-6">
                  {[...Array(60)].map((_, i) => (
                    <div key={i} className="bg-gray-900 dark:bg-white flex-1 rounded-full" style={{ height: `${20 + Math.random() * 80}%` }} />
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
      {/* App Version */}
      <div className="pt-10 pb-4 text-center">
        <p className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.5em] cursor-default select-none">
          STK Network v{settings.appVersion}
        </p>
      </div>
    </div>
  );
};

export default Wallet;
