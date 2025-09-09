'use client';

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dumbbell,
  Zap,
  Heart,
  Waves,
  Target,
  Flower2,
  Activity,
  Shuffle,
} from 'lucide-react';
import { TrainingStyle, Equipment } from '@/lib/types/fitness';
import type { IntakeForm } from '@/lib/types/fitness';

interface FitnessAssessmentStepProps {
  data: Partial<IntakeForm>;
  errors: Record<string, string>;
  onChange: (data: Partial<IntakeForm>) => void;
}

const TRAINING_STYLES = [
  {
    value: TrainingStyle.STRENGTH,
    label: 'Strength Training',
    description: 'Build raw power and muscle strength',
    icon: Dumbbell,
    benefits: [
      'Increase bone density',
      'Build functional strength',
      'Improve metabolism',
    ],
  },
  {
    value: TrainingStyle.HYPERTROPHY,
    label: 'Muscle Building',
    description: 'Focus on muscle size and definition',
    icon: Target,
    benefits: [
      'Increase muscle mass',
      'Improve body composition',
      'Enhanced physique',
    ],
  },
  {
    value: TrainingStyle.HIIT,
    label: 'HIIT Training',
    description: 'High-intensity interval training',
    icon: Zap,
    benefits: [
      'Burn calories efficiently',
      'Improve cardiovascular health',
      'Time-efficient',
    ],
  },
  {
    value: TrainingStyle.ENDURANCE,
    label: 'Cardio & Endurance',
    description: 'Improve cardiovascular fitness',
    icon: Heart,
    benefits: ['Better heart health', 'Increased stamina', 'Enhanced recovery'],
  },
  {
    value: TrainingStyle.BODYWEIGHT,
    label: 'Bodyweight Training',
    description: 'Use your body as resistance',
    icon: Activity,
    benefits: [
      'No equipment needed',
      'Functional movements',
      'Improved mobility',
    ],
  },
  {
    value: TrainingStyle.YOGA,
    label: 'Yoga',
    description: 'Flexibility, balance, and mindfulness',
    icon: Flower2,
    benefits: ['Increased flexibility', 'Stress reduction', 'Better balance'],
  },
  {
    value: TrainingStyle.PILATES,
    label: 'Pilates',
    description: 'Core strength and stability',
    icon: Waves,
    benefits: [
      'Core strengthening',
      'Improved posture',
      'Mind-body connection',
    ],
  },
  {
    value: TrainingStyle.MIXED,
    label: 'Mixed Training',
    description: 'Variety of different training styles',
    icon: Shuffle,
    benefits: [
      'Prevents boredom',
      'Well-rounded fitness',
      'Adaptable approach',
    ],
  },
];

const EQUIPMENT_OPTIONS = [
  {
    value: Equipment.NONE,
    label: 'No Equipment',
    description: 'Bodyweight exercises only',
    category: 'Bodyweight',
  },
  {
    value: Equipment.DUMBBELLS,
    label: 'Dumbbells',
    description: 'Adjustable or fixed weights',
    category: 'Free Weights',
  },
  {
    value: Equipment.BARBELL,
    label: 'Barbell',
    description: 'Olympic or standard barbell',
    category: 'Free Weights',
  },
  {
    value: Equipment.KETTLEBELLS,
    label: 'Kettlebells',
    description: 'Various weights available',
    category: 'Free Weights',
  },
  {
    value: Equipment.RESISTANCE_BANDS,
    label: 'Resistance Bands',
    description: 'Portable and versatile',
    category: 'Accessories',
  },
  {
    value: Equipment.BENCH,
    label: 'Weight Bench',
    description: 'Adjustable or flat bench',
    category: 'Equipment',
  },
  {
    value: Equipment.CABLE_MACHINE,
    label: 'Cable Machine',
    description: 'Pulley system with weights',
    category: 'Machines',
  },
  {
    value: Equipment.PULL_UP_BAR,
    label: 'Pull-up Bar',
    description: 'Doorway or wall-mounted',
    category: 'Equipment',
  },
  {
    value: Equipment.CARDIO_EQUIPMENT,
    label: 'Cardio Equipment',
    description: 'Treadmill, bike, elliptical, etc.',
    category: 'Cardio',
  },
  {
    value: Equipment.FULL_GYM,
    label: 'Full Gym Access',
    description: 'Complete gym facility',
    category: 'Comprehensive',
  },
];

