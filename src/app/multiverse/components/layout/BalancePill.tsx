import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserBalance } from '@/lib/user-token-usage';

export function BalancePill() {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user balance when component mounts
  useEffect(() => {
    const loadBalance = async () => {
      setIsLoading(true);
      try {
        const userBalance = await getUserBalance();
        setBalance(userBalance);
      } catch (error) {
        console.error('Error loading user balance:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBalance();
    
    // Refresh balance every 60 seconds
    const intervalId = setInterval(loadBalance, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Format balance as currency
  const formatBalance = (amount: number | null) => {
    if (amount === null) return '$--';
    return '$' + amount.toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="group relative overflow-hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition-all duration-300"
        >
          <div className="h-5 w-5 flex items-center justify-center relative">
            <DollarSign className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
            {!isLoading && (
              <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-green-500"></div>
            )}
          </div>
          
          <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
            {isLoading ? '$...' : formatBalance(balance)}
          </div>
        </button>

        {/* Dropdown with balance information */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-72 rounded-lg bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 shadow-md overflow-hidden z-50"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-background/0 to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="p-4 border-b border-border relative">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-200 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    Account Balance
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Pay-as-you-go credits
                  </p>
                </div>
                
                <div className="text-xl font-semibold text-green-500">
                  {isLoading ? '$...' : formatBalance(balance)}
                </div>
              </div>
            </div>
            
            {/* Details */}
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Current balance:</span>
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{isLoading ? '...' : formatBalance(balance)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Input tokens:</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">$3.00 per million tokens</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Output tokens:</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">$15.00 per million tokens</span>
              </div>
              
              <div className="mt-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button className="w-full py-2 bg-white dark:bg-neutral-800 text-green-500 rounded-lg border border-green-500/30 hover:bg-green-500/5 transition-colors">
                  Add Credits
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}