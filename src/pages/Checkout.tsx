import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { plans } from '../data/plans';
import { ChevronLeft, MoreHorizontal, Copy, Upload, X, MoreVertical } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '../components/Toast';

export default function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
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
  const [timeLeft, setTimeLeft] = useState(590); // 9:50 in seconds
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitialLoading || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isInitialLoading]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      showToast("Copied to clipboard!", "success");
    } catch (error) {
      console.error("Copy failed", error);
      showToast("Failed to copy text.", "error");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for receipt images
        showToast("Image too large. Please upload an image smaller than 1MB.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    if (!receiptImage) {
      showToast("Please upload a payment voucher first.", "error");
      return;
    }
    setIsProcessing(true);
    
    try {
      if (auth.currentUser && plan) {
        const txId = 'dep-' + auth.currentUser.uid + '-' + Date.now();
        const txRef = doc(db, 'transactions', txId);
        await setDoc(txRef, {
          userId: auth.currentUser.uid,
          type: 'deposit',
          amount: plan.price,
          status: 'pending',
          createdAt: serverTimestamp(),
          description: `${plan.name} Deposit`,
          receiptImage: receiptImage
        });
        showToast("Payment submitted successfully!", "success");
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      showToast("Failed to submit payment. Please try again.", "error");
    }

    setTimeout(() => {
      navigate('/order');
    }, 3000);
  };

  if (!plan) return <div className="p-4 text-center">Product not found</div>;

  if (isInitialLoading || isProcessing) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Black Header matching screenshot */}
        <div className="flex items-center p-4 bg-black text-white">
          <button onClick={() => isInitialLoading ? navigate(-1) : setIsProcessing(false)} className="mr-4">
            <X size={24} />
          </button>
          <h2 className="text-lg font-medium flex-1">payment page</h2>
          <button className="ml-4">
            <MoreVertical size={24} />
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center pb-32">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 border-[4px] border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-[4px] border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            <div className="w-24 h-24 bg-[#8bc34a] rounded-full flex items-center justify-center text-white border-4 border-white shadow-sm z-10">
              {/* Money Bag SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M12 2C9.5 2 8 4 8 4l-1 4h10l-1-4s-1.5-2-4-2zm-5 7c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2H7zm5 2c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zm0 1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 1h-1v1h1v-1z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white min-h-screen pb-32"
    >
      {/* Banner */}
      <div className="bg-gradient-to-b from-green-800 to-green-900 text-white py-20 px-4 text-center relative overflow-hidden">
        {/* Starburst effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-40 transform rotate-45"></div>
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-40 transform -rotate-45"></div>
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>
          <div className="absolute w-[2px] h-full bg-gradient-to-b from-transparent via-white to-transparent opacity-80"></div>
          <div className="absolute w-32 h-32 bg-white rounded-full blur-[50px] opacity-70"></div>
          
          {/* Extra rays for the starburst */}
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform rotate-[22.5deg]"></div>
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -rotate-[22.5deg]"></div>
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform rotate-[67.5deg]"></div>
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -rotate-[67.5deg]"></div>
        </div>

        <h1 className="text-4xl font-bold tracking-[0.15em] relative z-10 flex items-center justify-center gap-4 mt-4">
          <span className="w-12 h-px bg-white/70"></span>
          SAFE <span className="text-green-100 text-5xl leading-none -mt-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">✦</span> FAST
          <span className="w-12 h-px bg-white/70"></span>
        </h1>
      </div>

      {/* Warning */}
      <div className="p-4">
        <div className="flex items-start gap-2 text-[#d32f2f] mb-4">
          <div className="w-5 h-5 rounded-full bg-[#d32f2f] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">!</div>
          <p className="font-medium">Warning</p>
        </div>
        <p className="text-[#d32f2f] text-sm mb-4">
          * Submitting payment vouchers can help us confirm your order as soon as possible
        </p>
        <p className="text-[#d32f2f] text-sm mb-6">
          Please make payment to the account number below.
        </p>

        {/* Bank Details Card */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Account Title</span>
              <div className="flex items-center gap-2">
                <span className="text-blue-800 font-medium underline decoration-blue-800/30 underline-offset-2">Ceylon Tea Company.Pvd</span>
                <button onClick={() => handleCopy('Ceylon Tea Company.Pvd')}><Copy size={16} className="text-gray-500" /></button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bank Account</span>
              <div className="flex items-center gap-2">
                <span className="text-blue-800 font-medium underline decoration-blue-800/30 underline-offset-2">001021284929</span>
                <button onClick={() => handleCopy('001021284929')}><Copy size={16} className="text-gray-500" /></button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bank Name</span>
              <div className="flex items-center gap-2">
                <span className="text-blue-800 font-medium underline decoration-blue-800/30 underline-offset-2">Dialog finance plc</span>
                <button onClick={() => handleCopy('Dialog finance plc')}><Copy size={16} className="text-gray-500" /></button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Branch Name</span>
              <div className="flex items-center gap-2">
                <span className="text-blue-800 font-medium underline decoration-blue-800/30 underline-offset-2">Head office</span>
                <button onClick={() => handleCopy('Head office')}><Copy size={16} className="text-gray-500" /></button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount</span>
              <div className="flex items-center gap-2">
                <span className="text-[#4caf50] font-medium">{plan.price.toLocaleString()}</span>
                <button onClick={() => handleCopy(plan.price.toString())}><Copy size={16} className="text-gray-500" /></button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Countdown</span>
              <span className="text-gray-800 font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">👉</span>
            <span className="text-[#d32f2f] font-medium">payment voucher</span>
          </div>
          
          <label htmlFor="receipt-upload" className="cursor-pointer block w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 relative overflow-hidden group">
            {receiptImage ? (
              <img src={receiptImage} alt="Receipt" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative z-10 w-10 h-12 bg-green-100 rounded flex items-center justify-center shadow-sm group-hover:bg-green-200 transition-colors">
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white">
                      <Upload size={12} />
                    </div>
                  </div>
                </div>
              </>
            )}
            <input 
              type="file" 
              id="receipt-upload" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {/* Confirm Button */}
        <button 
          onClick={handleConfirm}
          className={`w-full py-3.5 rounded-full font-medium text-lg transition-colors ${
            receiptImage ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm' : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
        >
          Confirm
        </button>
      </div>
    </motion.div>
  );
}
