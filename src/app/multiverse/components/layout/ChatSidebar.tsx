import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Trash2, X, PanelLeftClose, Settings, LogOut } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { ChatSidebarProps } from '../../types/chat';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from '@/lib/client/user-api';
import { getUserProfile } from '@/lib/client/profile-api';

export function ChatSidebar({
  sessions,
  selectedSession,
  sidebarCollapsed,
  mobileSidebarOpen,
  isLoading,
  aiLoading,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  searchQuery,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onUpdateChatName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSearchChange,
  onMobileClose,
  onToggleCollapse
}: ChatSidebarProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showSearch, setShowSearch] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // State to track if user is admin - removed isAdmin as it was unused
  const [, setIsAdmin] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Use our API function - now also fetch role
        const data = await getUserProfile('full_name, company_logo, role');
        if (data) {
          setProfileImage(data.company_logo || null);
          setUserName(data.full_name || 'User');
          // Check if user has feedback access (admin or feedback_manager)
          setIsAdmin(data.role === 'admin' || data.role === 'feedback_manager');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
    
    // Ensure sidebar starts collapsed in the multiverse page, but only on initial page load
    if (typeof window !== 'undefined' && window.location.pathname.includes('/multiverse')) {
      // Only set initial state, don't override user interaction
      const hasInteracted = sessionStorage.getItem('sidebarInteracted');
      if (!hasInteracted) {
        localStorage.setItem('sidebarCollapsed', 'true');
        sessionStorage.setItem('sidebarInteracted', 'false');
      }
    }
  }, [onToggleCollapse, sidebarCollapsed]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSearchClick = useCallback(() => {
    setShowSearch(true);
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownVisible(prev => !prev);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Sidebar Backdrop */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="lg:hidden fixed inset-0 bg-black/30 z-40"
          />
        )}
      </AnimatePresence>

      {/* Ultra Minimal Sidebar */}
      <div className="flex h-full relative">
        <motion.div 
          initial={false}
          className={`h-full z-50 border-r border-emerald-100 bg-white flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? 'w-14' : 'w-56'
          }`}
        >
        {/* Logo - Show logo.png when expanded, star.png when collapsed */}
        <div className="px-3 py-3 flex items-center justify-center">
          {sidebarCollapsed ? (
            <div className="w-10 h-10 relative">
              <Image src="/integriverse/star.png" alt="Marketfy" width={36} height={36} className="object-contain" />
            </div>
          ) : (
            <div className="h-10 relative flex items-center justify-center">
              <Image src="/integriverse/logo.png" alt="Marketfy" width={120} height={40} className="object-contain" />
            </div>
          )}
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col py-3 px-2">
          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            disabled={isLoading || aiLoading}
            className={`mb-2 flex items-center gap-3 rounded-md p-2 text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            {isLoading ? (
              <div className="animate-pulse h-4 w-4 rounded-full border-[1.5px] border-black border-b-transparent animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            )}
            {!sidebarCollapsed && (
              <span className="text-xs font-medium">
                {isLoading ? (
                  <span className="inline-flex items-center text-black">
                    <span className="animate-ellipsis tracking-wider">.</span>
                    <span className="animate-ellipsis delay-300 tracking-wider">.</span>
                    <span className="animate-ellipsis delay-600 tracking-wider">.</span>
                  </span>
                ) : "New Chat"}
              </span>
            )}
          </button>

          {/* Connections and Marketplace links removed */}
          
        </div>

        {/* Divider */}
        <div className="mx-3 my-2 h-px bg-black/10"></div>

        {/* Chat List Heading */}
        {!sidebarCollapsed && (
          <div className="px-4 py-2 flex items-center justify-between">
            <h3 className="text-xs text-black font-medium uppercase">Chats</h3>
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 min-h-0 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {sessions.map(session => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -5 }}
                onClick={() => onSelectChat(session.id)}
                className={`group p-2 rounded-md cursor-pointer transition-all duration-200 mb-1
                  ${selectedSession === session.id
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-gray-50'
                  } ${sidebarCollapsed ? 'flex justify-center' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'w-8' : ''}`}>
                    <div className={`h-7 w-7 flex items-center justify-center rounded-full overflow-hidden
                      ${selectedSession === session.id 
                        ? 'bg-black text-white' 
                        : 'text-gray-300 bg-gray-50'
                      }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="group/name">
                          <input
                            type="text"
                            value={session.name}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onUpdateChatName(session.id, e.target.value)}
                            className={`text-sm bg-transparent border-none focus:outline-none focus:ring-0 w-full cursor-pointer
                              ${selectedSession === session.id 
                                ? 'text-black font-medium' 
                                : 'text-gray-700'
                              }`}
                          />
                        </div>
                        {session.last_message && (
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{session.last_message}</p>
                        )}
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <button
                      onClick={(e) => onDeleteChat(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {sessions.length === 0 && !sidebarCollapsed && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <MessageSquare className="h-6 w-6 mb-2 opacity-50" />
            <p className="text-sm">No chats yet</p>
            <p className="text-xs mt-1">Click New Chat to start</p>
          </div>
        )}

        {/* Settings (at bottom) */}
        <div className="mt-auto border-t border-gray-100 dark:border-neutral-800 pt-2 pb-4 px-2">
          {/* Requests link removed */}
          
          {/* Feedback link removed */}
          
          <Link 
            href="/settings"
            className={`mt-2 flex items-center gap-3 rounded-md p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            {!sidebarCollapsed && (
              <span className="text-xs">Settings</span>
            )}
          </Link>
          
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className={`mt-2 flex items-center gap-3 rounded-md p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors w-full ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={24}
                    height={24}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              {!sidebarCollapsed && (
                <span className="text-xs">{userName || 'Profile'}</span>
              )}
            </button>
            
            {/* Dropdown menu */}
            {dropdownVisible && (
              <div 
                className="absolute bottom-full left-0 mb-1 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg border border-gray-100 dark:border-neutral-700 overflow-hidden z-50"
              >
                <div className="p-3 border-b border-gray-100 dark:border-neutral-700">
                  <div className="text-xs font-medium text-gray-900 dark:text-white mb-0.5">{userName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userName ? `Signed in` : 'Guest User'}
                  </div>
                </div>
                <div className="py-1">
                  <Link 
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700"
                    onClick={() => setDropdownVisible(false)}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Close Button */}
        {mobileSidebarOpen && !sidebarCollapsed && (
          <button
            onClick={onMobileClose}
            className="lg:hidden absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        </motion.div>
        
        {/* Collapse Button (Outside Sidebar) */}
        <button
          onClick={onToggleCollapse}
          className="h-8 w-8 absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full flex items-center justify-center text-black hover:text-black hover:bg-gray-50 transition-colors shadow-sm z-50"
        >
          <PanelLeftClose className={`h-3.5 w-3.5 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </>
  );
}