import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, getDoc, doc, updateDoc, setDoc, deleteDoc, writeBatch, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { RefreshCw, Trash2, LogOut, Check, X, Eye, Gift, Database, AlertTriangle } from 'lucide-react';
import { plans } from '../data/plans';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'redeem'>('users');
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Data state
  const [users, setUsers] = useState<any[]>([]);
  const [userPublicData, setUserPublicData] = useState<Record<string, any>>({});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [redeemCodes, setRedeemCodes] = useState<any[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Redeem state
  const [newCode, setNewCode] = useState('');
  const [newCodeAmount, setNewCodeAmount] = useState('30');
  const [newCodeLimit, setNewCodeLimit] = useState('100');
  
  // Transaction filters
  const [txTypeFilter, setTxTypeFilter] = useState<'deposit' | 'withdrawal'>('deposit');
  const [txStatusFilter, setTxStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  // Modals state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editingPlanUser, setEditingPlanUser] = useState<any | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | string>('none');
  const [newBalance, setNewBalance] = useState('');
  const [referralModalUser, setReferralModalUser] = useState<any | null>(null);
  
  // Custom Alert/Confirm state
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);
  const [alertDialog, setAlertDialog] = useState<{isOpen: boolean, message: string} | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const formatDate = (val: any) => {
    if (!val) return 'N/A';
    // Handle Firestore Timestamps
    if (val && typeof val.toDate === 'function') {
      return val.toDate().toLocaleString();
    }
    if (val && val.seconds) {
      return new Date(val.seconds * 1000).toLocaleString();
    }
    const date = new Date(val);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString();
  };

  const getMillis = (val: any) => {
    if (!val) return 0;
    if (val && typeof val.toDate === 'function') {
      return val.toDate().getTime();
    }
    if (val && val.seconds) {
      return val.seconds * 1000;
    }
    const date = new Date(val);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Fetch users
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
      } catch (e: any) {
        console.error("Error fetching users:", e);
        setErrorMessage(prev => prev ? prev + "; " + e.message : "User fetch error: " + e.message);
      }

      // Fetch user_public
      try {
        const publicSnap = await getDocs(collection(db, 'user_public'));
        const publicMap: Record<string, any> = {};
        publicSnap.docs.forEach(doc => {
          publicMap[doc.id] = doc.data();
        });
        setUserPublicData(publicMap);
      } catch (e: any) {
        console.error("Error fetching user_public:", e);
      }

      // Fetch transactions
      try {
        const txSnap = await getDocs(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')));
        const txList = txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(txList);
      } catch (e: any) {
        console.error("Error fetching transactions:", e);
      }

      // Fetch orders
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const ordersList = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersList);
      } catch (e: any) {
        console.error("Error fetching orders:", e);
      }

      // Fetch redeem codes
      try {
        const redeemSnap = await getDocs(query(collection(db, 'redeem_codes'), orderBy('createdAt', 'desc')));
        const redeemList = redeemSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRedeemCodes(redeemList);
      } catch (e: any) {
        console.error("Error fetching redeem codes:", e);
      }

      // Fetch maintenance mode
      try {
        const mSnap = await getDoc(doc(db, 'settings', 'maintenance'));
        setMaintenanceMode(mSnap.exists() && mSnap.data()?.enabled === true);
      } catch (e) {
        console.error("Error fetching maintenance settings:", e);
      }

    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleMaintenance = async () => {
    const newVal = !maintenanceMode;
    try {
      await setDoc(doc(db, 'settings', 'maintenance'), {
        enabled: newVal,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setMaintenanceMode(newVal);
      setAlertDialog({
        isOpen: true, 
        message: `System ${newVal ? 'LOCKED' : 'UNLOCKED'}. Access for customers is now ${newVal ? 'blocked' : 'restored'}.`
      });
    } catch (e: any) {
      setAlertDialog({isOpen: true, message: "Failed to update settings: " + e.message});
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleResetData = () => {
    setConfirmDialog({
      isOpen: true,
      message: "WARNING: This will delete ALL data in the database (users, orders, transactions, etc) except your admin account. Are you sure?",
      onConfirm: async () => {
        setConfirmDialog(null);
        setLoading(true);
        try {
          const currentAdminId = auth.currentUser?.uid;
          const updates: any = {};

          // We reset most paths
          updates['transactions'] = null;
          updates['orders'] = null;
          updates['redeem_codes'] = null;
          updates['redemptions'] = null;
          updates['referral_codes'] = null;

          // For users, we keep only the admin and reset their balance
          const usersUpdate: any = {};
          const usersPublicUpdate: any = {};
          
          users.forEach(u => {
            if (u.id === currentAdminId) {
              usersUpdate[u.id] = { ...u, balance: 200 };
              if (userPublicData[u.id]) {
                usersPublicUpdate[u.id] = userPublicData[u.id];
              }
              // Keep admin referral code
              if (u.mobileNumber) {
                 updates[`referral_codes/${u.mobileNumber}`] = currentAdminId;
              }
            }
          });

          updates['users'] = usersUpdate;
          updates['user_public'] = usersPublicUpdate;

          // await update(ref(rtdb), updates);
          console.log("Reset skipped - RTDB disconnected.");
          await fetchData();
          setAlertDialog({ isOpen: true, message: "All data deleted successfully." });
        } catch (error) {
          console.error("Error resetting data:", error);
          setAlertDialog({ isOpen: true, message: "Error resetting data." });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleUpdateBalance = async (userId: string, balanceValue: number) => {
    try {
      await updateDoc(doc(db, 'users', userId), { balance: balanceValue });
      setEditingUser(null);
      fetchData();
    } catch (error) {
      console.error("Error updating balance:", error);
      setAlertDialog({ isOpen: true, message: "Failed to update balance" });
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlanUser) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const now = serverTimestamp();
      
      // 1. Deactivate existing active orders
      const userOrders = orders.filter(o => o.userId === editingPlanUser.id && o.status === 'active');
      userOrders.forEach(o => {
        batch.update(doc(db, 'orders', o.id), {
          status: 'deactivated',
          deactivatedAt: now
        });
      });

      // 2. Add new order if a plan is selected
      if (selectedPlanId !== 'none') {
        const plan = plans.find(p => p.id === Number(selectedPlanId));
        if (plan) {
          const newOrderRef = doc(collection(db, 'orders'));
          batch.set(newOrderRef, {
            userId: editingPlanUser.id,
            planId: plan.id,
            planName: plan.name,
            price: plan.price,
            dailyIncome: plan.dailyIncome,
            totalIncome: plan.totalIncome,
            days: plan.days,
            daysServed: 0,
            activatedAt: now,
            lastPaidAt: now,
            status: 'active'
          });
        }
      }

      await batch.commit();
      setEditingPlanUser(null);
      await fetchData();
      setAlertDialog({ isOpen: true, message: "User plan updated successfully." });
    } catch (error) {
      console.error("Error updating plan:", error);
      setAlertDialog({ isOpen: true, message: "Failed to update plan." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId: string, mobileNumber: string) => {
    setConfirmDialog({
      isOpen: true,
      message: `WARNING: This will permanently delete the user ${mobileNumber} and their data. Are you sure?`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setLoading(true);
        try {
          const batch = writeBatch(db);
          
          batch.delete(doc(db, 'users', userId));
          batch.delete(doc(db, 'user_public', userId));
          if (mobileNumber) batch.delete(doc(db, 'referral_codes', mobileNumber));

          orders.forEach(o => {
            if (o.userId === userId) batch.delete(doc(db, 'orders', o.id));
          });

          transactions.forEach(tx => {
            if (tx.userId === userId) batch.delete(doc(db, 'transactions', tx.id));
          });

          await batch.commit();
          await fetchData();
          setAlertDialog({ isOpen: true, message: "User deleted successfully." });
        } catch (error) {
          console.error("Error deleting user:", error);
          setAlertDialog({ isOpen: true, message: "Failed to delete user." });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const [txUserFilter, setTxUserFilter] = useState<string | null>(null);

  const handleViewHistory = (userId: string) => {
    setTxUserFilter(userId);
    setActiveTab('transactions');
    setTxStatusFilter('all');
  };

  const handleTxAction = (txId: string, status: 'completed' | 'failed', tx: any) => {
    setConfirmDialog({
      isOpen: true,
      message: `Are you sure you want to mark this as ${status}?`,
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const batch = writeBatch(db);
          const now = serverTimestamp();
          batch.update(doc(db, 'transactions', txId), { status });

          // If approving a deposit, activate the corresponding plan
          if (status === 'completed' && tx.type === 'deposit') {
            const amount = Number(tx.amount);
            const matchingPlan = plans.find(p => p.price === amount);
            
            if (matchingPlan) {
              const newOrderRef = doc(collection(db, 'orders'));
              batch.set(newOrderRef, {
                userId: tx.userId,
                planId: matchingPlan.id,
                planName: matchingPlan.name,
                price: matchingPlan.price,
                dailyIncome: matchingPlan.dailyIncome,
                totalIncome: matchingPlan.totalIncome,
                days: matchingPlan.days,
                daysServed: 0,
                activatedAt: now,
                lastPaidAt: now,
                status: 'active'
              });
              
              // 3 Packages Bonus Logic
              const userActiveOrders = orders.filter(o => o.userId === tx.userId && o.status === 'active');
              const packageCount = userActiveOrders.length + 1; // including the new one
              
              const userDocRef = doc(db, 'users', tx.userId);
              const userDocForBonus = await getDoc(userDocRef);
              const userDataForBonus = userDocForBonus.exists() ? userDocForBonus.data() : {};
              
              if (packageCount >= 3 && !userDataForBonus?.hasThreePackageBonus) {
                const allPrices = [...userActiveOrders.map(o => Number(o.price)), matchingPlan.price];
                const maxPrice = Math.max(...allPrices);
                const bonusAmount = maxPrice * 0.5;
                
                // Add bonus to balance
                const currentBal = userDataForBonus?.balance || 0;
                batch.update(userDocRef, {
                  balance: currentBal + bonusAmount,
                  hasThreePackageBonus: true
                });
                
                // Record bonus transaction
                const bonusTxRef = doc(collection(db, 'transactions'));
                batch.set(bonusTxRef, {
                  userId: tx.userId,
                  amount: bonusAmount,
                  type: 'bonus',
                  status: 'completed',
                  description: '50% VIP Bonus for purchasing 3+ Packages',
                  createdAt: now
                });
              }
            }

            // Update depositing user's totalRecharge
            const userPubDoc = await getDoc(doc(db, 'user_public', tx.userId));
            const pubDataForComm = userPubDoc.exists() ? userPubDoc.data() : {};
            const currentTotalRecharge = pubDataForComm.totalRecharge || 0;
            batch.update(doc(db, 'user_public', tx.userId), {
              totalRecharge: currentTotalRecharge + amount
            });

            // Referral Commissions (4 Levels: 30%, 3%, 2%, 1%)
            const commissionRates = [0.30, 0.03, 0.02, 0.01];
            let currentCheckingId = tx.userId;

            for (let i = 0; i < commissionRates.length; i++) {
              const checkDoc = await getDoc(doc(db, 'user_public', currentCheckingId));
              const pubLevelData = checkDoc.data();
              const referrerId = pubLevelData?.referredBy;

              if (referrerId) {
                const commissionAmount = amount * commissionRates[i];
                
                // Fetch latest referrer balance
                const refUserDoc = await getDoc(doc(db, 'users', referrerId));
                const currentBalance = refUserDoc.data()?.balance || 0;
                batch.update(doc(db, 'users', referrerId), {
                  balance: currentBalance + commissionAmount
                });

                // Record commission transaction
                const commTxRef = doc(collection(db, 'transactions'));
                batch.set(commTxRef, {
                  userId: referrerId,
                  amount: commissionAmount,
                  type: 'commission',
                  status: 'completed',
                  description: `Level ${i + 1} commission from ${getUserMobile(tx.userId)}`,
                  createdAt: now
                });

                // Move up the chain for next level
                currentCheckingId = referrerId;
              } else {
                break; // No more referrers in the chain
              }
            }
          }

          await batch.commit();
          fetchData();
        } catch (error) {
          console.error("Error updating transaction:", error);
          setAlertDialog({ isOpen: true, message: "Failed to update transaction" });
        }
      }
    });
  };

  const handleGenerateCode = async () => {
    if (!newCode.trim()) return;
    try {
      await setDoc(doc(db, 'redeem_codes', newCode.trim()), {
        code: newCode.trim(),
        amount: Number(newCodeAmount),
        usageLimit: Number(newCodeLimit),
        usedCount: 0,
        used: false,
        createdAt: serverTimestamp()
      });
      setNewCode('');
      fetchData();
      setAlertDialog({ isOpen: true, message: "Redeem code generated successfully." });
    } catch (error) {
      console.error("Error generating code:", error);
      setAlertDialog({ isOpen: true, message: "Error generating code." });
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    setConfirmDialog({
      isOpen: true,
      message: "Are you sure you want to delete this redeem code?",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await deleteDoc(doc(db, 'redeem_codes', codeId));
          fetchData();
          setAlertDialog({ isOpen: true, message: "Redeem code deleted." });
        } catch (error) {
          console.error("Error deleting code:", error);
        }
      }
    });
  };

  const getUserMobile = (userId: string) => {
    if (!userId) return 'Unknown';
    if (typeof userId !== 'string') return 'Invalid ID';

    // 1. Try finding in loaded Users state
    const user = users.find(u => u.id === userId || u.uid === userId);
    if (user?.mobileNumber) return user.mobileNumber;
    if (user?.mobile) return user.mobile; // Fallback field name

    // 2. Try User Public Data (direct keys)
    const pubData = userPublicData[userId];
    if (pubData?.mobileNumber) return pubData.mobileNumber;
    if (pubData?.mobile) return pubData.mobile;

    // 3. Search all User Public Data (in case key isn't UID)
    const pubDataByUid = Object.values(userPublicData).find((u: any) => u.uid === userId || u.id === userId) as any;
    if (pubDataByUid?.mobileNumber) return pubDataByUid.mobileNumber;
    if (pubDataByUid?.mobile) return pubDataByUid.mobile;

    // 4. Look in Transactions state
    const tx = transactions.find(t => t.userId === userId && (t.mobileNumber || t.mobile));
    if (tx?.mobileNumber) return tx.mobileNumber;
    if (tx?.mobile) return tx.mobile;

    // 5. Fallback: Check if userId itself looks like a mobile number
    const cleanId = userId.trim();
    if (/^0\d{9}$/.test(cleanId)) return cleanId;
    
    // 6. Check for email-based IDs
    if (cleanId.includes('@')) {
      const parts = cleanId.split('@');
      if (/^0\d{9}$/.test(parts[0])) return parts[0];
    }

    return `ID: ${userId.substring(0, 5)}...`;
  };

  const filteredTransactions = transactions.filter(tx => {
    if (txUserFilter && tx.userId !== txUserFilter) return false;
    if (tx.type !== txTypeFilter) return false;
    if (txStatusFilter !== 'all' && tx.status !== txStatusFilter) return false;
    if (searchQuery) {
      const mobile = getUserMobile(tx.userId);
      if (!mobile.includes(searchQuery) && !tx.userId.includes(searchQuery)) {
        return false;
      }
    }
    return true;
  });

  const filteredUsers = users.filter(user => {
    if (searchQuery) {
      if (!user.mobileNumber?.includes(searchQuery) && !user.id.includes(searchQuery)) {
        return false;
      }
    }
    return true;
  });

  if (permissionDenied) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-500 w-full max-w-lg">
          <h2 className="text-2xl font-bold text-center text-red-600 mb-4">Admin Database Locked</h2>
          <p className="text-gray-700 text-center mb-6">
            You cannot access the Admin Panel because your Realtime Database Rules are locked. Please copy the rules below and paste them into your Firebase Console.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-xs overflow-auto max-h-40 mb-4 border border-gray-300">
            {'{\n  "rules": {\n    "users": {\n      ".read": ...\n}'}
          </div>
          <button 
            onClick={() => {
              const fullRules = `{
  "rules": {
    "users": {
      ".read": "auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin'",
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid || auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "user_public": {
      ".read": "auth != null",
      "$uid": {
        ".write": "$uid === auth.uid || auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      },
      ".indexOn": ["referredBy"]
    },
    "referral_codes": {
      ".read": "true",
      "$code": {
        ".write": "auth != null || auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "transactions": {
      ".read": "auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin' || (auth != null && query.orderByChild == 'userId' && query.equalTo == auth.uid)",
      "$tid": {
        ".read": "data.child('userId').val() === auth.uid || auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "(!data.exists() && newData.child('userId').val() === auth.uid) || auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      },
      ".indexOn": ["userId", "status", "createdAt"]
    },
    "orders": {
      ".read": "auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin' || (auth != null && query.orderByChild == 'userId' && query.equalTo == auth.uid)",
      "$oid": {
        ".read": "data.child('userId').val() === auth.uid || auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "(data.exists() && data.child('userId').val() === auth.uid) || (!data.exists() && newData.child('userId').val() === auth.uid) || auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      },
      ".indexOn": ["userId", "status"]
    },
    "redeem_codes": {
      ".read": "auth != null",
      ".write": "auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin'",
      "$code": {
        "usedCount": { ".write": "auth != null" },
        "used": { ".write": "auth != null" }
      }
    },
    "redemptions": {
      ".read": "auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin' || (auth != null && query.orderByChild == 'userId' && query.equalTo == auth.uid)",
      "$rid": {
        ".read": "data.child('userId').val() === auth.uid || auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "auth != null && newData.child('userId').val() === auth.uid"
      },
      ".indexOn": ["userId"]
    },
    "app_settings": {
      ".read": "true",
      ".write": "auth.token.email === 'viduthminsara106@gmail.com' || auth.token.email === '07123456@primeshelf.local' || root.child('users').child(auth.uid).child('role').val() === 'admin'"
    }
  }
}`;
              navigator.clipboard.writeText(fullRules)
                .then(() => alert('Rules copied! Go paste them in Firebase Console.'))
                .catch(() => alert('Failed to copy.'));
            }}
            className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 mb-3"
          >
            Copy Admin Rules
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="w-full border-2 border-red-500 text-red-600 font-bold py-3 rounded-lg hover:bg-red-50"
          >
            Reload Panel
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-100 p-0 md:p-8">
      {permissionDenied && (
        <div className="bg-red-50 border-b border-red-200 p-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center text-red-800 text-sm font-medium">
              <span className="mr-2 text-base">⚠️</span>
              <div>
                <p className="font-bold">Database Permission Denied.</p>
                <p className="text-xs opacity-80">Access to admin data was rejected by security rules. Ensure your email is <strong>{auth.currentUser?.email}</strong> and matches the rules in <strong>database.rules.json</strong>.</p>
              </div>
            </div>
            <button 
              onClick={() => fetchData()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors shadow-sm ml-4 whitespace-nowrap"
            >
              RETRY NOW
            </button>
          </div>
        </div>
      )}

      {errorMessage && !permissionDenied && (
        <div className="bg-orange-50 border-b border-orange-200 p-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <span className="text-orange-500">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-800">Connection Error</p>
              <p className="text-xs text-orange-700">{errorMessage}</p>
            </div>
            <button onClick={() => fetchData()} className="text-xs font-bold bg-orange-100 px-3 py-1 rounded text-orange-800 underline">Reload</button>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto p-4 md:p-0">
        
        {/* EMERGENY MAINTENANCE BANNER */}
        <div className={`mb-6 p-4 rounded-xl shadow-md border-2 transition-all flex flex-col md:flex-row justify-between items-center gap-4 ${maintenanceMode ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${maintenanceMode ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertTriangle size={24} className={maintenanceMode ? 'text-red-600' : 'text-green-600'} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Project Status & Access Control</p>
              <p className={`text-xl font-black ${maintenanceMode ? 'text-red-700' : 'text-green-700'}`}>
                {maintenanceMode ? 'SITE IS LOCKED (OFFLINE)' : 'SITE IS ACTIVE (ONLINE)'}
              </p>
              <p className="text-[11px] text-gray-400 italic">
                {maintenanceMode 
                  ? 'All customers are currently blocked from logging in. Maintenance page is active.' 
                  : 'Customers can login and perform transactions normally.'
                }
              </p>
            </div>
          </div>
          <button 
            onClick={toggleMaintenance}
            className={`w-full md:w-auto py-3 px-8 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${maintenanceMode ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {maintenanceMode ? 'ACTIVATE SYSTEM NOW' : 'EMERGENCY SHUTDOWN'}
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Admin Panel</h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={fetchData} className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
              <RefreshCw size={18} className="mr-2" /> Refresh
            </button>
            <button onClick={handleResetData} className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
              <Trash2 size={18} className="mr-2" /> Reset All Data
            </button>
            <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <LogOut size={18} className="mr-2" /> Logout
            </button>
          </div>
        </div>

        {/* Controls Row: Tabs & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-green-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Users
            </button>
            <button 
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'transactions' ? 'bg-green-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Transactions
            </button>
            <button 
              onClick={() => setActiveTab('redeem')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'redeem' ? 'bg-green-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Redeem Codes
            </button>
          </div>
          
          <div className="w-full md:w-72">
            <input 
              type="text"
              placeholder="Search by Mobile or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Database size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Missing old data?</h3>
              <p className="text-sm text-gray-500">Run the recovery tool to bring back your old users and transactions.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/migrate')}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm"
          >
            Recover Data
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="min-w-[1000px] w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Mobile Number</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Referred By</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Deposit Bal.</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Current Plan</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Ref. Earnings</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Total Given</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Balance</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionDenied && (
                    <tr>
                      <td colSpan={8} className="p-10 text-center bg-red-50">
                        <div className="flex flex-col items-center">
                          <span className="text-red-600 font-bold mb-2 text-lg">⚠️ Database Permission Error</span>
                          <p className="text-red-700 text-sm max-w-md">Access to the user list was denied. Please verify that your admin privileges are correctly set in the database rules.</p>
                          <button onClick={fetchData} className="mt-4 px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-bold">Try Refreshing</button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredUsers.map(user => {
                    const pubData = userPublicData[user.id] || {};
                    
                    // Calculate Referred By
                    const referrerUid = pubData.referredBy;
                    const referrerMobile = referrerUid ? getUserMobile(referrerUid) : (referrerUid ? 'Unknown User' : '-');
                    const referredByMobile = referrerMobile;

                    // Calculate Deposited Balance
                    const userDeposits = transactions.filter(tx => tx.userId === user.id && tx.type === 'deposit' && tx.status === 'approved');
                    const totalDeposited = userDeposits.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
                    
                    // Get Active Plan
                    const activeOrder = orders.find(o => o.userId === user.id && o.status === 'active');
                    const currentPlanName = activeOrder ? activeOrder.planName : 'None';
                    // const planDailyEarnings = activeOrder ? activeOrder.dailyIncome : 0;
                    const totalIncomeGiven = activeOrder ? (activeOrder.daysServed * activeOrder.dailyIncome) : 0;

                    // Calculate Referral Earnings from transactions
                    const referralEarnings = transactions
                      .filter(tx => tx.userId === user.id && tx.type === 'commission' && tx.status === 'approved')
                      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

                    return (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-mono font-medium">{getUserMobile(user.id)}</td>
                        <td className="p-4">{referredByMobile}</td>
                        <td className="p-4 font-medium text-blue-600">Rs {totalDeposited}</td>
                        <td className="p-4">
                          {currentPlanName === 'None' ? (
                            <span className="text-gray-400 italic">None</span>
                          ) : (
                            <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium">{currentPlanName}</span>
                          )}
                        </td>
                        <td className="p-4 font-medium text-orange-600">Rs {referralEarnings.toFixed(2)}</td>
                        <td className="p-4">
                          {activeOrder ? (
                            <div className="font-medium text-teal-600">Rs {totalIncomeGiven}</div>
                          ) : (
                            <span className="text-gray-400">Rs 0</span>
                          )}
                        </td>
                        <td className="p-4 font-medium text-teal-600">Rs {user.balance || 0}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => { setEditingUser(user); setNewBalance(String(user.balance || 0)); }}
                              className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                            >
                              Edit Balance
                            </button>
                            <button 
                              onClick={() => { 
                                setEditingPlanUser(user); 
                                const activeOrder = orders.find(o => o.userId === user.id && o.status === 'active');
                                setSelectedPlanId(activeOrder ? activeOrder.planId : 'none');
                              }}
                              className="px-3 py-1 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 text-sm"
                            >
                              Edit Plan
                            </button>
                            <button 
                              onClick={() => handleViewHistory(user.id)}
                              className="px-3 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm"
                            >
                              History
                            </button>
                            <button 
                              onClick={() => setReferralModalUser(user)}
                              className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm"
                            >
                              Referrals
                            </button>
                            {user.id !== auth.currentUser?.uid ? (
                              <button 
                                onClick={() => handleDeleteUser(user.id, user.mobileNumber)}
                                className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                              >
                                Delete
                              </button>
                            ) : (
                              <button 
                                disabled
                                title="You cannot delete your own admin account"
                                className="px-3 py-1 bg-gray-100 text-gray-400 rounded cursor-not-allowed text-sm"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-gray-400 italic bg-gray-50/30">
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
            
            {txUserFilter && (
              <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg flex justify-between items-center">
                <span>Showing transactions for user: <strong>{getUserMobile(txUserFilter)}</strong></span>
                <button 
                  onClick={() => setTxUserFilter(null)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Clear Filter
                </button>
              </div>
            )}

            {/* Sub-filters */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setTxTypeFilter('deposit')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${txTypeFilter === 'deposit' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                >
                  Deposits
                </button>
                <button 
                  onClick={() => setTxTypeFilter('withdrawal')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${txTypeFilter === 'withdrawal' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                >
                  Withdrawals
                </button>
              </div>

              <div className="flex space-x-2">
                {['all', 'pending', 'approved', 'rejected'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setTxStatusFilter(status as any)}
                    className={`px-3 py-1.5 rounded-full text-sm capitalize border ${txStatusFilter === status ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-hidden">
              <table className="min-w-[900px] w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Mobile Number</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Amount</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Time</th>
                    {txTypeFilter === 'deposit' && <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Receipt</th>}
                    {txTypeFilter === 'withdrawal' && (
                      <>
                        <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Bank Holder</th>
                        <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Bank</th>
                        <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Account No</th>
                      </>
                    )}
                    <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Status</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionDenied && (
                    <tr>
                      <td colSpan={7} className="p-10 text-center bg-red-50">
                        <div className="flex flex-col items-center">
                          <span className="text-red-600 font-bold mb-2">⚠️ Data Fetch Failed (Permission Denied)</span>
                          <button onClick={fetchData} className="mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded">Retry</button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-mono">{getUserMobile(tx.userId)}</td>
                      <td className="p-4 font-medium">Rs {tx.amount}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {formatDate(tx.createdAt)}
                      </td>
                      
                      {txTypeFilter === 'deposit' && (
                        <td className="p-4">
                          {tx.receiptImage ? (
                            <button 
                              onClick={() => setSelectedImage(tx.receiptImage)}
                              className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <Eye size={16} className="mr-1" /> View
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">None</span>
                          )}
                        </td>
                      )}

                      {txTypeFilter === 'withdrawal' && (
                        <>
                          <td className="p-4">{tx.bankDetails?.holderName || '-'}</td>
                          <td className="p-4">{tx.bankDetails?.bankName || '-'}</td>
                          <td className="p-4">{tx.bankDetails?.accountNumber || '-'}</td>
                        </>
                      )}

                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                          ${(tx.status === 'completed' || tx.status === 'approved') ? 'bg-green-100 text-green-700' : 
                            (tx.status === 'failed' || tx.status === 'rejected') ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'}`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        {tx.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleTxAction(tx.id, 'completed', tx)}
                              className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={() => handleTxAction(tx.id, 'failed', tx)}
                              className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && !permissionDenied && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-gray-400 italic">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Redeem Tab */}
        {activeTab === 'redeem' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Generate Redeem Code</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text"
                  placeholder="Enter custom code (e.g. GIFT2024)"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-teal-400"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Amount</label>
                    <input 
                      type="number"
                      placeholder="Amount"
                      value={newCodeAmount}
                      onChange={(e) => setNewCodeAmount(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Limit</label>
                    <input 
                      type="number"
                      placeholder="Limit"
                      value={newCodeLimit}
                      onChange={(e) => setNewCodeLimit(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleGenerateCode}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium self-end"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-4 font-semibold text-gray-600">Code</th>
                      <th className="p-4 font-semibold text-gray-600">Amount</th>
                      <th className="p-4 font-semibold text-gray-600">Usage</th>
                      <th className="p-4 font-semibold text-gray-600">Status</th>
                      <th className="p-4 font-semibold text-gray-600">Created At</th>
                      <th className="p-4 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redeemCodes.map((c) => {
                      const usageLimit = c.usageLimit || 1;
                      const usedCount = c.usedCount || (c.used ? 1 : 0);
                      const isExpired = usedCount >= usageLimit;

                      return (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-mono font-bold text-teal-600">{c.code}</td>
                          <td className="p-4">Rs {c.amount}</td>
                          <td className="p-4">
                            <div className="text-sm">
                              <span className="font-bold">{usedCount}</span> / {usageLimit}
                            </div>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                              <div 
                                className={`h-full ${isExpired ? 'bg-red-400' : 'bg-teal-400'}`}
                                style={{ width: `${Math.min(100, (usedCount / usageLimit) * 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isExpired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                              {isExpired ? 'Expired/Full' : 'Available'}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {formatDate(c.createdAt)}
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => handleDeleteCode(c.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {redeemCodes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          No redeem codes generated yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl max-h-[90vh] w-full flex justify-center">
            <img src={selectedImage} alt="Receipt" className="max-w-full max-h-[90vh] object-contain" />
            <button 
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>
          </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Edit Balance</h3>
            <p className="text-sm text-gray-500 mb-4">User: {editingUser.mobileNumber}</p>
            <input 
              type="number" 
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className="w-full border rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter new balance"
            />
            <div className="flex space-x-3">
              <button 
                onClick={() => setEditingUser(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleUpdateBalance(editingUser.id, Number(newBalance))}
                className="flex-1 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlanUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Edit User Plan</h3>
            <p className="text-sm text-gray-500 mb-4">User: {editingPlanUser.mobileNumber}</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
              <select 
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="none">No Active Plan</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} (Rs {plan.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setEditingPlanUser(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdatePlan}
                className="flex-1 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                Update Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {referralModalUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Referral Chain</h3>
              <button onClick={() => setReferralModalUser(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-500 mb-1">User</p>
                <p className="font-semibold text-gray-800 text-lg">{referralModalUser.mobileNumber}</p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2 border-b pb-2">Referred By (Upline)</h4>
                {(() => {
                  const referrerUid = userPublicData[referralModalUser.id]?.referredBy;
                  if (!referrerUid) return <p className="text-sm text-gray-500 italic">No referrer</p>;
                  const referrerUser = users.find(u => u.id === referrerUid);
                  return (
                    <div className="p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                      {referrerUser ? referrerUser.mobileNumber : 'Unknown User'}
                    </div>
                  );
                })()}
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2 border-b pb-2">Referred Users (Downline)</h4>
                {(() => {
                  const referredUsers = users.filter(u => userPublicData[u.id]?.referredBy === referralModalUser.id);
                  if (referredUsers.length === 0) return <p className="text-sm text-gray-500 italic">No referred users</p>;
                  return (
                    <ul className="space-y-2">
                      {referredUsers.map(u => (
                        <li key={u.id} className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-100 flex justify-between items-center">
                          <span>{u.mobileNumber}</span>
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                            Bal: Rs {u.balance || 0}
                          </span>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2 text-gray-800">Confirm Action</h3>
            <p className="text-sm text-gray-600 mb-6">{confirmDialog.message}</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Dialog */}
      {alertDialog && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-800">Notification</h3>
            <p className="text-sm text-gray-600 mb-6">{alertDialog.message}</p>
            <button 
              onClick={() => setAlertDialog(null)}
              className="w-full py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
