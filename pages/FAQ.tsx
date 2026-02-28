
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Coins, Zap, ShieldCheck, CreditCard, Users, Pickaxe, Disc, FileText, ChevronRight } from 'lucide-react';
import { useApp } from '../App';
import { playSound } from '../audioUtils';

interface FAQItemProps {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-500">
      <button 
        onClick={() => { playSound('tap'); setIsOpen(!isOpen); }}
        className="w-full p-6 flex items-center justify-between text-left active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100/50 dark:border-blue-800/50 shadow-inner">
            {icon}
          </div>
          <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-tight uppercase italic">{question}</span>
        </div>
        <ChevronDown 
          size={20} 
          className={`text-gray-400 dark:text-gray-600 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-4 duration-500">
          <div className="h-px bg-gray-50 dark:bg-gray-800 mb-5" />
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-widest">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

const FAQ: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="p-6 space-y-10 pb-40 animate-in fade-in duration-700 bg-gray-50 dark:bg-gray-950 min-h-full">
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-3 bg-blue-600 dark:bg-blue-900 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-500/10 border border-white/10">
          <HelpCircle size={14} className="animate-pulse" /> Help Center
        </div>
        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Frequently Asked Questions</h2>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Learn how to earn and withdraw your coins.</p>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-3 px-2">
           <Coins size={14} className="text-blue-500" />
           <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em]">Earnings & Balance</h3>
        </div>
        <FAQItem 
          icon={<Coins size={24} />}
          question="How much are coins worth?" 
          answer="The math is simple: 100 Coins = ₹10. Your balance is updated in real-time."
        />
        <FAQItem 
          icon={<Zap size={24} />}
          question="Daily Earning Limit" 
          answer="Standard accounts are limited to 100 Coins daily. Upgrade to VIP for unlimited earnings and more."
        />
        <FAQItem 
          icon={<Pickaxe size={24} />}
          question="Mining System" 
          answer="Mining is a 24-hour cycle. Watch 2 ads to start mining and claim your rewards. VIP members get 2x rewards automatically."
        />
        <FAQItem 
          icon={<Disc size={24} />}
          question="Lucky Spin" 
          answer="Test your luck daily. Standard accounts get 5 spins per day. VIP members get unlimited spins."
        />
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-3 px-2">
           <CreditCard size={14} className="text-indigo-500" />
           <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em]">Withdrawal Rules</h3>
        </div>
        <FAQItem 
          icon={<CreditCard size={24} />}
          question="Minimum Withdrawal" 
          answer="You can withdraw once you reach 500 Coins (₹50). Payments are sent directly to your UPI ID."
        />
        <FAQItem 
          icon={<ShieldCheck size={24} />}
          question="Withdrawal Fees" 
          answer="Standard withdrawals have a 7.5% fee. This fee is completely waived (0%) for VIP members."
        />
        <FAQItem 
          icon={<Users size={24} />}
          question="Referral Rewards" 
          answer="Invite your friends and earn! Get 50 Coins instantly when your friend makes their first withdrawal."
        />
      </div>

      <div className="bg-blue-600 dark:bg-blue-800 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl border border-white/10 group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
          <HelpCircle size={100} />
        </div>
        <div className="relative z-10 space-y-6">
          <h4 className="text-2xl font-black italic uppercase tracking-tighter">Need Help?</h4>
          <p className="text-xs text-blue-100 font-bold uppercase tracking-widest leading-relaxed opacity-90">
            Our support team is here to help you with any issues or withdrawal questions.
          </p>
          <a 
            href="https://discord.gg/FrUwmRdunZ" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex bg-white text-blue-600 px-8 py-4 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all hover:brightness-110"
          >
            Contact Support
          </a>
        </div>
      </div>

      <button 
        onClick={() => { playSound('tap'); setActiveTab('privacy'); }}
        className="w-full flex items-center justify-between p-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-95 shadow-lg group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30">
            <FileText size={20} className="group-hover:text-blue-600" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Privacy Policy</span>
        </div>
        <ChevronRight size={20} />
      </button>

      <div className="text-center pt-8 border-t border-gray-100 dark:border-gray-900">
         <p className="text-[8px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.5em]">STK EARNING SUPPORT</p>
      </div>
    </div>
  );
};

export default FAQ;
