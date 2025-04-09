export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Extract the last user message for a simple response
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage?.content || '';
    
    // Generate a simple response without using AI
    let response = "I'm your product assistant. How can I help you today?";
    
    if (userQuery.toLowerCase().includes('product')) {
      response = "I can help you find the best products for your business. What category are you interested in?";
    } else if (userQuery.toLowerCase().includes('trend')) {
      response = "Current trends include sustainable products, smart home devices, and wellness items. Which would you like to explore?";
    } else if (userQuery.toLowerCase().includes('price') || userQuery.toLowerCase().includes('cost')) {
      response = "I can help you find products at various price points. What's your budget range?";
    } else if (userQuery.toLowerCase().includes('electronic') || userQuery.toLowerCase().includes('tech')) {
      response = "Popular electronics include wireless earbuds, portable chargers, and smart home devices. Would you like details on any of these?";
    }
    
    // Create a response
    return new Response(
      JSON.stringify({ 
        message: {
          id: Date.now().toString(),
          role: 'assistant',
          content: response,
          createdAt: new Date()
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Basic chat API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process your request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}