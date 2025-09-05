'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Trash2, Edit3 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { formatDistanceToNow } from 'date-fns';

interface ChatHistoryProps {
  userId: string;
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export function ChatHistory({ userId, currentSessionId, onSessionSelect, onNewSession }: ChatHistoryProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const { data: sessions = [], refetch: refetchSessions } = trpc.chat.getSessions.useQuery(
    { userId },
    { enabled: !!userId, refetchInterval: 5000 } // Refetch every 5 seconds to get updated titles
  );

  const createSessionMutation = trpc.chat.createSession.useMutation();
  const deleteSessionMutation = trpc.chat.deleteSession.useMutation();
  const updateTitleMutation = trpc.chat.updateSessionTitle.useMutation();

  const handleNewSession = async () => {
    try {
      const newSession = await createSessionMutation.mutateAsync({
        userId,
        title: 'New Career Discussion',
      });
      onSessionSelect(newSession.id);
      onNewSession();
      await refetchSessions();
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSessionMutation.mutateAsync({ sessionId });
      await refetchSessions();
      if (currentSessionId === sessionId) {
        onNewSession();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleEditTitle = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const handleSaveTitle = async (sessionId: string) => {
    try {
      await updateTitleMutation.mutateAsync({
        sessionId,
        title: editingTitle,
      });
      setEditingSessionId(null);
      setEditingTitle('');
      await refetchSessions();
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <Button onClick={handleNewSession} className="w-full cursor-pointer" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-2 space-y-2">
          {sessions.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Start a new chat to begin</p>
            </div>
          )}
          
          {sessions.map((session) => (
            <Card
              key={session.id}
              className={`group p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                currentSessionId === session.id ? 'bg-primary/10 border-primary' : ''
              }`}
              onClick={() => onSessionSelect(session.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {editingSessionId === session.id ? (
                    <div className="space-y-2">
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="w-full text-sm font-medium bg-background border rounded px-2 py-1"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveTitle(session.id);
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveTitle(session.id)}
                          className="cursor-pointer h-6 px-2 text-xs"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="cursor-pointer h-6 px-2 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium truncate">{session.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                      </p>
                    </>
                  )}
                </div>
                
                {editingSessionId !== session.id && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTitle(session.id, session.title);
                      }}
                      className="cursor-pointer h-6 w-6 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="cursor-pointer h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
