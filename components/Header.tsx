
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { Wallet, Crown, ShieldAlert, LogOut, Settings, Zap, Coins, HelpCircle, Clock, Sun, Moon, Activity, Sparkles, ShieldCheck } from 'lucide-react';
import { UserTag, COIN_TO_INR_RATE, ADMIN_EMAIL } from '../types';
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

  return (
    <header className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 z-[100] relative overflow-hidden transition-all duration-300 border-b border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm z-10">
            {isAdmin ? (
               <ShieldAlert className="w-6 h-6 text-red-500" />
            ) : (
              <img src={currentUser?.avatar} alt="User" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="font-bold text-lg tracking-tight truncate max-w-[150px]">
              {isAdmin ? 'System Root' : `Welcome ${currentUser?.name.split(' ')[0]}`}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <div className={`flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 ${isBumping ? 'scale-105' : ''}`}>
              <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shadow-sm">
                <Coins size={12} className="text-yellow-700" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {displayedCoins.toFixed(1)}
              </span>
            </div>
          )}
          {currentUser?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
            <button 
              onClick={() => { playSound('tap'); setActiveTab('admin'); }}
              className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all active:scale-90 text-gray-600 dark:text-gray-300"
            >
              <ShieldCheck size={20} />
            </button>
          )}
          <button 
            onClick={() => { playSound('tap'); toggleTheme(); }}
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all active:scale-90 text-gray-600 dark:text-gray-300"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
