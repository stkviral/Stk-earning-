
import React, { useState, useEffect } from 'react';
import { X, Play, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdOverlayProps {
  type: 'REWARD' | 'REQUIRED';
  onReward: () => void;
  onClose: () => void;
  onError?: () => void;
}

const AdOverlay: React.FC<AdOverlayProps> = ({ type, onReward, onClose, onError }) => {
  const [adState, setAdState] = useState<'LOADING' | 'PLAYING' | 'COMPLETED' | 'ERROR'>('LOADING');
  const [timeLeft, setTimeLeft] = useState(10); // 10-second rewarded ad
  const [canSkip, setCanSkip] = useState(false);

  // AdMob Configuration (Simulated for Web)
  const ADMOB_APP_ID = 'ca-app-pub-1731541638608809~8214629680';
  const ADMOB_AD_UNIT_ID = 'ca-app-pub-1731541638608809/4195493621';

  useEffect(() => {
    console.log(`[AdMob] Initializing Rewarded Ad... App ID: ${ADMOB_APP_ID}`);
    console.log(`[AdMob] Loading Ad Unit: ${ADMOB_AD_UNIT_ID}`);
    
    // Simulate network load
    const loadTimer = setTimeout(() => {
      // 5% chance of ad failing to load
      if (Math.random() < 0.05) {
        console.error(`[AdMob] Failed to load ad: ${ADMOB_AD_UNIT_ID}`);
        if (onError) {
          onError();
        } else {
          setAdState('ERROR');
        }
      } else {
        console.log(`[AdMob] Ad loaded successfully. Starting playback.`);
        setAdState('PLAYING');
      }
    }, 1500);

    return () => clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (adState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 5) setCanSkip(true); // Can skip after 5 seconds
        if (prev <= 1) {
          clearInterval(timer);
          setAdState('COMPLETED');
          console.log(`[AdMob] Ad completed. Reward earned.`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [adState]);

  const handleSkip = () => {
    console.log(`[AdMob] Ad skipped by user. No reward granted.`);
    onClose();
  };

  const handleClaim = () => {
    onReward();
    onClose();
  };

  if (adState === 'LOADING') {
    return (
      <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-gray-400">Loading Advertisement...</p>
        <p className="text-[10px] text-gray-600 mt-2 font-mono">AdMob ID: {ADMOB_AD_UNIT_ID}</p>
      </div>
    );
  }

  if (adState === 'ERROR') {
    return (
      <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center p-6 text-white text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Ad Failed to Load</h2>
        <p className="text-gray-400 mb-8">There was an issue loading the advertisement. Please try again later.</p>
        <button 
          onClick={onClose}
          className="bg-white/10 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  if (adState === 'COMPLETED') {
    return (
      <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={48} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-black mb-2">Reward Unlocked!</h2>
        <p className="text-gray-400 mb-8">Thank you for watching the sponsored video.</p>
        <button 
          onClick={handleClaim}
          className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all active:scale-95"
        >
          Claim Reward
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        {canSkip && (
          <button 
            onClick={handleSkip}
            className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-white/30 transition-colors"
          >
            Skip Video
          </button>
        )}
        <div className="bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-2">
          <Clock size={14} />
          <span className="font-mono text-sm">{timeLeft}s</span>
        </div>
      </div>

      <div className="w-full max-w-xs aspect-video bg-gray-900 rounded-2xl flex flex-col items-center justify-center border border-white/10 mb-8 overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 animate-pulse" />
        <Play size={48} className="text-white/20 mb-2" />
        <p className="font-bold text-lg text-white/80">Google AdMob</p>
        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Rewarded Video Ad</p>
      </div>

      <h2 className="text-2xl font-bold mb-2">Sponsored Content</h2>
      <p className="text-gray-400 mb-8 max-w-[250px] text-sm">
        {type === 'REWARD' 
          ? "Watch this video until the end to earn your reward." 
          : "Complete this ad to unlock your action."}
      </p>

      <div className="w-full max-w-xs h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
          style={{ width: `${((10 - timeLeft) / 10) * 100}%` }}
        />
      </div>
      
      <p className="text-xs font-medium text-yellow-400/80 animate-pulse">
        Reward will be granted after video ends
      </p>
    </div>
  );
};

export default AdOverlay;
