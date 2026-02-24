
import React, { useState, useEffect } from 'react';
import { X, Play, Clock } from 'lucide-react';

interface AdOverlayProps {
  type: 'REWARD' | 'REQUIRED';
  onClose: () => void;
}

const AdOverlay: React.FC<AdOverlayProps> = ({ type, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(5); // Simulated 5-second ad
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="absolute top-4 right-4">
        {canClose ? (
          <button 
            onClick={onClose}
            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
          >
            <X size={24} />
          </button>
        ) : (
          <div className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-2">
            <Clock size={16} />
            <span className="font-mono">{timeLeft}s</span>
          </div>
        )}
      </div>

      <div className="w-full max-w-xs aspect-video bg-gray-800 rounded-2xl flex flex-col items-center justify-center border-2 border-white/10 mb-8 overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 animate-pulse" />
        <Play size={48} className="text-white/40 mb-2" />
        <p className="font-bold text-lg">Sponsored Ad</p>
        <p className="text-xs text-white/60">Wait for the timer to finish...</p>
      </div>

      <h2 className="text-2xl font-bold mb-2">Exclusive Reward!</h2>
      <p className="text-gray-400 mb-8 max-w-[250px]">
        {type === 'REWARD' 
          ? "Complete this ad to claim your 1 Coin reward." 
          : "Complete this ad to unlock your reward."}
      </p>

      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-blue-500 transition-all duration-1000"
          style={{ width: `${((5 - timeLeft) / 5) * 100}%` }}
        />
      </div>
      
      {!canClose && (
        <p className="text-sm font-medium text-yellow-400 animate-bounce">
          Watching Ad...
        </p>
      )}
    </div>
  );
};

export default AdOverlay;
