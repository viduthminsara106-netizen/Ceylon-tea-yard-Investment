import React, { useState, useEffect, memo } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, query, collection, where, getDocs, limit, writeBatch, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Lock, Eye, EyeOff, UserPlus, LogIn, Leaf, ChevronRight, CheckCircle2 } from 'lucide-react';

const LeafIcon = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M2 12C2 12 7 2 12 2C17 2 22 12 22 12C22 12 17 22 12 22C7 22 2 12 2 12Z" 
      fill="currentColor" 
      className="opacity-80"
    />
    <path 
      d="M2 12H22" 
      stroke="white" 
      strokeWidth="0.5" 
      strokeLinecap="round" 
      strokeDasharray="2 2"
    />
    <path 
      d="M12 2C12 2 14 7 14 12C14 17 12 22 12 22" 
      stroke="white" 
      strokeWidth="0.5" 
      strokeLinecap="round" 
    />
  </svg>
);

const FloatingLeaf = ({ delay = 0, x = 0, y = 0, scale = 1, rotate = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x, y, rotate, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      x: [x, x + 40, x - 20, x + 10],
      y: [y, y - 100, y - 200, y - 300],
      rotate: [rotate, rotate + 45, rotate - 45, rotate + 90],
      scale: [scale * 0.5, scale, scale, scale * 0.5],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay: delay,
      ease: "linear"
    }}
    className="absolute text-white/20 pointer-events-none"
  >
    <LeafIcon size={20} />
  </motion.div>
);

