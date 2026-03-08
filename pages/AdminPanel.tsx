
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

type AdminTab = 'dashboard' | 'users' | 'payouts' | 'features' | 'system' | 'activity' | 'logs';

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

  const handleResetCooldown = (type: 'SPIN' | 'SCRATCH' | 'ALL') => {
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
    if ((status === UserStatus.SUSPENDED || status === UserStatus.BANNED) && !actionReason) {
      return alert("A reason is required to suspend or ban a user.");
    }
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
                <button onClick={() => handleResetCooldown('SPIN')} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">Reset Spin</button>
                <button onClick={() => handleResetCooldown('SCRATCH')} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">Reset Scratch</button>
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
            <div className="space-y-3">
              <label className="text-[9px] font-black text-gray-500 uppercase px-1">Status Reason (Required for Suspension/Ban)</label>
              <input type="text" placeholder="Reason for status change..." value={actionReason || ''} onChange={e => setActionReason(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-white font-black outline-none focus:border-blue-600" />
            </div>
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
              <div className="grid grid-cols-1 gap-3">
                <button 
                  className="p-4 rounded-2xl border font-black text-[9px] uppercase transition-all flex items-center justify-center gap-2 bg-gray-950 border-gray-800 text-gray-500"
                  disabled
                >
                  Normal
                </button>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [paymentTxId, setPaymentTxId] = useState<Record<string, string>>({});

  const allWithdrawals = useMemo(() => state.allUsers.flatMap(user => 
    user.transactions
      .filter(tx => (tx.type === 'WITHDRAW' || tx.type === 'WITHDRAWAL'))
      .map(tx => ({ ...tx, userId: user.id, userName: user.name, userEmail: user.email }))
  ), [state.allUsers]);

  const stats = useMemo(() => {
    const pending = allWithdrawals.filter(tx => tx.status === 'PENDING');
    const completed = allWithdrawals.filter(tx => tx.status === 'COMPLETED');
    const rejected = allWithdrawals.filter(tx => tx.status === 'REJECTED');
    
    return {
      pendingCount: pending.length,
      pendingAmount: pending.reduce((sum, tx) => sum + tx.amount, 0),
      completedCount: completed.length,
      completedAmount: completed.reduce((sum, tx) => sum + tx.amount, 0),
      rejectedCount: rejected.length,
      rejectedAmount: rejected.reduce((sum, tx) => sum + tx.amount, 0),
    };
  }, [allWithdrawals]);

  const payouts = useMemo(() => allWithdrawals
    .filter(tx => tx.status === filter)
    .filter(tx => 
      (tx.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (tx.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.timestamp - a.timestamp), [allWithdrawals, filter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Withdrawal Dashboard Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-[32px] p-5 flex flex-col items-center justify-center gap-2 shadow-xl">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
            <Clock size={20} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{stats.pendingCount}</p>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Pending</p>
            <p className="text-[10px] font-bold text-yellow-500 mt-1">₹{(stats.pendingAmount * COIN_TO_INR_RATE).toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-[32px] p-5 flex flex-col items-center justify-center gap-2 shadow-xl">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <CheckCircle2 size={20} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{stats.completedCount}</p>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Completed</p>
            <p className="text-[10px] font-bold text-green-500 mt-1">₹{(stats.completedAmount * COIN_TO_INR_RATE).toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-[32px] p-5 flex flex-col items-center justify-center gap-2 shadow-xl">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <X size={20} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{stats.rejectedCount}</p>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Rejected</p>
            <p className="text-[10px] font-bold text-red-500 mt-1">₹{(stats.rejectedAmount * COIN_TO_INR_RATE).toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-[32px] p-5 flex flex-col items-center justify-center gap-2 shadow-xl">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Wallet size={20} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{allWithdrawals.length}</p>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Total Req</p>
            <p className="text-[10px] font-bold text-blue-500 mt-1">₹{((stats.pendingAmount + stats.completedAmount + stats.rejectedAmount) * COIN_TO_INR_RATE).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
        <input 
          type="text" 
          placeholder="Search payouts by user name or email..." 
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
                <p className="text-2xl font-black">₹{(tx.amount * COIN_TO_INR_RATE).toFixed(2)}</p>
                <p className="text-[10px] font-black text-gray-500 uppercase">{tx.amount.toLocaleString()} Coins</p>
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
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const dailyCheckins = state.activityLogs.filter(l => l.action === 'DAILY_BONUS' && l.timestamp > todayStart).length;
    const dailyCoinsIssued = state.activityLogs.filter(l => l.timestamp > todayStart && (l.action === 'SPIN_CLAIM' || l.action === 'DAILY_BONUS' || l.action === 'AD_REWARD')).reduce((acc, log) => {
      const match = log.details.match(/(\d+)/);
      return acc + (match ? parseInt(match[0]) : 0);
    }, 0);
    const spinClaims = state.activityLogs.filter(l => l.action === 'SPIN_CLAIM' && l.timestamp > todayStart).length;
    
    return {
      totalSTK: u.reduce((a, b) => a + b.coins, 0),
      payouts: u.flatMap(us => us.transactions).filter(t => t.type === 'WITHDRAW' && t.status === 'COMPLETED').reduce((a, b) => a + b.amount, 0),
      active: u.filter(us => Date.now() - us.lastActiveAt < 3600000).length,
      dailyCheckins,
      dailyCoinsIssued,
      spinClaims
    };
  }, [state.allUsers, state.activityLogs]);

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
                  <StatCard label="Daily Coins Issued" value={analytics.dailyCoinsIssued.toLocaleString()} sub={`₹${(analytics.dailyCoinsIssued * COIN_TO_INR_RATE).toLocaleString()}`} icon={Coins} color="bg-blue-500/10 text-blue-500" />
                  <StatCard label="Active Users" value={analytics.active} sub="Last 1 hour" icon={Network} color="bg-indigo-500/10 text-indigo-500" />
                  <StatCard label="Spin Claims" value={analytics.spinClaims} sub="Today" icon={Disc} color="bg-orange-500/10 text-orange-500" />
                  <StatCard label="Total Liability" value={`₹${(analytics.totalSTK * COIN_TO_INR_RATE).toFixed(0)}`} sub={`${analytics.totalSTK.toLocaleString()} Coins`} icon={AlertTriangle} color="bg-red-500/10 text-red-500" />
                  <StatCard label="Pending Withdrawals" value={pendingPayouts.length} sub="Requires action" icon={Clock} color="bg-yellow-500/10 text-yellow-500" />
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
                    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 ? (
                    <div className="text-center py-12 bg-gray-900 rounded-[40px] border border-gray-800 opacity-50">
                      <p className="text-[10px] font-black uppercase tracking-widest">No users found matching "{searchTerm}"</p>
                    </div>
                  ) : (
                    state.allUsers.filter(u => 
                      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
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

            {activeTab === 'payouts' && (
              <PayoutsTab setViewingUserId={setViewingUserId} />
            )}

            {activeTab === 'features' && (
               <div className="space-y-8">
                  <div className="bg-gray-900 border border-gray-800 rounded-[40px] p-8 space-y-8 shadow-2xl">
                     <div className="flex items-center gap-3">
                        <Disc className="text-orange-500" size={24} />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Spin Setup</h3>
                     </div>
                     <div className="grid grid-cols-5 gap-2">
                        {state.settings.spinRewards.map((val, idx) => (
                          <input key={idx} type="number" value={val ?? 0} onChange={e => {
                             const n = [...state.settings.spinRewards];
                             n[idx] = parseInt(e.target.value) || 0;
                             updateSettings({ spinRewards: n });
                          }} className="bg-gray-950 border border-gray-800 p-3 rounded-xl text-center text-xs font-black text-white" />
                        ))}
                     </div>
                     <div className="space-y-2 pt-4 border-t border-gray-800">
                        <label className="text-[9px] font-black text-gray-600 uppercase">Probabilities (%)</label>
                        <div className="grid grid-cols-5 gap-2">
                          {state.settings.spinRewards.map((val, idx) => (
                            <input key={`prob-${idx}`} type="number" value={state.settings.spinProbabilities[val.toString()] ?? 0} onChange={e => {
                               const p = { ...state.settings.spinProbabilities };
                               p[val.toString()] = parseInt(e.target.value) || 0;
                               updateSettings({ spinProbabilities: p });
                            }} className="bg-gray-950 border border-gray-800 p-3 rounded-xl text-center text-xs font-black text-white" />
                          ))}
                        </div>
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
                        <Sparkles className="text-purple-500" size={24} />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Scratch Setup</h3>
                     </div>
                     <div className="grid grid-cols-5 gap-2">
                        {state.settings.scratchRewards.map((val, idx) => (
                          <input key={idx} type="number" value={val ?? 0} onChange={e => {
                             const n = [...state.settings.scratchRewards];
                             n[idx] = parseInt(e.target.value) || 0;
                             updateSettings({ scratchRewards: n });
                          }} className="bg-gray-950 border border-gray-800 p-3 rounded-xl text-center text-xs font-black text-white" />
                        ))}
                     </div>
                     <div className="space-y-2 pt-4 border-t border-gray-800">
                        <label className="text-[9px] font-black text-gray-600 uppercase">Probabilities (%)</label>
                        <div className="grid grid-cols-5 gap-2">
                          {state.settings.scratchRewards.map((val, idx) => (
                            <input key={`prob-${idx}`} type="number" value={state.settings.scratchProbabilities[val.toString()] ?? 0} onChange={e => {
                               const p = { ...state.settings.scratchProbabilities };
                               p[val.toString()] = parseInt(e.target.value) || 0;
                               updateSettings({ scratchProbabilities: p });
                            }} className="bg-gray-950 border border-gray-800 p-3 rounded-xl text-center text-xs font-black text-white" />
                          ))}
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-600 uppercase">Max Daily Scratches</label>
                           <input type="number" value={state.settings.maxDailyScratchesNormal ?? 0} onChange={e => updateSettings({ maxDailyScratchesNormal: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-center text-white font-black" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-600 uppercase">Cooldown (Min)</label>
                           <input type="number" value={state.settings.scratchCooldownMinutes ?? 0} onChange={e => updateSettings({ scratchCooldownMinutes: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-center text-white font-black" />
                        </div>
                     </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-[40px] p-8 space-y-8 shadow-2xl">
                     <div className="flex items-center gap-3">
                        <PlayCircle className="text-blue-500" size={24} />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">General Rewards</h3>
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
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-600 uppercase">Daily Bonus Base</label>
                           <input type="number" value={state.settings.dailyBonusReward ?? 0} onChange={e => updateSettings({ dailyBonusReward: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-center text-white font-black" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-600 uppercase">Referral Reward</label>
                           <input type="number" value={state.settings.referralReward ?? 0} onChange={e => updateSettings({ referralReward: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-center text-white font-black" />
                        </div>
                        <div className="space-y-2 col-span-2">
                           <label className="text-[9px] font-black text-gray-600 uppercase">Daily Earning Cap</label>
                           <input type="number" value={state.settings.dailyCapNormal ?? 0} onChange={e => updateSettings({ dailyCapNormal: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-center text-white font-black" />
                        </div>
                     </div>
                     <div className="space-y-2 pt-4 border-t border-gray-800">
                        <label className="text-[9px] font-black text-red-500 uppercase flex items-center gap-2"><AlertTriangle size={12} /> Emergency Reward Reduction (%)</label>
                        <input type="number" min="0" max="100" value={state.settings.emergencyRewardReduction ?? 0} onChange={e => updateSettings({ emergencyRewardReduction: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-red-900/50 p-4 rounded-2xl text-center text-red-500 font-black focus:border-red-500 outline-none" placeholder="e.g. 50 for half rewards" />
                        <p className="text-[8px] text-gray-500 uppercase font-bold text-center">Instantly reduces all spin rewards by this percentage.</p>
                     </div>
                     <div className="space-y-2 pt-4 border-t border-gray-800">
                        <label className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-2"><TrendingUp size={12} /> Global Reward Multiplier</label>
                        <input type="number" min="0.1" step="0.1" value={state.settings.globalRewardMultiplier ?? 1} onChange={e => updateSettings({ globalRewardMultiplier: parseFloat(e.target.value) || 1 })} className="w-full bg-gray-950 border border-blue-900/50 p-4 rounded-2xl text-center text-blue-500 font-black focus:border-blue-500 outline-none" placeholder="e.g. 1.5 for 50% more" />
                        <p className="text-[8px] text-gray-500 uppercase font-bold text-center">Multiplies all rewards (manual control only).</p>
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
                             <label className="text-[9px] font-black text-gray-600 uppercase">Withdraw Fee (%)</label>
                             <input type="number" value={state.settings.withdrawalFeeNormal} onChange={e => updateSettings({ withdrawalFeeNormal: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-5 rounded-3xl text-center text-white font-black" />
                          </div>
                          <div className="space-y-2 col-span-2">
                             <label className="text-[9px] font-black text-gray-600 uppercase">Daily Withdraw Limit</label>
                             <input type="number" value={state.settings.dailyWithdrawalLimit || 5000} onChange={e => updateSettings({ dailyWithdrawalLimit: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-5 rounded-3xl text-center text-white font-black" />
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
