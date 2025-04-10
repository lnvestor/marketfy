"use client";

import Image from "next/image";
import { useState } from "react";
import type { Connection } from './types';
import { Button } from "@/components/ui/button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion } from "framer-motion";

interface CeligoConnectionProps {
  connection: Connection | null;
  onUpdate: (connection: Connection) => void;
}

export const CeligoConnection = ({ connection, onUpdate }: CeligoConnectionProps) => {
  const [token, setToken] = useState(connection?.token || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (connection) {
        // Update existing connection
        onUpdate({
          ...connection,
          token,
          updated_at: new Date().toISOString()
        });
      } else {
        // For new connections, we'll let the parent component handle
        // the creation with proper user_id and addon_id
        onUpdate({
          id: '', // This will be replaced by the database
          user_id: '', // This will be set by the parent
          addon_id: '', // This will be set by the parent
          token,
          refresh_token: null,
          account_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error saving token:', err);
      setError(err instanceof Error ? err.message : 'Failed to save token');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-neutral-900 shadow-sm h-full">
      <div className="relative p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative h-10 w-10 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-neutral-900 flex items-center justify-center">
            <Image
              src="/logos/celigo.jpg"
              alt="Celigo"
              fill
              className="object-contain p-1.5"
            />
          </div>
          <div>
            <h2 className="text-base font-medium text-black dark:text-white">Celigo Integration</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">Configure connection</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
              API Token
            </label>
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              placeholder="Enter your Celigo API token"
              required
            />
          </div>

          {error && (
            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-2 text-xs text-black dark:text-white">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-black dark:bg-white" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md h-8 px-3 py-0 text-xs bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-gray-50 hover:text-black dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              {isSubmitting ? 'Saving...' : connection ? 'Update Token' : 'Save Token'}
            </Button>
          </div>
        </form>

        {connection && (
          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
                <span className="text-xs font-medium text-black dark:text-white">Connected</span>
              </div>
              <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                {new Date(connection.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
