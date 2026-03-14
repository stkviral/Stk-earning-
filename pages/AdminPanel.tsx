import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { 
  LayoutDashboard, Users, CreditCard, ShieldAlert, Settings, 
  ScrollText, Search, Coins, TrendingUp, AlertTriangle,
  Ban, ShieldCheck, Activity, Clock, CheckCircle2, X, ArrowLeft,
  Lock, Server, Database, Sparkles, Sliders, Bell, Disc, PlayCircle,
  UserCog, Terminal, ShieldOff, ChevronRight, Plus, Minus, Radio, Laptop,
  Wallet, Network, RefreshCw
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

  const handleResetCooldown = (type: 'SPIN' | 'SCRATCH' | 'ALL' | 'STREAK') => {
    if (!actionReason) return alert("Reason is required");
    if (type === 'STREAK') {
      adminActions.resetStreak(user.id, actionReason);
      alert('Streak reset successfully.');
    } else {
      adminActions.resetCooldowns(user.id, type, actionReason);
      alert(`${type} cooldown reset successfully.`);
    }
    setActionReason('');
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
                <button onClick={() => handleResetCooldown('STREAK')} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors">Reset Streak</button>
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
                           {tx.type === 'WITHDRAWAL' && tx.status === 'PENDING' && (
                              <div className="mt-2 pt-2 border-t border-gray-800 flex gap-2">
                                 <button 
                                    onClick={async () => {
                                       const txId = prompt("Enter Payment TxID to approve:");
                                       if (txId) await adminActions.approveWithdrawal(user.id, tx.id, txId);
                                    }}
                                    className="flex-1 bg-green-600/20 text-green-500 hover:bg-green-600/30 py-1.5 rounded text-xs font-bold transition-colors"
                                 >
                                    Approve
                                 </button>
                                 <button 
                                    onClick={async () => {
                                       const reason = prompt("Enter Rejection Reason:");
                                       if (reason) await adminActions.rejectWithdrawal(user.id, tx.id, reason);
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
                <h3 className="text-lg font-semibold text-white mb-4">System Exemptions & Custom Limits</h3>
                <div className="space-y-3">
                   <div className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <div>
                         <p className="text-sm font-semibold text-gray-300">Custom Device Limit</p>
                         <p className="text-xs text-gray-500 mt-1">Override the global max accounts limit for this user.</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <input 
                            type="number" 
                            placeholder="Global"
                            value={user.customDeviceLimit ?? ''} 
                            onChange={e => {
                               const val = e.target.value;
                               adminActions.updateUserSettings(user.id, { customDeviceLimit: val ? parseInt(val) : undefined });
                            }}
                            className="w-20 bg-gray-900 border border-gray-700 p-2 rounded-lg text-sm font-bold text-white outline-none text-center focus:border-blue-500 transition-colors"
                         />
                      </div>
                   </div>
                   <div className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <div>
                         <p className="text-sm font-semibold text-gray-300">Device Limit Exempted</p>
                         <p className="text-xs text-gray-500 mt-1">Bypass max accounts per device rule entirely.</p>
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
                                          onClick={async () => await adminActions.approveWithdrawal(tx.userId, tx.id, paymentTxId[tx.id])} 
                                          className="flex-1 bg-green-600/20 text-green-500 hover:bg-green-600/30 py-1.5 rounded text-xs font-bold transition-colors"
                                       >
                                          Approve
                                       </button>
                                       <button 
                                          onClick={async () => {
                                             if (!rejectionReason[tx.id]) return alert("Rejection reason is required");
                                             await adminActions.rejectWithdrawal(tx.userId, tx.id, rejectionReason[tx.id]);
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
    const totalWithdrawalRequests = u.flatMap(us => us.transactions || []).filter(t => t.type === 'WITHDRAWAL').length;
    const pendingWithdrawals = u.flatMap(us => us.transactions || []).filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING').length;
    
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
                                 .filter(tx => tx.type === 'WITHDRAWAL' && tx.status === 'PENDING')
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
                     <h2 className="text-xl font-bold text-white">Rewards Control</h2>
                     
                     {/* Spin Wheel */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <Disc className="text-blue-500" size={20} />
                           <h3 className="text-base font-bold text-white">Spin Wheel</h3>
                        </div>
                        <div className="space-y-3">
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Rewards & Probabilities (%)</label>
                              <div className="grid grid-cols-5 gap-1.5">
                                 {state.settings.spinRewards.map((val, idx) => (
                                    <div key={idx} className="space-y-1">
                                       <input type="number" value={val ?? 0} onChange={e => {
                                          const n = [...state.settings.spinRewards];
                                          n[idx] = parseInt(e.target.value) || 0;
                                          updateSettings({ spinRewards: n });
                                       }} className="w-full bg-gray-950 border border-gray-800 p-1.5 rounded text-center text-xs font-semibold text-white outline-none focus:border-blue-500" placeholder="Reward" />
                                       <input type="number" value={state.settings.spinProbabilities[val] ?? 0} onChange={e => {
                                          const p = { ...state.settings.spinProbabilities };
                                          p[val] = parseInt(e.target.value) || 0;
                                          updateSettings({ spinProbabilities: p });
                                       }} className="w-full bg-gray-950 border border-gray-800 p-1.5 rounded text-center text-xs font-semibold text-gray-400 outline-none focus:border-blue-500" placeholder="Prob %" />
                                    </div>
                                 ))}
                              </div>
                           </div>
                           <div className="grid grid-cols-3 gap-3">
                              <div>
                                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Daily Spins</label>
                                 <input type="number" value={state.settings.maxDailySpinsNormal ?? 0} onChange={e => updateSettings({ maxDailySpinsNormal: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                              </div>
                              <div>
                                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Cooldown (Min)</label>
                                 <input type="number" value={state.settings.spinCooldownMinutes ?? 0} onChange={e => updateSettings({ spinCooldownMinutes: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                              </div>
                              <div className="flex items-center justify-between bg-gray-950 border border-gray-800 p-2 rounded-lg">
                                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Ad Required</label>
                                 <button onClick={() => updateSettings({ spinAdRequired: !state.settings.spinAdRequired })} className={`w-8 h-4 rounded-full transition-all relative ${state.settings.spinAdRequired ? 'bg-blue-500' : 'bg-gray-700'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${state.settings.spinAdRequired ? 'left-4.5' : 'left-0.5'}`} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Scratch Cards */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <Sparkles className="text-purple-500" size={20} />
                           <h3 className="text-base font-bold text-white">Scratch Cards</h3>
                        </div>
                        <div className="space-y-3">
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Rewards & Probabilities (%)</label>
                              <div className="grid grid-cols-5 gap-1.5">
                                 {state.settings.scratchRewards.map((val, idx) => (
                                    <div key={idx} className="space-y-1">
                                       <input type="number" value={val ?? 0} onChange={e => {
                                          const n = [...state.settings.scratchRewards];
                                          n[idx] = parseInt(e.target.value) || 0;
                                          updateSettings({ scratchRewards: n });
                                       }} className="w-full bg-gray-950 border border-gray-800 p-1.5 rounded text-center text-xs font-semibold text-white outline-none focus:border-purple-500" placeholder="Reward" />
                                       <input type="number" value={state.settings.scratchProbabilities[val] ?? 0} onChange={e => {
                                          const p = { ...state.settings.scratchProbabilities };
                                          p[val] = parseInt(e.target.value) || 0;
                                          updateSettings({ scratchProbabilities: p });
                                       }} className="w-full bg-gray-950 border border-gray-800 p-1.5 rounded text-center text-xs font-semibold text-gray-400 outline-none focus:border-purple-500" placeholder="Prob %" />
                                    </div>
                                 ))}
                              </div>
                           </div>
                           <div className="grid grid-cols-3 gap-3">
                              <div>
                                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Daily Scratches</label>
                                 <input type="number" value={state.settings.maxDailyScratchesNormal ?? 0} onChange={e => updateSettings({ maxDailyScratchesNormal: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-purple-500" />
                              </div>
                              <div>
                                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Cooldown (Min)</label>
                                 <input type="number" value={state.settings.scratchCooldownMinutes ?? 0} onChange={e => updateSettings({ scratchCooldownMinutes: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-purple-500" />
                              </div>
                              <div className="flex items-center justify-between bg-gray-950 border border-gray-800 p-2 rounded-lg">
                                 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Ad Required</label>
                                 <button onClick={() => updateSettings({ scratchAdRequired: !state.settings.scratchAdRequired })} className={`w-8 h-4 rounded-full transition-all relative ${state.settings.scratchAdRequired ? 'bg-purple-500' : 'bg-gray-700'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${state.settings.scratchAdRequired ? 'left-4.5' : 'left-0.5'}`} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Video Rewards */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <PlayCircle className="text-red-500" size={20} />
                           <h3 className="text-base font-bold text-white">Video Rewards</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Reward Coins</label>
                              <input type="number" value={state.settings.adRewardCoins ?? 0} onChange={e => updateSettings({ adRewardCoins: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-red-500" />
                           </div>
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Max Daily Ads</label>
                              <input type="number" value={state.settings.maxDailyAds ?? 0} onChange={e => updateSettings({ maxDailyAds: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-red-500" />
                           </div>
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Cooldown (Min)</label>
                              <input type="number" value={state.settings.adCooldownMinutes ?? 0} onChange={e => updateSettings({ adCooldownMinutes: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-red-500" />
                           </div>
                        </div>
                        <div className="flex items-center justify-between bg-gray-950 p-3 rounded-xl border border-gray-800">
                           <div className="flex items-center gap-2">
                              <ShieldCheck size={16} className="text-red-500" />
                              <span className="text-xs font-bold text-white uppercase tracking-wider">Require Ad</span>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={state.settings.videoAdRequired ?? true} onChange={e => updateSettings({ videoAdRequired: e.target.checked })} className="sr-only peer" />
                              <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                           </label>
                        </div>
                     </div>

                     {/* Daily Check-in */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <CheckCircle2 className="text-green-500" size={20} />
                           <h3 className="text-base font-bold text-white">Daily Check-in</h3>
                        </div>
                        <div className="space-y-3">
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Day 1-7 Rewards</label>
                              <div className="grid grid-cols-7 gap-1.5">
                                 {state.settings.dailyBonusRewards?.map((val, idx) => (
                                    <div key={idx} className="space-y-1">
                                       <div className="text-[8px] text-center text-gray-500">Day {idx + 1}</div>
                                       <input type="number" value={val ?? 0} onChange={e => {
                                          const n = [...(state.settings.dailyBonusRewards || [])];
                                          n[idx] = parseInt(e.target.value) || 0;
                                          updateSettings({ dailyBonusRewards: n });
                                       }} className="w-full bg-gray-950 border border-gray-800 p-1.5 rounded text-center text-xs font-semibold text-white outline-none focus:border-green-500" />
                                    </div>
                                 ))}
                              </div>
                           </div>
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Reset Cycle (Days)</label>
                              <input type="number" value={state.settings.dailyBonusResetDays ?? 7} onChange={e => updateSettings({ dailyBonusResetDays: parseInt(e.target.value) || 7 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-green-500" />
                           </div>
                        </div>
                     </div>

                     {/* Reward Protection */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <ShieldCheck className="text-yellow-500" size={20} />
                           <h3 className="text-base font-bold text-white">Reward Protection</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Daily Coin Issue Limit</label>
                              <input type="number" value={state.settings.dailyRewardBudget ?? 0} onChange={e => updateSettings({ dailyRewardBudget: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-yellow-500" />
                           </div>
                           <div className="flex items-center justify-between bg-gray-950 border border-gray-800 p-2 rounded-lg">
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Auto Balancing</label>
                              <button onClick={() => updateSettings({ autoRewardBalancing: !state.settings.autoRewardBalancing })} className={`w-10 h-5 rounded-full transition-all relative ${state.settings.autoRewardBalancing ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                                 <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${state.settings.autoRewardBalancing ? 'left-5.5' : 'left-0.5'}`} />
                              </button>
                           </div>
                        </div>
                     </div>

                     {/* Withdrawal Control */}
                     <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                           <CreditCard className="text-blue-400" size={20} />
                           <h3 className="text-base font-bold text-white">Withdrawal Control</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Min Withdrawal</label>
                              <input type="number" value={state.settings.minWithdrawalCoins ?? 0} onChange={e => updateSettings({ minWithdrawalCoins: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-blue-400" />
                           </div>
                           <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Max Withdrawal</label>
                              <input type="number" value={state.settings.maxWithdrawalCoins ?? 0} onChange={e => updateSettings({ maxWithdrawalCoins: parseInt(e.target.value) || 0 })} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-sm text-white outline-none focus:border-blue-400" />
                           </div>
                           <div className="col-span-2 flex items-center justify-between bg-gray-950 border border-gray-800 p-3 rounded-lg">
                              <div>
                                 <label className="text-sm font-semibold text-white block">Manual Approval</label>
                                 <span className="text-[10px] text-gray-500">Require admin approval for all withdrawals</span>
                              </div>
                              <button onClick={() => updateSettings({ manualWithdrawalApproval: !state.settings.manualWithdrawalApproval })} className={`w-12 h-6 rounded-full transition-all relative ${state.settings.manualWithdrawalApproval ? 'bg-blue-500' : 'bg-gray-700'}`}>
                                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${state.settings.manualWithdrawalApproval ? 'left-7' : 'left-1'}`} />
                              </button>
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
                     <div className="flex items-center justify-between mb-6">
                        <div>
                           <h2 className="text-2xl font-black text-white tracking-tight">Security & Anti-Fraud</h2>
                           <p className="text-sm text-gray-400 mt-1">Manage device limits, protect profits, and monitor suspicious activity.</p>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                           <ShieldAlert className="text-blue-500" size={24} />
                        </div>
                     </div>
                     
                     {/* Device Limit Control */}
                     <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg space-y-5">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                           <div className="p-2 bg-blue-500/10 rounded-lg">
                              <Laptop className="text-blue-500" size={20} />
                           </div>
                           <div>
                              <h3 className="text-lg font-bold text-white">Device Limit Control</h3>
                              <p className="text-xs text-gray-400">Prevent users from creating multiple accounts on the same device.</p>
                           </div>
                        </div>
                        
                        <div className="grid gap-4">
                           <div className="flex items-center justify-between p-4 bg-gray-950/50 hover:bg-gray-950 transition-colors rounded-xl border border-gray-800/50">
                              <div className="flex-1 pr-4">
                                 <p className="text-sm font-bold text-gray-200">Enable Device Limits</p>
                                 <p className="text-xs text-gray-500 mt-1 leading-relaxed">When enabled, the system will block new account creations if the device has reached the maximum allowed accounts.</p>
                              </div>
                              <button 
                                 onClick={() => updateSettings({ deviceLimitEnabled: !state.settings.deviceLimitEnabled })}
                                 className={`w-14 h-7 rounded-full transition-all relative shrink-0 shadow-inner ${state.settings.deviceLimitEnabled ? 'bg-blue-600' : 'bg-gray-700'}`}
                              >
                                 <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${state.settings.deviceLimitEnabled ? 'left-8' : 'left-1'}`} />
                              </button>
                           </div>

                           <div className="flex items-center justify-between p-4 bg-gray-950/50 hover:bg-gray-950 transition-colors rounded-xl border border-gray-800/50">
                              <div className="flex-1 pr-4">
                                 <p className="text-sm font-bold text-gray-200">Max Accounts Per Device</p>
                                 <p className="text-xs text-gray-500 mt-1 leading-relaxed">The maximum number of accounts a single physical device can register. Default is 3.</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                 <button 
                                    onClick={() => updateSettings({ maxAccountsPerDevice: Math.max(1, (state.settings.maxAccountsPerDevice || 3) - 1) })}
                                    className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
                                 >-</button>
                                 <input 
                                    type="number" 
                                    value={state.settings.maxAccountsPerDevice || 3} 
                                    onChange={e => updateSettings({ maxAccountsPerDevice: Math.max(1, parseInt(e.target.value) || 3) })}
                                    className="w-16 bg-gray-900 border border-gray-700 p-2 rounded-lg text-sm font-bold text-white outline-none text-center focus:border-blue-500 transition-colors"
                                 />
                                 <button 
                                    onClick={() => updateSettings({ maxAccountsPerDevice: (state.settings.maxAccountsPerDevice || 3) + 1 })}
                                    className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
                                 >+</button>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                           <button 
                              onClick={() => {
                                 if (window.confirm("Are you sure you want to reset all device limit exemptions globally? This will re-apply limits to all previously exempted users.")) {
                                    adminActions.resetDeviceRestrictions();
                                 }
                              }}
                              className="w-full bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 hover:text-orange-400 py-3.5 rounded-xl text-sm font-bold transition-all border border-orange-500/20 flex items-center justify-center gap-2"
                           >
                              <RefreshCw size={16} />
                              Reset Exemptions
                           </button>
                           <button 
                              onClick={() => {
                                 if (window.confirm("EMERGENCY: Are you sure you want to unbind ALL devices? This will clear all device IDs and allow everyone to log in from new devices.")) {
                                    adminActions.unbindAllDevices();
                                 }
                              }}
                              className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 py-3.5 rounded-xl text-sm font-bold transition-all border border-red-500/20 flex items-center justify-center gap-2"
                           >
                              <ShieldAlert size={16} />
                              Reset All Device Limits
                           </button>
                        </div>
                     </div>

                     {/* Advanced Profit Protection */}
                     <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg space-y-5">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                           <div className="p-2 bg-green-500/10 rounded-lg">
                              <ShieldCheck className="text-green-500" size={20} />
                           </div>
                           <div>
                              <h3 className="text-lg font-bold text-white">Advanced Profit Protection</h3>
                              <p className="text-xs text-gray-400">Configure automated systems to protect your app's economy.</p>
                           </div>
                        </div>
                        
                        <div className="grid gap-4">
                           <div className="flex items-center justify-between p-4 bg-gray-950/50 hover:bg-gray-950 transition-colors rounded-xl border border-gray-800/50">
                              <div className="flex-1 pr-4">
                                 <p className="text-sm font-bold text-gray-200">Daily Reward Budget</p>
                                 <p className="text-xs text-gray-500 mt-1 leading-relaxed">Automatically reduce rewards if the total daily payout exceeds this amount.</p>
                              </div>
                              <div className="relative shrink-0">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">🪙</span>
                                 <input 
                                    type="number" 
                                    value={state.settings.dailyRewardBudget ?? 100000} 
                                    onChange={e => updateSettings({ dailyRewardBudget: parseInt(e.target.value) || 0 })}
                                    className="w-32 bg-gray-900 border border-gray-700 py-2 pl-8 pr-3 rounded-lg text-sm font-bold text-white outline-none text-right focus:border-green-500 transition-colors"
                                 />
                              </div>
                           </div>

                           <div className="flex items-center justify-between p-4 bg-gray-950/50 hover:bg-gray-950 transition-colors rounded-xl border border-gray-800/50">
                              <div className="flex-1 pr-4">
                                 <p className="text-sm font-bold text-gray-200">Anti-Auto-Clicker Delay</p>
                                 <p className="text-xs text-gray-500 mt-1 leading-relaxed">Artificial delay (in milliseconds) before crediting rewards to prevent script abuse.</p>
                              </div>
                              <div className="relative shrink-0">
                                 <input 
                                    type="number" 
                                    value={state.settings.rewardDelayMs ?? 2000} 
                                    onChange={e => updateSettings({ rewardDelayMs: parseInt(e.target.value) || 0 })}
                                    className="w-28 bg-gray-900 border border-gray-700 py-2 px-3 rounded-lg text-sm font-bold text-white outline-none text-right focus:border-green-500 transition-colors"
                                 />
                                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold pointer-events-none">ms</span>
                              </div>
                           </div>

                           <div className="flex items-center justify-between p-4 bg-gray-950/50 hover:bg-gray-950 transition-colors rounded-xl border border-gray-800/50">
                              <div className="flex-1 pr-4">
                                 <p className="text-sm font-bold text-gray-200">Auto-Flag Suspicious Withdrawals</p>
                                 <p className="text-xs text-gray-500 mt-1 leading-relaxed">Automatically flag withdrawal requests from users with high risk scores or unusual activity patterns.</p>
                              </div>
                              <button 
                                 onClick={() => updateSettings({ autoFlagWithdrawals: !state.settings.autoFlagWithdrawals })}
                                 className={`w-14 h-7 rounded-full transition-all relative shrink-0 shadow-inner ${state.settings.autoFlagWithdrawals ? 'bg-green-600' : 'bg-gray-700'}`}
                              >
                                 <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${state.settings.autoFlagWithdrawals ? 'left-8' : 'left-1'}`} />
                              </button>
                           </div>
                        </div>
                     </div>

                     {/* Specific User Device Limits */}
                     <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg space-y-5">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                           <div className="p-2 bg-indigo-500/10 rounded-lg">
                              <UserCog className="text-indigo-500" size={20} />
                           </div>
                           <div>
                              <h3 className="text-lg font-bold text-white">Specific User Device Limits</h3>
                              <p className="text-xs text-gray-400">Override device limits for specific users.</p>
                           </div>
                        </div>
                        
                        <div className="relative w-full">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                           <input 
                              type="text" 
                              placeholder="Search users by name or email..." 
                              value={searchTerm || ''} 
                              onChange={e => setSearchTerm(e.target.value)} 
                              className="w-full bg-gray-950 border border-gray-800 py-3 pl-10 pr-4 rounded-xl text-sm text-white outline-none focus:border-indigo-500 transition-colors" 
                           />
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                           {state.allUsers.filter(u => 
                              searchTerm && ((u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (u.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (u.deviceId || '').toLowerCase().includes(searchTerm.toLowerCase()))
                           ).slice(0, 10).map(u => (
                              <div key={u.id} className="p-4 bg-gray-950 rounded-xl border border-gray-800 flex flex-col gap-4">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} alt={u.name} className="w-10 h-10 rounded-full bg-gray-800" />
                                       <div>
                                          <p className="text-sm font-bold text-white">{u.name}</p>
                                          <p className="text-xs text-gray-500">{u.email}</p>
                                          <p className="text-[10px] text-gray-600 font-mono mt-0.5">ID: {u.id}</p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-[10px] text-gray-500 uppercase tracking-wider">Device ID</p>
                                       <p className="text-xs font-mono text-gray-400">{u.deviceId || 'N/A'}</p>
                                       {u.deviceId && (
                                          <button 
                                             onClick={() => adminActions.unbindDeviceForUser(u.id)}
                                             className="mt-1 px-2 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded text-[10px] font-bold transition-colors"
                                          >
                                             Unbind Device
                                          </button>
                                       )}
                                    </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-3 pt-3 border-t border-gray-800/50">
                                    <div className="flex-1 flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-lg border border-gray-800">
                                       <span className="text-xs text-gray-400 font-semibold">Custom Limit:</span>
                                       <input 
                                          type="number" 
                                          placeholder="Global"
                                          value={u.customDeviceLimit ?? ''} 
                                          onChange={e => {
                                             const val = e.target.value;
                                             adminActions.updateUserSettings(u.id, { customDeviceLimit: val ? parseInt(val) : undefined });
                                          }}
                                          className="w-16 bg-transparent text-sm font-bold text-white outline-none text-center"
                                       />
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                       <button
                                          onClick={() => adminActions.updateUserSettings(u.id, { deviceLimitExempt: !u.deviceLimitExempt, deviceLimitBlocked: false })}
                                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${u.deviceLimitExempt ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-transparent'}`}
                                       >
                                          {u.deviceLimitExempt ? 'Always Allow' : 'Allow'}
                                       </button>
                                       <button
                                          onClick={() => adminActions.updateUserSettings(u.id, { deviceLimitBlocked: !u.deviceLimitBlocked, deviceLimitExempt: false })}
                                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${u.deviceLimitBlocked ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-transparent'}`}
                                       >
                                          {u.deviceLimitBlocked ? 'Always Block' : 'Block'}
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                           {searchTerm && state.allUsers.filter(u => 
                              (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                           ).length === 0 && (
                              <div className="text-center py-8 text-gray-500 text-sm">
                                 No users found matching "{searchTerm}"
                              </div>
                           )}
                           {!searchTerm && (
                              <div className="text-center py-8 text-gray-600 text-sm italic">
                                 Search for a user to manage their specific device limits.
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Device Management */}
                     <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg space-y-5">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                           <div className="p-2 bg-purple-500/10 rounded-lg">
                              <Network className="text-purple-500" size={20} />
                           </div>
                           <div>
                              <h3 className="text-lg font-bold text-white">Device Management</h3>
                              <p className="text-xs text-gray-400">Monitor devices with multiple registered accounts.</p>
                           </div>
                        </div>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
                           {Object.entries(
                              state.allUsers.reduce((acc, user) => {
                                 if (!user.deviceId) return acc;
                                 if (!acc[user.deviceId]) acc[user.deviceId] = { count: 0, lastActive: 0, users: [] };
                                 acc[user.deviceId].count++;
                                 acc[user.deviceId].users.push(user);
                                 if ((user.lastActiveAt || 0) > acc[user.deviceId].lastActive) acc[user.deviceId].lastActive = user.lastActiveAt || 0;
                                 return acc;
                              }, {} as Record<string, { count: number, lastActive: number, users: User[] }>)
                           ).sort((a, b) => (b[1] as any).count - (a[1] as any).count).map(([deviceId, data]: [string, any]) => (
                              <div key={deviceId} className="p-4 bg-gray-950 rounded-xl border border-gray-800">
                                 <div className="flex justify-between items-start mb-4">
                                    <div>
                                       <p className="text-xs font-mono text-gray-400 break-all">{deviceId}</p>
                                       <p className="text-[10px] text-gray-500 mt-1">Last Active: {new Date(data.lastActive).toLocaleString()}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                       <span className={`px-2 py-1 rounded text-xs font-bold ${data.count > (state.settings.maxAccountsPerDevice || 3) ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-300'}`}>
                                          {data.count} Accounts
                                       </span>
                                       <button 
                                          onClick={() => {
                                             if (state.settings.exemptDevices?.includes(deviceId)) {
                                                adminActions.removeDeviceExemption(deviceId);
                                             } else {
                                                adminActions.clearDeviceLimitForDevice(deviceId);
                                             }
                                          }}
                                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${state.settings.exemptDevices?.includes(deviceId) ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                                       >
                                          {state.settings.exemptDevices?.includes(deviceId) ? 'Remove Exemption' : 'Exempt Entire Device'}
                                       </button>
                                    </div>
                                 </div>
                                 
                                 <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Registered Users</p>
                                    {data.users.map((u: User) => (
                                       <div key={u.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800/50 hover:bg-gray-900 transition-colors">
                                          <div className="flex items-center gap-3">
                                             <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} alt={u.name} className="w-8 h-8 rounded-full bg-gray-800" />
                                             <div>
                                                <p className="text-sm font-bold text-white flex items-center gap-2">
                                                   {u.name}
                                                   {u.status === 'BANNED' && <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase">Banned</span>}
                                                </p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                             </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                             <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-lg">
                                                <span className="text-[10px] text-gray-400 font-semibold uppercase">Limit:</span>
                                                <input 
                                                   type="number" 
                                                   placeholder="Global"
                                                   value={u.customDeviceLimit ?? ''} 
                                                   onChange={e => {
                                                      const val = e.target.value;
                                                      adminActions.updateUserSettings(u.id, { customDeviceLimit: val ? parseInt(val) : undefined });
                                                   }}
                                                   className="w-12 bg-transparent text-xs font-bold text-white outline-none text-center"
                                                />
                                             </div>
                                             <button
                                                onClick={() => adminActions.updateUserSettings(u.id, { deviceLimitExempt: !u.deviceLimitExempt })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${u.deviceLimitExempt ? 'bg-green-500/20 text-green-500' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                                             >
                                                {u.deviceLimitExempt ? 'Exempted' : 'Exempt User'}
                                             </button>
                                             <button
                                                onClick={() => adminActions.setUserStatus(u.id, u.status === 'BANNED' ? 'ACTIVE' : 'BANNED', 'Device management action')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${u.status === 'BANNED' ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-800 text-gray-300 hover:bg-red-500/20 hover:text-red-500'}`}
                                             >
                                                {u.status === 'BANNED' ? 'Unban' : 'Ban'}
                                             </button>
                                          </div>
                                       </div>
                                    ))}
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
