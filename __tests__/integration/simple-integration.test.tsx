import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ProgressDashboard } from '@/components/progress/progress-dashboard';
import { ProgressPhotos } from '@/components/progress/progress-photos';
import { AIChatCoach } from '@/components/chat/ai-chat-coach';

// Mock the fitness actions
jest.mock('@/lib/actions/fitness-actions', () => ({
  sendChatMessage: jest.fn(),
}));

// Mock chart components with safe fallbacks
jest.mock('@/components/progress/weight-chart', () => ({
  WeightChart: ({ data }: { data?: any[] }) => (
    <div data-testid="weight-chart">
      Weight Chart - {data?.length || 0} entries
    </div>
  ),
}));

jest.mock('@/components/progress/body-measurements-chart', () => ({
  BodyMeasurementsChart: ({ data }: { data?: any[] }) => (
    <div data-testid="body-measurements-chart">
      Body Measurements Chart - {data?.length || 0} entries
    </div>
  ),
}));

jest.mock('@/components/progress/workout-progress-chart', () => ({
  WorkoutProgressChart: ({ data, userId }: { data?: any[]; userId?: string }) => (
    <div data-testid="workout-progress-chart">
      Workout Progress Chart - User: {userId || 'unknown'}
    </div>
  ),
}));

jest.mock('@/components/progress/nutrition-chart', () => ({
  NutritionChart: ({ data, userId }: { data?: any[]; userId?: string }) => (
    <div data-testid="nutrition-chart">
      Nutrition Chart - User: {userId || 'unknown'}
    </div>
  ),
}));

jest.mock('@/components/progress/achievements-badges', () => ({
  AchievementsBadges: ({ analytics }: { analytics: any }) => (
    <div data-testid="achievements-badges">
      Achievements - {analytics?.total_workouts_completed || 0} workouts
    </div>
  ),
}));

jest.mock('@/components/chat/chat-message', () => ({
  ChatMessage: ({ message, isLoading }: any) => (
    <div data-testid={`message-${message.message_type}`}>
      {isLoading ? 'Loading...' : message.content}
    </div>
  ),
}));

const { sendChatMessage } = require('@/lib/actions/fitness-actions');

