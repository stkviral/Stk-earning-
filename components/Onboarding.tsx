import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../App';
import { Disc, PlayCircle, Sparkles, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { playSound } from '../audioUtils';

const Onboarding: React.FC = () => {
  const { state, updateUser } = useApp();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');

  if (!state.currentUser || state.currentUser.hasCompletedOnboarding) return null;

  const handleNext = () => {
    playSound('tap');
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    playSound('collect');
    updateUser({
      hasCompletedOnboarding: true,
      ...(phone && { phone }),
      ...(upiId && { upiId })
    });
  };

  const steps = [
    {
      title: "Welcome to STK Earning!",
      description: "Start earning real rewards by completing simple daily tasks.",
      icon: <Sparkles size={48} className="text-yellow-400" />,
      content: null
    },
    {
      title: "Spin the Wheel",
      description: "Test your luck daily with our Fortune Wheel. Win coins instantly!",
      icon: <Disc size={48} className="text-blue-400" />,
      content: null
    },
    {
      title: "Watch & Earn",
      description: "Watch short video ads to earn guaranteed coins every day.",
      icon: <PlayCircle size={48} className="text-pink-400" />,
      content: null
    },
    {
      title: "Scratch Cards",
      description: "Scratch and win! Reveal hidden rewards with daily scratch cards.",
      icon: <Sparkles size={48} className="text-purple-400" />,
      content: null
    },
    {
      title: "Set Up Your Profile",
      description: "Add your details now to make withdrawals seamless later.",
      icon: <User size={48} className="text-green-400" />,
      content: (
        <div className="space-y-4 w-full mt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
            <input 
              type="tel" 
              placeholder="+91 9876543210" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 p-3 rounded-xl text-sm text-white outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">UPI ID</label>
            <input 
              type="text" 
              placeholder="name@upi" 
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 p-3 rounded-xl text-sm text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        key={step}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
          {currentStep.icon}
        </div>
        
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{currentStep.title}</h2>
        <p className="text-sm text-gray-400 mb-6">{currentStep.description}</p>
        
        {currentStep.content}

        <div className="flex items-center justify-center gap-2 mt-8 mb-8">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-blue-500' : 'w-1.5 bg-gray-700'}`}
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {step === steps.length - 1 ? (
            <>Get Started <CheckCircle2 size={20} /></>
          ) : (
            <>Next <ArrowRight size={20} /></>
          )}
        </button>
        
        {step === steps.length - 1 && (
          <button 
            onClick={handleComplete}
            className="mt-4 text-xs text-gray-500 hover:text-gray-300 font-medium"
          >
            Skip for now
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default Onboarding;
