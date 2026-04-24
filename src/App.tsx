import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Product from './pages/Product';
import Wallet from './pages/Wallet';
import Recharge from './pages/Recharge';
import Order from './pages/Order';
import Me from './pages/Me';
import Admin from './pages/Admin';
import TeamTask from './pages/TeamTask';
import MyTeam from './pages/MyTeam';
import ReferralLink from './pages/ReferralLink';
import LoadingSpinner from './components/LoadingSpinner';

import ProductDetail from './pages/ProductDetail';
import Payment from './pages/Payment';
import Checkout from './pages/Checkout';
import TransactionHistory from './pages/TransactionHistory';
import FAQ from './pages/FAQ';
import Redeem from './pages/Redeem';
import OfficialChannel from './pages/OfficialChannel';
import DataMigration from './pages/DataMigration';
import CheckIn from './pages/CheckIn';

import Maintenance from './pages/Maintenance';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const mSnap = await getDoc(doc(db, 'settings', 'maintenance'));
        if (mSnap.exists() && mSnap.data()?.enabled === true) {
          setMaintenanceMode(true);
        }
      } catch (e) {
        console.error("Maintenance check error:", e);
      } finally {
        setCheckingMaintenance(false);
      }
    };
    checkMaintenance();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Known admin emails or role check
        const adminEmails = ['07123456@primeshelf.local', 'viduthminsara106@gmail.com'];
        if (adminEmails.includes(currentUser.email || '')) {
          setIsAdmin(true);
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists() && userDoc.data()?.role === 'admin') {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch (e: any) {
            console.error(e);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || checkingMaintenance) {
    return <LoadingSpinner fullScreen />;
  }

  if (maintenanceMode && !isAdmin) {
    return <Maintenance />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" />} />
        <Route path="/maintenance" element={<Maintenance />} />
        
        {user ? (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/product" element={<Product />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/recharge" element={<Recharge />} />
            <Route path="/order" element={<Order />} />
            <Route path="/me" element={<Me />} />
            <Route path="/team-task" element={<TeamTask />} />
            <Route path="/my-team" element={<MyTeam />} />
            <Route path="/referral-link" element={<ReferralLink />} />
            <Route path="/transaction-history" element={<TransactionHistory />} />
            <Route path="/redeem" element={<Redeem />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/migrate" element={<DataMigration />} />
            <Route path="/official-channel" element={<OfficialChannel />} />
            <Route path="/check-in" element={<CheckIn />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/payment/:slug" element={<Payment />} />
            <Route path="/checkout/:slug" element={<Checkout />} />
            {isAdmin && <Route path="/admin" element={<Admin />} />}
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}
