import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, doc, getDoc, getDocs, updateDoc, writeBatch, query, where, orderBy, serverTimestamp, setDoc, limit } from 'firebase/firestore';
import { CreditCard, Receipt, AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'motion/react';

const SRI_LANKAN_BANKS = [
  "Bank of Ceylon",
  "People's Bank",
  "Commercial Bank of Ceylon",
  "Hatton National Bank (HNB)",
  "Sampath Bank",
  "Seylan Bank",
  "Nations Trust Bank (NTB)",
  "DFCC Bank",
  "National Savings Bank (NSB)",
  "NDB Bank",
  "Pan Asia Bank",
  "Union Bank of Colombo",
  "Amana Bank",
  "Cargills Bank",
  "Sanasa Development Bank (SDB)",
  "HDFC Bank",
  "Regional Development Bank (RDB)",
  "Standard Chartered Bank",
  "HSBC",
  "Habib Bank",
  "Indian Bank",
  "Indian Overseas Bank",
  "State Bank of India",
  "Public Bank",
  "MCB Bank Ltd",
  "Axis Bank Ltd",
  "ICICI Bank Ltd",
  "Citibank N.A.",
  "Deutsche Bank AG"
];

export default function Wallet() {
  const { userData, balance, mobileNumber } = useOutletContext<{ userData: any; balance: number; mobileNumber: string }>();
  const { showToast } = useToast();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showCard, setShowCard] = useState(false);
  
  // Card state
  const [holderName, setHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSavingCard, setIsSavingCard] = useState(false);
  
  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawRecords, setWithdrawRecords] = useState<any[]>([]);

  useEffect(() => {
    if (userData?.bankDetails) {
      setHolderName(userData.bankDetails.holderName || '');
      setBankName(userData.bankDetails.bankName || '');
      setAccountNumber(userData.bankDetails.accountNumber || '');
    }
  }, [userData]);

  useEffect(() => {
    const fetchWithdrawData = async () => {
      if (!auth.currentUser) return;
      try {
        // Check for active plans in Firestore
        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', auth.currentUser.uid), where('status', '==', 'active'), limit(1));
        const ordersSnap = await getDocs(ordersQuery);
        setHasActivePlan(!ordersSnap.empty);

        // Fetch withdrawal records from Firestore
        const txQuery = query(
          collection(db, 'transactions'), 
          where('userId', '==', auth.currentUser.uid), 
          where('type', '==', 'withdrawal'),
          orderBy('createdAt', 'desc')
        );
        const txSnap = await getDocs(txQuery);
        const records = txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWithdrawRecords(records);

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchWithdrawData();
  }, []);

  const handleSaveCard = async () => {
    if (!holderName || !bankName || !accountNumber) {
      showToast("Please fill in all fields", "error");
      return;
    }
    if (!auth.currentUser) return;

    setIsSavingCard(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        bankDetails: {
          holderName,
          bankName,
          accountNumber
        }
      });
      showToast("Card information saved successfully!", "success");
      setShowCard(false);
    } catch (error) {
      console.error("Error saving card:", error);
      showToast("Failed to save card information", "error");
    } finally {
      setIsSavingCard(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawError('');
    
    if (!hasActivePlan) {
      setWithdrawError('You need to buy at least one package to unlock withdrawal function');
      return;
    }

    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount < 300) {
      setWithdrawError('Minimum withdrawal amount is Rs 300');
      return;
    }

    if (amount > balance) {
      setWithdrawError('Insufficient balance');
      return;
    }

    if (!holderName || !bankName || !accountNumber) {
      setWithdrawError('Please add your bank card details first');
      return;
    }

    if (!auth.currentUser) return;

    setIsWithdrawing(true);
    try {
      const now = serverTimestamp();
      const batch = writeBatch(db);
      
      const newTxId = 'wd-' + auth.currentUser.uid + '-' + Date.now();
      const newTxRef = doc(db, 'transactions', newTxId);
      
      const newTx: any = {
        userId: auth.currentUser.uid,
        type: 'withdrawal',
        amount: amount,
        status: 'pending',
        createdAt: now,
        description: 'Withdrawal to Bank Account',
        bankDetails: {
          holderName,
          bankName,
          accountNumber
        }
      };
      
      batch.set(newTxRef, newTx);
      batch.update(doc(db, 'users', auth.currentUser.uid), {
        balance: balance - amount
      });

      await batch.commit();

      // Optimistic update for UI records (using a fake timestamp for display)
      setWithdrawRecords([{ id: newTxRef.id, ...newTx, createdAt: new Date() }, ...withdrawRecords]);
      setShowWithdraw(false);
      setWithdrawAmount('');
      showToast("Withdrawal request submitted successfully!", "success");
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      setWithdrawError('Failed to process withdrawal');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const isCardLinked = !!(userData?.bankDetails?.holderName && userData?.bankDetails?.bankName && userData?.bankDetails?.accountNumber);

  return (
    <div className="p-4 bg-gray-50 min-h-full relative pb-20">
      {/* Balance Banner */}
      <div className="bg-green-600 rounded-2xl shadow-lg p-6 text-white mb-6 mt-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CreditCard size={64} />
        </div>
        <div className="text-center relative z-10 w-full mb-6">
          <p className="text-green-100 text-sm mb-1 uppercase tracking-wider font-semibold">Account Balance</p>
          <h2 className="text-4xl font-black mb-1">Rs {balance.toLocaleString()}</h2>
          <p className="text-green-200 text-xs">ID {mobileNumber || auth.currentUser?.uid?.substring(0, 10)}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowWithdraw(true)}
            className="flex-1 bg-white text-green-700 py-2.5 rounded-xl font-bold shadow-sm hover:bg-green-50 transition-colors"
          >
            Withdraw
          </button>
          <button 
            onClick={() => setShowCard(true)}
            className="flex-1 bg-green-500 text-white py-2.5 rounded-xl font-bold shadow-sm border border-green-400 hover:bg-green-400 transition-colors flex items-center justify-center gap-2 relative"
          >
            Bank Card
             {!isCardLinked && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-4 pl-1">Withdraw Records</h3>
        {withdrawRecords.length > 0 ? (
          <div className="space-y-3 mb-8">
            {withdrawRecords.map(record => (
              <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">Withdrawal</p>
                  <p className="text-xs text-gray-500">{new Date(record.createdAt || Date.now()).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 text-lg">Rs {record.amount}</p>
                  <p className={`text-xs font-bold px-2 py-0.5 rounded shadow-sm inline-block ${record.status === 'approved' ? 'bg-green-100 text-green-700' : record.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {record.status.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm py-8">
            -- end --
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-8 relative shadow-2xl border border-gray-100"
            >
              <button 
                onClick={() => { setShowWithdraw(false); setWithdrawError(''); }}
                className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
              <h3 className="text-xl font-black mb-6 text-gray-800 tracking-tight">Withdrawal amount</h3>
              
              {withdrawError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 text-sm font-semibold border border-red-100 shadow-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                  <p>{withdrawError}</p>
                </motion.div>
              )}

              <div className="relative mb-8">
                <input 
                  type="number" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Please Enter withdrawal amount"
                  className="w-full pl-6 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-100 focus:border-green-400 focus:bg-white transition-all font-semibold text-gray-700 placeholder:text-gray-400 placeholder:font-medium"
                />
              </div>
              
              <div className="text-center mb-8 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                <h4 className="text-green-500 font-extrabold mb-4 uppercase tracking-widest text-[11px]">About Withdrawal</h4>
                <div className="text-sm font-extrabold text-gray-600 space-y-2">
                  <p className="flex justify-between items-center"><span className="text-gray-400">Processing Time</span><span>7x24h</span></p>
                  <p className="flex justify-between items-center"><span className="text-gray-400">Minimum Withdrawal</span><span>Rs 300</span></p>
                  <p className="flex justify-between items-center"><span className="text-gray-400">Arrival Time</span><span>Within 24h</span></p>
                  <p className="flex justify-between items-center"><span className="text-gray-400">Fees</span><span>15%</span></p>
                </div>
                {!hasActivePlan && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-5 pt-5 border-t border-gray-200/60"
                  >
                    <p className="text-[11px] font-black uppercase tracking-wider text-red-500 leading-relaxed shadow-sm bg-white p-3 rounded-xl border border-red-100">
                      You need to buy at least one package to unlock withdrawal function
                    </p>
                  </motion.div>
                )}
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="w-full bg-green-500 text-white shadow-xl shadow-green-200 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-green-600 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
              >
                {isWithdrawing ? 'Processing...' : 'Withdraw'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Modal */}
      {showCard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative">
            <button 
              onClick={() => setShowCard(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-6">Card Information</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder's Name</label>
                <input 
                  type="text" 
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="Please Enter Your full Name"
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <select 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-400 bg-white"
                >
                  <option value="">Select Bank</option>
                  {SRI_LANKAN_BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input 
                  type="text" 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Please Enter Your Account Number"
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveCard}
              disabled={isSavingCard}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
            >
              {isSavingCard ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
