import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AIChatCoach } from '@/components/chat/ai-chat-coach';
import { CoachSuggestions } from '@/components/chat/coach-suggestions';
import { QuickActions } from '@/components/chat/quick-actions';
import { MessageType } from '@/lib/types/fitness';

// Mock the fitness actions
jest.mock('@/lib/actions/fitness-actions', () => ({
  sendChatMessage: jest.fn(),
}));

// Mock chat components
jest.mock('@/components/chat/chat-message', () => ({
  ChatMessage: ({ message, isLoading }: any) => (
    <div data-testid={`message-${message.message_type}`}>
      {isLoading ? 'Loading...' : message.content}
    </div>
  ),
}));

// Mock the chat context
const mockContext = {
  current_workout: {
    id: '1',
    title: 'Morning Strength Training',
    exercises: [],
  },
  recent_progress: [
    {
      id: '1',
      user_id: 'user123',
      entry_date: '2024-01-01',
      weight_kg: 75.0,
      created_at: '2024-01-01T10:00:00Z',
    },
  ],
};

const { sendChatMessage } = require('@/lib/actions/fitness-actions');

describe('AI Chat Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendChatMessage.mockResolvedValue({
      success: true,
      response: 'Great question! Here is my response...',
    });
  });

  describe('AIChatCoach Component Integration', () => {
    it('should render chat interface with welcome message', async () => {
      render(<AIChatCoach userId="user123" context={mockContext} />);

      // Check for welcome message
      expect(
        screen.getByText(/Hi there! I'm your AI fitness coach/)
      ).toBeInTheDocument();

      // Check for input field
      expect(
        screen.getByPlaceholderText(/Type your message/)
      ).toBeInTheDocument();

      // Check for send button
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('should send message and receive AI response', async () => {
      const user = userEvent.setup();
      render(<AIChatCoach userId="user123" context={mockContext} />);

      const input = screen.getByPlaceholderText(/Type your message/);
      const sendButton = screen.getByRole('button', { name: /send/i });

      // Type and send message
      await user.type(input, 'How many calories should I eat?');
      await user.click(sendButton);

      // Verify API call
      expect(sendChatMessage).toHaveBeenCalledWith(expect.any(FormData));

      // Wait for response to appear
      await waitFor(() => {
        expect(
          screen.getByText('Great question! Here is my response...')
        ).toBeInTheDocument();
      });

      // Input should be cleared
      expect(input).toHaveValue('');
    });

    it('should handle keyboard shortcuts (Enter to send)', async () => {
      const user = userEvent.setup();
      render(<AIChatCoach userId="user123" context={mockContext} />);

      const input = screen.getByPlaceholderText(/Type your message/);

      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');

      expect(sendChatMessage).toHaveBeenCalled();
    });

    it('should switch between tabs (Chat, Suggestions, Actions)', async () => {
      const user = userEvent.setup();
      render(<AIChatCoach userId="user123" context={mockContext} />);

      // Check default chat tab is active
      expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
        'Chat'
      );

      // Switch to suggestions tab
      await user.click(screen.getByRole('tab', { name: /suggestions/i }));
      expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
        'Suggestions'
      );

      // Switch to actions tab
      await user.click(screen.getByRole('tab', { name: /quick actions/i }));
      expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
        'Quick Actions'
      );
    });

    it('should handle error responses gracefully', async () => {
      sendChatMessage.mockResolvedValue({
        success: false,
        error: 'API Error',
      });

      const user = userEvent.setup();
      render(<AIChatCoach userId="user123" context={mockContext} />);

      const input = screen.getByPlaceholderText(/Type your message/);
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(
          screen.getByText(/I'm sorry, I'm having trouble connecting/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Coach Suggestions Integration', () => {
    it('should render personalized suggestions based on context', () => {
      render(
        <CoachSuggestions
          userId="user123"
          context={mockContext}
          onSuggestionSelect={jest.fn()}
        />
      );

      // Should show contextual suggestions
      expect(screen.getByText('Current Workout Assistance')).toBeInTheDocument();
      expect(screen.getByText('Recent Progress Analysis')).toBeInTheDocument();

      // Should show base suggestions
      expect(screen.getByText('Weekly Progress Review')).toBeInTheDocument();
      expect(screen.getByText('Workout Adjustment')).toBeInTheDocument();
    });

    it('should filter suggestions by category', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();

      render(
        <CoachSuggestions
          userId="user123"
          context={mockContext}
          onSuggestionSelect={mockOnSelect}
        />
      );

      // Filter by workout category
      await user.click(screen.getByRole('button', { name: /workout/i }));

      // Should only show workout-related suggestions
      expect(screen.getByText('Workout Adjustment')).toBeInTheDocument();
      expect(screen.getByText('Exercise Form Check')).toBeInTheDocument();

      // Should not show nutrition suggestions
      expect(
        screen.queryByText('Meal Plan Optimization')
      ).not.toBeInTheDocument();
    });

    it('should handle suggestion selection', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();

      render(
        <CoachSuggestions
          userId="user123"
          context={mockContext}
          onSuggestionSelect={mockOnSelect}
        />
      );

      // Click on a suggestion
      await user.click(screen.getByText('Weekly Progress Review'));

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.stringContaining('analyze my progress this week')
      );
    });
  });

  describe('Quick Actions Integration', () => {
    it('should render quick action buttons', () => {
      const mockOnAction = jest.fn();

      render(
        <QuickActions
          userId="user123"
          context={mockContext}
          onActionSelect={mockOnAction}
        />
      );

      // Check for quick action buttons
      expect(screen.getByText("How's my progress?")).toBeInTheDocument();
      expect(screen.getByText("Modify today's workout")).toBeInTheDocument();
      expect(screen.getByText('Feeling unmotivated')).toBeInTheDocument();
    });

    it('should handle quick action selection', async () => {
      const user = userEvent.setup();
      const mockOnAction = jest.fn();

      render(
        <QuickActions
          userId="user123"
          context={mockContext}
          onActionSelect={mockOnAction}
        />
      );

      await user.click(screen.getByText("How's my progress?"));

      expect(mockOnAction).toHaveBeenCalledWith(
        expect.stringContaining('analyze my current progress')
      );
    });
  });

  describe('Full Chat Flow Integration', () => {
    it('should complete full conversation flow with suggestions', async () => {
      const user = userEvent.setup();
      render(<AIChatCoach userId="user123" context={mockContext} />);

      // Start with a suggestion
      await user.click(screen.getByRole('tab', { name: /suggestions/i }));
      await user.click(screen.getByText('Weekly Progress Review'));

      // Should send the suggestion as a message
      expect(sendChatMessage).toHaveBeenCalledWith(expect.any(FormData));

      // Switch back to chat tab
      await user.click(screen.getByRole('tab', { name: /chat/i }));

      // Should show the conversation
      await waitFor(() => {
        expect(
          screen.getByText('Great question! Here is my response...')
        ).toBeInTheDocument();
      });
    });

    it('should handle voice input integration', async () => {
      // Mock speech recognition
      const mockSpeechRecognition = {
        start: jest.fn(),
        stop: jest.fn(),
        continuous: false,
        interimResults: false,
        lang: 'en-US',
        onstart: null,
        onresult: null,
        onerror: null,
        onend: null,
      };

      Object.defineProperty(window, 'webkitSpeechRecognition', {
        writable: true,
        value: jest.fn().mockImplementation(() => mockSpeechRecognition),
      });

      const user = userEvent.setup();
      render(<AIChatCoach userId="user123" context={mockContext} />);

      const voiceButton = screen.getByRole('button', { name: /voice/i });
      await user.click(voiceButton);

      expect(mockSpeechRecognition.start).toHaveBeenCalled();
    });
  });

  describe('Context Integration', () => {
    it('should adapt suggestions based on workout context', () => {
      const workoutContext = {
        current_workout: {
          id: '1',
          title: 'HIIT Cardio Session',
          exercises: [],
        },
      };

      render(
        <CoachSuggestions
          userId="user123"
          context={workoutContext}
          onSuggestionSelect={jest.fn()}
        />
      );

      expect(
        screen.getByText(/I'm currently doing "HIIT Cardio Session"/)
      ).toBeInTheDocument();
    });

    it('should show progress-based suggestions when progress data available', () => {
      render(
        <CoachSuggestions
          userId="user123"
          context={mockContext}
          onSuggestionSelect={jest.fn()}
        />
      );

      expect(screen.getByText('Recent Progress Analysis')).toBeInTheDocument();
    });

    it('should handle empty context gracefully', () => {
      render(
        <CoachSuggestions
          userId="user123"
          context={undefined}
          onSuggestionSelect={jest.fn()}
        />
      );

      // Should still render base suggestions
      expect(screen.getByText('Weekly Progress Review')).toBeInTheDocument();
    });
  });
});