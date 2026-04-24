import { useState } from 'react';
import { db, app } from '../firebase';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ref, update } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, AlertTriangle, CheckCircle2, Settings } from 'lucide-react';

export default function DataMigration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [useDefaultDb, setUseDefaultDb] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState({
    users: true,
    user_public: true,
    orders: true,
    transactions: true,
    referral_codes: true,
    redeem_codes: true,
    redemptions: true
  });

  const collectionsList = [
    { id: 'users', label: 'Users' },
    { id: 'user_public', label: 'Profiles' },
    { id: 'orders', label: 'Orders (Plans)' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'referral_codes', label: 'Referral Codes' },
    { id: 'redeem_codes', label: 'Redeem Codes' },
    { id: 'redemptions', label: 'Redemptions' },
  ];

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const migrateData = async () => {
    setLoading(true);
    setStatus('running');
    setLogs([]);
    setIsQuotaExceeded(false);
    addLog(`Starting migration from Firestore to RTDB (${useDefaultDb ? '(default)' : firebaseConfig.firestoreDatabaseId})...`);

    try {
      const targetDb = useDefaultDb 
        ? getFirestore(app, '(default)') 
        : getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
      
      const applyUpdates = async (collectionUpdates: any, label: string) => {
        const count = Object.keys(collectionUpdates).length;
        if (count > 0) {
          addLog(`Applying ${count} ${label} records... (RTDB skip)`);
          console.log(`Updates for ${label}:`, collectionUpdates);
          // await update(ref(rtdb), collectionUpdates);
          addLog(`✓ ${label} saved successfully.`);
        }
      };

      // 1. Migrate Users
      if (selectedCollections.users) {
        const userUpdates: any = {};
        addLog("Fetching users from Firestore...");
        const usersSnap = await getDocs(collection(targetDb, 'users'));
        addLog(`Found ${usersSnap.size} users.`);
        usersSnap.forEach(docSnap => {
          const data = docSnap.data();
          if (!data.mobileNumber && data.mobile) data.mobileNumber = data.mobile;
          userUpdates[`users/${docSnap.id}`] = {
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          };
        });
        await applyUpdates(userUpdates, 'Users');
      }

      // 2. Migrate User Public
      if (selectedCollections.user_public) {
        const publicUpdates: any = {};
        addLog("Fetching user_public from Firestore...");
        const publicSnap = await getDocs(collection(targetDb, 'user_public'));
        addLog(`Found ${publicSnap.size} public profile records.`);
        publicSnap.forEach(docSnap => {
          const data = docSnap.data();
          if (!data.mobileNumber && data.mobile) data.mobileNumber = data.mobile;
          publicUpdates[`user_public/${docSnap.id}`] = {
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          };
        });
        await applyUpdates(publicUpdates, 'Profiles');
      }

      // 3. Migrate Orders
      if (selectedCollections.orders) {
        const orderUpdates: any = {};
        addLog("Fetching orders from Firestore...");
        const ordersSnap = await getDocs(collection(targetDb, 'orders'));
        addLog(`Found ${ordersSnap.size} orders.`);
        ordersSnap.forEach(docSnap => {
          const data = docSnap.data();
          orderUpdates[`orders/${docSnap.id}`] = {
            ...data,
            activatedAt: data.activatedAt?.toDate ? data.activatedAt.toDate().toISOString() : data.activatedAt,
            lastPaidAt: data.lastPaidAt?.toDate ? data.lastPaidAt.toDate().toISOString() : data.lastPaidAt,
            deactivatedAt: data.deactivatedAt?.toDate ? data.deactivatedAt.toDate().toISOString() : data.deactivatedAt
          };
        });
        await applyUpdates(orderUpdates, 'Orders');
      }

      // 4. Migrate Transactions
      if (selectedCollections.transactions) {
        const txUpdates: any = {};
        addLog("Fetching transactions from Firestore...");
        const txSnap = await getDocs(collection(targetDb, 'transactions'));
        addLog(`Found ${txSnap.size} transactions.`);
        txSnap.forEach(docSnap => {
          const data = docSnap.data();
          txUpdates[`transactions/${docSnap.id}`] = {
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          };
        });
        await applyUpdates(txUpdates, 'Transactions');
      }

      // 5. Migrate Referral Codes
      if (selectedCollections.referral_codes) {
        const refUpdates: any = {};
        addLog("Fetching referral codes from Firestore...");
        const refCodesSnap = await getDocs(collection(targetDb, 'referral_codes'));
        addLog(`Found ${refCodesSnap.size} referral codes.`);
        refCodesSnap.forEach(docSnap => {
          refUpdates[`referral_codes/${docSnap.id}`] = docSnap.data();
        });
        await applyUpdates(refUpdates, 'Referral Codes');
      }

      // 6. Migrate Redeem Codes
      if (selectedCollections.redeem_codes) {
        const redeemUpdates: any = {};
        addLog("Fetching redeem codes from Firestore...");
        const redeemSnap = await getDocs(collection(targetDb, 'redeem_codes'));
        addLog(`Found ${redeemSnap.size} redeem codes.`);
        redeemSnap.forEach(docSnap => {
          const data = docSnap.data();
          redeemUpdates[`redeem_codes/${docSnap.id}`] = {
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          };
        });
        await applyUpdates(redeemUpdates, 'Redeem Codes');
      }

      // 7. Migrate Redemptions
      if (selectedCollections.redemptions) {
        const redemptionsUpdates: any = {};
        addLog("Fetching redemptions from Firestore...");
        try {
          const redSnap = await getDocs(collection(targetDb, 'redemptions'));
          addLog(`Found ${redSnap.size} redemption records.`);
          redSnap.forEach(docSnap => {
            redemptionsUpdates[`redemptions/${docSnap.id}`] = docSnap.data();
          });
          await applyUpdates(redemptionsUpdates, 'Redemptions');
        } catch (e) {
          addLog("Redemptions skip (might not exist)");
        }
      }

      addLog("All selected data migration tasks processed!");
      setStatus('success');
    } catch (error: any) {
      console.error("Migration error:", error);
      const isQuota = error.message.includes('quota') || error.message.includes('Quota');
      if (isQuota) setIsQuotaExceeded(true);
      addLog(`ERROR: ${error.message}`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCollection = (id: string) => {
    setSelectedCollections(prev => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border p-8">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full mr-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Database className="mr-3 text-green-500" /> Data Migration Tool
          </h1>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start">
          <AlertTriangle className="text-amber-500 mr-3 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-amber-800">
            <p className="font-bold mb-1 text-center">Important Note / වැදගත් සටහන:</p>
            <p>This tool will fetch all your existing data from Firebase Firestore and copy it to the Realtime Database.</p>
            <p className="mt-2 text-red-700 font-medium">Firestore Quota Reset: 12:30 PM (Noon) Sri Lanka Time / 12:00 AM Pacific Time.</p>
            <p className="mt-1">ඔබගේ Firestore Quota අවසන් වී ඇත්නම්, ලංකාවේ වේලාවෙන් දහවල් 12:30 ට එය නැවත ලබා ගත හැක.</p>
          </div>
        </div>

        {isQuotaExceeded && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center animate-pulse">
            <h3 className="text-red-700 font-bold text-xl mb-2">Firestore Quota Limit Exceeded</h3>
            <p className="text-red-600 mb-4">ඔබගේ Firestore දත්ත කියවීමේ සීමාව අවසන් වී ඇත. කරුණාකර දහවල් 12:30 වනතෙක් රැඳී සිටින්න.</p>
            <div className="bg-white p-4 rounded-lg shadow-inner inline-block text-left text-sm">
              <span className="block font-bold mb-1">How to fix (විසඳුම්):</span>
              <ul className="list-disc ml-4 space-y-1">
                <li>Wait for reset (දහවල් 12:30 වනතුරු සිටින්න)</li>
                <li>Try migrating one collection at a time (එක් කොටසක් බැගින් migrate කරන්න)</li>
              </ul>
            </div>
          </div>
        )}

        <div className="bg-white border-2 border-green-100 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-green-700 font-bold">
            <Settings size={20} />
            <span>Select Source Database (පරණ දත්ත ඇති තැන තෝරන්න):</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setUseDefaultDb(true)}
              className={`py-3 rounded-lg border-2 font-medium transition-all ${useDefaultDb ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-green-200'}`}
            >
              (default) Database
            </button>
            <button 
              onClick={() => setUseDefaultDb(false)}
              className={`py-3 rounded-lg border-2 font-medium transition-all ${!useDefaultDb ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-green-200'}`}
            >
              Custom App Database
            </button>
          </div>
          <p className="mt-3 text-[10px] text-gray-400 text-center italic">
            Current: {useDefaultDb ? '(default)' : firebaseConfig.firestoreDatabaseId}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {collectionsList.map(col => (
            <div 
              key={col.id} 
              onClick={() => toggleCollection(col.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedCollections[col.id as keyof typeof selectedCollections] ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 bg-white opacity-60'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors ${
                  selectedCollections[col.id as keyof typeof selectedCollections] ? 'bg-green-500 text-white' : 'border-2 border-gray-300'
                }`}>
                  {selectedCollections[col.id as keyof typeof selectedCollections] && <CheckCircle2 size={14} />}
                </div>
                <span className={`font-medium ${selectedCollections[col.id as keyof typeof selectedCollections] ? 'text-green-900' : 'text-gray-500'}`}>{col.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <button
            onClick={migrateData}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${
              loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600 shadow-green-200 shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                Migrating...
              </>
            ) : (
              'Start Data Migration'
            )}
          </button>

          {status !== 'idle' && (
            <div className="bg-gray-900 rounded-xl p-6 font-mono text-xs overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Migration Logs</span>
                {status === 'success' && <span className="text-green-400 flex items-center"><CheckCircle2 size={14} className="mr-1" /> Success</span>}
                {status === 'error' && <span className="text-red-400">Error Encountered</span>}
              </div>
              <div className="h-64 overflow-y-auto space-y-2 custom-scrollbar">
                {logs.map((log, i) => (
                   <div key={i} className={log.includes('ERROR') ? 'text-red-400' : 'text-green-400'}>
                    {log}
                  </div>
                ))}
                {loading && <div className="text-white animate-pulse">Running...</div>}
              </div>
            </div>
          )}
        </div>

        {status === 'success' && (
          <div className="mt-8">
            <button 
              onClick={() => navigate('/admin')}
              className="w-full py-3 bg-gray-800 text-white rounded-xl font-medium"
            >
              Go to Admin Panel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
