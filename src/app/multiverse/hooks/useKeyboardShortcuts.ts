import { useEffect } from 'react';

interface KeyboardShortcutProps {
  onNewChat: () => void;
  onStopGeneration: () => void;
  onToggleSidebar: () => void;
  isGenerating: boolean;
}

export function useKeyboardShortcuts({
  onNewChat,
  onStopGeneration,
  onToggleSidebar,
  isGenerating
}: KeyboardShortcutProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K for new chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onNewChat();
      }
      // Escape to stop generation
      if (e.key === 'Escape' && isGenerating) {
        e.preventDefault();
        onStopGeneration();
      }
      // Command/Ctrl + / to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        onToggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating, onNewChat, onStopGeneration, onToggleSidebar]);
}
