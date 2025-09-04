'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { Header } from '@/components/header';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';

interface ChatLayoutProps {
  children: React.ReactNode;
  currentSessionId?: string;
  onSessionSelect?: (sessionId: string) => void;
  onNewSession?: () => void;
}

export function ChatLayout({ 
  children, 
  currentSessionId,
  onSessionSelect,
  onNewSession 
}: ChatLayoutProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const createSessionMutation = trpc.chat.createSession.useMutation();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id);
        return;
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    // If no stored user, redirect to signup
    router.push('/auth/signup');
  }, [router]);

  const handleNewSession = async () => {
    if (!userId) {
      console.error('User ID not available');
      return;
    }
    
    try {
      const newSession = await createSessionMutation.mutateAsync({
        userId,
        title: 'New Career Discussion',
      });
      
      if (onNewSession) {
        onNewSession();
      }
      
      // Navigate to the new session
      router.push(`/chat/${newSession.id}`);
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    if (onSessionSelect) {
      onSessionSelect(sessionId);
    }
    router.push(`/chat/${sessionId}`);
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Welcome to Career Counselor</h2>
          <p className="text-muted-foreground mb-4">
            Please sign in to start your career counseling session.
          </p>
          <Button onClick={() => router.push('/auth/signup')}>Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onNewChat={handleNewSession} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div   className={`
    ${sidebarOpen ? 'block' : 'hidden'}   // mobile toggle
    md:block                              // always visible on desktop
    w-80
    transition-all duration-300 ease-in-out
    border-r bg-muted/30 flex-shrink-0
    overflow-hidden
  `}>
          <ChatHistory
            userId={userId}
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}