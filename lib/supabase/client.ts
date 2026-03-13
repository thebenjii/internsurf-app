import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://hwwkbrifairouslfeplt.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3d2ticmlmYWlyb3VzbGZlcGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzIxOTYsImV4cCI6MjA4ODk0ODE5Nn0.Du_4d85Y5qMxvR7rCe7WkE7SbIU3Ciprc3m-YuYQ9ic';

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
