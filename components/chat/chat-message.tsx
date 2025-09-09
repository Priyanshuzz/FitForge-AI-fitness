'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Share,
  MoreHorizontal,
  Loader2,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { ChatMessage as ChatMessageType } from '@/lib/types/fitness';
import { feedbackService } from '@/lib/services/feedback-service';
import { useAuth } from '@/contexts/auth-context';
import { logger } from '@/lib/utils/error-handling';

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const { user } = useAuth();
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const isAssistant = message.message_type === 'ASSISTANT';
  const isUser = message.message_type === 'USER';

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
  };

  const handleFeedback = async (type: 'positive' | 'negative') => {
    if (!user || feedbackGiven || isSubmittingFeedback) return;
    
    setIsSubmittingFeedback(true);
    
    try {
      const result = await feedbackService.submitFeedback({
        message_id: message.id,
        user_id: user.id,
        feedback_type: type
      });

      if (result.success) {
        setFeedbackGiven(type);
        logger.info('Feedback submitted successfully', { 
          messageId: message.id, 
          feedbackType: type 
        });
      } else {
        logger.warn('Feedback submission failed', { 
          messageId: message.id, 
          error: result.error 
        });
      }
    } catch (error) {
      logger.error('Error submitting feedback', 
        error instanceof Error ? error : new Error(String(error)), 
        { messageId: message.id, feedbackType: type }
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start space-x-3"
      >
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted/50 rounded-lg p-4 max-w-xs">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">AI is thinking...</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={
          isAssistant 
            ? "bg-gradient-to-r from-primary to-secondary text-white" 
            : "bg-muted"
        }>
          {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 max-w-[80%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {/* Message Header */}
        <div className={`flex items-center space-x-2 mb-1 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <span className="text-sm font-medium">
            {isAssistant ? 'AI Coach' : 'You'}
          </span>
          {isAssistant && (
            <Badge variant="secondary" className="text-xs">
              AI
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {message.created_at ? format(new Date(message.created_at), 'HH:mm') : 'now'}
          </span>
        </div>

        {/* Message Content */}
        <div className={`rounded-lg p-4 ${
          isUser 
            ? 'bg-primary text-primary-foreground ml-8' 
            : 'bg-muted/50 mr-8'
        }`}>
          <div className="prose prose-sm max-w-none">
            {message.content.split('\n').map((line, index) => (
              <p key={index} className={`${index === 0 ? 'mt-0' : 'mt-2'} ${
                isUser ? 'text-primary-foreground' : ''
              }`}>
                {line}
              </p>
            ))}
          </div>

          {/* Context Data Display */}
          {message.context_data && Object.keys(message.context_data).length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                Context: {Object.keys(message.context_data).join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* Message Actions */}
        {isAssistant && !isLoading && (
          <div className="flex items-center space-x-1 mt-2 mr-8">
            <Button
              variant={feedbackGiven === 'positive' ? "default" : "ghost"}
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleFeedback('positive')}
              disabled={isSubmittingFeedback || feedbackGiven !== null}
            >
              {feedbackGiven === 'positive' ? (
                <Check className="w-3 h-3" />
              ) : (
                <ThumbsUp className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant={feedbackGiven === 'negative' ? "destructive" : "ghost"}
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleFeedback('negative')}
              disabled={isSubmittingFeedback || feedbackGiven !== null}
            >
              {feedbackGiven === 'negative' ? (
                <Check className="w-3 h-3" />
              ) : (
                <ThumbsDown className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleCopyMessage}
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <Share className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
            {isSubmittingFeedback && (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            )}
          </div>
        )}

        {/* Response Metadata */}
        {isAssistant && message.tokens_used && (
          <div className="text-xs text-muted-foreground mt-1 mr-8">
            {message.response_cached ? '⚡ Cached response' : `🤖 ${message.tokens_used} tokens used`}
          </div>
        )}
      </div>
    </motion.div>
  );
}