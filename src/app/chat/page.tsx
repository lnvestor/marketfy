import EnhancedChatWrapper from '@/components/chat/enhanced-chat-wrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketfy AI Assistant | Product Research & Market Analysis',
  description: 'Chat with our AI-powered assistant to discover winning products and analyze market trends for your e-commerce business',
};

export default function ChatPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-5xl mx-auto mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
          Marketfy AI Assistant
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your intelligent product research companion. Ask questions about market trends, discover winning products, 
          and get data-driven insights for your business.
        </p>
      </div>
      
      <EnhancedChatWrapper />
      
      <div className="mt-10 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4">Powered by Advanced AI</h2>
        <p className="text-gray-600">
          Our assistant leverages Google's Gemini model to provide accurate, real-time information about products and markets.
          Try asking complex questions or using our specialized research tools.
        </p>
      </div>
    </div>
  );
}