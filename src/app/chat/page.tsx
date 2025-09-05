'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChatIndexPage() {
  const router = useRouter();

  const handleStartNewConversation = () => {
    // This will trigger the new session creation in the layout
    // You can emit an event or use a context if needed
    router.push('/chat/new');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="p-8 text-center max-w-md w-full">
        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">Welcome to Career Counselor</h2>
        <p className="text-muted-foreground mb-6">
          Your AI-powered career counselor is here to help you navigate your professional journey. 
          Start a new conversation or continue from where you left off.
        </p>
        <Button onClick={handleStartNewConversation} size="lg" className='cursor-pointer'>
          Start New Conversation
        </Button>
      </Card>
    </div>
  );
}