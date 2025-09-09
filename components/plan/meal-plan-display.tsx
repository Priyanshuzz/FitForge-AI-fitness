'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ChefHat,
  Clock,
  Flame,
  Users,
  CheckCircle2,
  Circle,
  Plus,
  Info,
  ShoppingCart,
  Timer,
  Star,
} from 'lucide-react';
import type { DisplayMeal, MealPlan } from '@/lib/types/fitness';

interface MealPlanDisplayProps {
  mealPlan: MealPlan;
  date: string;
  onMealComplete?: (mealId: string) => void;
  onAddCustomMeal?: () => void;
}

interface MealCardProps {
  meal: DisplayMeal;
  isCompleted: boolean;
  onComplete: () => void;
  onEdit?: () => void;
}

function MealCard({ meal, isCompleted, onComplete, onEdit }: MealCardProps) {
  const [showNutrition, setShowNutrition] = useState(false);

  return (
    <Card
      className={`transition-all ${
        isCompleted ? 'border-green-200 bg-green-50/50' : 'hover:shadow-md'
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <Circle
                className="w-6 h-6 text-muted-foreground cursor-pointer"
                onClick={onComplete}
              />
            )}
            <div>
              <CardTitle className="text-lg">{meal.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {meal.meal_type} • {meal.prep_time} min prep
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {meal.servings} serving{meal.servings > 1 ? 's' : ''}
            </Badge>
            {meal.difficulty && (
              <Badge variant="outline" className="text-xs">
                {meal.difficulty}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Nutrition Summary */}
        <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="font-semibold text-primary">{meal.calories}</div>
            <div className="text-xs text-muted-foreground">Calories</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">{meal.protein}g</div>
            <div className="text-xs text-muted-foreground">Protein</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">{meal.carbs}g</div>
            <div className="text-xs text-muted-foreground">Carbs</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-orange-600">{meal.fat}g</div>
            <div className="text-xs text-muted-foreground">Fat</div>
          </div>
        </div>

        {/* Ingredients Preview */}
        {meal.ingredients && meal.ingredients.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">
                Ingredients ({meal.ingredients.length})
              </span>
              <Button variant="ghost" size="sm">
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to List
              </Button>
            </div>
            <div className="space-y-1">
              {meal.ingredients.slice(0, 3).map((ingredient, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  • {ingredient.amount} {ingredient.unit} {ingredient.name}
                </div>
              ))}
              {meal.ingredients.length > 3 && (
                <div className="text-sm text-muted-foreground font-medium">
                  + {meal.ingredients.length - 3} more ingredients
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cooking Instructions Preview */}
        {meal.instructions && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <ChefHat className="w-4 h-4 mr-2 text-primary" />
              <span className="font-medium text-sm">Instructions</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {meal.instructions.slice(0, 120)}...
            </p>
          </div>
        )}

        {/* Meal Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{meal.prep_time + (meal.cook_time || 0)} min total</span>
            {meal.rating && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{meal.rating}/5</span>
              </>
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNutrition(!showNutrition)}
            >
              <Info className="w-4 h-4 mr-1" />
              Details
            </Button>
            {!isCompleted && (
              <Button size="sm" onClick={onComplete}>
                Mark Complete
              </Button>
            )}
          </div>
        </div>

        {/* Detailed Nutrition (Expandable) */}
        {showNutrition && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t space-y-3"
          >
            <h4 className="font-medium">Detailed Nutrition</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span>Fiber:</span>
                <span>{meal.fiber || 0}g</span>
              </div>
              <div className="flex justify-between">
                <span>Sugar:</span>
                <span>{meal.sugar || 0}g</span>
              </div>
              <div className="flex justify-between">
                <span>Sodium:</span>
                <span>{meal.sodium || 0}mg</span>
              </div>
              <div className="flex justify-between">
                <span>Saturated Fat:</span>
                <span>{meal.saturated_fat || 0}g</span>
              </div>
            </div>

            {meal.ingredients && (
              <div>
                <h4 className="font-medium mb-2">Complete Ingredients</h4>
                <div className="space-y-1">
                  {meal.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{ingredient.name}</span>
                      <span>
                        {ingredient.amount} {ingredient.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {meal.instructions && (
              <div>
                <h4 className="font-medium mb-2">Instructions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {meal.instructions}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export function MealPlanDisplay({
  mealPlan,
  date,
  onMealComplete,
  onAddCustomMeal,
}: MealPlanDisplayProps) {
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set());

  const handleMealComplete = (mealId: string) => {
    setCompletedMeals(prev => new Set([...prev, mealId]));
    onMealComplete?.(mealId);
  };

  const totalCalories = mealPlan.meals.reduce(
    (total, meal) => total + meal.calories,
    0
  );
  const totalProtein = mealPlan.meals.reduce(
    (total, meal) => total + meal.protein,
    0
  );
  const totalCarbs = mealPlan.meals.reduce(
    (total, meal) => total + meal.carbs,
    0
  );
  const totalFat = mealPlan.meals.reduce((total, meal) => total + meal.fat, 0);

  const completedCount = completedMeals.size;
  const totalMeals = mealPlan.meals.length;
  const completionPercentage =
    totalMeals > 0 ? (completedCount / totalMeals) * 100 : 0;

  const mealsByType = mealPlan.meals.reduce(
    (acc, meal) => {
      if (!acc[meal.meal_type]) {
        acc[meal.meal_type] = [];
      }
      acc[meal.meal_type].push(meal);
      return acc;
    },
    {} as Record<string, DisplayMeal[]>
  );

  return (
    <div className="space-y-6">
      {/* Meal Plan Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Today's Meal Plan
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(completionPercentage)}%
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Nutrition Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flame className="w-5 h-5 mr-2" />
            Daily Nutrition Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {totalCalories}
              </div>
              <div className="text-sm text-muted-foreground">Calories</div>
              <div className="text-xs text-muted-foreground mt-1">
                Target: {mealPlan.target_calories || 2000}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(totalProtein)}g
              </div>
              <div className="text-sm text-muted-foreground">Protein</div>
              <div className="text-xs text-muted-foreground mt-1">
                Target: {mealPlan.target_protein || 150}g
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(totalCarbs)}g
              </div>
              <div className="text-sm text-muted-foreground">Carbs</div>
              <div className="text-xs text-muted-foreground mt-1">
                Target: {mealPlan.target_carbs || 200}g
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(totalFat)}g
              </div>
              <div className="text-sm text-muted-foreground">Fat</div>
              <div className="text-xs text-muted-foreground mt-1">
                Target: {mealPlan.target_fat || 80}g
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals by Type */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Meals</TabsTrigger>
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
          <TabsTrigger value="lunch">Lunch</TabsTrigger>
          <TabsTrigger value="dinner">Dinner</TabsTrigger>
          <TabsTrigger value="snack">Snacks</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">All Meals ({totalMeals})</h3>
            <Button variant="outline" onClick={onAddCustomMeal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Meal
            </Button>
          </div>

          <div className="space-y-4">
            {mealPlan.meals.map(meal => (
              <MealCard
                key={meal.id}
                meal={meal}
                isCompleted={completedMeals.has(meal.id)}
                onComplete={() => handleMealComplete(meal.id)}
              />
            ))}
          </div>
        </TabsContent>

        {Object.entries(mealsByType).map(([mealType, meals]) => (
          <TabsContent
            key={mealType}
            value={mealType}
            className="space-y-4 mt-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold capitalize">
                {mealType} ({meals.length})
              </h3>
              <Button variant="outline" onClick={onAddCustomMeal}>
                <Plus className="w-4 h-4 mr-2" />
                Add {mealType}
              </Button>
            </div>

            <div className="space-y-4">
              {meals.map(meal => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  isCompleted={completedMeals.has(meal.id)}
                  onComplete={() => handleMealComplete(meal.id)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Meal Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {totalMeals} meals completed
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {completionPercentage === 100 && (
            <div className="text-center mt-4">
              <div className="text-lg font-semibold text-green-600 mb-2">
                🎉 Daily Nutrition Complete!
              </div>
              <div className="text-sm text-muted-foreground">
                Great job staying on track with your nutrition goals!
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
