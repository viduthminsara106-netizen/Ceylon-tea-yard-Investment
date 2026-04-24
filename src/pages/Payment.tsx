import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { plans } from '../data/plans';
import { ChevronLeft, Share2, Wallet, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Payment() {
  const { slug } = useParams();
  const navigate = useNavigate();
  let plan = plans.find(p => p.slug === slug);
  if (!plan && slug?.startsWith('recharge-')) {
    const amount = parseInt(slug.split('-')[1]);
    if (!isNaN(amount)) {
      plan = {
        id: Date.now(),
        slug: slug,
        name: `Vault Recharge`,
        price: amount,
        days: 0,
        dailyIncome: 0,
        dailyPercent: 0,
        totalIncome: 0,
        totalPercent: 0,
        image: ''
      };
    }
  }
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBalance(docSnap.data().balance || 0);
        }
      }
    };
    fetchBalance();
  }, []);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      navigate(`/checkout/${plan?.slug}`);
    }, 2000);
  };

  if (!plan) {
    return <div className="p-4 text-center">Product not found</div>;
  }

  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-32 relative overflow-x-hidden">
      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/90 backdrop-blur-md z-[100] flex items-center justify-center p-8 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <motion.h3 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-black italic text-gray-800"
              >
                Preparing Secure Vault...
              </motion.h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Ceylon Tea Yard Security</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center p-4 bg-white/50 backdrop-blur-sm border-b border-gray-100"
      >
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 flex-1 text-center">Checkout Portal</h2>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Share2 size={20} className="text-gray-700" />
        </button>
      </motion.div>

      {/* Hero Section / Sinhala Message */}
      <div className="px-6 py-10 text-center">
         <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.7 }}
           className="mb-4 inline-flex items-center gap-2 bg-green-50 px-4 py-1.5 rounded-full border border-green-100"
         >
           <ShieldCheck size={14} className="text-green-600" />
           <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Verified Payment Channel</span>
         </motion.div>

         <motion.h1 
           className="text-2xl font-black text-gray-900 leading-snug italic"
           initial="hidden"
           animate="visible"
           variants={{
             hidden: { opacity: 0 },
             visible: {
               opacity: 1,
               transition: {
                 staggerChildren: 0.08,
                 delayChildren: 0.3,
               }
             }
           }}
         >
           {"ඔබ අප සමග අත්වැල් බැද ගෙන Ceylon Tea yard සාර්ථක ආයෝජයෙකු ලෙස දිගු කාලීන ගමනක් යෑමට සූදානම්ද ?".split(" ").map((word, index) => (
             <motion.span
               key={index}
               variants={{
                 hidden: { opacity: 0, y: 15, scale: 0.9 },
                 visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 10 } }
               }}
               className="inline-block mr-[0.25em]"
             >
               {word}
             </motion.span>
           ))}
         </motion.h1>
         <motion.p 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5 }}
           className="text-gray-400 text-xs font-bold uppercase tracking-[0.15em] mt-2"
         >
           Are you ready to secure your harvest?
         </motion.p>
      </div>

      {/* Balance Card Section */}
      <div className="px-6 mb-8">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-green-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-1">Portfolio Balance</p>
                <p className="text-3xl font-black italic">Rs {balance.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl">
                <Wallet className="text-green-400" size={24} />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] text-green-100 font-bold uppercase tracking-widest">ID: {auth.currentUser?.email?.split('@')[0] || 'Member'}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Payment Details */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="px-6 space-y-6"
      >
        {/* Item Summary */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-green-600"></div>
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Investment Selection</h3>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xl font-black text-gray-800 italic leading-none">{plan.name}</p>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Ceylon Premium Asset</p>
            </div>
            <div className="text-right">
              <p className="text-green-700 text-2xl font-black italic leading-none">Rs {plan.price.toLocaleString()}</p>
              <p className="text-[9px] font-black text-gray-400 mt-1 uppercase">Net Capital Req.</p>
            </div>
          </div>
        </div>

        {/* Deposit Notice */}
        <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-xl">
              <AlertCircle size={18} className="text-orange-600" />
            </div>
            <h3 className="font-black text-xs uppercase tracking-widest text-orange-800">Deposit Notice</h3>
          </div>
          <ul className="space-y-3">
            {[
              "Deposits are processed manually for maximum security.",
              "Voucher upload is required at the next step.",
              "Expected verification time: 5-30 minutes.",
              "Min. Deposit Level 1 verified assets apply."
            ].map((note, i) => (
              <li key={i} className="flex items-start gap-3 text-[11px] text-orange-900/70 font-medium">
                <CheckCircle2 size={12} className="text-orange-400/60 mt-0.5 shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
           <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-2">Channel Selection</h3>
           
           <button 
             onClick={() => setSelectedMethod('bank')}
             className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${selectedMethod === 'bank' ? 'bg-white border-green-600 shadow-lg shadow-green-50' : 'bg-gray-50 border-gray-100 grayscale opacity-40'}`}
           >
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-xl ${selectedMethod === 'bank' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <CheckCircle2 size={20} />
                 </div>
                 <div className="text-left">
                    <p className="font-black text-gray-800 italic">Pay 1 (Direct Transfer)</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instant Settlement</p>
                 </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'bank' ? 'border-green-600' : 'border-gray-200'}`}>
                 {selectedMethod === 'bank' && <div className="w-3 h-3 bg-green-600 rounded-full"></div>}
              </div>
           </button>
        </div>
      </motion.div>

      {/* Floating Action Dock */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 1 }}
        className="fixed bottom-[90px] left-6 right-6 z-40"
      >
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-2 border border-white shadow-2xl flex items-center gap-2">
          <div className="flex-1 pl-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Payable</p>
            <p className="text-xl font-black text-green-800 italic leading-none">Rs {plan.price.toLocaleString()}</p>
          </div>
          <button 
            onClick={handlePay}
            className="bg-green-600 h-14 px-8 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-green-200 group"
          >
            <span className="text-white font-black text-sm uppercase tracking-widest">Continue to Pay</span>
            <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Decorative Gradients */}
      <div className="fixed top-0 right-0 w-64 h-64 bg-green-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-1/4 left-0 w-80 h-80 bg-orange-50/30 rounded-full blur-[140px] -z-10 pointer-events-none" />
    </div>
  );
}
