# Changelog

All notable changes to the AI Interface project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-03-13

### Added
- 🧠 **Perplexity Reasoning Model Integration**
  - Added advanced reasoning capabilities for complex queries
  - Enhanced context processing for more accurate responses
  - Improved topic understanding with real-time search results

### Fixed
- 🛡️ **Security Patches**
  - Fixed critical security vulnerabilities in authentication flow
  - Enhanced data protection for sensitive information
  - Improved validation for user inputs to prevent injection attacks

### Enhanced
- 📊 **Feedback System Improvements**
  - Updated feedback page with user ID display
  - Added username column to feedback dashboard
  - Improved user profile data fetching
  - Removed test and debug endpoints for production
  - Fixed API route for proper profile data handling

## [1.0.9] - 2025-03-08

### Changed
- 🚀 **Improved Main Navigation Flow**
  - Changed sign-in redirect to go directly to /multiverse instead of /dashboard
  - Updated dashboard page to redirect users to the multiverse interface
  - Added transitional screen explaining the change to users
  - Preserved original dashboard code in comments for future reference

### Added
- 👤 **User Profile Improvements**
  - Added user profile/avatar display in the ChatSidebar
  - Implemented dropdown menu with sign-out functionality
  - Enhanced user information display across all sections

### Enhanced
- 🧹 **Code Quality Improvements**
  - Fixed all lint errors across the codebase
  - Improved image loading with next/image for better performance
  - Added proper type definitions to prevent 'any' type usage
  - Enhanced code comments for better maintainability

## [1.0.8] - 2025-03-07

### Fixed
- 🔧 **Addon Connectivity Improvements**
  - Fixed addon toggle not loading credentials on new chat creation
  - Implemented proactive credential loading for NetSuite and Celigo
  - Improved connection state handling when toggling addons on/off
  - Enhanced error handling for connection failures
  - Added automatic connection retry when switching between chats

### Added
- 🔄 **Message Feedback System**
  - Added feedback button with star icon in the multiverse header
  - Built feedback dialog with accuracy slider (0-100%)
  - Implemented smooth animations for feedback components
  - Added database schema with RLS policies for message feedback

### Enhanced
- 💻 **Filter Script Tool Integration**
  - Added new filter script tool for Celigo integrations
  - Enhanced HTTP export schema with comprehensive pagination
  - Updated documentation for configuration parameters
  - Improved Multiverse integration with all Celigo tools

## [1.0.7] - 2025-03-06

### Added
- 🧠 **Claude's Reasoning Feature**
  - Added toggle for Claude's reasoning mode with brain icon
  - Created database schema for storing reasoning data
  - Implemented reasoning display with collapsible panel
  - Added green styling for messages with reasoning content
  - Integrated Claude 3.7 Sonnet's extended thinking capability
  - Added hover tooltip explaining reasoning feature

### Changed
- 💬 **Enhanced Chat Experience**
  - Moved brain toggle to right side for better visibility
  - Improved chat layout with smoother messages display
  - Updated database schema to support reasoning persistence
  - Enhanced chat message styling with modern look

## [1.0.6] - 2025-03-05

### Added
- 📊 **Token Usage Tracking**
  - Added token usage tracking with cost estimation
  - Created new usage pill component showing token counts and costs
  - Added detailed usage breakdown in pill dropdown
  - Integrated Claude 3.7 Sonnet pricing for accurate cost estimation

### Changed
- 🎨 **UI Improvements**
  - Redesigned AddonsToggle with modern teal theme
  - Streamlined pill interfaces with consistent design
  - Enhanced addon toggle dropdown with improved styling

### Fixed
- 🐛 Fixed duplicate message saving in chat history
- 📈 Added persistent token usage data to database

## [1.0.5] - 2025-03-05

### Added
- ⚡️ **Optimized performance and build process**
  - Added SWC minification for faster builds
  - Fixed favicon configuration for better browser compatibility
  - Improved error handling in turbopack configuration

### Changed
- 🧹 **Streamlined assets and configuration**
  - Removed duplicate favicon files for cleaner structure
  - Centralized favicon configuration in metadata

### Fixed
- 🚀 Fixed server-side rendering inconsistencies
- 🔧 Fixed Next.js configuration warnings

## [1.0.4] - 2025-03-05

### Added
- ⚡️ Turbo-optimized performance with smart caching system
  - Added memory and localStorage caching for near-instant navigation
  - Implemented parallel data fetching for faster loading
  - Added prefetching of navigation routes for instant transitions

### Changed
- 💄 Enhanced UI for connected addons
  - Removed floating pill connection status to simplify interface
  - Added glowing icons in chat input to show connected services
  - Improved addon indicator with animated halo effects

### Fixed
- 🚀 Fixed build and server-side compatibility issues
  - Improved localStorage usage with proper browser detection
  - Fixed server-side rendering with Suspense boundaries
  - Resolved ESLint errors across the codebase

## [1.0.3] - 2025-03-04

### Added
- ✨ Added SuiteQL tool for NetSuite SQL-like queries
  - Support for parameterized queries with placeholders
  - Integration with existing NetSuite authentication
  - Configurable script and deployment IDs via environment variables
- 🎨 Enhanced markdown table rendering with modern UI and CSV export

### Fixed
- 🔧 Fixed ESLint errors in dashboard and chat components

## [1.0.2] - 2025-03-04

### Changed
- ✨ Updated version display with interactive changelog tooltip
- 🔧 Fixed ESLint errors and removed unused imports
- ♻️ Refined UI indicators with white status dots
- 🎨 Modernized chat UI with admin dashboard style

## [1.0.1] - 2025-03-04

### Fixed
- 🔒 Fixed NetSuite OAuth for sandbox accounts
  - Fixed URL formatting for sandbox account IDs by replacing underscores with hyphens
  - Normalized account IDs to lowercase to ensure consistent API access
  - Added proper headers to Supabase client to fix 406 errors during OAuth flow
  - Ensured consistent handling of account IDs across all NetSuite API calls

## [1.0.0] - 2025-03-03

### Added
- ✨ Added Mermaid diagram rendering with interactive visualization
  - Automatic detection of Mermaid code blocks
  - Glowing diagram icon for visual indication
  - Modal view with fullscreen option
  - Enhanced styling for sequence diagrams
  - Improved error handling for complex diagrams
- 🔍 Added ExaAI search tool integration

### Changed
- 🚀 Improved chat UX with optimistic UI updates
  - Implemented immediate UI updates for chat deletion
  - Added optimistic updates for chat renaming
  - Removed unnecessary pencil icon from chat name inputs
- 💬 Updated multiverse card to 'Chat' with message icon
- ✨ Enhanced sidebar UI with improved selection indicators

### Fixed
- 🐛 Fixed unused Pencil import in ChatSidebar
- 🧹 Removed unused Globe import
- 🛠️ Fixed TypeScript 'any' type in chat route
- 🚀 Fixed profile popup to only show when user clicks profile settings
- Fixed NetSuite export functionality

### Documentation
- 📚 Enhanced HTTP export schema with comprehensive field descriptions