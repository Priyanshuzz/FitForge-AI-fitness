'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { ActivityLevel, FitnessLevel } from '@/lib/types/fitness';
import type { IntakeForm } from '@/lib/types/fitness';

interface PhysicalProfileStepProps {
  data: Partial<IntakeForm>;
  errors: Record<string, string>;
  onChange: (data: Partial<IntakeForm>) => void;
}

const ACTIVITY_LEVELS = [
  {
    value: ActivityLevel.SEDENTARY,
    label: 'Sedentary',
    description: 'Little to no exercise, desk job',
    details: 'Mostly sitting, minimal physical activity',
  },
  {
    value: ActivityLevel.LIGHT,
    label: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    details: 'Occasional walks, light housework, standing job',
  },
  {
    value: ActivityLevel.MODERATE,
    label: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    details: 'Regular gym sessions, sports, active lifestyle',
  },
  {
    value: ActivityLevel.ACTIVE,
    label: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    details: 'Daily workouts, competitive sports, physical job',
  },
  {
    value: ActivityLevel.VERY_ACTIVE,
    label: 'Extremely Active',
    description: 'Very hard exercise, physical job',
    details: 'Professional athlete, manual labor + training',
  },
];

const FITNESS_LEVELS = [
  {
    value: FitnessLevel.BEGINNER,
    label: 'Beginner',
    description: 'New to exercise or returning after a long break',
    details: 'Less than 6 months of consistent exercise',
  },
  {
    value: FitnessLevel.INTERMEDIATE,
    label: 'Intermediate',
    description: 'Regular exercise for 6+ months',
    details: 'Comfortable with basic movements and routines',
  },
  {
    value: FitnessLevel.ADVANCED,
    label: 'Advanced',
    description: '2+ years of consistent training',
    details: 'Experienced with complex movements and programming',
  },
];

export function PhysicalProfileStep({
  data,
  errors,
  onChange,
}: PhysicalProfileStepProps) {
  const handleInputChange = (field: keyof IntakeForm, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* Current Activity Level */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold">
            Current Activity Level *
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            How active are you in your daily life?
          </p>
        </div>

        <RadioGroup
          value={data.activity_level || ''}
          onValueChange={value =>
            handleInputChange('activity_level', value as ActivityLevel)
          }
        >
          <div className="grid gap-3">
            {ACTIVITY_LEVELS.map(level => (
              <Card
                key={level.value}
                className={`cursor-pointer transition-colors ${
                  data.activity_level === level.value
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem
                      value={level.value}
                      id={level.value}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={level.value}
                        className="font-medium cursor-pointer"
                      >
                        {level.label}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {level.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {level.details}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </RadioGroup>
        {errors.activity_level && (
          <p className="text-sm text-destructive">{errors.activity_level}</p>
        )}
      </div>

      {/* Fitness Experience Level */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold">
            Fitness Experience Level *
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            How experienced are you with structured exercise?
          </p>
        </div>

        <RadioGroup
          value={data.fitness_level || ''}
          onValueChange={value =>
            handleInputChange('fitness_level', value as FitnessLevel)
          }
        >
          <div className="grid gap-3">
            {FITNESS_LEVELS.map(level => (
              <Card
                key={level.value}
                className={`cursor-pointer transition-colors ${
                  data.fitness_level === level.value
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem
                      value={level.value}
                      id={level.value}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={level.value}
                        className="font-medium cursor-pointer"
                      >
                        {level.label}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {level.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {level.details}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </RadioGroup>
        {errors.fitness_level && (
          <p className="text-sm text-destructive">{errors.fitness_level}</p>
        )}
      </div>

      {/* Training Frequency */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold">
            Training Frequency: {data.days_per_week || 3} days per week *
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            How many days per week can you commit to working out?
          </p>
        </div>

        <div className="px-2">
          <Slider
            value={[data.days_per_week || 3]}
            onValueChange={value =>
              handleInputChange('days_per_week', value[0])
            }
            max={7}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>1 day</span>
            <span>4 days</span>
            <span>7 days</span>
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm">
            {data.days_per_week === 1 &&
              "Perfect for building a habit! We'll make every session count."}
            {data.days_per_week === 2 &&
              'Great start! Two quality sessions can make a real difference.'}
            {data.days_per_week === 3 &&
              'Excellent balance! Three days allows for good progress and recovery.'}
            {data.days_per_week === 4 &&
              'Strong commitment! Four days will accelerate your progress.'}
            {data.days_per_week === 5 &&
              'High dedication! Five days will deliver significant results.'}
            {data.days_per_week === 6 &&
              'Very ambitious! Make sure to prioritize recovery and nutrition.'}
            {data.days_per_week === 7 &&
              "Maximum commitment! We'll include active recovery to prevent burnout."}
          </p>
        </div>
        {errors.days_per_week && (
          <p className="text-sm text-destructive">{errors.days_per_week}</p>
        )}
      </div>

      {/* Session Duration */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold">
            Session Duration: {data.session_minutes || 45} minutes *
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            How long can each workout session be?
          </p>
        </div>

        <div className="px-2">
          <Slider
            value={[data.session_minutes || 45]}
            onValueChange={value =>
              handleInputChange('session_minutes', value[0])
            }
            max={120}
            min={15}
            step={15}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>15 min</span>
            <span>60 min</span>
            <span>120 min</span>
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm">
            {data.session_minutes &&
              data.session_minutes <= 30 &&
              'Short and efficient! Perfect for busy schedules.'}
            {data.session_minutes &&
              data.session_minutes > 30 &&
              data.session_minutes <= 60 &&
              'Ideal duration for comprehensive workouts with good results.'}
            {data.session_minutes &&
              data.session_minutes > 60 &&
              'Extended sessions allow for detailed warm-up, training, and recovery.'}
          </p>
        </div>
        {errors.session_minutes && (
          <p className="text-sm text-destructive">{errors.session_minutes}</p>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">💡 Personalization Tips</h4>
        <ul className="text-sm space-y-1">
          <li>
            • Be honest about your current activity level - this ensures safe
            progression
          </li>
          <li>• It's better to start conservative and build up gradually</li>
          <li>
            • Your fitness level helps us choose appropriate exercises and
            intensity
          </li>
          <li>• Frequency and duration can be adjusted as you progress</li>
        </ul>
      </div>
    </div>
  );
}
