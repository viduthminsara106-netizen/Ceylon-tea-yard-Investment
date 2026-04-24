import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronLeft, CheckCircle2, AlertCircle, Sparkles, Trophy } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { useToast } from '../components/Toast';

export default function CheckIn() {
  const navigate = useNavigate();
  const { userData } = useOutletContext<{ userData: any }>();
  const { showToast } = useToast();
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!userData) return;

    const checkEligibility = () => {
      if (!userData.lastCheckIn) {
        setCanCheckIn(true);
        return;
      }

      const lastCheckInTime = userData.lastCheckIn.toDate().getTime();
      const nextCheckInTime = lastCheckInTime + (24 * 60 * 60 * 1000);
      const now = new Date().getTime();

      if (now >= nextCheckInTime) {
        setCanCheckIn(true);
        setTimeLeft(null);
      } else {
        setCanCheckIn(false);
        const diff = nextCheckInTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    checkEligibility();
    const interval = setInterval(checkEligibility, 1000);
    return () => clearInterval(interval);
  }, [userData]);

  const handleCheckIn = async () => {
    if (!auth.currentUser || !canCheckIn || isProcessing) return;

    setIsProcessing(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // If the document is missing entirely, we need to create it with initial values
      // Otherwise updateDoc fails with "No document to update"
      if (!userData || Object.keys(userData).length === 0 || !userData.createdAt) {
         // Because firestore.rules requires specific fields for create
         await updateDoc(userRef, {
             balance: increment(10),
             lastCheckIn: serverTimestamp()
         }).catch(async (e) => {
             console.log("updateDoc failed, trying setDoc", e.message);
             // Create baseline document
             const { setDoc } = await import('firebase/firestore');
             await setDoc(userRef, {
                 uid: auth.currentUser!.uid,
                 mobileNumber: auth.currentUser!.email?.split('@')[0] || '',
                 role: 'user',
                 balance: 10,
                 lastCheckIn: serverTimestamp(),
                 createdAt: serverTimestamp()
             }, { merge: true });
         });
      } else {
         await updateDoc(userRef, {
           balance: increment(10),
           lastCheckIn: serverTimestamp()
         });
      }
      
      showToast("Daily bonus Rs 10 claimed!", "success");
    } catch (error) {
      console.error("Check-in failed:", error);
      showToast("Failed to claim bonus. Try again later.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-24 overflow-x-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between"
      >
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Yield Registry</h2>
        <div className="w-10"></div>
      </motion.header>

      <div className="pt-20 px-6">
        {/* Title Section */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-600 mx-auto mb-6 shadow-sm border border-green-100"
          >
            <Calendar size={32} />
          </motion.div>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-black text-gray-900 italic mb-2"
          >
            Daily Check In
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-[10px] font-black uppercase tracking-widest"
          >
            පැය 24කට වතාවක් ලබා ගත හැකිය
          </motion.p>
        </div>

        {/* Reward Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl relative overflow-hidden mb-8"
        >
          <div className="absolute top-0 right-0 p-4">
            <Sparkles className="text-green-200" size={24} />
          </div>
          
          <div className="text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Claimable Harvest</p>
            <h2 className="text-5xl font-black text-green-700 italic mb-6">Rs 10</h2>
            
            <motion.button 
              onClick={handleCheckIn}
              disabled={!canCheckIn || isProcessing}
              className={`w-full h-16 rounded-full flex items-center justify-center gap-3 transition-all font-black uppercase tracking-widest text-sm ${
                canCheckIn ? 'bg-green-600 text-white shadow-lg shadow-green-200 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={canCheckIn ? { scale: 1.02 } : {}}
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {canCheckIn ? (
                    <>Claim Reward <Trophy size={18} /></>
                  ) : (
                    <>Locked Portfolio</>
                  )}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Status / Countdown */}
        <AnimatePresence mode="wait">
          {!canCheckIn && timeLeft && (
            <motion.div 
              key="countdown"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-orange-50 rounded-3xl p-6 border border-orange-100 flex items-center gap-4"
            >
              <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Next Registration Available In</p>
                <p className="text-xl font-black text-orange-900 italic">{timeLeft}</p>
              </div>
            </motion.div>
          )}

          {canCheckIn && (
            <motion.div 
              key="available"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 rounded-3xl p-6 border border-green-100 flex items-center gap-4"
            >
              <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-xl font-black text-green-900 italic">Ready to harvest</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Benefits Info */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-3 pl-2">
            <div className="h-[1px] w-8 bg-gray-200"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Rules</span>
          </div>
          
          <div className="grid gap-3">
             {[
               { icon: Calendar, title: "Daily Cycle", desc: "Bonus resets exactly 24 hours after your last claim." },
               { icon: Trophy, title: "Instant Wallet", desc: "Bonus is credited immediately to your investment vault." },
               { icon: Sparkles, title: "Zero Cost", desc: "This is a fidelity reward part of the tea estate program." }
             ].map((rule, i) => (
               <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-gray-50 shadow-sm">
                 <div className="text-green-600 p-2 bg-green-50 rounded-xl">
                   <rule.icon size={18} />
                 </div>
                 <div>
                   <h4 className="font-black text-gray-800 text-xs italic">{rule.title}</h4>
                   <p className="text-[10px] text-gray-400 font-bold">{rule.desc}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-1/2 left-0 w-64 h-64 bg-green-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-orange-50/30 rounded-full blur-[140px] -z-10 pointer-events-none" />
    </div>
  );
}
