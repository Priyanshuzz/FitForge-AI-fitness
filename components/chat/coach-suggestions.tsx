'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  TrendingUp,
  Calendar,
  Zap,
  Heart,
  Brain,
  Utensils,
  Dumbbell,
  Moon,
  Sun,
  ArrowRight,
} from 'lucide-react';
import { ChatContext } from '@/lib/types/fitness';

interface CoachSuggestionsProps {
  userId: string;
  context?: ChatContext;
  onSuggestionSelect: (suggestion: string) => void;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
  category: 'workout' | 'nutrition' | 'motivation' | 'progress' | 'recovery';
  priority: 'high' | 'medium' | 'low';
  personalized: boolean;
}

export function CoachSuggestions({
  userId,
  context,
  onSuggestionSelect,
}: CoachSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    generatePersonalizedSuggestions();
  }, [context, generatePersonalizedSuggestions]);

  const generatePersonalizedSuggestions = useCallback(() => {
    // Generate suggestions based on user context
    const baseSuggestions: Suggestion[] = [
      {
        id: 'progress-check',
        title: 'Weekly Progress Review',
        description:
          'Review your achievements and areas for improvement this week',
        prompt:
          'Can you analyze my progress this week and highlight my achievements and areas where I can improve?',
        icon: <TrendingUp className="w-5 h-5" />,
        category: 'progress',
        priority: 'high',
        personalized: true,
      },
      {
        id: 'workout-modification',
        title: 'Workout Adjustment',
        description: "Modify your workout based on how you're feeling today",
        prompt:
          "I want to adjust today's workout. I'm feeling [describe how you feel] and would like suggestions for modifications.",
        icon: <Dumbbell className="w-5 h-5" />,
        category: 'workout',
        priority: 'high',
        personalized: true,
      },
      {
        id: 'nutrition-optimization',
        title: 'Meal Plan Optimization',
        description:
          'Get suggestions to improve your nutrition based on your goals',
        prompt:
          'Based on my current goals and progress, how can I optimize my meal plan for better results?',
        icon: <Utensils className="w-5 h-5" />,
        category: 'nutrition',
        priority: 'medium',
        personalized: true,
      },
      {
        id: 'motivation-boost',
        title: 'Motivation & Mindset',
        description: 'Get personalized motivation and mental strategies',
        prompt:
          'I need some motivation and mental strategies to stay consistent with my fitness journey. What advice do you have?',
        icon: <Heart className="w-5 h-5" />,
        category: 'motivation',
        priority: 'medium',
        personalized: false,
      },
      {
        id: 'recovery-tips',
        title: 'Recovery & Rest',
        description: 'Learn about proper recovery techniques for your routine',
        prompt:
          'What are the best recovery techniques I should be incorporating based on my current workout routine?',
        icon: <Moon className="w-5 h-5" />,
        category: 'recovery',
        priority: 'medium',
        personalized: true,
      },
      {
        id: 'form-technique',
        title: 'Exercise Form Check',
        description: 'Get detailed guidance on proper exercise technique',
        prompt:
          'Can you give me detailed instructions on proper form for the exercises in my current workout plan?',
        icon: <Target className="w-5 h-5" />,
        category: 'workout',
        priority: 'high',
        personalized: true,
      },
      {
        id: 'plateau-breakthrough',
        title: 'Plateau Breakthrough',
        description: 'Strategies to overcome fitness plateaus',
        prompt:
          "I feel like I've hit a plateau in my progress. What strategies can help me break through and continue improving?",
        icon: <Zap className="w-5 h-5" />,
        category: 'progress',
        priority: 'high',
        personalized: true,
      },
      {
        id: 'energy-optimization',
        title: 'Energy & Performance',
        description: 'Tips to boost energy levels and workout performance',
        prompt:
          'How can I optimize my energy levels and improve my workout performance naturally?',
        icon: <Sun className="w-5 h-5" />,
        category: 'nutrition',
        priority: 'medium',
        personalized: false,
      },
      {
        id: 'habit-building',
        title: 'Habit Formation',
        description: 'Build lasting healthy habits and routines',
        prompt:
          "Help me build sustainable healthy habits that will stick long-term. What's the best approach?",
        icon: <Brain className="w-5 h-5" />,
        category: 'motivation',
        priority: 'medium',
        personalized: false,
      },
      {
        id: 'goal-setting',
        title: 'Goal Refinement',
        description: 'Refine and adjust your fitness goals',
        prompt:
          'I want to review and potentially adjust my fitness goals. Can you help me set realistic and motivating targets?',
        icon: <Calendar className="w-5 h-5" />,
        category: 'progress',
        priority: 'low',
        personalized: true,
      },
    ];

    // Add context-based suggestions
    const contextualSuggestions: Suggestion[] = [];

    if (context?.current_workout) {
      contextualSuggestions.push({
        id: 'current-workout-help',
        title: 'Current Workout Assistance',
        description: 'Get help with your current workout',
        prompt: `I'm currently doing "${context.current_workout.title}". Can you give me tips and encouragement for this specific workout?`,
        icon: <Dumbbell className="w-5 h-5" />,
        category: 'workout',
        priority: 'high',
        personalized: true,
      });
    }

    if (context?.recent_progress && context.recent_progress.length > 0) {
      contextualSuggestions.push({
        id: 'progress-analysis',
        title: 'Recent Progress Analysis',
        description: 'Analyze your recent progress entries',
        prompt:
          'Based on my recent progress entries, what patterns do you notice and what recommendations do you have?',
        icon: <TrendingUp className="w-5 h-5" />,
        category: 'progress',
        priority: 'high',
        personalized: true,
      });
    }

    setSuggestions([...contextualSuggestions, ...baseSuggestions]);
  }, [context]);

  const categories = [
    {
      value: 'all',
      label: 'All Suggestions',
      icon: <Brain className="w-4 h-4" />,
    },
    {
      value: 'workout',
      label: 'Workout',
      icon: <Dumbbell className="w-4 h-4" />,
    },
    {
      value: 'nutrition',
      label: 'Nutrition',
      icon: <Utensils className="w-4 h-4" />,
    },
    {
      value: 'progress',
      label: 'Progress',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      value: 'motivation',
      label: 'Motivation',
      icon: <Heart className="w-4 h-4" />,
    },
    {
      value: 'recovery',
      label: 'Recovery',
      icon: <Moon className="w-4 h-4" />,
    },
  ];

  const filteredSuggestions =
    selectedCategory === 'all'
      ? suggestions
      : suggestions.filter(s => s.category === selectedCategory);

  const prioritizedSuggestions = filteredSuggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="destructive" className="text-xs">
            High
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="secondary" className="text-xs">
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="text-xs">
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Personalized Suggestions</h3>
        <p className="text-sm text-muted-foreground">
          AI-powered recommendations based on your progress and goals
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category.value}
            variant={
              selectedCategory === category.value ? 'default' : 'outline'
            }
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
            className="flex items-center space-x-1"
          >
            {category.icon}
            <span>{category.label}</span>
          </Button>
        ))}
      </div>

      {/* Suggestions Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {prioritizedSuggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${getPriorityColor(suggestion.priority)}`}
              onClick={() => onSuggestionSelect(suggestion.prompt)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <div className="text-primary">{suggestion.icon}</div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium">
                        {suggestion.title}
                      </CardTitle>
                      {suggestion.personalized && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          <Zap className="w-3 h-3 mr-1" />
                          Personalized
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getPriorityBadge(suggestion.priority)}
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {suggestion.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredSuggestions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">
              No suggestions available
            </h4>
            <p className="text-muted-foreground">
              Try selecting a different category or check back later for
              personalized recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
