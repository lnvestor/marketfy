import { ExtendedMessage } from '../../message.d';
import { MemoizedMarkdown } from '@/app/multiverse/components/chat/memoized-markdown';
import { Copy, ThumbsUp, Check, Brain } from 'lucide-react';
import React, { useState, useCallback, useMemo } from 'react';
import { MessageAnnotation } from '@/app/multiverse/types/chat';

// Extend our already extended message type
interface MessageWithAttachments extends ExtendedMessage {
  experimental_toolResult?: string;
  experimental_attachments?: Array<{
    url: string;
    name?: string;
    contentType?: string;
  }>;
  annotations?: MessageAnnotation[];
}

interface ChatMessageProps {
  message: MessageWithAttachments;
  isLoading?: boolean;
}

function LoadingDots() {
  return (
    <div className="flex space-x-1">
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className="inline-block h-1 w-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1.5s' }}
        />
      ))}
    </div>
  );
}

function ReasoningSection({ content }: { content: string }) {
  // Always initialize as collapsed
  const [isOpen, setIsOpen] = useState(false);
  
  // Format the content to display nicely
  const formattedContent = useMemo(() => {
    // Split content into sections by lines
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    return lines;
  }, [content]);

  return (
    <div className="w-full overflow-hidden mt-2 transition-all duration-300">
      <div 
        className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/70 rounded-sm border border-gray-100/30 dark:border-neutral-800/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1.5">
          <Brain className="h-4 w-4 text-gray-500" />
          <span className="text-xs text-gray-500">
            reasoning
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {isOpen ? "hide" : "show"}
        </div>
      </div>
      
      {isOpen && (
        <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-l border-gray-100/50 dark:border-neutral-800/50 ml-2 mt-1 bg-gray-50/30 dark:bg-neutral-900/20 rounded-r-sm">
          {formattedContent.map((line, index) => (
            <div key={index} className="mb-1 last:mb-0">
              {line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim()) ? (
                // This is a list item
                <div className="flex items-start mb-1">
                  <div className="pr-1 pt-1">
                    <div className="h-0.5 w-0.5 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                  </div>
                  <div>{line.replace(/^[-•]|\d+\.\s*/, '').trim()}</div>
                </div>
              ) : line.toLowerCase().includes('step') || /^\d+(\)|\.|\:)/.test(line) ? (
                // This is a step heading
                <div className="flex items-center gap-1 mb-1 mt-1.5 first:mt-0 font-normal text-gray-500 dark:text-gray-400">
                  {line}
                </div>
              ) : (
                // Normal text
                <div className="pl-1">{line}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Attachments({ attachments }: { attachments: ExtendedMessage['experimental_attachments'] }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {attachments.map((attachment, index) => {
        if (attachment.contentType?.startsWith('image/')) {
          return (
            <div key={index} className="relative h-12 w-12 overflow-hidden">
              <div 
                role="img"
                aria-label={attachment.name || `Image ${index + 1}`}
                className="object-cover w-full h-full"
                style={{ backgroundImage: `url(${attachment.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
            </div>
          );
        }
        if (attachment.contentType === 'application/pdf') {
          return (
            <div key={index} className="flex items-center p-1.5 text-[10px] text-gray-500 dark:text-gray-400">
              {attachment.name || `PDF ${index + 1}`}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const isUser = message.role === 'user';
  const isShortMessage = message.content.length < 20;

  // Check if message has reasoning content
  const hasReasoning = useMemo(() => {
    // Check for thinking tags in the content
    if (message.content && /<thinking>[\s\S]*?<\/thinking>/.test(message.content)) {
      return true;
    }
    
    // Check for reasoning in message parts 
    if (message.parts?.some(part => part.type === 'reasoning')) {
      return true;
    }
    
    // Check for reasoning in annotations
    if (message.annotations?.some(anno => anno.type === 'reasoning')) {
      return true;
    }
    
    // Check for reasoning in reasoning field (from metadata)
    if ('reasoning' in message) {
      return true;
    }
    
    return false;
  }, [message]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [message.content]);

  const handleLike = useCallback(() => {
    setLiked(!liked);
  }, [liked]);

  // Create a stable ID for this message that won't change during streaming
  const stableId = useMemo(() => 
    message.id || `message-${Math.random().toString(36).substring(2, 11)}`,
  [message.id]);

  return (
    <div 
      className="flex flex-col items-start w-full"
      data-stable-id={stableId}
    >
      {/* Minimalist sender label with better visibility */}
      <div className="flex items-center gap-2 mb-0.5">
        {isUser ? (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            you
          </div>
        ) : (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            assistant
          </div>
        )}
        {isLoading && <LoadingDots />}
      </div>
      
      {/* Ultra-minimalist message container with subtle styling */}
      <div className={`
        group relative px-3 py-1.5 mt-0.5
        ${isUser ? 'bg-gray-50/70 dark:bg-neutral-900/50' : 'bg-gray-50/40 dark:bg-neutral-900/30'} 
        ${isUser ? 'border border-gray-100/50 dark:border-neutral-800/50' : 'border border-gray-100/30 dark:border-neutral-800/30'}
        ${isUser ? 'text-black dark:text-white' : 'text-black dark:text-white'}
        ${isShortMessage ? 'inline-block max-w-max rounded-md' : 'w-[98%] rounded-md'}
      `}>
        {/* Reasoning indicator with larger icon */}
        {!isUser && hasReasoning && (
          <div className="absolute -top-1 -right-1">
            <Brain className="h-3.5 w-3.5 text-gray-500" />
          </div>
        )}
        
        <div>
          {/* Regular markdown content with simplified typography */}
          <div className={`prose prose-sm text-current ${isShortMessage ? 'w-auto' : 'max-w-none'}`}>
            <MemoizedMarkdown content={message.content} id={message.id || stableId} />
          </div>

          {/* Reasoning content section */}
          {hasReasoning && (
            <>
              {/* First try from thinking tags */}
              {message.content && /<thinking>([\s\S]*?)<\/thinking>/.test(message.content) ? (
                <ReasoningSection 
                  key="reasoning-from-thinking"
                  content={(() => {
                    if (!message.content) return '';
                    const match = message.content.match(/<thinking>([\s\S]*?)<\/thinking>/);
                    return match && match[1] ? match[1].trim() : '';
                  })()}
                />
              ) : message.parts?.some(part => part.type === 'reasoning') ? (
                /* Then try message parts */
                <ReasoningSection 
                  key="reasoning-from-parts" 
                  content={message.parts
                    .filter(part => part.type === 'reasoning')
                    .flatMap(part => part.type === 'reasoning' && part.details ? 
                      part.details.map(d => d.type === 'text' ? d.text : '') : [])
                    .join('\n')
                  }
                />
              ) : message.annotations?.some(anno => anno.type === 'reasoning') ? (
                /* Try annotations */
                <ReasoningSection 
                  key="reasoning-from-annotations" 
                  content={message.annotations
                    .filter(anno => anno.type === 'reasoning')
                    .map(anno => anno.content || '')
                    .join('\n')
                  }
                />
              ) : ('reasoning' in message) ? (
                /* Finally try direct reasoning field */
                <ReasoningSection 
                  key="reasoning-from-field" 
                  content={(message as {reasoning: string}).reasoning}
                />
              ) : null}
            </>
          )}

          {/* Attachments */}
          {message.experimental_attachments && (
            <Attachments attachments={message.experimental_attachments} />
          )}

          {/* Minimalist Message Actions with slightly larger icons */}
          <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-sm transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-gray-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-gray-500" />
              )}
            </button>
            {!isUser && (
              <button
                onClick={handleLike}
                className={`p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-sm transition-colors ${liked ? 'text-gray-700' : 'text-gray-500'}`}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}