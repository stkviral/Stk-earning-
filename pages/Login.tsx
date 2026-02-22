
import React, { useState } from 'react';
import { Mail, Hash, ShieldCheck, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { useApp } from '../App';

interface LoginProps {
  onLogin: (email: string, name: string, referralCode?: string) => void;
  onAdminClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onAdminClick }) => {
  const [referralCode, setReferralCode] = useState('');
  const { state } = useApp();

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white dark:bg-gray-950 p-8 items-center justify-center relative overflow-hidden transition-colors duration-500">
      {/* Immersive Background Effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32 opacity-80" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-600/15 rounded-full blur-[80px] -ml-24 -mb-24 opacity-60" />
      
      <div className="relative z-10 w-40 h-40 mb-10 group" onClick={(e) => {
        if (e.detail === 5) onAdminClick(); // Secret 5-click on logo
      }}>
        <div className="absolute inset-0 bg-blue-600 rounded-[48px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="w-full h-full relative z-10 bg-white dark:bg-gray-900 rounded-[48px] shadow-2xl border-b-8 border-blue-600 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 duration-500">
          <img 
            src={state.logoUrl || './logo.png'} 
            alt="STK Logo" 
            className="w-24 h-24 object-contain dark:drop-shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
          />
        </div>
      </div>
      
      <div className="text-center space-y-2 mb-10 relative z-10">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">STK Earning</h1>
        <div className="flex items-center justify-center gap-2">
           <Sparkles size={12} className="text-blue-500 animate-pulse" />
           <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Premium Rewards Platform</p>
        </div>
      </div>

      <div className="w-full space-y-8 relative z-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
            <Hash size={10} className="text-blue-500" /> Referral Code (Optional)
          </label>
          <input 
            type="text"
            placeholder="ENTER CODE"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 p-5 rounded-3xl text-center font-black text-xl text-gray-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-500 outline-none transition-all shadow-inner uppercase tracking-[0.2em] placeholder:text-gray-300 dark:placeholder:text-gray-700"
          />
        </div>

        <div className="space-y-4 pt-2">
          <button 
            onClick={() => onLogin('demo@stk.com', 'Demo User', referralCode)}
            className="w-full flex items-center justify-center gap-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 py-5 rounded-[28px] font-black text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-xl shadow-blue-500/5 active:scale-95 uppercase text-xs"
          >
            <div className="w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700">
               <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            </div>
            Login with Google
          </button>
        </div>
      </div>

      <div className="mt-16 space-y-4 text-center relative z-10">
        <div className="flex items-center justify-center gap-3 bg-gray-50 dark:bg-gray-900/40 px-6 py-3 rounded-full border border-gray-100 dark:border-gray-800/60 shadow-sm">
          <ShieldCheck size={14} className="text-blue-500" />
          <p className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em]">
            Secure & Encrypted
          </p>
        </div>
        <button 
          onClick={onAdminClick}
          className="text-[8px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest hover:text-blue-500 transition-colors"
        >
          STK NETWORK v2.4.0
        </button>
      </div>
    </div>
  );
};

export default Login;
