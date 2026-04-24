import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Users, CheckSquare, Gift, HelpCircle, Send, FileText, Link as LinkIcon, LogOut, Shield, ChevronRight } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Me() {
  const navigate = useNavigate();
  const { balance, mobileNumber } = useOutletContext<{ balance: number; mobileNumber: string }>();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth.currentUser) {
        if (auth.currentUser.email === '07123456@primeshelf.local' || auth.currentUser.email === 'viduthminsara106@gmail.com') {
          setIsAdmin(true);
          return;
        }
        
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists() && userDoc.data()?.role === 'admin') {
            setIsAdmin(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    checkAdmin();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const menuItems = [
    { icon: Users, label: 'My Team', action: () => navigate('/my-team') },
    { icon: CheckSquare, label: 'Team Task', action: () => navigate('/team-task') },
    { icon: Gift, label: 'Redeem', action: () => navigate('/redeem') },
    { icon: HelpCircle, label: 'FAQ', action: () => navigate('/faq') },
    { icon: Send, label: 'Official Channel', action: () => navigate('/official-channel') },
    { icon: FileText, label: 'Payment Record', action: () => navigate('/transaction-history') },
    { icon: LinkIcon, label: 'Referral Link', action: () => navigate('/referral-link') },
  ];

  if (isAdmin) {
    menuItems.unshift({ icon: Shield, label: 'Admin Panel', action: () => navigate('/admin') });
  }

  return (
    <div className="bg-gray-50 min-h-full pb-28">
      {/* Banner Section with iOS Blur Header Effect */}
      <div className="relative overflow-hidden h-64">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80" 
          alt="Ceylon Tea Yard" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-green-950/40 to-transparent flex flex-col justify-end p-8 pb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl border border-white/40 flex items-center justify-center shadow-xl">
                <Users size={32} className="text-white" />
            </div>
            <div>
                <h2 className="text-white text-3xl font-black italic tracking-tight">+94 {mobileNumber}</h2>
                <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 inline-block mt-1">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Premium Partner</span>
                </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Balance Cards Overlapping Banner - iOS Style Glass */}
      <div className="px-6 -mt-8 relative z-10 space-y-4">
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-[2rem] p-6 shadow-2xl flex flex-col gap-6"
        >
          <div className="flex justify-between items-center text-center">
            <div className="flex-1">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Portfolio Balance</p>
              <p className="text-green-700 text-2xl font-black italic">Rs {balance}</p>
            </div>
            <div className="w-px h-10 bg-gray-100"></div>
            <div className="flex-1">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Net Earnings</p>
              <p className="text-green-700 text-2xl font-black italic">Rs 0</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
                onClick={() => navigate('/wallet')} 
                className="flex-1 bg-white border border-gray-100 text-red-500 font-black py-4 rounded-2xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              Withdraw
            </button>
            <button 
                onClick={() => navigate('/recharge')} 
                className="flex-1 bg-green-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              Recharge
            </button>
          </div>
        </motion.div>
      </div>

      <div className="px-6 mt-8">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-2">Personal Management</h3>
        <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8"
        >
          {menuItems.map((item, index) => (
            <div 
              key={item.label}
              onClick={item.action}
              className={`flex items-center justify-between p-5 hover:bg-green-50/50 cursor-pointer active:scale-98 transition-all group ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                    <item.icon size={20} />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-green-800 transition-colors">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-green-400 transition-all group-hover:translate-x-1" />
            </div>
          ))}
        </motion.div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-5 text-red-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
