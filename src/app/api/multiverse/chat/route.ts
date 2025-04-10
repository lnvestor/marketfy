import { google } from '@ai-sdk/google';
import { GoogleGenerativeAIProviderMetadata } from '@ai-sdk/google';
import { StreamData, streamText, smoothStream } from 'ai';
import { 
  // NetSuite tools
  createSavedSearchTool, 
  setNetSuiteCredentials,

  // Celigo tools
  setCredentials,
  
  // - Connection tools
  createHttpConnectionTool,
  createNetSuiteConnectionTool,
  
  // - Export tools
  createHttpExportTool,
  createNetSuiteExportTool,
  
  // - Import tools
  createHttpImportTool,
  createNetSuiteImportTool,
  
  // - Integration & Flow tools
  createIntegrationTool,
  createFlowTool,
  
  // - Script tools
  createFilterScriptTool,
  setFilterScriptCredentials,
  
  // Search tools
  createPerplexitySearchTool,
  setSearchCredentials,
  
  // Claude Think tool
  createClaudeThinkTool
} from '../../../../../tools';
import { SYSTEM_PROMPT } from '@/lib/prompts';
import { MessageAnnotation } from '@/app/multiverse/types/chat';

// Increase the timeout for Vercel deployments to handle longer tasks
export const maxDuration = 300; // 5 minutes maximum duration

// Force dynamic behavior to ensure streaming works correctly
export const dynamic = 'force-dynamic';

// Disable edge runtime since it has stricter timeout limits
export const runtime = 'nodejs';

// Set cache control headers
export const fetchCache = 'force-no-store';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('Missing GOOGLE_API_KEY environment variable');
}

/**
 * Process Google AI safety ratings into a standardized format
 * @param safetyRatings The safety ratings from Google Generative AI
 * @returns Processed safety information with risk levels
 */
function processSafetyRatings(safetyRatings: any[]) {
  if (!safetyRatings || !Array.isArray(safetyRatings)) return null;
  
  // Convert Google's probability levels to numeric scores (0-100)
  const getProbabilityScore = (probability: string): number => {
    switch (probability) {
      case 'NEGLIGIBLE': return 0;
      case 'LOW': return 25;
      case 'MEDIUM': return 50;
      case 'HIGH': return 75;
      case 'VERY_HIGH': return 100;
      default: return -1;
    }
  };
  
  // Convert Google's severity levels to numeric scores (0-100)
  const getSeverityScore = (severity: string): number => {
    switch (severity) {
      case 'HARM_SEVERITY_NEGLIGIBLE': return 0;
      case 'HARM_SEVERITY_LOW': return 25;
      case 'HARM_SEVERITY_MEDIUM': return 50;
      case 'HARM_SEVERITY_HIGH': return 75;
      case 'HARM_SEVERITY_EXTREME': return 100;
      default: return -1;
    }
  };
  
  // Calculate overall risk score (0-100)
  const calculateRiskScore = (probability: number, severity: number): number => {
    if (probability < 0 || severity < 0) return -1;
    // Weight probability more than severity in risk calculation
    return Math.min(100, Math.round((probability * 0.7) + (severity * 0.3)));
  };
  
  // Generate user-friendly category names
  const getFriendlyCategoryName = (category: string): string => {
    switch (category) {
      case 'HARM_CATEGORY_HARASSMENT': return 'Harassment';
      case 'HARM_CATEGORY_HATE_SPEECH': return 'Hate Speech';
      case 'HARM_CATEGORY_SEXUALLY_EXPLICIT': return 'Sexually Explicit';
      case 'HARM_CATEGORY_DANGEROUS_CONTENT': return 'Dangerous Content';
      default: return category;
    }
  };
  
  // Process each rating
  const processedRatings = safetyRatings.map(rating => {
    const probabilityScore = rating.probabilityScore 
      ? Math.round(rating.probabilityScore * 100) 
      : getProbabilityScore(rating.probability);
    
    const severityScore = rating.severityScore 
      ? Math.round(rating.severityScore * 100) 
      : getSeverityScore(rating.severity);
    
    const riskScore = calculateRiskScore(probabilityScore, severityScore);
    
    return {
      category: rating.category,
      friendlyName: getFriendlyCategoryName(rating.category),
      probability: rating.probability,
      severity: rating.severity,
      probabilityScore,
      severityScore,
      riskScore,
      blocked: !!rating.blocked
    };
  });
  
  // Calculate overall content risk score
  const overallRiskScore = processedRatings.length > 0
    ? Math.max(...processedRatings.map(r => r.riskScore))
    : 0;
  
  // Determine risk level
  let riskLevel = 'low';
  if (overallRiskScore >= 75) riskLevel = 'critical';
  else if (overallRiskScore >= 50) riskLevel = 'high';
  else if (overallRiskScore >= 25) riskLevel = 'medium';
  
  return {
    ratings: processedRatings,
    overall: {
      riskScore: overallRiskScore,
      riskLevel,
      hasBlockedContent: processedRatings.some(r => r.blocked)
    }
  };
}

