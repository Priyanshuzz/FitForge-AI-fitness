'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Target, 
  TrendingDown, 
  Dumbbell, 
  Heart, 
  Activity, 
  Trophy,
  Smile,
  Zap,
  BarChart3,
  Users
} from 'lucide-react';
import { PrimaryGoal, MotivationStyle } from '@/lib/types/fitness';
import type { IntakeForm } from '@/lib/types/fitness';

interface GoalsMotivationStepProps {
  data: Partial<IntakeForm>;
  errors: Record<string, string>;
  onChange: (data: Partial<IntakeForm>) => void;
}

const PRIMARY_GOALS = [
  {
    value: PrimaryGoal.LOSE_WEIGHT,
    label: 'Lose Weight',
    description: 'Reduce body weight and body fat',
    icon: TrendingDown,
    details: 'Focus on calorie deficit, cardio, and strength training',
    timeframe: '1-6 months typical'
  },
  {
    value: PrimaryGoal.BUILD_MUSCLE,
    label: 'Build Muscle',
    description: 'Increase muscle mass and strength',
    icon: Dumbbell,
    details: 'Emphasis on resistance training and protein intake',
    timeframe: '3-12 months typical'
  },
  {
    value: PrimaryGoal.MAINTAIN,
    label: 'Maintain Current Fitness',
    description: 'Stay at current fitness level',
    icon: Target,
    details: 'Balanced approach to maintain current physique',
    timeframe: 'Ongoing lifestyle'
  },
  {
    value: PrimaryGoal.IMPROVE_ENDURANCE,
    label: 'Improve Endurance',
    description: 'Better cardiovascular fitness',
    icon: Heart,
    details: 'Cardio-focused training with progressive volume',
    timeframe: '6-16 weeks typical'
  },
  {
    value: PrimaryGoal.GENERAL_HEALTH,
    label: 'General Health & Wellness',
    description: 'Overall health improvement',
    icon: Activity,
    details: 'Well-rounded approach to fitness and nutrition',
    timeframe: 'Lifelong journey'
  },
  {
    value: PrimaryGoal.SPORT_SPECIFIC,
    label: 'Sport-Specific Training',
    description: 'Train for a specific sport or activity',
    icon: Trophy,
    details: 'Specialized training for performance goals',
    timeframe: 'Varies by sport/event'
  }
];

const MOTIVATION_STYLES = [
  {
    value: MotivationStyle.GENTLE,
    label: 'Gentle Encouragement',
    description: 'Supportive and understanding approach',
    icon: Smile,
    characteristics: [
      'Positive reinforcement',
      'Focus on progress over perfection',
      'Compassionate guidance',
      'Celebration of small wins'
    ]
  },
  {
    value: MotivationStyle.FIRM,
    label: 'Firm Motivation',
    description: 'Direct and challenging coaching style',
    icon: Zap,
    characteristics: [
      'Clear expectations',
      'Accountability focus',
      'Push comfort zone',
      'Results-oriented approach'
    ]
  },
  {
    value: MotivationStyle.DATA_DRIVEN,
    label: 'Data-Driven Feedback',
    description: 'Facts, numbers, and progress metrics',
    icon: BarChart3,
    characteristics: [
      'Progress tracking focus',
      'Analytical insights',
      'Evidence-based guidance',
      'Performance metrics'
    ]
  },
  {
    value: MotivationStyle.COMMUNITY,
    label: 'Community Support',
    description: 'Social connection and shared goals',
    icon: Users,
    characteristics: [
      'Shared experiences',
      'Group encouragement',
      'Social accountability',
      'Collective motivation'
    ]
  }
];

