import { useState } from 'react';
import { ThumbsUp, X, Star, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface FeedbackDialogProps {
  sessionId: string;
  messageId?: string;
  onClose: () => void;
}

export function FeedbackDialog({ sessionId, messageId, onClose }: FeedbackDialogProps) {
  const [accuracy, setAccuracy] = useState<number>(75);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting feedback to Supabase:', {
        sessionId,
        messageId: messageId || null,
        accuracy,
        description: description.trim() || null
      });
      
      // Default anonymous user ID
      const defaultUserId = '00000000-0000-0000-0000-000000000000';
      
      // Try to get current user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || defaultUserId;
      
      // Insert directly into the Supabase table
      const { data, error } = await supabase
        .from('message_feedback')
        .insert({
          message_id: messageId || null,
          session_id: sessionId,
          user_id: userId,
          accuracy,
          description: description.trim() || null
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to save feedback');
      }
      
      console.log('Feedback saved successfully:', data);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onClose()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        tabIndex={-1}
      >
        <motion.div 
          className="relative w-full max-w-md mx-4 bg-white dark:bg-neutral-900 rounded-md border border-zinc-200 dark:border-zinc-800 p-5 shadow-md overflow-hidden"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button 
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-20"
            onClick={() => onClose()}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
          
          {submitted ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-10 relative z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div 
                className="rounded-full bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 p-4 mb-5"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 300
                }}
              >
                <ThumbsUp className="h-7 w-7 text-black dark:text-white" />
              </motion.div>
              <h3 className="text-xl font-medium text-black dark:text-white">
                Thank you for your feedback
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Your thoughts help us improve our AI experience.</p>
            </motion.div>
          ) : (
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="rounded-full border border-zinc-200 dark:border-zinc-800 p-3">
                  <Star className="h-6 w-6 text-black dark:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-black dark:text-white">Share your thoughts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">How was your AI experience in this session?</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-black dark:text-white mb-3 flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-black dark:text-white" />
                    <span>Rate your experience</span>
                  </span>
                  <span className="font-mono text-sm bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800">
                    {accuracy}%
                  </span>
                </label>
                
                <div className="relative mt-3 mb-4">
                  {/* Track background */}
                  <div className="h-1 w-full bg-gray-200 dark:bg-neutral-800 rounded-full absolute top-[13px]"></div>
                  
                  {/* Filled track with smooth transition */}
                  <motion.div 
                    className="h-1 bg-black dark:bg-white rounded-full absolute top-[13px] pointer-events-none" 
                    initial={{ width: `${accuracy}%` }}
                    animate={{ width: `${accuracy}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={accuracy}
                    onChange={(e) => setAccuracy(parseInt(e.target.value))}
                    className="w-full bg-transparent cursor-pointer relative z-10 opacity-0"
                    style={{
                      height: '26px',
                      margin: '0',
                    }}
                  />
                  
                  {/* Custom thumb with smooth animation */}
                  <motion.div 
                    className="absolute h-4 w-4 bg-black dark:bg-white rounded-full border border-zinc-200 dark:border-zinc-800 pointer-events-none transform -translate-y-1/2"
                    initial={{ 
                      left: `calc(${accuracy}% - ${accuracy === 0 ? 0 : accuracy === 100 ? 16 : 8}px)`
                    }}
                    animate={{ 
                      left: `calc(${accuracy}% - ${accuracy === 0 ? 0 : accuracy === 100 ? 16 : 8}px)`
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 40
                    }}
                    style={{ top: '13px', zIndex: 20 }}
                  />

                  <div className="mt-4 flex justify-between text-xs text-gray-600 dark:text-gray-400 px-0.5">
                    <span>Not helpful</span>
                    <span>Very helpful</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-black dark:text-white mb-3 flex items-center gap-2">
                  <Pencil className="h-3.5 w-3.5 text-black dark:text-white" />
                  <span>What could be improved?</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share specific details about what worked well or what could be better..."
                  className="w-full min-h-[120px] bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black/20 dark:focus:border-white/20 outline-none transition-all duration-200"
                />
              </div>
              
              {error && (
                <motion.div 
                  className="mb-5 p-3 rounded-md bg-white dark:bg-neutral-900 border border-red-500 text-sm text-red-500 dark:text-red-400 flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <X className="h-3 w-3" />
                  {error}
                </motion.div>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-md bg-black dark:bg-white text-sm text-white dark:text-black font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}