import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { motion } from 'motion/react';
import LoadingSpinner from '../components/LoadingSpinner';
import { Copy, Check, Share2 } from 'lucide-react';

export default function MyTeam() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'list'>('stats');
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [referralCode, setReferralCode] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!auth.currentUser) return;
      try {
        const currentUid = auth.currentUser.uid;
        
        // Use alphanumeric substring of UID to remove numbers from URL
        setReferralCode(currentUid.substring(0, 8));

        // Fetch all user_public data to build hierarchy in memory from Firestore
        const snapshot = await getDocs(collection(db, 'user_public'));
        const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        // Level 1: Users referred by me
        const l1 = allUsers.filter(u => u.referredBy === currentUid);
        const l1Uids = l1.map(u => u.id);
        
        // Level 2: Users referred by Level 1
        const l2 = allUsers.filter(u => l1Uids.includes(u.referredBy));
        const l2Uids = l2.map(u => u.id);
        
        // Level 3: Users referred by Level 2
        const l3 = allUsers.filter(u => l2Uids.includes(u.referredBy));
        const l3Uids = l3.map(u => u.id);
        
        // Level 4: Users referred by Level 3
        const l4 = allUsers.filter(u => l3Uids.includes(u.referredBy));
        
        setUsers([...l1, ...l2, ...l3, ...l4]);
        
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  const currentUid = auth.currentUser?.uid;

  const level1 = users.filter(u => u.referredBy === currentUid);
  const level1Uids = level1.map(u => u.id);

  const level2 = users.filter(u => level1Uids.includes(u.referredBy));
  const level2Uids = level2.map(u => u.id);

  const level3 = users.filter(u => level2Uids.includes(u.referredBy));
  const level3Uids = level3.map(u => u.id);

  const level4 = users.filter(u => level3Uids.includes(u.referredBy));

  const getStats = (levelUsers: any[], commissionRate: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUsers = levelUsers.filter(u => {
      if (!u.createdAt) return false;
      const date = new Date(u.createdAt);
      return date >= today;
    });

    const totalRecharge = levelUsers.reduce((sum, u) => sum + (Number(u.totalRecharge) || 0), 0);
    const todayRecharge = todayUsers.reduce((sum, u) => sum + (Number(u.totalRecharge) || 0), 0);

    const totalRechargedUsers = levelUsers.filter(u => (Number(u.totalRecharge) || 0) > 0).length;
    const todayRechargedUsers = todayUsers.filter(u => (Number(u.totalRecharge) || 0) > 0).length;

    return {
      total: {
        referrals: `${totalRechargedUsers}/${levelUsers.length}`,
        recharge: totalRecharge,
        commission: totalRecharge * commissionRate
      },
      today: {
        referrals: `${todayRechargedUsers}/${todayUsers.length}`,
        recharge: todayRecharge,
        commission: todayRecharge * commissionRate
      }
    };
  };

  const stats1 = getStats(level1, 0.30);
  const stats2 = getStats(level2, 0.03);
  const stats3 = getStats(level3, 0.02);
  const stats4 = getStats(level4, 0.01);

  return (
    <div className="p-4 bg-gray-50 min-h-full pb-20">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-600 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-800 flex-1 text-center mr-10">My Team</h2>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-white rounded-xl shadow-sm border p-1">
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'stats' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-green-50'}`}
        >
          My Statistics
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'list' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-green-50'}`}
        >
          Referral List
        </button>
      </div>

      {activeTab === 'stats' ? (
        <>
          {/* Invitation Link Section */}
          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white rounded-[2.5rem] p-6 mb-6 shadow-md border border-green-50"
          >
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-green-50 rounded-2xl">
                   <Share2 size={20} className="text-green-600" />
                </div>
                <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">Invite Partners</h3>
             </div>
             
             <div className="relative group">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 pr-12 overflow-hidden flex items-center">
                   <p className="text-xs font-bold text-gray-500 truncate w-full">
                      {referralCode ? `${window.location.origin}/login?ref=${referralCode}` : 'Loading...'}
                   </p>
                </div>
                <button 
                  onClick={() => {
                    const link = `${window.location.origin}/login?ref=${referralCode}`;
                    navigator.clipboard.writeText(link);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-green-500 text-white rounded-xl shadow-lg shadow-green-100 hover:bg-green-600 transition-all active:scale-90"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
             </div>
             {copied && (
               <motion.p 
                 initial={{ opacity: 0, y: 5 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 className="text-[10px] font-black text-green-600 mt-2 text-center uppercase tracking-widest"
               >
                 Copied to clipboard!
               </motion.p>
             )}
          </motion.div>

          {/* Referral Info */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass bg-green-50/80 p-5 rounded-3xl mb-6 text-sm text-green-800 leading-relaxed"
          >
            <div className="flex items-center gap-2 mb-2 font-black uppercase tracking-wider text-xs">
                <div className="w-1.5 h-4 bg-green-600 rounded-full"></div>
                Commission Structure
            </div>
            You obtain 30% of Level 1's recharge amount, 3% of Level 2's, 2% of Level 3's, and 1% of Level 4's. Rewards are credited instantly upon successful payment.
          </motion.div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <ReferralTable level="1" percentage="30%" stats={stats1} />
              <ReferralTable level="2" percentage="3%" stats={stats2} />
              <ReferralTable level="3" percentage="2%" stats={stats3} />
              <ReferralTable level="4" percentage="1%" stats={stats4} />
            </motion.div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar py-1">
             {[1, 2, 3, 4].map(lvl => (
               <button
                 key={lvl}
                 onClick={() => setActiveLevel(lvl)}
                 className={`px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeLevel === lvl ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}
               >
                 Level {lvl}
               </button>
             ))}
          </div>

          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             key={activeLevel}
             className="glass rounded-3xl overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest text-gray-500">
                {activeLevel === 1 ? 'Direct Referrals' : activeLevel === 2 ? 'Friends of Friends' : activeLevel === 3 ? 'Deep Network' : 'Extended Network'}
              </h3>
              <span className="text-xs font-black text-green-600 bg-white px-3 py-1 rounded-full border border-green-50">
                {(activeLevel === 1 ? level1 : activeLevel === 2 ? level2 : activeLevel === 3 ? level3 : level4).length} Total
              </span>
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : (activeLevel === 1 ? level1 : activeLevel === 2 ? level2 : activeLevel === 3 ? level3 : level4).length === 0 ? (
              <div className="p-16 text-center text-gray-400 italic font-bold text-sm bg-white">
                No network connections found in Level {activeLevel}
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 bg-white">
                {(activeLevel === 1 ? level1 : activeLevel === 2 ? level2 : activeLevel === 3 ? level3 : level4).map(u => (
                  <li key={u.id} className="p-5 flex justify-between items-center hover:bg-green-50/30 transition-colors">
                    <div>
                      <p className="font-black text-gray-800 text-lg tracking-tight">{u.mobileNumber || u.mobile || 'Unknown'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Active Partner</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-green-50 px-3 py-1 rounded-2xl border border-green-100 mb-1">
                          <p className="text-sm font-black text-green-700">Rs {u.totalRecharge || 0}</p>
                      </div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black pr-1">INV. TOTAL</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ReferralTable({ level, percentage, stats }: { level: string, percentage: string, stats: any }) {
  return (
    <motion.div 
        whileHover={{ scale: 1.01 }}
        className="glass rounded-[2.5rem] overflow-hidden group shadow-lg"
    >
      <div className="bg-green-600 p-6 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
            <span className="block text-[10px] font-black text-green-100 uppercase tracking-[0.2em] mb-1">PARTNER TIERS</span>
            <span className="font-black text-2xl text-white tracking-tight italic">Level {level}</span>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 text-white font-black text-sm relative z-10 transition-transform group-hover:scale-110">
            {percentage} PROFIT &gt;
        </div>
      </div>
      <div className="bg-white p-2">
        <table className="w-full text-center text-[13px] border-collapse">
            <thead className="block mb-2">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] bg-gray-50/50 rounded-2xl flex items-center justify-between px-4 py-3">
                <th className="flex-1 text-left border-none">Referral Pool</th>
                <th className="flex-1 border-none">Investment</th>
                <th className="flex-1 text-right border-none">Commission</th>
              </tr>
            </thead>
            <tbody className="space-y-2 block px-2 pb-2">
                <tr className="flex items-center justify-between p-4 bg-gray-50/30 rounded-3xl border border-transparent hover:border-green-100 hover:bg-green-50/20 transition-all">
                    <td className="flex-1 text-left font-black text-gray-800">{stats.total.referrals} <span className="text-[10px] font-bold text-gray-400 block -mt-1 uppercase tracking-widest">Total</span></td>
                    <td className="flex-1 text-green-600 font-black">Rs{stats.total.recharge} <span className="text-[10px] font-bold text-gray-400 block -mt-1 uppercase tracking-widest">Recharge</span></td>
                    <td className="flex-1 text-right font-black text-green-700">Rs{stats.total.commission.toFixed(0)} <span className="text-[10px] font-bold text-green-600/50 block -mt-1 uppercase tracking-widest">Profit</span></td>
                </tr>
                <tr className="flex items-center justify-between p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <td className="flex-1 text-left font-black text-gray-800">{stats.today.referrals} <span className="text-[10px] font-bold text-gray-400 block -mt-1 uppercase tracking-widest font-black">Today</span></td>
                    <td className="flex-1 text-green-600 font-black">Rs{stats.today.recharge} <span className="text-[10px] font-bold text-gray-400 block -mt-1 uppercase tracking-widest font-black">Today</span></td>
                    <td className="flex-1 text-right font-black text-green-700">Rs{stats.today.commission.toFixed(0)} <span className="text-[10px] font-bold text-green-600/50 block -mt-1 uppercase tracking-widest font-black">Profit</span></td>
                </tr>
            </tbody>
        </table>
      </div>
    </motion.div>
  );
}
