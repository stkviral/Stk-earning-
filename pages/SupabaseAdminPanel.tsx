import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { 
  Users, ShieldAlert, ShieldCheck, Coins, 
  Ban, CheckCircle2, Smartphone, RefreshCw, 
  LogOut, Search, ArrowLeft, Plus, Minus
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  coins: number;
  role: string;
  is_banned: boolean;
  created_at: string;
  deviceId?: string;
}

export default function SupabaseAdminPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [coinModal, setCoinModal] = useState<{ isOpen: boolean; userId: string; currentCoins: number; type: 'add' | 'deduct'; amount: string }>({
    isOpen: false,
    userId: '',
    currentCoins: 0,
    type: 'add',
    amount: ''
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate('/');
        return;
      }

      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (dbError || dbUser?.role !== 'admin') {
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchUsers();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, email, coins, role, is_banned, created_at, deviceId')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const verifyAdminBeforeAction = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    return dbUser?.role === 'admin';
  };

  const handleUpdateCoins = (userId: string, currentCoins: number, type: 'add' | 'deduct') => {
    setCoinModal({
      isOpen: true,
      userId,
      currentCoins,
      type,
      amount: ''
    });
  };

  const submitCoinUpdate = async () => {
    const amount = parseInt(coinModal.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive number');
      return;
    }

    try {
      setActionLoading(`coins-${coinModal.userId}`);
      setCoinModal(prev => ({ ...prev, isOpen: false }));
      
      const isStillAdmin = await verifyAdminBeforeAction();
      if (!isStillAdmin) throw new Error('Unauthorized');

      const newCoins = coinModal.type === 'add' ? coinModal.currentCoins + amount : Math.max(0, coinModal.currentCoins - amount);
      
      const { error } = await supabase
        .from('users')
        .update({ coins: newCoins })
        .eq('id', coinModal.userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === coinModal.userId ? { ...u, coins: newCoins } : u));
    } catch (error) {
      console.error('Error updating coins:', error);
      alert('Failed to update coins');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'unban' : 'ban'} this user?`)) return;

    try {
      setActionLoading(`ban-${userId}`);
      const isStillAdmin = await verifyAdminBeforeAction();
      if (!isStillAdmin) throw new Error('Unauthorized');

      const { error } = await supabase
        .from('users')
        .update({ is_banned: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, is_banned: !currentStatus } : u));
    } catch (error) {
      console.error('Error updating ban status:', error);
      alert('Failed to update ban status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role to ${newRole.toUpperCase()}?`)) return;

    try {
      setActionLoading(`role-${userId}`);
      const isStillAdmin = await verifyAdminBeforeAction();
      if (!isStillAdmin) throw new Error('Unauthorized');

      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetDevice = async (userId: string) => {
    if (!confirm('Reset device ID for this user? This will allow them to login from a new device.')) return;

    try {
      setActionLoading(`device-${userId}`);
      const isStillAdmin = await verifyAdminBeforeAction();
      if (!isStillAdmin) throw new Error('Unauthorized');

      const { error } = await supabase
        .from('users')
        .update({ deviceId: null })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, deviceId: undefined } : u));
      alert('Device ID reset successfully');
    } catch (error) {
      console.error('Error resetting device:', error);
      alert('Failed to reset device');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-blue-500" size={32} />
          <p className="text-white font-bold tracking-widest uppercase text-sm">Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const filteredUsers = users.filter(u => 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                <ShieldCheck className="text-blue-500" /> SUPABASE ADMIN
              </h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">System Management Console</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search by email or ID..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-gray-950 border border-gray-800 py-2 pl-10 pr-4 rounded-xl text-sm outline-none focus:border-blue-500 w-full md:w-64 transition-all"
              />
            </div>
            <button onClick={fetchUsers} className="p-2 bg-blue-600/20 text-blue-500 rounded-xl hover:bg-blue-600/30 transition-colors">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950/50 border-b border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <th className="p-4">User</th>
                  <th className="p-4">Coins</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Device</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{user.email || 'No Email'}</span>
                          <span className="text-[10px] text-gray-500 font-mono mt-1">{user.id}</span>
                          <span className="text-[10px] text-gray-600 mt-0.5">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Coins size={14} className="text-yellow-500" />
                          <span className="font-bold">{user.coins?.toLocaleString() || 0}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                          user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${
                          user.is_banned ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {user.is_banned ? <Ban size={12} /> : <CheckCircle2 size={12} />}
                          {user.is_banned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Smartphone size={14} className={user.deviceId ? 'text-blue-400' : 'text-gray-600'} />
                          <span className="text-xs text-gray-400 font-mono truncate max-w-[100px]" title={user.deviceId}>
                            {user.deviceId ? `${user.deviceId.substring(0, 8)}...` : 'None'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {/* Coin Actions */}
                          <div className="flex bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
                            <button 
                              onClick={() => handleUpdateCoins(user.id, user.coins || 0, 'add')}
                              disabled={actionLoading !== null}
                              className="p-1.5 hover:bg-green-500/20 text-green-500 transition-colors disabled:opacity-50"
                              title="Add Coins"
                            >
                              <Plus size={14} />
                            </button>
                            <div className="w-px bg-gray-800"></div>
                            <button 
                              onClick={() => handleUpdateCoins(user.id, user.coins || 0, 'deduct')}
                              disabled={actionLoading !== null}
                              className="p-1.5 hover:bg-red-500/20 text-red-500 transition-colors disabled:opacity-50"
                              title="Deduct Coins"
                            >
                              <Minus size={14} />
                            </button>
                          </div>

                          {/* Role Action */}
                          <button
                            onClick={() => handleToggleRole(user.id, user.role)}
                            disabled={actionLoading !== null}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50 ${
                              user.role === 'admin' 
                                ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                                : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                            }`}
                          >
                            {actionLoading === `role-${user.id}` ? '...' : user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </button>

                          {/* Ban Action */}
                          <button
                            onClick={() => handleToggleBan(user.id, user.is_banned)}
                            disabled={actionLoading !== null}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50 ${
                              user.is_banned 
                                ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                                : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                            }`}
                          >
                            {actionLoading === `ban-${user.id}` ? '...' : user.is_banned ? 'Unban' : 'Ban'}
                          </button>

                          {/* Device Reset */}
                          <button
                            onClick={() => handleResetDevice(user.id)}
                            disabled={actionLoading !== null || !user.deviceId}
                            className="p-1.5 bg-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                            title="Reset Device ID"
                          >
                            <RefreshCw size={14} className={actionLoading === `device-${user.id}` ? 'animate-spin' : ''} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Coin Adjustment Modal */}
      {coinModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black italic tracking-tight mb-4 flex items-center gap-2">
              <Coins className="text-yellow-500" />
              {coinModal.type === 'add' ? 'ADD COINS' : 'DEDUCT COINS'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Current Balance: <span className="text-white font-bold">{coinModal.currentCoins}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Amount</label>
                <input
                  type="number"
                  value={coinModal.amount}
                  onChange={e => setCoinModal(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCoinModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCoinUpdate}
                  disabled={!coinModal.amount || parseInt(coinModal.amount) <= 0}
                  className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 ${
                    coinModal.type === 'add' ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
