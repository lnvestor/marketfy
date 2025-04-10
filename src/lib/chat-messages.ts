// Use fetch API to call our proxied endpoints instead of Supabase directly

export interface ChatMessage {
  id?: string
  session_id: string
  content: string
  role: 'user' | 'assistant'
  created_at?: string
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
  reasoning?: string
  annotations?: string
}

export async function saveChatMessage(message: ChatMessage) {
  if (!message.session_id) {
    throw new Error('Session ID is required');
  }

  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save chat message');
  }
  
  return await response.json();
}

export async function loadChatMessages(sessionId: string) {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }

  const response = await fetch(`/api/messages?sessionId=${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load chat messages');
  }
  
  return await response.json();
}
