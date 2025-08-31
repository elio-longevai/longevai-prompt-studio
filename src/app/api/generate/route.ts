import { NextRequest } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, conversationHistory, systemPrompt } = await req.json();
    
    if (!prompt && !conversationHistory) {
      return new Response('Prompt or conversation history is required', { status: 400 });
    }

    // Initialize the Gemini model
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-pro',
      temperature: 0.7,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Build the messages array
    const messages = [];
    
    // Add system prompt if provided
    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }
    
    // If conversation history is provided, use it
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: ConversationMessage) => {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === 'assistant') {
          messages.push(new AIMessage(msg.content));
        }
      });
    } else {
      // Otherwise just use the simple prompt
      messages.push(new HumanMessage(prompt));
    }

    // Get streaming response from the model
    const stream = await model.stream(messages);

    // Create a ReadableStream to handle the streaming response
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          for await (const chunk of stream) {
            const content = chunk.content;
            if (typeof content === 'string' && content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}