import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={`
        flex items-center gap-2 px-3 py-1.5 rounded-xl
        backdrop-blur-md border 
        ${isOnline 
          ? 'bg-gradient-to-r from-card/90 to-card/80 border-border text-primary' 
          : 'bg-gradient-to-r from-card/90 to-card/80 border-border text-destructive'
        }
        transition-colors duration-200 hover:shadow-sm
      `}>
        <div className="relative">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <motion.div
                className="absolute inset-0 rounded-full bg-white/30"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <motion.div
                className="absolute inset-0 rounded-full bg-white/30"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </>
          )}
        </div>
        <span className="text-xs font-medium">
          {isOnline ? 'Connected' : 'Offline'}
        </span>
      </div>
    </motion.div>
  );
}
