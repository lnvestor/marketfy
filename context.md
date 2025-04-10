# Project Architecture Overview

## File Scanning for LLM Context

### Scanning Patterns

1. **Authentication Patterns**
```bash
# Search for auth checks
search_files "supabase\.auth\.getUser"

# Search for auth error handling
search_files "catch \(error\)|throw new Error|console\.error"
```

2. **Database Operations**
```bash
# Search for database queries
search_files "supabase\.from|\.insert\(|\.select\(|\.update\(|\.delete\("

# Search for data types
search_files "interface|type|Database"
```

3. **UI Patterns**
```bash
# Search for styling patterns
search_files "className=.*flex|className=.*grid|className=.*bg-|className=.*rounded"

# Search for form handling
search_files "onSubmit=|<form"
```

4. **Navigation**
```bash
# Search for routing
search_files "router\.push|Link href"

# Search for loading states
search_files "isLoading|setIsLoading|isSubmitting|setIsSubmitting"
```

### Best Practices for File Scanning

1. **Pattern Recognition**
   - Look for consistent patterns
   - Identify common implementations
   - Note variations in usage
   - Document findings

2. **Code Understanding**
   - Analyze file structure
   - Understand dependencies
   - Track data flow
   - Note error handling

3. **Documentation**
   - Update context.md
   - Note key patterns
   - Document best practices
   - Track TODO items

4. **Maintenance**
   - Regular scans
   - Pattern updates
   - Documentation refresh
   - Context improvements

## Recent Updates (2024-02-18)

### Celigo Integration
1. **Tool Structure**
```typescript
// Shared API utilities
export const api = {
  async get<T>(endpoint: string, token: string): Promise<ApiResponse<T>>,
  async post<T>(endpoint: string, token: string, data: any): Promise<ApiResponse<T>>,
  async put<T>(endpoint: string, token: string, data: any): Promise<ApiResponse<T>>,
  async delete<T>(endpoint: string, token: string): Promise<ApiResponse<T>>
};

// Connection types
export type ConnectionConfig = 
  | HttpConnection 
  | FtpConnection 
  | SalesforceConnection 
  | NetSuiteConnection;

// Validation utilities
export function validateRequired<T>(data: T, fields: string[]): void;
export function validateEnum<T>(value: unknown, allowedValues: T[], fieldName: string): void;
```

2. **Connection Management**
```typescript
// Connection tool implementation
export const createConnectionTool = tool<typeof connectionToolJsonSchema, string>({
  description: `Create and manage Celigo connections...`,
  parameters: connectionToolJsonSchema,
  execute: async (args) => {
    // Tool execution with error handling
  }
});

// Credential management
let currentToken: string | null = null;
export const setCredentials = (token: string) => {
  console.log('Setting Celigo credentials:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : null,
    timestamp: new Date().toISOString()
  });
  currentToken = token;
};
```

3. **Logging Pattern**
```typescript
// Addon activation logging
console.log('Fetching Celigo addon ID...', {
  timestamp: new Date().toISOString()
});

console.log('Found Celigo addon ID:', {
  id: addonData.id,
  timestamp: new Date().toISOString()
});

// Connection logging
console.log('Fetching Celigo connection:', {
  addonId: addonData.id,
  timestamp: new Date().toISOString()
});

// Credential logging
console.log('Setting Celigo credentials:', {
  hasToken: true,
  tokenLength: 32,
  tokenPreview: "abcd...wxyz",
  timestamp: new Date().toISOString()
});
```

4. **Route Integration**
```typescript
// In route.ts
if (enabledAddons?.includes('Celigo')) {
  const celigoConnection = connections?.Celigo;
  if (celigoConnection) {
    setCredentials(celigoConnection.token);
  }
}

tools: {
  createConnection: {
    ...createConnectionTool,
    execute: async (args, options) => {
      try {
        console.log('Executing Celigo connection tool:', {
          timestamp: new Date().toISOString(),
          toolCallId: options.toolCallId
        });
        // Tool execution
      } catch (err) {
        console.error('Celigo tool execution failed:', {
          timestamp: new Date().toISOString(),
          error: err instanceof Error ? err.message : 'Unknown error',
          toolCallId: options.toolCallId
        });
      }
    }
  }
}
```

5. **Schema Validation**
```typescript
// Connection schemas
export const httpConnectionSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['http'] },
    name: { type: 'string' },
    http: {
      type: 'object',
      required: ['formType', 'mediaType', 'baseURI', 'auth'],
      properties: {
        formType: { type: 'string', enum: ['http', 'graph_ql'] },
        mediaType: { type: 'string', enum: ['json'] },
        baseURI: { type: 'string' },
        auth: {
          type: 'object',
          required: ['type', 'basic'],
          properties: {
            type: { type: 'string', enum: ['basic'] },
            basic: {
              type: 'object',
              required: ['username', 'password']
            }
          }
        }
      }
    }
  }
};
```

## Database Schema

### Tables
1. **AdminAddons**
```typescript
{
  id: string
  name: string
  description: string
  logo: string
  has_tools: boolean
  has_connection: boolean
  created_at: string
}
```

2. **adminaddonsfeatures**
```typescript
{
  id: string
  addon_id: string
  feature: string
  created_at: string
}
```