const LoginBackground = memo(() => (
  <>
    {/* Background Image with Overlay - Top Section */}
    <div className="absolute top-0 left-0 right-0 h-[60vh] z-0 overflow-hidden bg-[#064e3b]">
      <motion.img 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: [1, 1.05, 1] }}
        transition={{
          opacity: { duration: 1 },
          scale: { duration: 40, repeat: Infinity, ease: "linear" }
        }}
        src="https://upload.wikimedia.org/wikipedia/commons/2/28/Tea_picker_in_the_highland_region_of_Nuwara_Eliya.jpg"
        alt="Sri Lanka Tea Pluckers Top"
        className="absolute inset-0 w-full h-full object-cover object-[center_15%] opacity-90 will-change-transform"
        crossOrigin="anonymous"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80";
        }}
      />
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-green-950/20 via-transparent to-green-950 pointer-events-none"></div>
    </div>

    {/* Background Image with Overlay - Bottom Section */}
    <div className="absolute bottom-0 left-0 right-0 h-[50vh] z-0 overflow-hidden bg-[#064e3b]">
      <motion.img 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: [1, 1.05, 1] }}
        transition={{
          opacity: { duration: 1 },
          scale: { duration: 35, repeat: Infinity, ease: "linear", delay: 1 }
        }}
        src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Tea_Picker%2C_Sri_Lanka.jpg"
        alt="Sri Lanka Tea Pluckers Bottom"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-80 will-change-transform"
        crossOrigin="anonymous"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80";
        }}
      />
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-green-950/60 via-green-950/30 to-green-950 pointer-events-none"></div>
    </div>

    {/* Header / Logo Section */}
    <div className="relative z-10 flex flex-col items-center justify-center pt-10 pb-4 px-6 shrink-0 pointer-events-none">
      {/* Floating Particles Area */}
      <div className="absolute inset-0 z-0 overflow-visible opacity-40">
        <FloatingLeaf delay={0} x={-40} y={60} scale={1.2} rotate={10} />
        <FloatingLeaf delay={1} x={30} y={80} scale={0.8} rotate={-20} />
        <FloatingLeaf delay={0.5} x={50} y={40} scale={1.1} rotate={45} />
      </div>

      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative group"
      >
        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/40 shadow-2xl relative overflow-hidden">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white relative z-10 drop-shadow-lg">
              <path 
                d="M12 2C12 2 19 8 19 13C19 18 12 20 12 20C12 20 5 18 5 13C5 8 12 2 12 2Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                opacity="0.5"
                d="M12 2V20M12 7C12 7 17 9 17 13M12 10C12 10 7 12 7 15" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
              />
           </svg>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center mt-3"
      >
        <h1 className="text-3xl font-black text-white tracking-tighter drop-shadow-xl italic leading-none">
          Ceylon Tea Yard
        </h1>
        <p className="text-white/80 font-black tracking-[0.3em] text-[8px] uppercase mt-1">
          Investing in Nature
        </p>
      </motion.div>
    </div>
  </>
));

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      setReferralCode(refParam);
      setIsRegister(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (mobileNumber.length < 8) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    const cleanMobile = mobileNumber.trim();
    const email = `${cleanMobile}@primeshelf.local`;

    try {
      if (isRegister) {
        let referredByUid = null;
        if (referralCode && referralCode.trim()) {
          const cleanReferral = referralCode.trim();
          try {
            const refDoc = await getDoc(doc(db, 'referral_codes', cleanReferral));
            if (refDoc.exists()) {
              referredByUid = refDoc.data().uid;
            } else if (cleanReferral === '07123456') {
              // Special case: try to find the admin UID
              const adminQuery = query(collection(db, 'users'), where('mobileNumber', '==', '07123456'), limit(1));
              const adminSnap = await getDocs(adminQuery);
              if (!adminSnap.empty) {
                referredByUid = adminSnap.docs[0].id;
              }
            } else {
              setError("Invalid referral code.");
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user data in Firestore
        const now = serverTimestamp();
        const batch = writeBatch(db);
        
        batch.set(doc(db, 'users', user.uid), {
          uid: user.uid,
          mobileNumber: cleanMobile,
          role: cleanMobile === '07123456' ? 'admin' : 'user',
          balance: 100,
          createdAt: now
        });

        batch.set(doc(db, 'user_public', user.uid), {
          uid: user.uid,
          mobileNumber: cleanMobile,
          referredBy: referredByUid,
          totalRecharge: 0,
          createdAt: now
        });

        // Use alphanumeric referral code (substring of UID) instead of mobile
        const myReferralCode = user.uid.substring(0, 8);
        
        batch.set(doc(db, 'referral_codes', myReferralCode), {
          uid: user.uid,
          mobile: cleanMobile // keep mobile reference if needed
        });
        
        // Also keep mobile index for backward compatibility if needed, 
        // but the goal is to remove numbers from URL.
        batch.set(doc(db, 'referral_codes', cleanMobile), {
          uid: user.uid
        });

        await batch.commit();
      } else {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (signInErr: any) {
          // Auto-register admin if they don't exist yet
          if (cleanMobile === '07123456' && password === '12345678' && 
             (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential')) {
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const now = serverTimestamp();
            const batch = writeBatch(db);
            
            batch.set(doc(db, 'users', user.uid), {
              uid: user.uid,
              mobileNumber: cleanMobile,
              role: 'admin',
              balance: 100,
              createdAt: now
            });

            batch.set(doc(db, 'user_public', user.uid), {
              uid: user.uid,
              mobileNumber: cleanMobile,
              referredBy: null,
              totalRecharge: 0,
              createdAt: now
            });

            batch.set(doc(db, 'referral_codes', cleanMobile), {
              uid: user.uid
            });

            await batch.commit();
          } else {
            throw signInErr;
          }
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid mobile number or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This mobile number is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-[100dvh] max-w-md mx-auto overflow-hidden bg-green-950">
      <LoginBackground />

      {/* Login Card - Compacted to fit screen */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="relative z-10 w-full max-w-[92%] mx-auto bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_-20px_40px_rgba(0,0,0,0.2)] p-5 mt-auto mb-8 flex flex-col shrink-0"
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 shrink-0"></div>
        
        <div className="flex bg-gray-50 p-1 rounded-xl mb-4 shrink-0">
          <button 
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg font-bold text-xs transition-all duration-300 ${!isRegister ? 'bg-white shadow-sm text-green-700 scale-100' : 'text-gray-400 scale-95 opacity-60'}`}
          >
            <LogIn size={12} />
            Login
          </button>
          <button 
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg font-bold text-xs transition-all duration-300 ${isRegister ? 'bg-white shadow-sm text-green-700 scale-100' : 'text-gray-400 scale-95 opacity-60'}`}
          >
            <UserPlus size={12} />
            Register
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <h2 className="text-lg font-bold text-gray-900 mb-0.5">
            {isRegister ? 'Join Tea Yard' : 'Welcome back'}
          </h2>
          <p className="text-gray-500 mb-4 text-[11px] font-medium leading-tight">
            {isRegister ? 'Start earning from tea investments today.' : 'Sign in to access your dashboard.'}
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 text-red-600 p-2.5 rounded-xl text-[11px] font-bold mb-4 flex items-center gap-2 border border-red-100"
            >
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0">!</div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Phone</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone size={14} />
                </div>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50/80 border border-gray-100 focus:border-green-500/20 focus:bg-white rounded-xl outline-none transition-all text-gray-800 font-bold placeholder:text-gray-300 text-sm"
                  placeholder="07x xxx xxxx"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={14} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-10 py-2.5 bg-gray-50/80 border border-gray-100 focus:border-green-500/20 focus:bg-white rounded-xl outline-none transition-all text-gray-800 font-bold placeholder:text-gray-300 text-sm"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-green-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div 
              className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
              style={{ maxHeight: isRegister ? '200px' : '0px', opacity: isRegister ? 1 : 0 }}
            >
              <div className="space-y-3 pb-1">
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Confirm</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <CheckCircle2 size={14} />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50/80 border border-gray-100 focus:border-green-500/20 focus:bg-white rounded-xl outline-none transition-all text-gray-800 font-bold placeholder:text-gray-300 text-sm"
                      placeholder="Repeat password"
                      required={isRegister}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Referral Code</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <UserPlus size={14} />
                    </div>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50/80 border border-gray-100 focus:border-green-500/20 focus:bg-white rounded-xl outline-none transition-all text-gray-800 font-bold placeholder:text-gray-300 text-sm"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {rememberMe && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-[11px] font-bold text-gray-500">Remember</span>
                </label>
                <button type="button" className="text-[11px] font-bold text-green-600">Forgot?</button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-green-600 h-12 rounded-xl active:scale-95 transition-all shadow-lg shadow-green-200 mt-2 shrink-0"
            >
              <div className="relative flex items-center justify-center gap-2 text-white font-black text-sm uppercase tracking-widest">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isRegister ? 'Register' : 'Login'}
                    <ChevronRight size={16} />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-6 mb-4 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-green-700 hover:text-green-800 text-xs font-black tracking-tight flex items-center justify-center gap-1 mx-auto"
            >
              {isRegister ? 'ALREADY A MEMBER? SIGN IN' : 'NEW TO TEA YARD? REGISTER'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
