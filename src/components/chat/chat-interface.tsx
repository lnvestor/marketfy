'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, status, error } = useChat({
    api: '/api/chat',
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto border rounded-lg shadow-md">
      <div className="bg-gray-50 p-4 border-b">
        <h2 className="text-lg font-semibold">Product Assistant</h2>
        <p className="text-sm text-gray-500">Ask about products, trends, or market data</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>👋 How can I help you today?</p>
            <p className="text-sm mt-2">Try asking about products, market trends, or use the search tool.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id}>
            <div 
              className={`p-4 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white ml-auto max-w-[80%]' 
                  : 'bg-gray-200 text-gray-800 max-w-[80%]'
              }`}
            >
              {/* Render message parts for handling tool calls */}
              {message.parts.map((part, idx) => {
                if (part.type === 'text') {
                  return <div key={idx}>{part.text}</div>;
                }
                
                if (part.type === 'tool-call') {
                  return (
                    <div key={idx} className="text-xs text-gray-600 italic mt-1">
                      Using tool: {part.name}
                    </div>
                  );
                }
                
                if (part.type === 'tool-result') {
                  // Convert tool result to readable format
                  const result = part.result ? JSON.stringify(part.result, null, 2) : 'No result';
                  return (
                    <div key={idx} className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      <div className="font-semibold">Tool Result:</div>
                      <pre className="whitespace-pre-wrap">{result}</pre>
                    </div>
                  );
                }
                
                return null;
              })}
            </div>
          </div>
        ))}
        
        {status === 'streaming' && (
          <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-[80%] flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg max-w-[80%] mt-2">
            <p className="font-semibold">Error</p>
            <p className="text-sm">Something went wrong. Please try again.</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form 
        onSubmit={handleSubmit} 
        className="p-4 border-t flex gap-2"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask something about products..."
          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:outline-none"
          disabled={status === 'streaming'}
        />
        <button 
          type="submit" 
          disabled={status !== 'ready' || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}