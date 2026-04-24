import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'motion/react';
import { ChevronLeft, Gift, Star } from 'lucide-react';

export default function TeamTask() {
  const navigate = useNavigate();
  const [level1Count, setLevel1Count] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamSize = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(collection(db, 'user_public'), where('referredBy', '==', auth.currentUser.uid));
        const snap = await getDocs(q);
        setLevel1Count(snap.size);
      } catch (error) {
        console.error("Error fetching team size:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamSize();
  }, []);

  const tasks = [
    { id: 1, target: 5, reward: 800, current: level1Count },
    { id: 2, target: 10, reward: 3800, current: level1Count },
    { id: 3, target: 20, reward: 8500, current: level1Count },
    { id: 4, target: 50, reward: 21000, current: level1Count },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-gray-50/80">
      {/* Dynamic Background Image Fixed */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Munnar_tea_plantation.jpg/800px-Munnar_tea_plantation.jpg" 
          alt="Tea Yard Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-green-950/70 to-gray-50/95"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-6 px-4 flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-sm active:scale-95 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-black text-white flex-1 text-center mr-10 tracking-wide drop-shadow-md">Team Task</h2>
      </div>

      <div className="relative z-10 px-4 space-y-5">
        {/* iOS Style Info Box */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", damping: 20 }}
          className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-xl shadow-green-900/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Gift size={64} className="text-green-600" />
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-500/30">
              <Star size={24} className="text-white fill-white/20" />
            </div>
            <p className="text-gray-700 text-sm font-semibold leading-relaxed">
              When the number of <span className="text-green-600 font-extrabold bg-green-50 px-1.5 py-0.5 rounded-md">Level 1</span> members you invite reaches the target, you can receive the corresponding cash rewards instantly.
            </p>
          </div>
        </motion.div>

        {/* Task List */}
        <div className="space-y-4">
          {tasks.map((task, index) => {
            const progress = Math.min(100, (task.current / task.target) * 100);
            const isCompleted = task.current >= task.target;

            return (
              <motion.div 
                key={task.id} 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + (index * 0.1), type: "spring", damping: 20 }}
                className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] shadow-sm shadow-green-900/10 border border-white p-5 relative overflow-hidden flex flex-col gap-5"
              >
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-green-400 to-green-600 opacity-20"></div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center font-black text-gray-400 text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-gray-800 font-bold text-[15px] leading-tight mb-1">
                      Invite {task.target} Level 1 members
                    </h3>
                    <p className="text-green-600 font-extrabold text-sm flex items-center gap-1">
                      <Gift size={14} /> Receive Rs {task.reward.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-end gap-3 mt-1">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold px-1">
                      <span className="text-gray-500 uppercase tracking-wider">Progress</span>
                      <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{task.current} / {task.target}</span>
                    </div>
                    <div className="h-3.5 bg-gray-100 rounded-full overflow-hidden shadow-inner relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + (index * 0.1), ease: "easeOut" }}
                        className={`absolute top-0 left-0 bottom-0 rounded-full transition-colors ${
                          isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-gray-300 to-gray-400'
                        }`}
                      />
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: isCompleted ? 1.05 : 1 }}
                    whileTap={{ scale: isCompleted ? 0.95 : 1 }}
                    className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm transition-all ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    }`}
                    disabled={!isCompleted}
                  >
                    Receive
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
