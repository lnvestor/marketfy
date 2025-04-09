import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { allTools } from '@/lib/tools';
import { MODELS, SYSTEM_PROMPTS } from '@/lib/ai-config';

export const runtime = 'edge';

// We're using a non-streaming approach to avoid compatibility issues
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Get API key
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!googleApiKey) {
      console.error("API key is missing!");
      return new Response(
        JSON.stringify({ error: 'Google AI API key is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use generateText instead of streamText to avoid streaming issues
    const { text, toolCalls } = await generateText({
      model: google('gemini-1.5-pro', { apiKey: googleApiKey }),
      messages,
      system: `You are Marketfy's AI assistant specializing in e-commerce and market research. 
      You help entrepreneurs and sellers find winning products and understand market trends. 
      Be concise, data-driven, and provide actionable insights. 
      When appropriate, use the available tools to search for product information.`,
      tools: allTools,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Create a response that mimics a streaming format but delivers everything at once
    const assistantMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: text,
      createdAt: new Date(),
    };

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        toolCalls: toolCalls || []
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in chat API:', error);
    
    // More detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request', 
        details: errorMessage 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}