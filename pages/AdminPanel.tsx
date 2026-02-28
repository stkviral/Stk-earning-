
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../App';
import { 
  LayoutDashboard, Users, CreditCard, ShieldAlert, Settings, 
  ScrollText, Search, Coins, TrendingUp, AlertTriangle,
  ArrowUpRight, Ban, Unlock, ShieldCheck, BarChart3, 
  PieChart, Activity, Globe, Zap, MousePointer2, Clock,
  ArrowDownRight, CheckCircle2, AlertCircle, MoreVertical,
  UserX, ShieldOff, Timer, History, X, ArrowLeft, ArrowRight,
  Smartphone, MapPin, UserPlus, Minus, Plus, Wallet, ChevronRight,
  Server, Cpu, Database, Network, Trophy, Gift, CheckSquare,
  Image as ImageIcon, Upload, Trash2, Palette, Sparkles, Sliders,
  RefreshCw, Save, Info, Bell, Pickaxe, Disc, PlayCircle, Radio,
  UserCog, Terminal, Lock, Laptop, Cloud, Crown
} from 'lucide-react';
import { User, UserTag, UserStatus, COIN_TO_INR_RATE, AppSettings } from '../types';

type AdminTab = 'dashboard' | 'users' | 'passes' | 'payouts' | 'features' | 'system' | 'activity' | 'logs';

