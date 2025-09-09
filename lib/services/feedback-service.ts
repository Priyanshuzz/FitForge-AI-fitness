/**
 * Feedback API service for AI chat messages
 */

import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/error-handling';

export interface MessageFeedback {
  id?: string;
  message_id: string;
  user_id: string;
  feedback_type: 'positive' | 'negative';
  feedback_text?: string;
  created_at?: string;
}

export interface FeedbackStats {
  total_feedback: number;
  positive_count: number;
  negative_count: number;
  satisfaction_rate: number;
}

class FeedbackService {
  private supabase = createClient();

  /**
   * Submit feedback for a chat message
   */
  async submitFeedback(
    feedback: Omit<MessageFeedback, 'id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.supabase) {
      logger.warn('Supabase not configured, storing feedback locally');
      this.storeLocalFeedback(feedback);
      return { success: true };
    }

    try {
      const { data, error } = await this.supabase
        .from('message_feedback')
        .insert([
          {
            message_id: feedback.message_id,
            user_id: feedback.user_id,
            feedback_type: feedback.feedback_type,
            feedback_text: feedback.feedback_text,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        logger.error('Failed to submit feedback', error, { feedback });
        throw error;
      }

      logger.info('Feedback submitted successfully', {
        messageId: feedback.message_id,
        type: feedback.feedback_type,
      });

      return { success: true };
    } catch (error) {
      logger.error(
        'Error submitting feedback',
        error instanceof Error ? error : new Error(String(error)),
        { feedback }
      );

      // Fallback to local storage
      this.storeLocalFeedback(feedback);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to submit feedback',
      };
    }
  }

  /**
   * Get feedback for a specific message
   */
  async getMessageFeedback(messageId: string): Promise<MessageFeedback[]> {
    if (!this.supabase) {
      return this.getLocalFeedback(messageId);
    }

    try {
      const { data, error } = await this.supabase
        .from('message_feedback')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get message feedback', error, { messageId });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error(
        'Error getting message feedback',
        error instanceof Error ? error : new Error(String(error)),
        { messageId }
      );
      return this.getLocalFeedback(messageId);
    }
  }

  /**
   * Get aggregated feedback stats for a user
   */
  async getFeedbackStats(userId: string): Promise<FeedbackStats> {
    if (!this.supabase) {
      return this.getLocalFeedbackStats(userId);
    }

    try {
      const { data, error } = await this.supabase
        .from('message_feedback')
        .select('feedback_type')
        .eq('user_id', userId);

      if (error) {
        logger.error('Failed to get feedback stats', error, { userId });
        return {
          total_feedback: 0,
          positive_count: 0,
          negative_count: 0,
          satisfaction_rate: 0,
        };
      }

      const feedback = data || [];
      const totalFeedback = feedback.length;
      const positiveCount = feedback.filter(
        f => f.feedback_type === 'positive'
      ).length;
      const negativeCount = feedback.filter(
        f => f.feedback_type === 'negative'
      ).length;
      const satisfactionRate =
        totalFeedback > 0 ? (positiveCount / totalFeedback) * 100 : 0;

      return {
        total_feedback: totalFeedback,
        positive_count: positiveCount,
        negative_count: negativeCount,
        satisfaction_rate: Math.round(satisfactionRate * 100) / 100,
      };
    } catch (error) {
      logger.error(
        'Error getting feedback stats',
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );
      return this.getLocalFeedbackStats(userId);
    }
  }

  /**
   * Store feedback locally when Supabase is not available
   */
  private storeLocalFeedback(
    feedback: Omit<MessageFeedback, 'id' | 'created_at'>
  ): void {
    try {
      const localFeedback = localStorage.getItem('fitforge_feedback') || '[]';
      const feedbackArray = JSON.parse(localFeedback);

      feedbackArray.push({
        ...feedback,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      });

      localStorage.setItem('fitforge_feedback', JSON.stringify(feedbackArray));
      logger.info('Feedback stored locally', {
        messageId: feedback.message_id,
      });
    } catch (error) {
      logger.error(
        'Failed to store feedback locally',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Get local feedback for a message
   */
  private getLocalFeedback(messageId: string): MessageFeedback[] {
    try {
      const localFeedback = localStorage.getItem('fitforge_feedback') || '[]';
      const feedbackArray = JSON.parse(localFeedback);
      return feedbackArray.filter(
        (f: MessageFeedback) => f.message_id === messageId
      );
    } catch (error) {
      logger.error(
        'Failed to get local feedback',
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
  }

  /**
   * Get local feedback stats
   */
  private getLocalFeedbackStats(userId: string): FeedbackStats {
    try {
      const localFeedback = localStorage.getItem('fitforge_feedback') || '[]';
      const feedbackArray = JSON.parse(localFeedback);
      const userFeedback = feedbackArray.filter(
        (f: MessageFeedback) => f.user_id === userId
      );

      const totalFeedback = userFeedback.length;
      const positiveCount = userFeedback.filter(
        (f: MessageFeedback) => f.feedback_type === 'positive'
      ).length;
      const negativeCount = userFeedback.filter(
        (f: MessageFeedback) => f.feedback_type === 'negative'
      ).length;
      const satisfactionRate =
        totalFeedback > 0 ? (positiveCount / totalFeedback) * 100 : 0;

      return {
        total_feedback: totalFeedback,
        positive_count: positiveCount,
        negative_count: negativeCount,
        satisfaction_rate: Math.round(satisfactionRate * 100) / 100,
      };
    } catch (error) {
      logger.error(
        'Failed to get local feedback stats',
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        total_feedback: 0,
        positive_count: 0,
        negative_count: 0,
        satisfaction_rate: 0,
      };
    }
  }
}

export const feedbackService = new FeedbackService();
