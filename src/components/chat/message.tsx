'use client';

import { Message, MessageRole } from '@ai-sdk/ui-utils';

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  message?: Message;
  isLoading?: boolean;
}

export function ChatMessage({ role, content, message, isLoading }: ChatMessageProps) {
  return (
    <div
      className={`flex ${
        role === 'user' ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        {content ? (
          <div className="prose prose-sm dark:prose-invert">
            {/* If message has parts, render them */}
            {message?.parts && message.parts.length > 0 ? (
              <>
                {message.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return <div key={index}>{part.text}</div>;
                  }
                  if (part.type === 'tool-call') {
                    return (
                      <div key={index} className="p-2 my-2 bg-black/5 dark:bg-white/5 rounded-md text-xs">
                        <div className="font-semibold">Using tool: {part.name}</div>
                        <pre className="overflow-auto p-1 mt-1">
                          {JSON.stringify(part.parameters, null, 2)}
                        </pre>
                      </div>
                    );
                  }
                  if (part.type === 'tool-result') {
                    return (
                      <div key={index} className="p-2 my-2 bg-black/5 dark:bg-white/5 rounded-md text-xs">
                        <div className="font-semibold">Tool result:</div>
                        <pre className="overflow-auto p-1 mt-1">
                          {JSON.stringify(part.result, null, 2)}
                        </pre>
                      </div>
                    );
                  }
                  return null;
                })}
              </>
            ) : (
              // Fallback to content if no parts
              content
            )}
          </div>
        ) : (
          isLoading && (
            <div className="flex space-x-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground animation-delay-200"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground animation-delay-500"></div>
            </div>
          )
        )}
      </div>
    </div>
  );
}