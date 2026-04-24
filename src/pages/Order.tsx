import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp, orderBy } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { plans } from '../data/plans';
import { motion } from 'motion/react';

export default function Order() {
  const navigate = useNavigate();
  const { balance } = useOutletContext<{ balance: number }>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  
  // Real-time calculation state
  const [availableToCollect, setAvailableToCollect] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const ordersQuery = query(
          collection(db, 'orders'), 
          where('userId', '==', auth.currentUser.uid),
          orderBy('activatedAt', 'desc')
        );
        const snapshot = await getDocs(ordersQuery);
        const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Continuous timer for hourly income calculation
  useEffect(() => {
    if (orders.length === 0) {
      setAvailableToCollect(0);
      return;
    }

    const interval = setInterval(() => {
      let currentAvailable = 0;
      const now = Date.now();

      orders.forEach(order => {
        if (order.status !== 'active') return;

        const lastCollectedAt = order.lastCollectedAt?.toDate ? order.lastCollectedAt.toDate() : (order.lastCollectedAt ? new Date(order.lastCollectedAt) : (order.activatedAt?.toDate ? order.activatedAt.toDate() : new Date(order.activatedAt)));
        const lastTime = lastCollectedAt.getTime();
        const msDiff = Math.max(0, now - lastTime);
        const hoursDiff = msDiff / (1000 * 60 * 60);
        
        // Income strictly based on exact hours passed with fractions
        const orderCollectable = hoursDiff * (order.dailyIncome / 24);
        currentAvailable += orderCollectable;
      });

      setAvailableToCollect(currentAvailable);
    }, 1000); // Update every second for neat real-time effect

    return () => clearInterval(interval);
  }, [orders]);

  const handleCollect = async () => {
    if (!auth.currentUser || availableToCollect <= 0.01 || collecting) return;
    
    setCollecting(true);
    const batch = writeBatch(db);
    const now = new Date();
    let totalCollected = 0;

    try {
      orders.forEach(order => {
        if (order.status !== 'active') return;

        const lastCollectedAt = order.lastCollectedAt?.toDate ? order.lastCollectedAt.toDate() : (order.lastCollectedAt ? new Date(order.lastCollectedAt) : (order.activatedAt?.toDate ? order.activatedAt.toDate() : new Date(order.activatedAt)));
        const lastTime = lastCollectedAt.getTime();
        const msDiff = Math.max(0, Date.now() - lastTime);
        const hoursDiff = msDiff / (1000 * 60 * 60);
        const orderCollectable = hoursDiff * (order.dailyIncome / 24);

        if (orderCollectable > 0.001) {
          totalCollected += orderCollectable;
          batch.update(doc(db, 'orders', order.id), {
            lastCollectedAt: now,
            totalObtained: (order.totalObtained || 0) + orderCollectable
          });
        }
      });

      if (totalCollected > 0.001) {
        batch.update(doc(db, 'users', auth.currentUser.uid), {
          balance: balance + totalCollected
        });
        
        // Log transaction
        const newTxId = 'inc-' + auth.currentUser.uid + '-' + Date.now();
        const newTxRef = doc(db, 'transactions', newTxId);
        batch.set(newTxRef, {
          userId: auth.currentUser.uid,
          type: 'income',
          amount: totalCollected,
          description: 'Product Income Collection',
          createdAt: serverTimestamp(),
          status: 'completed'
        });

        await batch.commit();
        
        // Immediately visually update Local State
        setOrders(prev => prev.map(o => {
          if (o.status === 'active') {
             return { ...o, lastCollectedAt: now, totalObtained: (o.totalObtained || 0) + totalCollected };
          }
          return o;
        }));
        setAvailableToCollect(0);
        alert(`Successfully collected Rs ${totalCollected.toFixed(2)}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error collecting income.");
    } finally {
      setCollecting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Calculate historical total product income across all orders
  const totalProductIncome = orders.reduce((sum, order) => {
    const historical = order.totalObtained !== undefined ? order.totalObtained : ((order.daysServed || 0) * order.dailyIncome);
    return sum + historical;
  }, 0);

  // Determine dynamic background image based on latest order plan
  let bannerImageUrl = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"; // Default
  if (orders.length > 0) {
    // Robust search: handle potentially missing name or price variations
    const latestOrder = orders[0];
    const latestOrderPlan = plans.find(p => 
      (latestOrder.planName && p.name.toLowerCase() === latestOrder.planName.toLowerCase()) || 
      p.price === (latestOrder.price || latestOrder.amount)
    );
    if (latestOrderPlan) {
      bannerImageUrl = latestOrderPlan.image;
    }
  }

  return (
    <div className="bg-gray-50 min-h-full pb-20 font-sans">
      {/* Top Header Match iOS Tab bar concept */}
      <div className="bg-[#5ce186] py-3 text-center sticky top-0 z-20 shadow-md">
        <h1 className="text-gray-900 font-bold text-lg">My Investments</h1>
      </div>

      {/* Banner / Background Section */}
      <div className="relative w-full h-[300px] overflow-hidden bg-green-950">
        {/* Hardware-Accelerated Ken Burns Animation */}
        <motion.img 
          key={bannerImageUrl}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ 
            scale: 1.15,
            opacity: 0.6
          }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: 40, repeat: Infinity, repeatType: "reverse", ease: "linear" }
          }}
          src={bannerImageUrl} 
          alt="Investment Banner" 
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80";
          }}
        />
        {/* Subtle overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none"></div>

        {/* Floating Widgets inside the Banner area */}
        <div className="absolute inset-0 pt-8 px-4 z-10 flex flex-col items-center">
          
          <div className="flex gap-4 w-full w-full justify-center max-w-sm">
            {/* Number of Products Box */}
            <motion.div 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 flex-1 text-center"
            >
              <p className="text-4xl font-black text-[#16a34a] drop-shadow-sm mb-1">{orders.length}</p>
              <p className="text-[12px] text-gray-500 font-bold leading-tight px-1 uppercase tracking-wider">Number of<br/>Products</p>
            </motion.div>
            
            {/* Product Income Box */}
            <motion.div 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 flex-1 text-center"
            >
              <p className="text-3xl font-black text-[#16a34a] drop-shadow-sm mb-1 mt-1">Rs {totalProductIncome.toFixed(0)}</p>
              <p className="text-[12px] text-gray-500 font-bold leading-tight px-1 mt-1 uppercase tracking-wider">Product<br/>income</p>
            </motion.div>
          </div>

          {/* Collect Button */}
          <motion.div 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 w-full max-w-sm px-1"
          >
            <button 
              onClick={handleCollect}
              disabled={collecting || availableToCollect <= 0.04}
              className="w-full bg-[#5ce186] active:scale-[0.98] transition-all rounded-2xl p-4 flex items-center justify-between shadow-2xl ring-4 ring-[#5ce186]/30 border border-white/20"
            >
              <span className="text-gray-900 font-black text-xl px-2 text-left">
                Collect Rs {availableToCollect.toFixed(1)}
              </span>
              <div className="bg-gray-900/10 rounded-full p-2.5">
                <Plus size={24} className="text-gray-900" />
              </div>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Product Showcase Section */}
      <div className="px-4 mt-6 mx-auto max-w-sm pb-10">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden min-h-[220px]">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-lg">Product Showcase</h2>
          </div>
          
          <div className="p-4">
            {orders.length === 0 ? (
              <div className="h-[120px] flex items-center justify-center">
                <p className="text-gray-500 font-medium tracking-wide">No Data</p>
              </div>
            ) : (
              <motion.div 
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {orders.map(order => {
                  const activatedDate = new Date(order.activatedAt);
                  const statusColor = order.status === 'active' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50';
                  const planData = plans.find(p => 
                    p.name.toLowerCase() === order.planName.toLowerCase() || 
                    p.price === (order.price || order.amount)
                  );
                  
                  return (
                    <motion.div 
                      key={order.id} 
                      variants={{
                        hidden: { x: -20, opacity: 0 },
                        visible: { 
                          x: 0, 
                          opacity: 1,
                          transition: { duration: 0.4, ease: "easeOut" }
                        }
                      }}
                      className="p-3 border rounded-xl border-gray-100 hover:shadow-md transition-shadow flex gap-3 bg-white will-change-transform"
                    >
                       <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                         <img 
                          src={planData?.image || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100&q=80"} 
                          alt={order.planName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100&q=80";
                          }}
                         />
                       </div>
                       <div className="flex-1">
                         <div className="flex justify-between items-center mb-1">
                           <span className="font-bold text-gray-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                             {order.planName}
                           </span>
                           <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${statusColor}`}>
                             {order.status}
                           </span>
                         </div>
                         <div className="flex justify-between text-[11px] text-gray-500">
                           <span>Invested:</span>
                           <span className="font-bold text-gray-800 text-[11px]">Rs {order.price}</span>
                         </div>
                         <div className="flex justify-between text-[11px] text-gray-500">
                           <span>Income:</span>
                           <span className="font-bold text-green-600 text-[11px]">Rs {order.dailyIncome}/day</span>
                         </div>
                         <div className="flex justify-between text-[10px] text-gray-400 mt-1 border-t pt-1">
                           <span>{activatedDate.toLocaleDateString()}</span>
                           <span className="font-mono text-[9px] opacity-60">ID:{order.id.slice(0, 8)}</span>
                         </div>
                       </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
