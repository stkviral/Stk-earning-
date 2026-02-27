import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { 
  Trophy, Medal, Star, Target, Zap, Crown, 
  TrendingUp, Award, Flame, Pickaxe, Disc, PlayCircle,
  Gift, ShieldCheck, Activity, Users
} from 'lucide-react';
import { User, COIN_TO_INR_RATE } from '../types';
import { playSound } from '../audioUtils';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'LEADERBOARD' | 'ACHIEVEMENTS';
type LeaderboardFilter = 'DAILY' | 'ALL_TIME';

const ACHIEVEMENTS = [
  { id: 'first_blood', title: 'First Blood', desc: 'Earn your first STK Coin.', icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10', requirement: 1, type: 'coins' },
  { id: 'miner_novice', title: 'Novice Miner', desc: 'Claim 5 mining rewards.', icon: Pickaxe, color: 'text-blue-500', bg: 'bg-blue-500/10', requirement: 5, type: 'mining' },
  { id: 'spinner_lucky', title: 'Lucky Spinner', desc: 'Spin the wheel 10 times.', icon: Disc, color: 'text-orange-500', bg: 'bg-orange-500/10', requirement: 10, type: 'spin' },
  { id: 'ad_watcher', title: 'Ad Watcher', desc: 'Watch 20 video ads.', icon: PlayCircle, color: 'text-purple-500', bg: 'bg-purple-500/10', requirement: 20, type: 'video' },
  { id: 'daily_streak', title: 'Daily Devotee', desc: 'Claim 7 daily bonuses.', icon: Gift, color: 'text-green-500', bg: 'bg-green-500/10', requirement: 7, type: 'daily' },
  { id: 'wealthy', title: 'Wealthy', desc: 'Accumulate 10,000 STK Coins.', icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/10', requirement: 10000, type: 'coins' },
];

const Leaderboard: React.FC = () => {
  const { state } = useApp();
  const { currentUser, allUsers } = state;
  const [activeTab, setActiveTab] = useState<Tab>('LEADERBOARD');
  const [leaderboardFilter, setLeaderboardFilter] = useState<LeaderboardFilter>('DAILY');

  const sortedUsers = useMemo(() => {
    return [...allUsers].sort((a, b) => {
      if (leaderboardFilter === 'DAILY') {
        return (b.dailyEarned || 0) - (a.dailyEarned || 0);
      }
      return b.coins - a.coins;
    }).slice(0, 50); // Top 50
  }, [allUsers, leaderboardFilter]);

  const userProgress = useMemo(() => {
    if (!currentUser) return {};
    
    let totalCoins = currentUser.coins; // We could sum EARN transactions, but current balance is fine for 'wealthy'
    let miningCount = 0;
    let spinCount = 0;
    let videoCount = 0;
    let dailyCount = 0;

    currentUser.transactions.forEach(tx => {
      if (tx.type === 'EARN') {
        if (tx.method === 'Mining Reward') miningCount++;
        if (tx.method === 'Lucky Spin') spinCount++;
        if (tx.method === 'Video Watch') videoCount++;
        if (tx.method === 'Daily Bonus') dailyCount++;
      }
    });

    return {
      coins: totalCoins,
      mining: miningCount,
      spin: spinCount,
      video: videoCount,
      daily: dailyCount
    };
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <div className="p-4 space-y-6 pb-32 animate-in fade-in duration-1000 bg-gray-50 dark:bg-gray-950 min-h-full overflow-hidden transition-colors">
      
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-purple-600/10 dark:from-purple-600/20 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] bg-pink-500/10 blur-[150px] rounded-full animate-pulse-slow pointer-events-none" />

      <div className="flex justify-between items-center px-2 relative z-10">
         <div className="space-y-1">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
               <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.4em] italic">Game Center</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">Rankings</h1>
         </div>
         <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-800 text-purple-500 transition-all">
           <Trophy size={20} />
         </div>
      </div>

      <div className="flex gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative z-10">
        <button 
          onClick={() => { playSound('tap'); setActiveTab('LEADERBOARD'); }}
          className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase px-4 py-3 rounded-xl transition-all duration-500 ${activeTab === 'LEADERBOARD' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
        >
          <Users size={14} /> Leaderboard
        </button>
        <button 
          onClick={() => { playSound('tap'); setActiveTab('ACHIEVEMENTS'); }}
          className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase px-4 py-3 rounded-xl transition-all duration-500 ${activeTab === 'ACHIEVEMENTS' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
        >
          <Medal size={14} /> Achievements
        </button>
      </div>

      <motion.div layout className="relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'LEADERBOARD' ? (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => { playSound('tap'); setLeaderboardFilter('DAILY'); }}
                  className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${leaderboardFilter === 'DAILY' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800'}`}
                >
                  Daily Top
                </button>
                <button 
                  onClick={() => { playSound('tap'); setLeaderboardFilter('ALL_TIME'); }}
                  className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${leaderboardFilter === 'ALL_TIME' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800'}`}
                >
                  All-Time
                </button>
              </div>

              <div className="space-y-3">
                {sortedUsers.map((user, index) => {
                  const isCurrentUser = user.id === currentUser.id;
                  const score = leaderboardFilter === 'DAILY' ? (user.dailyEarned || 0) : user.coins;
                  
                  let rankIcon = null;
                  if (index === 0) rankIcon = <Crown size={18} className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />;
                  else if (index === 1) rankIcon = <Medal size={18} className="text-gray-400 drop-shadow-[0_0_8px_rgba(156,163,175,0.5)]" />;
                  else if (index === 2) rankIcon = <Medal size={18} className="text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]" />;
                  else rankIcon = <span className="text-[10px] font-black text-gray-400 w-[18px] text-center">{index + 1}</span>;

                  return (
                    <motion.div 
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isCurrentUser ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 shadow-md' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 flex justify-center items-center">
                          {rankIcon}
                        </div>
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700" />
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white italic truncate max-w-[120px]">
                              {user.name} {isCurrentUser && <span className="text-[8px] text-purple-500 ml-1">(You)</span>}
                            </p>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                              {leaderboardFilter === 'DAILY' ? 'Today' : 'Total'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900 dark:text-white tabular-nums">{score.toLocaleString()}</p>
                        <p className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">STK</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="achievements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {ACHIEVEMENTS.map((ach, index) => {
                const progress = userProgress[ach.type as keyof typeof userProgress] || 0;
                const isCompleted = progress >= ach.requirement;
                const percent = Math.min(100, (progress / ach.requirement) * 100);

                return (
                  <motion.div 
                    key={ach.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-5 rounded-[28px] border transition-all relative overflow-hidden ${isCompleted ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-green-200 dark:border-green-900/50 shadow-lg' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm opacity-80'}`}
                  >
                    {isCompleted && (
                      <div className="absolute top-[-20%] right-[-10%] p-4 opacity-[0.03] rotate-12 pointer-events-none">
                         <ach.icon size={120} />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4 relative z-10">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isCompleted ? ach.bg : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <ach.icon size={24} className={isCompleted ? ach.color : 'text-gray-400'} />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-black uppercase italic tracking-tight ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{ach.title}</h4>
                            {isCompleted && <ShieldCheck size={16} className="text-green-500" />}
                          </div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5 leading-tight">{ach.desc}</p>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                            <span className={isCompleted ? 'text-green-500' : 'text-gray-400'}>
                              {isCompleted ? 'Completed' : 'Progress'}
                            </span>
                            <span className="text-gray-500 tabular-nums">{progress.toLocaleString()} / {ach.requirement.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-purple-500'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
