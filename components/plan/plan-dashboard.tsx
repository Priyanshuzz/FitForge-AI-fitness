'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Play,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Flame,
  ChefHat,
  Dumbbell,
  Star,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { PlanOverview } from './plan-overview';
import { DailyPlanView } from './daily-plan-view';
import { getTodaysWorkout, getCurrentPlan } from '@/lib/actions/fitness-actions';
import type { DisplayPlan, DisplayWorkout, PlanDay } from '@/lib/types/fitness';

interface PlanDashboardProps {
  userId: string;
  onStartWorkout?: (workoutId: string) => void;
  onViewProgress?: () => void;
}

type ViewMode = 'dashboard' | 'plan-overview' | 'daily-view';

export function PlanDashboard({ userId, onStartWorkout, onViewProgress }: PlanDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [currentPlan, setCurrentPlan] = useState<DisplayPlan | null>(null);
  const [todaysWorkout, setTodaysWorkout] = useState<DisplayWorkout | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlanData();
  }, [userId]);

  const loadPlanData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [planResult, workoutResult] = await Promise.all([
        getCurrentPlan(),
        getTodaysWorkout()
      ]);

      if (planResult.success && planResult.plan) {
        setCurrentPlan(planResult.plan);
      }

      if (workoutResult.success && workoutResult.workout) {
        setTodaysWorkout(workoutResult.workout);
      }
    } catch (err) {
      setError('Failed to load your fitness plan');
      console.error('Error loading plan data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTodaysPlan = (): PlanDay | null => {
    if (!currentPlan) return null;
    
    const today = new Date();
    const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert Sunday=0 to Monday=0
    const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % currentPlan.weeks.length;
    
    return currentPlan.weeks[currentWeek]?.days[dayIndex] || null;
  };

  const getWeekProgress = () => {
    if (!currentPlan) return { completed: 0, total: 0, percentage: 0 };
    
    const currentWeekIndex = 0; // This should be calculated based on plan start date
    const currentWeek = currentPlan.weeks[currentWeekIndex];
    
    if (!currentWeek) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = currentWeek.days.filter(day => day.completed).length;
    const total = currentWeek.days.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  };

  const handleStartWorkout = (workoutId: string) => {
    onStartWorkout?.(workoutId);
  };

  const handleViewDay = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setViewMode('daily-view');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-8 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground mb-4">
            {error}
          </div>
          <Button onClick={loadPlanData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentPlan) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground mb-4">
            No active fitness plan found. Complete your intake assessment to get started!
          </div>
          <Button onClick={() => window.location.href = '/intake'}>
            Start Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Dashboard View
  if (viewMode === 'dashboard') {
    const todaysPlan = getTodaysPlan();
    const weekProgress = getWeekProgress();

    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Welcome back! 💪</h1>
                <p className="text-muted-foreground mt-1">
                  Ready to crush your fitness goals today?
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Week Progress</div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round(weekProgress.percentage)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{currentPlan.weeks.length}</div>
                  <div className="text-sm text-muted-foreground">Week Plan</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{weekProgress.completed}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{currentPlan.goal}</div>
                  <div className="text-sm text-muted-foreground">Goal</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">AI</div>
                  <div className="text-sm text-muted-foreground">Powered</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Plan */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Workout */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Dumbbell className="w-5 h-5 mr-2" />
                Today's Workout
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysPlan?.workout ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{todaysPlan.workout.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {todaysPlan.workout.type} • {todaysPlan.workout.difficulty}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      <span>{todaysPlan.workout.estimated_duration} min</span>
                    </div>
                    <div className="flex items-center">
                      <Flame className="w-4 h-4 mr-2 text-orange-600" />
                      <span>{todaysPlan.workout.estimated_calories} cal</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-2 text-green-600" />
                      <span>{todaysPlan.workout.exercises.length} exercises</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
                      <span>{todaysPlan.workout.target_muscle_groups.join(', ')}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleStartWorkout(todaysPlan.workout!.id)}
                      disabled={todaysPlan.completed}
                    >
                      {todaysPlan.completed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Now
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleViewDay(0)} // Today's index
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ) : todaysPlan?.is_rest_day ? (
                <div className="text-center py-6">
                  <Clock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Rest Day</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Take time to recover and let your body rebuild stronger
                  </p>
                  <Button variant="outline" onClick={() => handleViewDay(0)}>
                    View Rest Day Activities
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No workout scheduled for today
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Nutrition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChefHat className="w-5 h-5 mr-2" />
                Today's Nutrition
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysPlan?.meals && todaysPlan.meals.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="text-lg font-bold text-primary">
                        {todaysPlan.meals.reduce((sum, meal) => sum + meal.calories, 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Calories</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {todaysPlan.meals.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Meals</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {todaysPlan.meals.slice(0, 4).map((meal, index) => (
                      <div key={meal.id} className="flex justify-between text-sm">
                        <span className="capitalize">{meal.meal_type}</span>
                        <span className="text-muted-foreground">{meal.calories} cal</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleViewDay(0)}
                  >
                    View Meal Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No meal plan scheduled for today
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Week Progress */}
        <Card>
          <CardHeader>
            <CardTitle>This Week's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Week 1 Progress</span>
                <span className="text-sm text-muted-foreground">
                  {weekProgress.completed} of {weekProgress.total} days completed
                </span>
              </div>
              <Progress value={weekProgress.percentage} className="h-2" />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setViewMode('plan-overview')}
                >
                  View Full Plan
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={onViewProgress}
                >
                  Track Progress
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Plan Overview
  if (viewMode === 'plan-overview') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setViewMode('dashboard')}>
            ← Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Your Fitness Plan</h1>
          <div></div>
        </div>
        
        <PlanOverview
          plan={currentPlan}
          onViewDay={handleViewDay}
          onStartWorkout={handleStartWorkout}
        />
      </div>
    );
  }

  // Daily View
  if (viewMode === 'daily-view') {
    return (
      <DailyPlanView
        plan={currentPlan}
        dayIndex={selectedDayIndex}
        onBack={() => setViewMode('plan-overview')}
        onDayChange={setSelectedDayIndex}
        onWorkoutComplete={(workoutId) => {
          console.log('Workout completed:', workoutId);
          // Refresh plan data
          loadPlanData();
        }}
        onMealComplete={(mealId) => {
          console.log('Meal completed:', mealId);
        }}
      />
    );
  }

  return null;
}