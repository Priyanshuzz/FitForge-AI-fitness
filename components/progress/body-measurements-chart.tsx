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
  Legend 
} from 'recharts';
import { format } from 'date-fns';
import { ProgressEntry } from '@/lib/types/fitness';

interface BodyMeasurementsChartProps {
  data: ProgressEntry[];
  height?: number;
}

export function BodyMeasurementsChart({ data, height = 400 }: BodyMeasurementsChartProps) {
  const chartData = useMemo(() => {
    return data
      .filter(entry => 
        entry.waist_circumference || 
        entry.chest_circumference || 
        entry.arm_circumference || 
        entry.thigh_circumference
      )
      .map(entry => ({
        date: format(new Date(entry.entry_date), 'MMM dd'),
        waist: entry.waist_circumference,
        chest: entry.chest_circumference,
        arm: entry.arm_circumference,
        thigh: entry.thigh_circumference,
        fullDate: entry.entry_date
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value} cm</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No body measurements available</div>
          <div className="text-sm">Start tracking your measurements to see progress</div>
        </div>
      </div>
    );
  }

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
            tick={{ fontSize: 12 }}
            tickLine={false}
            tickFormatter={(value) => `${value}cm`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Line
            type="monotone"
            dataKey="waist"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Waist"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="chest"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Chest"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="arm"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Arm"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="thigh"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Thigh"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Measurements Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {chartData.length > 0 && (
          <>
            {chartData[chartData.length - 1].waist && (
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">
                  {chartData[chartData.length - 1].waist} cm
                </div>
                <div className="text-sm text-muted-foreground">Waist</div>
              </div>
            )}
            {chartData[chartData.length - 1].chest && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {chartData[chartData.length - 1].chest} cm
                </div>
                <div className="text-sm text-muted-foreground">Chest</div>
              </div>
            )}
            {chartData[chartData.length - 1].arm && (
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {chartData[chartData.length - 1].arm} cm
                </div>
                <div className="text-sm text-muted-foreground">Arm</div>
              </div>
            )}
            {chartData[chartData.length - 1].thigh && (
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {chartData[chartData.length - 1].thigh} cm
                </div>
                <div className="text-sm text-muted-foreground">Thigh</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}