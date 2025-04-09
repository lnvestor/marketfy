'use client';

import dynamic from 'next/dynamic';

// Dynamically import the EnhancedChat component to ensure client-side only rendering
const EnhancedChat = dynamic(
  () => import('./enhanced-chat'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex flex-col h-[700px] w-full max-w-5xl mx-auto border rounded-xl shadow-lg bg-white animate-pulse">
        <div className="bg-gray-300 h-24 rounded-t-xl"></div>
        <div className="flex-1 p-6 space-y-6 bg-gray-100">
          <div className="h-16 bg-gray-300 rounded-xl w-3/4"></div>
          <div className="h-16 bg-gray-300 rounded-xl w-2/3 ml-auto"></div>
          <div className="h-16 bg-gray-300 rounded-xl w-4/5"></div>
        </div>
        <div className="h-20 bg-gray-200 rounded-b-xl"></div>
      </div>
    )
  }
);

export default function EnhancedChatWrapper() {
  return <EnhancedChat />;
}