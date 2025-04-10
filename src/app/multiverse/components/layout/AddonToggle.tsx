import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle, Check, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAddons } from '../../hooks/useAddons';

export function AddonToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const { isEnabled, availableAddons, enabledAddons, connectingAddons, toggleEnabled, toggleAddon } = useAddons();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative">
        <button
          onClick={() => toggleEnabled()}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={`
            group relative overflow-hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg
            backdrop-blur-sm transition-all duration-300
            ${isEnabled 
              ? 'bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200' 
              : 'bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
            }
          `}
        >
          <div className="h-5 w-5 flex items-center justify-center relative">
            <Puzzle className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
            {isEnabled && (
              <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-teal-500"></div>
            )}
          </div>
          
          <div className="text-xs font-medium">
            {isEnabled ? `${enabledAddons.length}` : '0'}
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 w-72 rounded-lg bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 shadow-md overflow-hidden z-50 text-zinc-800 dark:text-zinc-200"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-background/0 to-transparent pointer-events-none" />
              
              {/* Header */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-200 flex items-center">
                      <Puzzle className="h-4 w-4 mr-2 text-zinc-500" />
                      Addons
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {isEnabled 
                        ? enabledAddons.length > 0 
                          ? 'Active addons: ' + enabledAddons.length 
                          : 'No addons installed'
                        : 'Addons are disabled'}
                    </p>
                  </div>
                  
                  {/* Toggle switch */}
                  <button 
                    onClick={() => toggleEnabled()}
                    className={`relative flex items-center w-11 h-6 rounded-full ${isEnabled ? 'bg-teal-500/20' : 'bg-zinc-200 dark:bg-zinc-700'} transition-colors duration-300 border ${isEnabled ? 'border-teal-500/40' : 'border-zinc-300 dark:border-zinc-600'}`}
                  >
                    <div 
                      className={`absolute h-4 w-4 rounded-full transition-all duration-300 shadow-sm
                        ${isEnabled 
                          ? 'translate-x-6 bg-teal-500' 
                          : 'translate-x-1 bg-zinc-400 dark:bg-zinc-500'}
                      `}
                    />
                  </button>
                </div>
              </div>
              
              <div className="max-h-[240px] overflow-y-auto">
                <div className="p-3 space-y-2">
                  {availableAddons.map((addon) => (
                    <button
                      key={addon}
                      onClick={() => toggleAddon(addon)}
                      disabled={connectingAddons.includes(addon) || !isEnabled}
                      className={`
                        group relative w-full flex items-center gap-3 p-3 rounded-lg text-sm
                        transition-all duration-300 hover:-translate-y-0.5
                        ${!isEnabled 
                          ? 'cursor-not-allowed opacity-60 bg-gray-100 dark:bg-neutral-800 text-zinc-400 dark:text-zinc-500'
                          : enabledAddons.includes(addon)
                          ? 'bg-white dark:bg-neutral-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                          : connectingAddons.includes(addon)
                          ? 'bg-white dark:bg-neutral-900 text-zinc-400 dark:text-zinc-500 cursor-wait border border-zinc-200 dark:border-zinc-700'
                          : 'bg-white dark:bg-neutral-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }
                      `}
                    >
                      {/* Simple dot indicator for enabled addons */}
                      
                      <div className="relative flex items-center justify-center h-8 w-8 rounded-lg overflow-hidden bg-white dark:bg-neutral-800 border border-zinc-200 dark:border-zinc-700">
                        {connectingAddons.includes(addon) ? (
                          <Loader2 className="h-4 w-4 text-zinc-500 animate-spin" />
                        ) : enabledAddons.includes(addon) && isEnabled ? (
                          <div className="flex items-center justify-center h-full w-full">
                            <Check className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">
                            <Plus className="h-4 w-4 text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <p className="font-medium">{addon}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {connectingAddons.includes(addon) 
                            ? 'Connecting...' 
                            : enabledAddons.includes(addon) && isEnabled 
                            ? 'Connected' 
                            : !isEnabled 
                            ? 'Disabled'
                            : 'Click to connect'}
                        </p>
                      </div>
                      
                      {/* Status indicator dot */}
                      {!connectingAddons.includes(addon) && (
                        <div className={`h-2 w-2 rounded-full 
                          ${enabledAddons.includes(addon) && isEnabled 
                            ? 'bg-teal-500' 
                            : 'bg-zinc-300 dark:bg-zinc-600'}
                        `} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
