// Tenant API Key Management System
// Secure storage and management of API keys per business

export interface TenantAPIKeys {
  tenantId: string;
  keys: {
    // AI Providers
    openai?: {
      apiKey: string;
      model?: string;
      maxTokens?: number;
      enabled: boolean;
    };
    
    // Voice Providers
    elevenlabs?: {
      apiKey: string;
      voiceId?: string;
      enabled: boolean;
    };
    
    openaiVoice?: {
      apiKey: string;
      voice?: string;
      enabled: boolean;
    };
    
    googleTTS?: {
      apiKey: string;
      voice?: string;
      enabled: boolean;
    };
    
    azureSpeech?: {
      apiKey: string;
      region?: string;
      voice?: string;
      enabled: boolean;
    };
    
    // Analytics & Integrations
    googleAnalytics?: {
      trackingId: string;
      enabled: boolean;
    };
    
    mixpanel?: {
      projectToken: string;
      enabled: boolean;
    };
    
    stripe?: {
      publishableKey: string;
      webhookSecret: string;
      enabled: boolean;
    };
    
    // Communication
    twilio?: {
      accountSid: string;
      authToken: string;
      phoneNumber: string;
      enabled: boolean;
    };
    
    sendgrid?: {
      apiKey: string;
      fromEmail: string;
      enabled: boolean;
    };
  };
  
  // Usage tracking
  usage: {
    currentMonth: {
      openaiTokens: number;
      elevenLabsCharacters: number;
      voiceMinutes: number;
      costs: {
        openai: number;
        elevenlabs: number;
        total: number;
      };
    };
    
    limits: {
      monthlyBudget?: number;
      dailyBudget?: number;
      maxTokensPerDay?: number;
      maxVoiceMinutesPerDay?: number;
    };
  };
  
  // Security
  keyRotation: {
    lastRotated: string;
    nextRotation?: string;
    rotationPolicy: 'manual' | '30days' | '90days' | 'never';
  };
  
  createdAt: string;
  updatedAt: string;
}

export class TenantAPIKeyManager {
  private encryptionKey: string;
  
  constructor() {
    this.encryptionKey = process.env.TENANT_ENCRYPTION_KEY || '';
  }
  
  /**
   * Encrypt sensitive API key data
   */
  private async encrypt(data: string): Promise<string> {
    // Use crypto to encrypt the API key
    const crypto = await import('crypto');
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }
  
