import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from 'next/image';
import { TimelineItem, TimelineItemStatus } from '@/app/multiverse/types/chat';

interface TimelineItemProps {
  item: TimelineItem;
  isLatest: boolean;
}

interface ToolTimelineProps {
  items: TimelineItem[];
}

// Available logos
const AVAILABLE_LOGOS = ['claude', 'netsuite', 'celigo', 'exa'];

function getToolLogo(toolName: string): string {
  const name = toolName.toLowerCase().replace(/\s+/g, '');
  
  // Check if the logo exists in our available set
  if (AVAILABLE_LOGOS.includes(name)) {
    return `/logos/${name}.${name === 'celigo' || name === 'exa' ? 'jpg' : 'png'}`;
  }
  
  // Default to Claude logo
  return '/logos/Claude.png';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StatusDot({ status }: { status: TimelineItemStatus }) {
  switch (status) {
    case 'complete':
      return (
        <div className="h-2 w-2 rounded-full bg-green-500/60 flex items-center justify-center">
          <Check className="h-1.5 w-1.5 text-white" />
        </div>
      );
    case 'error':
      return (
        <div className="h-2 w-2 rounded-full bg-red-500/60 flex items-center justify-center">
          <X className="h-1.5 w-1.5 text-white" />
        </div>
      );
    default:
      return (
        <div className="h-2 w-2 rounded-full bg-blue-500/60 flex items-center justify-center">
          <Loader2 className="h-1.5 w-1.5 text-white animate-spin" />
        </div>
      );
  }
}

function TimelineItemComponent({ 
  item,
  isLatest 
}: TimelineItemProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toolLogo = getToolLogo(item.toolName);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imgError, setImgError] = React.useState(false);
  const [showPopup, setShowPopup] = React.useState(false);
  
  // Format data for display
  const formatData = (data: unknown): string => {
    try {
      if (typeof data === 'string') {
        // Try to parse if it's a JSON string
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      }
      return JSON.stringify(data, null, 2);
    } catch {
      // If it's not valid JSON, return as is
      return typeof data === 'string' ? data : String(data);
    }
  };

  return (
    <motion.div 
      layout
      className="relative"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Timeline item */}
      <div className={`
        relative p-2 rounded-md border 
        ${item.status === 'error' ? 'border-red-400/20' : 'border-gray-200 dark:border-neutral-700'}
        bg-white dark:bg-neutral-900
        ${isLatest ? 'border-teal-500/20' : ''}
      `}>
        <div className="flex items-center gap-2">
          {/* Tool Logo */}
          <div className="relative shrink-0">
            <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-black dark:bg-white">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="h-3 w-3 text-white dark:text-black"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          </div>

          {/* Content - Minimal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs text-gray-700 dark:text-gray-300 truncate">
                {item.toolName}
              </h4>
              
              {/* Info button */}
              {(item.message || item.result || item.error) && (
                <button
                  onClick={() => setShowPopup(true)}
                  className="shrink-0 ml-1 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <div className="h-3 w-3 rounded-full flex items-center justify-center text-[8px] font-bold border border-gray-300 dark:border-gray-600">
                    i
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 dark:bg-black/60 backdrop-blur-sm" onClick={() => setShowPopup(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative max-w-md w-full max-h-[70vh] bg-white dark:bg-neutral-900 rounded-md border border-gray-200 dark:border-neutral-700 shadow-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-black dark:bg-white">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="h-3 w-3 text-white dark:text-black"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <h3 className="text-sm text-gray-700 dark:text-gray-300">{item.toolName}</h3>
              </div>
              <button 
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                onClick={() => setShowPopup(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="max-h-[calc(70vh-2.5rem)] overflow-y-auto p-3 space-y-3">
              {/* Input Section */}
              {item.message && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Input</h4>
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-mono whitespace-pre-wrap bg-gray-50 dark:bg-neutral-800 p-2 rounded-md overflow-auto max-h-48 border border-gray-200 dark:border-neutral-700">
                    {formatData(item.message)}
                  </div>
                </div>
              )}
              
              {/* Result/Error Section */}
              {item.error ? (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Error</h4>
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-mono whitespace-pre-wrap bg-gray-50 dark:bg-neutral-800 p-2 rounded-md overflow-auto max-h-48 border border-gray-200 dark:border-neutral-700">
                    {formatData(item.error)}
                  </div>
                </div>
              ) : item.result ? (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Result</h4>
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-mono whitespace-pre-wrap bg-gray-50 dark:bg-neutral-800 p-2 rounded-md overflow-auto max-h-48 border border-gray-200 dark:border-neutral-700">
                    {formatData(item.result)}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export function ToolTimeline({ items }: ToolTimelineProps) {
  const timelineEndRef = useRef<HTMLDivElement>(null);

  // Filter to only show completed or error items
  const filteredItems = React.useMemo(() => {
    return items.filter(item => item.status === 'complete' || item.status === 'error');
  }, [items]);

  // Auto-scroll to bottom when new items are added
  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredItems]);

  // Group items by date
  const groupedItems = React.useMemo(() => {
    return filteredItems.reduce<Record<string, TimelineItem[]>>((acc, item) => {
      const date = new Date(item.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});
  }, [filteredItems]);

  // Sort dates in chronological order
  const sortedDates = React.useMemo(() => {
    return Object.keys(groupedItems).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
  }, [groupedItems]);

  // Get the latest item
  const latestItem = React.useMemo(() => {
    return filteredItems.length > 0 
      ? filteredItems.reduce((latest, item) => 
          item.timestamp > latest.timestamp ? item : latest
        , filteredItems[0])
      : null;
  }, [filteredItems]);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent">
      {filteredItems.length === 0 ? (
        <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
          No tool calls yet
        </div>
      ) : (
        <div className="space-y-3 p-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {sortedDates.map(date => (
              <motion.div
                key={date}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="sticky top-0 z-10 bg-white dark:bg-neutral-900 p-1 rounded-md text-xs text-gray-500 dark:text-gray-400">
                  {date}
                </div>
                <div className="grid gap-1.5">
                  {groupedItems[date]
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .map((item) => (
                      <TimelineItemComponent
                        key={item.id}
                        item={item}
                        isLatest={latestItem?.id === item.id}
                      />
                    ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={timelineEndRef} />
        </div>
      )}
    </div>
  );
}