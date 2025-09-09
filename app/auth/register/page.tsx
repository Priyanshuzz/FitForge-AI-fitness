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
import { Eye, EyeOff, ArrowLeft, Check, Dumbbell, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { SimpleErrorBoundary } from '@/components/error-boundary';
import { logger } from '@/lib/utils/error-handling';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password requirements
    const passwordRequirements = [
      {
        check: formData.password.length >= 8,
        message: 'Password must be at least 8 characters',
      },
      {
        check: /[A-Z]/.test(formData.password),
        message: 'Password must contain an uppercase letter',
      },
      {
        check: /[a-z]/.test(formData.password),
        message: 'Password must contain a lowercase letter',
      },
      {
        check: /\d/.test(formData.password),
        message: 'Password must contain a number',
      },
    ];

    const failedRequirement = passwordRequirements.find(req => !req.check);
    if (failedRequirement) {
      setError(failedRequirement.message);
      setIsLoading(false);
      return;
    }

    try {
      logger.info('Registration attempt started', { email: formData.email });

      const { error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      });

      if (error) {
        setError(error.message || 'Registration failed. Please try again.');
        logger.warn('Registration failed', {
          email: formData.email,
          error: error.message,
        });
        return;
      }

      logger.info('Registration successful', { email: formData.email });
      // Redirect to onboarding/intake form
      router.push('/onboarding');
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      logger.error(
        'Registration error',
        err instanceof Error ? err : new Error(String(err)),
        { email: formData.email }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /\d/.test(formData.password) },
  ];

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
              <CardTitle className="text-2xl font-bold">
                Join FitForge AI
              </CardTitle>
              <CardDescription>
                Create your account and start your personalized fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={e =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={e =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
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
                      placeholder="Create a strong password"
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

                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      {passwordRequirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs"
                        >
                          <Check
                            className={`h-3 w-3 ${req.met ? 'text-emerald-500' : 'text-slate-300'}`}
                          />
                          <span
                            className={
                              req.met ? 'text-emerald-600' : 'text-slate-500'
                            }
                          >
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      disabled={isLoading}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-500">
                        Passwords do not match
                      </p>
                    )}
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    id="terms"
                    type="checkbox"
                    className="rounded border-slate-300 mt-1"
                    disabled={isLoading}
                    required
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{' '}
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
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <Separator className="my-4" />
                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link
                      href="/auth/login"
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-slate-500">
            <p>
              By creating an account, you agree to our{' '}
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
