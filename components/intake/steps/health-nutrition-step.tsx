'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Leaf, Fish, Wheat, Milk } from 'lucide-react';
import { DietPreference } from '@/lib/types/fitness';
import type { IntakeForm } from '@/lib/types/fitness';

interface HealthNutritionStepProps {
  data: Partial<IntakeForm>;
  errors: Record<string, string>;
  onChange: (data: Partial<IntakeForm>) => void;
}

const DIET_PREFERENCES = [
  {
    value: DietPreference.NO_RESTRICTIONS,
    label: 'No Dietary Restrictions',
    description: 'I eat everything',
    icon: null,
    details: 'Full variety of foods and cooking styles',
  },
  {
    value: DietPreference.VEGETARIAN,
    label: 'Vegetarian',
    description: 'No meat, but dairy and eggs are okay',
    icon: Leaf,
    details: 'Plant-based with dairy and eggs',
  },
  {
    value: DietPreference.VEGAN,
    label: 'Vegan',
    description: 'No animal products at all',
    icon: Leaf,
    details: 'Completely plant-based nutrition',
  },
  {
    value: DietPreference.PESCATARIAN,
    label: 'Pescatarian',
    description: 'No meat except fish and seafood',
    icon: Fish,
    details: 'Fish, dairy, eggs, and plants',
  },
  {
    value: DietPreference.KETO,
    label: 'Ketogenic',
    description: 'Very low carb, high fat',
    icon: null,
    details: 'High fat, moderate protein, very low carb',
  },
  {
    value: DietPreference.MEDITERRANEAN,
    label: 'Mediterranean',
    description: 'Focus on whole foods, olive oil, fish',
    icon: null,
    details: 'Traditional Mediterranean eating patterns',
  },
  {
    value: DietPreference.PALEO,
    label: 'Paleo',
    description: 'Whole foods, no processed foods',
    icon: null,
    details: 'No grains, legumes, or processed foods',
  },
  {
    value: DietPreference.INTERMITTENT_FASTING,
    label: 'Intermittent Fasting',
    description: 'Time-restricted eating windows',
    icon: null,
    details: 'Specific eating and fasting periods',
  },
];

const COMMON_ALLERGIES = [
  'Nuts (tree nuts)',
  'Peanuts',
  'Dairy/Lactose',
  'Gluten/Wheat',
  'Eggs',
  'Soy',
  'Shellfish',
  'Fish',
  'Sesame',
  'None',
];

const CUISINE_TYPES = [
  'American',
  'Italian',
  'Mexican',
  'Asian',
  'Indian',
  'Mediterranean',
  'French',
  'Japanese',
  'Thai',
  'Chinese',
  'Greek',
  'Middle Eastern',
  'Korean',
  'Vietnamese',
  'Spanish',
  'British',
  'German',
  'Russian',
];

