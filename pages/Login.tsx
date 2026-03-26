
import React, { useState } from 'react';
import { Mail, Hash, ShieldCheck, ShieldAlert, Sparkles, UserCheck, Facebook, Send, Lock, User, ArrowRight } from 'lucide-react';
import { useApp } from '../App';
import { supabase } from '../supabase';

const Login: React.FC = () => {
  const [referralCode, setReferralCode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginMode, setLoginMode] = useState<'social' | 'email'>('social');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const { state, logout } = useApp();

  // Disable FedCM to avoid NotAllowedError in iframes
  React.useEffect(() => {
    const initGsi = () => {
      if (window.google?.accounts?.id) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (clientId && clientId !== 'your_google_client_id_here') {
          window.google.accounts.id.initialize({
            client_id: clientId,
            use_fedcm_for_prompt: false,
            callback: () => {}, // Dummy callback as we use Token Client for actual login
          });
        }
      }
    };

    // Try immediately and also set an interval in case the script loads late
    initGsi();
    const interval = setInterval(initGsi, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    if (referralCode) {
      localStorage.setItem('pending_referral_code', referralCode);
    }

    try {
      // Reset frontend state
      logout();
      // Clear old session before login
      await supabase.auth.signOut();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true
        }
      });

      if (error) {
        console.error("Supabase Google Login Error:", error);
        alert(`Login Error: ${error.message}`);
        setIsLoggingIn(false);
        return;
      }

      if (data?.url) {
        const authWindow = window.open(data.url, 'oauth_popup', 'width=600,height=700');
        if (!authWindow) {
          alert('Please allow popups for this site to connect your account.');
          setIsLoggingIn(false);
        } else {
          const checkPopup = setInterval(() => {
            if (authWindow.closed) {
              clearInterval(checkPopup);
              setIsLoggingIn(false);
            }
          }, 1000);
        }
      }
      // The redirect will happen automatically if successful
    } catch (err) {
      console.error("Supabase OAuth2 Initialization Error:", err);
      setIsLoggingIn(false);
      alert("Failed to initialize Google Sign-In.");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isRegistering && !name) return;
    
    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setIsLoggingIn(true);

    if (referralCode) {
      localStorage.setItem('pending_referral_code', referralCode);
    }

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        });

        if (error) {
          alert(`Registration Error: ${error.message}`);
          setIsLoggingIn(false);
          return;
        }

        if (data.session) {
          // The onAuthStateChange listener will handle the rest
        } else {
          alert("Registration successful! Please check your email to verify your account.");
          setIsLoggingIn(false);
          setIsRegistering(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          alert(`Login Error: ${error.message}`);
          setIsLoggingIn(false);
          return;
        }
        // The onAuthStateChange listener will handle the rest
      }
    } catch (err) {
      console.error("Email Auth Error:", err);
      alert("An unexpected error occurred.");
      setIsLoggingIn(false);
    }
  };

  const handleOtherProvider = (provider: string) => {
    alert(`${provider} login is coming soon! For now, please use Google or Email.`);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] max-w-md mx-auto bg-white dark:bg-gray-950 p-6 items-center justify-center relative overflow-y-auto transition-colors duration-500 py-12">
      {/* Immersive Background Effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32 opacity-80" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-600/15 rounded-full blur-[80px] -ml-24 -mb-24 opacity-60" />
      
      <div className="relative z-10 w-32 h-32 mb-6 group">
        <div className="absolute inset-0 bg-blue-600 rounded-[48px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="w-full h-full relative z-10 bg-white dark:bg-gray-900 rounded-[48px] shadow-2xl border-b-8 border-blue-600 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 duration-500">
          <img 
            src={state.logoUrl || './logo.png'} 
            alt="STK Logo" 
            className="w-24 h-24 object-contain dark:drop-shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
          />
        </div>
      </div>
      
      <div className="text-center space-y-2 mb-6 relative z-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">STK PLAY</h1>
        <div className="flex items-center justify-center gap-2">
           <Sparkles size={12} className="text-blue-500 animate-pulse" />
           <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Rewards Platform</p>
        </div>
      </div>

      <div className="w-full space-y-6 relative z-10">
        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-900 rounded-[24px] mb-2 border border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => setLoginMode('social')}
            className={`flex-1 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${loginMode === 'social' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-lg shadow-blue-500/5' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <UserCheck size={14} />
            Social
          </button>
          <button 
            onClick={() => setLoginMode('email')}
            className={`flex-1 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${loginMode === 'email' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-lg shadow-blue-500/5' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <Mail size={14} />
            Email
          </button>
        </div>

        {loginMode === 'social' ? (
          <div className="space-y-4">
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

            <div className="space-y-3 pt-2">
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className={`w-full flex items-center justify-center gap-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 py-5 rounded-[28px] font-black text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-xl shadow-blue-500/5 active:scale-95 uppercase text-xs ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700">
                   <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                </div>
                {isLoggingIn ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleOtherProvider('Facebook')}
                  className="flex items-center justify-center gap-3 bg-[#1877F2] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                >
                  <Facebook size={16} fill="currentColor" /> Facebook
                </button>
                <button 
                  onClick={() => handleOtherProvider('Telegram')}
                  className="flex items-center justify-center gap-3 bg-[#0088cc] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                >
                  <Send size={16} fill="currentColor" /> Telegram
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {isRegistering && (
              <>
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      placeholder="FULL NAME"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 p-4 pl-12 rounded-2xl font-bold text-sm text-gray-900 dark:text-white focus:border-blue-600 outline-none transition-all uppercase"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      placeholder="REFERRAL CODE (OPTIONAL)"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 p-4 pl-12 rounded-2xl font-bold text-sm text-gray-900 dark:text-white focus:border-blue-600 outline-none transition-all uppercase tracking-[0.2em]"
                    />
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 p-4 pl-12 rounded-2xl font-bold text-sm text-gray-900 dark:text-white focus:border-blue-600 outline-none transition-all uppercase"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password"
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 p-4 pl-12 rounded-2xl font-bold text-sm text-gray-900 dark:text-white focus:border-blue-600 outline-none transition-all uppercase"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-500 transition-colors"
            >
              {isRegistering ? 'Already have an account? Sign In' : 'New to STK PLAY? Create Account'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 space-y-4 text-center relative z-10">
        <button 
          type="button"
          onClick={() => setShowGuide(true)}
          className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline flex items-center justify-center gap-2 mx-auto"
        >
          <Sparkles size={12} /> Need help? View Login Guide
        </button>

        <div className="flex items-center justify-center gap-3 bg-gray-50 dark:bg-gray-900/40 px-6 py-3 rounded-full border border-gray-100 dark:border-gray-800/60 shadow-sm">
          <ShieldCheck size={14} className="text-blue-500" />
          <p className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em]">
            Secure & Encrypted
          </p>
        </div>
      </div>

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
};

const GuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Login Guide</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500">
            <ShieldAlert size={20} />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-blue-600">
              <UserCheck size={18} />
              <h4 className="text-xs font-black uppercase tracking-widest">Google Login</h4>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
              The fastest way to start. We use your Google profile to securely create your STK PLAY account. No password needed.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-indigo-600">
              <Mail size={18} />
              <h4 className="text-xs font-black uppercase tracking-widest">Email Login</h4>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
              Prefer traditional methods? Create an account with your email and a secure password. Make sure to use a valid email for withdrawals.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-gray-400">
              <Facebook size={18} />
              <h4 className="text-xs font-black uppercase tracking-widest">Other Socials</h4>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed italic">
              Facebook and Telegram options are coming soon. These will offer exclusive community rewards.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-emerald-600">
              <Hash size={18} />
              <h4 className="text-xs font-black uppercase tracking-widest">Referral Codes</h4>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
              If a friend invited you, enter their code during login to unlock a starting bonus. You can't add this later!
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );
};

export default Login;
