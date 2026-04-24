import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { DownloadCloud, LogIn, ArrowUpCircle, MessageSquare, Info, Star } from 'lucide-react';
import { plans } from '../data/plans';
import { motion, AnimatePresence } from 'motion/react';

const bannerImages = [
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
  "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80",
  "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800&q=80",
  "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
  "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=800&q=80",
  "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80"
];

export default function Home() {
  const { balance, mobileNumber } = useOutletContext<{ balance: number; mobileNumber: string }>();
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-100 min-h-full pb-28">
      {/* Banner Section with Parallax Effect */}
      <div className="relative h-64 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentBanner}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            src={bannerImages[currentBanner]} 
            alt="Ceylon Tea Yard" 
            className="w-full h-full object-cover absolute inset-0"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100 via-green-950/20 to-transparent flex flex-col justify-end p-8 pb-16">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-white text-3xl font-black tracking-tight drop-shadow-xl uppercase italic">
              Ceylon Tea Yard
            </h1>
            <p className="text-white/80 font-semibold tracking-widest text-[10px] uppercase mt-1">
              Cultivating Prosperity Together
            </p>
          </motion.div>
        </div>
        
        {/* Banner Indicators */}
        <div className="absolute bottom-16 right-8 flex gap-2 z-10">
          {bannerImages.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${currentBanner === i ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      </div>

      {/* Balance Card Overlapping - iOS Glassmorphism */}
      <div className="px-6 -mt-10 relative z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-[2rem] p-6 shadow-2xl flex justify-between items-center bg-white/80 backdrop-blur-xl border border-white/40"
        >
          <div className="flex-1 text-center">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Vault Portfolio</p>
            <p className="text-green-700 text-2xl font-black italic">Rs {balance}</p>
          </div>
          <div className="w-px h-8 bg-gray-100 mx-4"></div>
          <div className="flex-1 text-center">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Today's Harvest</p>
            <p className="text-green-700 text-2xl font-black italic">Rs 0</p>
          </div>
        </motion.div>
      </div>

      {/* Action Grid - Floating Apple Style */}
      <div className="px-6 mt-8">
        <div className="grid grid-cols-4 gap-4">
            {[
              { id: 'recharge', icon: ArrowUpCircle, label: 'Recharge', path: '/recharge', color: 'text-green-600', bg: 'bg-green-50' },
              { id: 'withdraw', icon: DownloadCloud, label: 'Withdraw', path: '/wallet', color: 'text-orange-500', bg: 'bg-orange-50' },
            { id: 'checkin', icon: LogIn, label: 'Check in', path: '/check-in', color: 'text-purple-600', bg: 'bg-purple-50' },
            { id: 'service', icon: MessageSquare, label: 'Inquiry', path: '/official-channel', color: 'text-blue-500', bg: 'bg-blue-50' },
          ].map((action, i) => (
            <motion.button 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + (i * 0.1) }}
              key={action.id}
              onClick={() => navigate(action.path)} 
              className="flex flex-col items-center group active:scale-90 transition-all"
            >
              <div className={`w-14 h-14 ${action.bg} rounded-2xl flex items-center justify-center ${action.color} mb-2 shadow-sm border border-white group-hover:shadow-md transition-all`}>
                <action.icon size={24} />
              </div>
              <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Promotion Banner */}
      <div className="px-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-green-600 to-green-800 rounded-3xl p-5 flex items-center gap-4 shadow-xl relative overflow-hidden"
        >
            <motion.div 
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 z-0 pointer-events-none"
            />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <motion.div 
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }}
              className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 relative z-10"
            >
                <Star className="text-white fill-white" size={24} />
            </motion.div>
            <div className="relative z-10">
                <h4 className="text-white font-black text-sm italic">New Member Special</h4>
                <p className="text-green-100 text-xs font-semibold">Get Rs 100 free on registration.</p>
            </div>
        </motion.div>
      </div>

      {/* Product List Title */}
      <div className="px-8 mt-10 mb-4 flex justify-between items-end">
        <div>
            <h3 className="text-xl font-black text-gray-800 italic">Tea Investments</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Premium Assets</p>
        </div>
        <button onClick={() => navigate('/product')} className="text-green-600 text-xs font-black uppercase tracking-widest">View All</button>
      </div>

      {/* Product List */}
      <div className="px-6 space-y-4">
        {plans.slice(0, 3).map((plan, i) => (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
            transition={{ duration: 0.4 }}
            key={plan.id} 
            className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden p-5 flex gap-4 group hover:shadow-lg transition-all"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="w-24 h-32 rounded-2xl overflow-hidden shrink-0 shadow-md">
              <img 
                src={plan.image} 
                alt={plan.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://picsum.photos/seed/tea_plan_${plan.id}/400/300`;
                }}
              />
            </div>
            <div className="flex-1 py-1">
              <h3 className="font-black text-gray-800 text-base leading-tight mb-2 italic">{plan.name}</h3>
              
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block">Entry Price</span>
                  <span className="font-black text-green-700 text-sm italic">Rs {plan.price.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block">Duration</span>
                  <span className="font-black text-green-700 text-sm italic">{plan.days} days</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block">Daily Profit</span>
                  <span className="font-black text-green-700 text-sm italic">Rs {plan.dailyIncome.toLocaleString()}</span>
                </div>
              </div>

              <motion.button 
                onClick={() => navigate(`/payment/${plan.slug}`)}
                className="mt-4 w-full py-2 bg-green-600 border-none rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white hover:bg-green-700 transition-colors shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={{ 
                  scale: [1, 1.02, 1],
                  boxShadow: ["0px 0px 0px rgba(22,163,74,0)", "0px 0px 12px rgba(22,163,74,0.6)", "0px 0px 0px rgba(22,163,74,0)"] 
                }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                Invest Now
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
