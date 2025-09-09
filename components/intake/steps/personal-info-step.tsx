'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Sex } from '@/lib/types/fitness';
import type { IntakeForm } from '@/lib/types/fitness';

interface PersonalInfoStepProps {
  data: Partial<IntakeForm>;
  errors: Record<string, string>;
  onChange: (data: Partial<IntakeForm>) => void;
}

export function PersonalInfoStep({
  data,
  errors,
  onChange,
}: PersonalInfoStepProps) {
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    data.target_date ? new Date(data.target_date) : undefined
  );

  const handleInputChange = (field: keyof IntakeForm, value: any) => {
    onChange({ [field]: value });
  };

  const handleTargetDateChange = (date: Date | undefined) => {
    setTargetDate(date);
    handleInputChange('target_date', date?.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            min="16"
            max="100"
            value={data.age || ''}
            onChange={e =>
              handleInputChange('age', parseInt(e.target.value) || undefined)
            }
            className={errors.age ? 'border-destructive' : ''}
          />
          {errors.age && (
            <p className="text-sm text-destructive">{errors.age}</p>
          )}
        </div>

        {/* Sex */}
        <div className="space-y-3">
          <Label>Biological Sex *</Label>
          <RadioGroup
            value={data.sex || ''}
            onValueChange={value => handleInputChange('sex', value as Sex)}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Sex.MALE} id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Sex.FEMALE} id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Sex.OTHER} id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={Sex.PREFER_NOT_TO_SAY}
                id="prefer-not-to-say"
              />
              <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
            </div>
          </RadioGroup>
          {errors.sex && (
            <p className="text-sm text-destructive">{errors.sex}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Height */}
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm) *</Label>
          <Input
            id="height"
            type="number"
            min="100"
            max="250"
            step="0.1"
            value={data.height_cm || ''}
            onChange={e =>
              handleInputChange(
                'height_cm',
                parseFloat(e.target.value) || undefined
              )
            }
            className={errors.height_cm ? 'border-destructive' : ''}
          />
          {errors.height_cm && (
            <p className="text-sm text-destructive">{errors.height_cm}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Example: 175.5 cm (5'9")
          </p>
        </div>

        {/* Current Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight">Current Weight (kg) *</Label>
          <Input
            id="weight"
            type="number"
            min="30"
            max="300"
            step="0.1"
            value={data.weight_kg || ''}
            onChange={e =>
              handleInputChange(
                'weight_kg',
                parseFloat(e.target.value) || undefined
              )
            }
            className={errors.weight_kg ? 'border-destructive' : ''}
          />
          {errors.weight_kg && (
            <p className="text-sm text-destructive">{errors.weight_kg}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Example: 70.5 kg (155 lbs)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goal Weight */}
        <div className="space-y-2">
          <Label htmlFor="goal-weight">Goal Weight (kg)</Label>
          <Input
            id="goal-weight"
            type="number"
            min="30"
            max="300"
            step="0.1"
            value={data.goal_weight_kg || ''}
            onChange={e =>
              handleInputChange(
                'goal_weight_kg',
                parseFloat(e.target.value) || undefined
              )
            }
            className={errors.goal_weight_kg ? 'border-destructive' : ''}
          />
          {errors.goal_weight_kg && (
            <p className="text-sm text-destructive">{errors.goal_weight_kg}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Optional: Leave blank if maintaining current weight
          </p>
        </div>

        {/* Target Date */}
        <div className="space-y-2">
          <Label>Target Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !targetDate && 'text-muted-foreground'
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {targetDate ? format(targetDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={targetDate}
                onSelect={handleTargetDateChange}
                disabled={date => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            When would you like to reach your goal?
          </p>
        </div>
      </div>

      {/* Helper Information */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Why do we need this information?</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            • <strong>Age & Sex:</strong> Used to calculate your baseline
            metabolic rate
          </li>
          <li>
            • <strong>Height & Weight:</strong> Essential for determining
            calorie needs and workout intensity
          </li>
          <li>
            • <strong>Goal Weight:</strong> Helps create a realistic timeline
            and appropriate calorie targets
          </li>
          <li>
            • <strong>Target Date:</strong> Allows us to pace your progress
            safely and sustainably
          </li>
        </ul>
      </div>
    </div>
  );
}
