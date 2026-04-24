import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { plans } from '../data/plans';
import { ChevronLeft, Share2, ShieldCheck, Zap, TrendingUp, Clock, Wallet, Leaf, Award, Globe, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const plan = plans.find(p => p.slug === slug);
  const [activeTab, setActiveTab] = useState<'info' | 'benefits'>('info');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate image loading or just a slight delay for smooth entrance
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Leaf className="w-16 h-16 text-green-200 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Product not found</h2>
          <button onClick={() => navigate('/product')} className="mt-4 text-green-600 font-bold flex items-center gap-2">
            <ChevronLeft size={20} /> Back to Products
          </button>
        </motion.div>
      </div>
    );
  }

  const benefits = [
    { icon: TrendingUp, title: "High Yield", desc: `${plan.totalPercent}% total return over ${plan.days} days` },
    { icon: ShieldCheck, title: "Verified Estate", desc: "Sustainably managed and legally protected land" },
    { icon: Zap, title: "Daily Payouts", desc: `Rs ${plan.dailyIncome} credited to your wallet every 24 hours` },
    { icon: Clock, title: "Fixed Period", desc: `Short-term ${plan.days}-day holding with guaranteed exit` },
  ];

  const features = [
    { icon: Award, label: "Premium Grade", value: "A++ Quality" },
    { icon: Globe, label: "Origin", value: "Central Highlands" },
    { icon: Wallet, label: "Min. Investment", value: `Rs ${plan.price}` },
  ];

  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-32 overflow-x-hidden">
      {/* Dynamic Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between"
      >
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Estate Portfolio</h2>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Share2 size={20} className="text-gray-700" />
        </button>
      </motion.header>

      {/* Hero Image Section */}
      <div className="relative h-[45vh] w-full overflow-hidden pt-14">
        <AnimatePresence>
          {isLoaded && (
            <motion.img 
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              src={plan.image} 
              alt={plan.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://picsum.photos/seed/tea_plan_detail_${plan.id}/800/600`;
              }}
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfbf9] via-transparent to-black/20" />
        
        {/* Floating Price Badge */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute bottom-10 right-6 bg-white shadow-2xl rounded-2xl p-4 border border-green-50 z-20"
        >
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Entry Capital</p>
          <p className="text-2xl font-black text-green-700 italic">Rs {plan.price.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Content Container */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="px-6 -mt-8 relative z-30"
      >
        {/* Category Label */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-[1px] w-8 bg-green-600"></div>
          <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.3em]">Premium Asset Class</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black text-gray-900 leading-none mb-6 italic tracking-tight">
          {plan.name}
        </h1>

        {/* Feature Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {features.map((f, i) => (
            <motion.div 
              key={f.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + (i * 0.1) }}
              className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center"
            >
              <f.icon size={16} className="text-green-600 mx-auto mb-2" />
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{f.label}</p>
              <p className="text-[10px] font-black text-gray-800">{f.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs for Info / Benefits */}
        <div className="flex border-b border-gray-100 mb-6 gap-6">
          {['info', 'benefits'].map((t) => (
            <button 
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`pb-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === t ? 'text-gray-900' : 'text-gray-400'}`}
            >
              {t}
              {activeTab === t && (
                <motion.div 
                  layoutId="activeTabProduct"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'info' ? (
            <motion.div 
              key="info"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {/* Financial Summary Card */}
              <div className="bg-green-950 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                
                <div className="grid grid-cols-2 gap-8 relative z-10">
                  <div>
                    <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-2">Daily Revenue</p>
                    <p className="text-2xl font-black italic">Rs {plan.dailyIncome.toLocaleString()}</p>
                    <p className="text-green-400/60 text-[9px] font-bold mt-1">ROI: {plan.dailyPercent}% / Day</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-2">Estimated Total</p>
                    <p className="text-2xl font-black italic">Rs {plan.totalIncome.toLocaleString()}</p>
                    <p className="text-green-400/60 text-[9px] font-bold mt-1">Growth: {plan.totalPercent}%</p>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-green-400" />
                    <span className="text-[11px] font-bold text-white/80">{plan.days} Days Contract</span>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                    High Efficiency
                  </div>
                </div>
              </div>

              {/* Narrative */}
              <div className="prose prose-sm text-gray-500 leading-relaxed font-medium">
                <p>
                  Our {plan.name} represents a unique opportunity to participate in Sri Lanka's world-renowned tea economy. This estate uses regenerative farming techniques to ensure soil health while maximizing leaf quality.
                </p>
                <p>
                  Investors receive daily disbursements based on the harvest yield. With a fixed {plan.days}-day cycle, this asset offers high liquidity compared to traditional agricultural investments.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="benefits"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="grid gap-4"
            >
              {benefits.map((b, i) => (
                <motion.div 
                  key={b.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-5 rounded-3xl border border-gray-100 flex items-start gap-4 shadow-sm hover:shadow-md hover:border-green-100 transition-all group"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors duration-500">
                    <b.icon size={22} />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-800 italic mb-1">{b.title}</h4>
                    <p className="text-xs text-gray-400 font-medium leading-tight">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating CTA Dock */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed bottom-[90px] left-6 right-6 z-40"
      >
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-2 border border-white shadow-2xl flex items-center gap-2 overflow-hidden">
          <div className="flex-1 pl-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Portfolio Price</p>
            <p className="text-xl font-black text-green-800 italic leading-none">Rs {plan.price.toLocaleString()}</p>
          </div>
          <motion.button 
            onClick={() => navigate(`/payment/${plan.slug}`)}
            className="bg-green-600 h-14 px-8 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-green-200"
            whileHover={{ scale: 1.02 }}
            animate={{ 
              backgroundColor: ["#16a34a", "#22c55e", "#16a34a"],
            }}
            transition={{ 
              backgroundColor: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <span className="text-white font-black text-sm uppercase tracking-widest">Acquire Asset</span>
            <ArrowRight size={18} className="text-white" />
          </motion.button>
        </div>
      </motion.div>

      {/* Background Decorative Element */}
      <div className="fixed top-1/2 left-0 w-64 h-64 bg-green-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-orange-50/30 rounded-full blur-[140px] -z-10 pointer-events-none" />
    </div>
  );
}
