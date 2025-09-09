'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient();

      if (!supabase) {
        console.error('Supabase not configured');
        router.push('/auth/login?error=configuration');
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth/login?error=callback');
          return;
        }

        if (data.session) {
          console.log('Authentication successful');
          router.push('/dashboard');
        } else {
          console.log('No session found');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        router.push('/auth/login?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">
          Completing authentication...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we redirect you.
        </p>
      </div>
    </div>
  );
}
