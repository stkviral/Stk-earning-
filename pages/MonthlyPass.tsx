
import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { 
  Crown, CheckCircle2, Zap, TrendingUp, Layers, ShieldCheck, 
  ArrowRight, Sparkles, Star, Rocket, Flame, Clock, 
  CreditCard, Shield, Lock, ChevronRight, X, Info,
  QrCode, Upload, Image as ImageIcon, Camera, AlertCircle
} from 'lucide-react';
import { UserTag } from '../types';
import { playSound } from '../audioUtils';

const MonthlyPass: React.FC = () => {
  const { state, submitPassRequest, setActiveTab } = useApp();
  const { currentUser, settings } = state;
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const benefits = [
    { 
      title: "Double Mining Speed", 
      desc: "Mine 2x faster than normal users with reduced cooldown periods.",
      icon: <Zap className="text-yellow-400" size={24} />,
      color: "from-yellow-400/20 to-orange-500/20"
    },
    { 
      title: "Zero Withdrawal Fees", 
      desc: "Keep 100% of your earnings. No processing fees on any withdrawal.",
      icon: <ShieldCheck className="text-green-400" size={24} />,
      color: "from-green-400/20 to-emerald-500/20"
    },
    { 
      title: "Unlimited Daily Cap", 
      desc: "Earn as much as you want. No daily earning limits for VIP members.",
      icon: <TrendingUp className="text-blue-400" size={24} />,
      color: "from-blue-400/20 to-indigo-500/20"
    },
    { 
      title: "Custom Themes", 
      desc: "Unlock Light Mode and exclusive UI skins to personalize your experience.",
      icon: <Layers className="text-purple-400" size={24} />,
      color: "from-purple-400/20 to-pink-500/20"
    },
    { 
      title: "Priority Support", 
      desc: "Your withdrawal requests and support tickets are handled first.",
      icon: <Star className="text-orange-400" size={24} />,
      color: "from-orange-400/20 to-red-500/20"
    },
    { 
      title: "Exclusive Badge", 
      desc: "A golden crown badge next to your name across the platform.",
      icon: <Crown className="text-yellow-500" size={24} />,
      color: "from-yellow-500/20 to-amber-600/20"
    }
  ];

  const handlePurchase = () => {
    playSound('ignite');
    setShowPaymentModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmPayment = () => {
    if (!proofImage) {
      alert("Please upload payment proof screenshot.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      submitPassRequest(proofImage);
      setIsProcessing(false);
      setShowPaymentModal(false);
      setProofImage(null);
      setActiveTab('home');
    }, 2500);
  };

  const isPassActive = currentUser?.tag === UserTag.PASS;
  const pendingRequest = state.passRequests.find(r => r.userId === currentUser?.id && r.status === 'PENDING');

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950 p-6 pb-32 animate-in fade-in duration-700 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-10 text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 px-4 py-1.5 rounded-full border border-yellow-400/20 mb-2">
          <Crown size={14} className="text-yellow-500 animate-pulse" />
          <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-[0.3em]">Supreme Tier</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none">
          Monthly <span className="text-yellow-500">Pass</span>
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Elevate your earning potential</p>
      </div>

      {/* Hero Card */}
      <div className="relative z-10 mb-10 group">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-[48px] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
        <div className="relative bg-gray-900 rounded-[48px] p-8 border border-white/10 shadow-3xl overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Crown size={200} />
          </div>
          
          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-yellow-500/20">
                <Crown size={40} fill="currentColor" className="text-blue-950" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">ELITE PASS</h2>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 font-black text-sm italic">₹49</span>
                  <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">/ 30 DAYS</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-400 font-bold leading-relaxed">
                Join thousands of elite members who are maximizing their STK earnings with our premium subscription.
              </p>
              
              {isPassActive ? (
                <div className="w-full bg-green-500/20 border border-green-500/30 p-4 rounded-2xl flex items-center justify-center gap-3">
                  <CheckCircle2 className="text-green-500" size={20} />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Membership Active</span>
                </div>
              ) : pendingRequest ? (
                <div className="w-full bg-blue-500/20 border border-blue-500/30 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-3">
                    <Clock className="text-blue-500 animate-spin-slow" size={20} />
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Verification Pending</span>
                  </div>
                  <p className="text-[8px] text-blue-400 font-bold uppercase text-center">Admin is reviewing your payment proof</p>
                </div>
              ) : (
                <button 
                  onClick={handlePurchase}
                  className="w-full bg-white text-gray-950 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Activate Now <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="relative z-10 space-y-6">
        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.5em] ml-2">Premium Benefits</h3>
        <div className="grid grid-cols-1 gap-4">
          {benefits.map((benefit, i) => (
            <div 
              key={i}
              className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 flex items-start gap-6 shadow-lg group hover:border-yellow-400/30 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                {benefit.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase italic tracking-tight">{benefit.title}</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[40px] p-8 shadow-4xl border border-gray-100 dark:border-gray-800 space-y-6 animate-in zoom-in-95 duration-300 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400" />
            
            <div className="flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Manual Payment</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-1">
              {/* QR Code Section */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode size={16} className="text-blue-600" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scan QR to Pay ₹49</span>
                </div>
                <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-inner border border-gray-200">
                  <img 
                    src={settings.paymentQrUrl} 
                    alt="Payment QR" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-full space-y-2">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest text-center">Or Pay to UPI ID</p>
                  <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-black text-blue-600 tracking-tight">{settings.adminUpiId}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(settings.adminUpiId);
                        alert("UPI ID Copied!");
                      }}
                      className="text-[8px] font-black text-gray-400 uppercase hover:text-blue-500"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <p className="text-[9px] text-gray-500 font-bold uppercase text-center leading-relaxed">
                  Pay exactly ₹49 using any UPI app and take a screenshot of the success page.
                </p>
              </div>

              {/* Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Proof</span>
                  {proofImage && <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Ready to Submit</span>}
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {!proofImage ? (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center gap-3 group hover:border-blue-500/50 transition-all"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Upload size={24} className="text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Screenshot</span>
                  </button>
                ) : (
                  <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-blue-500/30 group">
                    <img src={proofImage} alt="Proof" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-white text-gray-900 rounded-2xl shadow-xl hover:scale-110 transition-transform"
                      >
                        <ImageIcon size={20} />
                      </button>
                      <button 
                        onClick={() => setProofImage(null)}
                        className="p-3 bg-red-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-3">
                <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest leading-relaxed">
                  Admin will verify your payment within 1-12 hours. Do not upload fake screenshots.
                </p>
              </div>
            </div>

            <div className="pt-4 shrink-0">
              <button 
                onClick={confirmPayment}
                disabled={isProcessing || !proofImage}
                className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all ${
                  !proofImage 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white shadow-blue-500/20 active:scale-95'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyPass;
