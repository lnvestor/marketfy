import { Send, StopCircle, Paperclip, X, Brain, Upload } from 'lucide-react';
// useRouter and Dialog removed as they were unused
import { ChatInputProps } from '../../types/chat';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export function ChatInput({ input, isLoading, onSubmit, onChange, files, onFileChange, status, reasoningMode, setReasoningMode }: ChatInputProps) {
  // router removed as it was unused
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Setup drag and drop handlers
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
    
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0 && onFileChange) {
        // Create a synthetic event with the dropped files
        const syntheticEvent = {
          target: {
            files: e.dataTransfer.files
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onFileChange(syntheticEvent);
      }
    };
    
    // Add event listeners
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragenter', handleDragEnter);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    
    // Clean up event listeners
    return () => {
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('dragenter', handleDragEnter);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, [onFileChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFirstMessage) {
      setIsFirstMessage(false);
    }
    
    // Add reasoning mode info to the formEvent for the parent component
    Object.assign(e, { reasoningMode });
    
    await onSubmit(e);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      onFileChange?.({ target: { files: null } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Standard chat input
  return (
    <>
      <div 
        ref={dropAreaRef}
        className={`relative p-4 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-40
          ${isDragging ? 'ring-1 ring-teal-400/30' : ''}`}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="p-3 flex items-center gap-2">
              <Upload className="h-4 w-4 text-teal-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Drop to upload</span>
            </div>
          </div>
        )}
        
        <form onSubmit={!isLoading ? handleSubmit : (e) => e.preventDefault()} className="relative max-w-3xl mx-auto flex flex-col gap-2 w-full">
          {/* File Preview */}
          {files && files.length > 0 && (
            <div className="p-2 mb-2">
              <div className="flex items-center gap-2 overflow-x-auto">
                {Array.from(files).map((file, index) => (
                  <div key={index} className="relative group flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <div className="relative h-14 w-14 rounded-md overflow-hidden">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : file.type === 'application/pdf' ? (
                      <div className="h-14 w-14 rounded-md bg-gray-50 dark:bg-neutral-800 flex items-center justify-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">PDF</span>
                      </div>
                    ) : file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                       file.name.endsWith('.docx') ? (
                      <div className="h-14 w-14 rounded-md bg-gray-50 dark:bg-neutral-800 flex items-center justify-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">DOCX</span>
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-md bg-gray-50 dark:bg-neutral-800 flex items-center justify-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{file.name.slice(0, 8)}...</span>
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={clearFiles}
                        className="h-5 w-5 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm"
                      >
                        <X className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex-1 flex items-center">
              <div className="relative flex-1 max-w-full">
                {/* Message Input */}
                <div className={`w-full flex-1 relative rounded-md overflow-hidden 
                  ${reasoningMode 
                    ? 'border border-black/20 dark:border-white/20' 
                    : 'border border-gray-200 dark:border-neutral-800'
                  } 
                  transition-all duration-200 bg-white dark:bg-neutral-900 overflow-hidden`}
                >
                {reasoningMode && (
                  <div className="absolute top-0 left-0 h-0.5 w-full bg-black dark:bg-white"></div>
                )}
                
                {/* Gradient fade for text overflow */}
                <div className="absolute right-[72px] top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white dark:to-neutral-900 pointer-events-none"></div>
                
                <input
                  value={input}
                  onChange={onChange}
                  placeholder={reasoningMode ? "Ask with step-by-step reasoning..." : "Start typing..."}
                  className={`w-full h-11 px-4 pr-24 text-sm ${reasoningMode ? 'text-black dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'} placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent focus:outline-none transition-all overflow-x-hidden text-ellipsis`}
                  disabled={isLoading}
                />
                
                {/* Right-side Buttons */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10 bg-white dark:bg-neutral-900 pl-1">
                  {/* Attachment */}
                  <label className="p-1 rounded-md text-gray-400 hover:text-teal-500 transition-colors cursor-pointer">
                    <Paperclip className="h-4 w-4" />
                    <input
                      type="file"
                      className="sr-only"
                      onChange={onFileChange}
                      accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                      multiple
                      ref={fileInputRef}
                    />
                  </label>
                  
                  {/* Reasoning toggle */}
                  <button
                    type="button"
                    onClick={() => setReasoningMode(!reasoningMode)}
                    className={`p-1 rounded-md transition-colors
                      ${reasoningMode 
                        ? 'text-black dark:text-white' 
                        : 'text-gray-400 hover:text-black dark:hover:text-white'
                      }`}
                  >
                    <Brain className="h-4 w-4" />
                  </button>
                
                  {/* Action Button */}
                  {(status === 'streaming' || status === 'submitted' || isLoading) ? (
                    <button
                      type="button"
                      onClick={() => stop()}
                      className="ml-1 flex items-center justify-center rounded-md bg-red-50 dark:bg-red-900/10 px-2 py-1.5 text-xs text-red-600 dark:text-red-400"
                    >
                      <StopCircle className="h-3.5 w-3.5 mr-1" />
                      Stop
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim() && (!files || files.length === 0)}
                      className="ml-1 rounded-md bg-white dark:bg-neutral-900 p-1.5 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                  </div>
                </div>
              </div>
            </div>
          </form>
      </div>
    </>
  );
}