describe('Simple Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendChatMessage.mockResolvedValue({
      success: true,
      response: 'Test response from AI coach',
    });
  });

  describe('Progress Dashboard Basic Integration', () => {
    it('should render dashboard and display basic content', async () => {
      const mockOnAddEntry = jest.fn();
      const mockOnTakePhoto = jest.fn();

      render(
        <ProgressDashboard
          userId="test-user"
          onAddEntry={mockOnAddEntry}
          onTakePhoto={mockOnTakePhoto}
        />
      );

      // Check for header
      expect(screen.getByText('Progress Tracking')).toBeInTheDocument();
      expect(screen.getByText(/Track your fitness journey/)).toBeInTheDocument();

      // Check for action buttons
      expect(screen.getByRole('button', { name: /take photo/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add entry/i })).toBeInTheDocument();

      // Wait for data to load and check for basic stats
      await waitFor(() => {
        expect(screen.getByText('72.0 kg')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle tab navigation successfully', async () => {
      const user = userEvent.setup();
      render(
        <ProgressDashboard
          userId="test-user"
          onAddEntry={jest.fn()}
          onTakePhoto={jest.fn()}
        />
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
      });

      // Switch to weight tab
      await user.click(screen.getByRole('tab', { name: /weight/i }));
      expect(screen.getByTestId('weight-chart')).toBeInTheDocument();

      // Switch to workouts tab
      await user.click(screen.getByRole('tab', { name: /workouts/i }));
      expect(screen.getByTestId('workout-progress-chart')).toBeInTheDocument();
    });

    it('should call callback functions when buttons are clicked', async () => {
      const user = userEvent.setup();
      const mockOnAddEntry = jest.fn();
      const mockOnTakePhoto = jest.fn();

      render(
        <ProgressDashboard
          userId="test-user"
          onAddEntry={mockOnAddEntry}
          onTakePhoto={mockOnTakePhoto}
        />
      );

      // Click take photo button
      await user.click(screen.getByRole('button', { name: /take photo/i }));
      expect(mockOnTakePhoto).toHaveBeenCalled();

      // Click add entry button
      await user.click(screen.getByRole('button', { name: /add entry/i }));
      expect(mockOnAddEntry).toHaveBeenCalled();
    });
  });

  describe('Progress Photos Basic Integration', () => {
    it('should render photos component with basic UI', () => {
      render(
        <ProgressPhotos userId="test-user" onTakePhoto={jest.fn()} />
      );

      // Check header
      expect(screen.getByText('Progress Photos')).toBeInTheDocument();
      expect(screen.getByText(/Visual tracking of your transformation/)).toBeInTheDocument();

      // Check action buttons
      expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /take photo/i })).toBeInTheDocument();

      // Check category tabs
      expect(screen.getByRole('tab', { name: /all photos/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /front view/i })).toBeInTheDocument();
    });

    it('should handle category filtering', async () => {
      const user = userEvent.setup();
      render(
        <ProgressPhotos userId="test-user" onTakePhoto={jest.fn()} />
      );

      // Switch to front view category
      await user.click(screen.getByRole('tab', { name: /front view/i }));

      // Should show progress photos for front view
      expect(screen.getByText('Starting point')).toBeInTheDocument();
    });

    it('should trigger callback when take photo is clicked', async () => {
      const user = userEvent.setup();
      const mockOnTakePhoto = jest.fn();

      render(
        <ProgressPhotos userId="test-user" onTakePhoto={mockOnTakePhoto} />
      );

      await user.click(screen.getByRole('button', { name: /take photo/i }));
      expect(mockOnTakePhoto).toHaveBeenCalled();
    });
  });

  describe('AI Chat Coach Basic Integration', () => {
    it('should render chat interface with welcome message', () => {
      render(<AIChatCoach userId="test-user" />);

      // Check for welcome message
      expect(screen.getByText(/Hi there! I'm your AI fitness coach/)).toBeInTheDocument();

      // Check for input field
      expect(screen.getByPlaceholderText(/Ask me anything about fitness/)).toBeInTheDocument();

      // Check for chat interface elements
      expect(screen.getByText('AI Fitness Coach')).toBeInTheDocument();
      expect(screen.getByText('Your personal trainer & nutritionist')).toBeInTheDocument();
    });

    it('should handle tab switching', async () => {
      const user = userEvent.setup();
      render(<AIChatCoach userId="test-user" />);

      // Check default chat tab is active
      expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Chat');

      // Switch to suggestions tab
      await user.click(screen.getByRole('tab', { name: /suggestions/i }));
      expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Suggestions');

      // Switch to actions tab
      await user.click(screen.getByRole('tab', { name: /quick actions/i }));
      expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Quick Actions');
    });

    it('should send message and receive response', async () => {
      const user = userEvent.setup();
      render(<AIChatCoach userId="test-user" />);

      const input = screen.getByPlaceholderText(/Ask me anything about fitness/);
      
      // Type message and press Enter to send
      await user.type(input, 'Test message{enter}');

      // Verify API call
      await waitFor(() => {
        expect(sendChatMessage).toHaveBeenCalledWith(expect.any(FormData));
      });

      // Wait for response
      await waitFor(() => {
        expect(screen.getByText('Test response from AI coach')).toBeInTheDocument();
      });

      // Input should be cleared
      expect(input).toHaveValue('');
    });
  });

  describe('Component Integration Flow', () => {
    it('should demonstrate basic data flow between components', async () => {
      const user = userEvent.setup();
      
      // Render dashboard and chat together (like in a real app)
      const { rerender } = render(
        <div>
          <ProgressDashboard
            userId="test-user"
            onAddEntry={jest.fn()}
            onTakePhoto={jest.fn()}
          />
        </div>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Progress Tracking')).toBeInTheDocument();
      });

      // Add chat component
      rerender(
        <div>
          <ProgressDashboard
            userId="test-user"
            onAddEntry={jest.fn()}
            onTakePhoto={jest.fn()}
          />
          <AIChatCoach userId="test-user" />
        </div>
      );

      // Both components should be rendered
      expect(screen.getByText('Progress Tracking')).toBeInTheDocument();
      expect(screen.getByText(/Hi there! I'm your AI fitness coach/)).toBeInTheDocument();
    });
  });
});