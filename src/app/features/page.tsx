'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { loadChatSessions } from '@/lib/chat-sessions';
import { ChatSidebar } from '@/app/multiverse/components/layout/ChatSidebar';
import { AddonToggle } from '@/app/multiverse/components/layout/AddonToggle';
import { UsagePill } from '@/app/multiverse/components/layout/UsagePill';
import { BalancePill } from '@/app/multiverse/components/layout/BalancePill';
import { FeedbackButton } from '@/app/multiverse/components/layout/FeedbackButton';

export default function FeaturesPage() {
  const [activeSection, setActiveSection] = useState<string>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<Array<{ id: string; name: string }>>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  
  // Load chat sessions for the sidebar
  useEffect(() => {
    loadChatSessions().then(sessions => {
      if (sessions) setChatSessions(sessions);
    });
  }, []);
  
  const features = [
    {
      id: 'chat',
      title: 'Advanced Chat',
      description: 'Communicate with AI using natural language, with support for images, PDFs, and step-by-step reasoning.',
      status: 'released',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    },
    {
      id: 'connections',
      title: 'System Connections',
      description: 'Connect to NetSuite, Celigo, and other enterprise systems for real-time data access.',
      status: 'released',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      )
    },
    {
      id: 'addons',
      title: 'Add-ons Marketplace',
      description: 'Extend the base capabilities with specialized tools for your business processes.',
      status: 'released',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      )
    },
    {
      id: 'reasoning',
      title: 'Step-by-Step Reasoning',
      description: 'Get detailed explanations of how the AI arrives at its conclusions.',
      status: 'released',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4h20"></path>
          <path d="M2 9.5h20"></path>
          <path d="M2 15h20"></path>
          <path d="M2 20h20"></path>
        </svg>
      )
    },
    {
      id: 'dashboard',
      title: 'Analytics Dashboard',
      description: 'View your usage patterns, token consumption, and system metrics.',
      status: 'released',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      )
    },
    {
      id: 'multimodal',
      title: 'Multi-Modal Input',
      description: 'Chat with PDF documents, images, and text-based files for comprehensive analysis.',
      status: 'released',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      )
    },
    {
      id: 'teams',
      title: 'Team Collaboration',
      description: 'Share AI sessions with teammates and collaborate on complex workflows.',
      status: 'upcoming',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="10" r="3"></circle>
          <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
        </svg>
      )
    },
    {
      id: 'automation',
      title: 'Workflow Automation',
      description: 'Create automated processes that combine AI with your business systems.',
      status: 'upcoming',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      )
    }
  ];
  
  const filteredFeatures = activeSection === 'all' 
    ? features 
    : features.filter(f => f.status === activeSection);
  
  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-neutral-900">
      {/* Sidebar with loaded chat sessions */}
      <ChatSidebar
        sessions={chatSessions}
        selectedSession={selectedSession}
        sidebarCollapsed={sidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        isLoading={false}
        aiLoading={false}
        searchQuery=""
        onNewChat={() => window.location.href = '/multiverse'}
        onSelectChat={(sessionId) => window.location.href = `/multiverse?session=${sessionId}`}
        onDeleteChat={async (sessionId, e) => {
          if (e) e.stopPropagation();
          try {
            await supabase.from('chat_sessions').delete().eq('id', sessionId);
            setChatSessions(chatSessions.filter(s => s.id !== sessionId));
          } catch (error) {
            console.error('Error deleting chat:', error);
          }
        }}
        onUpdateChatName={async (sessionId, name) => {
          try {
            await supabase.from('chat_sessions').update({ name }).eq('id', sessionId);
            setChatSessions(chatSessions.map(s => s.id === sessionId ? { ...s, name } : s));
          } catch (error) {
            console.error('Error updating chat name:', error);
          }
        }}
        onSearchChange={(query) => {
          // Filter sessions based on query
          if (!query) {
            loadChatSessions().then(sessions => {
              if (sessions) setChatSessions(sessions);
            });
          } else {
            const filtered = chatSessions.filter(s => 
              s.name.toLowerCase().includes(query.toLowerCase())
            );
            setChatSessions(filtered);
          }
        }}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col h-full overflow-y-auto">
        {/* Mobile menu button */}
        <div className="lg:hidden absolute left-4 top-4 z-20">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Top navigation pills */}
        <div className="sticky top-0 z-10 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-end px-4 py-3 gap-2">
          <div className="flex-1" />
          <AddonToggle />
          <UsagePill />
          <BalancePill />
          <FeedbackButton sessionId="features" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-screen-lg mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <h1 className="text-xl font-medium text-black dark:text-white">Features</h1>
            </div>
            
            <div className="mb-6 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex gap-4 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveSection('all')}
                  className={`px-4 py-2 text-sm rounded-md whitespace-nowrap ${
                    activeSection === 'all'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  All Features
                </button>
                <button
                  onClick={() => setActiveSection('released')}
                  className={`px-4 py-2 text-sm rounded-md whitespace-nowrap ${
                    activeSection === 'released'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  Released
                </button>
                <button
                  onClick={() => setActiveSection('upcoming')}
                  className={`px-4 py-2 text-sm rounded-md whitespace-nowrap ${
                    activeSection === 'upcoming'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  Coming Soon
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFeatures.map(feature => (
                <div 
                  key={feature.id}
                  className="p-4 border border-gray-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-900"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-gray-100 dark:bg-neutral-800 text-black dark:text-white">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-black dark:text-white">{feature.title}</h3>
                      <div className="mt-1">
                        {feature.status === 'released' ? (
                          <span className="text-xs bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full">
                            Released
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}