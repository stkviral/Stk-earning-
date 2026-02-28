
import React, { useState } from 'react';
import { useApp } from '../App';
import { 
  User, LogOut, Shield, Mail, Calendar, 
  ChevronRight, Award, Wallet, Settings, 
  Bell, HelpCircle, Info, Share2, Star,
  Crown, ShieldCheck, Activity, Zap,
  Search, AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react';
import { UserTag, UserStatus } from '../types';
import { playSound } from '../audioUtils';
import { BackendAI } from '../geminiService';

const Profile: React.FC = () => {
  const { state, logout, setActiveTab, updateUser } = useApp();
  const { currentUser } = state;

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{ riskScore: number; auditLogs: string[] } | null>(null);

  if (!currentUser) return null;

  const handleSecurityAudit = async () => {
    playSound('tap');
    setIsAuditing(true);
    try {
      const result = await BackendAI.securityAudit(currentUser);
      setAuditResult(result);
      // Update user risk score in state
      updateUser({ riskScore: result.riskScore });
    } catch (error) {
      console.error("Audit failed", error);
    } finally {
      setIsAuditing(false);
    }
  };

  const menuItems = [
    { id: 'wallet', icon: Wallet, label: 'My Wallet', desc: 'Manage your earnings', color: 'text-blue-500' },
    { id: 'invite', icon: Share2, label: 'Refer & Earn', desc: 'Invite friends for rewards', color: 'text-green-500' },
    { id: 'discord', icon: HelpCircle, label: 'Support Center', desc: 'Join our Discord server', color: 'text-orange-500' },
  ];

  const handleLogout = () => {
    playSound('tap');
    console.log("Logout initiated");
    logout();
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950 p-6 pb-32 animate-in fade-in duration-700 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
          My <span className="text-blue-600">Profile</span>
        </h1>
        <button 
          onClick={() => { playSound('tap'); setActiveTab('home'); }}
          className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400"
        >
          <Activity size={20} />
        </button>
      </div>

      {/* User Card */}
      <div className="relative z-10 mb-8 group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
        <div className="relative bg-white dark:bg-gray-900 rounded-[40px] p-8 border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-[32px] border-4 border-gray-50 dark:border-gray-800 overflow-hidden shadow-2xl relative z-10">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              </div>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">{currentUser.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <Mail size={12} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentUser.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="bg-blue-600/10 px-4 py-1.5 rounded-full border border-blue-600/20">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">ID: {currentUser.id.slice(0, 8)}</span>
              </div>
              <div className={`px-4 py-1.5 rounded-full border ${isVIP ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-600' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                <span className="text-[9px] font-black uppercase tracking-widest">{isVIP ? 'Elite Member' : 'Standard User'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50 dark:border-gray-800">
            <div className="text-center space-y-1">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total Balance</p>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-lg font-black text-gray-900 dark:text-white italic">{currentUser.coins.toLocaleString()}</span>
                <span className="text-[10px] font-black text-blue-500 uppercase">STK</span>
              </div>
            </div>
            <div className="text-center space-y-1 border-l border-gray-50 dark:border-gray-800">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cash Value</p>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-lg font-black text-gray-900 dark:text-white italic">₹{(currentUser.coins * 0.01).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
            <div className="text-center space-y-1">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Daily Streak</p>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-lg font-black text-orange-500 italic">{currentUser.streakDays || 0}</span>
                <span className="text-[10px] font-black text-orange-400 uppercase">Days</span>
              </div>
            </div>
            <div className="text-center space-y-1 border-l border-gray-50 dark:border-gray-800">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Current Rank</p>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-lg font-black text-purple-500 italic">
                  {(currentUser.streakDays || 0) >= 30 ? 'Diamond' : (currentUser.streakDays || 0) >= 14 ? 'Platinum' : (currentUser.streakDays || 0) >= 7 ? 'Gold' : (currentUser.streakDays || 0) >= 3 ? 'Silver' : 'Bronze'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="relative z-10 space-y-3">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 mb-4">Account Security</h3>
        
        {/* Security Audit Button */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-900 dark:text-white uppercase italic tracking-tight">AI Security Audit</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Analyze account for risks</p>
              </div>
            </div>
            <button 
              onClick={handleSecurityAudit}
              disabled={isAuditing}
              className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isAuditing ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95'}`}
            >
              {isAuditing ? <Loader2 size={14} className="animate-spin" /> : 'Run Audit'}
            </button>
          </div>

          {auditResult && (
            <div className="pt-4 border-t border-gray-50 dark:border-gray-800 animate-in slide-in-from-top-2 duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Risk Score:</span>
                  <span className={`text-xs font-black ${auditResult.riskScore > 50 ? 'text-red-500' : 'text-green-500'}`}>
                    {auditResult.riskScore}/100
                  </span>
                </div>
                <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${auditResult.riskScore > 50 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                  {auditResult.riskScore > 50 ? 'High Risk' : 'Secure'}
                </div>
              </div>
              
              <div className="space-y-2">
                {auditResult.auditLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[9px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    {auditResult.riskScore > 50 ? <AlertTriangle size={10} className="text-red-500 mt-0.5 shrink-0" /> : <CheckCircle2 size={10} className="text-green-500 mt-0.5 shrink-0" />}
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 mt-6 mb-4">Account Settings</h3>
        
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { 
              playSound('tap'); 
              if (item.id === 'discord') {
                window.open('https://discord.gg/FrUwmRdunZ', '_blank');
              } else {
                setActiveTab(item.id); 
              }
            }}
            className="w-full bg-white dark:bg-gray-900 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon size={24} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-gray-900 dark:text-white uppercase italic tracking-tight">{item.label}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
          </button>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-red-600/5 dark:bg-red-600/10 p-5 rounded-[28px] border border-red-600/20 flex items-center justify-between group hover:bg-red-600 hover:border-red-600 transition-all shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 dark:bg-red-600/20 flex items-center justify-center text-red-600 group-hover:bg-white group-hover:text-red-600 transition-all">
              <LogOut size={24} />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-red-600 group-hover:text-white uppercase italic tracking-tight">Sign Out</p>
              <p className="text-[9px] text-red-400 group-hover:text-white/70 font-bold uppercase tracking-widest">Terminate current session</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-red-300 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setActiveTab('privacy')} className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-500">Privacy</button>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <a href="https://discord.gg/FrUwmRdunZ" target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-500">Support</a>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">v2.4.0</span>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-gray-300 dark:text-gray-700">
          <ShieldCheck size={12} />
          <span className="text-[8px] font-black uppercase tracking-[0.3em]">End-to-End Encrypted Node</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