function getStatusFromResult(result: unknown): 'in-progress' | 'error' | 'complete' {
  if (!result) return 'in-progress';
  
  // Parse the result if it's a string
  let parsedResult: unknown;
  if (typeof result === 'string') {
    try {
      parsedResult = JSON.parse(result);
    } catch {
      // If it can't be parsed as JSON, use the string directly
      parsedResult = result;
    }
  } else {
    parsedResult = result;
  }
  
  // Check for status property first
  if (parsedResult && typeof parsedResult === 'object') {
    const resultObj = parsedResult as Record<string, unknown>;
    if (resultObj.status === 'error') {
      return 'error';
    }
    if (resultObj.status === 'success') {
      return 'complete';
    }
  }
  
  // Fall back to string checking if no status property
  const resultStr = typeof parsedResult === 'string' 
    ? parsedResult 
    : JSON.stringify(parsedResult);
  
  if (resultStr.includes('"status":"error"') || 
      resultStr.includes('failed') || 
      resultStr.includes('Authentication failed')) {
    return 'error';
  }
  
  return 'complete';
}

export async function POST(req: Request) {
  try {
    // Authentication check using our auth proxy
    const authHeader = req.headers.get('authorization');
    let authenticatedUser;
    
    try {
      // Import the auth proxy dynamically to avoid circular dependencies
      const { validateAuthToken } = await import('./auth-proxy');
      authenticatedUser = await validateAuthToken(authHeader);
      
      console.log('User authenticated successfully:', {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        timestamp: new Date().toISOString()
      });
    } catch (authError) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ 
        error: authError instanceof Error ? authError.message : 'Unauthorized: Authentication failed' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Proceed with the request after authentication is verified
    const { messages, enabledAddons, connections, id, reasoningMode } = await req.json();
    console.log('Chat request received:', {
      userId: authenticatedUser.id,
      messageCount: messages.length,
      enabledAddons,
      reasoningMode: !!reasoningMode,
      timestamp: new Date().toISOString()
    });
    
    // Clear credentials for NetSuite and Celigo, but not Perplexity (core feature)
    setNetSuiteCredentials(null);
    setCredentials(null);
    setFilterScriptCredentials(null);
    
    // Initialize Perplexity with environment variable by default
    // This will be overridden later if Perplexity addon is enabled with a specific key
    setSearchCredentials('perplexity', process.env.PERPLEXITY_API_KEY || null);
    
    // Set credentials for enabled addons if they have valid connections
    if (enabledAddons?.length > 0) {
      // Get NetSuite credentials from connections
      if (enabledAddons.includes('NetSuite') && connections?.NetSuite?.token) {
        console.log('NetSuite addon is enabled, checking connections...');
        
        const netsuiteConnection = connections.NetSuite;
        console.log('Found NetSuite connection:', {
          account_id: netsuiteConnection.account_id,
          hasToken: !!netsuiteConnection.token
        });
        
        setNetSuiteCredentials({
          token: netsuiteConnection.token,
          account_id: netsuiteConnection.account_id
        });
      } else {
        console.log('NetSuite addon not enabled or missing connection');
      }

      // Get Celigo credentials from connections
      if (enabledAddons.includes('Celigo') && connections?.Celigo?.token) {
        console.log('Celigo addon is enabled, checking connections...');
        
        const celigoConnection = connections.Celigo;
        console.log('Found Celigo connection:', {
          hasToken: !!celigoConnection.token
        });
        
        setCredentials(celigoConnection.token);
        setFilterScriptCredentials(celigoConnection.token);
        console.log('Celigo connection setup complete');
      } else {
        console.log('Celigo addon not enabled or missing connection');
      }
  
      // Get Perplexity credentials from connections
      if (enabledAddons.includes('Perplexity') && connections?.Perplexity?.api_key) {
        console.log('Perplexity addon is enabled, checking connections...');
        
        const perplexityConnection = connections.Perplexity;
        console.log('Found Perplexity connection:', {
          hasApiKey: !!perplexityConnection.api_key
        });
        
        setSearchCredentials('perplexity', perplexityConnection.api_key);
        console.log('Perplexity connection setup complete');
      } else {
        console.log('Perplexity addon not enabled or missing connection');
      }
    } else {
      console.log('No addons enabled, skipping credential setup');
    }

    console.log('Received chat request');
    
    // Log environment variables status
    console.log('Environment variables check:', {
      // Google API key (AIza... format)
      googleKeySet: !!process.env.GOOGLE_API_KEY,
      googleKeyLength: process.env.GOOGLE_API_KEY?.length,
      googleKeyFormat: process.env.GOOGLE_API_KEY?.startsWith('AIza') ? 'valid' : 'invalid',
      googleKeyPreview: process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.length > 8 
        ? `${process.env.GOOGLE_API_KEY.substring(0, 6)}...${process.env.GOOGLE_API_KEY.substring(process.env.GOOGLE_API_KEY.length - 4)}`
        : null,
      // Perplexity API key
      perplexityKeySet: !!process.env.PERPLEXITY_API_KEY,
      perplexityKeyLength: process.env.PERPLEXITY_API_KEY?.length,
      perplexityKeyPreview: process.env.PERPLEXITY_API_KEY && process.env.PERPLEXITY_API_KEY.length > 8 
        ? `${process.env.PERPLEXITY_API_KEY.substring(0, 4)}...${process.env.PERPLEXITY_API_KEY.substring(process.env.PERPLEXITY_API_KEY.length - 4)}`
        : null,
      timestamp: new Date().toISOString()
    });
    
    const data = new StreamData();
    let currentText = '';
    const toolStates = new Map<string, { status: string; timestamp: number }>();

    try {
      // Filter out duplicate messages
      interface ChatMessage {
        content: string;
        role: string;
      }

      const uniqueMessages = messages.filter((msg: ChatMessage, index: number, self: ChatMessage[]) =>
        index === self.findIndex((m: ChatMessage) => m.content === msg.content && m.role === msg.role)
      );


      
      const result = streamText({
        model: google('gemini-2.5-pro-exp-03-25'),
        messages: uniqueMessages,
        temperature: 0.5, // Lower temperature for more deterministic responses
        maxTokens: 16000, // Reduce max tokens to avoid approaching limits
        maxSteps: 30, // Reduce max steps but ensure enough for completion
        toolChoice: 'auto',
        experimental_transform: smoothStream({
          delayInMs: 1, // No delay for Vercel deployment
          chunking: 'word', 
        }),
        providerOptions: {
          google: {
            // Enable Search Grounding with dynamic retrieval
            useSearchGrounding: true,
            dynamicRetrievalConfig: {
              mode: 'MODE_DYNAMIC', // Run retrieval only when system decides necessary
              dynamicThreshold: 0.8, // Higher threshold makes search more selective
            },
            // Safety settings
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_ONLY_HIGH'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_ONLY_HIGH'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_ONLY_HIGH'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_ONLY_HIGH'
              }
            ]
          }
        },
      tools: (() => {
        // Initialize empty tools object
        const tools: Record<string, unknown> = {};
        
        // Only add NetSuite tools if NetSuite addon is enabled
        if (enabledAddons?.includes('NetSuite')) {
          console.log('Adding NetSuite tools to the model');
          
          // Add NetSuite tools
          tools.createSavedSearch = {
            ...createSavedSearchTool,
            execute: async (args, options) => {
              try {
                const result = await createSavedSearchTool.execute(args, {
                  toolCallId: options.toolCallId,
                  messages: options.messages
                });
                return JSON.stringify(result);
              } catch (err) {
                return JSON.stringify({
                  status: 'error',
                  error: 'Authentication failed. Please check your NetSuite credentials.',
                  details: err instanceof Error ? {
                    code: 'INVALID_LOGIN_ATTEMPT',
                    message: err.message
                  } : {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unknown error occurred'
                  }
                });
              }
            }
          };
          
          // SuiteQL tool has been removed
        }

        // Only add Celigo tools if Celigo addon is enabled
        if (enabledAddons?.includes('Celigo')) {
          console.log('Adding Celigo tools to the model');
          
          // Add Celigo Connection tools
          tools.createHttpConnection = {
            ...createHttpConnectionTool,
            execute: async (args, options) => {
              try {
                console.log('Executing HTTP connection tool:', {
                  timestamp: new Date().toISOString(),
                  toolCallId: options.toolCallId
                });
                
                const result = await createHttpConnectionTool.execute(args, {
                  toolCallId: options.toolCallId,
                  messages: options.messages
                });

                console.log('HTTP connection tool execution completed:', {
                  timestamp: new Date().toISOString(),
                  status: 'success',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify(result);
              } catch (err) {
                console.error('HTTP connection tool execution failed:', {
                  timestamp: new Date().toISOString(),
                  error: err instanceof Error ? err.message : 'Unknown error',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify({
                  status: 'error',
                  error: 'Authentication failed. Please check your Celigo credentials.',
                  details: err instanceof Error ? {
                    code: 'INVALID_LOGIN_ATTEMPT',
                    message: err.message
                  } : {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unknown error occurred'
                  }
                });
              }
            }
          };

          tools.createNetSuiteConnection = {
            ...createNetSuiteConnectionTool,
            execute: async (args, options) => {
              try {
                console.log('Executing NetSuite connection tool:', {
                  timestamp: new Date().toISOString(),
                  toolCallId: options.toolCallId
                });
                
                const result = await createNetSuiteConnectionTool.execute(args, {
                  toolCallId: options.toolCallId,
                  messages: options.messages
                });

                console.log('NetSuite connection tool execution completed:', {
                  timestamp: new Date().toISOString(),
                  status: 'success',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify(result);
              } catch (err) {
                console.error('NetSuite connection tool execution failed:', {
                  timestamp: new Date().toISOString(),
                  error: err instanceof Error ? err.message : 'Unknown error',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify({
                  status: 'error',
                  error: 'Authentication failed. Please check your NetSuite credentials.',
                  details: err instanceof Error ? {
                    code: 'INVALID_LOGIN_ATTEMPT',
                    message: err.message
                  } : {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unknown error occurred'
                  }
                });
              }
            }
          };
          
          // Add Celigo Export tools
          tools.createHttpExport = {
            ...createHttpExportTool,
            execute: async (args, options) => {
              try {
                console.log('Executing HTTP export tool:', {
                  timestamp: new Date().toISOString(),
                  toolCallId: options.toolCallId
                });
                
                const result = await createHttpExportTool.execute(args, {
                  toolCallId: options.toolCallId,
                  messages: options.messages
                });

                console.log('HTTP export tool execution completed:', {
                  timestamp: new Date().toISOString(),
                  status: 'success',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify(result);
              } catch (err) {
                console.error('HTTP export tool execution failed:', {
                  timestamp: new Date().toISOString(),
                  error: err instanceof Error ? err.message : 'Unknown error',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify({
                  status: 'error',
                  error: 'Authentication failed. Please check your Celigo credentials.',
                  details: err instanceof Error ? {
                    code: 'INVALID_LOGIN_ATTEMPT',
                    message: err.message
                  } : {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unknown error occurred'
                  }
                });
              }
            }
          };

          tools.createNetSuiteExport = {
            ...createNetSuiteExportTool,
            execute: async (args, options) => {
              try {
                console.log('Executing NetSuite export tool:', {
                  timestamp: new Date().toISOString(),
                  toolCallId: options.toolCallId
                });
                
                const result = await createNetSuiteExportTool.execute(args, {
                  toolCallId: options.toolCallId,
                  messages: options.messages
                });

                console.log('NetSuite export tool execution completed:', {
                  timestamp: new Date().toISOString(),
                  status: 'success',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify(result);
              } catch (err) {
                console.error('NetSuite export tool execution failed:', {
                  timestamp: new Date().toISOString(),
                  error: err instanceof Error ? err.message : 'Unknown error',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify({
                  status: 'error',
                  error: 'Authentication failed. Please check your Celigo credentials.',
                  details: err instanceof Error ? {
                    code: 'INVALID_LOGIN_ATTEMPT',
                    message: err.message
                  } : {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unknown error occurred'
                  }
                });
              }
            }
          };
          
          // Add Celigo Import tools
          tools.createHttpImport = {
            ...createHttpImportTool,
            execute: async (args, options) => {
              try {
                console.log('Executing HTTP import tool:', {
                  timestamp: new Date().toISOString(),
                  toolCallId: options.toolCallId
                });
                
                const result = await createHttpImportTool.execute(args, {
                  toolCallId: options.toolCallId,
                  messages: options.messages
                });

                console.log('HTTP import tool execution completed:', {
                  timestamp: new Date().toISOString(),
                  status: 'success',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify(result);
              } catch (err) {
                console.error('HTTP import tool execution failed:', {
                  timestamp: new Date().toISOString(),
                  error: err instanceof Error ? err.message : 'Unknown error',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify({
                  status: 'error',
                  error: 'Authentication failed. Please check your Celigo credentials.',
                  details: err instanceof Error ? {
                    code: 'INVALID_LOGIN_ATTEMPT',
                    message: err.message
                  } : {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unknown error occurred'
                  }
                });
              }
            }
          };

          tools.createNetSuiteImport = {
            ...createNetSuiteImportTool,
            execute: async (args, options) => {
              try {
                console.log('Executing NetSuite import tool:', {
                  timestamp: new Date().toISOString(),
                  toolCallId: options.toolCallId
                });
                
                const result = await createNetSuiteImportTool.execute(args, {
                  toolCallId: options.toolCallId,
                  messages: options.messages
                });

                console.log('NetSuite import tool execution completed:', {
                  timestamp: new Date().toISOString(),
                  status: 'success',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify(result);
              } catch (err) {
                console.error('NetSuite import tool execution failed:', {
                  timestamp: new Date().toISOString(),
                  error: err instanceof Error ? err.message : 'Unknown error',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify({
                  status: 'error',
                  error: 'Authentication failed. Please check your NetSuite credentials.',
                  details: err instanceof Error ? {
                    code: 'INVALID_LOGIN_ATTEMPT',
                    message: err.message
                  } : {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unknown error occurred'
                  }
                });
              }
            }
          };
          
          // Add Celigo Integration & Flow tools
          tools.createIntegration = {
            ...createIntegrationTool,
            execute: async (args, options) => {
              try {
                console.log('Executing integration tool:', {
                  timestamp: new Date().toISOString(),
                  toolCallId: options.toolCallId
                });
                
                const result = await createIntegrationTool.execute(args, {
                  toolCallId: options.toolCallId,
                  messages: options.messages
                });

                console.log('Integration tool execution completed:', {
                  timestamp: new Date().toISOString(),
                  status: 'success',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify(result);
              } catch (err) {
                console.error('Integration tool execution failed:', {
                  timestamp: new Date().toISOString(),
                  error: err instanceof Error ? err.message : 'Unknown error',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify({
                  status: 'error',
                  error: 'Authentication failed. Please check your Celigo credentials.',
                  details: err instanceof Error ? {
                    code: 'INVALID_LOGIN_ATTEMPT',
                    message: err.message
                  } : {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unknown error occurred'
                  }
                });
              }
            }
          };

          tools.createFlow = {
            ...createFlowTool,
            execute: async (args, options) => {
              try {
                console.log('Executing flow tool:', {
                  timestamp: new Date().toISOString(),
                  toolCallId: options.toolCallId
                });
                
                const result = await createFlowTool.execute(args, {
                  toolCallId: options.toolCallId,
                  messages: options.messages
                });

                console.log('Flow tool execution completed:', {
                  timestamp: new Date().toISOString(),
                  status: 'success',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify(result);
              } catch (err) {
                console.error('Flow tool execution failed:', {
                  timestamp: new Date().toISOString(),
                  error: err instanceof Error ? err.message : 'Unknown error',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify({
                  status: 'error',
                  error: 'Authentication failed. Please check your Celigo credentials.',
                  details: err instanceof Error ? {
                    code: 'INVALID_LOGIN_ATTEMPT',
                    message: err.message
                  } : {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unknown error occurred'
                  }
                });
              }
            }
          };
          
          // Add Celigo Filter Script tool
          tools.createFilterScript = {
            ...createFilterScriptTool,
            execute: async (args, options) => {
              try {
                console.log('Executing filter script tool:', {
                  timestamp: new Date().toISOString(),
                  action: args.action,
                  toolCallId: options.toolCallId
                });
                
                const result = await createFilterScriptTool.execute(args, {
                  toolCallId: options.toolCallId,
                  messages: options.messages
                });

                console.log('Filter script tool execution completed:', {
                  timestamp: new Date().toISOString(),
                  status: 'success',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify(result);
              } catch (err) {
                console.error('Filter script tool execution failed:', {
                  timestamp: new Date().toISOString(),
                  error: err instanceof Error ? err.message : 'Unknown error',
                  toolCallId: options.toolCallId
                });

                return JSON.stringify({
                  status: 'error',
                  error: 'Authentication failed. Please check your Celigo credentials.',
                  details: err instanceof Error ? {
                    code: 'INVALID_LOGIN_ATTEMPT',
                    message: err.message
                  } : {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unknown error occurred'
                  }
                });
              }
            }
          };
        }
        
        // Always add Perplexity search tool, regardless of whether the addon is enabled
        // This makes it a core feature that doesn't require addon enabling
        console.log('Adding Perplexity tools to the model as a core feature');
        
        tools.perplexitySearch = {
          ...createPerplexitySearchTool,
          execute: async (args, options) => {
            try {
              console.log('Executing Perplexity search tool:', {
                timestamp: new Date().toISOString(),
                messageCount: args.messages.length,
                firstMessage: args.messages[0]?.content.substring(0, 50) + '...',
                toolCallId: options.toolCallId
              });
              
              // Get credentials from environment or connections
              // If Perplexity addon is enabled, use its connection
              if (enabledAddons?.includes('Perplexity') && connections?.Perplexity?.api_key) {
                setSearchCredentials('perplexity', connections.Perplexity.api_key);
              } else {
                // Otherwise use environment variable (default behavior)
                setSearchCredentials('perplexity', process.env.PERPLEXITY_API_KEY || null);
              }
              
              const result = await createPerplexitySearchTool.execute(args, {
                toolCallId: options.toolCallId,
                messages: options.messages
              });

              console.log('Perplexity search tool execution completed:', {
                timestamp: new Date().toISOString(),
                status: 'success',
                toolCallId: options.toolCallId
              });

              return JSON.stringify(result);
            } catch (err) {
              console.error('Perplexity search tool execution failed:', {
                timestamp: new Date().toISOString(),
                error: err instanceof Error ? err.message : 'Unknown error',
                toolCallId: options.toolCallId
              });

              const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
              
              // Check if the error is related to invalid parameters (like invalid message format)
              if (errorMessage.includes('Validation error') || errorMessage.includes('Invalid')) {
                return JSON.stringify({
                  status: 'error',
                  error: 'Invalid search parameters. ' + errorMessage,
                  details: {
                    code: 'INVALID_PARAMETERS',
                    message: errorMessage
                  }
                });
              }
              
              // Check if the error is an authentication issue
              if (errorMessage.includes('Authentication failed') || errorMessage.includes('API key') || errorMessage.includes('401')) {
                return JSON.stringify({
                  status: 'error',
                  error: 'Authentication failed. Please check your Perplexity API key.',
                  details: {
                    code: 'INVALID_API_KEY',
                    message: errorMessage
                  }
                });
              }
              
              // Default error case
              return JSON.stringify({
                status: 'error',
                error: 'Perplexity search failed: ' + errorMessage,
                details: {
                  code: 'SEARCH_ERROR',
                  message: errorMessage
                }
              });
            }
          }
        };
        
        // Add Claude think tool as a core feature
        console.log('Adding Claude think tool as a core feature');
        
        // Add the think tool directly without manual wrapper to avoid type issues
        tools.think = createClaudeThinkTool;
        
        console.log('Tools registered for enabled addons:', Object.keys(tools));
        return tools;
      })(),
      system: SYSTEM_PROMPT,
      onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
        console.log('Step finished:', {
          hasText: !!text,
          toolCallCount: toolCalls?.length || 0,
          toolResultCount: toolResults?.length || 0,
          finishReason,
          tokenUsage: usage ? `${usage.inputTokens}/${usage.outputTokens}` : 'unknown',
          timestamp: new Date().toISOString()
        });
        
        try {
          // Accumulate text for the final message
          if (text) {
            // Extract thinking content if present
            const thinkingMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/);
            if (thinkingMatch) {
              const thinkingContent = thinkingMatch[1].trim();
              
              // Add reasoning annotation with the thinking content
              const reasoningAnnotation: MessageAnnotation = {
                type: 'reasoning',
                content: thinkingContent,
                notification: {
                  show: false,
                  type: 'inline'
                }
              };
              
              try {
                data.appendMessageAnnotation(reasoningAnnotation);
              } catch (e) {
                console.log('Failed to append reasoning annotation:', e);
              }
              
              // Remove thinking tags from text before adding it
              const cleanedText = text.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
              if (cleanedText) {
                currentText += cleanedText;
              }
            } else {
              // No thinking tags, add text as is
              currentText += text;
            }
            
            // Add text as message annotation
            const textAnnotation: MessageAnnotation = {
              type: 'text',
              content: text.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim(),
              notification: {
                show: false,
                type: 'inline'
              }
            };
            
            try {
              data.appendMessageAnnotation(textAnnotation);
            } catch (e) {
              // If the stream was already closed (likely due to abort), just log and continue
              if (e instanceof Error && e.message.includes('already been closed')) {
                console.log('Stream already closed, skipping text annotation');
                // Stop further processing since the stream is closed
                return;
              } else {
                throw e; // Re-throw any other errors
              }
            }
          }

          // Process tool calls
          if (toolCalls?.length) {
            toolCalls.forEach(toolCall => {
              const now = Date.now();
              const toolState = toolStates.get(toolCall.toolCallId);
              
              // Only send in-progress annotation if we haven't seen this tool before
              if (!toolState) {
                const callAnnotation: MessageAnnotation = {
                  type: 'tool-status',
                  toolCallId: toolCall.toolCallId,
                  status: 'in-progress',
                  toolName: toolCall.toolName || null,
                  args: JSON.stringify(toolCall.args),
                  notification: {
                    show: true,
                    type: 'toast',
                    style: 'minimal'
                  }
                };
                
                try {
                  data.appendMessageAnnotation(callAnnotation);
                } catch (e) {
                  // If the stream was already closed (likely due to abort), just log and continue
                  if (e instanceof Error && e.message.includes('already been closed')) {
                    console.log('Stream already closed, skipping tool call annotation');
                    return; // Stop processing this tool call
                  } else {
                    throw e;
                  }
                }
                
                toolStates.set(toolCall.toolCallId, { 
                  status: 'in-progress', 
                  timestamp: now 
                });
              }
            });
          }

          // Process tool results
          if (toolResults?.length) {
            toolResults.forEach(toolResult => {
              const now = Date.now();
              const newStatus = getStatusFromResult(toolResult.result);
              const toolState = toolStates.get(toolResult.toolCallId);
              const matchingToolCall = toolCalls?.find(tc => tc.toolCallId === toolResult.toolCallId);

              // Send annotation if status changed or it's a final state
              if (!toolState || toolState.status !== newStatus || newStatus === 'error' || newStatus === 'complete') {
                const resultAnnotation: MessageAnnotation = {
                  type: 'tool-status',
                  toolCallId: toolResult.toolCallId,
                  status: newStatus,
                  result: toolResult.result,
                  toolName: matchingToolCall?.toolName || null,
                  notification: {
                    show: true,
                    type: 'toast',
                    style: newStatus === 'error' ? 'detailed' : 'minimal'
                  }
                };
                
                try {
                  data.appendMessageAnnotation(resultAnnotation);
                } catch (e) {
                  // If the stream was already closed (likely due to abort), just log and continue
                  if (e instanceof Error && e.message.includes('already been closed')) {
                    console.log('Stream already closed, skipping tool result annotation');
                    return; // Stop processing this result
                  } else {
                    throw e;
                  }
                }
                
                toolStates.set(toolResult.toolCallId, { 
                  status: newStatus, 
                  timestamp: now 
                });
              }
            });
          }
        } catch (err) {
          console.error('Error in onStepFinish:', err);
          // Don't close the stream here, let the finally block in onFinish handle it
          // If this is an "already closed" error, we can safely ignore it
          if (!(err instanceof Error && err.message.includes('already been closed'))) {
            console.error('Unhandled error in onStepFinish:', err);
          }
        }
      },
      onFinish: async ({ response }) => {
        console.log('Stream finished');
        console.log('Final message:', currentText);
        
        // Extract Google grounding metadata (sources, search queries, etc.)
        if (response.providerMetadata?.google) {
          const metadata = response.providerMetadata.google as GoogleGenerativeAIProviderMetadata;
          
          // Log grounding metadata if available
          if (metadata.groundingMetadata) {
            console.log('Google Search Grounding used:', {
              searchQueries: metadata.groundingMetadata.webSearchQueries || [],
              hasSearchEntryPoint: !!metadata.groundingMetadata.searchEntryPoint,
              supportsCount: metadata.groundingMetadata.groundingSupports?.length || 0
            });
            
            // Add sources annotation
            try {
              const sourcesAnnotation: MessageAnnotation = {
                type: 'sources',
                content: JSON.stringify(metadata.groundingMetadata),
                notification: {
                  show: false,
                  type: 'inline'
                }
              };
              data.appendMessageAnnotation(sourcesAnnotation);
              console.log('Added sources annotation from Google grounding metadata');
            } catch (e) {
              console.log('Failed to append sources annotation:', e);
            }
          }
          
          // Process safety ratings if available
          if (metadata.safetyRatings) {
            // Log original ratings
            console.log('Raw safety ratings:', metadata.safetyRatings);
            
            // Process ratings with our standardization function
            const processedRatings = processSafetyRatings(metadata.safetyRatings);
            
            if (processedRatings) {
              console.log('Safety risk assessment:', {
                riskLevel: processedRatings.overall.riskLevel,
                riskScore: processedRatings.overall.riskScore,
                hasBlockedContent: processedRatings.overall.hasBlockedContent
              });
              
              // Log details about each category's risk
              processedRatings.ratings.forEach(rating => {
                console.log(`${rating.friendlyName}: risk=${rating.riskScore}% ${rating.blocked ? '(BLOCKED)' : ''}`);
              });
              
              // Add safety rating annotation for UI
              try {
                const safetyAnnotation: MessageAnnotation = {
                  type: 'safety-rating',
                  content: JSON.stringify(processedRatings),
                  notification: {
                    show: processedRatings.overall.hasBlockedContent || 
                          processedRatings.overall.riskLevel === 'high' || 
                          processedRatings.overall.riskLevel === 'critical',
                    type: 'toast',
                    style: processedRatings.overall.hasBlockedContent ? 'error' : 
                           processedRatings.overall.riskLevel === 'critical' ? 'error' :
                           processedRatings.overall.riskLevel === 'high' ? 'warning' : 'info'
                  }
                };
                data.appendMessageAnnotation(safetyAnnotation);
                console.log('Added processed safety rating annotation');
              } catch (e) {
                console.log('Failed to append safety rating annotation:', e);
              }
            }
          }
        }
        
        // Note: Image generation is not supported in gemini-1.5-pro-latest
        
        // Legacy reasoning support (from Claude) - kept for backward compatibility
        if (response.reasoning) {
          console.log('Reasoning text available (legacy):', response.reasoning.substring(0, 100) + '...');
          
          try {
            const reasoningAnnotation: MessageAnnotation = {
              type: 'reasoning',
              content: response.reasoning,
              notification: {
                show: false,
                type: 'inline'
              }
            };
            data.appendMessageAnnotation(reasoningAnnotation);
          } catch (e) {
            console.log('Failed to append reasoning annotation:', e);
          }
        }

        try {
          // Check if the stream is already closed before trying to append
          // Add final message annotation with completion status
          const completionAnnotation: MessageAnnotation = {
            type: 'completion-status',
            status: 'complete',
            notification: {
              show: false,
              type: 'inline'
            }
          };
          
          try {
            data.appendMessageAnnotation(completionAnnotation);
          } catch (e) {
            // If the stream was already closed (likely due to abort), just log and continue
            if (e instanceof Error && e.message.includes('already been closed')) {
              console.log('Stream already closed, skipping completion annotation');
            } else {
              throw e;
            }
          }

          // Skip saving messages server-side to avoid RLS issues
          // The client will handle saving messages in the onFinish callback
          
          console.log('Messages completed, client will handle saving:', {
            sessionId: id,
            messageCount: response.messages.length,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          // Only log if not an "already closed" error
          if (!(error instanceof Error && error.message.includes('already been closed'))) {
            console.error('Error saving assistant message:', error);
          }
        } finally {
          try {
            data.close();
          } catch (closeError) {
            // Stream may already be closed by the abort controller
            if (closeError instanceof Error && closeError.message.includes('already been closed')) {
              console.log('Stream already closed in finally block');
            } else {
              console.error('Error closing stream:', closeError);
            }
          }
        }
      }
    });

    // Consume stream to ensure it runs to completion
    result.consumeStream();

    return result.toDataStreamResponse({
      data,
      sendUsage: true,
      sendReasoning: false, // Google doesn't support reasoning mode like Claude
      sendReasoningDetails: false, // Google doesn't support reasoning details
      sendSources: true, // Send sources metadata from Google search
      getErrorMessage: (error: unknown) => {
        const err = error as Error;
        
        // Check if this is an AbortError, which is expected when the user stops the stream
        if (err.name === 'AbortError' || (err.message && err.message.includes('aborted'))) {
          console.log('Stream aborted by user');
          return 'Stream stopped by user';
        }
        
        // Log detailed error information for debugging
        console.error('Stream error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        });
        
        // Check for timeout errors
        if (err.message && (err.message.includes('timeout') || err.message.includes('exceeded'))) {
          console.error('Function execution timeout detected');
          return 'The operation timed out. Please try again with a simpler request or contact support.';
        }
        
        // Check for tool execution errors
        if (err.message && err.message.includes('tool')) {
          return `Tool execution error: ${err.message}`;
        }
        
        return err.message || 'An error occurred';
      }
    });
    
    // Consume stream to ensure it runs to completion
    result.consumeStream();
    
    return result.toDataStreamResponse({
      data,
      sendUsage: true,
      sendReasoning: false,
      sendReasoningDetails: false,
      sendSources: true
    });
  } catch (error) {
    console.error('Chat stream error:', error);
    throw error; // Rethrow to be caught by outer try/catch
  }
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
