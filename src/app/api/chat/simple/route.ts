import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get API key from environment
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing API key' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Try stream text with error handling
    try {
      const result = streamText({
        model: google('gemini-1.5-pro', { apiKey }),
        messages,
        system: "You are Marketfy's AI assistant specializing in e-commerce and market research.",
      });
      
      return result.toDataStreamResponse();
    } catch (streamError) {
      console.error('Stream error:', streamError);
      
      // If streaming fails, use fallback
      return new Response(
        JSON.stringify({
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm here to help with your product research and market analysis. How can I assist you?",
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Chat API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}