3. **connections**
```typescript
{
  id: string
  user_id: string
  addon_id: string
  token: string
  refresh_token: string | null
  account_id: string | null
  created_at: string
  updated_at: string
}
```

## Addon System

### Credential Flow
1. **Toggle Process**
   - Fetch addon UUID from AdminAddons
   - Use UUID to get connection from connections table
   - Store credentials in client state
   - Pass credentials with each chat request

2. **Connection Schema**
```sql
create table public.connections (
  id uuid primary key,
  user_id uuid,
  addon_id uuid references "AdminAddons",
  token text,
  refresh_token text null,
  account_id text null,
  created_at timestamp,
  updated_at timestamp
);
```

3. **Implementation Pattern**
```typescript
// 1. Client-side credential fetch
const { data: addon } = await supabase
  .from('AdminAddons')
  .select('id')
  .eq('name', 'AddonName')
  .single();

const { data: connection } = await supabase
  .from('connections')
  .select('token, account_id')
  .eq('addon_id', addon.id)
  .single();

// 2. Store in state
setConnections({
  [addonName]: connection
});

// 3. Pass to chat API
const chatResponse = await fetch('/api/chat', {
  body: {
    enabledAddons: ['AddonName'],
    connections: {
      AddonName: connection
    }
  }
});
```

4. **Best Practices**
- Fetch credentials only when enabling addon
- Pass credentials with each request
- Clear credentials when disabling
- Handle missing/invalid credentials
- Proper error messages to user

5. **Addon Tool Pattern**
```typescript
// Tool setup
let currentCredentials: Credentials | null = null;

export const setCredentials = (creds: Credentials) => {
  currentCredentials = creds;
};

export const createTool = tool({
  execute: async (args, options) => {
    if (!currentCredentials) {
      throw new Error('Addon not connected');
    }
    // Use credentials for API calls
  }
});

// Usage in chat API
if (enabledAddons.includes('AddonName')) {
  const connection = connections.AddonName;
  setCredentials(connection);
}
```

## Authentication Patterns

### Auth Check Pattern
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) throw new Error('Not authenticated')
```

### Usage Locations
1. chat-sessions.ts
   - createChatSession
   - loadChatSessions
   - updateChatSession
   - deleteChatSession
   - getChatSession

2. addons/page.tsx
   - Form submission
   - Simpler check: `const { data: { user } } = await supabase.auth.getUser()`

### Session Management
1. **Shared Supabase Client**
```typescript
// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

2. **Session Handling**
- Single instance for consistent state
- Used across all components
- Maintains session persistence
- Type-safe operations

3. **Session Verification**
- Check at API call level
- Consistent error handling
- Clear error messages
- Proper redirection

4. **Best Practices**
- Use shared client
- Check auth before operations
- Handle session expiry
- Maintain user context

## UI Patterns

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(true);

// Loading component
if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-zinc-400">Loading...</div>
    </div>
  );
}
```

### Modal Pattern
```tsx
{showModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="relative w-full max-w-xl rounded-3xl bg-zinc-900/90 border border-purple-500/20 backdrop-blur-xl">
      {/* Modal content */}
    </div>
  </div>
)}
```

### Form Pattern
```typescript
<form 
  onSubmit={async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Auth & Operations
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error message'
      });
    } finally {
      setIsSubmitting(false);
    }
  }}
>
```

## Best Practices

### Database Operations
1. Type Safety
   - Use TypeScript interfaces
   - Validate data shapes
   - Handle null cases

2. Security
   - Always filter by user_id
   - Validate permissions
   - Handle auth errors

3. Error Handling
   - Catch all errors
   - Provide feedback
   - Log issues
   - Maintain data integrity

4. Performance
   - Efficient queries
   - Proper indexing
   - Batch operations
   - Connection management

### Implementation Guidelines
1. Use shared utilities
2. Consistent patterns
3. Type safety
4. Error handling
5. Data validation
6. User feedback

## File Organization

```
src/
├── app/          # Pages and routes
├── components/   # Shared components
└── lib/          # Core utilities
    ├── supabase.ts         # Database client
    ├── database.types.ts   # Type definitions
    └── chat-sessions.ts    # Data operations

tools/
├── index.ts                # Tool exports
├── netsuite-saved-search.ts # NetSuite tool
└── celigo/                 # Celigo integration
    ├── connection/         # Connection management
    │   ├── handler.ts      # API handlers
    │   ├── tool.ts         # Tool implementation
    │   ├── types.ts        # Type definitions
    │   └── schemas/        # JSON schemas
    └── shared/             # Shared utilities
        ├── api.ts          # API client
        ├── types.ts        # Common types
        └── validation.ts   # Validation utils
```

## TODO & Future Improvements

1. Database
   - Query optimization
   - Better error handling
   - Data validation
   - Migration system

2. Security
   - Row level security
   - Input validation
   - Auth improvements
   - Audit logging

3. Performance
   - Query optimization
   - Caching strategy
   - Connection pooling
   - Batch operations

4. UI/UX
   - Loading skeletons
   - Error boundaries
   - Accessibility
   - Responsive design

## Notes

- Type-safe database operations
- Consistent query patterns
- Proper error handling
- Security considerations
- Performance optimization
- Data integrity
- User data protection
- Dynamic UI based on database flags
- Centralized configuration through Supabase
- Detailed logging for debugging
- Token management security
- API error handling
- Schema validation
