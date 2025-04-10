'use client';

import { useEffect } from 'react';

// Using a client component to safely modify console only on the client
export default function WarningSupressor() {
  useEffect(() => {
    try {
      // Only run this in the browser, after initial render
      const originalConsoleError = console.error;
      
      // Create a safer version that doesn't use function references directly
      const safeConsoleError = function(...args) {
        // Check if this is a hydration error related to browser extensions
        if (
          typeof args[0] === 'string' && (
            args[0].includes('Hydration failed because the initial UI does not match what was rendered on the server') || 
            args[0].includes('Minified React error #418') ||
            args[0].includes('cz-shortcut-listen') ||
            args[0].includes('Extra attributes from the server') ||
            args[0].includes('text content did not match') ||
            args[0].includes('did not match')
          )
        ) {
          return;
        }
        
        // Use window.console to avoid reference issues
        window.console.log("[ERROR]", ...args);
      };
      
      // Replace the console.error
      console.error = safeConsoleError;
      
      // Cleanup function to restore console.error
      return () => {
        console.error = originalConsoleError;
      };
    } catch (e) {
      // If anything goes wrong, don't break the app
      console.log("Error in WarningSupressor:", e);
    }
  }, []);
  
  // Add CSS to handle hydration issues
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [cz-shortcut-listen] { display: unset !important; }
      
      /* Light mode styles - enforce black text */
      @media (prefers-color-scheme: light) {
        .text-black.dark\\:text-white { 
          color: black !important; 
        }
        .text-gray-600.dark\\:text-gray-400 {
          color: #4b5563 !important;
        }
        .text-gray-700.dark\\:text-gray-300 {
          color: #374151 !important;
        }
      }
      
      /* Dark mode styles */
      .dark .text-black.dark\\:text-white { 
        color: white !important; 
      }
      .dark .text-gray-600.dark\\:text-gray-400 {
        color: #9ca3af !important;
      }
      .dark .text-gray-700.dark\\:text-gray-300 {
        color: #d1d5db !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return null;
}