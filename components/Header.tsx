
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { Wallet, Crown, ShieldAlert, LogOut, Settings, Zap, Coins, HelpCircle, Clock, Sun, Moon, Activity, Sparkles } from 'lucide-react';
import { UserTag, COIN_TO_INR_RATE } from '../types';
import { playSound } from '../audioUtils';

const Header: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const { state, logout, setActiveTab, toggleTheme } = useApp();
  const { currentUser, logoUrl, theme } = state;

  const [displayedCoins, setDisplayedCoins] = useState(currentUser?.coins || 0);
  const [isBumping, setIsBumping] = useState(false);
  const targetCoins = currentUser?.coins || 0;

  useEffect(() => {
    if (isAdmin || currentUser?.coins === undefined) return;
    
    if (currentUser.coins > displayedCoins) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 500);
      return () => clearTimeout(timer);
    }
  }, [currentUser?.coins, isAdmin]);

  useEffect(() => {
    if (isAdmin || currentUser?.coins === undefined) return;

    if (displayedCoins !== targetCoins) {
      const diff = targetCoins - displayedCoins;
      const step = diff > 0 ? Math.max(1, Math.ceil(diff / 8)) : Math.min(-1, Math.floor(diff / 8));
      
      const timer = setTimeout(() => {
        setDisplayedCoins(prev => {
          const next = prev + step;
          if (step > 0) return next > targetCoins ? targetCoins : next;
          return next < targetCoins ? targetCoins : next;
        });
      }, 40); 

      return () => clearTimeout(timer);
    }
  }, [targetCoins, displayedCoins, isAdmin]);

  const currentBalanceINR = displayedCoins * COIN_TO_INR_RATE;

  const getDaysLeft = () => {
    if (currentUser?.tag === UserTag.PASS && currentUser.passPurchaseTimestamp) {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      const expiryTime = currentUser.passPurchaseTimestamp + thirtyDays;
      const diff = expiryTime - Date.now();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    return null;
  };

  const daysLeft = getDaysLeft();
  const isVIP = currentUser?.tag === UserTag.PASS;

  return (
    <header className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white p-3 shadow-xl z-[100] relative overflow-hidden transition-all duration-700 border-b border-gray-100 dark:border-white/10">
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[60px] -mr-24 -mt-24 pointer-events-none" />
      
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-4">
            <div 
              onClick={() => { playSound('tap'); setActiveTab('home'); }}
              className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-white/40 bg-white p-1.5 shadow-2xl z-20 overflow-hidden flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-90"
            >
              <img src={logoUrl || './logo.png'} alt="STK" className="w-full h-full object-contain" />
            </div>
            <div className="w-10 h-10 rounded-xl border-2 border-gray-100 dark:border-white/20 overflow-hidden bg-blue-600/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner z-10 grayscale-[0.3]">
              {isAdmin ? (
                 <ShieldAlert className="w-6 h-6 text-red-400" />
              ) : (
                <img src={currentUser?.avatar} alt="User" className="w-full h-full object-cover" />
              )}
            </div>
          </div>

          <div className="flex flex-col ml-1">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-[11px] tracking-tight truncate max-w-[80px] uppercase italic">
                {isAdmin ? 'System Root' : currentUser?.name.split(' ')[0]}
              </h1>
              {!isAdmin && isVIP && (
                <div className="flex items-center gap-1.5 bg-yellow-400 px-2 py-0.5 rounded-lg text-blue-900 shadow-xl shadow-yellow-400/20 animate-pulse">
                   <Crown size={10} fill="currentColor" />
                   <span className="text-[8px] font-black uppercase">VIP</span>
                </div>
              )}
            </div>
            
            {!isAdmin && (
              <div className={`flex items-center gap-2 transition-all duration-300 ${isBumping ? 'animate-balance-bump text-yellow-500' : ''}`}>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-black text-gray-900 dark:text-white italic">₹{currentBalanceINR.toFixed(2)}</span>
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest opacity-80">
                    ({displayedCoins} UNITS)
                  </span>
                </div>
              </div>
            )}
            {isAdmin && (
              <div className="flex items-center gap-2">
                 <Activity size={10} className="text-green-400 animate-pulse" />
                 <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Protocol Active</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* VIP-ONLY THEME TOGGLE */}
          {!isAdmin && isVIP && (
            <div className="flex items-center mr-1">
               <button 
                  onClick={() => { playSound('tap'); toggleTheme(); }}
                  className="p-2 bg-gray-100 dark:bg-white/10 rounded-xl transition-all active:scale-90 text-blue-600 dark:text-yellow-400 border border-gray-200 dark:border-white/10 flex items-center gap-2"
               >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  <Sparkles size={10} className="animate-pulse" />
               </button>
            </div>
          )}

          {!isAdmin && currentUser?.tag === UserTag.PASS && daysLeft !== null && (
            <div className="mr-1 bg-blue-600/20 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-gray-200 dark:border-white/10 shadow-inner">
               <Clock size={12} className="text-yellow-400 animate-pulse" />
               <span className="text-[9px] font-black text-gray-900 dark:text-white uppercase tracking-widest">
                 {daysLeft}D
               </span>
            </div>
          )}

          <div className="flex items-center bg-gray-50 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5">
            {!isAdmin && (
              <button 
                onClick={() => { playSound('tap'); setActiveTab('faq'); }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-all active:scale-90 text-gray-600 dark:text-white/70"
              >
                <HelpCircle size={22} />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => { playSound('tap'); logout(); }}
            className="p-2.5 bg-red-500/10 hover:bg-red-500/30 rounded-xl transition-all active:scale-90 text-red-600 dark:text-red-300 ml-1 border border-red-500/20"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
