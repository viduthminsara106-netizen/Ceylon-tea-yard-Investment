import { AlertTriangle, Home } from 'lucide-react';

export default function Maintenance() {
  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto items-center justify-center p-6 text-center">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <AlertTriangle size={64} className="text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Systems Currently Offline</h1>
      <p className="text-gray-600 mb-8">
        We are performing urgent technical maintenance. Access to the platform is temporarily suspended. Please check back later.
      </p>
      
      <div className="p-4 bg-gray-50 rounded-lg w-full mb-8">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Status</p>
        <p className="text-red-600 font-bold uppercase">Locked / Technical Issue</p>
      </div>

      <button 
        onClick={() => window.location.reload()}
        className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
      >
        <Home size={18} />
        Refresh Page
      </button>
    </div>
  );
}
