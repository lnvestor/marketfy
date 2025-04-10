import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { ChatMessage } from '../chat/message';
import { ChatMessagesProps, TimelineItem } from '../../types/chat';
import { ToolTimeline } from '../chat/tool-timeline';

function getStatusFromResult(result: unknown): 'in-progress' | 'error' | 'complete' {
  if (!result) return 'in-progress';
  const resultStr = typeof result === 'string' 
    ? result 
    : JSON.stringify(result);
  
  if (resultStr.includes('error') || resultStr.includes('failed') || resultStr.includes('Authentication failed')) {
    return 'error';
  }
  return 'complete';
}

export function ChatMessages({ messages, isLoading, error, onRetry }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(messages.length);
  const toolTimestamps = useRef<Record<string, number>>({});
  const [timelineCollapsed, setTimelineCollapsed] = useState(true);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  
  // Auto-expand timeline when tools are used
  useEffect(() => {
    if (timelineItems.length > 0) {
      setTimelineCollapsed(false);
    }
  }, [timelineItems.length]);

  // Update timeline items when messages change
  useEffect(() => {
    const allAnnotations = messages.flatMap(message => 
      message.annotations ? message.annotations.filter(a => 
        a.type === 'tool-status' && 
        a.toolCallId && 
        typeof a.toolCallId === 'string'
      ) : []
    );

    // Process annotations to build timeline items
    const processedItems = allAnnotations.reduce<TimelineItem[]>((acc, annotation) => {
      const toolCallId = annotation.toolCallId as string;
      
      // Get or create stable timestamp for this tool
      if (!toolTimestamps.current[toolCallId]) {
        toolTimestamps.current[toolCallId] = Date.now();
      }

      const status = annotation.result ? getStatusFromResult(annotation.result) : (annotation.status || 'in-progress');
      const toolName = annotation.toolName || 'Unknown Tool';
      
      // Only add if status changed from last item for this tool
      const lastItemForTool = acc.find(item => item.toolCallId === toolCallId);
      if (!lastItemForTool || lastItemForTool.status !== status) {
        // Get input arguments from annotation or previous item
        const inputArgs = annotation.args || 
                         (lastItemForTool?.message && lastItemForTool.message !== 'Tool is executing...' 
                           ? lastItemForTool.message 
                           : undefined);
        
        acc.push({
          id: `${toolCallId}_${status}`,
          toolCallId,
          toolName,
          status,
          timestamp: toolTimestamps.current[toolCallId],
          title: `${toolName} ${status === 'complete' ? 'completed' : status === 'error' ? 'failed' : 'running'}`,
          message: inputArgs || (status === 'in-progress' ? 'Tool is executing...' : undefined),
          error: status === 'error' 
            ? (typeof annotation.result === 'string' 
                ? annotation.result 
                : JSON.stringify(annotation.result))
            : undefined,
          result: status === 'complete' ? annotation.result : undefined
        });
      }
      return acc;
    }, []);

    // Sort by timestamp and tool ID to maintain stable order
    const sortedItems = processedItems.sort((a, b) => {
      if (a.timestamp === b.timestamp) {
        return a.toolCallId.localeCompare(b.toolCallId);
      }
      return a.timestamp - b.timestamp;
    });

    setTimelineItems(sortedItems);
  }, [messages]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    if (messages.length > lastMessageCountRef.current && isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    lastMessageCountRef.current = messages.length;
  }, [messages]);
  
  // Add smooth scrolling during streaming
  useEffect(() => {
    if (isLoading && scrollContainerRef.current) {
      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      };
      
      // Scroll to bottom immediately when loading starts
      scrollToBottom();
      
      // Set up interval for smooth scrolling during streaming
      const intervalId = setInterval(scrollToBottom, 500);
      
      return () => clearInterval(intervalId);
    }
  }, [isLoading]);

  // Cleanup timestamps for completed tools
  useEffect(() => {
    const activeToolIds = new Set(timelineItems.map(item => item.toolCallId));
    Object.keys(toolTimestamps.current).forEach(toolId => {
      if (!activeToolIds.has(toolId)) {
        delete toolTimestamps.current[toolId];
      }
    });
  }, [timelineItems]);

  return (
    <div className="flex flex-1 relative">
      {/* Main chat content */}
      <div 
        ref={scrollContainerRef}
        className={`
          flex-1 overflow-y-auto pl-10 pr-8 relative scroll-smooth
          transition-[margin] duration-300
          ${!timelineCollapsed ? 'pr-64' : ''}
        `}
      >
        {/* Error Message - now fixed at the top with enough z-index to not overlap with inputs */}
        <AnimatePresence>
          {error && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-20 flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="max-w-xl animate-pulse-slow"
              >
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md flex items-center justify-between border-2 border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 shadow-md">
                  <span className="text-xs">Something went wrong. Please try again.</span>
                  <button
                    onClick={onRetry}
                    className="ml-2 text-xs font-medium bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded border border-red-200 dark:border-red-800"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="max-w-3xl w-full pt-6 pb-4 relative px-4 ml-12">
          {messages.map((message, index) => (
            <div
              key={message.id || `message-${index}`}
              className={`${index > 0 ? 'mt-2' : ''}`}
              data-message-id={message.id || `stable-message-${index}`}
            >
              <ChatMessage
                message={message}
                isLoading={isLoading && index === messages.length - 1}
              />
            </div>
          ))}
          <div ref={messagesEndRef} className="h-px" />
        </div>
      </div>

      {/* Timeline */}
      <div 
        className={`
          fixed right-0 top-16 bottom-36 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-neutral-900
          transition-all duration-300 ease-in-out z-20 flex flex-col
          ${timelineCollapsed ? 'w-0 opacity-0' : 'w-64 opacity-100'}
        `}
      >
        {/* Collapse button */}
        <div className="flex items-center justify-center h-12 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Activity</h3>
          <button 
            onClick={() => setTimelineCollapsed(true)}
            className="ml-3 p-1 rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline content */}
        {!timelineCollapsed && (
          <div className="flex-1 overflow-y-auto">
            <ToolTimeline items={timelineItems} />
          </div>
        )}
      </div>

      {/* Timeline toggle (always visible and vertically centered) */}
      {timelineCollapsed && (
        <button
          onClick={() => setTimelineCollapsed(false)}
          className="fixed right-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-md transition-all hover:shadow-lg z-20"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={timelineItems.length > 0 
              ? "text-black dark:text-white animate-wiggle-fast" 
              : "text-gray-400 dark:text-gray-600"
            }
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </button>
      )}
    </div>
  );
}