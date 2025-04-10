'use client';

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { createChatSession, loadChatSessions } from '@/lib/chat-sessions';
import { useMultiverseChat } from './hooks/useMultiverseChat';
import { useChatSessions } from './hooks/useChatSessions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Menu, Loader2 } from 'lucide-react';
import { ChatSidebar } from './components/layout/ChatSidebar';
import { ChatMessages } from './components/layout/ChatMessages';
import { ChatInput } from './components/layout/ChatInput';
import { ChatWelcome } from './components/layout/ChatWelcome';
import { useSearchParams } from 'next/navigation';

function MultiverseContent() {
  const searchParams = useSearchParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const lastMessageRef = useRef<string | null>(null);

  const {
    sessions,
    selectedSession,
    isLoading,
    searchQuery,
    sidebarCollapsed,
    setSelectedSession,
    setIsLoading,
    setSearchQuery,
    loadSessions,
    handleDeleteChat,
    handleUpdateChatName,
    updateSidebarState
  } = useChatSessions();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: aiLoading,
    error: chatError,
    reload,
    stop,
    status,
    setMessages,
    loadMessages,
    files,
    handleFileChange,
    reasoningMode,
    setReasoningMode,
    refreshAuthToken,
    hasAuthToken
  } = useMultiverseChat(selectedSession, async () => {
    await loadSessions();
    // Ensure the selected session is set after loading sessions
    const sessions = await loadChatSessions();
    if (sessions?.length > 0 && !selectedSession) {
      setSelectedSession(sessions[0].id);
    }
  });

  // Check user balance and initial session on load
  useEffect(() => {
    const initPage = async () => {
      try {
        // Set sidebar to collapsed only on first load, not on refresh
        if (typeof window !== "undefined") {
          const hasInteracted = sessionStorage.getItem('sidebarInteracted');
          if (!hasInteracted) {
            localStorage.setItem('sidebarCollapsed', 'true');
            sessionStorage.setItem('sidebarInteracted', 'false');
            // Force the sidebar to be collapsed via the custom event
            const event = new CustomEvent('sidebarStateChanged', { 
              detail: { collapsed: true } 
            });
            window.dispatchEvent(event);
          }
        }
        
        // Balance check removed
        
        // Check for session param in URL and load that session
        const sessionId = searchParams?.get('session');
        if (sessionId) {
          setSelectedSession(sessionId);
          await loadMessages(sessionId);
          
          // Clear the session parameter from URL to avoid reloading the same session
          // if the user refreshes or navigates back to this page
          if (typeof window !== "undefined" && window.history.replaceState) {
            const url = new URL(window.location.href);
            url.searchParams.delete('session');
            window.history.replaceState({}, document.title, url.toString());
          }
        }
      } catch (error) {
        console.error('Error in init:', error);
      }
    };
    
    initPage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loadMessages]);

  // Super smooth scrolling with streaming content
  useEffect(() => {
    if (messages.length === 0) return;
    
    const container = chatContainerRef.current;
    if (!container) return;
    
    // Create a smooth scrolling function for streaming content
    let scrolling = false;
    const smoothScrollToBottom = () => {
      if (scrolling) return;
      
      scrolling = true;
      
      // Check if we're already near the bottom to avoid interrupting users reading history
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
      const isUserMessage = messages[messages.length - 1]?.role === 'user';
      
      // Always scroll for user messages or if we're already following the chat
      if (isNearBottom || isUserMessage) {
        // Use requestAnimationFrame for smoother animation
        requestAnimationFrame(() => {
          try {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth' 
            });
          } catch (e) {
            console.error('Scroll error:', e);
          }
          
          // Allow scrolling again after animation completes
          setTimeout(() => {
            scrolling = false;
          }, 100);
        });
      } else {
        scrolling = false;
      }
    };
    
    // Set up a MutationObserver to detect content changes in real-time
    const observer = new MutationObserver((mutations) => {
      let hasContentChange = false;
      
      // Check if any of these mutations affected content
      mutations.forEach(mutation => {
        if (
          mutation.type === 'childList' || 
          mutation.type === 'characterData' ||
          mutation.addedNodes.length > 0
        ) {
          hasContentChange = true;
        }
      });
      
      if (hasContentChange) {
        smoothScrollToBottom();
      }
    });
    
    // Start observing the entire chat container for any content changes
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    // Clean up the observer when component unmounts
    return () => {
      observer.disconnect();
    };
  }, [messages.length, messages]);

  const handleNewChat = useCallback(async () => {
    if (aiLoading) return;
    
    // First immediately update UI for better user experience
    setMessages([]);
    setMobileSidebarOpen(false);
    
    // Create loading state
    setIsLoading(true);
    
    // Launch backend operations in the background
    (async () => {
      try {
        // Ensure we have a valid auth token
        if (!hasAuthToken) {
          const tokenRefreshed = await refreshAuthToken();
          if (!tokenRefreshed) {
            console.error('Failed to refresh auth token for new chat');
            throw new Error('Authentication error');
          }
        }
        
        // Create new session
        const session = await createChatSession('New Chat');
        console.log('New session created in page handler:', session.id);
        
        // Force refresh all sessions
        await loadSessions();
        
        // Set the newly created session
        setSelectedSession(session.id);
      } catch (error) {
        console.error('Error creating chat:', error);
        if (error instanceof Error && error.message === 'Not authenticated') {
          setSelectedSession(null);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [aiLoading, loadSessions, setIsLoading, setMessages, setSelectedSession, hasAuthToken, refreshAuthToken]);

  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onStopGeneration: stop,
    onToggleSidebar: () => {
      // Mark that user has interacted with sidebar
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sidebarInteracted', 'true');
      }
      updateSidebarState(!sidebarCollapsed);
    },
    isGenerating: aiLoading
  });

  // Set a timer reference to avoid flashing loading indicators for quick loads
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleSelectChat = useCallback(async (sessionId: string) => {
    // Clear any pending timer
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    try {
      // Switch to the new session immediately
      setSelectedSession(sessionId);
      setMessages([]); // Always clear messages when switching sessions
      setMobileSidebarOpen(false);
      
      // Start a load timer - only show loading UI if it takes longer than 150ms
      let shouldShowLoading = true;
      const loadTimer = setTimeout(() => {
        if (shouldShowLoading) {
          setIsLoading(true);
        }
      }, 150);
      
      // Ensure we have auth token before loading messages
      if (!hasAuthToken) {
        await refreshAuthToken();
      }
      
      // Load the messages for this session
      await loadMessages(sessionId);
      
      // If we loaded quickly, don't show loading state at all
      shouldShowLoading = false;
      clearTimeout(loadTimer);
      setIsLoading(false);
    } catch (error) {
      console.error('Error selecting chat:', error);
      // If loading messages fails, reset selection
      setSelectedSession(null);
      setMessages([]);
      setIsLoading(false);
      // Reload sessions to ensure we have the latest state
      loadSessions().catch(console.error);
    }
  }, [setSelectedSession, loadMessages, setMessages, loadSessions, hasAuthToken, refreshAuthToken, setIsLoading]);

  const handleExampleSelect = useCallback((prompt: string) => {
    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLInputElement>);
  }, [handleInputChange]);

  return (
    <main className="h-screen flex overflow-hidden bg-white dark:bg-neutral-900">
      {/* Credits Dialog removed */}
      
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        selectedSession={selectedSession}
        sidebarCollapsed={sidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        isLoading={isLoading}
        aiLoading={aiLoading}
        searchQuery={searchQuery}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onUpdateChatName={handleUpdateChatName}
        onSearchChange={setSearchQuery}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onToggleCollapse={() => {
          // Mark that user has interacted with sidebar
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('sidebarInteracted', 'true');
          }
          updateSidebarState(!sidebarCollapsed);
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden absolute top-4 left-4 h-10 w-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center z-50"
        >
          <Menu className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        </button>
        
        {/* Top right utilities removed */}
        
        {/* Main Content */}
        <div className="relative flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent pb-20"
            >
              {messages.length === 0 && !selectedSession ? (
                <ChatWelcome
                  onExampleSelect={handleExampleSelect}
                />
              ) : messages.length === 0 && selectedSession && isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="animate-ellipsis tracking-wider text-2xl text-black dark:text-white opacity-60">•</span>
                    <span className="animate-ellipsis delay-300 tracking-wider text-2xl text-black dark:text-white opacity-60">•</span>
                    <span className="animate-ellipsis delay-600 tracking-wider text-2xl text-black dark:text-white opacity-60">•</span>
                  </div>
                </div>
              ) : messages.length === 0 && selectedSession ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="relative w-64 h-64 mb-6">
                    <Image
                      src="/nomessage.png"
                      alt="No messages yet"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start a conversation</p>
                </div>
              ) : (
                <ChatMessages
                  messages={messages}
                  isLoading={aiLoading}
                  error={chatError}
                  onRetry={reload}
                />
              )}
            </div>
            <ChatInput
              input={input}
              isLoading={aiLoading}
              status={status}
              onSubmit={handleSubmit}
              onChange={handleInputChange}
              onStop={stop}
              files={files || undefined}
              onFileChange={handleFileChange}
              reasoningMode={reasoningMode}
              setReasoningMode={setReasoningMode}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MultiVersePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <MultiverseContent />
    </Suspense>
  );
}