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
  LineChart,
  Line
} from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NutritionChartProps {
  userId: string;
  height?: number;
}

// Mock nutrition data - replace with actual API calls
const mockNutritionData = [
  { date: '2024-01-15', calories: 2100, protein: 140, carbs: 250, fat: 70, meals_logged: 4 },
  { date: '2024-01-16', calories: 1950, protein: 130, carbs: 200, fat: 75, meals_logged: 3 },
  { date: '2024-01-17', calories: 2200, protein: 150, carbs: 280, fat: 65, meals_logged: 4 },
  { date: '2024-01-18', calories: 2050, protein: 135, carbs: 220, fat: 80, meals_logged: 4 },
  { date: '2024-01-19', calories: 1850, protein: 120, carbs: 180, fat: 70, meals_logged: 3 },
  { date: '2024-01-20', calories: 2150, protein: 145, carbs: 260, fat: 68, meals_logged: 4 },
  { date: '2024-01-21', calories: 2000, protein: 138, carbs: 240, fat: 72, meals_logged: 4 },
];

const NUTRITION_COLORS = {
  protein: '#3b82f6',
  carbs: '#10b981',
  fat: '#f59e0b',
  calories: '#ef4444'
};

export function NutritionChart({ userId, height = 400 }: NutritionChartProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [nutritionData, setNutritionData] = useState(mockNutritionData);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysInWeek.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayData = nutritionData.find(n => n.date === dayStr);
      
      return {
        day: format(day, 'EEE'),
        date: dayStr,
        calories: dayData?.calories || 0,
        protein: dayData?.protein || 0,
        carbs: dayData?.carbs || 0,
        fat: dayData?.fat || 0,
        meals_logged: dayData?.meals_logged || 0
      };
    });
  }, [nutritionData]);

  const macroDistribution = useMemo(() => {
    const totals = nutritionData.reduce(
      (acc, day) => ({
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fat: acc.fat + day.fat
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );

    const totalMacros = totals.protein + totals.carbs + totals.fat;
    
    return [
      {
        name: 'Protein',
        value: Math.round((totals.protein / totalMacros) * 100),
        color: NUTRITION_COLORS.protein,
        grams: totals.protein
      },
      {
        name: 'Carbs',
        value: Math.round((totals.carbs / totalMacros) * 100),
        color: NUTRITION_COLORS.carbs,
        grams: totals.carbs
      },
      {
        name: 'Fat',
        value: Math.round((totals.fat / totalMacros) * 100),
        color: NUTRITION_COLORS.fat,
        grams: totals.fat
      }
    ];
  }, [nutritionData]);

  const averages = useMemo(() => {
    const totals = nutritionData.reduce(
      (acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fat: acc.fat + day.fat,
        meals: acc.meals + day.meals_logged
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 }
    );

    const days = nutritionData.length;
    
    return {
      calories: Math.round(totals.calories / days),
      protein: Math.round(totals.protein / days),
      carbs: Math.round(totals.carbs / days),
      fat: Math.round(totals.fat / days),
      meals: Math.round(totals.meals / days)
    };
  }, [nutritionData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'calories' && `Calories: ${entry.value}`}
              {entry.dataKey === 'protein' && `Protein: ${entry.value}g`}
              {entry.dataKey === 'carbs' && `Carbs: ${entry.value}g`}
              {entry.dataKey === 'fat' && `Fat: ${entry.value}g`}
              {entry.dataKey === 'meals_logged' && `Meals: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Nutrition Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{averages.calories}</div>
          <div className="text-sm text-muted-foreground">Avg Calories</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{averages.protein}g</div>
          <div className="text-sm text-muted-foreground">Avg Protein</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{averages.carbs}g</div>
          <div className="text-sm text-muted-foreground">Avg Carbs</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{averages.fat}g</div>
          <div className="text-sm text-muted-foreground">Avg Fat</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{averages.meals}</div>
          <div className="text-sm text-muted-foreground">Avg Meals</div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="macros">Macros</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Daily Calories */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Daily Calories</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="calories" 
                    fill={NUTRITION_COLORS.calories}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Meals Logged */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Meals Logged</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    domain={[0, 5]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="meals_logged" 
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="macros" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Macro Distribution */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Macro Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={macroDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {macroDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Macro Details */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Macro Breakdown</h4>
              <div className="space-y-4">
                {macroDistribution.map((macro, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: macro.color }}
                        />
                        <span className="font-medium">{macro.name}</span>
                      </div>
                      <span className="text-lg font-bold">{macro.value}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total: {macro.grams}g over {nutritionData.length} days
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average: {Math.round(macro.grams / nutritionData.length)}g per day
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Macro Trends */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Macro Trends</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="protein"
                  stroke={NUTRITION_COLORS.protein}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Protein (g)"
                />
                <Line
                  type="monotone"
                  dataKey="carbs"
                  stroke={NUTRITION_COLORS.carbs}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Carbs (g)"
                />
                <Line
                  type="monotone"
                  dataKey="fat"
                  stroke={NUTRITION_COLORS.fat}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Fat (g)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}