import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ChevronLeft, ArrowDownToLine, ArrowUpFromLine, Gift, Clock, CheckCircle2, XCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'commission' | 'income';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: any;
  description?: string;
}

export default function TransactionHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'commission' | 'income'>('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!auth.currentUser) return;
      
      try {
        const txQuery = query(
          collection(db, 'transactions'), 
          where('userId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(txQuery);
        const txData: Transaction[] = [];
        
        snapshot.forEach((doc) => {
          txData.push({ id: doc.id, ...doc.data() } as Transaction);
        });

        setTransactions(txData);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownToLine className="text-blue-500" size={20} />;
      case 'withdrawal': return <ArrowUpFromLine className="text-orange-500" size={20} />;
      case 'commission': return <Gift className="text-purple-500" size={20} />;
      default: return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': 
      case 'approved':
        return <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle2 size={12} className="mr-1" /> Success</span>;
      case 'pending': 
        return <span className="flex items-center text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full"><Clock size={12} className="mr-1" /> Pending</span>;
      case 'failed':
      case 'rejected': 
        return <span className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full"><XCircle size={12} className="mr-1" /> Error</span>;
      default: return null;
    }
  };

  const formatDate = (val: any) => {
    if (!val) return '';
    const date = new Date(val);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center p-4 bg-white sticky top-0 z-10 border-b">
        <button onClick={() => navigate(-1)} className="text-gray-600 mr-4">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 flex-1 text-center pr-8">Payment Record</h2>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border-b overflow-x-auto whitespace-nowrap hide-scrollbar">
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('deposit')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'deposit' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Deposits
          </button>
          <button 
            onClick={() => setFilter('withdrawal')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'withdrawal' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Withdrawals
          </button>
          <button 
            onClick={() => setFilter('commission')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'commission' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Commissions
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="p-4">
        {loading ? (
          <LoadingSpinner />
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    tx.type === 'deposit' ? 'bg-blue-50' : 
                    tx.type === 'withdrawal' ? 'bg-orange-50' : 'bg-purple-50'
                  }`}>
                    {getIcon(tx.type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 capitalize">
                      {tx.type} {tx.description && <span className="text-xs font-normal text-gray-500 ml-1">({tx.description})</span>}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-bold ${tx.type === 'withdrawal' ? 'text-gray-800' : 'text-teal-500'}`}>
                    {tx.type === 'withdrawal' ? '-' : '+'}Rs{tx.amount}
                  </span>
                  <div className="mt-1">
                    {getStatusBadge(tx.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-gray-400" size={24} />
            </div>
            <h3 className="text-gray-800 font-medium mb-1">No records found</h3>
            <p className="text-gray-500 text-sm">You don't have any {filter !== 'all' ? filter : ''} transactions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
