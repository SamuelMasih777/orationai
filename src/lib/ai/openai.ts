import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateCareerCounselingResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `You are an expert career counselor with extensive experience in helping people navigate their professional journeys. Your role is to provide thoughtful, personalized career guidance that helps individuals make informed decisions about their professional development.

Key principles:
- Be empathetic and supportive
- Ask clarifying questions when needed
- Provide practical, actionable advice
- Consider both short-term and long-term career goals
- Be honest about challenges while remaining encouraging
- Focus on skills development, networking, and strategic career moves
- Consider work-life balance and personal values
- Stay up-to-date with current job market trends

When responding:
- Keep responses conversational but professional
- Provide specific examples when possible
- Suggest concrete next steps
- Be encouraging but realistic
- Ask follow-up questions to better understand their situation

Remember: Every person's career journey is unique, so tailor your advice to their specific situation, goals, and circumstances.`;

    // Convert messages to Gemini format
    const conversationHistory = messages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');

    const prompt = `${systemPrompt}\n\nConversation History:\n${conversationHistory}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || 'I apologize, but I was unable to generate a response. Please try again.';
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate career counseling response');
  }
}

export async function generateSessionTitle(firstMessage: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate a short, descriptive title (max 50 characters) for a career counseling conversation based on the first message. The title should capture the main topic or concern.

First message: "${firstMessage}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text?.trim() || 'Career Discussion';
  } catch (error) {
    console.error('Error generating session title:', error);
    return 'Career Discussion';
  }
}
