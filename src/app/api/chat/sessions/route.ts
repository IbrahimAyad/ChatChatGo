import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// POST /api/chat/sessions - Create new chat session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { botId, tenantId, metadata } = body;

    // Validate required fields
    if (!botId || !tenantId) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: 'botId and tenantId are required' } },
        { status: 400 }
      );
    }

    // Create session ID
    const sessionId = nanoid();

    // In a real implementation, you would:
    // 1. Validate the bot exists and belongs to the tenant
    // 2. Store the session in your database (Firebase/Supabase)
    // 3. Initialize session analytics
    
    const session = {
      id: sessionId,
      botId,
      tenantId,
      messages: [],
      metadata: {
        userAgent: metadata?.userAgent || '',
        ipAddress: getClientIP(request),
        referrer: metadata?.referrer || '',
        utm: metadata?.utm || {},
        deviceType: metadata?.deviceType || 'desktop',
        voiceUsed: false,
      },
      leadInfo: null,
      status: 'active',
      startedAt: new Date(),
      endedAt: null,
    };

    // TODO: Store session in database
    // await db.collection('sessions').doc(sessionId).set(session);

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SESSION_CREATION_FAILED', 
          message: 'Failed to create chat session' 
        } 
      },
      { status: 500 }
    );
  }
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
} 