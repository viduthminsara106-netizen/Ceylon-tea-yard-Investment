import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, LineChart, Hexagon, Share2, Smile } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, getDoc, getDocs, collection, query, where, writeBatch, serverTimestamp, addDoc, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Layout() {
  const [userData, setUserData] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const processDailyIncomes = async (userId: string) => {
      // Avoid processing multiple times in the same session 
      const sessionKey = `income_processed_${userId}`;
      const lastProcessed = sessionStorage.getItem(sessionKey);
      const now = Date.now();
      
      // Allow checking every 10 minutes to be more responsive to new purchases
      if (lastProcessed && now - parseInt(lastProcessed) < 1000 * 60 * 10) {
        return;
      }

      try {
        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId), where('status', '==', 'active'));
        const snapshot = await getDocs(ordersQuery);
        sessionStorage.setItem(sessionKey, now.toString());
        
        if (snapshot.empty) return;

        let totalIncomeToAdd = 0;
        const batch = writeBatch(db);
        let hasUpdates = false;

        snapshot.forEach((orderDoc) => {
          const order = orderDoc.data();
          const orderId = orderDoc.id;

          // Robust date handling
          let lastPaidAt;
          if (order.lastPaidAt && order.lastPaidAt.seconds) { // Firestore Timestamp
            lastPaidAt = order.lastPaidAt.seconds * 1000;
          } else if (order.lastPaidAt) {
            lastPaidAt = new Date(order.lastPaidAt).getTime();
          } else if (order.activatedAt && order.activatedAt.seconds) {
            lastPaidAt = order.activatedAt.seconds * 1000;
          } else if (order.activatedAt) {
            lastPaidAt = new Date(order.activatedAt).getTime();
          } else if (order.createdAt && order.createdAt.seconds) {
            lastPaidAt = order.createdAt.seconds * 1000;
          } else if (order.createdAt) {
            lastPaidAt = new Date(order.createdAt).getTime();
          } else {
            return;
          }

          if (isNaN(lastPaidAt)) return;

          const msPassed = now - lastPaidAt;
          const daysPassed = Math.floor(msPassed / (24 * 60 * 60 * 1000));

          if (daysPassed > 0) {
            const daysToPay = Math.min(daysPassed, order.duration - (order.daysServed || 0));
            if (daysToPay > 0) {
              totalIncomeToAdd += daysToPay * order.dailyIncome;
              
              const newDaysServed = (order.daysServed || 0) + daysToPay;
              const newLastPaidAt = serverTimestamp();
              
              batch.update(doc(db, 'orders', orderId), {
                daysServed: newDaysServed,
                lastPaidAt: newLastPaidAt,
                status: newDaysServed >= order.duration ? 'completed' : 'active'
              });
              hasUpdates = true;
            }
          }
        });

        if (totalIncomeToAdd > 0) {
          const userDocRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const currentBalance = userSnap.data().balance || 0;
            batch.update(userDocRef, {
              balance: currentBalance + totalIncomeToAdd
            });

            // Log income transaction
            const incomeTxRef = doc(collection(db, 'transactions'));
            batch.set(incomeTxRef, {
              userId: userId,
              amount: totalIncomeToAdd,
              type: 'income',
              status: 'completed',
              description: 'Daily interest income from active plans',
              createdAt: serverTimestamp()
            });
            hasUpdates = true;
          }
        }

        if (hasUpdates) {
          await batch.commit();
        }
      } catch (error) {
        console.error("Error processing daily incomes:", error);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        processDailyIncomes(user.uid);
        
        const userRef = doc(db, 'users', user.uid);
        unsubscribeSnapshot = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.data());
          } else {
            setUserData({
              mobileNumber: user.email?.split('@')[0] || '',
              balance: 0
            });
          }
        }, (error: any) => {
          console.error("Layout Firestore Error:", error);
        });
      } else {
        setUserData(null);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const balance = userData?.balance || 0;
  const mobileNumber = userData?.mobileNumber || '';

  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/order', icon: LineChart, label: 'My' },
    { to: '/product', icon: Hexagon, label: 'Show' },
    { to: '/my-team', icon: Share2, label: 'Share' },
    { to: '/me', icon: Smile, label: 'Mine' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto relative shadow-xl overflow-hidden">
      {/* Top Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {/* Simple Leaf Icon for Tea Yard */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="#16a34a" strokeWidth="2" />
            <path d="M12 22V12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 12C12 12 16 12 16 8C16 4 12 4 12 4" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 12C12 12 8 12 8 16C8 20 12 20 12 20" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="font-bold text-green-700 text-lg tracking-tight">Ceylon Tea Yard</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500 font-medium">{mobileNumber}</span>
          <span className="text-sm font-bold text-green-600">Rs {balance}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-32 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="min-h-full"
          >
            <Outlet context={{ userData, balance, mobileNumber }} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - iOS Style */}
      <nav className="bg-white/80 backdrop-blur-2xl border-t border-gray-200/60 flex justify-around pt-2 pb-8 px-1 fixed bottom-0 w-full max-w-md z-50 transition-all">
        {navItems.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center min-w-[64px]',
                isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <motion.div 
                  className="mb-1 relative flex items-center justify-center p-1"
                  whileTap={{ scale: 0.85 }}
                >
                  <item.icon 
                    className={clsx(
                      "transition-colors duration-200",
                      isActive ? "text-green-600" : "text-gray-400"
                    )} 
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
                <span className={clsx(
                  "text-[10px] tracking-wide transition-all duration-200",
                  isActive ? "font-bold text-green-600 font-sans" : "font-medium text-gray-400 font-sans"
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
