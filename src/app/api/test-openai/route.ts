import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    // Simple test to verify OpenAI connectivity
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say 'OpenAI integration working!' in exactly those words."
        }
      ],
      max_tokens: 10,
    });

    const response = completion.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      message: "OpenAI API is connected and working!",
      response: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('OpenAI API Test Error:', error);
    
    return NextResponse.json({
      success: false,
      message: "OpenAI API connection failed",
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 