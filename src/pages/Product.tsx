import { useNavigate, useOutletContext } from 'react-router-dom';
import { plans, TeaPlan } from '../data/plans';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

function CountdownTimer({ launchDate }: { launchDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number}>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(launchDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [launchDate]);

  return (
    <div className="flex gap-2 text-xs font-bold text-gray-500 mt-2 bg-gray-100 p-2 rounded-lg items-center justify-center border border-gray-200">
        Starts in: 
        <span className="text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">{timeLeft.days}d</span>
        <span className="text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">{timeLeft.hours}h</span>
        <span className="text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">{timeLeft.minutes}m</span>
        <span className="text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">{timeLeft.seconds}s</span>
    </div>
  );
}

export default function Product() {
  const navigate = useNavigate();
  const { balance } = useOutletContext<{ balance: number }>();

  return (
    <div className="bg-gray-50 min-h-full pb-20">
      {/* Banner Section */}
      <div className="relative">
        <img 
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80" 
          alt="Ceylon Tea Yard Products" 
          className="w-full h-40 object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent flex flex-col justify-end px-4 pb-12">
          <h1 className="text-white text-3xl font-black drop-shadow-lg">Investment</h1>
        </div>
      </div>

      {/* Balance Tab overlapping banner */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-4 -mt-6 relative z-10 w-fit"
      >
        <div className="bg-green-50 rounded-t-xl px-6 py-2 border border-b-0 border-green-100 shadow-sm inline-block">
          <p className="text-green-800 font-bold tracking-widest text-sm">TEA ESTATE</p>
        </div>
      </motion.div>

      {/* Product List */}
      <div className="px-4 space-y-4">
        {plans.map((plan) => (
          <motion.div 
            key={plan.id} 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="flex justify-between items-start p-4">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3">{plan.name}</h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Product price:</span>
                    <span className="font-semibold text-green-600">Rs {plan.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Product cycle:</span>
                    <span className="font-semibold text-green-600">{plan.days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Daily income:</span>
                    <span className="font-semibold text-green-600">Rs {plan.dailyIncome.toLocaleString()} | {plan.dailyPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expected income:</span>
                    <span className="font-semibold text-green-600">Rs {plan.totalIncome.toLocaleString()} | {plan.totalPercent}%</span>
                  </div>
                  {plan.isComingSoon && plan.launchDate && (
                    <CountdownTimer launchDate={plan.launchDate} />
                  )}
                </div>
              </div>
              <div className="w-24 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center relative">
                <img 
                  src={plan.image} 
                  alt={plan.name} 
                  className={`w-full h-full object-cover relative z-10 ${plan.isComingSoon ? 'grayscale' : ''}`} 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Fallback to distinct generic placeholder based on their ID to avoid they all showing the same image
                    target.src = `https://picsum.photos/seed/tea_plan_${plan.id}/400/300`;
                  }}
                />
                {plan.isComingSoon && (
                  <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-[10px] font-black tracking-widest bg-orange-500 px-2 py-1 rounded">SOON</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.2 7.8l-2.6 2.6c1.1 1.2 1.4 3 .8 4.7l-1.3-.3c.4-1.2.1-2.5-.7-3.4l-2.6 2.6-1.4-1.4 2.6-2.6c-.9-.8-2.2-1.1-3.4-.7l-.3-1.3c1.7-.6 3.5-.3 4.7.8l2.6-2.6 1.4 1.4z"/><path d="M8 8.7L11.3 12 8 15.3l-1.4-1.4L8.5 12 6.6 10.1 8 8.7z"/><path d="M14.5 14.5l-3.3-3.3 3.3-3.3 1.4 1.4-1.9 1.9 1.9 1.9-1.4 1.4z"/></svg>
                </div>
              </div>
            </div>
            
            <div className={`p-3 flex justify-between items-center rounded-b-xl border-t ${plan.isComingSoon ? 'bg-gray-200 border-gray-300' : 'bg-green-400 border-green-500'}`}>
              <span className={`font-bold ${plan.isComingSoon ? 'text-gray-500' : 'text-green-900'}`}>Rs {plan.price.toLocaleString()}</span>
              <motion.button 
                onClick={() => !plan.isComingSoon && navigate(`/payment/${plan.slug}`)}
                className={`px-6 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors ${plan.isComingSoon ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                disabled={plan.isComingSoon}
                whileHover={!plan.isComingSoon ? { scale: 1.05 } : {}}
                whileTap={!plan.isComingSoon ? { scale: 0.95 } : {}}
                animate={!plan.isComingSoon ? { 
                  scale: [1, 1.04, 1],
                  boxShadow: ["0px 0px 0px rgba(22,163,74,0)", "0px 0px 12px rgba(22,163,74,0.6)", "0px 0px 0px rgba(22,163,74,0)"] 
                } : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                {plan.isComingSoon ? 'Coming Soon' : 'Invest now'}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
