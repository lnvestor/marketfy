'use client';

import dynamic from 'next/dynamic';
import ChatLoading from './loading';

// Dynamically import the ChatInterface component
// This ensures it only loads on the client side
const ChatInterface = dynamic(
  () => import('./chat-interface'),
  { 
    ssr: false,
    loading: () => <ChatLoading />
  }
);

export default function ChatWrapper() {
  return <ChatInterface />;
}