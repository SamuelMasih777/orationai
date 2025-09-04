'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface ChatInterfaceProps {
  sessionId: string;
  userId: string;
  onNewSession?: () => void;
}

export function ChatInterface({ sessionId, userId, onNewSession }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempMessages, setTempMessages] = useState<Message[]>([]); // Only for temporary messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const generateAIResponseMutation = trpc.chat.generateAIResponse.useMutation();
  const updateTitleMutation = trpc.chat.updateSessionTitle.useMutation();

  // Process messages with useMemo to ensure stable references
  const processedServerMessages = useMemo(() => {
    return messages.map(msg => ({
      ...msg,
      createdAt: new Date(msg.createdAt)
    }));
  }, [messages]);

  // Combine server messages with temp messages
  const allMessages = useMemo(() => {
    return [...processedServerMessages, ...tempMessages];
  }, [processedServerMessages, tempMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message as temporary message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      createdAt: new Date(),
    };
    setTempMessages([tempUserMessage]);

    try {
      // Generate AI response using the new endpoint
      await generateAIResponseMutation.mutateAsync({
        sessionId,
        userMessage,
      });

      // Clear temp messages and refetch server messages
      setTempMessages([]);
      await refetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      // Clear temp messages on error
      setTempMessages([]);
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

  return (
    <div className="flex flex-col h-screen mb-6">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4 overflow-hidden">
      {/* <div className="flex-1 p-4 overflow-auto"> */}
        <div className="space-y-4">
          {allMessages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Welcome to your Career Counselor!</p>
              <p className="text-sm">Start a conversation by asking about your career goals, challenges, or any professional advice you need.</p>
            </div>
          )}
          
          {allMessages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <Card
                className={`max-w-[80%] p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </Card>
              
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-muted p-3">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      {/* </div> */}
      

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your career goals, challenges, or any professional advice..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      </ScrollArea>
    </div>
  );
}