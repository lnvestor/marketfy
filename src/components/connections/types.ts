import type { Database } from '@/lib/database.types';

export type Connection = Database['public']['Tables']['connections']['Row'] & {
  AdminAddons?: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  }
};