export function HealthNutritionStep({
  data,
  errors,
  onChange,
}: HealthNutritionStepProps) {
  const selectedDietPreferences = data.diet_preferences || [];
  const selectedCuisines = data.cuisine_preferences || [];

  const handleInputChange = (field: keyof IntakeForm, value: any) => {
    onChange({ [field]: value });
  };

  const handleDietPreferenceChange = (
    preference: DietPreference,
    checked: boolean
  ) => {
    let updated = checked
      ? [...selectedDietPreferences, preference]
      : selectedDietPreferences.filter(p => p !== preference);

    // If "No Restrictions" is selected, remove all others
    if (preference === DietPreference.NO_RESTRICTIONS && checked) {
      updated = [DietPreference.NO_RESTRICTIONS];
    }
    // If any other preference is selected, remove "No Restrictions"
    else if (checked && preference !== DietPreference.NO_RESTRICTIONS) {
      updated = updated.filter(p => p !== DietPreference.NO_RESTRICTIONS);
    }

    onChange({ diet_preferences: updated });
  };

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    const updated = checked
      ? [...selectedCuisines, cuisine]
      : selectedCuisines.filter(c => c !== cuisine);

    onChange({ cuisine_preferences: updated });
  };

  return (
    <div className="space-y-8">
      {/* Health Conditions & Injuries */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="injuries" className="text-lg font-semibold">
            Health Conditions & Physical Limitations
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Please describe any injuries, health conditions, or physical
            limitations we should consider
          </p>
        </div>

        <div className="space-y-3">
          <Textarea
            id="injuries"
            placeholder="e.g., Lower back pain, knee injury, high blood pressure, diabetes, etc."
            value={data.injuries_limitations || ''}
            onChange={e =>
              handleInputChange('injuries_limitations', e.target.value)
            }
            rows={4}
            className={errors.injuries_limitations ? 'border-destructive' : ''}
          />

          <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Important Medical Disclaimer</p>
              <p className="mt-1">
                This app provides fitness guidance only and cannot replace
                medical advice. Please consult healthcare professionals for any
                medical conditions or concerns.
              </p>
            </div>
          </div>
        </div>

        {errors.injuries_limitations && (
          <p className="text-sm text-destructive">
            {errors.injuries_limitations}
          </p>
        )}
      </div>

      {/* Dietary Preferences */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold">Dietary Preferences</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select all that apply to your eating style
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DIET_PREFERENCES.map(diet => {
            const Icon = diet.icon;
            const isSelected = selectedDietPreferences.includes(diet.value);

            return (
              <Card
                key={diet.value}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() =>
                  handleDietPreferenceChange(diet.value, !isSelected)
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={checked =>
                        handleDietPreferenceChange(
                          diet.value,
                          checked as boolean
                        )
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {Icon && <Icon className="w-4 h-4 text-primary" />}
                        <h4 className="font-medium">{diet.label}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {diet.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {diet.details}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedDietPreferences.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
            <p className="text-sm font-medium">Selected dietary preferences:</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedDietPreferences.map(pref => (
                <Badge key={pref} variant="default" className="text-xs">
                  {DIET_PREFERENCES.find(d => d.value === pref)?.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Food Allergies */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="allergies" className="text-lg font-semibold">
            Food Allergies & Intolerances
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            List any food allergies or intolerances that affect your diet
          </p>
        </div>

        <div className="space-y-3">
          <Textarea
            id="allergies"
            placeholder="e.g., Peanut allergy, lactose intolerant, gluten sensitivity..."
            value={data.food_allergies || ''}
            onChange={e => handleInputChange('food_allergies', e.target.value)}
            rows={3}
            className={errors.food_allergies ? 'border-destructive' : ''}
          />

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-2">
              Common allergies & intolerances:
            </p>
            <div className="flex flex-wrap gap-1">
              {COMMON_ALLERGIES.map(allergy => (
                <Badge key={allergy} variant="outline" className="text-xs">
                  {allergy}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {errors.food_allergies && (
          <p className="text-sm text-destructive">{errors.food_allergies}</p>
        )}
      </div>

      {/* Cuisine Preferences */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold">
            Preferred Cuisines (Optional)
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select cuisines you enjoy - this helps us suggest meals you'll love
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {CUISINE_TYPES.map(cuisine => {
            const isSelected = selectedCuisines.includes(cuisine);

            return (
              <Card
                key={cuisine}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleCuisineChange(cuisine, !isSelected)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={checked =>
                        handleCuisineChange(cuisine, checked as boolean)
                      }
                    />
                    <span className="text-sm font-medium">{cuisine}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedCuisines.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
            <p className="text-sm font-medium">
              Selected cuisines ({selectedCuisines.length}):
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedCuisines.map(cuisine => (
                <Badge key={cuisine} variant="default" className="text-xs">
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Foods to Avoid */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="avoid" className="text-lg font-semibold">
            Foods to Avoid (Optional)
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Any specific foods you dislike or prefer not to eat
          </p>
        </div>

        <Textarea
          id="avoid"
          placeholder="e.g., Mushrooms, spicy food, organ meats, etc."
          value={data.foods_to_avoid || ''}
          onChange={e => handleInputChange('foods_to_avoid', e.target.value)}
          rows={3}
          className={errors.foods_to_avoid ? 'border-destructive' : ''}
        />

        {errors.foods_to_avoid && (
          <p className="text-sm text-destructive">{errors.foods_to_avoid}</p>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">🍽️ Nutrition Personalization</h4>
        <ul className="text-sm space-y-1">
          <li>
            • <strong>Safety first:</strong> We'll avoid all foods you're
            allergic to
          </li>
          <li>
            • <strong>Dietary preferences:</strong> Meal plans will match your
            eating style
          </li>
          <li>
            • <strong>Cuisine variety:</strong> More preferences = more diverse
            meal options
          </li>
          <li>
            • <strong>Flexible approach:</strong> All preferences can be
            adjusted later
          </li>
        </ul>
      </div>
    </div>
  );
}
