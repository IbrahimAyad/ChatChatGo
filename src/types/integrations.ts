// Advanced Integration Types for Restaurant AI System

export interface POSIntegration {
  provider: 'square' | 'toast' | 'clover' | 'lightspeed' | 'revel' | 'custom';
  isConnected: boolean;
  apiKey?: string;
  webhookUrl?: string;
  
  capabilities: {
    realTimeInventory: boolean;
    orderSyncing: boolean;
    paymentProcessing: boolean;
    customerData: boolean;
    loyaltyIntegration: boolean;
    reportingData: boolean;
  };
  
  lastSyncAt?: Date;
  syncStatus: 'healthy' | 'issues' | 'failed';
  errors?: string[];
}

export interface DeliveryPlatformIntegration {
  platform: 'doordash' | 'ubereats' | 'grubhub' | 'postmates' | 'custom';
  isActive: boolean;
  
  menuSyncEnabled: boolean;
  realTimeInventory: boolean;
  orderNotifications: boolean;
  priceSync: boolean;
  
  credentials: {
    apiKey?: string;
    storeId?: string;
    webhookSecret?: string;
  };
  
  metrics: {
    monthlyOrders: number;
    averageOrderValue: number;
    commission: number;
    rating: number;
  };
}

export interface WeatherServiceIntegration {
  provider: 'openweathermap' | 'weatherapi' | 'custom';
  apiKey: string;
  
  features: {
    currentWeather: boolean;
    forecast: boolean;
    alerts: boolean;
    historicalData: boolean;
  };
  
  automations: Array<{
    condition: string; // "temperature > 80F"
    action: string; // "promote_cold_drinks"
    isActive: boolean;
  }>;
}

export interface InventoryManagementIntegration {
  system: 'restaurant365' | 'upserve' | 'barcodesinc' | 'custom';
  isConnected: boolean;
  
  capabilities: {
    realTimeTracking: boolean;
    autoReordering: boolean;
    wastageTracking: boolean;
    costAnalysis: boolean;
    supplierIntegration: boolean;
  };
  
  alertSettings: {
    lowStockThreshold: number;
    expirationAlerts: boolean;
    wasteAlerts: boolean;
    costVarianceAlerts: boolean;
  };
}

export interface CustomerDataIntegration {
  crmSystem?: 'hubspot' | 'salesforce' | 'mailchimp' | 'custom';
  loyaltyProgram?: 'yotpo' | 'loyalzoo' | 'custom';
  
  dataSharing: {
    orderHistory: boolean;
    preferences: boolean;
    demographics: boolean;
    feedback: boolean;
  };
  
  privacyCompliance: {
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    dataRetentionDays: number;
    anonymization: boolean;
  };
}

export interface AnalyticsIntegration {
  googleAnalytics?: {
    trackingId: string;
    conversionTracking: boolean;
    customEvents: boolean;
  };
  
  businessIntelligence?: {
    platform: 'tableau' | 'powerbi' | 'looker' | 'custom';
    dashboardUrl?: string;
    autoReporting: boolean;
  };
  
  customAnalytics?: {
    webhook: string;
    dataFormat: 'json' | 'csv' | 'xml';
    frequency: 'realtime' | 'hourly' | 'daily';
  };
}

export interface SocialMediaIntegration {
  platforms: Array<{
    platform: 'instagram' | 'facebook' | 'tiktok' | 'twitter';
    isConnected: boolean;
    accessToken?: string;
    
    features: {
      menuPhotoSync: boolean;
      reviewMonitoring: boolean;
      promotionPosting: boolean;
      customerServiceIntegration: boolean;
    };
  }>;
}

export interface KitchenDisplayIntegration {
  system: 'toast' | 'square' | 'custom';
  isConnected: boolean;
  
  features: {
    orderStreaming: boolean;
    preparationTimeTracking: boolean;
    specialInstructions: boolean;
    priorityOrdering: boolean;
    voiceAnnouncements: boolean;
  };
  
  customization: {
    displayFormat: string;
    colorCoding: boolean;
    soundAlerts: boolean;
    autoAdvance: boolean;
  };
}

export interface PaymentProcessingIntegration {
  providers: Array<{
    provider: 'stripe' | 'square' | 'paypal' | 'clover';
    isActive: boolean;
    supportedMethods: string[];
    processingFee: number;
    
    features: {
      savedCards: boolean;
      applePay: boolean;
      googlePay: boolean;
      splitPayments: boolean;
      tips: boolean;
      refunds: boolean;
    };
  }>;
}

export interface AIEnhancementIntegration {
  voiceServices: {
    transcription: 'openai' | 'google' | 'azure' | 'aws';
    textToSpeech: 'openai' | 'google' | 'azure' | 'aws';
    languageSupport: string[];
  };
  
  imageRecognition: {
    provider: 'google' | 'aws' | 'azure' | 'custom';
    features: {
      menuItemRecognition: boolean;
      customerPhotoOrdering: boolean;
      qualityControl: boolean;
    };
  };
  
  nlpEnhancements: {
    sentimentAnalysis: boolean;
    intentRecognition: boolean;
    languageTranslation: boolean;
    customEntityRecognition: boolean;
  };
}

// Main Integration Configuration
export interface TenantIntegrations {
  tenantId: string;
  
  pos: POSIntegration;
  deliveryPlatforms: DeliveryPlatformIntegration[];
  weather: WeatherServiceIntegration;
  inventory: InventoryManagementIntegration;
  customerData: CustomerDataIntegration;
  analytics: AnalyticsIntegration;
  socialMedia: SocialMediaIntegration;
  kitchenDisplay: KitchenDisplayIntegration;
  payments: PaymentProcessingIntegration;
  aiEnhancements: AIEnhancementIntegration;
  
  // Integration Health
  overallHealth: 'healthy' | 'partial' | 'critical';
  lastHealthCheck: Date;
  criticalIntegrations: string[]; // List of integration keys that are critical for operations
} 