export function FitnessAssessmentStep({
  data,
  errors,
  onChange,
}: FitnessAssessmentStepProps) {
  const selectedTrainingStyles = data.training_styles || [];
  const selectedEquipment = data.equipment || [];

  const handleTrainingStyleChange = (
    style: TrainingStyle,
    checked: boolean
  ) => {
    const updated = checked
      ? [...selectedTrainingStyles, style]
      : selectedTrainingStyles.filter(s => s !== style);

    onChange({ training_styles: updated });
  };

  const handleEquipmentChange = (equipment: Equipment, checked: boolean) => {
    const updated = checked
      ? [...selectedEquipment, equipment]
      : selectedEquipment.filter(e => e !== equipment);

    onChange({ equipment: updated });
  };

  return (
    <div className="space-y-8">
      {/* Training Style Preferences */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold">
            Training Style Preferences *
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select all training styles that interest you (choose at least one)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRAINING_STYLES.map(style => {
            const Icon = style.icon;
            const isSelected = selectedTrainingStyles.includes(style.value);

            return (
              <Card
                key={style.value}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'hover:border-primary/50 hover:shadow-sm'
                }`}
                onClick={() =>
                  handleTrainingStyleChange(style.value, !isSelected)
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={checked =>
                        handleTrainingStyleChange(
                          style.value,
                          checked as boolean
                        )
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <h4 className="font-medium">{style.label}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {style.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {style.benefits.map((benefit, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {errors.training_styles && (
          <p className="text-sm text-destructive">{errors.training_styles}</p>
        )}

        {selectedTrainingStyles.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
            <p className="text-sm font-medium">
              Selected: {selectedTrainingStyles.length} style(s)
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedTrainingStyles.map(style => (
                <Badge key={style} variant="default" className="text-xs">
                  {TRAINING_STYLES.find(s => s.value === style)?.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Available Equipment */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold">Available Equipment *</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select all equipment you have access to (choose at least one)
          </p>
        </div>

        {/* Group equipment by category */}
        {[
          'Bodyweight',
          'Free Weights',
          'Accessories',
          'Equipment',
          'Machines',
          'Cardio',
          'Comprehensive',
        ].map(category => {
          const categoryEquipment = EQUIPMENT_OPTIONS.filter(
            eq => eq.category === category
          );

          if (categoryEquipment.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h4 className="font-medium text-primary">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryEquipment.map(equipment => {
                  const isSelected = selectedEquipment.includes(
                    equipment.value
                  );

                  return (
                    <Card
                      key={equipment.value}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() =>
                        handleEquipmentChange(equipment.value, !isSelected)
                      }
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={checked =>
                              handleEquipmentChange(
                                equipment.value,
                                checked as boolean
                              )
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">
                              {equipment.label}
                            </h5>
                            <p className="text-xs text-muted-foreground mt-1">
                              {equipment.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {errors.equipment && (
          <p className="text-sm text-destructive">{errors.equipment}</p>
        )}

        {selectedEquipment.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
            <p className="text-sm font-medium">
              Selected: {selectedEquipment.length} equipment type(s)
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedEquipment.map(eq => (
                <Badge key={eq} variant="default" className="text-xs">
                  {EQUIPMENT_OPTIONS.find(e => e.value === eq)?.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">🎯 Training Optimization</h4>
        <ul className="text-sm space-y-1">
          <li>
            • <strong>Multiple styles:</strong> Creates variety and prevents
            plateaus
          </li>
          <li>
            • <strong>Equipment flexibility:</strong> More options = more
            exercise variety
          </li>
          <li>
            • <strong>No equipment?</strong> Bodyweight training can be highly
            effective
          </li>
          <li>
            • <strong>Full gym access:</strong> Unlocks the most comprehensive
            program options
          </li>
        </ul>
      </div>
    </div>
  );
}
