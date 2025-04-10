import { Menu } from 'lucide-react';
import { ChatHeaderProps } from '../../types/chat';

export function ChatHeader({ onMobileMenuOpen }: ChatHeaderProps) {
  return (
    <div className="relative h-[4.5rem] px-4 bg-[#0c0a09]/80 backdrop-blur-sm border-b border-white/10 flex items-center">
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center"
      >
        <Menu className="h-5 w-5 text-white/70" />
      </button>
    </div>
  );
}
