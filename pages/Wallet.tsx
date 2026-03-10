import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { useApp } from '../App';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  History,
  Activity,
  Coins,
  Loader2,
  Lock,
  Zap,
  Globe,
  ShieldAlert,
  PieChart,
  AlertTriangle,
  Hash
} from 'lucide-react';
import { COIN_TO_INR_RATE, Transaction } from '../types';
import { playSound } from '../audioUtils';

type TransactionFilter = 'ALL' | 'EARN' | 'WITHDRAW';

const TechGrid: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f61a_1px,transparent_1px),linear-gradient(to_bottom,#3b82f61a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
  </div>
);

const FloatingParticle: React.FC<{ index: number }> = ({ index }) => {
  const style = useMemo(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${10 + Math.random() * 10}s`,
  }), [index]);

  return (
    <div className="absolute w-1.5 h-1.5 bg-blue-400/40 rounded-full animate-float-particle pointer-events-none z-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]" style={style} />
  );
};

const TransactionItem: React.FC<{ tx: Transaction; onCancel?: (txId: string) => void }> = ({ tx, onCancel }) => {
  const [showDetails, setShowDetails] = useState(false);

  const isWithdraw = tx.type === 'WITHDRAW' || (tx.type === 'ADJUST' && tx.amount < 0);
  const isCompleted = tx.status === 'COMPLETED';
  const isPending = tx.status === 'PENDING';
  const isRejected = tx.status === 'REJECTED';
  const displayAmount = Math.abs(tx.amount);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => { playSound('tap'); setShowDetails(!showDetails); }}
      className={`bg-gray-900/60 border rounded-2xl p-4 backdrop-blur-md transition-all duration-300 group cursor-pointer ${
        showDetails ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-gray-800/60 hover:border-blue-500/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform ${
            isWithdraw 
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-orange-500/10 group-hover:shadow-orange-500/20' 
              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-blue-500/10 group-hover:shadow-blue-500/20'
          } ${showDetails ? 'scale-110' : ''}`}>
            {isWithdraw ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-100 tracking-wide">{tx.method}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                isCompleted ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                isRejected ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
                {tx.status}
              </span>
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <Clock size={10} />
                {new Date(tx.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-base font-black tracking-tight ${isWithdraw ? 'text-orange-400' : 'text-blue-400'}`}>
            {isWithdraw ? '-' : '+'}{displayAmount}
          </p>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">STK Coins</p>
        </div>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-gray-800/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Transaction ID</span>
                <span className="text-[10px] text-gray-300 font-mono">{tx.id}</span>
              </div>
              {isWithdraw && (
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Cash Value</span>
                  <span className="text-[10px] text-blue-400 font-bold">₹{(displayAmount * COIN_TO_INR_RATE).toFixed(2)}</span>
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
                  className="w-full mt-2 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors"
                >
                  Cancel Withdrawal
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Wallet: React.FC = () => {
  const { state, withdraw, cancelWithdrawal, setActiveTab, updateUser } = useApp();
  const { currentUser, settings } = state;
  const [upiId, setUpiId] = useState(currentUser?.upiId || '');
  const [withdrawAmount, setWithdrawAmount] = useState<number | string>(500);
  const [filter, setFilter] = useState<TransactionFilter>('ALL');
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpiValid, setIsUpiValid] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null);

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

  useEffect(() => {
    if (currentUser) {
      updateUser({});
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
  const minThreshold = settings.minWithdrawalCoins || 1000;
  const maxThreshold = 5000; // ₹50 maximum withdrawal
  const progressToMin = Math.min(100, (currentUser.coins / minThreshold) * 100);

  const numAmount = typeof withdrawAmount === 'string' ? parseInt(withdrawAmount) || 0 : withdrawAmount;
  const grossINR = numAmount * COIN_TO_INR_RATE;
  const feePercent = settings.withdrawalFeeNormal || 0;
  const feeINR = grossINR * (feePercent / 100);
  const netINR = isNaN(grossINR - feeINR) ? 0 : (grossINR - feeINR);

  const handleWithdrawInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUpiValid || cooldownRemaining || numAmount < minThreshold || numAmount > maxThreshold || currentUser.coins < numAmount) return;
    
    setIsProcessing(true);
    playSound('ignite');
    await new Promise(resolve => setTimeout(resolve, 1500));
    const error = withdraw(upiId, numAmount);
    if (error) {
      alert(error);
    } else {
      // Save the UPI ID to the user's profile for future use
      if (currentUser.upiId !== upiId) {
        updateUser({ upiId });
      }
      playSound('collect');
      setShowWithdrawForm(false);
      setWithdrawAmount(500);
    }
    setIsProcessing(false);
  };

  const filteredTransactions = useMemo(() => {
    return [...(currentUser.transactions || [])]
      .filter(tx => {
        if (filter === 'ALL') return true;
        if (filter === 'EARN') return tx.type !== 'WITHDRAW' && tx.amount > 0;
        return tx.type === filter;
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 15); // Show only recent 15 for cleaner UI
  }, [currentUser.transactions, filter]);

  return (
    <div className="min-h-full bg-[#050b14] text-white p-4 font-sans relative overflow-hidden pb-32">
      <TechGrid />
      {[...Array(15)].map((_, i) => <FloatingParticle key={i} index={i} />)}

      {/* Top Section: Glowing Wallet Card */}
      <div className="relative z-10 mt-2">
        <div className="bg-gradient-to-b from-blue-900/40 to-indigo-950/40 border border-blue-500/30 rounded-[32px] p-8 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative overflow-hidden backdrop-blur-xl">
          {/* Neon Glows */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/30 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/20 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-blue-400 animate-pulse" />
              <p className="text-blue-300 text-[10px] font-black tracking-[0.3em] uppercase">Total Balance</p>
            </div>
            
            <motion.div animate={balanceControls} className="flex items-baseline justify-center gap-2 mb-1">
              <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                {currentUser.coins.toLocaleString()}
              </h1>
            </motion.div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-8 shadow-inner">
              <p className="text-blue-200 text-xs font-bold tracking-wide">≈ ₹{currentBalanceINR.toFixed(2)}</p>
            </div>

            <button 
              onClick={() => { playSound('tap'); setShowWithdrawForm(true); }}
              className="w-full max-w-[240px] bg-gradient-to-r from-blue-600 to-blue-400 text-white font-black text-lg py-4 px-8 rounded-full shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:shadow-[0_0_35px_rgba(59,130,246,0.8)] transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <ArrowUpRight size={22} />
              Withdraw
            </button>

            <div className="mt-5 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-blue-200/60 uppercase tracking-widest">Minimum Withdrawal: ₹10</span>
              <span className="text-[10px] font-bold text-blue-200/60 uppercase tracking-widest">Maximum Withdrawal: ₹50</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="relative z-10 mt-6 bg-gray-900/40 border border-gray-800/60 rounded-[24px] p-6 backdrop-blur-md shadow-lg">
        <div className="flex justify-between items-end mb-3">
          <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-orange-400" />
            Withdrawal Progress
          </h3>
          <span className="text-xs font-black text-orange-400">{Math.floor(progressToMin)}%</span>
        </div>
        <div className="h-2.5 bg-gray-950 rounded-full overflow-hidden mb-3 shadow-inner border border-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.8)] rounded-full relative transition-all duration-1000"
            style={{ width: `${Math.min(100, progressToMin)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">
          {progressToMin >= 100 ? "Balance ready for withdrawal" : `Need ${minThreshold - currentUser.coins} more STK to withdraw`}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 mt-6 flex justify-center gap-10">
        <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => { playSound('tap'); setShowWithdrawForm(true); }}>
          <div className="w-16 h-16 rounded-full bg-blue-900/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] group-hover:scale-105 transition-all backdrop-blur-sm">
            <ArrowUpRight size={28} />
          </div>
          <span className="text-[10px] text-blue-200 font-black uppercase tracking-widest">Withdraw</span>
        </div>
        <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => { playSound('tap'); document.getElementById('recent-activity')?.scrollIntoView({ behavior: 'smooth' }); }}>
          <div className="w-16 h-16 rounded-full bg-orange-900/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)] group-hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-all backdrop-blur-sm">
            <History size={28} />
          </div>
          <span className="text-[10px] text-orange-200 font-black uppercase tracking-widest">History</span>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div id="recent-activity" className="relative z-10 mt-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Activity size={16} className="text-blue-400" />
            Recent Activity
          </h3>
          <div className="flex gap-2">
            {(['ALL', 'EARN', 'WITHDRAW'] as TransactionFilter[]).map(f => (
              <button 
                key={f} 
                onClick={() => { playSound('tap'); setFilter(f); }}
                className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                  filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 border border-transparent hover:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/40 border border-gray-800/60 rounded-2xl backdrop-blur-sm">
              <PieChart size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No recent activity</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <TransactionItem 
                key={tx.id} 
                tx={tx} 
                onCancel={(txId) => {
                  const error = cancelWithdrawal(txId);
                  if (error) alert(error);
                  else alert("Withdrawal cancelled successfully.");
                }} 
              />
            ))
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 sm:p-0"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#0a0f1a] border border-blue-500/30 rounded-[40px] w-full max-w-md p-8 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600" />
              
              <button 
                onClick={() => setShowWithdrawForm(false)} 
                className="absolute top-6 right-6 w-8 h-8 bg-gray-800/50 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
              
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-8">Withdraw Funds</h2>
              
              <form onSubmit={handleWithdrawInitiate} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={12} /> Target UPI ID
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="handle@bank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                      className={`w-full bg-gray-900/80 border-2 p-4 rounded-2xl text-sm font-black text-white outline-none transition-all placeholder:text-gray-600 ${
                        upiId ? (isUpiValid ? 'border-green-500/50 focus:border-green-400' : 'border-red-500/50 focus:border-red-400') : 'border-gray-800 focus:border-blue-500/50'
                      }`}
                      disabled={!!cooldownRemaining}
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                       {upiId ? (isUpiValid ? <CheckCircle2 size={20} className="text-green-500" /> : <AlertTriangle size={20} className="text-red-500" />) : <Globe size={20} className="text-gray-600" />}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                     <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Amount (STK)</label>
                     <span className="text-[9px] font-bold text-gray-500 uppercase">Min: {minThreshold} | Max: {maxThreshold}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[1000, 2500, 5000].map(val => (
                      <button
                        key={val}
                        type="button"
                        disabled={!!cooldownRemaining}
                        onClick={() => { playSound('tap'); setWithdrawAmount(val); }}
                        className={`py-4 rounded-2xl transition-all border-2 flex flex-col items-center justify-center gap-1 ${
                          numAmount === val 
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                          : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <span className="text-lg font-black tracking-tighter">{val}</span>
                        <span className="text-[8px] font-bold uppercase opacity-70">₹{(val * COIN_TO_INR_RATE).toFixed(0)}</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative mt-3">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <Coins size={18} />
                     </div>
                     <input 
                       type="number"
                       placeholder="Custom Amount"
                       value={withdrawAmount}
                       onChange={(e) => setWithdrawAmount(e.target.value)}
                       disabled={!!cooldownRemaining}
                       className="w-full bg-gray-900/80 border-2 border-gray-800 p-4 pl-12 rounded-2xl text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600"
                     />
                  </div>
                </div>

                <div className="bg-gray-900/80 p-5 rounded-2xl border border-gray-800 flex items-center justify-between">
                   <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Net Payout</p>
                      <div className="flex items-baseline gap-1">
                         <span className="text-xs font-black text-blue-400">₹</span>
                         <span className="text-2xl font-black text-white tracking-tighter">{netINR.toFixed(2)}</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Fee ({feePercent}%)</p>
                      <p className="text-[11px] font-black text-red-400">-₹{feeINR.toFixed(2)}</p>
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={currentUser.coins < numAmount || numAmount < minThreshold || numAmount > maxThreshold || !isUpiValid || !!cooldownRemaining || isProcessing}
                  className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                    currentUser.coins < numAmount || numAmount < minThreshold || numAmount > maxThreshold || !isUpiValid || !!cooldownRemaining
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:bg-blue-500 active:scale-95'
                  }`}
                >
                  {isProcessing ? (
                     <Loader2 className="animate-spin" size={24} />
                  ) : cooldownRemaining ? (
                     <><Lock size={20} /> Cooldown</>
                  ) : (
                     <><Zap size={20} /> Confirm Transfer</>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wallet;
