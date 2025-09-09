'use client';

import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { format } from 'date-fns';
import { ProgressEntry } from '@/lib/types/fitness';

interface WeightChartProps {
  data: ProgressEntry[];
  height?: number;
  showTrendline?: boolean;
}

export function WeightChart({ data, height = 300, showTrendline = false }: WeightChartProps) {
  const chartData = useMemo(() => {
    return data
      .filter(entry => entry.weight_kg)
      .map(entry => ({
        date: format(new Date(entry.entry_date), 'MMM dd'),
        weight: entry.weight_kg,
        fullDate: entry.entry_date,
        bodyFat: entry.body_fat_percentage
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [data]);

  const goalWeight = useMemo(() => {
    // Calculate goal weight based on the trend or set a target
    if (chartData.length >= 2) {
      const firstWeight = chartData[0].weight;
      const lastWeight = chartData[chartData.length - 1].weight;
      const trend = lastWeight! - firstWeight!;
      
      // If losing weight, continue the trend
      if (trend < 0) {
        return Math.max(lastWeight! + (trend * 2), lastWeight! - 10);
      }
      // If gaining weight (muscle building), set a moderate target
      return lastWeight! + Math.abs(trend);
    }
    return null;
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            Weight: <span className="font-semibold">{payload[0].value.toFixed(1)} kg</span>
          </p>
          {payload[0].payload.bodyFat && (
            <p className="text-secondary">
              Body Fat: <span className="font-semibold">{payload[0].payload.bodyFat.toFixed(1)}%</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No weight data available</div>
          <div className="text-sm">Start tracking your weight to see progress</div>
        </div>
      </div>
    );
  }

  const minWeight = Math.min(...chartData.map(d => d.weight!));
  const maxWeight = Math.max(...chartData.map(d => d.weight!));
  const padding = (maxWeight - minWeight) * 0.1 || 1;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            domain={[minWeight - padding, maxWeight + padding]}
            tick={{ fontSize: 12 }}
            tickLine={false}
            tickFormatter={(value) => `${value.toFixed(0)}kg`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Goal weight reference line */}
          {goalWeight && showTrendline && (
            <ReferenceLine 
              y={goalWeight} 
              stroke="#10b981" 
              strokeDasharray="8 8"
              label={{ value: "Goal", position: "right" }}
            />
          )}
          
          <Line
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Progress Summary */}
      {chartData.length >= 2 && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-primary">
              {chartData[0].weight?.toFixed(1)} kg
            </div>
            <div className="text-xs text-muted-foreground">Starting</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-secondary">
              {chartData[chartData.length - 1].weight?.toFixed(1)} kg
            </div>
            <div className="text-xs text-muted-foreground">Current</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className={`text-lg font-bold ${
              (chartData[chartData.length - 1].weight! - chartData[0].weight!) < 0 
                ? 'text-green-600' 
                : 'text-orange-600'
            }`}>
              {(chartData[chartData.length - 1].weight! - chartData[0].weight!) > 0 ? '+' : ''}
              {(chartData[chartData.length - 1].weight! - chartData[0].weight!).toFixed(1)} kg
            </div>
            <div className="text-xs text-muted-foreground">Change</div>
          </div>
        </div>
      )}
    </div>
  );
}