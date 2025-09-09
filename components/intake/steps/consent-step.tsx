'use client';

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Camera, 
  AlertTriangle, 
  FileText, 
  Lock, 
  Heart,
  CheckCircle2
} from 'lucide-react';
import type { IntakeForm } from '@/lib/types/fitness';

interface ConsentStepProps {
  data: Partial<IntakeForm>;
  errors: Record<string, string>;
  onChange: (data: Partial<IntakeForm>) => void;
}

export function ConsentStep({ data, errors, onChange }: ConsentStepProps) {
  const handleInputChange = (field: keyof IntakeForm, value: any) => {
    onChange({ [field]: value });
  };

  const allConsentsGiven = data.medical_consent && data.terms_accepted;

  return (
    <div className="space-y-6">
      {/* Medical Disclaimer */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-amber-800">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Important Medical Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-amber-800 space-y-3">
            <p className="font-medium">
              Please read and understand the following before proceeding:
            </p>
            
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>
                  <strong>Not Medical Advice:</strong> FitForge provides fitness and nutrition guidance only. 
                  This is not medical advice, diagnosis, or treatment.
                </span>
              </li>
              
              <li className="flex items-start">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>
                  <strong>Consult Healthcare Professionals:</strong> Always consult with qualified healthcare 
                  providers before starting any new exercise or nutrition program, especially if you have 
                  health conditions, injuries, or concerns.
                </span>
              </li>
              
              <li className="flex items-start">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>
                  <strong>Exercise at Your Own Risk:</strong> You participate in all activities at your own risk. 
                  Stop exercising immediately if you experience pain, dizziness, or discomfort.
                </span>
              </li>
              
              <li className="flex items-start">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>
                  <strong>Individual Results Vary:</strong> Results may vary based on individual factors. 
                  No specific outcomes are guaranteed.
                </span>
              </li>
            </ul>
          </div>
          
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="medical-consent"
              checked={data.medical_consent || false}
              onCheckedChange={(checked) => 
                handleInputChange('medical_consent', checked as boolean)
              }
              className="mt-1"
            />
            <div>
              <Label htmlFor="medical-consent" className="cursor-pointer font-medium text-amber-800">
                I understand and acknowledge this medical disclaimer *
              </Label>
              <p className="text-xs text-amber-700 mt-1">
                Required to proceed with the fitness program
              </p>
            </div>
          </div>
          
          {errors.medical_consent && (
            <p className="text-sm text-destructive">{errors.medical_consent}</p>
          )}
        </CardContent>
      </Card>

      {/* Photo Permission */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2 text-primary" />
            Progress Photo Permission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              Progress photos can be a powerful tool for tracking your transformation and staying motivated. 
              This permission is optional and you can change it anytime.
            </p>
            
            <div className="bg-primary/5 p-3 rounded-lg">
              <h5 className="font-medium mb-2">What this enables:</h5>
              <ul className="space-y-1 text-sm">
                <li>• Ability to upload and store progress photos securely</li>
                <li>• Visual progress tracking in your dashboard</li>
                <li>• Before/after comparison features</li>
                <li>• Motivational progress celebrations</li>
              </ul>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <h5 className="font-medium mb-2">Privacy guarantee:</h5>
              <ul className="space-y-1 text-sm">
                <li>• Photos are stored securely and privately</li>
                <li>• Only you can view your photos</li>
                <li>• Photos are never shared without explicit permission</li>
                <li>• You can delete photos anytime</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="photo-permission"
              checked={data.photo_permission || false}
              onCheckedChange={(checked) => 
                handleInputChange('photo_permission', checked as boolean)
              }
              className="mt-1"
            />
            <div>
              <Label htmlFor="photo-permission" className="cursor-pointer font-medium">
                Yes, I allow camera access for progress photos (Optional)
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                You can enable this later in your profile settings
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Privacy Policy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary" />
            Terms of Service & Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              By using FitForge, you agree to our Terms of Service and Privacy Policy. 
              These documents outline how we protect your data and what you can expect from our service.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-primary/5 p-3 rounded-lg">
                <h5 className="font-medium mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  Data Protection
                </h5>
                <ul className="space-y-1 text-xs">
                  <li>• End-to-end encryption</li>
                  <li>• GDPR & CCPA compliant</li>
                  <li>• No data selling</li>
                  <li>• Right to data deletion</li>
                </ul>
              </div>
              
              <div className="bg-primary/5 p-3 rounded-lg">
                <h5 className="font-medium mb-2 flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  Service Terms
                </h5>
                <ul className="space-y-1 text-xs">
                  <li>• Fair usage policies</li>
                  <li>• Account responsibilities</li>
                  <li>• Subscription terms</li>
                  <li>• Cancellation rights</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-4 text-xs">
              <a 
                href="/terms" 
                target="_blank" 
                className="text-primary hover:underline"
              >
                Read Full Terms of Service →
              </a>
              <a 
                href="/privacy" 
                target="_blank" 
                className="text-primary hover:underline"
              >
                Read Privacy Policy →
              </a>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms-accepted"
              checked={data.terms_accepted || false}
              onCheckedChange={(checked) => 
                handleInputChange('terms_accepted', checked as boolean)
              }
              className="mt-1"
            />
            <div>
              <Label htmlFor="terms-accepted" className="cursor-pointer font-medium">
                I agree to the Terms of Service and Privacy Policy *
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Required to create your FitForge account
              </p>
            </div>
          </div>
          
          {errors.terms_accepted && (
            <p className="text-sm text-destructive">{errors.terms_accepted}</p>
          )}
        </CardContent>
      </Card>

      {/* Ready to Start */}
      {allConsentsGiven && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">
                🎉 You're all set! Ready to start your fitness journey.
              </p>
              <p className="text-sm">
                Click "Complete Setup" to generate your personalized plan. 
                This usually takes about 60 seconds.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* What Happens Next */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-primary">
            <Heart className="w-5 h-5 mr-2" />
            What Happens Next
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">AI Plan Generation</p>
                <p className="text-muted-foreground text-xs">
                  Our AI will create your personalized 7-day workout and meal plan
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Plan Review & Customization</p>
                <p className="text-muted-foreground text-xs">
                  Review your plan and make any adjustments through our AI coach
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Start Your Journey</p>
                <p className="text-muted-foreground text-xs">
                  Begin with your first workout and track your progress daily
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}