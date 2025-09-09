import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client for development without environment variables
function createMockSupabaseClient(): Partial<SupabaseClient> {
  const mockResponse = { data: null, error: { message: 'Supabase not configured' } };
  
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve(mockResponse),
      signInWithOAuth: () => Promise.resolve(mockResponse),
      signUp: () => Promise.resolve(mockResponse),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    } as any,
    from: () => ({
      select: () => Promise.resolve(mockResponse),
      insert: () => Promise.resolve(mockResponse),
      update: () => Promise.resolve(mockResponse),
      delete: () => Promise.resolve(mockResponse),
      eq: function() { return this; },
      order: function() { return this; },
      limit: function() { return this; }
    }) as any
  } as any;
}

export function createClient() {
  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Handle missing environment variables gracefully
    console.warn('Supabase environment variables not found. Running in demo mode.');
    console.warn('To enable full functionality, please set:');
    console.warn('- NEXT_PUBLIC_SUPABASE_URL');
    console.warn('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    // Return a mock client that won't break the app
    return createMockSupabaseClient();
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Alias for compatibility
export const createSupabaseClient = createClient
