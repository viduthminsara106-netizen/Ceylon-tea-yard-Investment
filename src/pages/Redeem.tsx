import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { useToast } from '../components/Toast';
import { collection, doc, getDoc, getDocs, updateDoc, writeBatch, query, where, orderBy, serverTimestamp, setDoc, limit } from 'firebase/firestore';

export default function Redeem() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, 'redemptions'), 
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRedemptions(list);
    } catch (error) {
      console.error("Error fetching redemptions:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleRedeem = async () => {
    if (!code.trim()) {
      showToast("Please enter a code", "info");
      return;
    }

    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const cleanCode = code.trim();
      
      // 1. Check if user has already redeemed this specific code
      const alreadyRedeemedQ = query(
        collection(db, 'redemptions'), 
        where('userId', '==', auth.currentUser.uid),
        where('code', '==', cleanCode),
        limit(1)
      );
      const alreadyRedeemedSnap = await getDocs(alreadyRedeemedQ);
      
      if (!alreadyRedeemedSnap.empty) {
        showToast("You have already redeemed this code", "error");
        setLoading(false);
        return;
      }

      // 2. Check if code exists and has remaining uses
      const codeDocRef = doc(db, 'redeem_codes', cleanCode);
      const codeSnap = await getDoc(codeDocRef);

      if (!codeSnap.exists()) {
        showToast("Invalid code", "error");
        setLoading(false);
        return;
      }

      const codeData = codeSnap.data();
      const usageLimit = codeData.usageLimit || (codeData.used ? 0 : 1);
      const usedCount = codeData.usedCount || 0;

      if (usedCount >= usageLimit) {
        showToast("This code has reached its usage limit", "error");
        setLoading(false);
        return;
      }

      const rewardAmount = codeData.amount || 30;

      // 3. Update everything 
      const batch = writeBatch(db);
      const userId = auth.currentUser.uid;
      const now = serverTimestamp();
      
      // Increment used count
      batch.update(codeDocRef, {
        usedCount: usedCount + 1,
        used: (usedCount + 1) >= usageLimit
      });

      // Create redemption record
      const redemptionId = 'red-' + auth.currentUser.uid + '-' + cleanCode;
      const redemptionRef = doc(db, 'redemptions', redemptionId);
      batch.set(redemptionRef, {
        userId: userId,
        code: cleanCode,
        amount: rewardAmount,
        createdAt: now
      });

      // Update user balance
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);
      const currentBalance = userSnap.exists() ? (userSnap.data().balance || 0) : 0;
      batch.update(userDocRef, {
        balance: currentBalance + rewardAmount
      });

      // Add transaction record
      const txId = 'tred-' + auth.currentUser.uid + '-' + Date.now();
      const txRef = doc(db, 'transactions', txId);
      batch.set(txRef, {
        userId: userId,
        amount: rewardAmount,
        type: 'redeem',
        status: 'completed',
        description: `Redeemed code: ${cleanCode}`,
        createdAt: now
      });

      await batch.commit();

      showToast(`Successfully redeemed! Rs ${rewardAmount} added to your balance.`, "success");
      setCode('');
      fetchRedemptions();
    } catch (error) {
      console.error("Redemption failed:", error);
      showToast("Redemption failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center p-4 bg-white border-b">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 flex-1 text-center">Redeem</h2>
        <button className="text-gray-600">
          <Share2 size={20} />
        </button>
      </div>

      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Redeem your gift</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your code below to get cash reward
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code here"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
          />
        </div>

        <button
          onClick={handleRedeem}
          disabled={loading}
          className={`w-full py-4 rounded-xl text-white font-semibold text-lg shadow-md transition-all ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {loading ? 'Processing...' : 'Redeem'}
        </button>
      </div>

      {/* Redemption Records */}
      <div className="mt-4">
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Redemption Records</h3>
        </div>
        
        <div className="bg-white">
          {fetching ? (
            <div className="p-8 text-center text-gray-400">Loading records...</div>
          ) : redemptions.length > 0 ? (
            redemptions.map((record) => (
              <div key={record.id} className="p-4 border-b flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-bold text-gray-800">Code: {record.code}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {record.createdAt?.toDate ? record.createdAt.toDate().toLocaleString() : 'Just now'}
                  </p>
                </div>
                <div className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full shadow-sm border border-green-100">
                  +Rs {record.amount}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-400 italic font-medium bg-gray-50">
              No redemptions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
