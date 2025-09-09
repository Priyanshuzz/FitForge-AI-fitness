'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Settings,
  Database,
  Brain,
  Shield,
  Zap,
  ArrowLeft
} from 'lucide-react';

interface ConfigStatus {
  supabase: boolean;
  openai: boolean;
  hasEnvFile: boolean;
}

export default function SetupPage() {
  const [status, setStatus] = useState<ConfigStatus>({
    supabase: false,
    openai: false,
    hasEnvFile: false
  });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Check configuration status
    const supabaseConfigured = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    
    setStatus({
      supabase: supabaseConfigured,
      openai: openaiConfigured,
      hasEnvFile: supabaseConfigured || openaiConfigured
    });
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const StatusBadge = ({ isConfigured }: { isConfigured: boolean }) => (
    <Badge variant={isConfigured ? "default" : "destructive"} className="ml-2">
      {isConfigured ? (
        <>
          <CheckCircle className="w-3 h-3 mr-1" />
          Configured
        </>
      ) : (
        <>
          <XCircle className="w-3 h-3 mr-1" />
          Not Configured
        </>
      )}
    </Badge>
  );

  const isFullyConfigured = status.supabase && status.openai;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-primary hover:underline mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-4">🚀 FitForge AI Setup</h1>
          <p className="text-xl text-muted-foreground">
            Get your AI fitness coaching platform up and running in minutes
          </p>
        </div>

        {/* Configuration Status */}
        {isFullyConfigured && (
          <Alert className="mb-8 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Congratulations!</strong> Your FitForge AI platform is fully configured and ready to use.
              <Link href="/" className="text-green-600 hover:underline ml-1">
                Start using the app →
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Start Steps */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                1. Database & Authentication
                <StatusBadge isConfigured={status.supabase} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Set up Supabase for user authentication and data storage.
              </p>
              
              <div className="space-y-2">
                <p className="font-medium">Quick Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Go to <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">supabase.com</a></li>
                  <li>Create a free account and new project</li>
                  <li>Go to Settings → API</li>
                  <li>Copy your credentials below</li>
                </ol>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between bg-muted p-2 rounded">
                  <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard('NEXT_PUBLIC_SUPABASE_URL=your_project_url', 'supabase_url')}
                  >
                    {copied === 'supabase_url' ? 'Copied!' : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between bg-muted p-2 rounded">
                  <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key', 'supabase_key')}
                  >
                    {copied === 'supabase_key' ? 'Copied!' : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              <Button variant="outline" size="sm" asChild>
                <a href="https://supabase.com" target="_blank">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open Supabase
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                2. AI Features
                <StatusBadge isConfigured={status.openai} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Configure OpenAI for AI-powered fitness coaching.
              </p>
              
              <div className="space-y-2">
                <p className="font-medium">Quick Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Go to <a href="https://platform.openai.com" target="_blank" className="text-blue-600 hover:underline">platform.openai.com</a></li>
                  <li>Sign up or log in</li>
                  <li>Create an API key</li>
                  <li>Add it to your environment</li>
                </ol>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between bg-muted p-2 rounded">
                  <code className="text-xs">OPENAI_API_KEY</code>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard('OPENAI_API_KEY=your_openai_key', 'openai_key')}
                  >
                    {copied === 'openai_key' ? 'Copied!' : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              <Button variant="outline" size="sm" asChild>
                <a href="https://platform.openai.com" target="_blank">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open OpenAI
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Environment File Setup */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              3. Environment Configuration
              <StatusBadge isConfigured={status.hasEnvFile} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Create your environment variables file with your credentials.
            </p>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Create .env.local file:</p>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => copyToClipboard(`# FitForge AI Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development`, 'env_file')}
                >
                  {copied === 'env_file' ? 'Copied!' : 'Copy Template'}
                </Button>
              </div>
              <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`# FitForge AI Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development`}
              </pre>
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>Instructions:</strong></p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Copy the template above</li>
                <li>Create a file named <code>.env.local</code> in your project root</li>
                <li>Paste the template and replace with your actual values</li>
                <li>Restart your development server: <code>npm run dev</code></li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">Secure Authentication</h3>
              <p className="text-sm text-muted-foreground">Email, password, and Google OAuth</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Brain className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold mb-1">AI Coaching</h3>
              <p className="text-sm text-muted-foreground">Personalized fitness and nutrition plans</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="font-semibold mb-1">Real-time Progress</h3>
              <p className="text-sm text-muted-foreground">Track workouts, photos, and analytics</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          {isFullyConfigured ? (
            <Button size="lg" asChild>
              <Link href="/">
                🎉 Start Using FitForge AI
              </Link>
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Complete the setup above to unlock all features
              </p>
              <Button variant="outline" asChild>
                <Link href="/">
                  Continue in Demo Mode
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}