  /**
   * Decrypt API key data
   */
  private async decrypt(encryptedData: string): Promise<string> {
    const crypto = await import('crypto');
    const algorithm = 'aes-256-gcm';
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Store API keys for a tenant (encrypted)
   */
  async storeTenantKeys(tenantId: string, keys: TenantAPIKeys['keys']): Promise<boolean> {
    try {
      // Encrypt sensitive keys
      const encryptedKeys = { ...keys };
      
      if (keys.openai?.apiKey) {
        encryptedKeys.openai!.apiKey = await this.encrypt(keys.openai.apiKey);
      }
      
      if (keys.elevenlabs?.apiKey) {
        encryptedKeys.elevenlabs!.apiKey = await this.encrypt(keys.elevenlabs.apiKey);
      }
      
      // Store in database (pseudo-code)
      await this.saveToDatabase(tenantId, encryptedKeys);
      
      console.log(`✅ API keys stored securely for tenant: ${tenantId}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to store API keys for ${tenantId}:`, error);
      return false;
    }
  }
  
  /**
   * Retrieve and decrypt API keys for a tenant
   */
  async getTenantKeys(tenantId: string): Promise<TenantAPIKeys['keys'] | null> {
    try {
      const encryptedKeys = await this.loadFromDatabase(tenantId);
      if (!encryptedKeys) return null;
      
      // Decrypt sensitive keys
      const decryptedKeys = { ...encryptedKeys };
      
      if (encryptedKeys.openai?.apiKey) {
        decryptedKeys.openai!.apiKey = await this.decrypt(encryptedKeys.openai.apiKey);
      }
      
      if (encryptedKeys.elevenlabs?.apiKey) {
        decryptedKeys.elevenlabs!.apiKey = await this.decrypt(encryptedKeys.elevenlabs.apiKey);
      }
      
      return decryptedKeys;
      
    } catch (error) {
      console.error(`❌ Failed to retrieve API keys for ${tenantId}:`, error);
      return null;
    }
  }
  
  /**
   * Validate API keys work
   */
  async validateTenantKeys(tenantId: string): Promise<{
    openai: boolean;
    elevenlabs: boolean;
    errors: string[];
  }> {
    const keys = await this.getTenantKeys(tenantId);
    const results = { openai: false, elevenlabs: false, errors: [] as string[] };
    
    if (!keys) {
      results.errors.push('No API keys found for tenant');
      return results;
    }
    
    // Test OpenAI key
    if (keys.openai?.enabled && keys.openai.apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${keys.openai.apiKey}` }
        });
        results.openai = response.ok;
        if (!response.ok) results.errors.push('Invalid OpenAI API key');
      } catch (error) {
        results.errors.push(`OpenAI validation error: ${error}`);
      }
    }
    
    // Test ElevenLabs key
    if (keys.elevenlabs?.enabled && keys.elevenlabs.apiKey) {
      try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': keys.elevenlabs.apiKey }
        });
        results.elevenlabs = response.ok;
        if (!response.ok) results.errors.push('Invalid ElevenLabs API key');
      } catch (error) {
        results.errors.push(`ElevenLabs validation error: ${error}`);
      }
    }
    
    return results;
  }
  
  /**
   * Track API usage and costs
   */
  async trackUsage(tenantId: string, usage: {
    service: 'openai' | 'elevenlabs' | 'google' | 'azure';
    tokens?: number;
    characters?: number;
    minutes?: number;
    cost: number;
  }): Promise<void> {
    try {
      const currentUsage = await this.getUsage(tenantId);
      
      // Update usage counters
      if (usage.service === 'openai' && usage.tokens) {
        currentUsage.currentMonth.openaiTokens += usage.tokens;
        currentUsage.currentMonth.costs.openai += usage.cost;
      }
      
      if (usage.service === 'elevenlabs' && usage.characters) {
        currentUsage.currentMonth.elevenLabsCharacters += usage.characters;
        currentUsage.currentMonth.costs.elevenlabs += usage.cost;
      }
      
      currentUsage.currentMonth.costs.total += usage.cost;
      
      await this.saveUsage(tenantId, currentUsage);
      
      // Check limits
      await this.checkUsageLimits(tenantId, currentUsage);
      
    } catch (error) {
      console.error(`❌ Failed to track usage for ${tenantId}:`, error);
    }
  }
  
  /**
   * Check if usage limits are exceeded
   */
  private async checkUsageLimits(tenantId: string, usage: TenantAPIKeys['usage']): Promise<void> {
    const limits = usage.limits;
    const current = usage.currentMonth;
    
    // Check monthly budget
    if (limits.monthlyBudget && current.costs.total >= limits.monthlyBudget) {
      await this.notifyLimitExceeded(tenantId, 'monthly_budget', current.costs.total, limits.monthlyBudget);
    }
    
    // Check daily limits (would need daily tracking)
    // Implementation depends on your tracking granularity
  }
  
  /**
   * Notify when limits are exceeded
   */
  private async notifyLimitExceeded(
    tenantId: string, 
    limitType: string, 
    current: number, 
    limit: number
  ): Promise<void> {
    // Send notification to business owner
    console.warn(`🚨 ${tenantId} exceeded ${limitType}: $${current} >= $${limit}`);
    
    // You could send email, SMS, or dashboard notification here
  }
  
  // Database operations (implement based on your DB choice)
  private async saveToDatabase(tenantId: string, keys: any): Promise<void> {
    // Implementation depends on your database
    // Could be PostgreSQL, MongoDB, etc.
  }
  
  private async loadFromDatabase(tenantId: string): Promise<any> {
    // Implementation depends on your database
    return null;
  }
  
  private async getUsage(tenantId: string): Promise<TenantAPIKeys['usage']> {
    // Load usage data from database
    return {
      currentMonth: {
        openaiTokens: 0,
        elevenLabsCharacters: 0,
        voiceMinutes: 0,
        costs: { openai: 0, elevenlabs: 0, total: 0 }
      },
      limits: {}
    };
  }
  
  private async saveUsage(tenantId: string, usage: TenantAPIKeys['usage']): Promise<void> {
    // Save usage data to database
  }
}

// Export singleton instance
export const tenantKeyManager = new TenantAPIKeyManager(); 