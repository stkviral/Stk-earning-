
import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, Database, Globe, UserCheck, Sparkles } from 'lucide-react';
import { useApp } from '../App';
import { playSound } from '../audioUtils';

const PrivacyPolicy: React.FC = () => {
  const { state, setActiveTab } = useApp();

  const handleBack = () => {
    playSound('tap');
    if (state.isLoggedIn) {
      setActiveTab('profile');
    } else {
      setActiveTab('home'); // Resets to login screen
    }
  };

  return (
    <div className="p-6 space-y-10 pb-40 animate-in fade-in duration-700 min-h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-5 pt-4">
        <button 
          onClick={handleBack}
          className="p-4 bg-white dark:bg-gray-900 rounded-[22px] shadow-xl border border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 active:scale-90 transition-all hover:text-blue-600"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none">Privacy Policy</h2>
          <p className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mt-2">Last Updated: Jan 2024</p>
        </div>
      </div>

      <div className="bg-blue-600 dark:bg-blue-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/10">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
          <ShieldCheck size={120} />
        </div>
        <div className="relative z-10 space-y-4">
           <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-yellow-300 animate-pulse" />
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Your Privacy Matters</h3>
           </div>
           <p className="text-xs text-blue-100 font-bold leading-relaxed uppercase tracking-widest opacity-90">
             We value your privacy. This policy explains how we protect your data.
           </p>
        </div>
      </div>

      <div className="space-y-6">
        <Section 
          icon={<Database size={22} />}
          title="Data Collection"
          content="We collect your Name, Email, and Profile Picture. When you withdraw, we use your UPI ID to send your earnings."
        />
        
        <Section 
          icon={<UserCheck size={22} />}
          title="How We Use Data"
          content="Data is utilized for asset management, referral tracking, security checks, and payment processing. Your data remains within the STK Earning Platform and is never sold to external entities."
        />

        <Section 
          icon={<Globe size={22} />}
          title="Advertisements"
          content="STK utilizes Rewarded Ads. Third-party ad networks may use standard advertising IDs to provide relevant rewards and verify engagement for coin rewards."
        />

        <Section 
          icon={<Lock size={22} />}
          title="Security"
          content="All transactions and balances are protected by 256-bit AES encryption. Access to sensitive payout logs is limited to Authorized Staff for verified audit processing."
        />

        <Section 
          icon={<Eye size={22} />}
          title="Your Rights"
          content="You maintain full control. Request account deletion or data requests at any time via Support. Deletion requests are processed within 24 hours of verification."
        />
      </div>

      <div className="text-center pt-10 border-t border-gray-100 dark:border-gray-900">
        <p className="text-[9px] text-gray-400 dark:text-gray-600 font-black uppercase tracking-[0.4em] leading-relaxed">
          By using this app, you agree to our privacy policy.<br/>
          STK NETWORK © 2024
        </p>
      </div>
    </div>
  );
};

const Section: React.FC<{ icon: React.ReactNode, title: string, content: string }> = ({ icon, title, content }) => (
  <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl space-y-4 group transition-all hover:border-blue-200 dark:hover:border-blue-900/40">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 bg-gray-50 dark:bg-gray-950 text-blue-600 dark:text-blue-500 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-800 shadow-inner group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] italic leading-none">{title}</h4>
    </div>
    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-widest">
      {content}
    </p>
  </div>
);

export default PrivacyPolicy;
