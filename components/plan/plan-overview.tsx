'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Clock,
  Target,
  Flame,
  TrendingUp,
  ChefHat,
  Dumbbell,
  CheckCircle2,
  Circle,
  Star,
  Calendar as CalendarIcon
} from 'lucide-react';
import type { DisplayPlan } from '@/lib/types/fitness';

interface PlanOverviewProps {
  plan: DisplayPlan;
  onViewDay?: (dayIndex: number) => void;
  onStartWorkout?: (workoutId: string) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function PlanOverview({ plan, onViewDay, onStartWorkout }: PlanOverviewProps) {
  const [selectedWeek, setSelectedWeek] = useState(0);
  
  const currentWeek = plan.weeks[selectedWeek];
  const completedDays = currentWeek?.days.filter(day => day.completed).length || 0;
  const totalDays = currentWeek?.days.length || 0;
  const weekProgress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  const totalWorkouts = plan.weeks.reduce((total, week) => 
    total + week.days.filter(day => day.workout).length, 0);
  const completedWorkouts = plan.weeks.reduce((total, week) => 
    total + week.days.filter(day => day.workout && day.completed).length, 0);

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Your Personalized Plan</CardTitle>
              <p className="text-muted-foreground mt-1">
                AI-crafted for your {plan.goal} journey
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                <Star className="w-3 h-3 mr-1" />
                Week {selectedWeek + 1} of {plan.weeks.length}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{plan.weeks.length}</div>
              <div className="text-sm text-muted-foreground">Weeks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{totalWorkouts}</div>
              <div className="text-sm text-muted-foreground">Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedWorkouts}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((completedWorkouts / totalWorkouts) * 100) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Week Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Week {selectedWeek + 1}</h3>
        <div className="flex space-x-2">
          {plan.weeks.map((_, index) => (
            <Button
              key={index}
              variant={selectedWeek === index ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedWeek(index)}
            >
              Week {index + 1}
            </Button>
          ))}
        </div>
      </div>

      {/* Week Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Week Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedDays} of {totalDays} days completed
            </span>
          </div>
          <Progress value={weekProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Daily Overview */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition Plan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="space-y-4">
          <div className="grid gap-4">
            {currentWeek?.days.map((day, dayIndex) => (
              <motion.div
                key={dayIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.1 }}
              >
                <Card className={`cursor-pointer transition-all hover:shadow-md ${
                  day.completed ? 'border-green-200 bg-green-50/50' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {day.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground" />
                          )}
                          <div>
                            <h4 className="font-semibold">
                              {DAYS_OF_WEEK[dayIndex]} - Day {dayIndex + 1}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {day.date}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {day.workout && (
                            <div className="flex items-center space-x-1 text-primary">
                              <Dumbbell className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {day.workout.name}
                              </span>
                            </div>
                          )}
                          
                          {day.is_rest_day && (
                            <Badge variant="secondary" className="text-xs">
                              Rest Day
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {day.workout && (
                          <div className="text-right text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {day.workout.estimated_duration} min
                            </div>
                            <div className="flex items-center">
                              <Target className="w-3 h-3 mr-1" />
                              {day.workout.exercises.length} exercises
                            </div>
                          </div>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDay?.(dayIndex)}
                        >
                          View Details
                        </Button>
                        
                        {day.workout && !day.completed && (
                          <Button
                            size="sm"
                            onClick={() => onStartWorkout?.(day.workout!.id)}
                          >
                            Start Workout
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {day.workout && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-2 text-primary" />
                            <span>{day.workout.target_muscle_groups.join(', ')}</span>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                            <span>Difficulty: {day.workout.difficulty}</span>
                          </div>
                          <div className="flex items-center">
                            <Flame className="w-4 h-4 mr-2 text-orange-600" />
                            <span>~{day.workout.estimated_calories} cal</span>
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-blue-600" />
                            <span>{day.workout.type}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChefHat className="w-5 h-5 mr-2" />
                Weekly Nutrition Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {currentWeek?.nutrition_targets?.daily_calories || 2000}
                  </div>
                  <div className="text-sm text-muted-foreground">Daily Calories</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {currentWeek?.nutrition_targets?.protein_grams || 150}g
                  </div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentWeek?.nutrition_targets?.carbs_grams || 200}g
                  </div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {currentWeek?.nutrition_targets?.fat_grams || 80}g
                  </div>
                  <div className="text-sm text-muted-foreground">Fats</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {currentWeek?.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="font-medium">
                      {DAYS_OF_WEEK[dayIndex]}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {day.meals?.length || 0} meals planned
                    </div>
                    <Button variant="ghost" size="sm">
                      View Meals
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}