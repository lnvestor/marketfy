import { useChat } from '@ai-sdk/react';
import { useCallback, useState, useEffect, useRef } from 'react';
import { saveChatMessage, loadChatMessages } from '@/lib/chat-messages';
import { createChatSession } from '@/lib/chat-sessions';
import { trackTokenUsage } from '@/lib/user-token-usage';
import { getAuthToken } from '@/lib/supabase';
// Removed useAddons import since we removed that file
import { Attachment, Message } from 'ai';

export function useMultiverseChat(sessionId: string | null, onSessionUpdate: () => void) {
  // Since we removed useAddons, create simple placeholder state
  const isEnabled = false;
  const enabledAddons: string[] = [];
  const connections = {};
  // Add a no-op toggleAddon function
  const toggleAddon = async () => { /* no-op */ };
  const [files, setFiles] = useState<FileList | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);
  const [error, setError] = useState<string | null>(null);
  const [isSettingUpSession, setIsSettingUpSession] = useState(false);
  const [reasoningMode, setReasoningMode] = useState(false);
  const sessionRef = useRef<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  // Load auth token when component mounts
  useEffect(() => {
    const loadToken = async () => {
      const token = await getAuthToken();
      setAuthToken(token);
      if (!token) {
        console.error('Failed to get auth token for chat');
      } else {
        console.log('Auth token loaded successfully');
      }
    };
    loadToken();
  }, []);

  // Debug logging for session state
  useEffect(() => {
    console.log('Session state changed:', {
      providedSessionId: sessionId,
      currentSessionId,
      timestamp: new Date().toISOString()
    });
  }, [sessionId, currentSessionId]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleAiSubmit,
    isLoading: aiLoading,
    error: aiError,
    reload,
    stop,
    status,
    setMessages,
    setInput
  } = useChat({
    api: '/api/multiverse/chat',
    id: currentSessionId || undefined,
    experimental_throttle: 50,
    headers: authToken ? {
      'Authorization': `Bearer ${authToken}`
    } : undefined,
    body: {
      enabledAddons: isEnabled ? enabledAddons : [],
      connections: isEnabled ? connections : {},
      reasoningMode: reasoningMode
    },
    onStartConverting: () => {
      console.log('Starting conversion with addon state:', {
        isEnabled,
        enabledAddons,
        hasConnections: Object.keys(connections).length > 0,
      });
    },
    onError: (error) => {
      console.error('Chat error:', {
        error: error.message,
        sessionId: currentSessionId,
        timestamp: new Date().toISOString()
      });
      setError(error.message);
    },
    onFinish: async (message: Message, metadata) => {
      // Capture session ID early to avoid losing it if component remounts
      const sessionIdToUse = currentSessionId || sessionRef.current;
      
      console.log('Message finished:', {
        currentSessionId,
        refSessionId: sessionRef.current,
        usingSessionId: sessionIdToUse,
        messageId: message.id,
        isSettingUpSession,
        hasAuthToken: !!authToken,
        usage: metadata?.usage,
        hasReasoning: !!metadata?.reasoning,
        hasReasoningParts: message.parts?.some(part => part.type === 'reasoning'),
        timestamp: new Date().toISOString()
      });
      
      // Check if auth token was unavailable - reload if necessary
      if (!authToken) {
        const token = await getAuthToken();
        setAuthToken(token);
        console.log('Auth token refreshed after message completion:', !!token);
      }

      // If we're setting up a session, wait a bit to ensure it's ready
      if (isSettingUpSession) {
        console.log('Waiting for session setup to complete...');
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSettingUpSession(false);
      }
      
      // Use the captured session ID - fallback to any available ID
      const sessionId = sessionIdToUse;
      
      if (!sessionId) {
        console.error('No session ID found, cannot save message');
        setError('Session error: Could not save message');
        return;
      }
      
      // Update sessionRef to match currentSessionId for consistency
      if (sessionRef.current !== currentSessionId) {
        console.log('Updating sessionRef to match currentSessionId:', {
          from: sessionRef.current,
          to: currentSessionId
        });
        sessionRef.current = currentSessionId;
      }
      
      console.log('Attempting to save message to session:', sessionId);
      
      // Add multiple retries for saving the message with usage data
      let retryCount = 0;
      let saved = false;
      
      while (retryCount < 3 && !saved) {
        try {
          // Combine message content, usage data, and reasoning in a single save operation
          const messageData = {
            session_id: sessionId,
            content: message.content,
            role: 'assistant'
          } as {
            session_id: string;
            content: string;
            role: string;
            prompt_tokens?: number;
            completion_tokens?: number;
            total_tokens?: number;
            reasoning?: string;
            annotations?: string;
          };
          
          // Include usage data in the initial save if available
          if (metadata?.usage) {
            messageData.prompt_tokens = metadata.usage.promptTokens;
            messageData.completion_tokens = metadata.usage.completionTokens;
            messageData.total_tokens = metadata.usage.totalTokens;
          }
          
          // Store reasoning if available
          if (metadata?.reasoning) {
            messageData.reasoning = metadata.reasoning;
          }
          
          // Store all parts from the message
          if (message.parts && message.parts.length > 0) {
            console.log('Message has parts:', message.parts);
            const reasoningParts = message.parts.filter(part => part.type === 'reasoning');
            
            if (reasoningParts.length > 0) {
              console.log('Found reasoning parts:', reasoningParts);
              
              // Extract reasoning content from parts
              const reasoningContent = reasoningParts
                .flatMap(part => {
                  if (part.type === 'reasoning') {
                    return part.details
                      .filter(detail => detail.type === 'text')
                      .map(detail => (detail.type === 'text' ? detail.text : ''));
                  }
                  return [];
                })
                .join('\n');
              
              if (reasoningContent) {
                console.log('Extracted reasoning content from parts:', reasoningContent.substring(0, 100) + '...');
                messageData.reasoning = reasoningContent;
              }
            }
          }
          
          // Store annotations from message
          const messageAnnotations = message.annotations || [];
          
          // Check if we have reasoning from metadata but no reasoning annotation
          if (metadata?.reasoning && !messageAnnotations.some(a => a.type === 'reasoning')) {
            // Add a reasoning annotation
            messageAnnotations.push({
              type: 'reasoning',
              content: metadata.reasoning,
              notification: { show: false, type: 'inline' }
            });
          }
          
          if (messageAnnotations.length > 0) {
            console.log('Saving message annotations:', messageAnnotations);
            messageData.annotations = JSON.stringify(messageAnnotations);
          }
          
          const result = await saveChatMessage(messageData);
          
          console.log('Assistant message saved:', {
            sessionId,
            messageId: result?.id,
            hasUsageData: !!metadata?.usage,
            hasReasoning: !!metadata?.reasoning,
            hasAnnotations: messageAnnotations.length > 0,
            retryCount,
            timestamp: new Date().toISOString()
          });
          
          saved = true;
          onSessionUpdate();
        } catch (error) {
          retryCount++;
          
          if (error instanceof Error) {
            if (error.message === 'Not authenticated') {
              console.error('Authentication error when saving message');
              await new Promise(resolve => setTimeout(resolve, 500));
              continue;
            }
            if (error.message === 'Invalid session ID format') {
              console.error('Invalid session format:', sessionId);
              await new Promise(resolve => setTimeout(resolve, 500));
              continue;
            }
          }
          
          console.error(`Error saving assistant message (attempt ${retryCount}/3):`, error);
          
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            setError('Failed to save message after multiple attempts');
          }
        }
      }
      
      // Log usage information
      if (metadata?.usage) {
        console.log('Usage information:', metadata.usage);
        
        // Track token usage for billing if usage data is available
        if (metadata.usage.promptTokens && metadata.usage.completionTokens) {
          try {
            const promptTokens = metadata.usage.promptTokens;
            const completionTokens = metadata.usage.completionTokens;
            
            // Track usage and deduct from user balance
            const remainingBalance = await trackTokenUsage(promptTokens, completionTokens);
            
            console.log('Tracked token usage, remaining balance:', remainingBalance);
          } catch (error) {
            console.error('Failed to track token usage:', error);
          }
        }
      }
    }
  });

  // Define a helper function to load addon credentials
  const ensureCredentials = useCallback(async () => {
    if (!isEnabled || enabledAddons.length === 0) return;
    
    console.log('Ensuring addon credentials are loaded');
    
    // This is a simpler approach - we'll temporarily disable and re-enable addons
    // that don't have connections to force a refresh
    const addonsToRefresh = [];
    
    // Check which addons need refreshing
    for (const addon of enabledAddons) {
      if (!connections[addon]) {
        addonsToRefresh.push(addon);
      }
    }
    
    // Force refresh for each addon that needs it
    for (const addon of addonsToRefresh) {
      try {
        console.log(`Refreshing connection for ${addon}`);
        
        // If the addon is enabled but has no connection, toggle it off and on
        // This will trigger the connection fetching logic in useAddons
        if (enabledAddons.includes(addon)) {
          // Toggle off
          await toggleAddon(addon);
          
          // Small delay to ensure state updates
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Toggle back on
          await toggleAddon(addon);
        }
      } catch (error) {
        console.error(`Error refreshing ${addon} connection:`, error);
      }
    }
  }, [isEnabled, enabledAddons, connections, toggleAddon]);

  const loadMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    setError(null);
    try {
      // Ensure connections are loaded before loading messages
      await ensureCredentials();
      
      const messages = await loadChatMessages(sessionId);
      if (!messages) {
        console.warn('No messages found for session:', sessionId);
        setMessages([]);
        return;
      }
      setMessages(messages.map(msg => {
        // Create base message object
        const messageObj = {
          id: msg.id || msg.created_at,
          content: msg.content,
          role: msg.role
        };
        
        // Add annotations if available
        if (msg.annotations) {
          try {
            const parsedAnnotations = JSON.parse(msg.annotations);
            console.log('Loaded message annotations for message ID:', msg.id, parsedAnnotations);
            Object.assign(messageObj, { annotations: parsedAnnotations });
          } catch (e) {
            console.error('Failed to parse annotations:', e);
          }
        }
        
        // Add reasoning if available (and not already in annotations)
        if (msg.reasoning) {
          console.log('Loaded message reasoning for message ID:', msg.id);
          
          // Add reasoning as a direct property on the message
          Object.assign(messageObj, { reasoning: msg.reasoning });
          
          // Also add as an annotation if there isn't one already
          if (!messageObj.annotations) {
            Object.assign(messageObj, { 
              annotations: [{
                type: 'reasoning',
                content: msg.reasoning,
                notification: { show: false, type: 'inline' }
              }] 
            });
          } else if (!messageObj.annotations.some(a => a.type === 'reasoning')) {
            // If annotations exist but none are reasoning type, add reasoning
            messageObj.annotations.push({
              type: 'reasoning',
              content: msg.reasoning,
              notification: { show: false, type: 'inline' }
            });
          }
        }
        
        return messageObj;
      }));
      setCurrentSessionId(sessionId);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Not authenticated') {
          setError('Please sign in to view messages');
          throw error;
        }
        if (error.message === 'Invalid session ID format' || error.message === 'Session ID is required') {
          setError('Invalid chat session');
          throw error;
        }
      }
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
      throw error;
    }
  }, [setMessages, ensureCredentials]);

  // Update currentSessionId when sessionId prop changes
  useEffect(() => {
    let mounted = true;

    const updateSession = async () => {
      if (!mounted) return;

      // Reload auth token if it's missing
      if (!authToken) {
        const token = await getAuthToken();
        if (token && mounted) {
          setAuthToken(token);
          console.log('Auth token loaded during session update');
        }
      }

      console.log('Session update check:', {
        sessionId,
        currentSessionId,
        sessionRef: sessionRef.current,
        hasMessages: messages.length > 0,
        hasAuthToken: !!authToken,
        timestamp: new Date().toISOString()
      });

      if (sessionId !== currentSessionId) {
        console.log('Session mismatch detected, updating...', {
          from: currentSessionId,
          to: sessionId
        });

        // Reset error state
        setError(null);
        
        // Set both the current session ID and session ref
        setCurrentSessionId(sessionId);
        sessionRef.current = sessionId;

        if (sessionId) {
          try {
            // Clear messages first
            setMessages([]);
            
            console.log('Loading messages for session:', sessionId);
            await loadMessages(sessionId);
          } catch (error) {
            if (!mounted) return;
            
            console.error('Failed to load messages:', error);
            if (error instanceof Error && error.message === 'Not authenticated') {
              setCurrentSessionId(null);
              sessionRef.current = null;
              setMessages([]);
            }
          }
        } else {
          // Clear everything if session is null
          setMessages([]);
          setInput('');
          sessionRef.current = null;
        }
      } else {
        // Even if session ID is unchanged, ensure consistency
        if (sessionRef.current !== currentSessionId) {
          console.log('Fixing inconsistent sessionRef:', {
            currentSessionId,
            sessionRef: sessionRef.current
          });
          sessionRef.current = currentSessionId;
        } else {
          console.log('Session ID unchanged:', currentSessionId);
        }
      }
    };

    // Run immediately to avoid delay
    updateSession();

    return () => {
      mounted = false;
    };
  }, [sessionId, currentSessionId, messages.length, setMessages, setInput, loadMessages, authToken]);


  // Handle addon state changes
  useEffect(() => {
    const handleAddonChange = () => {
      console.log('Addon state changed, preserving session:', {
        currentSessionId,
        sessionRef: sessionRef.current,
        timestamp: new Date().toISOString()
      });
      
      // Always use currentSessionId for consistency, not sessionRef
      if (currentSessionId) {
        // Clear messages first to avoid state confusion
        setMessages([]);
        
        // Make sure connections are refreshed
        ensureCredentials().then(() => {
          // Reload messages for current session
          loadMessages(currentSessionId).catch(err => {
            console.error('Error reloading messages after addon change:', err);
          });
        });
      } else {
        console.log('No active session during addon change');
        // Still refresh connections for new session
        ensureCredentials().catch(err => {
          console.error('Error refreshing connections for new session:', err);
        });
      }
    };

    window.addEventListener('addonStateChanged', handleAddonChange);
    return () => window.removeEventListener('addonStateChanged', handleAddonChange);
  }, [currentSessionId, loadMessages, setMessages, ensureCredentials]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if the event has reasoningMode attached to it
    // This is done in the ChatInput component
    
    // Ensure we have an auth token before proceeding
    if (!authToken) {
      const token = await getAuthToken();
      if (token) {
        setAuthToken(token);
        console.log('Auth token refreshed before submission');
      } else {
        setError('Authentication error: Please refresh the page and try again');
        return;
      }
    }
    
    console.log('Submit attempt:', {
      hasInput: !!input.trim(),
      hasFiles: !!(files && files.length > 0),
      isLoading: aiLoading,
      currentSessionId,
      messagesCount: messages.length,
      hasAuthToken: !!authToken,
      timestamp: new Date().toISOString()
    });
    
    if ((!input.trim() && (!files || files.length === 0)) || aiLoading) return;
    
    setError(null);

    try {
      console.log('Processing submit:', {
        currentSessionId,
        messagesLength: messages.length,
        timestamp: new Date().toISOString()
      });
      
      // Ensure connections are loaded before proceeding
      if (isEnabled && enabledAddons.length > 0) {
        await ensureCredentials();
      }

      // Create new session for first message
      if (!currentSessionId && messages.length === 0) {
        console.log('Creating new session for first message');
        let session;
        try {
          // Clear any previous session first
          setMessages([]);
          sessionRef.current = null;
          
          // Create session and wait for it to be ready
          session = await createChatSession('New Chat');
          const newSessionId = session.id;
          console.log('New session created:', { newSessionId });
          
          // Update session state and wait for it to propagate
          setIsSettingUpSession(true);
          setCurrentSessionId(newSessionId);
          sessionRef.current = newSessionId;
          onSessionUpdate();
          
          // Wait for session state to be ready
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('Session state ready:', { 
            newSessionId,
            timestamp: new Date().toISOString()
          });
          
          // Save user message with retry logic
          let retryCount = 0;
          while (retryCount < 3) {
            try {
              await saveChatMessage({
                session_id: newSessionId,
                content: input,
                role: 'user'
              });
              break; // Success, exit retry loop
            } catch (error) {
              if (error instanceof Error) {
                if (error.message === 'Invalid session ID format') {
                  if (retryCount < 2) {
                    // Wait and retry
                    await new Promise(resolve => setTimeout(resolve, 500));
                    retryCount++;
                    continue;
                  }
                  setError('Invalid chat session');
                  return;
                }
              }
              console.error('Error saving user message:', error);
              setError('Failed to save message');
              return;
            }
          }
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === 'Not authenticated') {
              setError('Please sign in to start a chat');
              return;
            }
          }
          console.error('Error creating chat session:', error);
          setError('Failed to create chat session');
          return;
        }

        // Convert files to attachments and submit
        const attachments = files ? await Promise.all(Array.from(files).map(async file => {
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const url = `data:${file.type};base64,${base64}`;
          return {
            url,
            name: file.name,
            contentType: file.type
          } as Attachment;
        })) : undefined;

        // Submit with attachments - don't add user message to array since API will return it
        console.log('Submitting message with session:', { sessionId: session.id });
        handleAiSubmit(e, {
          experimental_attachments: attachments
        });
      } else if (currentSessionId) {
        console.log('Using existing session:', { currentSessionId });
        // Save user message for existing session
        try {
          await saveChatMessage({
            session_id: currentSessionId,
            content: input,
            role: 'user'
          });
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === 'Not authenticated') {
              setError('Please sign in to send messages');
              return;
            }
            if (error.message === 'Invalid session ID format') {
              setError('Invalid chat session');
              return;
            }
          }
          console.error('Error saving user message:', error);
          setError('Failed to save message');
          return;
        }

        // Check for unsupported file types
        let unsupportedFileFound = false;
        if (files) {
          for (const file of Array.from(files)) {
            // Only allow PDFs and images (not DOCX or other types)
            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
              console.error('Unsupported file type:', file.type, file.name);
              setError(`Unsupported file type: ${file.name}. Only images and PDFs are currently supported.`);
              unsupportedFileFound = true;
              break;
            }
          }
        }
        
        // Only process if all files are supported
        if (unsupportedFileFound) {
          return; // Don't proceed with submission
        }
        
        // Convert files to attachments
        const attachments = files ? await Promise.all(Array.from(files).map(async file => {
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const url = `data:${file.type};base64,${base64}`;
          return {
            url,
            name: file.name,
            contentType: file.type
          } as Attachment;
        })) : undefined;

        // Submit normally - don't add user message to array since API will return it
        handleAiSubmit(e, {
          experimental_attachments: attachments
        });
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError('An error occurred while sending your message');
    }

    setFiles(null);
  }, [input, aiLoading, currentSessionId, handleAiSubmit, onSessionUpdate, files, messages, setMessages, isEnabled, enabledAddons, ensureCredentials, authToken]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  }, [setFiles]);

  // Function to manually refresh the auth token if needed
  const refreshAuthToken = useCallback(async () => {
    const token = await getAuthToken();
    if (token) {
      setAuthToken(token);
      console.log('Auth token manually refreshed');
      return true;
    }
    console.error('Failed to refresh auth token');
    return false;
  }, []);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: aiLoading,
    error: error || aiError,
    reload,
    stop,
    status,
    setMessages,
    loadMessages,
    files,
    handleFileChange,
    reasoningMode,
    setReasoningMode,
    refreshAuthToken, // Expose this function for manual refresh if needed
    hasAuthToken: !!authToken // Expose auth status
  };
}