const StatCard = ({ label, value, sub, icon: Icon, color }: any) => (
  <div className="bg-gray-900 border border-gray-800 p-5 rounded-[32px] space-y-2 shadow-xl">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-inner`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-white mt-0.5 tracking-tight">{value}</p>
      <p className="text-[8px] font-bold text-gray-600 uppercase mt-0.5">{sub}</p>
    </div>
  </div>
);

const NavItem = ({ tab, icon: Icon, label, activeTab, setActiveTab, setViewingUserId }: any) => (
  <button
    onClick={() => { setActiveTab(tab); setViewingUserId(null); }}
    className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
  >
    <Icon size={18} />
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const UserDetailView: React.FC<{ user: User; onBack: () => void }> = ({ user, onBack }) => {
  const { state, adminActions, calculateRiskScore } = useApp();
  const [activeTab, setActiveTab] = useState<'activity' | 'edit' | 'security' | 'referrals' | 'logs'>('activity');
  const [coinAdjustment, setCoinAdjustment] = useState('');
  const [actionReason, setActionReason] = useState('');
  
  const [editName, setEditName] = useState(user.name);
  const [editTag, setEditTag] = useState<UserTag>(user.tag);

  const currentRiskScore = useMemo(() => calculateRiskScore(user), [user, calculateRiskScore]);

  const handleAdjustCoins = (type: 'ADD' | 'REMOVE') => {
    const amount = parseInt(coinAdjustment);
    if (isNaN(amount) || amount <= 0) return alert("Enter valid amount");
    if (!actionReason) return alert("Reason is required");
    adminActions.modifyCoins(user.id, type === 'ADD' ? amount : -amount, actionReason);
    setCoinAdjustment('');
    setActionReason('');
  };

  const handleResetCooldown = (type: 'MINING' | 'SPIN' | 'ALL') => {
    if (!actionReason) return alert("Reason is required");
    adminActions.resetCooldowns(user.id, type, actionReason);
    setActionReason('');
    alert(`${type} cooldown reset successfully.`);
  };

  const handleUpdateProfile = () => {
    adminActions.updateUserSettings(user.id, { name: editName, tag: editTag });
    alert("Profile Updated");
  };

  const handleStatusUpdate = (status: UserStatus) => {
    const confirm = window.confirm(`Initiate ${status} protocol for ${user.name}?`);
    if (confirm) {
      adminActions.setUserStatus(user.id, status, actionReason || 'Standard protocol override');
      setActionReason('');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-32">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-gray-900 border border-gray-800 rounded-2xl text-gray-400 hover:text-white transition-all shadow-xl">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <img src={user.avatar} className="w-14 h-14 rounded-[20px] border-2 border-gray-800 shadow-xl" alt="" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-white italic truncate">{user.name}</h2>
            <div className="flex items-center gap-2">
               <p className={`text-[10px] font-bold uppercase tracking-widest ${user.status === UserStatus.ACTIVE ? 'text-green-500' : 'text-red-500'}`}>{user.status}</p>
               <div className="w-1 h-1 rounded-full bg-gray-700" />
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.tag}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-900 border border-white/10 p-6 rounded-[40px] shadow-2xl space-y-4">
         <div className="flex items-center gap-3 text-white">
            <Terminal size={20} />
            <h3 className="text-xs font-black uppercase tracking-widest">Remote Execution</h3>
         </div>
         <p className="text-[10px] text-blue-100 font-bold uppercase tracking-tight leading-relaxed opacity-80">
            Override local session and take direct control of this terminal.
         </p>
         <button 
           onClick={() => adminActions.impersonateUser(user.id)}
           className="w-full bg-white text-blue-900 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95"
         >
            <UserCog size={18} />
            Login as {user.name.split(' ')[0]}
         </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-[32px] p-2 flex">
        {(['activity', 'edit', 'security', 'referrals', 'logs'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`flex-1 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-[40px] p-6 shadow-2xl min-h-[400px]">
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="bg-gray-950 p-4 rounded-2xl space-y-3">
              <label className="text-[9px] font-black text-gray-500 uppercase">Protocol Adjustment</label>
              <input type="text" placeholder="Audit Reason..." value={actionReason || ''} onChange={e => setActionReason(e.target.value)} className="w-full bg-gray-900 border border-gray-800 p-3 rounded-xl text-xs text-white outline-none" />
              <div className="flex gap-2">
                <input type="number" placeholder="Amt" value={coinAdjustment || ''} onChange={e => setCoinAdjustment(e.target.value)} className="flex-1 bg-gray-900 border border-gray-800 p-3 rounded-xl text-xs text-white outline-none" />
                <button onClick={() => handleAdjustCoins('ADD')} className="bg-green-600 px-4 rounded-xl text-white"><Plus size={18} /></button>
                <button onClick={() => handleAdjustCoins('REMOVE')} className="bg-red-600 px-4 rounded-xl text-white"><Minus size={18} /></button>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-800">
                <button onClick={() => handleResetCooldown('MINING')} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">Reset Mining</button>
                <button onClick={() => handleResetCooldown('SPIN')} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">Reset Spin</button>
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-5 rounded-[32px] flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gray-900 ${user.adsBlocked ? 'text-red-500' : 'text-green-500'}`}>
                     <Radio size={16} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-white uppercase tracking-widest">Ad Access</p>
                     <p className="text-[8px] font-bold text-gray-600 uppercase">Granular Toggle</p>
                  </div>
               </div>
               <button 
                  onClick={() => adminActions.updateUserSettings(user.id, { adsBlocked: !user.adsBlocked })}
                  className={`w-12 h-6 rounded-full transition-all relative ${!user.adsBlocked ? 'bg-green-600' : 'bg-red-600'}`}
               >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${!user.adsBlocked ? 'left-7' : 'left-1'}`} />
               </button>
            </div>

            {user.tag === UserTag.PASS && (
              <div className="bg-red-600/10 border border-red-600/20 p-5 rounded-[32px] flex items-center justify-between mt-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-600 text-white">
                       <Crown size={16} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white uppercase tracking-widest">VIP Status</p>
                       <p className="text-[8px] font-bold text-red-500 uppercase">Active Membership</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => {
                      if (window.confirm(`Revoke VIP access for ${user.name}?`)) {
                        adminActions.updateUserSettings(user.id, { tag: UserTag.NORMAL });
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20"
                 >
                    Revoke
                 </button>
              </div>
            )}
            
            <div className="space-y-3 pt-4">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">Recent Ledger</p>
              {user.transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-950 rounded-2xl border border-gray-800">
                  <span className="text-[10px] font-black text-white uppercase italic">{tx.method}</span>
                  <span className={`text-xs font-black ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'edit' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-3">
              {(Object.values(UserStatus)).map(status => (
                <button 
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  className={`p-4 rounded-2xl border font-black text-[9px] uppercase transition-all flex flex-col items-center gap-2 ${user.status === status ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-600'}`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">Membership Tier</p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.values(UserTag)).map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setEditTag(tag)}
                    className={`p-4 rounded-2xl border font-black text-[9px] uppercase transition-all flex items-center justify-center gap-2 ${editTag === tag ? 'bg-yellow-500 border-yellow-400 text-white' : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-600'}`}
                  >
                    {tag === UserTag.PASS && <Crown size={12} />}
                    {tag === UserTag.PASS ? 'VIP Pass' : 'Normal'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <input type="text" value={editName || ''} onChange={e => setEditName(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-white font-black" />
              <button onClick={handleUpdateProfile} className="w-full bg-white text-gray-950 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl">Update Profile</button>
            </div>
          </div>
        )}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-gray-950 p-6 rounded-[32px] border border-gray-800 space-y-4">
               <div className="flex items-center gap-3">
                  <ShieldOff className="text-red-500" size={20} />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Fraud Detection</h3>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                     <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Device ID</p>
                     <p className="text-xs font-mono text-white mt-1">{user.deviceId || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                     <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Last IP</p>
                     <p className="text-xs font-mono text-white mt-1">{user.lastIp || 'N/A'}</p>
                  </div>
               </div>
               <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex items-center justify-between">
                  <div>
                     <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Risk Score</p>
                     <p className={`text-xl font-black mt-1 ${currentRiskScore > 70 ? 'text-red-500' : 'text-green-500'}`}>{currentRiskScore}/100</p>
                  </div>
                  {currentRiskScore > 70 && (
                     <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                        High Risk
                     </div>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PayoutsTab: React.FC<{ setViewingUserId: (id: string) => void }> = ({ setViewingUserId }) => {
  const { state, adminActions } = useApp();
  const [filter, setFilter] = useState<'PENDING' | 'COMPLETED' | 'REJECTED'>('PENDING');
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [paymentTxId, setPaymentTxId] = useState<Record<string, string>>({});

  const payouts = useMemo(() => state.allUsers.flatMap(user => 
    user.transactions
      .filter(tx => tx.type === 'WITHDRAW' && tx.status === filter)
      .map(tx => ({ ...tx, userId: user.id, userName: user.name }))
  ).sort((a, b) => b.timestamp - a.timestamp), [state.allUsers, filter]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-gray-900 p-2 rounded-2xl border border-gray-800">
        {(['PENDING', 'COMPLETED', 'REJECTED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {payouts.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-[40px] border border-gray-800 opacity-50">
          <p className="text-[10px] font-black uppercase tracking-widest">No {filter.toLowerCase()} payouts</p>
        </div>
      ) : (
        payouts.map(tx => (
          <div key={tx.id} className="bg-gray-900 p-8 rounded-[48px] border border-gray-800 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-black italic text-blue-400 cursor-pointer" onClick={() => setViewingUserId(tx.userId)}>{tx.userName}</h4>
                <p className="text-[10px] font-black text-gray-500 uppercase">{tx.method}</p>
                <p className="text-[8px] font-bold text-gray-600 uppercase mt-1">{new Date(tx.timestamp).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">₹{tx.amount.toFixed(0)}</p>
                <p className="text-[10px] font-black text-gray-500 uppercase">{(tx.amount / COIN_TO_INR_RATE).toFixed(0)} Coins</p>
              </div>
            </div>

            {filter === 'PENDING' && (
              <div className="space-y-4 pt-4 border-t border-gray-800">
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Payment TxID (for Approval)" 
                    value={paymentTxId[tx.id] || ''} 
                    onChange={e => setPaymentTxId(prev => ({ ...prev, [tx.id]: e.target.value }))} 
                    className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl text-xs text-white outline-none focus:border-green-500/50" 
                  />
                  <input 
                    type="text" 
                    placeholder="Rejection Reason (Required for Reject)" 
                    value={rejectionReason[tx.id] || ''} 
                    onChange={e => setRejectionReason(prev => ({ ...prev, [tx.id]: e.target.value }))} 
                    className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl text-xs text-white outline-none focus:border-red-500/50" 
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      if (!rejectionReason[tx.id]) return alert("Rejection reason is required");
                      adminActions.rejectWithdrawal(tx.userId, tx.id, rejectionReason[tx.id]);
                    }} 
                    className="flex-1 bg-red-600/10 border border-red-600 text-red-600 py-4 rounded-2xl font-black text-[10px] uppercase"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => adminActions.approveWithdrawal(tx.userId, tx.id, paymentTxId[tx.id])} 
                    className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-green-600/20"
                  >
                    Approve
                  </button>
                </div>
              </div>
            )}

            {filter === 'COMPLETED' && tx.paymentTxId && (
              <div className="pt-4 border-t border-gray-800">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">TxID: <span className="text-green-400">{tx.paymentTxId}</span></p>
              </div>
            )}

            {filter === 'REJECTED' && tx.rejectionReason && (
              <div className="pt-4 border-t border-gray-800">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Reason: <span className="text-red-400">{tx.rejectionReason}</span></p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const { state, adminActions, updateSettings, updateLogo, calculateRiskScore } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const pendingPayouts = useMemo(() => state.allUsers.flatMap(user => 
    user.transactions
      .filter(tx => tx.type === 'WITHDRAW' && tx.status === 'PENDING')
      .map(tx => ({ ...tx, userId: user.id, userName: user.name }))
  ), [state.allUsers]);

  const analytics = useMemo(() => {
    const u = state.allUsers;
    return {
      totalSTK: u.reduce((a, b) => a + b.coins, 0),
      payouts: u.flatMap(us => us.transactions).filter(t => t.type === 'WITHDRAW' && t.status === 'COMPLETED').reduce((a, b) => a + b.amount, 0),
      active: u.filter(us => Date.now() - us.lastActiveAt < 3600000).length,
      vips: u.filter(us => us.tag === UserTag.PASS).length,
      vipRevenue: state.passRequests.filter(r => r.status === 'APPROVED').length * (state.settings.vipPrice || 49)
    };
  }, [state.allUsers, state.passRequests, state.settings.vipPrice]);

  return (
    <div className="min-h-full bg-gray-950 text-gray-100 pb-32">
      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl h-full max-h-[80vh] flex flex-col items-center justify-center gap-6">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
            >
              <X size={24} />
            </button>
            <div className="w-full h-full bg-gray-900 rounded-[40px] overflow-hidden border border-gray-800 shadow-3xl">
              <img src={previewImage} className="w-full h-full object-contain" alt="Full Proof" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Payment Verification Node</p>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-30 bg-gray-900 border-b border-gray-800 px-4 py-4 flex items-center justify-around shadow-2xl">
        <NavItem tab="dashboard" icon={LayoutDashboard} label="Stats" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
        <NavItem tab="users" icon={Users} label="Users" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
        <NavItem tab="passes" icon={Crown} label="Pass" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
        <NavItem tab="payouts" icon={CreditCard} label="Pay" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
        <NavItem tab="features" icon={Sliders} label="Config" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
        <NavItem tab="system" icon={Settings} label="System" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
        <NavItem tab="activity" icon={Activity} label="Live" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
        <NavItem tab="logs" icon={ScrollText} label="Log" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
      </div>

      <div className="p-6">
        {viewingUserId ? (
          <UserDetailView user={state.allUsers.find(u => u.id === viewingUserId)!} onBack={() => setViewingUserId(null)} />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Supply" value={analytics.totalSTK.toLocaleString()} sub={`₹${(analytics.totalSTK * COIN_TO_INR_RATE).toLocaleString()}`} icon={Coins} color="bg-blue-500/10 text-blue-500" />
                  <StatCard label="Nodes" value={analytics.active} sub={`${analytics.vips} VIP Members`} icon={Network} color="bg-indigo-500/10 text-indigo-500" />
                  <StatCard label="Paid Out" value={`₹${(analytics.payouts * COIN_TO_INR_RATE).toFixed(0)}`} sub="Total verified payouts" icon={Trophy} color="bg-green-500/10 text-green-500" />
                  <StatCard label="Queue" value={pendingPayouts.length} sub="Pending verification" icon={Clock} color="bg-orange-500/10 text-orange-500" />
                  <StatCard label="VIP Rev" value={`₹${analytics.vipRevenue.toLocaleString()}`} sub="Total Pass Sales" icon={Crown} color="bg-yellow-500/10 text-yellow-500" />
                  <StatCard label="Suspicious" value={state.allUsers.filter(u => calculateRiskScore(u) > 70).length} sub="High risk score" icon={AlertTriangle} color="bg-red-500/10 text-red-500" />
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-[40px] p-6 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Activity size={16} className="text-blue-500" />
                         <h3 className="text-[10px] font-black uppercase tracking-widest">Recent Activity</h3>
                      </div>
                      <button onClick={() => setActiveTab('activity')} className="text-[8px] font-black text-blue-500 uppercase">View All</button>
                   </div>
                   <div className="space-y-3">
                      {state.activityLogs.slice(0, 5).map(log => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-gray-950 rounded-2xl border border-gray-800">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-[10px] font-black text-blue-500 border border-gray-800">
                                 {log.userName.charAt(0)}
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-white uppercase italic">{log.userName}</p>
                                 <p className="text-[8px] font-bold text-gray-600 uppercase">{log.action}</p>
                              </div>
                           </div>
                           <span className="text-[8px] font-bold text-gray-700">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={searchTerm || ''} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full bg-gray-900 border-2 border-gray-800 p-5 pl-14 rounded-[32px] text-xs font-black uppercase outline-none focus:border-blue-600 shadow-xl" 
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {state.allUsers.filter(u => 
                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    u.email.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 ? (
                    <div className="text-center py-12 bg-gray-900 rounded-[40px] border border-gray-800 opacity-50">
                      <p className="text-[10px] font-black uppercase tracking-widest">No users found matching "{searchTerm}"</p>
                    </div>
                  ) : (
                    state.allUsers.filter(u => 
                      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      u.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map(u => (
                      <div key={u.id} className="bg-gray-900 p-5 rounded-[40px] border border-gray-800 flex flex-col gap-4 shadow-xl transition-all">
                        <div className="flex items-center justify-between cursor-pointer active:scale-95" onClick={() => setViewingUserId(u.id)}>
                          <div className="flex items-center gap-4">
                            <img src={u.avatar} className="w-12 h-12 rounded-2xl border border-gray-800" />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-black italic">{u.name}</p>
                                {calculateRiskScore(u) > 70 && (
                                  <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <AlertTriangle size={8} /> Suspicious
                                  </span>
                                )}
                              </div>
                              <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${u.status === UserStatus.ACTIVE ? 'text-blue-400' : 'text-red-500'}`}>{u.status}</p>
                            </div>
                          </div>
                          <ChevronRight className="text-gray-700" />
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-gray-800">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              adminActions.updateUserSettings(u.id, { walletFrozen: !u.walletFrozen });
                            }}
                            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${u.walletFrozen ? 'bg-blue-600/20 text-blue-500 border border-blue-600/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                          >
                            <Lock size={12} /> {u.walletFrozen ? 'Unfreeze' : 'Freeze'}
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newStatus = u.status === UserStatus.BANNED ? UserStatus.ACTIVE : UserStatus.BANNED;
                              if (window.confirm(`Are you sure you want to ${newStatus === UserStatus.BANNED ? 'ban' : 'unban'} ${u.name}?`)) {
                                adminActions.setUserStatus(u.id, newStatus, 'Quick Action');
                              }
                            }}
                            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${u.status === UserStatus.BANNED ? 'bg-red-600/20 text-red-500 border border-red-600/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                          >
                            <Ban size={12} /> {u.status === UserStatus.BANNED ? 'Unban' : 'Ban'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'passes' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="text-yellow-500" size={20} />
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">VIP Pass Requests</h3>
                </div>
                {state.passRequests.filter(r => r.status === 'PENDING').length === 0 ? (
                  <div className="text-center py-12 bg-gray-900 rounded-[40px] border border-gray-800 opacity-50">
                    <p className="text-[10px] font-black uppercase tracking-widest">No pending pass requests</p>
                  </div>
                ) : (
                  state.passRequests.filter(r => r.status === 'PENDING').map(request => (
                    <div key={request.id} className="bg-gray-900 p-8 rounded-[48px] border border-gray-800 space-y-6 shadow-2xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-base font-black italic text-yellow-500 cursor-pointer" onClick={() => setViewingUserId(request.userId)}>{request.userName}</h4>
                          <p className="text-[10px] font-black text-gray-500 uppercase">{request.userEmail}</p>
                        </div>
                        <span className="text-[8px] font-bold text-gray-600 uppercase">{new Date(request.timestamp).toLocaleString()}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Payment Proof</p>
                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-gray-800 group">
                          <img src={request.proofUrl} alt="Proof" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => setPreviewImage(request.proofUrl)}
                              className="p-3 bg-white text-gray-900 rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest"
                            >
                              View Full Size
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button 
                          onClick={() => adminActions.rejectPassRequest(request.id)}
                          className="flex-1 bg-red-600/10 border border-red-600 text-red-600 py-4 rounded-2xl font-black text-[10px] uppercase"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => adminActions.approvePassRequest(request.id)}
                          className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-green-600/20"
                        >
                          Approve VIP
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {state.passRequests.filter(r => r.status !== 'PENDING').length > 0 && (
                  <div className="pt-8 space-y-4">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2">Request History</p>
                    {state.passRequests.filter(r => r.status !== 'PENDING').slice(0, 10).map(request => (
                      <div key={request.id} className="bg-gray-900/50 p-4 rounded-3xl border border-gray-800 flex items-center justify-between opacity-60">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${request.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {request.status === 'APPROVED' ? <CheckCircle2 size={16} /> : <X size={16} />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-white uppercase">{request.userName}</p>
                            <p className="text-[8px] font-bold text-gray-600 uppercase">{request.status} • {new Date(request.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button onClick={() => setPreviewImage(request.proofUrl)} className="text-gray-600 hover:text-white"><ImageIcon size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payouts' && (
              <PayoutsTab setViewingUserId={setViewingUserId} />
            )}

            {activeTab === 'features' && (
               <div className="space-y-8">
                  <div className="bg-gray-900 border border-gray-800 rounded-[40px] p-8 space-y-8 shadow-2xl">
                     <div className="flex items-center gap-3">
                        <Pickaxe className="text-indigo-500" size={24} />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Mining Setup</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-600 uppercase">Norm Reward</label>
                           <input type="number" value={state.settings.miningRewardNormal ?? 0} onChange={e => updateSettings({ miningRewardNormal: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-center text-white font-black" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-600 uppercase">VIP Reward</label>
                           <input type="number" value={state.settings.miningRewardVIP ?? 0} onChange={e => updateSettings({ miningRewardVIP: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-center text-white font-black" />
                        </div>
                     </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-[40px] p-8 space-y-8 shadow-2xl">
                     <div className="flex items-center gap-3">
                        <Disc className="text-orange-500" size={24} />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Spin Setup</h3>
                     </div>
                     <div className="grid grid-cols-4 gap-2">
                        {state.settings.spinRewards.map((val, idx) => (
                          <input key={idx} type="number" value={val ?? 0} onChange={e => {
                             const n = [...state.settings.spinRewards];
                             n[idx] = parseInt(e.target.value) || 0;
                             updateSettings({ spinRewards: n });
                          }} className="bg-gray-950 border border-gray-800 p-3 rounded-xl text-center text-xs font-black text-white" />
                        ))}
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-600 uppercase">Max Daily Spins</label>
                           <input type="number" value={state.settings.maxDailySpinsNormal ?? 0} onChange={e => updateSettings({ maxDailySpinsNormal: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-center text-white font-black" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-600 uppercase">Cooldown (Min)</label>
                           <input type="number" value={state.settings.spinCooldownMinutes ?? 0} onChange={e => updateSettings({ spinCooldownMinutes: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-center text-white font-black" />
                        </div>
                     </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-[40px] p-8 space-y-8 shadow-2xl">
                     <div className="flex items-center gap-3">
                        <PlayCircle className="text-blue-500" size={24} />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Ad Settings</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-600 uppercase">Ad Reward (Coins)</label>
                           <input type="number" value={state.settings.adRewardCoins ?? 0} onChange={e => updateSettings({ adRewardCoins: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-center text-white font-black" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-600 uppercase">Max Daily Ads</label>
                           <input type="number" value={state.settings.maxDailyAds ?? 0} onChange={e => updateSettings({ maxDailyAds: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-center text-white font-black" />
                        </div>
                     </div>
                     <div className="space-y-2 pt-4 border-t border-gray-800">
                        <label className="text-[9px] font-black text-red-500 uppercase flex items-center gap-2"><AlertTriangle size={12} /> Emergency Reward Reduction (%)</label>
                        <input type="number" min="0" max="100" value={state.settings.emergencyRewardReduction ?? 0} onChange={e => updateSettings({ emergencyRewardReduction: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-red-900/50 p-4 rounded-2xl text-center text-red-500 font-black focus:border-red-500 outline-none" placeholder="e.g. 50 for half rewards" />
                        <p className="text-[8px] text-gray-500 uppercase font-bold text-center">Instantly reduces all mining and spin rewards by this percentage.</p>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'system' && (
               <div className="space-y-8">
                  {/* Maintenance Mode */}
                  <div className="bg-gray-900 border border-gray-800 rounded-[40px] p-8 space-y-6 shadow-2xl">
                     <div className="flex items-center gap-3">
                        <Server className="text-red-500" size={24} />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Network Protocol</h3>
                     </div>
                     <div className="flex items-center justify-between p-5 bg-gray-950 rounded-[32px] border border-gray-800">
                        <div className="flex items-center gap-4">
                           <div className="p-2 bg-gray-900 rounded-xl text-gray-500"><ShieldAlert size={18} /></div>
                           <div>
                              <p className="text-[11px] font-black uppercase tracking-widest">Maintenance Mode</p>
                              <p className="text-[8px] font-bold text-gray-600 uppercase">Lock entire terminal access</p>
                           </div>
                        </div>
                        <button 
                           onClick={() => updateSettings({ maintenanceMode: !state.settings.maintenanceMode })}
                           className={`w-12 h-7 rounded-full transition-all relative ${state.settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-800'}`}
                        >
                           <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${state.settings.maintenanceMode ? 'left-6' : 'left-1'}`} />
                        </button>
                     </div>
                  </div>

                  {/* Feature Toggles */}
                  <div className="bg-gray-900 border border-gray-800 rounded-[40px] p-8 space-y-6 shadow-2xl">
                     <div className="flex items-center gap-3">
                        <Zap className="text-blue-500" size={24} />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Feature Override</h3>
                     </div>
                     <div className="space-y-4">
                        {[
                          { key: 'miningEnabled', label: 'Mining Reactor', icon: Pickaxe },
                          { key: 'spinEnabled', label: 'Fortune Wheel', icon: Disc },
                          { key: 'videosEnabled', label: 'Video Rewards', icon: PlayCircle },
                          { key: 'referralsEnabled', label: 'Referral Hub', icon: UserPlus },
                          { key: 'adsEnabled', label: 'Global Ads Control', icon: Radio },
                        ].map(feature => (
                          <div key={feature.key} className="flex items-center justify-between p-5 bg-gray-950 rounded-[32px] border border-gray-800">
                             <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-900 rounded-xl text-gray-500"><feature.icon size={18} /></div>
                                <span className="text-[11px] font-black uppercase tracking-widest">{feature.label}</span>
                             </div>
                             <button 
                               onClick={() => updateSettings({ [feature.key]: !state.settings[feature.key as keyof AppSettings] })}
                               className={`w-12 h-7 rounded-full transition-all relative ${state.settings[feature.key as keyof AppSettings] ? 'bg-blue-600' : 'bg-gray-800'}`}
                             >
                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${state.settings[feature.key as keyof AppSettings] ? 'left-6' : 'left-1'}`} />
                             </button>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-gray-900 border border-gray-800 rounded-[40px] p-8 space-y-6 shadow-2xl">
                     <div className="flex items-center gap-3">
                        <Bell className="text-yellow-500" size={24} />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Global Broadcast</h3>
                     </div>
                     <textarea 
                      value={state.settings.systemNotification}
                      onChange={e => updateSettings({ systemNotification: e.target.value })}
                      placeholder="Enter global banner message..."
                      className="w-full bg-gray-950 border border-gray-800 p-6 rounded-[32px] text-xs font-bold text-white outline-none min-h-[120px]" 
                     />
                  </div>

                  {/* App Versioning */}
                  <div className="bg-gray-900 border border-gray-800 rounded-[40px] p-8 space-y-6 shadow-2xl">
                     <div className="flex items-center gap-3">
                        <Laptop className="text-indigo-400" size={24} />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Version Control</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-600 uppercase">Live Version</label>
                           <input type="text" value={state.settings.appVersion} onChange={e => updateSettings({ appVersion: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-center text-white font-black" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-600 uppercase">Min Required</label>
                           <input type="text" value={state.settings.minVersionRequired} onChange={e => updateSettings({ minVersionRequired: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-center text-white font-black" />
                        </div>
                     </div>
                  </div>

                  {/* Financial & Logo (Already present) */}
                  <div className="bg-gray-900 border border-gray-800 rounded-[40px] p-8 space-y-6 shadow-2xl">
                     <div className="flex items-center gap-3">
                        <Database className="text-cyan-500" size={24} />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Finance & Logo</h3>
                     </div>
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-gray-600 uppercase">Min Withdrawal</label>
                             <input type="number" value={state.settings.minWithdrawalCoins} onChange={e => updateSettings({ minWithdrawalCoins: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-5 rounded-3xl text-center text-white font-black" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-gray-600 uppercase">Daily Withdraw Limit</label>
                             <input type="number" value={state.settings.dailyWithdrawalLimit || 5000} onChange={e => updateSettings({ dailyWithdrawalLimit: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-5 rounded-3xl text-center text-white font-black" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-gray-600 uppercase">VIP Price (INR)</label>
                             <input type="number" value={state.settings.vipPrice || 49} onChange={e => updateSettings({ vipPrice: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-5 rounded-3xl text-center text-white font-black" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-gray-600 uppercase">VIP Duration (Days)</label>
                             <input type="number" value={state.settings.vipDurationDays || 30} onChange={e => updateSettings({ vipDurationDays: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-5 rounded-3xl text-center text-white font-black" />
                          </div>
                        </div>
                        <div className="space-y-2 pt-4 border-t border-gray-800">
                           <label className="text-[9px] font-black text-gray-600 uppercase px-1">Admin UPI ID</label>
                           <input 
                              type="text" 
                              value={state.settings.adminUpiId} 
                              onChange={e => updateSettings({ adminUpiId: e.target.value })} 
                              placeholder="e.g. yourname@upi"
                              className="w-full bg-gray-950 border border-gray-800 p-5 rounded-3xl text-center text-white font-black outline-none focus:border-blue-600" 
                           />
                        </div>
                        <div className="space-y-4 pt-4 border-t border-gray-800">
                           <label className="text-[9px] font-black text-gray-600 uppercase px-1">Payment QR Code</label>
                           <div className="flex items-center gap-6">
                              <div className="w-24 h-24 bg-white rounded-2xl p-2 flex items-center justify-center border-2 border-gray-800 shadow-inner">
                                 <img src={state.settings.paymentQrUrl} className="w-full h-full object-contain" alt="QR" />
                              </div>
                              <div className="flex-1 space-y-3">
                                 <button 
                                    onClick={() => document.getElementById('qrUpload')?.click()} 
                                    className="w-full bg-gray-800 text-white py-3 rounded-xl font-black text-[10px] uppercase border border-gray-700 hover:bg-gray-700 transition-all"
                                 >
                                    Upload New QR
                                 </button>
                                 <input 
                                    type="text" 
                                    value={state.settings.paymentQrUrl} 
                                    onChange={e => updateSettings({ paymentQrUrl: e.target.value })} 
                                    placeholder="Or enter URL..."
                                    className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl text-white font-black text-[9px] outline-none focus:border-blue-600" 
                                 />
                              </div>
                              <input type="file" id="qrUpload" className="hidden" accept="image/*" onChange={e => {
                                 const f = e.target.files?.[0];
                                 if (f) {
                                    const r = new FileReader();
                                    r.onloadend = () => updateSettings({ paymentQrUrl: r.result as string });
                                    r.readAsDataURL(f);
                                 }
                              }} />
                           </div>
                        </div>
                        <div className="flex items-center gap-6 pt-4 border-t border-gray-800">
                           <div className="w-16 h-16 bg-white rounded-2xl p-2 flex items-center justify-center border-2 border-gray-800">
                              <img src={state.logoUrl || './logo.png'} className="w-full h-full object-contain" />
                           </div>
                           <button onClick={() => document.getElementById('logoUpload')?.click()} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase">Update Logo</button>
                           <input type="file" id="logoUpload" className="hidden" onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) {
                                 const r = new FileReader();
                                 r.onloadend = () => updateLogo(r.result as string);
                                 r.readAsDataURL(f);
                              }
                           }} />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <Activity className="text-blue-500" size={20} />
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Live Network Feed</h3>
                 </div>
                 {state.activityLogs.map(log => (
                   <div key={log.id} className="bg-gray-900 border border-gray-800 p-6 rounded-[32px] space-y-3 shadow-xl">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-950 rounded-xl flex items-center justify-center text-xs font-black text-blue-500 border border-gray-800">
                               {log.userName.charAt(0)}
                            </div>
                            <div>
                               <p className="text-xs font-black text-white uppercase italic">{log.userName}</p>
                               <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{log.action}</span>
                            </div>
                         </div>
                         <span className="text-[8px] font-bold text-gray-700">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 italic bg-gray-950 p-3 rounded-xl border border-gray-800">"{log.details}"</p>
                   </div>
                 ))}
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-4">
                 {state.logs.map(log => (
                   <div key={log.id} className="bg-gray-900 border border-gray-800 p-6 rounded-[32px] space-y-2 shadow-xl">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-blue-500 uppercase">{log.action}</span>
                         <span className="text-[8px] font-bold text-gray-700">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-300 italic">"{log.details}"</p>
                   </div>
                 ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
