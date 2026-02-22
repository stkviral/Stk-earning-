
import React, { useState } from 'react';
import { ShieldAlert, Lock, User, ArrowLeft } from 'lucide-react';
import { playSound } from '../audioUtils';

interface AdminLoginProps {
  onLogin: (email: string, name: string) => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a server-side check
    if (username === 'admin' && password === 'stkadmin2024') {
      playSound('tap');
      onLogin('admin@stk.com', 'Super Admin');
    } else {
      setError('Invalid credentials');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-950 p-8 items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-50" />
      
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 p-3 bg-gray-900 rounded-2xl text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="relative z-10 w-24 h-24 mb-8 bg-red-600/10 rounded-[32px] border-2 border-red-600/30 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.2)]">
        <ShieldAlert size={48} className="text-red-600 animate-pulse" />
      </div>

      <div className="text-center mb-10 relative z-10">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Admin Terminal</h2>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Restricted Access Only</p>
      </div>

      <form onSubmit={handleLogin} className="w-full space-y-4 relative z-10">
        <div className="space-y-2">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-900 border-2 border-gray-800 p-4 pl-12 rounded-2xl text-white font-bold focus:border-red-600 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border-2 border-gray-800 p-4 pl-12 rounded-2xl text-white font-bold focus:border-red-600 outline-none transition-all"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-[10px] font-black uppercase text-center animate-shake">{error}</p>
        )}

        <button 
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase shadow-xl shadow-red-600/20 active:scale-95 transition-all"
        >
          Authorize Access
        </button>
      </form>

      <div className="mt-12 text-center opacity-30">
        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">System Security v4.0.1</p>
      </div>
    </div>
  );
};

export default AdminLogin;
