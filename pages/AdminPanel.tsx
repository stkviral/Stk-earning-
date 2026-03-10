import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { 
  LayoutDashboard, Users, CreditCard, ShieldAlert, Settings, 
  ScrollText, Search, Coins, TrendingUp, AlertTriangle,
  Ban, ShieldCheck, Activity, Clock, CheckCircle2, X, ArrowLeft,
  Lock, Server, Database, Sparkles, Sliders, Bell, Disc, PlayCircle,
  UserCog, Terminal, ShieldOff, ChevronRight, Plus, Minus, Radio, Laptop,
  Wallet, Network
} from 'lucide-react';
import { User, UserTag, UserStatus, COIN_TO_INR_RATE, AppSettings } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type AdminTab = 'dashboard' | 'users' | 'payouts' | 'features' | 'system' | 'activity' | 'logs' | 'security';

const StatCard = ({ label, value, sub, icon: Icon, color }: any) => (
  <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-3 shadow-lg flex flex-col justify-between">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
        <Icon size={20} className={color.replace('bg-', 'text-').split(' ')[0]} />
      </div>
    </div>
    <div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-1">{sub}</p>
    </div>
  </div>
);

const NavItem = ({ tab, icon: Icon, label, activeTab, setActiveTab, setViewingUserId }: any) => (
  <button
    onClick={() => { setActiveTab(tab); setViewingUserId(null); }}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left ${activeTab === tab ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
  >
    <Icon size={18} />
    <span className="text-sm font-semibold tracking-wide">{label}</span>
  </button>
);

const UserDetailView: React.FC<{ user: User; onBack: () => void }> = ({ user, onBack }) => {
  const { state, adminActions, calculateRiskScore } = useApp();
  const [activeTab, setActiveTab] = useState<'activity' | 'edit' | 'security'>('activity');
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
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <img src={user.avatar} className="w-16 h-16 rounded-xl border border-gray-700" alt="" />
          <div>
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${user.status === UserStatus.ACTIVE ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{user.status}</span>
               <span className="text-xs text-gray-500 font-medium">{user.email}</span>
            </div>
          </div>
        </div>
        <button 
           onClick={() => adminActions.impersonateUser(user.id)}
           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
         >
            <UserCog size={16} /> Impersonate
         </button>
      </div>

      <div className="flex border-b border-gray-800">
        {(['activity', 'edit', 'security'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`px-6 py-3 text-sm font-semibold capitalize transition-all border-b-2 ${activeTab === t ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-semibold text-white">Balance Adjustment</h3>
              <input type="text" placeholder="Reason for adjustment..." value={actionReason || ''} onChange={e => setActionReason(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
              <div className="flex gap-3">
                <input type="number" placeholder="Amount" value={coinAdjustment || ''} onChange={e => setCoinAdjustment(e.target.value)} className="flex-1 bg-gray-950 border border-gray-800 p-3 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                <button onClick={() => handleAdjustCoins('ADD')} className="bg-green-600/20 text-green-500 border border-green-600/30 px-4 rounded-lg hover:bg-green-600/30 transition-colors"><Plus size={20} /></button>
                <button onClick={() => handleAdjustCoins('REMOVE')} className="bg-red-600/20 text-red-500 border border-red-600/30 px-4 rounded-lg hover:bg-red-600/30 transition-colors"><Minus size={20} /></button>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button onClick={() => handleResetCooldown('SPIN')} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors">Reset Spin</button>
                <button onClick={() => handleResetCooldown('SCRATCH')} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors">Reset Scratch</button>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-4">
               <div className="flex items-center justify-between">
                  <div>
                     <h3 className="text-lg font-semibold text-white">Ad Access</h3>
                     <p className="text-xs text-gray-500 mt-1">Block user from viewing ads</p>
                  </div>
                  <button 
                     onClick={() => adminActions.updateUserSettings(user.id, { adsBlocked: !user.adsBlocked })}
                     className={`w-14 h-8 rounded-full transition-all relative ${!user.adsBlocked ? 'bg-green-500' : 'bg-red-500'}`}
                  >
                     <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${!user.adsBlocked ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>
               <div className="pt-4 border-t border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Transactions</h3>
                  <div className="space-y-2">
                     {(user.transactions || []).slice(0, 5).map(tx => (
                        <div key={tx.id} className="flex flex-col p-3 bg-gray-950 rounded-lg border border-gray-800">
                           <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-300">{tx.method}</span>
                              <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount}</span>
                           </div>
                           {tx.type === 'WITHDRAW' && tx.status === 'PENDING' && (
                              <div className="mt-2 pt-2 border-t border-gray-800 flex gap-2">
                                 <button 
                                    onClick={() => {
                                       const txId = prompt("Enter Payment TxID to approve:");
                                       if (txId) adminActions.approveWithdrawal(user.id, tx.id, txId);
                                    }}
                                    className="flex-1 bg-green-600/20 text-green-500 hover:bg-green-600/30 py-1.5 rounded text-xs font-bold transition-colors"
                                 >
                                    Approve
                                 </button>
                                 <button 
                                    onClick={() => {
                                       const reason = prompt("Enter Rejection Reason:");
                                       if (reason) adminActions.rejectWithdrawal(user.id, tx.id, reason);
                                    }}
                                    className="flex-1 bg-red-600/20 text-red-500 hover:bg-red-600/30 py-1.5 rounded text-xs font-bold transition-colors"
                                 >
                                    Reject
                                 </button>
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}
        {activeTab === 'edit' && (
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-6 max-w-2xl">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Account Status</h3>
              <input type="text" placeholder="Reason for status change (Required for Suspension/Ban)" value={actionReason || ''} onChange={e => setActionReason(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
              <div className="grid grid-cols-3 gap-4">
                {(Object.values(UserStatus)).map(status => (
                  <button 
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    className={`p-3 rounded-lg border text-sm font-semibold transition-all ${user.status === status ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-600'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4 pt-6 border-t border-gray-800">
              <h3 className="text-lg font-semibold text-white">Profile Details</h3>
              <div className="space-y-2">
                 <label className="text-xs font-semibold text-gray-500 uppercase">Display Name</label>
                 <input type="text" value={editName || ''} onChange={e => setEditName(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
              </div>
              <button onClick={handleUpdateProfile} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors">Save Changes</button>
            </div>
          </div>
        )}
        {activeTab === 'security' && (
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-6 max-w-2xl">
             <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="text-red-500" size={24} />
                <h3 className="text-xl font-bold text-white">Fraud Detection & Security</h3>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                   <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Device ID</p>
                   <p className="text-sm font-mono text-gray-300 break-all">{user.deviceId || 'N/A'}</p>
                </div>
                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                   <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Known IP</p>
                   <p className="text-sm font-mono text-gray-300">{user.lastIp || 'N/A'}</p>
                </div>
             </div>
             <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 flex items-center justify-between mt-6">
                <div>
                   <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Calculated Risk Score</p>
                   <p className={`text-3xl font-bold ${currentRiskScore > 70 ? 'text-red-500' : 'text-green-500'}`}>{currentRiskScore}/100</p>
                </div>
                {currentRiskScore > 70 && (
                   <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest border border-red-500/20 flex items-center gap-2">
                      <AlertTriangle size={18} /> High Risk
                   </div>
                )}
             </div>
             <div className="pt-6 border-t border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">System Exemptions</h3>
                <div className="space-y-3">
                   <div className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <div>
                         <p className="text-sm font-semibold text-gray-300">Device Limit Exempted</p>
                         <p className="text-xs text-gray-500 mt-1">Bypass max accounts per device rule.</p>
                      </div>
                      <button 
                         onClick={() => adminActions.updateUserSettings(user.id, { deviceLimitExempt: !user.deviceLimitExempt })}
                         className={`w-14 h-8 rounded-full transition-all relative ${user.deviceLimitExempt ? 'bg-green-500' : 'bg-gray-700'}`}
                      >
                         <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${user.deviceLimitExempt ? 'left-7' : 'left-1'}`} />
                      </button>
                   </div>
                   <div className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <div>
                         <p className="text-sm font-semibold text-gray-300">Reward Limit Exempted</p>
                         <p className="text-xs text-gray-500 mt-1">Bypass daily earning caps.</p>
                      </div>
                      <button 
                         onClick={() => adminActions.updateUserSettings(user.id, { rewardLimitExempt: !user.rewardLimitExempt })}
                         className={`w-14 h-8 rounded-full transition-all relative ${user.rewardLimitExempt ? 'bg-green-500' : 'bg-gray-700'}`}
                      >
                         <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${user.rewardLimitExempt ? 'left-7' : 'left-1'}`} />
                      </button>
                   </div>
                   <div className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <div>
                         <p className="text-sm font-semibold text-gray-300">Withdrawal Flag Exempted</p>
                         <p className="text-xs text-gray-500 mt-1">Bypass automatic high-risk flags on withdrawals.</p>
                      </div>
                      <button 
                         onClick={() => adminActions.updateUserSettings(user.id, { withdrawalFlagExempt: !user.withdrawalFlagExempt })}
                         className={`w-14 h-8 rounded-full transition-all relative ${user.withdrawalFlagExempt ? 'bg-green-500' : 'bg-gray-700'}`}
                      >
                         <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${user.withdrawalFlagExempt ? 'left-7' : 'left-1'}`} />
                      </button>
                   </div>
                   <div className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <div>
                         <p className="text-sm font-semibold text-gray-300">Fraud Detection Exempted</p>
                         <p className="text-xs text-gray-500 mt-1">Bypass risk scoring and suspicious activity logging.</p>
                      </div>
                      <button 
                         onClick={() => adminActions.updateUserSettings(user.id, { fraudDetectionExempt: !user.fraudDetectionExempt })}
                         className={`w-14 h-8 rounded-full transition-all relative ${user.fraudDetectionExempt ? 'bg-green-500' : 'bg-gray-700'}`}
                      >
                         <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${user.fraudDetectionExempt ? 'left-7' : 'left-1'}`} />
                      </button>
                   </div>
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
    (user.transactions || [])
      .filter(tx => (tx.type === 'WITHDRAW' || tx.type === 'WITHDRAWAL'))
      .map(tx => ({ ...tx, userId: user.id, userName: user.name, userEmail: user.email }))
  ).sort((a, b) => b.timestamp - a.timestamp), [state.allUsers]);

  const payouts = useMemo(() => allWithdrawals
    .filter(tx => tx.status === filter)
    .filter(tx => 
      (tx.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (tx.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [allWithdrawals, filter, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex gap-2">
           {(['PENDING', 'COMPLETED', 'REJECTED'] as const).map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
             >
               {f} ({allWithdrawals.filter(tx => tx.status === f).length})
             </button>
           ))}
         </div>
         <div className="relative w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
           <input 
             type="text" 
             placeholder="Search payouts..." 
             value={searchTerm || ''} 
             onChange={e => setSearchTerm(e.target.value)} 
             className="w-full bg-gray-900 border border-gray-800 py-2 pl-10 pr-4 rounded-lg text-sm text-white outline-none focus:border-blue-500 transition-colors" 
           />
         </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-950 border-b border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                     <th className="p-4">User</th>
                     <th className="p-4">Method</th>
                     <th className="p-4">Amount</th>
                     <th className="p-4">Date</th>
                     <th className="p-4">Action/Details</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-800">
                  {payouts.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">No {filter.toLowerCase()} payouts found.</td>
                     </tr>
                  ) : (
                     payouts.map(tx => (
                        <tr key={tx.id} className="hover:bg-gray-800/30 transition-colors">
                           <td className="p-4">
                              <button onClick={() => setViewingUserId(tx.userId)} className="text-blue-400 hover:text-blue-300 font-medium text-sm text-left">
                                 {tx.userName}
                              </button>
                           </td>
                           <td className="p-4 text-sm text-gray-300">{tx.method}</td>
                           <td className="p-4">
                              <div className="text-sm font-bold text-white">₹{(tx.amount * COIN_TO_INR_RATE).toFixed(2)}</div>
                              <div className="text-xs text-gray-500">{tx.amount.toLocaleString()} Coins</div>
                           </td>
                           <td className="p-4 text-sm text-gray-400">{new Date(tx.timestamp).toLocaleString()}</td>
                           <td className="p-4">
                              {filter === 'PENDING' && (
                                 <div className="flex flex-col gap-2 min-w-[200px]">
                                    <input 
                                       type="text" 
                                       placeholder="Payment TxID" 
                                       value={paymentTxId[tx.id] || ''} 
                                       onChange={e => setPaymentTxId(prev => ({ ...prev, [tx.id]: e.target.value }))} 
                                       className="bg-gray-950 border border-gray-800 px-3 py-1.5 rounded text-xs text-white outline-none focus:border-green-500" 
                                    />
                                    <input 
                                       type="text" 
                                       placeholder="Rejection Reason" 
                                       value={rejectionReason[tx.id] || ''} 
                                       onChange={e => setRejectionReason(prev => ({ ...prev, [tx.id]: e.target.value }))} 
                                       className="bg-gray-950 border border-gray-800 px-3 py-1.5 rounded text-xs text-white outline-none focus:border-red-500" 
                                    />
                                    <div className="flex gap-2 mt-1">
                                       <button 
                                          onClick={() => adminActions.approveWithdrawal(tx.userId, tx.id, paymentTxId[tx.id])} 
                                          className="flex-1 bg-green-600/20 text-green-500 hover:bg-green-600/30 py-1.5 rounded text-xs font-bold transition-colors"
                                       >
                                          Approve
                                       </button>
                                       <button 
                                          onClick={() => {
                                             if (!rejectionReason[tx.id]) return alert("Rejection reason is required");
                                             adminActions.rejectWithdrawal(tx.userId, tx.id, rejectionReason[tx.id]);
                                          }} 
                                          className="flex-1 bg-red-600/20 text-red-500 hover:bg-red-600/30 py-1.5 rounded text-xs font-bold transition-colors"
                                       >
                                          Reject
                                       </button>
                                    </div>
                                 </div>
                              )}
                              {filter === 'COMPLETED' && <span className="text-xs text-green-400 font-mono">{tx.paymentTxId || 'N/A'}</span>}
                              {filter === 'REJECTED' && <span className="text-xs text-red-400">{tx.rejectionReason || 'N/A'}</span>}
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const { state, updateSettings, updateLogo, calculateRiskScore, adminActions } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  const analytics = useMemo(() => {
    const u = state.allUsers;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const dailyCoinsIssued = state.activityLogs.filter(l => l.timestamp > todayStart && (l.action === 'SPIN_CLAIM' || l.action === 'SCRATCH_CLAIM' || l.action === 'DAILY_BONUS' || l.action === 'AD_REWARD')).reduce((acc, log) => {
      const match = log.details.match(/(\d+)/);
      return acc + (match ? parseInt(match[0]) : 0);
    }, 0);
    const totalWithdrawalRequests = u.flatMap(us => us.transactions || []).filter(t => t.type === 'WITHDRAW').length;
    const pendingWithdrawals = u.flatMap(us => us.transactions || []).filter(t => t.type === 'WITHDRAW' && t.status === 'PENDING').length;
    
    return {
      totalUsers: u.length,
      totalSTK: u.reduce((a, b) => a + b.coins, 0),
      active: u.filter(us => Date.now() - us.lastActiveAt < 3600000).length,
      dailyCoinsIssued,
      totalWithdrawalRequests,
      pendingWithdrawals,
      totalAdsRewardClaims: state.activityLogs.filter(l => l.action === 'AD_REWARD').length,
    };
  }, [state.allUsers, state.activityLogs]);

  // Generate chart data from activity logs (group by hour for the last 24 hours)
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const logsInHour = state.activityLogs.filter(l => {
        const logDate = new Date(l.timestamp);
        return logDate.getHours() === d.getHours() && logDate.getDate() === d.getDate();
      });

      data.push({
        time: hourStr,
        actions: logsInHour.length,
      });
    }
    return data;
  }, [state.activityLogs]);

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 font-sans pb-20">
      {/* Mobile Header / Navigation */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between overflow-x-auto no-scrollbar gap-2 shrink-0">
         <NavItem tab="dashboard" icon={LayoutDashboard} label="Stats" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
         <NavItem tab="users" icon={Users} label="Users" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
         <NavItem tab="payouts" icon={CreditCard} label="Pay" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
         <NavItem tab="features" icon={Sliders} label="Rewards" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
         <NavItem tab="system" icon={Settings} label="System" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
         <NavItem tab="security" icon={ShieldAlert} label="Security" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
         <NavItem tab="activity" icon={Activity} label="Logs" activeTab={activeTab} setActiveTab={setActiveTab} setViewingUserId={setViewingUserId} />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
         {viewingUserId && state.allUsers.find(u => u.id === viewingUserId) ? (
            <UserDetailView user={state.allUsers.find(u => u.id === viewingUserId)!} onBack={() => setViewingUserId(null)} />
         ) : (
            <div className="space-y-6 animate-in fade-in duration-500 w-full">
               
               {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                     <div>
                        <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
                        <div className="grid grid-cols-2 gap-4">
                           <StatCard label="Total Users" value={analytics.totalUsers} sub={`${analytics.active} active`} icon={Users} color="bg-blue-500 text-blue-500" />
                           <StatCard label="Liability" value={`₹${(analytics.totalSTK * COIN_TO_INR_RATE).toFixed(0)}`} sub={`${analytics.totalSTK} Coins`} icon={Database} color="bg-purple-500 text-purple-500" />
                           <StatCard label="Pending" value={analytics.pendingWithdrawals} sub="Requires action" icon={Clock} color="bg-yellow-500 text-yellow-500" />
                           <StatCard label="Issued Today" value={analytics.dailyCoinsIssued} sub={`₹${(analytics.dailyCoinsIssued * COIN_TO_INR_RATE).toFixed(2)}`} icon={Coins} color="bg-green-500 text-green-500" />
                        </div>
                     </div>

                     <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg">
                        <h3 className="text-sm font-semibold text-white mb-4">Activity (24h)</h3>
                        <div className="h-48 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                 <defs>
                                    <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                 <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                 <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                 <Tooltip 
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                    itemStyle={{ color: '#60a5fa' }}
                                 />
                                 <Area type="monotone" dataKey="actions" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActions)" />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     {/* Recent Pending Withdrawals */}
                     <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="text-sm font-semibold text-white">Pending Withdrawals</h3>
                           <button 
                              onClick={() => setActiveTab('payouts')}
                              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                           >
                              View All <ChevronRight size={14} />
                           </button>
                        </div>
                        <div className="space-y-3">
                           {state.allUsers.flatMap(u => 
                              (u.transactions || [])
                                 .filter(tx => tx.type === 'WITHDRAW' && tx.status === 'PENDING')
                                 .map(tx => ({ ...tx, userName: u.name, userId: u.id }))
                           ).sort((a, b) => b.timestamp - a.timestamp).slice(0, 3).map(tx => (
                              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                                 <div>
                                    <p className="text-sm font-semibold text-white">{tx.userName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{new Date(tx.timestamp).toLocaleString()}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-sm font-bold text-yellow-500">₹{(tx.amount * COIN_TO_INR_RATE).toFixed(2)}</p>
                                    <button 
                                       onClick={() => { setActiveTab('payouts'); setViewingUserId(tx.userId); }}
                                       className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1 hover:text-blue-300 transition-colors"
                                    >
                                       Review
                                    </button>
                                 </div>
                              </div>
                           ))}
                           {analytics.pendingWithdrawals === 0 && (
                              <div className="text-center py-6 text-gray-500 text-sm">
                                 No pending withdrawals.
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'users' && (
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Users</h2>
                     </div>
                     <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                           type="text" 
                           placeholder="Search users..." 
                           value={searchTerm || ''} 
                           onChange={e => setSearchTerm(e.target.value)} 
                           className="w-full bg-gray-900 border border-gray-800 py-3 pl-10 pr-4 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition-colors" 
                        />
                     </div>

                     <div className="space-y-3">
                        {state.allUsers.filter(u => 
                           (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(u => (
                           <div key={u.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <img src={u.avatar} className="w-10 h-10 rounded-lg border border-gray-700" />
                                 <div>
                                    <p className="text-sm font-semibold text-white">{u.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                       <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${u.status === UserStatus.ACTIVE ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                          {u.status}
                                       </span>
                                       <span className="text-xs text-gray-400">{u.coins} Coins</span>
                                       {(u.deviceLimitExempt || u.rewardLimitExempt || u.withdrawalFlagExempt || u.fraudDetectionExempt) && (
                                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-500">
                                             Exempted
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <button 
                                 onClick={() => setViewingUserId(u.id)}
                                 className="text-blue-400 hover:text-blue-300 text-xs font-medium px-3 py-1.5 bg-blue-500/10 rounded-lg transition-colors"
                              >
                                 Manage
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'payouts' && (
                  <div className="space-y-4">
                     <h2 className="text-xl font-bold text-white">Withdrawals</h2>
                     <PayoutsTab setViewingUserId={setViewingUserId} />
                  </div>
               )}

               {activeTab === 'features' && (
                  <div className="space-y-6">
                     <h2 className="text-xl font-bold text-white">Rewards</h2>
                     
                     {/* Spin Control */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <Disc className="text-blue-500" size={20} />
                           <h3 className="text-base font-bold text-white">Spin Wheel</h3>
                        </div>
                        <div className="space-y-3">
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Rewards</label>
                              <div className="grid grid-cols-5 gap-1.5">
                                 {state.settings.spinRewards.map((val, idx) => (
                                    <input key={idx} type="number" value={val ?? 0} onChange={e => {
                                       const n = [...state.settings.spinRewards];
                                       n[idx] = parseInt(e.target.value) || 0;
                                       updateSettings({ spinRewards: n });
                                    }} className="bg-gray-950 border border-gray-800 p-1.5 rounded text-center text-xs font-semibold text-white outline-none focus:border-blue-500" />
                                 ))}
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Daily Spins</label>
                                 <input type="number" value={state.settings.maxDailySpinsNormal ?? 0} onChange={e => updateSettings({ maxDailySpinsNormal: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                              </div>
                              <div>
                                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Cooldown (Min)</label>
                                 <input type="number" value={state.settings.spinCooldownMinutes ?? 0} onChange={e => updateSettings({ spinCooldownMinutes: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Scratch Control */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <Sparkles className="text-purple-500" size={20} />
                           <h3 className="text-base font-bold text-white">Scratch Card</h3>
                        </div>
                        <div className="space-y-3">
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Rewards</label>
                              <div className="grid grid-cols-5 gap-1.5">
                                 {state.settings.scratchRewards.map((val, idx) => (
                                    <input key={idx} type="number" value={val ?? 0} onChange={e => {
                                       const n = [...state.settings.scratchRewards];
                                       n[idx] = parseInt(e.target.value) || 0;
                                       updateSettings({ scratchRewards: n });
                                    }} className="bg-gray-950 border border-gray-800 p-1.5 rounded text-center text-xs font-semibold text-white outline-none focus:border-blue-500" />
                                 ))}
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Daily Scratches</label>
                                 <input type="number" value={state.settings.maxDailyScratchesNormal ?? 0} onChange={e => updateSettings({ maxDailyScratchesNormal: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                              </div>
                              <div>
                                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Cooldown (Min)</label>
                                 <input type="number" value={state.settings.scratchCooldownMinutes ?? 0} onChange={e => updateSettings({ scratchCooldownMinutes: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Profit Protection */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <ShieldCheck className="text-green-500" size={20} />
                           <h3 className="text-base font-bold text-white">Profit Limits</h3>
                        </div>
                        <div className="space-y-3">
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Daily Cap (Coins)</label>
                              <input type="number" value={state.settings.dailyCapNormal ?? 0} onChange={e => updateSettings({ dailyCapNormal: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Global Multiplier</label>
                                 <input type="number" step="0.1" value={state.settings.globalRewardMultiplier ?? 1} onChange={e => updateSettings({ globalRewardMultiplier: parseFloat(e.target.value) || 1 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                              </div>
                              <div>
                                 <label className="text-[10px] font-semibold text-red-500 uppercase tracking-wider block mb-1.5">Reduction (%)</label>
                                 <input type="number" min="0" max="100" value={state.settings.emergencyRewardReduction ?? 0} onChange={e => updateSettings({ emergencyRewardReduction: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-red-900/50 p-2 rounded-lg text-sm text-red-500 outline-none focus:border-red-500" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'system' && (
                  <div className="space-y-6">
                     <h2 className="text-xl font-bold text-white mb-4">System</h2>
                     
                     {/* App Logo */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-3">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <Settings className="text-blue-500" size={20} />
                           <h3 className="text-base font-bold text-white">App Logo</h3>
                        </div>
                        <div className="flex items-center gap-4">
                           <img src={state.logoUrl} alt="App Logo" className="w-16 h-16 rounded-xl border border-gray-800 object-cover bg-white" />
                           <div className="flex-1">
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Logo URL</label>
                              <div className="flex gap-2">
                                 <input 
                                    type="text" 
                                    id="logoUrlInput"
                                    defaultValue={state.logoUrl}
                                    placeholder="https://example.com/logo.png"
                                    className="flex-1 bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-blue-500" 
                                 />
                                 <button 
                                    onClick={() => {
                                       const input = document.getElementById('logoUrlInput') as HTMLInputElement;
                                       if (input && input.value) updateLogo(input.value);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg text-xs font-bold transition-colors"
                                 >
                                    Update
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Global Announcement */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-3">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <Bell className="text-yellow-500" size={20} />
                           <h3 className="text-base font-bold text-white">Announcement</h3>
                        </div>
                        <textarea 
                           value={state.settings.systemNotification}
                           onChange={e => updateSettings({ systemNotification: e.target.value })}
                           placeholder="Broadcast message..."
                           className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg text-sm text-white outline-none focus:border-blue-500 min-h-[80px] resize-none" 
                        />
                     </div>

                     {/* Ad Control */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-3">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <PlayCircle className="text-pink-500" size={20} />
                           <h3 className="text-base font-bold text-white">Ad Control</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Max Daily Ads</label>
                              <input type="number" value={state.settings.maxDailyAds ?? 0} onChange={e => updateSettings({ maxDailyAds: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                           </div>
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Reward (Coins)</label>
                              <input type="number" value={state.settings.adRewardCoins ?? 0} onChange={e => updateSettings({ adRewardCoins: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                           </div>
                        </div>
                     </div>

                     {/* Feature Toggles */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-3">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <Sliders className="text-indigo-500" size={20} />
                           <h3 className="text-base font-bold text-white">Toggles</h3>
                        </div>
                        <div className="space-y-2">
                           {[
                              { key: 'spinEnabled', label: 'Fortune Wheel' },
                              { key: 'scratchEnabled', label: 'Scratch Cards' },
                              { key: 'videosEnabled', label: 'Video Rewards' },
                              { key: 'adsEnabled', label: 'Global Ads' },
                              { key: 'withdrawalsEnabled', label: 'Withdrawals' },
                              { key: 'maintenanceMode', label: 'Maintenance Mode', color: 'red' },
                           ].map(feature => (
                              <div key={feature.key} className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                                 <span className="text-xs font-semibold text-gray-300">{feature.label}</span>
                                 <button 
                                    onClick={() => updateSettings({ [feature.key]: !state.settings[feature.key as keyof AppSettings] })}
                                    className={`w-10 h-5 rounded-full transition-all relative ${state.settings[feature.key as keyof AppSettings] ? (feature.color === 'red' ? 'bg-red-600' : 'bg-blue-600') : 'bg-gray-800'}`}
                                 >
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${state.settings[feature.key as keyof AppSettings] ? 'left-5' : 'left-0.5'}`} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'security' && (
                  <div className="space-y-6">
                     <h2 className="text-xl font-bold text-white mb-4">Security & Anti-Fraud</h2>
                     
                     {/* Device Limit Control */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <Laptop className="text-blue-500" size={20} />
                           <h3 className="text-base font-bold text-white">Device Limit Control</h3>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                           <div>
                              <p className="text-sm font-semibold text-gray-300">Enable Device Limits</p>
                              <p className="text-xs text-gray-500 mt-1">Restrict multiple accounts per device.</p>
                           </div>
                           <button 
                              onClick={() => updateSettings({ deviceLimitEnabled: !state.settings.deviceLimitEnabled })}
                              className={`w-12 h-6 rounded-full transition-all relative ${state.settings.deviceLimitEnabled ? 'bg-blue-600' : 'bg-gray-700'}`}
                           >
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${state.settings.deviceLimitEnabled ? 'left-7' : 'left-1'}`} />
                           </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                           <div>
                              <p className="text-sm font-semibold text-gray-300">Max Accounts Per Device</p>
                              <p className="text-xs text-gray-500 mt-1">Default is 3.</p>
                           </div>
                           <input 
                              type="number" 
                              value={state.settings.maxAccountsPerDevice || 3} 
                              onChange={e => updateSettings({ maxAccountsPerDevice: parseInt(e.target.value) || 3 })}
                              className="w-20 bg-gray-900 border border-gray-700 p-2 rounded-lg text-sm text-white outline-none text-center"
                           />
                        </div>
                        <button 
                           onClick={() => {
                              if (window.confirm("Are you sure you want to reset all device limit exemptions globally?")) {
                                 adminActions.resetDeviceRestrictions();
                              }
                           }}
                           className="w-full bg-red-600/20 text-red-500 hover:bg-red-600/30 py-3 rounded-xl text-sm font-bold transition-colors mt-2"
                        >
                           Reset All Device Exemptions
                        </button>
                     </div>

                     {/* Advanced Profit Protection */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <ShieldCheck className="text-green-500" size={20} />
                           <h3 className="text-base font-bold text-white">Advanced Profit Protection</h3>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                           <div>
                              <p className="text-sm font-semibold text-gray-300">Daily Reward Budget</p>
                              <p className="text-xs text-gray-500 mt-1">Auto-reduce rewards if budget reached.</p>
                           </div>
                           <input 
                              type="number" 
                              value={state.settings.dailyRewardBudget ?? 100000} 
                              onChange={e => updateSettings({ dailyRewardBudget: parseInt(e.target.value) || 0 })}
                              className="w-24 bg-gray-900 border border-gray-700 p-2 rounded-lg text-sm text-white outline-none text-center"
                           />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                           <div>
                              <p className="text-sm font-semibold text-gray-300">Reward Delay (ms)</p>
                              <p className="text-xs text-gray-500 mt-1">Delay before crediting to stop auto-clickers.</p>
                           </div>
                           <input 
                              type="number" 
                              value={state.settings.rewardDelayMs ?? 2000} 
                              onChange={e => updateSettings({ rewardDelayMs: parseInt(e.target.value) || 0 })}
                              className="w-24 bg-gray-900 border border-gray-700 p-2 rounded-lg text-sm text-white outline-none text-center"
                           />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                           <div>
                              <p className="text-sm font-semibold text-gray-300">Auto-Flag Withdrawals</p>
                              <p className="text-xs text-gray-500 mt-1">Flag high-risk users automatically.</p>
                           </div>
                           <button 
                              onClick={() => updateSettings({ autoFlagWithdrawals: !state.settings.autoFlagWithdrawals })}
                              className={`w-12 h-6 rounded-full transition-all relative ${state.settings.autoFlagWithdrawals ? 'bg-blue-600' : 'bg-gray-700'}`}
                           >
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${state.settings.autoFlagWithdrawals ? 'left-7' : 'left-1'}`} />
                           </button>
                        </div>
                     </div>

                     {/* Device Management */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <Network className="text-purple-500" size={20} />
                           <h3 className="text-base font-bold text-white">Device Management</h3>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar">
                           {Object.entries(
                              state.allUsers.reduce((acc, user) => {
                                 if (!user.deviceId) return acc;
                                 if (!acc[user.deviceId]) acc[user.deviceId] = { count: 0, lastActive: 0, users: [] };
                                 acc[user.deviceId].count++;
                                 acc[user.deviceId].users.push(user.name);
                                 if ((user.lastActiveAt || 0) > acc[user.deviceId].lastActive) acc[user.deviceId].lastActive = user.lastActiveAt || 0;
                                 return acc;
                              }, {} as Record<string, { count: number, lastActive: number, users: string[] }>)
                           ).sort((a, b) => (b[1] as any).count - (a[1] as any).count).map(([deviceId, data]: [string, any]) => (
                              <div key={deviceId} className="p-4 bg-gray-950 rounded-xl border border-gray-800">
                                 <div className="flex justify-between items-start mb-2">
                                    <div>
                                       <p className="text-xs font-mono text-gray-400 break-all">{deviceId}</p>
                                       <p className="text-[10px] text-gray-500 mt-1">Last Active: {new Date(data.lastActive).toLocaleString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${data.count > (state.settings.maxAccountsPerDevice || 3) ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-300'}`}>
                                       {data.count} Accounts
                                    </span>
                                 </div>
                                 <p className="text-xs text-gray-400 mb-3 truncate">Users: {data.users.join(', ')}</p>
                                 <div className="flex gap-2">
                                    <button 
                                       onClick={() => adminActions.clearDeviceLimitForDevice(deviceId)}
                                       disabled={state.settings.exemptDevices?.includes(deviceId)}
                                       className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${state.settings.exemptDevices?.includes(deviceId) ? 'bg-green-600/20 text-green-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                                    >
                                       {state.settings.exemptDevices?.includes(deviceId) ? 'Exempted' : 'Exempt Device'}
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Suspicious Activity Logs */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <ShieldAlert className="text-red-500" size={20} />
                           <h3 className="text-base font-bold text-white">Suspicious Activity</h3>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar">
                           {state.suspiciousActivityLogs?.length > 0 ? state.suspiciousActivityLogs.map(log => (
                              <div key={log.id} className="p-3 bg-gray-950 rounded-xl border border-red-900/30">
                                 <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-red-400">{log.reason}</span>
                                    <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                                 </div>
                                 <p className="text-xs text-white font-medium mb-1">{log.userName}</p>
                                 <p className="text-[10px] text-gray-400">{log.details}</p>
                                 <button 
                                    onClick={() => { setActiveTab('users'); setViewingUserId(log.userId); }}
                                    className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-2 hover:text-blue-300 transition-colors"
                                 >
                                    Review User
                                 </button>
                              </div>
                           )) : (
                              <p className="text-sm text-gray-500 text-center py-4">No suspicious activity detected.</p>
                           )}
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'activity' && (
                  <div className="space-y-4">
                     <h2 className="text-xl font-bold text-white mb-4">Activity Logs</h2>
                     <div className="space-y-3">
                        {state.activityLogs.map(log => (
                           <div key={log.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl space-y-2">
                              <div className="flex justify-between items-center">
                                 <span className="text-sm font-semibold text-white">{log.userName}</span>
                                 <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <div>
                                 <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider">
                                    {log.action}
                                 </span>
                                 <p className="text-xs text-gray-400 mt-1.5">{log.details}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

            </div>
         )}
      </div>
    </div>
  );
};

export default AdminPanel;
