'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Target,
  Flame,
  Calendar,
  TrendingUp,
  Award,
  Star,
  Zap,
  Crown,
  Medal,
} from 'lucide-react';
import { UserAnalytics } from '@/lib/types/fitness';

interface AchievementsBadgesProps {
  analytics: UserAnalytics | null;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  achieved: boolean;
  progress?: number;
  target?: number;
}

export function AchievementsBadges({ analytics }: AchievementsBadgesProps) {
  const achievements: Achievement[] = [
    {
      id: 'first_workout',
      title: 'First Steps',
      description: 'Complete your first workout',
      icon: <Star className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      achieved: (analytics?.total_workouts_completed || 0) >= 1,
      progress: Math.min(analytics?.total_workouts_completed || 0, 1),
      target: 1,
    },
    {
      id: 'workout_streak',
      title: 'Consistency King',
      description: 'Maintain a 7-day workout streak',
      icon: <Flame className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      achieved: (analytics?.streak_days || 0) >= 7,
      progress: analytics?.streak_days || 0,
      target: 7,
    },
    {
      id: 'workout_milestone',
      title: 'Workout Warrior',
      description: 'Complete 50 workouts',
      icon: <Trophy className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      achieved: (analytics?.total_workouts_completed || 0) >= 50,
      progress: analytics?.total_workouts_completed || 0,
      target: 50,
    },
    {
      id: 'plan_adherence',
      title: 'Dedicated Performer',
      description: 'Maintain 80%+ plan adherence',
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      achieved: (analytics?.plan_adherence_percentage || 0) >= 80,
      progress: analytics?.plan_adherence_percentage || 0,
      target: 80,
    },
    {
      id: 'meal_logger',
      title: 'Nutrition Tracker',
      description: 'Log 100 meals',
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      achieved: (analytics?.total_meals_logged || 0) >= 100,
      progress: analytics?.total_meals_logged || 0,
      target: 100,
    },
    {
      id: 'weight_loss',
      title: 'Transformation',
      description: 'Lose 5kg or more',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      achieved: Math.abs(analytics?.weight_change_kg || 0) >= 5,
      progress: Math.abs(analytics?.weight_change_kg || 0),
      target: 5,
    },
    {
      id: 'highly_rated',
      title: 'Quality Focused',
      description: 'Maintain 4+ average workout rating',
      icon: <Star className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      achieved: (analytics?.average_workout_rating || 0) >= 4,
      progress: analytics?.average_workout_rating || 0,
      target: 4,
    },
    {
      id: 'long_streak',
      title: 'Unstoppable',
      description: 'Maintain a 30-day streak',
      icon: <Crown className="w-5 h-5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      achieved: (analytics?.streak_days || 0) >= 30,
      progress: analytics?.streak_days || 0,
      target: 30,
    },
  ];

  const achievedCount = achievements.filter(a => a.achieved).length;
  const completionRate = Math.round(
    (achievedCount / achievements.length) * 100
  );

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Award className="w-6 h-6 text-primary" />
          <h4 className="text-lg font-semibold">Achievement Progress</h4>
        </div>
        <div className="text-3xl font-bold text-primary mb-1">
          {achievedCount}/{achievements.length}
        </div>
        <div className="text-sm text-muted-foreground">
          {completionRate}% Complete
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mt-3">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-4 rounded-lg border transition-all cursor-pointer group ${
              achievement.achieved
                ? `${achievement.bgColor} border-current shadow-sm`
                : 'bg-muted/30 border-muted'
            }`}
          >
            <div className="text-center space-y-2">
              <div
                className={`inline-flex p-2 rounded-full ${
                  achievement.achieved ? achievement.bgColor : 'bg-muted'
                }`}
              >
                <div
                  className={
                    achievement.achieved
                      ? achievement.color
                      : 'text-muted-foreground'
                  }
                >
                  {achievement.icon}
                </div>
              </div>

              <div>
                <h5
                  className={`font-medium text-sm ${
                    achievement.achieved
                      ? achievement.color
                      : 'text-muted-foreground'
                  }`}
                >
                  {achievement.title}
                </h5>
                <p className="text-xs text-muted-foreground mt-1">
                  {achievement.description}
                </p>
              </div>

              {/* Progress indicator for unachieved badges */}
              {!achievement.achieved &&
                achievement.progress !== undefined &&
                achievement.target && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium">
                      {achievement.progress}/{achievement.target}
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div
                        className="bg-primary h-1 rounded-full transition-all"
                        style={{
                          width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

              {/* Achievement Badge */}
              {achievement.achieved && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="absolute -top-2 -right-2"
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Medal className="w-3 h-3 text-white" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {achievement.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Next Achievement */}
      <div className="p-4 border border-dashed border-primary/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h5 className="font-medium">Keep Going!</h5>
              <p className="text-sm text-muted-foreground">
                {achievedCount === achievements.length
                  ? "You've achieved everything! Amazing work! 🏆"
                  : `${achievements.length - achievedCount} more achievement${achievements.length - achievedCount > 1 ? 's' : ''} to unlock`}
              </p>
            </div>
          </div>
          {achievedCount < achievements.length && (
            <Badge variant="outline" className="text-primary border-primary">
              {achievements.length - achievedCount} left
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
