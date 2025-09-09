'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkoutProgressChartProps {
  userId: string;
  height?: number;
  detailed?: boolean;
}

// Mock workout data - replace with actual API calls
const mockWorkoutData = [
  { date: '2024-01-15', type: 'STRENGTH', duration: 45, calories: 320 },
  { date: '2024-01-16', type: 'CARDIO', duration: 30, calories: 280 },
  { date: '2024-01-18', type: 'STRENGTH', duration: 50, calories: 350 },
  { date: '2024-01-20', type: 'YOGA', duration: 35, calories: 150 },
  { date: '2024-01-22', type: 'STRENGTH', duration: 45, calories: 320 },
  { date: '2024-01-23', type: 'CARDIO', duration: 40, calories: 310 },
  { date: '2024-01-25', type: 'STRENGTH', duration: 55, calories: 380 },
  { date: '2024-01-27', type: 'YOGA', duration: 30, calories: 140 },
  { date: '2024-01-29', type: 'CARDIO', duration: 35, calories: 290 },
  { date: '2024-01-31', type: 'STRENGTH', duration: 50, calories: 360 },
];

const WORKOUT_COLORS = {
  STRENGTH: '#3b82f6',
  CARDIO: '#ef4444',
  YOGA: '#10b981',
  FLEXIBILITY: '#f59e0b',
  SPORTS: '#8b5cf6',
};

export function WorkoutProgressChart({
  userId,
  height = 300,
  detailed = false,
}: WorkoutProgressChartProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [workoutData, setWorkoutData] = useState(mockWorkoutData);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysInWeek.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayWorkouts = workoutData.filter(w => w.date === dayStr);

      return {
        day: format(day, 'EEE'),
        date: dayStr,
        workouts: dayWorkouts.length,
        totalDuration: dayWorkouts.reduce((sum, w) => sum + w.duration, 0),
        totalCalories: dayWorkouts.reduce((sum, w) => sum + w.calories, 0),
        types: dayWorkouts.map(w => w.type),
      };
    });
  }, [workoutData]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Group by weeks in the month
    const weeks = [];
    let currentWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 });

    while (currentWeekStart <= monthEnd) {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const weekWorkouts = workoutData.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= currentWeekStart && workoutDate <= weekEnd;
      });

      weeks.push({
        week: format(currentWeekStart, 'MMM dd'),
        workouts: weekWorkouts.length,
        totalDuration: weekWorkouts.reduce((sum, w) => sum + w.duration, 0),
        totalCalories: weekWorkouts.reduce((sum, w) => sum + w.calories, 0),
      });

      currentWeekStart = new Date(currentWeekStart);
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeks;
  }, [workoutData]);

  const workoutTypeDistribution = useMemo(() => {
    const typeCounts = workoutData.reduce(
      (acc, workout) => {
        acc[workout.type] = (acc[workout.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count,
      color: WORKOUT_COLORS[type as keyof typeof WORKOUT_COLORS] || '#64748b',
    }));
  }, [workoutData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'workouts' && `Workouts: ${entry.value}`}
              {entry.dataKey === 'totalDuration' &&
                `Duration: ${entry.value} min`}
              {entry.dataKey === 'totalCalories' && `Calories: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartData = timeRange === 'week' ? weeklyData : monthlyData;

  if (!detailed) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey={timeRange === 'week' ? 'day' : 'week'}
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="workouts"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={timeRange}
        onValueChange={value => setTimeRange(value as 'week' | 'month')}
      >
        <TabsList>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange} className="space-y-6">
          {/* Workout Frequency */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Workout Frequency</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey={timeRange === 'week' ? 'day' : 'week'}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="workouts"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Workouts"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Duration & Calories */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">
                Total Duration (min)
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey={timeRange === 'week' ? 'day' : 'week'}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="totalDuration"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="Duration"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Calories Burned</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey={timeRange === 'week' ? 'day' : 'week'}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="totalCalories"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    name="Calories"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workout Type Distribution */}
          <div>
            <h4 className="text-lg font-semibold mb-4">
              Workout Type Distribution
            </h4>
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={250}>
                <PieChart>
                  <Pie
                    data={workoutTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {workoutTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex-1 space-y-2">
                {workoutTypeDistribution.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="font-medium">{entry.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {entry.value} sessions
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
