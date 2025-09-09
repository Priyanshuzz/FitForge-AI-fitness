'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Image,
  Paperclip,
  MoreVertical,
  Heart,
  MessageSquare,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  Settings,
  Sparkles
} from 'lucide-react';
import { ChatMessage } from './chat-message';
import { QuickActions } from './quick-actions';
import { CoachSuggestions } from './coach-suggestions';
import { sendChatMessage } from '@/lib/actions/fitness-actions';
import { ChatMessage as ChatMessageType, ChatContext, MessageType } from '@/lib/types/fitness';

interface AIChatCoachProps {
  userId: string;
  context?: ChatContext;
}

const QUICK_PROMPTS = [
  {
    icon: <Target className="w-4 h-4" />,
    text: "How's my progress?",
    prompt: "Can you analyze my current progress and give me insights on how I'm doing with my fitness goals?"
  },
  {
    icon: <Zap className="w-4 h-4" />,
    text: "Modify today's workout",
    prompt: "I'd like to modify today's workout. Can you suggest some alternatives based on my current fitness level?"
  },
  {
    icon: <Heart className="w-4 h-4" />,
    text: "Feeling unmotivated",
    prompt: "I'm feeling a bit unmotivated today. Can you give me some encouragement and tips to get back on track?"
  },
  {
    icon: <Calendar className="w-4 h-4" />,
    text: "Plan next week",
    prompt: "Help me plan next week's workouts and meals based on my current progress and goals."
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    text: "Nutrition advice",
    prompt: "I need some nutrition advice. What should I focus on to support my current fitness goals?"
  },
  {
    icon: <TrendingUp className="w-4 h-4" />,
    text: "Form tips",
    prompt: "Can you give me some tips on proper form and technique for my current exercises?"
  }
];

export function AIChatCoach({ userId, context }: AIChatCoachProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedTab, setSelectedTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load chat history
    loadChatHistory();
    
    // Welcome message
    if (messages.length === 0) {
      const welcomeMessage: ChatMessageType = {
        id: 'welcome',
        user_id: userId,
        message_type: MessageType.ASSISTANT,
        content: "👋 Hi there! I'm your AI fitness coach. I'm here to help you with workouts, nutrition, motivation, and tracking your progress. What would you like to work on today?",
        created_at: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      // TODO: Replace with actual API call
      // const history = await getChatHistory(userId);
      // setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      user_id: userId,
      message_type: MessageType.USER,
      content: messageText,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', messageText);
      formData.append('context', JSON.stringify(context));

      const result = await sendChatMessage(formData);

      if (result.success && result.response) {
        const assistantMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          user_id: userId,
          message_type: MessageType.ASSISTANT,
          content: result.response,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        user_id: userId,
        message_type: MessageType.ASSISTANT,
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-full h-full bg-green-500 rounded-full"
                  />
                </div>
              </div>
              <div>
                <CardTitle className="text-lg">AI Fitness Coach</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your personal trainer & nutritionist
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="suggestions">
                <Zap className="w-4 h-4 mr-2" />
                Suggestions
              </TabsTrigger>
              <TabsTrigger value="actions">
                <Target className="w-4 h-4 mr-2" />
                Quick Actions
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col px-6 pb-6">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLoading={false}
                  />
                ))}
                {isLoading && (
                  <ChatMessage
                    message={{
                      id: 'loading',
                      user_id: userId,
                      message_type: MessageType.ASSISTANT,
                      content: '',
                      created_at: new Date().toISOString()
                    }}
                    isLoading={true}
                  />
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-3">Quick questions to get started:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {QUICK_PROMPTS.map((prompt, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSendMessage(prompt.prompt)}
                      className="p-3 text-left border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="text-primary">{prompt.icon}</div>
                      </div>
                      <div className="text-sm font-medium">{prompt.text}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t pt-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about fitness, nutrition, or your progress..."
                    disabled={isLoading}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={handleVoiceInput}
                      disabled={isLoading}
                    >
                      {isListening ? (
                        <MicOff className="w-3 h-3 text-red-500" />
                      ) : (
                        <Mic className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      disabled={isLoading}
                    >
                      <Paperclip className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center mt-2 text-sm text-muted-foreground"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>Listening...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="flex-1 px-6 pb-6">
            <CoachSuggestions
              userId={userId}
              context={context}
              onSuggestionSelect={handleSendMessage}
            />
          </TabsContent>

          <TabsContent value="actions" className="flex-1 px-6 pb-6">
            <QuickActions
              userId={userId}
              context={context}
              onActionComplete={(message: string) => {
                const assistantMessage: ChatMessageType = {
                  id: Date.now().toString(),
                  user_id: userId,
                  message_type: MessageType.ASSISTANT,
                  content: message,
                  created_at: new Date().toISOString()
                };
                setMessages(prev => [...prev, assistantMessage]);
                setSelectedTab('chat');
              }}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}