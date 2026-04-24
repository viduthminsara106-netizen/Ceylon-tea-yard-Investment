import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Zap, Shield } from 'lucide-react';

export default function Recharge() {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);

  const amounts = [500, 1000, 3000, 5000, 10000, 20000, 50000, 100000];

  const handleBuy = () => {
    navigate(`/payment/recharge-${selectedAmount}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold text-gray-800 text-lg flex-1 text-center">Add Funds</span>
        <div className="w-8"></div> {/* Placeholder for centering */}
      </div>

      <div className="p-4 space-y-6">
        
        {/* Helper message */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex gap-3">
           <div className="p-2 bg-green-100 rounded-xl shrink-0 h-min">
             <Shield className="text-green-600" size={20} />
           </div>
           <div>
             <h3 className="font-bold text-green-900 text-sm mb-1">Fast & Secure Recharge</h3>
             <p className="text-green-800/70 text-xs leading-relaxed">Select an amount below to top-up your balance. Your funds will be deposited securely into your Vault Portfolio.</p>
           </div>
        </div>

        {/* Packages Grid */}
        <div>
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1 mb-4">Select Recharge Package</h2>
          <div className="grid grid-cols-2 gap-3">
            {amounts.map((amount) => (
              <motion.button
                key={amount}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAmount(amount)}
                className={`relative p-4 rounded-2xl border-2 transition-all ${
                  selectedAmount === amount 
                    ? 'bg-green-50 border-green-500 shadow-sm' 
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex justify-center items-center gap-1 mb-1">
                  <span className={`text-sm ${selectedAmount === amount ? 'text-green-600 font-bold' : 'text-gray-500'}`}>Rs</span>
                  <span className={`text-2xl font-black ${selectedAmount === amount ? 'text-green-700' : 'text-gray-800'}`}>
                    {amount.toLocaleString()}
                  </span>
                </div>
                {selectedAmount === amount && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
                    <Zap size={14} fill="white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleBuy}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-200 transition-all"
        >
          Buy Rs {selectedAmount.toLocaleString()}
        </motion.button>

      </div>
    </div>
  );
}