export function GoalsMotivationStep({ data, errors, onChange }: GoalsMotivationStepProps) {
  const handleInputChange = (field: keyof IntakeForm, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* Primary Goal */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold">Primary Fitness Goal *</Label>
          <p className="text-sm text-muted-foreground mt-1">
            What's your main objective? This will shape your entire program.
          </p>
        </div>
        
        <RadioGroup
          value={data.primary_goal || ''}
          onValueChange={(value) => handleInputChange('primary_goal', value as PrimaryGoal)}
        >
          <div className="grid gap-4">
            {PRIMARY_GOALS.map((goal) => {
              const Icon = goal.icon;
              const isSelected = data.primary_goal === goal.value;
              
              return (
                <Card 
                  key={goal.value}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'hover:border-primary/50 hover:shadow-sm'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <RadioGroupItem 
                        value={goal.value} 
                        id={goal.value}
                        className="mt-1"
                      />
                      <Icon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <Label 
                          htmlFor={goal.value}
                          className="font-semibold cursor-pointer text-base"
                        >
                          {goal.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                          {goal.description}
                        </p>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Approach: </span>
                            <span className="text-muted-foreground">{goal.details}</span>
                          </div>
                          <div>
                            <span className="font-medium">Timeline: </span>
                            <span className="text-muted-foreground">{goal.timeframe}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </RadioGroup>
        
        {errors.primary_goal && (
          <p className="text-sm text-destructive">{errors.primary_goal}</p>
        )}
        
        {data.primary_goal && (
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2">🎯 Your Goal Strategy</h4>
            <p className="text-sm">
              {data.primary_goal === PrimaryGoal.LOSE_WEIGHT && 
                "We'll create a sustainable calorie deficit through balanced nutrition and exercise, focusing on preserving muscle while reducing body fat."}
              {data.primary_goal === PrimaryGoal.BUILD_MUSCLE && 
                "Your program will emphasize progressive resistance training with adequate protein and calories to support muscle growth."}
              {data.primary_goal === PrimaryGoal.MAINTAIN && 
                "We'll design a balanced routine to maintain your current fitness level with variety to keep you engaged."}
              {data.primary_goal === PrimaryGoal.IMPROVE_ENDURANCE && 
                "Cardiovascular training will be prioritized with progressive volume and intensity increases."}
              {data.primary_goal === PrimaryGoal.GENERAL_HEALTH && 
                "A well-rounded approach combining strength, cardio, flexibility, and nutrition for overall wellness."}
              {data.primary_goal === PrimaryGoal.SPORT_SPECIFIC && 
                "Training will be tailored to the specific demands and movement patterns of your chosen sport or activity."}
            </p>
          </div>
        )}
      </div>

      {/* Motivation Style */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold">Preferred Coaching Style *</Label>
          <p className="text-sm text-muted-foreground mt-1">
            How do you prefer to receive guidance and motivation?
          </p>
        </div>
        
        <RadioGroup
          value={data.motivation_style || ''}
          onValueChange={(value) => handleInputChange('motivation_style', value as MotivationStyle)}
        >
          <div className="grid md:grid-cols-2 gap-4">
            {MOTIVATION_STYLES.map((style) => {
              const Icon = style.icon;
              const isSelected = data.motivation_style === style.value;
              
              return (
                <Card 
                  key={style.value}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'hover:border-primary/50 hover:shadow-sm'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem 
                        value={style.value} 
                        id={style.value}
                        className="mt-1"
                      />
                      <Icon className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <Label 
                          htmlFor={style.value}
                          className="font-semibold cursor-pointer"
                        >
                          {style.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                          {style.description}
                        </p>
                        <div className="space-y-1">
                          {style.characteristics.map((char, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                              <span className="text-xs text-muted-foreground">{char}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </RadioGroup>
        
        {errors.motivation_style && (
          <p className="text-sm text-destructive">{errors.motivation_style}</p>
        )}
        
        {data.motivation_style && (
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2">💪 Your Coaching Experience</h4>
            <p className="text-sm">
              {data.motivation_style === MotivationStyle.GENTLE && 
                "I'll provide supportive, encouraging guidance that celebrates your progress and helps you build sustainable habits at your own pace."}
              {data.motivation_style === MotivationStyle.FIRM && 
                "I'll keep you accountable with clear expectations and challenges that push you to achieve your best results."}
              {data.motivation_style === MotivationStyle.DATA_DRIVEN && 
                "I'll focus on tracking metrics, analyzing your progress, and providing evidence-based insights to optimize your results."}
              {data.motivation_style === MotivationStyle.COMMUNITY && 
                "I'll emphasize shared experiences and community support to keep you motivated through connection with others."}
            </p>
          </div>
        )}
      </div>

      {/* Success Factors */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
        <h4 className="font-semibold mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-primary" />
          Keys to Your Success
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium mb-2">Consistency Factors:</h5>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Clear, achievable daily goals</li>
              <li>• Regular progress tracking</li>
              <li>• Flexible plan adaptations</li>
              <li>• Habit-building focus</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">Motivation Boosters:</h5>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Personalized coaching style</li>
              <li>• Milestone celebrations</li>
              <li>• Variety in workouts</li>
              <li>• Real-time adjustments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}