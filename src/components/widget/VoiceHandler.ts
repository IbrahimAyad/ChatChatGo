interface VoiceHandlerConfig {
  onTranscript: (transcript: string) => void;
  onListeningChange: (isListening: boolean) => void;
  onError: (error: string) => void;
}

export class VoiceHandler {
  private recognition: any | null = null;
  private isSupported = false;
  private config: VoiceHandlerConfig;

  constructor(config: VoiceHandlerConfig) {
    this.config = config;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    // Check browser support
    const SpeechRecognition = 
      window.SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.config.onError('Speech recognition not supported in this browser');
      return;
    }

    this.isSupported = true;
    this.recognition = new SpeechRecognition();

    // Configure recognition
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Event handlers
    this.recognition.onstart = () => {
      this.config.onListeningChange(true);
    };

    this.recognition.onend = () => {
      this.config.onListeningChange(false);
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        this.config.onTranscript(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.config.onListeningChange(false);
      
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone permission denied';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'network':
          errorMessage = 'Network error during speech recognition';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      this.config.onError(errorMessage);
    };

    this.recognition.onnomatch = () => {
      this.config.onError('Speech not recognized');
    };
  }

  startListening(): void {
    if (!this.isSupported || !this.recognition) {
      this.config.onError('Speech recognition not available');
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      this.config.onError('Failed to start speech recognition');
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  cleanup(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.recognition = null;
    }
  }

  get supported(): boolean {
    return this.isSupported;
  }
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
} 