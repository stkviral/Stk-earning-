
import React, { useState } from 'react';
import { useApp } from '../App';
import { CheckSquare, Plus, BrainCircuit, Loader2, CheckCircle2, Trophy, Coins, Info, Sparkles, ChevronRight, MessageSquare, X } from 'lucide-react';
import { Task } from '../types';
import { playSound } from '../audioUtils';

const Tasks: React.FC = () => {
  const { state, addTask, completeTask } = useApp();
  const { currentUser } = state;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [proof, setProof] = useState('');
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    playSound('tap');
    addTask(newTaskTitle, 5); // Default reward for custom tasks
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  const handleComplete = async (task: Task) => {
    if (task.type === 'CUSTOM' && !proof.trim()) {
       alert("Please enter proof of completion for verification.");
       return;
    }
    playSound('tap');
    setCompletingTaskId(task.id);
    const success = await completeTask(task.id, proof);
    if (success) {
      playSound('collect');
      setProof('');
    }
    setCompletingTaskId(null);
  };

  const systemTasks = currentUser.tasks.filter(t => t.type === 'SYSTEM');
  const customTasks = currentUser.tasks.filter(t => t.type === 'CUSTOM');

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-700 pb-28 min-h-full bg-gray-50 dark:bg-gray-950">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

      <div className="space-y-2 relative z-10 pt-4">
        <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-1.5 rounded-full w-fit border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:scale-105">
          <BrainCircuit size={14} className="text-blue-600 dark:text-blue-400 animate-pulse" />
          <span className="text-[8px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest italic">Task List</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none">Daily Tasks</h2>
        <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest max-w-[240px]">Complete tasks to earn extra coins every day.</p>
      </div>

      {/* App Activities */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-2 px-1">
           <Trophy size={12} className="text-yellow-500" />
           <h3 className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em]">System Tasks</h3>
        </div>
        
        {systemTasks.map(task => {
          const progress = task.progress || 0;
          const total = task.totalRequired || 1;
          const isReady = progress >= total && !task.completed;

          return (
            <div key={task.id} className={`bg-white dark:bg-gray-900 p-4 rounded-2xl border-2 shadow-lg space-y-3 transition-all relative overflow-hidden group ${task.completed ? 'opacity-40 grayscale-0 border-gray-50 dark:border-gray-950 shadow-none' : 'border-gray-50 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900/40'}`}>
              <div className="flex justify-between items-start relative z-10">
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6 ${task.completed ? 'bg-green-100 dark:bg-green-950 text-green-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                       {task.completed ? <CheckCircle2 size={24} /> : <CheckSquare size={24} />}
                    </div>
                    <div>
                       <h4 className="text-base font-black text-gray-900 dark:text-white uppercase leading-none italic">{task.title}</h4>
                       <div className="flex items-center gap-2 mt-2">
                          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase flex items-center gap-1.5 border border-yellow-200 dark:border-yellow-900/30 shadow-sm">
                             <Coins size={10} /> {task.reward} Coins
                          </div>
                       </div>
                    </div>
                 </div>
                 {task.completed ? (
                   <span className="text-[8px] font-black text-green-600 uppercase italic bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded-md">Done</span>
                 ) : (
                   <span className="text-xs font-black font-mono text-gray-300 dark:text-gray-700 tracking-widest">{progress}/{total}</span>
                 )}
              </div>
              
              {!task.completed && (
                <div className="space-y-3 relative z-10">
                   <div className="h-3 bg-gray-50 dark:bg-black/50 rounded-full overflow-hidden p-0.5 border border-gray-100 dark:border-gray-800 shadow-inner">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full transition-all duration-1000 relative" style={{ width: `${(progress/total) * 100}%` }}>
                         <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                   </div>
                   {isReady && (
                      <button 
                        onClick={() => handleComplete(task)}
                        disabled={completingTaskId === task.id}
                        className="w-full bg-green-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-green-500/30 animate-pulse active:scale-95 transition-all border-b-[8px] border-green-900"
                      >
                         {completingTaskId === task.id ? <Loader2 className="animate-spin mx-auto" /> : "Broadcast Claim"}
                      </button>
                   )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Personal Goals Section */}
      <div className="space-y-6 relative z-10">
        <div className="flex justify-between items-center px-2">
           <div className="flex items-center gap-3">
              <Sparkles size={14} className="text-blue-500" />
              <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em]">Custom Tasks</h3>
           </div>
           <button 
            onClick={() => { playSound('tap'); setShowAddForm(!showAddForm); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-90 ${showAddForm ? 'bg-red-500 text-white' : 'bg-blue-600 text-white shadow-blue-500/20'}`}
           >
              {showAddForm ? <X size={20} /> : <Plus size={24} />}
           </button>
        </div>

        {showAddForm && (
           <form onSubmit={handleAddTask} className="bg-white dark:bg-gray-900 p-8 rounded-[48px] border-2 border-dashed border-blue-200 dark:border-blue-900/30 space-y-6 animate-in slide-in-from-top-4 shadow-2xl">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Define Objective</label>
                <input 
                  autoFocus
                  placeholder="e.g. COMPLETE 10 WORKOUTS"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value.toUpperCase())}
                  className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-gray-800 p-5 rounded-3xl text-sm font-black uppercase tracking-tight outline-none focus:ring-2 ring-blue-500 dark:text-white transition-all shadow-inner"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 border-b-[6px] border-blue-900 active:scale-95 transition-all">
                Authorize Directive
              </button>
           </form>
        )}

        {customTasks.length === 0 && !showAddForm ? (
           <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[56px] border-4 border-dashed border-gray-100 dark:border-gray-800/50 opacity-40 flex flex-col items-center justify-center group transition-all hover:opacity-60">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-950 rounded-[32px] flex items-center justify-center mb-6">
                <CheckSquare size={48} className="text-gray-300 dark:text-gray-700" />
              </div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em]">No Objectives Locked</p>
           </div>
        ) : (
          <div className="space-y-4">
            {customTasks.map(task => (
              <div key={task.id} className={`bg-white dark:bg-gray-900 p-8 rounded-[48px] border-2 shadow-2xl space-y-6 transition-all group relative overflow-hidden ${task.completed ? 'border-green-100 dark:border-green-950 opacity-50 grayscale shadow-none' : 'border-gray-50 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900/30'}`}>
                <div className="flex justify-between items-center relative z-10">
                   <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all ${task.completed ? 'bg-green-50 dark:bg-green-950 text-green-600' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:rotate-6'}`}>
                         <CheckSquare size={32} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black dark:text-white uppercase leading-none italic">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-3">
                           <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-xl text-[9px] font-black flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-900/30">
                              <Coins size={12} /> {task.reward} STK
                           </div>
                        </div>
                      </div>
                   </div>
                   {task.completed && <CheckCircle2 size={24} className="text-green-500" />}
                </div>

                {!task.completed && (
                  <div className="space-y-6 pt-2 relative z-10">
                     <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2 italic">
                          <MessageSquare size={12} /> Forensic Evidence (Min 10 chars)
                        </label>
                        <textarea 
                          placeholder="DETAILED COMPLETION LOG..."
                          className="w-full bg-gray-50 dark:bg-black/50 p-6 rounded-[36px] text-[11px] font-bold min-h-[120px] outline-none border-2 border-transparent focus:border-indigo-500 dark:text-white transition-all shadow-inner"
                          onChange={(e) => setProof(e.target.value)}
                        />
                     </div>
                     <button 
                      onClick={() => handleComplete(task)}
                      disabled={completingTaskId === task.id}
                      className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all border-b-[8px] border-indigo-900"
                     >
                       {completingTaskId === task.id ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            AI AUDIT IN PROGRESS
                          </>
                       ) : (
                          <>
                            <Sparkles size={20} className="animate-pulse" />
                            SUBMIT FOR SCAN
                          </>
                       )}
                     </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Verification Disclaimer */}
      <div className="bg-blue-600 dark:bg-indigo-700 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl border border-white/10 group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
          <Trophy size={100} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Verified Protocol</h3>
            <p className="text-xs text-blue-100 font-bold uppercase tracking-widest leading-relaxed opacity-90">
              Our simulated AI Auditor validates all custom directives. System integrity is monitored. Fraud attempts trigger immediate terminal lockout.
            </p>
          </div>
          <div className="flex items-start gap-4 bg-white/10 p-5 rounded-[32px] border border-white/10 backdrop-blur-md">
             <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
               <Info size={20} className="text-yellow-400" />
             </div>
             <p className="text-[9px] font-bold uppercase leading-relaxed tracking-wider text-blue-50">
               Directives reward 5-15 units based on complexity. Standard daily cap protocols apply to all non-VIP accounts.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
