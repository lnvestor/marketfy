"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { netsuiteOAuth } from '@/lib/netsuite';
import type { Connection } from './types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NetSuiteConnectionProps {
  connection: Connection | null;
  onUpdate: (connection: Connection) => void;
}

export const NetSuiteConnection = ({ connection, onUpdate }: NetSuiteConnectionProps) => {
  const [accountId, setAccountId] = useState(connection?.account_id || "");
  const [tokenExpiresIn, setTokenExpiresIn] = useState<number | null>(null);
  const [refreshTokenExpiresIn, setRefreshTokenExpiresIn] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);

  const handleRefreshToken = useCallback(async () => {
    if (!connection?.refresh_token || !connection?.account_id || isRefreshing) return;

    try {
      setIsRefreshing(true);
      const tokens = await netsuiteOAuth.refreshToken(
        connection.refresh_token,
        connection.account_id
      );

      // Update connection with new tokens
      onUpdate({
        ...connection,
        token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [connection, isRefreshing, onUpdate]);

  // Token refresh timer
  useEffect(() => {
    if (!connection?.token) return;

    // Calculate initial expiration time (60 minutes from last update)
    const lastUpdate = new Date(connection.updated_at).getTime();
    const expiresAt = lastUpdate + (60 * 60 * 1000); // 60 minutes in milliseconds
    const now = Date.now();
    const initialTimeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
    setTokenExpiresIn(initialTimeLeft);

    // Calculate refresh token expiration (7 days from last update)
    const refreshExpiresAt = lastUpdate + (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
    const refreshTimeLeft = Math.max(0, Math.floor((refreshExpiresAt - now) / 1000));
    setRefreshTokenExpiresIn(refreshTimeLeft);

    // Update timer every second
    const timer = setInterval(() => {
      setTokenExpiresIn(prev => {
        if (!prev) return null;
        const newTime = prev - 1;
        
        // Auto refresh when 5 minutes remaining
        if (newTime === 300 && connection.refresh_token) {
          handleRefreshToken();
        }
        
        return newTime > 0 ? newTime : 0;
      });

      // Update refresh token timer every minute
      setRefreshTokenExpiresIn(prev => {
        if (!prev) return null;
        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [connection?.token, connection?.updated_at, connection?.refresh_token, handleRefreshToken]);

  const initiateOAuth = async () => {
    if (!accountId) return;

    try {
      // Generate OAuth URL and PKCE values
      const { url, codeVerifier, state } = netsuiteOAuth.generateAuthUrl(accountId);

      // Store state and code verifier in cookies
      document.cookie = `netsuite_state=${state}; path=/; max-age=3600; secure; samesite=lax`;
      document.cookie = `netsuite_code_verifier=${codeVerifier}; path=/; max-age=3600; secure; samesite=lax`;
      
      // Redirect to NetSuite OAuth page
      window.location.href = url;
    } catch (error) {
      console.error('Error initiating OAuth:', error);
    }
  };

  // Format time remaining for access token
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format time remaining for refresh token
  const formatDaysRemaining = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <>
      <div className="relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-neutral-900 shadow-sm h-full">
        <div className="relative p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative h-10 w-10 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-neutral-900 flex items-center justify-center">
              <Image
                src="/logos/NetSuite.png"
                alt="NetSuite"
                fill
                className="object-contain p-1.5"
              />
            </div>
            <div>
              <h2 className="text-base font-medium text-black dark:text-white">NetSuite Integration</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">Configure connection</p>
            </div>
          </div>

          {/* Setup steps */}
          <div className="mb-4 space-y-3">
            <div className="text-xs font-medium text-black dark:text-white mb-2">Setup Steps</div>
            
            <div className="flex items-center text-xs">
              <div className="w-5 flex-shrink-0 text-gray-500 dark:text-gray-400">1.</div>
              <div className="flex-grow text-black dark:text-white">Enter your NetSuite Account ID below</div>
            </div>
            
            <div className="flex items-center text-xs">
              <div className="w-5 flex-shrink-0 text-gray-500 dark:text-gray-400">2.</div>
              <div className="flex-grow text-black dark:text-white">Install the bundle</div>
              {accountId && (
                <a
                  href={`https://${accountId}.app.netsuite.com/app/bundler/bundledetails.nl?sourcecompanyid=TSTDRV2727913&domain=PRODUCTION&config=F&id=555380`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 px-2 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white"
                >
                  Open
                </a>
              )}
            </div>
            
            <div className="flex items-center text-xs">
              <div className="w-5 flex-shrink-0 text-gray-500 dark:text-gray-400">3.</div>
              <div className="flex-grow text-black dark:text-white">Enable permissions</div>
              {accountId && (
                <button
                  onClick={() => setShowPermissionsDialog(true)}
                  className="ml-2 px-2 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white"
                >
                  View
                </button>
              )}
            </div>
            
            <div className="flex items-center text-xs">
              <div className="w-5 flex-shrink-0 text-gray-500 dark:text-gray-400">4.</div>
              <div className="flex-grow text-black dark:text-white">Connect to NetSuite</div>
              {accountId && !connection && (
                <button
                  onClick={initiateOAuth}
                  disabled={!accountId}
                  className="ml-2 px-2 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white"
                >
                  Authenticate
                </button>
              )}
              {connection && (
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white"></div>
                  <span className="text-xs text-black dark:text-white">Connected</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="accountId" className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
              Account ID
            </label>
            <input
              type="text"
              id="accountId"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              placeholder="Enter your NetSuite Account ID"
              required
            />
          </div>

          {connection && (
            <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
                  <span className="text-xs font-medium text-black dark:text-white">Connection Status</span>
                </div>
                <button
                  onClick={initiateOAuth}
                  className="px-2 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white"
                >
                  Reconnect
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-black dark:text-white">Access token</span>
                    <span className="font-mono text-black dark:text-white">{formatTimeRemaining(tokenExpiresIn || 0)}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-black dark:bg-white"
                      style={{ width: `${Math.min(100, ((tokenExpiresIn || 0) / (60 * 60)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-500 dark:text-gray-400">Refreshes at 5m</span>
                    <button
                      onClick={handleRefreshToken}
                      disabled={isRefreshing || !connection.refresh_token}
                      className="text-xs px-2 py-0.5 rounded hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white"
                    >
                      {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                </div>
                
                <div className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-black dark:text-white">Refresh token</span>
                    <span className="font-mono text-black dark:text-white">{formatDaysRemaining(refreshTokenExpiresIn || 0)}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-black dark:bg-white"
                      style={{ width: `${Math.min(100, ((refreshTokenExpiresIn || 0) / (7 * 24 * 60 * 60)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-500 dark:text-gray-400">Valid for 7 days</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(connection.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {!connection && accountId && (
            <div className="flex justify-end mt-4">
              <button
                onClick={initiateOAuth}
                disabled={!accountId}
                className="rounded-md h-8 px-3 py-0 text-xs bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                Connect to NetSuite
              </button>
            </div>
          )}
        </div>
      </div>

      {showPermissionsDialog && (
        <Dialog open onOpenChange={setShowPermissionsDialog}>
          <DialogContent 
            className="sm:max-w-[450px] max-h-[80vh] overflow-y-auto rounded-md border-zinc-200 bg-white" 
          >
            <DialogHeader>
              <DialogTitle className="text-base font-medium text-black">Required NetSuite Permissions</DialogTitle>
              <div className="text-xs text-gray-600">Enable these features before connecting</div>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              <div className="text-xs text-black mb-3">
                Navigate to <span className="font-mono px-1 py-0.5 rounded bg-gray-100">Setup &gt; Company &gt; Enable Features</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 text-center text-gray-500">•</div>
                  <div>
                    <div className="text-xs font-medium text-black">OAuth 2.0</div>
                    <div className="text-xs text-gray-600">Required for secure authentication</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 text-center text-gray-500">•</div>
                  <div>
                    <div className="text-xs font-medium text-black">Token-Based Authentication</div>
                    <div className="text-xs text-gray-600">Enables secure access tokens</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 text-center text-gray-500">•</div>
                  <div>
                    <div className="text-xs font-medium text-black">REST Web Services</div>
                    <div className="text-xs text-gray-600">Required for API communication</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-500">
              After enabling these features, return to this page and continue.
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};