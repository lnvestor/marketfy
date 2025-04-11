import { JSONValue, MessagePart } from 'ai';

export type NotificationType = 'success' | 'error' | 'loading';
export type NotificationPosition = 'top-right' | 'bottom-right';
export type NotificationStyle = 'minimal' | 'detailed';

export type TimelineItemStatus = 'in-progress' | 'complete' | 'error';

export type TimelineItem = {
  id: string;
  toolCallId: string;
  toolName: string;
  status: TimelineItemStatus;
  timestamp: number;
  title: string;
  message?: string;
  error?: string;
  result?: string | Record<string, unknown>;
};

export type ToolNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  toolName: string;
  toolCallId: string;
  timestamp: number;
  duration?: number;
  position?: NotificationPosition;
  style?: NotificationStyle;
};

export type MessageAnnotation = {
  type: 'text' | 'tool-status' | 'completion-status' | 'reasoning';
  content?: string;
  toolCallId?: string;
  status?: 'in-progress' | 'complete' | 'error';
  toolName?: string | null;
  args?: string;
  result?: string | Record<string, unknown>;
  notification?: {
    show: boolean;
    type: 'toast' | 'inline';
    style?: NotificationStyle;
  };
} & { [key: string]: JSONValue | null };

export interface ToolState {
  toolCallId: string;
  toolName: string;
  status: 'in-progress' | 'complete' | 'error';
  args?: string;
  result?: string | Record<string, unknown>;
  notification?: {
    show: boolean;
    type: 'toast' | 'inline';
    style?: NotificationStyle;
  };
}

export interface ChatInputProps {
  input: string;
  isLoading: boolean;
  status?: 'submitted' | 'streaming' | 'ready' | 'error';
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStop?: () => void;
  files?: FileList | null;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reasoningMode?: boolean;
  setReasoningMode?: (enabled: boolean) => void;
}

export interface ChatMessagesProps {
  messages: Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    annotations?: MessageAnnotation[];
    parts?: MessagePart[];
  }>;
  isLoading?: boolean;
  error?: string | Error | null;
  onRetry?: () => void;
}
