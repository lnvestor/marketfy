'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';

export default function EnhancedChat() {
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    status, 
    error,
    isLoading 
  } = useChat({
    api: '/api/chat/simple', // Use the simple non-streaming API
    initialMessages: [],
    // Add error handling
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input on initial load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col h-[700px] w-full max-w-5xl mx-auto border rounded-xl shadow-lg bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl">
        <h2 className="text-2xl font-bold">Marketfy Assistant</h2>
        <p className="opacity-80">Ask about products, market trends, or use our research tools</p>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-20 h-20 mb-6 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700">How can I help with your business?</h3>
            <p className="text-gray-500 mt-2 max-w-md">
              Try asking about product research, market trends, or specific products to analyze.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-3 rounded-lg border shadow-sm">
                "Find me trending electronics under $200"
              </div>
              <div className="bg-white p-3 rounded-lg border shadow-sm">
                "What are the best-selling kitchen products?"
              </div>
              <div className="bg-white p-3 rounded-lg border shadow-sm">
                "Analyze the market for fitness equipment"
              </div>
              <div className="bg-white p-3 rounded-lg border shadow-sm">
                "Compare wireless headphones in the $100 range"
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div 
              className={`p-5 rounded-2xl ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white ml-auto max-w-[85%] shadow-md' 
                  : 'bg-white border border-gray-200 shadow-sm max-w-[85%]'
              }`}
            >
              {message.content}
            </div>
            
            {/* Role indicator */}
            <div 
              className={`text-xs text-gray-500 mt-1 mb-2 ${
                message.role === 'user' ? 'text-right mr-2' : 'ml-2'
              }`}
            >
              {message.role === 'user' ? 'You' : 'Marketfy Assistant'}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {(status === 'streaming' || status === 'submitted') && (
          <div className="flex flex-col">
            <div className="bg-white border border-gray-200 p-4 rounded-2xl max-w-[85%] shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1 ml-2">Marketfy Assistant</div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="flex flex-col">
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl max-w-[85%]">
              <p className="font-semibold">Error</p>
              <p className="text-sm">Something went wrong with the connection. Please try again.</p>
            </div>
            <div className="text-xs text-gray-500 mt-1 ml-2">System</div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form 
        onSubmit={handleSubmit} 
        className="p-6 border-t bg-white rounded-b-xl"
      >
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me anything about products and markets..."
            className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-base"
            disabled={isLoading || status !== 'ready'}
          />
          <button 
            type="submit" 
            disabled={isLoading || status !== 'ready' || !input.trim()}
            className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {/* Status indicator */}
        <div className="mt-2 text-xs text-gray-500 px-2">
          {(status === 'streaming' || status === 'submitted') && 'Processing your request...'}
          {status === 'ready' && 'Ready for your question'}
          {status === 'error' && 'An error occurred. Please try again.'}
        </div>
      </form>
    </div>
  );
}