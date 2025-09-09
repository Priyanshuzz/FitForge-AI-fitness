'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  Target,
  Flame,
  TrendingUp,
  ChefHat,
  Dumbbell,
  ArrowLeft,
  ArrowRight,
  Play,
  CheckCircle2
} from 'lucide-react';
import { WorkoutDisplay } from './workout-display';
import { MealPlanDisplay } from './meal-plan-display';
import type { DisplayPlan, PlanDay } from '@/lib/types/fitness';

interface DailyPlanViewProps {
  plan: DisplayPlan;
  dayIndex: number;
  onBack?: () => void;
  onDayChange?: (newDayIndex: number) => void;
  onWorkoutComplete?: (workoutId: string) => void;
  onMealComplete?: (mealId: string) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function DailyPlanView({ 
  plan, 
  dayIndex, 
  onBack, 
  onDayChange, 
  onWorkoutComplete,
  onMealComplete 
}: DailyPlanViewProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'workout' | 'nutrition'>('overview');
  
  const currentWeek = Math.floor(dayIndex / 7);
  const dayInWeek = dayIndex % 7;
  const planDay = plan.weeks[currentWeek]?.days[dayInWeek];
  
  if (!planDay) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Day not found</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const canGoPrevious = dayIndex > 0;
  const canGoNext = dayIndex < (plan.weeks.length * 7) - 1;

  const handlePreviousDay = () => {
    if (canGoPrevious) {
      onDayChange?.(dayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (canGoNext) {
      onDayChange?.(dayIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plan
        </Button>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePreviousDay}
            disabled={!canGoPrevious}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold">
              {DAYS_OF_WEEK[dayInWeek]} - Day {dayIndex + 1}
            </h2>
            <p className="text-sm text-muted-foreground">
              Week {currentWeek + 1} • {planDay.date}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleNextDay}
            disabled={!canGoNext}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="w-24" /> {/* Spacer for balance */}
      </div>

      {/* Day Status & Quick Stats */}
      <Card className={`${
        planDay.completed 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
          : planDay.is_rest_day 
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
            : 'bg-gradient-to-r from-primary/5 to-secondary/5'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {planDay.completed ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : planDay.is_rest_day ? (
                <Clock className="w-8 h-8 text-blue-600" />
              ) : (
                <Target className="w-8 h-8 text-primary" />
              )}
              
              <div>
                <h3 className="text-xl font-bold">
                  {planDay.is_rest_day ? 'Rest Day' : 'Training Day'}
                </h3>
                <p className="text-muted-foreground">
                  {planDay.completed ? 'Completed' : 'Ready to start'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              {planDay.workout && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {planDay.workout.exercises.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Exercises</div>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {(planDay.workout?.estimated_calories || 0) + 
                   (planDay.meals?.reduce((sum, meal) => sum + meal.calories, 0) || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Cal</div>
              </div>
              
              {planDay.meals && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {planDay.meals.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Meals</div>
                </div>
              )}
            </div>
          </div>
          
          {planDay.is_rest_day && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">🧘‍♀️ Rest Day Activities</h4>
              <p className="text-sm text-muted-foreground">
                Take time to recover with light stretching, walking, or meditation. 
                Your body grows stronger during rest!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workout" disabled={!planDay.workout}>
            <Dumbbell className="w-4 h-4 mr-2" />
            Workout
          </TabsTrigger>
          <TabsTrigger value="nutrition" disabled={!planDay.meals?.length}>
            <ChefHat className="w-4 h-4 mr-2" />
            Nutrition
          </TabsTrigger>
        </TabsList>
        
        <AnimatePresence mode="wait">
          <TabsContent value="overview" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Daily Summary Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Workout Summary */}
                {planDay.workout && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Dumbbell className="w-5 h-5 mr-2" />
                        Today's Workout
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-lg">{planDay.workout.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {planDay.workout.type} • {planDay.workout.difficulty}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-blue-600" />
                            <span>{planDay.workout.estimated_duration} min</span>
                          </div>
                          <div className="flex items-center">
                            <Flame className="w-4 h-4 mr-2 text-orange-600" />
                            <span>{planDay.workout.estimated_calories} cal</span>
                          </div>
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-2 text-green-600" />
                            <span>{planDay.workout.exercises.length} exercises</span>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
                            <span>{planDay.workout.target_muscle_groups.join(', ')}</span>
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <Button 
                            className="w-full" 
                            onClick={() => setSelectedTab('workout')}
                            disabled={planDay.completed}
                          >
                            {planDay.completed ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Workout Completed
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Start Workout
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Nutrition Summary */}
                {planDay.meals && planDay.meals.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ChefHat className="w-5 h-5 mr-2" />
                        Nutrition Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-primary/5 rounded-lg">
                            <div className="text-lg font-bold text-primary">
                              {planDay.meals.reduce((sum, meal) => sum + meal.calories, 0)}
                            </div>
                            <div className="text-xs text-muted-foreground">Calories</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                              {planDay.meals.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Meals</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {planDay.meals.slice(0, 3).map((meal, index) => (
                            <div key={meal.id} className="flex justify-between text-sm">
                              <span className="capitalize">{meal.meal_type}</span>
                              <span className="text-muted-foreground">{meal.calories} cal</span>
                            </div>
                          ))}
                          {planDay.meals.length > 3 && (
                            <div className="text-sm text-muted-foreground text-center">
                              +{planDay.meals.length - 3} more meals
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-3 border-t">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setSelectedTab('nutrition')}
                          >
                            View Meal Plan
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Daily Notes */}
              {planDay.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{planDay.notes}</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="workout" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {planDay.workout && (
                <WorkoutDisplay
                  workout={planDay.workout}
                  onComplete={() => onWorkoutComplete?.(planDay.workout!.id)}
                  isActive={!planDay.completed}
                />
              )}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="nutrition" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {planDay.meals && (
                <MealPlanDisplay
                  mealPlan={{
                    id: `day-${dayIndex}`,
                    date: planDay.date,
                    meals: planDay.meals,
                    target_calories: planDay.nutrition_targets?.daily_calories || 2000,
                    target_protein: planDay.nutrition_targets?.protein_grams || 150,
                    target_carbs: planDay.nutrition_targets?.carbs_grams || 200,
                    target_fat: planDay.nutrition_targets?.fat_grams || 80
                  }}
                  date={planDay.date}
                  onMealComplete={onMealComplete}
                />
              )}
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}