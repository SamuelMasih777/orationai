'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ChatSessionPage() {
  const router = useRouter();
  const params = useParams();
  const [userId, setUserId] = useState<string | null>(null);
  const sessionId = params.sessionId as string;

  useEffect(() => {
    // Get user ID from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        router.push('/auth/signup');
      }
    } else {
      router.push('/auth/signup');
    }
  }, [router]);

  const handleNewSession = () => {
    router.push('/chat');
  };

  if (!userId) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">
            Setting up your chat session...
          </p>
        </Card>
      </div>
    );
  }

  if (sessionId === 'new') {
    // Handle new session creation
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <h2 className="text-xl font-semibold mb-2">Creating New Session</h2>
          <p className="text-muted-foreground mb-4">
            Setting up your new conversation...
          </p>
          <Button onClick={() => router.push('/chat')} variant="outline">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <ChatInterface
      sessionId={sessionId}
      userId={userId}
      onNewSession={handleNewSession}
    />
  );
}