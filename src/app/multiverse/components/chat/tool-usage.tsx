import { useState } from 'react';
import { ChevronDown, ChevronRight, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolUsageProps {
  toolName: string;
  input: string;
  response: string;
}

export function ToolUsage({ toolName, input, response }: ToolUsageProps) {
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [isResponseExpanded, setIsResponseExpanded] = useState(false);

  return (
    <div className="mt-3 space-y-2">
      {/* Tool Header */}
      <div className="flex items-center gap-2 text-sm text-white/70">
        <div className="h-5 w-5 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Wrench className="h-3 w-3 text-blue-400" />
        </div>
        <span className="font-medium">{toolName}</span>
      </div>

      {/* Input Section */}
      <div className="rounded-lg border border-white/10 overflow-hidden bg-black/20">
        <button
          onClick={() => setIsInputExpanded(!isInputExpanded)}
          className="w-full px-3 py-2 flex items-center justify-between text-sm text-white/70 hover:bg-white/5"
        >
          <span className="font-medium">Input</span>
          {isInputExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        <AnimatePresence>
          {isInputExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <pre className="p-3 text-sm overflow-x-auto bg-black/20 border-t border-white/10">
                <code className="text-blue-300">{input}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Response Section */}
      <div className="rounded-lg border border-white/10 overflow-hidden bg-black/20">
        <button
          onClick={() => setIsResponseExpanded(!isResponseExpanded)}
          className="w-full px-3 py-2 flex items-center justify-between text-sm text-white/70 hover:bg-white/5"
        >
          <span className="font-medium">Response</span>
          {isResponseExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        <AnimatePresence>
          {isResponseExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <pre className="p-3 text-sm overflow-x-auto bg-black/20 border-t border-white/10">
                <code className="text-green-300">{response}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
