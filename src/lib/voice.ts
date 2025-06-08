// Voice Service - Speech-to-Text & Text-to-Speech Integration

export interface VoiceSettings {
  voice_id: string;
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface AudioRecordingOptions {
  sampleRate?: number;
  channels?: number;
  bitsPerSample?: number;
}

export class VoiceService {
  private static instance: VoiceService;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;

  // ElevenLabs Voice IDs (popular voices)
  public static readonly VOICES = {
    RACHEL: '21m00Tcm4TlvDq8ikWAM', // Natural, young American female
    DREW: '29vD33N1CtxCmqQRPOHJ',   // Well-rounded, middle-aged American male
    CLYDE: '2EiwWnXFnvU5JabPnv8n',  // War veteran, middle-aged American male
    DAVE: 'CYw3kZ02Hs0563khs1Fj',   // British, conversational, friendly
    ANTONI: 'ErXwobaYiN019PkySvjV', // Young, crisp, pleasant
    ARNOLD: 'VR6AewLTigWG4xSOukaG', // Crisp, serious, formal
    ADAM: 'pNInz6obpgDQGcFmaJgB',   // Deep, mature, American male
    SAM: 'yoZ06aMxZJJ28mfd3POQ',    // Young, dynamic American male
  };

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  /**
   * Convert speech to text using OpenAI Whisper
   */
  async speechToText(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('/api/voice/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Speech-to-text failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.text || '';
    } catch (error) {
      console.error('Speech to text error:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech using ElevenLabs
   */
  async textToSpeech(
    text: string, 
    voiceId: string = VoiceService.VOICES.RACHEL,
    settings: Partial<VoiceSettings> = {}
  ): Promise<ArrayBuffer> {
    try {
      const voiceSettings: VoiceSettings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
        ...settings,
        voice_id: voiceId,
      };

      const response = await fetch('/api/voice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_settings: voiceSettings,
        }),
      });

      if (!response.ok) {
        throw new Error(`Text-to-speech failed: ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Text to speech error:', error);
      throw error;
    }
  }

  /**
   * Start recording audio from microphone
   */
  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('Not currently recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.isRecording = false;
        
        // Stop all tracks to release microphone
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Play audio from ArrayBuffer
   */
  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBufferSource = audioContext.createBufferSource();
      
      const decodedAudio = await audioContext.decodeAudioData(audioBuffer.slice(0));
      audioBufferSource.buffer = decodedAudio;
      audioBufferSource.connect(audioContext.destination);
      
      return new Promise((resolve) => {
        audioBufferSource.onended = () => resolve();
        audioBufferSource.start();
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }

  /**
   * Check if browser supports audio recording
   */
  static isSupported(): boolean {
    return !!(typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia);
  }

  /**
   * Request microphone permissions
   */
  static async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }
}

// Helper functions for audio processing
export const audioUtils = {
  /**
   * Convert audio blob to base64
   */
  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  /**
   * Create audio URL from buffer
   */
  createAudioUrl(buffer: ArrayBuffer): string {
    const blob = new Blob([buffer], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  },

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },
};

export default VoiceService; 