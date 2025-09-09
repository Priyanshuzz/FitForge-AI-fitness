'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play,
  Calendar,
  Target,
  Camera,
  Scale,
  Utensils,
  FileText,
  Clock,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ChatContext } from '@/lib/types/fitness';

interface QuickActionsProps {
  userId: string;
  context?: ChatContext;
  onActionComplete: (message: string) => void;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'workout' | 'nutrition' | 'progress' | 'planning';
  requiresInput?: boolean;
  component?: React.ReactNode;
}

export function QuickActions({ userId, context, onActionComplete }: QuickActionsProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [actionData, setActionData] = useState<Record<string, any>>({});

  const quickActions: QuickAction[] = [
    {
      id: 'start-workout',
      title: 'Start Today\'s Workout',
      description: 'Begin your scheduled workout for today',
      icon: <Play className="w-5 h-5" />,
      category: 'workout'
    },
    {
      id: 'log-weight',
      title: 'Log Current Weight',
      description: 'Quick weight entry for progress tracking',
      icon: <Scale className="w-5 h-5" />,
      category: 'progress',
      requiresInput: true
    },
    {
      id: 'log-meal',
      title: 'Log a Meal',
      description: 'Record what you ate for nutrition tracking',
      icon: <Utensils className="w-5 h-5" />,
      category: 'nutrition',
      requiresInput: true
    },
    {
      id: 'take-progress-photo',
      title: 'Take Progress Photo',
      description: 'Capture a progress photo for visual tracking',
      icon: <Camera className="w-5 h-5" />,
      category: 'progress'
    },
    {
      id: 'set-goal',
      title: 'Set New Goal',
      description: 'Define a new fitness or nutrition goal',
      icon: <Target className="w-5 h-5" />,
      category: 'planning',
      requiresInput: true
    },
    {
      id: 'schedule-workout',
      title: 'Schedule Next Workout',
      description: 'Plan your next training session',
      icon: <Calendar className="w-5 h-5" />,
      category: 'planning',
      requiresInput: true
    },
    {
      id: 'add-note',
      title: 'Add Progress Note',
      description: 'Record thoughts, feelings, or observations',
      icon: <FileText className="w-5 h-5" />,
      category: 'progress',
      requiresInput: true
    },
    {
      id: 'workout-timer',
      title: 'Start Workout Timer',
      description: 'Time your workout session',
      icon: <Clock className="w-5 h-5" />,
      category: 'workout'
    }
  ];

  const categories = [
    { value: 'workout', label: 'Workout', color: 'bg-blue-100 text-blue-800' },
    { value: 'nutrition', label: 'Nutrition', color: 'bg-green-100 text-green-800' },
    { value: 'progress', label: 'Progress', color: 'bg-purple-100 text-purple-800' },
    { value: 'planning', label: 'Planning', color: 'bg-orange-100 text-orange-800' }
  ];

  const executeAction = async (actionId: string) => {
    setIsExecuting(true);
    
    try {
      let resultMessage = '';
      
      switch (actionId) {
        case 'start-workout':
          resultMessage = '🏋️ Workout started! I\'ve begun tracking your session. Remember to maintain proper form and stay hydrated!';
          break;
          
        case 'log-weight':
          const weight = actionData.weight;
          resultMessage = `⚖️ Weight logged: ${weight}kg. Great job staying consistent with tracking! I can see your progress trends and will update your plan accordingly.`;
          break;
          
        case 'log-meal':
          const mealName = actionData.mealName;
          const calories = actionData.calories;
          resultMessage = `🍽️ Meal logged: "${mealName}" (${calories} calories). Your nutrition tracking helps me provide better meal recommendations and ensures you're hitting your targets!`;
          break;
          
        case 'take-progress-photo':
          resultMessage = '📸 Progress photo captured! Visual progress is incredibly motivating. I can help you compare with previous photos to see your amazing transformation!';
          break;
          
        case 'set-goal':
          const goalTitle = actionData.goalTitle;
          const goalTarget = actionData.goalTarget;
          resultMessage = `🎯 New goal set: "${goalTitle}" with target: ${goalTarget}. I\'ll help you create a plan to achieve this and track your progress along the way!`;
          break;
          
        case 'schedule-workout':
          const workoutDate = actionData.workoutDate;
          const workoutType = actionData.workoutType;
          resultMessage = `📅 Workout scheduled: ${workoutType} on ${workoutDate}. I\'ll send you a reminder and prepare the optimal workout for that day!`;
          break;
          
        case 'add-note':
          const note = actionData.note;
          resultMessage = `📝 Progress note added: "${note}". These insights help me understand your journey better and provide more personalized guidance!`;
          break;
          
        case 'workout-timer':
          resultMessage = '⏱️ Workout timer started! I\'ll track your session duration and help you maintain optimal rest periods between sets. Focus on quality reps!';
          break;
          
        default:
          resultMessage = '✅ Action completed successfully!';
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onActionComplete(resultMessage);
      setSelectedAction(null);
      setActionData({});
      
    } catch (error) {
      console.error('Action execution failed:', error);
      onActionComplete('❌ Sorry, I encountered an error while executing that action. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  const ActionForm = ({ action }: { action: QuickAction }) => {
    switch (action.id) {
      case 'log-weight':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="75.5"
                value={actionData.weight || ''}
                onChange={(e) => setActionData({...actionData, weight: e.target.value})}
              />
            </div>
          </div>
        );
        
      case 'log-meal':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mealName">Meal Name</Label>
              <Input
                id="mealName"
                placeholder="Grilled chicken salad"
                value={actionData.mealName || ''}
                onChange={(e) => setActionData({...actionData, mealName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="calories">Estimated Calories</Label>
              <Input
                id="calories"
                type="number"
                placeholder="450"
                value={actionData.calories || ''}
                onChange={(e) => setActionData({...actionData, calories: e.target.value})}
              />
            </div>
          </div>
        );
        
      case 'set-goal':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="goalTitle">Goal Title</Label>
              <Input
                id="goalTitle"
                placeholder="Lose 5kg in 3 months"
                value={actionData.goalTitle || ''}
                onChange={(e) => setActionData({...actionData, goalTitle: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="goalTarget">Target/Deadline</Label>
              <Input
                id="goalTarget"
                placeholder="March 15, 2024"
                value={actionData.goalTarget || ''}
                onChange={(e) => setActionData({...actionData, goalTarget: e.target.value})}
              />
            </div>
          </div>
        );
        
      case 'schedule-workout':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="workoutDate">Workout Date</Label>
              <Input
                id="workoutDate"
                type="date"
                value={actionData.workoutDate || ''}
                onChange={(e) => setActionData({...actionData, workoutDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="workoutType">Workout Type</Label>
              <Input
                id="workoutType"
                placeholder="Upper Body Strength"
                value={actionData.workoutType || ''}
                onChange={(e) => setActionData({...actionData, workoutType: e.target.value})}
              />
            </div>
          </div>
        );
        
      case 'add-note':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="note">Progress Note</Label>
              <Textarea
                id="note"
                placeholder="Feeling stronger today, increased weights on squats..."
                value={actionData.note || ''}
                onChange={(e) => setActionData({...actionData, note: e.target.value})}
                rows={3}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const selectedActionDetails = quickActions.find(a => a.id === selectedAction);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
        <p className="text-sm text-muted-foreground">
          Perform common tasks quickly without typing
        </p>
      </div>

      {selectedAction ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {selectedActionDetails?.icon}
              <span>{selectedActionDetails?.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedActionDetails?.requiresInput && (
              <ActionForm action={selectedActionDetails} />
            )}
            
            <div className="flex space-x-2">
              <Button
                onClick={() => executeAction(selectedAction)}
                disabled={isExecuting}
                className="flex-1"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Execute Action
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedAction(null);
                  setActionData({});
                }}
                disabled={isExecuting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {quickActions.map((action, index) => {
            const category = categories.find(c => c.value === action.category);
            
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
                  onClick={() => setSelectedAction(action.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <div className="text-primary">
                          {action.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {action.title}
                          </h4>
                          {category && (
                            <Badge variant="secondary" className={`text-xs ${category.color}`}>
                              {category.label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                        </p>
                        {action.requiresInput && (
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Requires input
                          </div>
                        )}
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}