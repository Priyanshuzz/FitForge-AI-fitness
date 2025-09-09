'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Target,
  TrendingUp,
  Flame,
  CheckCircle2,
  Circle,
  SkipForward,
  Info,
  Video,
  Timer,
} from 'lucide-react';
import type { DisplayWorkout, DisplayExercise } from '@/lib/types/fitness';

interface WorkoutDisplayProps {
  workout: DisplayWorkout;
  onComplete?: () => void;
  onStart?: () => void;
  isActive?: boolean;
}

interface ExerciseCardProps {
  exercise: DisplayExercise;
  isActive: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  onStart: () => void;
}

function ExerciseCard({
  exercise,
  isActive,
  isCompleted,
  onComplete,
  onStart,
}: ExerciseCardProps) {
  const [currentSet, setCurrentSet] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);

  const handleSetComplete = () => {
    if (currentSet < exercise.sets - 1) {
      setCurrentSet(prev => prev + 1);
      setIsResting(true);
      setRestTimer(exercise.rest_seconds);
    } else {
      onComplete();
    }
  };

  return (
    <Card
      className={`transition-all ${
        isActive
          ? 'border-primary bg-primary/5 shadow-lg'
          : isCompleted
            ? 'border-green-200 bg-green-50/50'
            : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : isActive ? (
                <div className="w-5 h-5 rounded-full bg-primary animate-pulse" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
              <CardTitle className="text-lg">{exercise.name}</CardTitle>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{exercise.sets} sets</span>
              <span>
                {exercise.reps
                  ? `${exercise.reps} reps`
                  : `${exercise.duration_seconds}s`}
              </span>
              <span>{exercise.rest_seconds}s rest</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {exercise.equipment || 'Bodyweight'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {exercise.muscle_group}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {exercise.instructions && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center mb-2">
              <Info className="w-4 h-4 mr-2 text-primary" />
              <span className="font-medium text-sm">Instructions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {exercise.instructions}
            </p>
          </div>
        )}

        {isActive && (
          <div className="space-y-4">
            {/* Current Set Display */}
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">
                Set {currentSet + 1} of {exercise.sets}
              </div>
              <div className="text-lg">
                {exercise.reps
                  ? `${exercise.reps} reps`
                  : `${exercise.duration_seconds} seconds`}
              </div>
            </div>

            {/* Rest Timer */}
            {isResting && (
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Timer className="w-5 h-5 mr-2 text-orange-600" />
                  <span className="font-medium">Rest Period</span>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {Math.floor(restTimer / 60)}:
                  {(restTimer % 60).toString().padStart(2, '0')}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsResting(false);
                    setRestTimer(0);
                  }}
                >
                  Skip Rest
                </Button>
              </div>
            )}

            {/* Exercise Controls */}
            <div className="flex justify-center space-x-2">
              {!isResting && (
                <Button onClick={handleSetComplete}>Complete Set</Button>
              )}

              {exercise.demo_url && (
                <Button variant="outline" size="sm">
                  <Video className="w-4 h-4 mr-2" />
                  Demo
                </Button>
              )}
            </div>
          </div>
        )}

        {!isActive && !isCompleted && (
          <div className="text-center">
            <Button variant="outline" onClick={onStart}>
              Start Exercise
            </Button>
          </div>
        )}

        {isCompleted && (
          <div className="text-center text-green-600 font-medium">
            ✓ Exercise Completed
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WorkoutDisplay({
  workout,
  onComplete,
  onStart,
  isActive,
}: WorkoutDisplayProps) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(
    new Set()
  );
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);

  const completionPercentage =
    (completedExercises.size / workout.exercises.length) * 100;
  const isWorkoutComplete =
    completedExercises.size === workout.exercises.length;

  const handleExerciseComplete = (exerciseIndex: number) => {
    setCompletedExercises(prev => new Set([...prev, exerciseIndex]));

    if (exerciseIndex === workout.exercises.length - 1) {
      // Workout complete
      onComplete?.();
    } else {
      // Move to next exercise
      setCurrentExercise(exerciseIndex + 1);
    }
  };

  const handleWorkoutStart = () => {
    setWorkoutStarted(true);
    onStart?.();
  };

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                {workout.name}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {workout.type} • {workout.difficulty}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {Math.round(completionPercentage)}%
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <div className="font-semibold">{workout.exercises.length}</div>
                <div className="text-sm text-muted-foreground">Exercises</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold">
                  {workout.estimated_duration} min
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-semibold">
                  {workout.estimated_calories}
                </div>
                <div className="text-sm text-muted-foreground">Calories</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-semibold">
                  {workout.target_muscle_groups.join(', ')}
                </div>
                <div className="text-sm text-muted-foreground">Target</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Workout Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedExercises.size} of {workout.exercises.length} exercises
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3 mb-4" />

          {!workoutStarted && !isWorkoutComplete && (
            <div className="text-center">
              <Button onClick={handleWorkoutStart} size="lg">
                <Play className="w-5 h-5 mr-2" />
                Start Workout
              </Button>
            </div>
          )}

          {isWorkoutComplete && (
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600 mb-2">
                🎉 Workout Complete!
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Great job! You've completed all exercises.
              </div>
              <Button onClick={onComplete}>Finish Workout</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workout Notes */}
      {workout.notes && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-3">
              <Info className="w-5 h-5 mr-2 text-primary" />
              <span className="font-medium">Workout Notes</span>
            </div>
            <p className="text-muted-foreground">{workout.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Exercise List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Exercises</h3>

        {workout.exercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ExerciseCard
              exercise={exercise}
              isActive={workoutStarted && currentExercise === index}
              isCompleted={completedExercises.has(index)}
              onComplete={() => handleExerciseComplete(index)}
              onStart={() => setCurrentExercise(index)}
            />
          </motion.div>
        ))}
      </div>

      {/* Workout Summary */}
      {workoutStarted && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workout Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <div className="font-semibold text-primary">
                  {completedExercises.size}/{workout.exercises.length}
                </div>
                <div className="text-sm text-muted-foreground">Exercises</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-600">
                  {Math.floor(workoutTime / 60)}:
                  {(workoutTime % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground">Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
