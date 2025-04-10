import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Message } from 'ai';
import { loadChatMessages } from '@/lib/chat-messages';

interface UsageData {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  promptCost: number;
  completionCost: number;
  totalCost: number;
}

interface UsagePillProps {
  messages: Message[];
  sessionId: string | null;
}

// Pricing constants for Claude 3.7 Sonnet
const PROMPT_PRICE_PER_MILLION = 3; // $3 per million tokens
const COMPLETION_PRICE_PER_MILLION = 15; // $15 per million tokens

export function UsagePill({ messages, sessionId }: UsagePillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [usageData, setUsageData] = useState<UsageData>({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    promptCost: 0,
    completionCost: 0,
    totalCost: 0
  });

  // Load session usage from database when session changes
  useEffect(() => {
    if (!sessionId) return;
    
    const loadSessionUsage = async () => {
      try {
        // Use the existing shared function to load messages
        const sessionMessages = await loadChatMessages(sessionId);
        
        if (!sessionMessages || sessionMessages.length === 0) {
          console.log('No messages found for session');
          return;
        }
        
        // Filter for assistant messages with token usage data
        const messagesWithUsage = sessionMessages.filter(msg => 
          msg.role === 'assistant' && 
          (msg.prompt_tokens || msg.completion_tokens || msg.total_tokens)
        );
        
        if (messagesWithUsage.length > 0) {
          // Sum up all tokens from database fields
          let promptTokens = 0;
          let completionTokens = 0;
          let totalTokens = 0;
          
          messagesWithUsage.forEach(msg => {
            promptTokens += Number(msg.prompt_tokens) || 0;
            completionTokens += Number(msg.completion_tokens) || 0;
            totalTokens += Number(msg.total_tokens) || 0;
          });
          
          // If totalTokens is still 0 but we have both prompt and completion, calculate it
          if (totalTokens === 0 && (promptTokens > 0 || completionTokens > 0)) {
            totalTokens = promptTokens + completionTokens;
          }
          
          // Calculate costs
          const promptCost = (promptTokens / 1000000) * PROMPT_PRICE_PER_MILLION;
          const completionCost = (completionTokens / 1000000) * COMPLETION_PRICE_PER_MILLION;
          const totalCost = promptCost + completionCost;
          
          console.log('Loaded session usage data:', {
            sessionId,
            messagesCount: messagesWithUsage.length,
            promptTokens,
            completionTokens,
            totalTokens,
            promptCost,
            completionCost,
            totalCost
          });
          
          setUsageData({
            promptTokens,
            completionTokens,
            totalTokens,
            promptCost,
            completionCost,
            totalCost
          });
        }
      } catch (error) {
        console.error('Error loading session usage:', error);
        // Don't show error to user, just silently fail and show $0 cost
      }
    };
    
    // Only try to load usage if we have a valid sessionId
    if (sessionId) {
      loadSessionUsage();
    }
  }, [sessionId]);
  
  // Also calculate usage from current messages in memory (for current session)
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    
    // Filter for assistant messages with token usage data
    const messagesWithUsage = messages.filter(msg => {
      if (msg.role === 'assistant' && msg.content) {
        // Access additional metadata that might be stored in the message object
        const msgWithTokens = msg as Message & {
          prompt_tokens?: number;
          completion_tokens?: number; 
          total_tokens?: number;
          metadata?: {
            usage?: {
              promptTokens?: number;
              completionTokens?: number;
              totalTokens?: number;
            }
          }
        };
        
        return (
          // Check different possible property locations
          (msgWithTokens.prompt_tokens !== undefined || 
           msgWithTokens.completion_tokens !== undefined || 
           msgWithTokens.total_tokens !== undefined) ||
          // Also check metadata field which is where AI SDK might store it
          (msgWithTokens.metadata?.usage?.promptTokens !== undefined || 
           msgWithTokens.metadata?.usage?.completionTokens !== undefined || 
           msgWithTokens.metadata?.usage?.totalTokens !== undefined)
        );
      }
      return false;
    });
    
    if (messagesWithUsage.length > 0) {
      // Sum up all tokens checking different possible locations
      let promptTokens = 0;
      let completionTokens = 0;
      let totalTokens = 0;
      
      messagesWithUsage.forEach(msg => {
        const msgWithTokens = msg as Message & {
          prompt_tokens?: number;
          completion_tokens?: number; 
          total_tokens?: number;
          metadata?: {
            usage?: {
              promptTokens?: number;
              completionTokens?: number;
              totalTokens?: number;
            }
          }
        };
        
        // Try to get from direct properties first
        if (msgWithTokens.prompt_tokens !== undefined) {
          promptTokens += Number(msgWithTokens.prompt_tokens) || 0;
        } 
        // Then try from metadata
        else if (msgWithTokens.metadata?.usage?.promptTokens !== undefined) {
          promptTokens += Number(msgWithTokens.metadata.usage.promptTokens) || 0;
        }
        
        if (msgWithTokens.completion_tokens !== undefined) {
          completionTokens += Number(msgWithTokens.completion_tokens) || 0;
        } 
        else if (msgWithTokens.metadata?.usage?.completionTokens !== undefined) {
          completionTokens += Number(msgWithTokens.metadata.usage.completionTokens) || 0;
        }
        
        if (msgWithTokens.total_tokens !== undefined) {
          totalTokens += Number(msgWithTokens.total_tokens) || 0;
        } 
        else if (msgWithTokens.metadata?.usage?.totalTokens !== undefined) {
          totalTokens += Number(msgWithTokens.metadata.usage.totalTokens) || 0;
        }
      });
      
      // If totalTokens is still 0 but we have both prompt and completion, calculate it
      if (totalTokens === 0 && (promptTokens > 0 || completionTokens > 0)) {
        totalTokens = promptTokens + completionTokens;
      }
      
      // Calculate costs
      const promptCost = (promptTokens / 1000000) * PROMPT_PRICE_PER_MILLION;
      const completionCost = (completionTokens / 1000000) * COMPLETION_PRICE_PER_MILLION;
      const totalCost = promptCost + completionCost;
      
      console.log('Calculated usage data from memory:', {
        promptTokens,
        completionTokens,
        totalTokens,
        promptCost,
        completionCost,
        totalCost
      });
      
      setUsageData({
        promptTokens,
        completionTokens,
        totalTokens,
        promptCost,
        completionCost,
        totalCost
      });
    }
  }, [messages]);

  // Format cost as currency
  const formatCost = (cost: number) => {
    return cost.toFixed(4).replace(/\.?0+$/, '');
  };

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
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
            <Zap className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
            <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
          </div>
          
          <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
            ${formatCost(usageData.totalCost)}
          </div>
        </button>

        {/* Dropdown with detailed usage information */}
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
                    <Zap className="h-4 w-4 mr-2 text-indigo-500" />
                    Token Usage
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Claude 3.7 Sonnet
                  </p>
                </div>
                
                <div className="text-xl font-semibold text-indigo-500">
                  ${formatCost(usageData.totalCost)}
                </div>
              </div>
            </div>
            
            {/* Details */}
            <div className="p-4 space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Input</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{formatNumber(usageData.promptTokens)} tokens</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">$3 per million tokens</span>
                  <span className="text-xs text-indigo-500">${formatCost(usageData.promptCost)}</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Output</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{formatNumber(usageData.completionTokens)} tokens</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">$15 per million tokens</span>
                  <span className="text-xs text-indigo-500">${formatCost(usageData.completionCost)}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-zinc-800 dark:text-zinc-200">Total</span>
                  <span className="text-zinc-800 dark:text-zinc-200">{formatNumber(usageData.totalTokens)} tokens</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-zinc-500 dark:text-zinc-400">Estimated cost</span>
                  <span className="font-semibold text-indigo-500">${formatCost(usageData.totalCost)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}