import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';
import { ToolNotification, NotificationType } from '@/app/multiverse/types/chat';

interface ToolNotificationsProps {
  notifications: ToolNotification[];
  onDismiss?: (id: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <Check className="h-4 w-4 text-green-400" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-400" />;
    case 'loading':
      return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
  }
};

const getNotificationStyle = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/10 border-green-500/20';
    case 'error':
      return 'bg-red-500/10 border-red-500/20';
    case 'loading':
      return 'bg-blue-500/10 border-blue-500/20';
  }
};

function ToolToast({ notification, onDismiss }: { notification: ToolNotification; onDismiss?: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`
        relative rounded-lg border backdrop-blur-sm overflow-hidden
        ${getNotificationStyle(notification.type)}
      `}
    >
      <div className="flex items-center gap-3 p-3">
        <div className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center`}>
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-white/90">{notification.title}</div>
          <div className="text-xs text-white/70 truncate">{notification.message}</div>
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(notification.id)}
            className="flex-shrink-0 p-1 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-white/50" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function ToolNotifications({ notifications, onDismiss }: ToolNotificationsProps) {
  if (!notifications.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 min-w-[300px] max-w-[400px]">
      <AnimatePresence mode="popLayout">
        {notifications.map(notification => (
          <ToolToast
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function InlineToolNotification({ notification }: { notification: ToolNotification }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`
        rounded-lg border backdrop-blur-sm overflow-hidden mt-2
        ${getNotificationStyle(notification.type)}
      `}
    >
      <div className="flex items-center gap-3 p-3">
        <div className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center`}>
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-white/90">{notification.title}</div>
          <div className="text-xs text-white/70">{notification.message}</div>
        </div>
      </div>
    </motion.div>
  );
}
