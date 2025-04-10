import { useState, useCallback, useEffect } from 'react';
import { loadChatSessions, deleteChatSession, updateChatSession, getChatSession } from '@/lib/chat-sessions';
import { ChatSession } from '../types/chat';

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Store sidebar state in state - true means collapsed
  // Force it to start collapsed
  const [sidebarState, setSidebarState] = useState(true); // Default to collapsed
  
  // Initialize from localStorage on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // If no saved state exists, set a default value of true (collapsed)
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState === null) {
        localStorage.setItem('sidebarCollapsed', 'true');
        setSidebarState(true);
      } else {
        setSidebarState(savedState === 'true');
      }
    }
  }, []);

  const loadSessions = useCallback(async () => {
    setError(null);
    try {
      const data = await loadChatSessions();
      setSessions(data || []);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Not authenticated') {
          setError('Please sign in to view your chats');
          setSessions([]);
          return;
        }
      }
      console.error('Error loading sessions:', error);
      setError('Failed to load chat sessions');
      setSessions([]);
    }
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Validate selected session exists
  useEffect(() => {
    if (selectedSession) {
      getChatSession(selectedSession).then(session => {
        if (!session) {
          setSelectedSession(null);
        }
      }).catch(() => {
        setSelectedSession(null);
      });
    }
  }, [selectedSession]);

  const handleDeleteChat = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    
    // Update UI immediately
    setSessions(prevSessions => prevSessions.filter(session => session.id !== id));
    if (selectedSession === id) {
      setSelectedSession(null);
    }
    
    // Then perform the actual deletion in the background
    try {
      await deleteChatSession(id);
      // Don't reload sessions after successful deletion as this causes the UI flicker
      // The UI is already updated properly with the filter above
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Not authenticated') {
          setError('Please sign in to delete chats');
          return;
        }
      }
      console.error('Error deleting chat:', error);
      setError('Failed to delete chat');
      // Reload sessions to restore the UI state if deletion failed
      await loadSessions();
    }
  }, [selectedSession, loadSessions]);

  const handleUpdateChatName = useCallback(async (id: string, name: string) => {
    setError(null);
    
    // Update UI immediately
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session.id === id ? { ...session, name } : session
      )
    );
    
    // Then perform the actual update
    try {
      await updateChatSession(id, { name });
      await loadSessions();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Not authenticated') {
          setError('Please sign in to update chat names');
          return;
        }
      }
      console.error('Error updating chat name:', error);
      setError('Failed to update chat name');
      // Reload sessions to restore the UI state if update failed
      await loadSessions();
    }
  }, [loadSessions]);

  const filteredSessions = sessions.filter(session => 
    session.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update localStorage when sidebar state changes
  const updateSidebarState = useCallback((collapsed: boolean) => {
    setSidebarState(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(collapsed));
      
      // Also dispatch a custom event so other pages can react
      const event = new CustomEvent('sidebarStateChanged', { detail: { collapsed } });
      window.dispatchEvent(event);
    }
  }, []);

  return {
    sessions: filteredSessions,
    selectedSession,
    isLoading,
    searchQuery,
    error,
    sidebarCollapsed: sidebarState,
    setSelectedSession,
    setIsLoading,
    setSearchQuery,
    loadSessions,
    handleDeleteChat,
    handleUpdateChatName,
    updateSidebarState
  };
}
