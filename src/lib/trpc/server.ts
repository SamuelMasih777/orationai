import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { db, users, chatSessions, messages, type NewUser, type NewChatSession, type NewMessage } from '@/lib/db/index';
import { eq, desc, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { generateCareerCounselingResponse, generateSessionTitle } from '@/lib/ai/gemini';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Context type
export interface Context {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// Create context
export const createContext = async (): Promise<Context> => {
  return {};
};

// Chat router
export const chatRouter = router({
  // Get all chat sessions for a user
  getSessions: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const sessions = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.userId, input.userId))
        .orderBy(desc(chatSessions.updatedAt));
      
      return sessions;
    }),
    

  //pagination

  // Create a new chat session
  createSession: publicProcedure
    .input(z.object({ 
      userId: z.string(),
      title: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        // First, verify the user exists
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);

        if (user.length === 0) {
          throw new Error(`User with ID ${input.userId} not found`);
        }

        const newSession: NewChatSession = {
          id: nanoid(),
          userId: input.userId,
          title: input.title,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const [session] = await db.insert(chatSessions).values(newSession).returning();
        return session;
      } catch (error) {
        console.error('Error creating session:', error);
        throw error;
      }
    }),

  // Get messages for a session
  getMessages: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const sessionMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, input.sessionId))
        .orderBy(messages.createdAt);
      
      return sessionMessages;
    }),

  // Send a message
  sendMessage: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      content: z.string(),
      role: z.enum(['user', 'assistant'])
    }))
    .mutation(async ({ input }) => {
      const newMessage: NewMessage = {
        id: nanoid(),
        sessionId: input.sessionId,
        role: input.role,
        content: input.content,
        createdAt: new Date(),
      };

      const [message] = await db.insert(messages).values(newMessage).returning();
      
      // Update session timestamp
      await db
        .update(chatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessions.id, input.sessionId));

      return message;
    }),

  // Delete a session
  deleteSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(chatSessions).where(eq(chatSessions.id, input.sessionId));
      return { success: true };
    }),

  // Update session title
  updateSessionTitle: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      title: z.string()
    }))
    .mutation(async ({ input }) => {
      const [session] = await db
        .update(chatSessions)
        .set({ 
          title: input.title,
          updatedAt: new Date()
        })
        .where(eq(chatSessions.id, input.sessionId))
        .returning();
      
      return session;
    }),

  // Generate AI response
  generateAIResponse: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      userMessage: z.string()
    }))
    .mutation(async ({ input }) => {
      // Get conversation history
      const conversationHistory = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, input.sessionId))
        .orderBy(messages.createdAt);

      // Add user message to history
      const messagesWithUserInput = [
        ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user' as const, content: input.userMessage }
      ];

      // Generate AI response
      const aiResponse = await generateCareerCounselingResponse(messagesWithUserInput);

      // Save user message
      const userMessage: NewMessage = {
        id: nanoid(),
        sessionId: input.sessionId,
        role: 'user',
        content: input.userMessage,
        createdAt: new Date(),
      };
      await db.insert(messages).values(userMessage);

      // Save AI response
      const aiMessage: NewMessage = {
        id: nanoid(),
        sessionId: input.sessionId,
        role: 'assistant',
        content: aiResponse,
        createdAt: new Date(),
      };
      const [savedAiMessage] = await db.insert(messages).values(aiMessage).returning();

      // Update session timestamp
      await db
        .update(chatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessions.id, input.sessionId));

      // Generate title if this is the first message
      if (conversationHistory.length === 0) {
        const title = await generateSessionTitle(input.userMessage);
        await db
          .update(chatSessions)
          .set({ title })
          .where(eq(chatSessions.id, input.sessionId));
      }

      return savedAiMessage;
    }),

  // Generate session title
  generateSessionTitle: publicProcedure
    .input(z.object({
      firstMessage: z.string()
    }))
    .mutation(async ({ input }) => {
      const title = await generateSessionTitle(input.firstMessage);
      return title;
    }),
});

// User router
export const userRouter = router({
  // Create or get user
  createOrGetUser: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string(),
      image: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      // Check if user exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        return existingUser[0];
      }

      // Create new user
      const newUser: NewUser = {
        id: nanoid(),
        email: input.email,
        name: input.name,
        image: input.image,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [user] = await db.insert(users).values(newUser).returning();
      return user;
    }),

  // Get user by ID
  getUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);
      
      return user;
    }),
});

// Main app router
export const appRouter = router({
  chat: chatRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
