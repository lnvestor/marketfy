'use client';

import dynamic from 'next/dynamic';

// Dynamically import the SimpleChat component to ensure it only loads on the client
const SimpleChat = dynamic(
  () => import('@/components/chat/simple-chat'),
  { ssr: false }
);

export default function TestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Simple Chat Test</h1>
      <p className="text-center text-gray-500 mb-8">Testing non-streaming version</p>
      <SimpleChat />
    </div>
  );
}