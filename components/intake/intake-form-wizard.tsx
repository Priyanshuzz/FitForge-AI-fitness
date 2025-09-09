'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { submitIntakeForm } from '@/lib/actions/fitness-actions';
import { validateIntakeFormStep } from '@/lib/types/validation';
import type { IntakeForm } from '@/lib/types/fitness';

// Import step components
import { PersonalInfoStep } from './steps/personal-info-step';
import { PhysicalProfileStep } from './steps/physical-profile-step';
import { FitnessAssessmentStep } from './steps/fitness-assessment-step';
import { HealthNutritionStep } from './steps/health-nutrition-step';
import { GoalsMotivationStep } from './steps/goals-motivation-step';
import { ConsentStep } from './steps/consent-step';

interface IntakeFormWizardProps {
  onComplete?: (jobId: string) => void;
  onCancel?: () => void;
}

const STEPS = [
  {
    id: 0,
    title: 'Personal Information',
    description: 'Tell us about yourself',
    component: PersonalInfoStep,
  },
  {
    id: 1,
    title: 'Physical Profile',
    description: 'Your measurements and goals',
    component: PhysicalProfileStep,
  },
  {
    id: 2,
    title: 'Fitness Assessment',
    description: 'Your activity level and preferences',
    component: FitnessAssessmentStep,
  },
  {
    id: 3,
    title: 'Health & Nutrition',
    description: 'Dietary preferences and limitations',
    component: HealthNutritionStep,
  },
  {
    id: 4,
    title: 'Goals & Motivation',
    description: 'What drives you to succeed',
    component: GoalsMotivationStep,
  },
  {
    id: 5,
    title: 'Terms & Consent',
    description: 'Final confirmations',
    component: ConsentStep,
  },
];

export function IntakeFormWizard({
  onComplete,
  onCancel,
}: IntakeFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<IntakeForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateFormData = (stepData: Partial<IntakeForm>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    setErrors({});
  };

  const validateCurrentStep = () => {
    const result = validateIntakeFormStep(currentStep, formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(error => {
        newErrors[error.path[0] as string] = error.message;
      });
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));

      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    try {
      // Create FormData for submission
      const submitData = new FormData();

      // Add all form data to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            submitData.append(key, JSON.stringify(value));
          } else if (typeof value === 'boolean') {
            submitData.append(key, value.toString());
          } else {
            submitData.append(key, value.toString());
          }
        }
      });

      const result = await submitIntakeForm(submitData);

      if (result.success && result.jobId) {
        onComplete?.(result.jobId);
      } else {
        throw new Error(result.error || 'Failed to submit intake form');
      }
    } catch (error) {
      console.error('Error submitting intake form:', error);
      setErrors({
        submit:
          error instanceof Error ? error.message : 'Failed to submit form',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepComponent = STEPS[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to FitForge!</h1>
        <p className="text-muted-foreground">
          Let's create your personalized fitness journey in just a few steps
        </p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />

            {/* Step Indicators */}
            <div className="flex justify-between">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center space-y-2"
                >
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    ${
                      index < currentStep || completedSteps.has(index)
                        ? 'bg-primary text-primary-foreground'
                        : index === currentStep
                          ? 'bg-primary/20 text-primary border-2 border-primary'
                          : 'bg-muted text-muted-foreground'
                    }
                  `}
                  >
                    {completedSteps.has(index) ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="text-center hidden sm:block">
                    <div className="text-xs font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepComponent
                data={formData}
                errors={errors}
                onChange={updateFormData}
              />
            </motion.div>
          </AnimatePresence>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{errors.submit}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div>
          {currentStep > 0 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {currentStep === STEPS.length - 1
                  ? 'Submitting...'
                  : 'Processing...'}
              </>
            ) : currentStep === STEPS.length - 1 ? (
              'Complete Setup'
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          This information helps us create your personalized fitness plan. All
          data is encrypted and secure.
        </p>
      </div>
    </div>
  );
}
