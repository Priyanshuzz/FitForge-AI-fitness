'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Brain, 
  Dumbbell, 
  Apple,
  Target,
  Sparkles
} from 'lucide-react';
import { checkPlanGenerationStatus } from '@/lib/actions/fitness-actions';
import { useRouter } from 'next/navigation';

interface PlanGenerationStatusProps {
  jobId: string;
  onComplete?: (planId: string) => void;
  onError?: (error: string) => void;
}

const GENERATION_STEPS = [
  {
    id: 'analyzing',
    label: 'Analyzing Your Profile',
    description: 'Processing your goals, preferences, and health data',
    icon: Brain,
    duration: 15000 // 15 seconds
  },
  {
    id: 'workouts',
    label: 'Creating Your Workouts',
    description: 'Designing personalized exercises for your fitness level',
    icon: Dumbbell,
    duration: 20000 // 20 seconds
  },
  {
    id: 'nutrition',
    label: 'Planning Your Nutrition',
    description: 'Generating meal plans and calculating macros',
    icon: Apple,
    duration: 15000 // 15 seconds
  },
  {
    id: 'optimization',
    label: 'Optimizing Your Plan',
    description: 'Fine-tuning everything for maximum results',
    icon: Target,
    duration: 10000 // 10 seconds
  }
];

export function PlanGenerationStatus({ jobId, onComplete, onError }: PlanGenerationStatusProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<'generating' | 'completed' | 'failed'>('generating');
  const [progress, setProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(60);
  const [planId, setPlanId] = useState<string | null>(null);
  const router = useRouter();

  // Check job status periodically
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const result = await checkPlanGenerationStatus(jobId);
        
        if (result.success && result.job) {
          const job = result.job;
          
          if (job.status === 'COMPLETED') {
            setStatus('completed');
            setProgress(100);
            if (job.result_data?.plan_id) {
              setPlanId(job.result_data.plan_id);
              onComplete?.(job.result_data.plan_id);
            }
            if (interval) clearInterval(interval);
            if (stepTimeout) clearTimeout(stepTimeout);
          } else if (job.status === 'FAILED') {
            setStatus('failed');
            onError?.(job.error_message || 'Plan generation failed');
            if (interval) clearInterval(interval);
            if (stepTimeout) clearTimeout(stepTimeout);
          }
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    // Check status every 2 seconds
    interval = setInterval(checkStatus, 2000);

    // Progress through steps
    const progressThroughSteps = () => {
      if (currentStep < GENERATION_STEPS.length - 1) {
        stepTimeout = setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          progressThroughSteps();
        }, GENERATION_STEPS[currentStep].duration);
      }
    };

    progressThroughSteps();

    // Update progress and time remaining
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 1.67, 95); // Reach 95% in 60 seconds
        return newProgress;
      });
      
      setEstimatedTimeRemaining(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      if (interval) clearInterval(interval);
      if (stepTimeout) clearTimeout(stepTimeout);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [jobId, currentStep, onComplete, onError]);

  const handleViewPlan = () => {
    if (planId) {
      router.push('/dashboard');
    }
  };

  const handleTryAgain = () => {
    router.push('/onboarding');
  };

  if (status === 'completed') {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-600">Your Plan is Ready! 🎉</h1>
          <p className="text-lg text-muted-foreground">
            Your personalized fitness and nutrition plan has been created successfully.
          </p>
        </div>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center justify-center">
              <Sparkles className="w-5 h-5 mr-2 text-green-600" />
              What's Included in Your Plan
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Dumbbell className="w-4 h-4 text-green-600" />
                  <span>7-day personalized workout plan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Apple className="w-4 h-4 text-green-600" />
                  <span>Customized meal plans & recipes</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span>Calorie & macro targets</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-green-600" />
                  <span>AI coach for real-time guidance</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          size="lg" 
          onClick={handleViewPlan}
          className="w-full md:w-auto px-8"
        >
          View Your Plan
        </Button>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-red-600">Oops! Something went wrong</h1>
          <p className="text-lg text-muted-foreground">
            We encountered an issue while generating your plan. Please try again.
          </p>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <p className="text-sm text-red-800">
              Don't worry - your information has been saved. You can try generating 
              your plan again, or contact our support team if the issue persists.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={handleTryAgain}
          >
            Try Again
          </Button>
          <Button>
            Contact Support
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="flex justify-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary" />
          </div>
        </motion.div>
        
        <h1 className="text-3xl font-bold">Creating Your Perfect Plan</h1>
        <p className="text-lg text-muted-foreground">
          Our AI is analyzing your profile and crafting a personalized fitness journey
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          
          <Progress value={progress} className="h-3" />
          
          <div className="text-center text-sm text-muted-foreground">
            Estimated time remaining: {estimatedTimeRemaining} seconds
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {GENERATION_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0.5 }}
                  animate={{ 
                    opacity: isActive ? 1 : isCompleted ? 0.8 : 0.5,
                    scale: isActive ? 1.02 : 1
                  }}
                  className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary/10 border border-primary/20' 
                      : isCompleted 
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-muted/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-100' 
                      : isActive 
                        ? 'bg-primary/20' 
                        : 'bg-muted'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : isActive ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-5 h-5 text-primary" />
                      </motion.div>
                    ) : (
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fun Facts */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            Did You Know?
          </h3>
          <div className="text-sm space-y-2">
            <p>
              💪 Your personalized plan considers over 50 different factors including your 
              goals, equipment, schedule, and dietary preferences.
            </p>
            <p>
              🧠 Our AI processes millions of exercise combinations to find the perfect 
              workouts for your fitness level and available time.
            </p>
            <p>
              🍎 Your meal plans are optimized for your caloric needs while ensuring 
              balanced nutrition and foods you'll actually enjoy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}