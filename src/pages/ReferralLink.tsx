import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Link as LinkIcon, Code, Share2, ChevronLeft, Users } from 'lucide-react';

export default function ReferralLink() {
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState('Loading...');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchCode = async () => {
      if (auth.currentUser) {
        // Use alphanumeric substring of UID to remove numbers from URL
        setReferralCode(auth.currentUser.uid.substring(0, 8));
      }
    };
    fetchCode();
  }, []);

  const referralLink = `${window.location.origin}/login?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ceylon Tea Yard',
          text: 'Join me on Ceylon Tea Yard and get a registration bonus!',
          url: referralLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="bg-gray-50 min-h-full pb-20">
      {/* Header */}
      <div className="flex items-center p-4 bg-white">
        <button onClick={() => navigate(-1)} className="text-gray-600 mr-4">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 flex-1 text-center">Team</h2>
        <button onClick={handleShareClick} className="text-gray-600 ml-4 active:scale-90 transition-transform">
          <Share2 size={20} />
        </button>
      </div>

      {/* Banner Section */}
      <div className="relative">
        <img 
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80" 
          alt="Ceylon Tea Yard" 
          className="w-full h-36 object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent flex items-center justify-center gap-4 px-4">
          <div className="bg-white rounded-xl shadow-lg p-3 text-center flex-1">
            <p className="text-gray-500 text-xs font-medium mb-1">Team Investment</p>
            <p className="text-green-600 text-sm font-bold">Rs 0.00</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-3 text-center flex-1">
            <p className="text-gray-500 text-xs font-medium mb-1">Team Size</p>
            <p className="text-green-600 text-sm font-bold">0</p>
          </div>
        </div>
      </div>

      <div className="p-4 mt-2">
        <h3 className="font-bold text-gray-800 mb-3 ml-1">Invitation Link</h3>
        <div className="bg-white rounded-xl border border-green-500 p-4 shadow-sm mb-6 relative">
          <p className="text-gray-500 text-xs mb-2">Your Invitation Link</p>
          <div className="flex justify-between items-center bg-gray-50 rounded-lg border border-gray-100 p-2 overflow-hidden">
            <span className="text-xs text-gray-600 truncate flex-1 mr-2">{referralCode === 'Loading...' ? 'Generating...' : referralLink}</span>
            <button 
              onClick={handleCopyLink}
              disabled={referralCode === 'Loading...' || referralCode === 'Error'}
              className="bg-green-400 text-white px-4 py-1.5 rounded text-sm font-bold shadow-sm hover:bg-green-500 transition-colors shrink-0"
            >
              {copiedLink ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="absolute top-0 right-0 h-full w-2 bg-green-500 rounded-r-xl"></div>
        </div>
        
        <h3 className="font-bold text-gray-800 text-center mb-1">Team Management Center</h3>
        <div className="w-12 h-1 bg-green-500 mx-auto rounded-full mb-6"></div>

        <div className="space-y-4">
          {/* Level 1 Team */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-50">
              <div>
                <h4 className="font-bold text-gray-800">Level 1 Team</h4>
                <p className="text-xs text-gray-400 italic">Direct Referrals</p>
              </div>
              <div className="bg-green-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">1</div>
            </div>
            <div className="p-4 bg-green-50 m-4 rounded-xl border border-green-100 text-center">
              <p className="text-green-800 text-xs font-bold tracking-wider mb-1">COMMISSION RATE</p>
              <p className="text-3xl font-black text-green-600">30%</p>
            </div>
            <div className="flex divide-x divide-gray-100 border-t border-b border-gray-50">
               <div className="flex-1 p-3 text-center">
                 <p className="font-bold text-gray-800">0</p>
                 <p className="text-xs text-gray-500">Invited People</p>
               </div>
               <div className="flex-1 p-3 text-center">
                 <p className="font-bold text-gray-800">Rs 0.00</p>
                 <p className="text-xs text-gray-500">Commission</p>
               </div>
            </div>
            <div className="p-4">
              <button onClick={() => navigate('/my-team')} className="w-full bg-green-400 text-white font-bold py-3 rounded-lg shadow-sm hover:bg-green-500 flex items-center justify-center gap-2">
                <Users size={18} /> View Level 1 Team
              </button>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="p-4 text-sm text-green-700 bg-green-50 rounded-xl border border-green-100">
            <p className="font-bold mb-2 flex items-center gap-2">🎁 Referral Rewards</p>
            <p className="mb-1">Invite friends and earn commissions when they invest:</p>
            <ul className="list-inside list-disc mb-2 opacity-90">
              <li>Level 1: Earn 30%</li>
              <li>Level 2: Earn 5%</li>
              <li>Level 3: Earn 2%</li>
            </ul>
            <p className="font-medium flex items-center gap-2">👉 Rewards are automatically credited to your account once your referrals invest</p>
          </div>
        </div>
      </div>
    </div>
  );
}
