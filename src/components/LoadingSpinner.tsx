import { motion } from 'motion/react';

const LeafIcon = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M2 12C2 12 7 2 12 2C17 2 22 12 22 12C22 12 17 22 12 22C7 22 2 12 2 12Z" 
      fill="currentColor" 
      className="opacity-80"
    />
    <path 
      d="M2 12H22" 
      stroke="white" 
      strokeWidth="0.5" 
      strokeLinecap="round" 
      strokeDasharray="2 2"
    />
    <path 
      d="M12 2C12 2 14 7 14 12C14 17 12 22 12 22" 
      stroke="white" 
      strokeWidth="0.5" 
      strokeLinecap="round" 
    />
  </svg>
);

const FloatingLeaf = ({ delay = 0, x = 0, y = 0, scale = 1, rotate = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x, y, rotate, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      x: [x, x + 40, x - 20, x + 10],
      y: [y, y - 100, y - 200, y - 300],
      rotate: [rotate, rotate + 45, rotate - 45, rotate + 90],
      scale: [scale * 0.5, scale, scale, scale * 0.5],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay: delay,
      ease: "linear"
    }}
    className="absolute text-green-400/40 pointer-events-none"
  >
    <LeafIcon size={20} />
  </motion.div>
);

export default function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-8 relative">
      {/* Floating Particles Area */}
      <div className="absolute inset-0 z-0 overflow-visible">
        <FloatingLeaf delay={0} x={-60} y={40} scale={1.2} rotate={10} />
        <FloatingLeaf delay={1} x={50} y={60} scale={0.8} rotate={-20} />
        <FloatingLeaf delay={2} x={-30} y={80} scale={1} rotate={150} />
        <FloatingLeaf delay={0.5} x={70} y={20} scale={1.1} rotate={45} />
        <FloatingLeaf delay={2.5} x={-80} y={100} scale={0.9} rotate={-60} />
      </div>

      <div className="relative">
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="relative z-10"
        >
          {/* Main Logo Container */}
          <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-700 rounded-[2.5rem] shadow-2xl flex items-center justify-center border-4 border-white relative overflow-hidden group">
             {/* Logo Shine Effect */}
             <motion.div 
               animate={{ x: [-200, 200] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
               className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-0"
             />
             
             <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white relative z-10 drop-shadow-lg">
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  d="M12 2C12 2 19 8 19 13C19 18 12 20 12 20C12 20 5 18 5 13C5 8 12 2 12 2Z" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <motion.path 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  d="M12 2V20M12 7C12 7 17 9 17 13M12 10C12 10 7 12 7 15" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  strokeLinecap="round" 
                />
             </svg>
          </div>
        </motion.div>
        
        {/* Pulsing Aura */}
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-green-400 rounded-full blur-3xl z-0"
        />
      </div>

      <div className="flex flex-col items-center space-y-2 z-10">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-black text-green-900 tracking-tighter italic text-center drop-shadow-sm">
            Ceylon <span className="text-green-600">Tea</span> Yard
          </h2>
          <p className="text-[10px] font-black text-green-700/60 uppercase tracking-[0.4em] text-center mt-1">
            Investing in Nature
          </p>
        </motion.div>
        
        {/* Loading Bar Style Progress */}
        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-4 relative border border-gray-50 shadow-inner">
            <motion.div 
               animate={{ left: ["-100%", "100%"] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute h-full w-1/2 bg-gradient-to-r from-transparent via-green-500 to-transparent"
            />
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-10">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-100 rounded-full blur-[120px]"></div>
        </div>
        {content}
      </div>
    );
  }

  return (
    <div className="py-12 flex items-center justify-center w-full">
      {content}
    </div>
  );
}
