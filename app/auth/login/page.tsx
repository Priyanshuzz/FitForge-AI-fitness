'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ArrowLeft, Dumbbell, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { SimpleErrorBoundary } from '@/components/error-boundary';
import { logger } from '@/lib/utils/error-handling';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      logger.info('Login attempt started', { email: formData.email });

      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        setError(
          error.message || 'Login failed. Please check your credentials.'
        );
        logger.warn('Login failed', {
          email: formData.email,
          error: error.message,
        });
        return;
      }

      logger.info('Login successful', { email: formData.email });
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      logger.error(
        'Login error',
        err instanceof Error ? err : new Error(String(err)),
        { email: formData.email }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info('Google sign-in attempted');

      const { error } = await signInWithGoogle();

      if (error) {
        setError(error.message || 'Google sign-in failed. Please try again.');
        logger.warn('Google sign-in failed', { error: error.message });
        return;
      }

      logger.info('Google sign-in successful');
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = 'Google sign-in failed. Please try again.';
      setError(errorMessage);
      logger.error(
        'Google sign-in error',
        err instanceof Error ? err : new Error(String(err))
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SimpleErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to FitForge AI
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your FitForge AI account to continue your fitness
                journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={e =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      disabled={isLoading}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="rounded border-slate-300"
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <Separator className="my-4" />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  Continue with Google
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link
                      href="/auth/register"
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Sign up for free
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-slate-500">
            <p>
              By signing in, you agree to our{' '}
              <Link
                href="/terms"
                className="text-primary hover:text-primary/80"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-primary hover:text-primary/80"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </SimpleErrorBoundary>
  );
}
