import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle, Send } from 'lucide-react';

export default function OfficialChannel() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto relative shadow-xl overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b p-4 flex items-center sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex-1 text-center mr-8">Official Channel</h1>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Send size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Official Telegram Channel</h2>
          <p className="text-gray-500 text-sm font-medium">
            Stay updated with the latest news, announcements, and investment tips.
          </p>
          <a 
            href="https://t.me/+6sIjT5epd_VjY2Ex" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Send size={18} />
            Join our official Telegram channel
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <MessageCircle size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Customer Service</h2>
          <p className="text-gray-500 text-sm font-medium">
            Have questions or need assistance? Our support team is here to help you.
          </p>
          <div className="w-full space-y-3">
            <p className="text-sm font-bold text-gray-700 bg-gray-50 p-2 rounded-lg border">
              Ask your question on Telegram:<br/><span className="text-green-600">@Tea_Yard_support</span>
            </p>
            <a 
              href="https://t.me/Tea_Yard_support" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm border border-green-400"
            >
              <MessageCircle size={18} />
              Contact Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
