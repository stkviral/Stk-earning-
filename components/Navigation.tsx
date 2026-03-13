
import React, { useMemo } from 'react';
import { Home, HelpCircle, PlayCircle, UserPlus, Wallet, Briefcase, CheckSquare, ShieldCheck, Crown, User, Trophy } from 'lucide-react';
import { useApp } from '../App';
import { ADMIN_EMAIL, UserTag } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { state } = useApp();
  
  const tabs = useMemo(() => {
    const baseTabs = [
      { id: 'home', icon: Home, label: 'Home' },
      { id: 'wallet', icon: Wallet, label: 'Wallet' },
      { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
      { id: 'profile', icon: User, label: 'Profile' },
    ];

    if (state.currentUser?.role === 'admin' || state.currentUser?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      baseTabs.push({ id: 'admin', icon: ShieldCheck, label: 'Admin' });
    }

    return baseTabs;
  }, [state.currentUser?.email, state.currentUser?.role]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 dark:bg-gray-950/95 backdrop-blur-2xl border-t border-gray-100 dark:border-white/5 flex justify-around items-center py-5 px-2 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-50 transition-all duration-500 rounded-t-[32px]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            if (window.navigator.vibrate) window.navigator.vibrate(10);
            setActiveTab(tab.id);
          }}
          className={`flex flex-col items-center gap-2 transition-all relative px-3 py-1 group ${
            activeTab === tab.id 
              ? 'text-blue-600 dark:text-blue-400 scale-110' 
              : 'text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-400'
          }`}
        >
          {activeTab === tab.id && (
            <div className="absolute -top-5 w-6 h-1 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
          )}
          <div className={`transition-transform duration-300 group-active:scale-90 flex items-center justify-center p-2 rounded-2xl ${activeTab === tab.id ? 'bg-blue-50 dark:bg-blue-500/10' : ''}`}>
             <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
          </div>
          <span className="text-[7px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
