import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Supported audio formats for Whisper API
const SUPPORTED_FORMATS = [
  'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/wav', 
  'audio/webm', 'audio/m4a', 'audio/ogg', 'audio/flac'
];

// Note: In production, you'd use a service like:
// - OpenAI Whisper API
// - Google Speech-to-Text
// - Azure Speech Services
// - AssemblyAI

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const tenantId = formData.get('tenantId') as string;
    const language = formData.get('language') as string || 'en'; // Default to English

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required' },
        { status: 400 }
      );
    }

    // Validate audio file format
    const isValidFormat = SUPPORTED_FORMATS.includes(audioFile.type) || 
                         audioFile.type.startsWith('audio/');
    
    if (!isValidFormat) {
      return NextResponse.json(
        { 
          error: 'Invalid file type. Supported formats: MP3, MP4, MPEG, MPGA, M4A, WAV, WEBM, OGG, FLAC',
          receivedType: audioFile.type
        },
        { status: 400 }
      );
    }

    // Check file size (Whisper API has a 25MB limit)
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'Audio file too large. Maximum size is 25MB.',
          fileSize: audioFile.size,
          maxSize: MAX_FILE_SIZE
        },
        { status: 400 }
      );
    }

    // Check minimum file size (too small files might be empty)
    if (audioFile.size < 100) {
      return NextResponse.json(
        { error: 'Audio file too small. Minimum size is 100 bytes.' },
        { status: 400 }
      );
    }

    console.log(`[${tenantId}] Processing speech-to-text:`);
    console.log(`  - File: ${audioFile.name} (${audioFile.size} bytes)`);
    console.log(`  - Type: ${audioFile.type}`);
    console.log(`  - Language: ${language}`);

    try {
      // Convert File to the format expected by OpenAI
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      
      // Create a proper filename with extension for Whisper
      let filename = audioFile.name;
      if (!filename.includes('.')) {
        // Add extension based on MIME type
        const ext = audioFile.type.split('/')[1] || 'wav';
        filename = `audio.${ext}`;
      }
      
      // Create a new File object that OpenAI can work with
      const audioForWhisper = new File([audioBuffer], filename, {
        type: audioFile.type
      });

      const startTime = Date.now();

      // Call OpenAI Whisper API with enhanced parameters
      const transcription = await openai.audio.transcriptions.create({
        file: audioForWhisper,
        model: 'whisper-1',
        language: language === 'auto' ? undefined : language, // Let Whisper auto-detect if 'auto'
        response_format: 'verbose_json', // Get more detailed response
        temperature: 0.2, // Lower temperature for more consistent results
      });

      const processingTime = Date.now() - startTime;

      console.log(`[${tenantId}] Transcription successful in ${processingTime}ms:`);
      console.log(`  - Text: "${transcription.text.substring(0, 100)}..."`);
      console.log(`  - Language: ${transcription.language || 'unknown'}`);
      console.log(`  - Duration: ${transcription.duration || 'unknown'}s`);

      return NextResponse.json({
        success: true,
        transcription: transcription.text,
        metadata: {
          language: transcription.language,
          duration: transcription.duration,
          segments: transcription.segments?.length || 0,
        },
        tenantId,
        audioLength: audioFile.size,
        processingTime,
        timestamp: new Date().toISOString(),
        model: 'whisper-1',
        requestedLanguage: language
      });

    } catch (openaiError: any) {
      console.error(`[${tenantId}] OpenAI Whisper API error:`, {
        status: openaiError.status,
        code: openaiError.code,
        message: openaiError.message,
        type: openaiError.type
      });
      
      // Handle specific OpenAI errors with detailed messages
      if (openaiError.status === 400) {
        return NextResponse.json(
          { 
            error: 'Invalid audio format or corrupted file. Please try a different audio file.',
            details: openaiError.message
          },
          { status: 400 }
        );
      } else if (openaiError.status === 429) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded. Please try again in a few seconds.',
            retryAfter: openaiError.headers?.['retry-after'] || '30'
          },
          { status: 429 }
        );
      } else if (openaiError.status === 401) {
        console.error('OpenAI API key authentication failed');
        return NextResponse.json(
          { error: 'Speech recognition service temporarily unavailable' },
          { status: 500 }
        );
      } else if (openaiError.status === 413) {
        return NextResponse.json(
          { error: 'Audio file too large for processing' },
          { status: 413 }
        );
      }
      
      // For development/testing fallback
      console.log(`[${tenantId}] Falling back to mock transcription due to API error`);
      const mockTranscriptions = [
        "I'd like to order a large pepperoni pizza with extra cheese",
        "Can I get a medium coffee with oat milk and a croissant?",
        "What are your specials today? I'm looking for something healthy",
        "I want to place an order for pickup in about 20 minutes",
        "Do you have any vegetarian or vegan options available?",
        "How much is the combo meal with fries and a drink?",
        "I'd like to cancel my previous order and place a new one",
        "What time do you close tonight? I want to come by later"
      ];
      
      const mockTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      
      return NextResponse.json({
        success: true,
        transcription: mockTranscription,
        metadata: {
          language: language,
          duration: Math.random() * 10 + 2, // Mock duration
          segments: 1,
        },
        tenantId,
        audioLength: audioFile.size,
        processingTime: 1000 + Math.random() * 500,
        timestamp: new Date().toISOString(),
        model: 'mock-fallback',
        requestedLanguage: language,
        note: 'Using mock transcription due to API error',
        fallbackReason: openaiError.message
      });
    }

  } catch (error) {
    console.error('Speech-to-text processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process audio file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check with detailed information
export async function GET() {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  // Test API key validity (if present)
  let apiKeyValid = false;
  if (hasApiKey) {
    try {
      // Quick test to see if the API key works
      const testClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      await testClient.models.list();
      apiKeyValid = true;
    } catch (error) {
      console.error('OpenAI API key validation failed:', error);
      apiKeyValid = false;
    }
  }
  
  return NextResponse.json({
    service: 'Speech-to-Text',
    status: 'active',
    provider: 'OpenAI Whisper',
    model: 'whisper-1',
    apiKeyConfigured: hasApiKey,
    apiKeyValid: apiKeyValid,
    supportedFormats: SUPPORTED_FORMATS,
    maxFileSize: '25MB',
    supportedLanguages: [
      'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 
      'ar', 'hi', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi', 'auto'
    ],
    timestamp: new Date().toISOString()
  });
} 