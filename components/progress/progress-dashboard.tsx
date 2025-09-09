'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Camera,
  Plus,
  BarChart3,
  LineChart,
  Activity,
  Award,
  Flame,
  Clock,
  Zap,
} from 'lucide-react';
import { WeightChart } from './weight-chart';
import { BodyMeasurementsChart } from './body-measurements-chart';
import { WorkoutProgressChart } from './workout-progress-chart';
import { NutritionChart } from './nutrition-chart';
import { ProgressPhotos } from './progress-photos';
import { AchievementsBadges } from './achievements-badges';
import {
  ProgressEntry,
  UserAnalytics,
  TrainingStyle,
} from '@/lib/types/fitness';

interface ProgressDashboardProps {
  userId: string;
  onAddEntry?: () => void;
  onTakePhoto?: () => void;
}

export function ProgressDashboard({
  userId,
  onAddEntry,
  onTakePhoto,
}: ProgressDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, [userId, loadProgressData]);

  const loadProgressData = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const [entriesResult, analyticsResult] = await Promise.all([
      //   getProgressEntries(userId),
      //   getUserAnalytics(userId)
      // ]);

      // Mock data for demonstration
      const mockEntries: ProgressEntry[] = [
        {
          id: '1',
          user_id: userId,
          entry_date: '2024-01-01',
          weight_kg: 75.0,
          body_fat_percentage: 18.5,
          waist_circumference: 85,
          chest_circumference: 102,
          mood_rating: 4,
          energy_level: 3,
          notes: 'Starting my fitness journey!',
          created_at: '2024-01-01T10:00:00Z',
        },
        {
          id: '2',
          user_id: userId,
          entry_date: '2024-01-15',
          weight_kg: 73.5,
          body_fat_percentage: 17.2,
          waist_circumference: 83,
          chest_circumference: 103,
          mood_rating: 4,
          energy_level: 4,
          notes: 'Feeling stronger and more energetic!',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '3',
          user_id: userId,
          entry_date: '2024-02-01',
          weight_kg: 72.0,
          body_fat_percentage: 16.1,
          waist_circumference: 81,
          chest_circumference: 104,
          mood_rating: 5,
          energy_level: 5,
          notes: 'Amazing progress! Love the new routine.',
          created_at: '2024-02-01T10:00:00Z',
        },
      ];

      const mockAnalytics: UserAnalytics = {
        total_workouts_completed: 45,
        total_meals_logged: 120,
        streak_days: 18,
        weight_change_kg: -3.0,
        plan_adherence_percentage: 87,
        favorite_workout_types: ['STRENGTH', 'CARDIO'] as any[],
        average_workout_rating: 4.3,
        last_active_date: '2024-02-01',
      };

      setProgressEntries(mockEntries);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getLatestEntry = () => {
    return progressEntries.length > 0
      ? progressEntries[progressEntries.length - 1]
      : null;
  };

  const getWeightChange = () => {
    if (progressEntries.length < 2) return null;
    const latest = progressEntries[progressEntries.length - 1];
    const previous = progressEntries[progressEntries.length - 2];
    return latest.weight_kg! - previous.weight_kg!;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
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

  const latestEntry = getLatestEntry();
  const weightChange = getWeightChange();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progress Tracking</h1>
          <p className="text-muted-foreground">
            Track your fitness journey and celebrate your achievements
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onTakePhoto}>
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
          <Button onClick={onAddEntry}>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {latestEntry?.weight_kg?.toFixed(1) || '--'} kg
                </div>
                <div className="text-sm text-muted-foreground flex items-center">
                  Current Weight
                  {weightChange && (
                    <span
                      className={`ml-2 flex items-center ${
                        weightChange < 0 ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      {weightChange < 0 ? (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(weightChange).toFixed(1)}kg
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {analytics?.streak_days || 0}
                </div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {analytics?.total_workouts_completed || 0}
                </div>
                <div className="text-sm text-muted-foreground">Workouts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {analytics?.plan_adherence_percentage || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Adherence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="measurements">Body</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressEntries
                    .slice(-3)
                    .reverse()
                    .map(entry => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {new Date(entry.entry_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.weight_kg}kg • {entry.body_fat_percentage}%
                            BF
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            Mood: {entry.mood_rating}/5
                          </Badge>
                          <Badge variant="outline">
                            Energy: {entry.energy_level}/5
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <AchievementsBadges analytics={analytics} />
              </CardContent>
            </Card>
          </div>

          {/* Summary Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="w-5 h-5 mr-2" />
                  Weight Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WeightChart data={progressEntries} height={300} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Workout Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WorkoutProgressChart userId={userId} height={300} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weight" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Weight Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <WeightChart data={progressEntries} height={400} showTrendline />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Body Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              <BodyMeasurementsChart data={progressEntries} height={400} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workout Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkoutProgressChart userId={userId} height={400} detailed />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <NutritionChart userId={userId} height={400} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <ProgressPhotos userId={userId} onTakePhoto={onTakePhoto} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
