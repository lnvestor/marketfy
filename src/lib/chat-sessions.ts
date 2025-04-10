// Use fetch API to call our proxied endpoints instead of Supabase directly

export interface ChatSession {
  id: string
  user_id: string
  name: string
  created_at: string
}

export async function createChatSession(name: string) {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create chat session');
  }
  
  return await response.json();
}

export async function loadChatSessions() {
  const response = await fetch('/api/sessions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load chat sessions');
  }
  
  return await response.json();
}

export async function updateChatSession(id: string, updates: { name: string }) {
  const response = await fetch('/api/sessions', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, updates }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update chat session');
  }
  
  return await response.json();
}

export async function deleteChatSession(id: string) {
  const response = await fetch(`/api/sessions?id=${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete chat session');
  }
}

export async function getChatSession(id: string) {
  const response = await fetch(`/api/sessions?id=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    // Skip throwing on 404 (not found) errors
    if (response.status !== 404) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get chat session');
    }
    return null;
  }
  
  return await response.json();
}
