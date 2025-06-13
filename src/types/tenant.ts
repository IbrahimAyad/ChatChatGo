import { SubscriptionPlan } from './index';

// Multi-Tenant System Types

export interface Tenant {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier
  domain?: string; // Custom domain (e.g., chat.restaurant.com)
  industry: Industry;
  status: TenantStatus;
  subscription: SubscriptionPlan;
  settings: TenantSettings;
  branding: TenantBranding;
  owner: TenantOwner;
  features: TenantFeatures;
  usage: TenantUsage;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantOwner {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'owner' | 'admin' | 'manager';
  lastLogin?: Date;
}

export interface TenantSettings {
  // AI Configuration
  aiModel: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo';
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  
  // Voice Settings
  voiceEnabled: boolean;
  voiceId: string; // ElevenLabs voice ID
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  
  // Chat Settings
  welcomeMessage: string;
  fallbackMessage: string;
  timezone: string;
  language: string;
  
  // Business Hours
  businessHours: BusinessHours;
  
  // Integration Settings
  integrations: {
    webhook?: string;
    zapier?: string;
    n8n?: string;
    slack?: string;
    discord?: string;
  };
  
  // N8N Integration
  n8nEnabled: boolean;
  n8nWorkflowId?: string;
  n8nWebhookUrl?: string;
  n8nWorkflowStatus?: 'pending' | 'active' | 'error' | 'disabled';
  
  // Scraped Menu Data Storage
  scrapedMenuData?: TenantScrapedMenuData;
  scrapingConfig?: TenantScrapingConfig;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: boolean;
  openTime?: string; // "09:00"
  closeTime?: string; // "22:00"
}

export interface TenantBranding {
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Logo & Images
  logoUrl?: string;
  faviconUrl?: string;
  backgroundImageUrl?: string;
  
  // Typography
  fontFamily: string;
  
  // Widget Styling
  widgetPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  widgetSize: 'small' | 'medium' | 'large';
  borderRadius: number;
  
  // Custom CSS
  customCss?: string;
}

export interface TenantFeatures {
  // Core Features
  voiceChat: boolean;
  textChat: boolean;
  fileUpload: boolean;
  
  // Advanced Features
  analytics: boolean;
  leadCapture: boolean;
  appointments: boolean;
  payments: boolean;
  multiLanguage: boolean;
  
  // Integration Features
  webhooks: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  customDomain: boolean;
  
  // Limits
  maxConversationsPerMonth: number;
  maxUsersPerMonth: number;
  maxStorageGB: number;
}

export interface TenantUsage {
  currentMonth: {
    conversations: number;
    uniqueUsers: number;
    voiceMinutes: number;
    storageUsedGB: number;
    apiCalls: number;
  };
  lastMonth: {
    conversations: number;
    uniqueUsers: number;
    voiceMinutes: number;
    storageUsedGB: number;
    apiCalls: number;
  };
  totalAllTime: {
    conversations: number;
    uniqueUsers: number;
    voiceMinutes: number;
    leads: number;
  };
}

export type Industry = 
  | 'restaurant'
  | 'retail'
  | 'healthcare'
  | 'education'
  | 'finance'
  | 'real-estate'
  | 'automotive'
  | 'hospitality'
  | 'fitness'
  | 'beauty'
  | 'legal'
  | 'consulting'
  | 'technology'
  | 'other';

export type TenantStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'trial'
  | 'expired';

export interface SubscriptionPlanDetails {
  tier: SubscriptionTier;
  name: string;
  price: number;
  features: {
    voiceChat: boolean;
    textChat: boolean;
    fileUpload: boolean;
    analytics: boolean;
    leadCapture: boolean;
    appointments: boolean;
    payments: boolean;
    multiLanguage: boolean;
    webhooks: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
    customDomain: boolean;
    maxConversationsPerMonth: number;
    maxUsersPerMonth: number;
    maxStorageGB: number;
  };
  ui: {
    theme: 'basic' | 'professional' | 'premium' | 'custom';
    animations: boolean;
    customBranding: boolean;
    advancedLayout: boolean;
    premiumEffects: boolean;
  };
}

export interface ChatWidgetConfig {
  tier: SubscriptionTier;
  theme: 'basic' | 'professional' | 'premium' | 'custom';
  layout: 'minimal' | 'standard' | 'advanced' | 'luxury';
  animations: boolean;
  effects: boolean;
  customBranding: boolean;
}

// Tenant-specific chat data
export interface TenantChatBot {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  systemPrompt: string;
  isActive: boolean;
  
  // Knowledge Base
  knowledgeBase: {
    documents: KnowledgeDocument[];
    faqs: FAQ[];
    products: Product[];
  };
  
  // Performance Metrics
  metrics: {
    totalConversations: number;
    averageRating: number;
    responseTime: number;
    resolutionRate: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  priority: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
  tags: string[];
}

// Tenant-scoped conversation data
export interface TenantConversation {
  id: string;
  tenantId: string;
  userId: string;
  
  // Session Info
  sessionId: string;
  userInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    userAgent: string;
    ipAddress: string;
  };
  
  // Messages
  messages: TenantMessage[];
  
  // Metadata
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  status: 'active' | 'ended' | 'abandoned';
  
  // Analytics
  sentiment: 'positive' | 'neutral' | 'negative';
  intent: string[];
  leadScore: number;
  wasResolved: boolean;
  userRating?: number;
  userFeedback?: string;
}

export interface TenantMessage {
  id: string;
  conversationId: string;
  
  // Content
  type: 'text' | 'voice' | 'image' | 'file';
  content: string;
  audioUrl?: string;
  fileUrl?: string;
  
  // Metadata
  sender: 'user' | 'assistant';
  timestamp: Date;
  processingTime?: number; // AI response time
  
  // Voice specific
  isVoiceMessage?: boolean;
  voiceTranscription?: string;
  voiceSynthesis?: {
    voiceId: string;
    audioUrl: string;
    duration: number;
  };
  
  // AI specific
  aiModel?: string;
  tokenCount?: number;
  confidence?: number;
}

// Tenant API Configuration
export interface TenantApiConfig {
  tenantId: string;
  
  // API Keys
  apiKey: string;
  webhookSecret: string;
  
  // Rate Limiting
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  
  // Allowed Origins
  allowedOrigins: string[];
  
  // Feature Flags
  features: {
    cors: boolean;
    webhooks: boolean;
    analytics: boolean;
    fileUpload: boolean;
  };
  
  createdAt: Date;
  lastUsed?: Date;
}

// Tenant Analytics
export interface TenantAnalytics {
  tenantId: string;
  period: 'hour' | 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
  
  metrics: {
    // Volume Metrics
    totalConversations: number;
    totalMessages: number;
    uniqueUsers: number;
    
    // Engagement Metrics
    averageConversationLength: number;
    averageResponseTime: number;
    bounceRate: number;
    
    // Voice Metrics
    voiceUsagePercentage: number;
    averageVoiceMessageDuration: number;
    voiceToTextAccuracy: number;
    
    // Business Metrics
    leadsGenerated: number;
    conversionRate: number;
    customerSatisfaction: number;
    
    // Performance Metrics
    aiAccuracy: number;
    responseLatency: number;
    uptime: number;
  };
  
  // Trend Data
  trends: {
    conversationsOverTime: TimeSeriesData[];
    userEngagementOverTime: TimeSeriesData[];
    sentimentOverTime: TimeSeriesData[];
  };
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
}

// Utility types for tenant context
export interface TenantContext {
  tenant: Tenant;
  chatBot: TenantChatBot;
  user?: {
    id: string;
    sessionId: string;
    metadata: Record<string, any>;
  };
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  industry: Industry;
  owner: {
    email: string;
    name: string;
    phone?: string;
  };
  subscription: SubscriptionPlan;
  settings?: Partial<TenantSettings>;
  branding?: Partial<TenantBranding>;
}

export interface UpdateTenantRequest {
  name?: string;
  settings?: Partial<TenantSettings>;
  branding?: Partial<TenantBranding>;
  features?: Partial<TenantFeatures>;
}

// Multi-tenant query helpers
export interface TenantQuery {
  tenantId?: string;
  slug?: string;
  domain?: string;
  status?: TenantStatus;
  industry?: Industry;
  subscription?: SubscriptionPlan;
}

export interface TenantListResponse {
  tenants: Tenant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TenantConfig {
  // ... existing code ...
  
  // N8N Workflow Configuration
  n8nWorkflow?: {
    templateType: 'restaurant' | 'retail' | 'healthcare' | 'custom';
    businessContext: {
      menu?: MenuItem[];
      specialOffers?: SpecialOffer[];
      businessInfo: BusinessInfo;
      orderingRules: OrderingRules;
    };
    integrations: {
      posSystem?: POSIntegration;
      paymentGateway?: PaymentIntegration;
      inventory?: InventoryIntegration;
    };
  };
}

// New interfaces for restaurant-specific context
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  allergens?: string[];
  customizations?: MenuCustomization[];
}

export interface MenuCustomization {
  type: 'size' | 'topping' | 'side' | 'drink';
  options: {
    name: string;
    priceModifier: number;
  }[];
}

export interface SpecialOffer {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'bogo';
  discountValue: number;
  validUntil: Date;
  conditions?: string;
}

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  website?: string;
  description: string;
  specialties: string[];
  averageOrderTime: number; // minutes
  deliveryRadius?: number; // miles
  minimumOrder?: number;
}

export interface OrderingRules {
  allowModifications: boolean;
  maxItemsPerOrder: number;
  advanceOrderHours: number;
  cancellationWindow: number; // minutes
  requirePhoneVerification: boolean;
}

export interface POSIntegration {
  provider: 'square' | 'toast' | 'clover' | 'custom';
  apiEndpoint: string;
  credentials: {
    apiKey?: string;
    merchantId?: string;
  };
}

export interface PaymentIntegration {
  provider: 'stripe' | 'square' | 'paypal';
  publicKey: string;
  webhookUrl: string;
}

export interface InventoryIntegration {
  provider: 'toast' | 'custom';
  syncFrequency: number; // minutes
  webhookUrl: string;
}

// Scraped Menu Data Storage Interfaces
export interface TenantScrapedMenuData {
  restaurantName: string;
  cuisine?: string;
  location?: string;
  phone?: string;
  hours?: string;
  website?: string;
  
  // Menu Items
  menu: ScrapedMenuItem[];
  globalCustomizations?: ScrapedMenuCustomization[];
  specialOffers?: string[];
  
  // AI Context (pre-formatted for quick use)
  aiContext: string;
  
  // Metadata
  source: string; // URL that was scraped
  dataSource: 'scraped' | 'manual' | 'api';
  lastScraped: Date;
  lastUpdated: Date;
  isStale: boolean; // Auto-calculated based on lastScraped + maxAge
  
  // Scraping History
  scrapingHistory: ScrapingAttempt[];
}

export interface ScrapedMenuItem {
  name: string;
  description?: string;
  price?: string;
  category?: string;
  image?: string;
  allergens?: string[];
  customizations?: string[];
  
  // Metadata
  availability?: boolean;
  isPopular?: boolean;
  nutritionalInfo?: {
    calories?: number;
    dietary?: string[]; // 'vegan', 'gluten-free', etc.
  };
}

export interface ScrapedMenuCustomization {
  type: 'substitute' | 'add' | 'remove' | 'side' | 'sauce' | 'size' | 'cooking';
  name: string;
  options: string[];
  price?: string;
  category?: string;
}

export interface ScrapingAttempt {
  timestamp: Date;
  source: string;
  success: boolean;
  itemsFound: number;
  error?: string;
  processingTime: number; // milliseconds
}

export interface TenantScrapingConfig {
  // Data Sources (in priority order)
  sources: ScrapingSource[];
  
  // Update Settings
  autoRefresh: boolean;
  refreshInterval: number; // hours
  maxAge: number; // hours before data is considered stale
  
  // Fallback Options
  fallbackEnabled: boolean;
  fallbackMessage: string;
  
  // Quality Control
  minimumItemsRequired: number;
  requirePrices: boolean;
  requireDescriptions: boolean;
  
  // Notifications
  notifyOnFailure: boolean;
  notifyOnSuccess: boolean;
  notificationEmail?: string;
}

export interface ScrapingSource {
  type: 'website' | 'ubereats' | 'doordash' | 'grubhub' | 'seamless' | 'api';
  url: string;
  priority: number; // 1 = highest priority
  enabled: boolean;
  
  // Custom Settings
  selector?: string; // Custom CSS selector for website scraping
  apiKey?: string; // For API-based sources
  
  // Rate Limiting
  lastAttempt?: Date;
  failureCount: number;
  isBlocked: boolean;
}

// Dynamic Menu & Pricing Types
export interface DynamicMenuRule {
  id: string;
  name: string;
  type: 'time_based' | 'inventory_based' | 'weather_based' | 'demand_based';
  trigger: {
    condition: string; // e.g., "inventory_level < 10" or "hour >= 22"
    value: any;
  };
  action: {
    type: 'hide_item' | 'adjust_price' | 'promote_item' | 'substitute_item';
    itemIds: string[];
    priceMultiplier?: number; // 0.8 for 20% off, 1.2 for 20% markup
    replacementItemId?: string;
    promotionText?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  itemId: string;
  currentStock: number;
  minThreshold: number;
  maxCapacity: number;
  unit: string; // 'pieces', 'kg', 'liters', etc.
  costPerUnit: number;
  supplier?: string;
  lastRestocked: Date;
  autoReorderEnabled: boolean;
  reorderPoint: number;
  reorderQuantity: number;
}

export interface MenuPerformanceMetrics {
  itemId: string;
  itemName: string;
  totalOrders: number;
  revenue: number;
  profitMargin: number;
  averageRating: number;
  preparationTime: number;
  popularityScore: number; // 0-100 based on orders/views ratio
  trendDirection: 'rising' | 'stable' | 'declining';
  seasonalMultiplier: Record<string, number>; // month -> multiplier
  timeSlotPopularity: Record<string, number>; // hour -> popularity
}

export interface WeatherBasedRule {
  weatherCondition: 'rain' | 'snow' | 'hot' | 'cold' | 'sunny' | 'cloudy';
  temperatureRange?: {
    min: number;
    max: number;
  };
  menuAdjustments: {
    promoteItems: string[]; // Item IDs to promote
    demoteItems: string[]; // Item IDs to reduce visibility
    seasonalMessage: string; // "Perfect weather for our hot soup!"
  };
}

// Enhanced Tenant Configuration
export interface SmartMenuConfig {
  dynamicPricingEnabled: boolean;
  inventoryIntegrationEnabled: boolean;
  weatherBasedMenuEnabled: boolean;
  demandBasedPricingEnabled: boolean;
  
  rules: DynamicMenuRule[];
  inventory: InventoryItem[];
  performanceMetrics: MenuPerformanceMetrics[];
  weatherRules: WeatherBasedRule[];
  
  // AI-powered suggestions
  suggestedPromotions: Array<{
    itemId: string;
    reason: string;
    suggestedDiscount: number;
    projectedIncrease: string;
  }>;
  
  // Upselling intelligence
  upsellRules: Array<{
    baseItem: string;
    suggestedAddons: Array<{
      itemId: string;
      successRate: number;
      averageIncrease: number;
    }>;
  }>;
}

// Customer Loyalty & Personalization Types
export interface CustomerProfile {
  customerId: string;
  phoneNumber?: string;
  email?: string;
  name?: string;
  
  // Loyalty Program
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  visitCount: number;
  
  // Preferences & Restrictions
  dietaryRestrictions: string[]; // 'vegetarian', 'gluten-free', 'nut-allergy', etc.
  preferredItems: string[]; // Item IDs
  dislikedItems: string[]; // Item IDs
  spicePreference: 'mild' | 'medium' | 'hot' | 'extra-hot';
  preferredPaymentMethod?: string;
  
  // Behavioral Data
  orderHistory: Array<{
    orderId: string;
    items: Array<{
      itemId: string;
      quantity: number;
      customizations: string[];
    }>;
    total: number;
    timestamp: Date;
    satisfaction?: number; // 1-5 rating
  }>;
  
  // AI Learning Data
  conversationStyle: 'formal' | 'casual' | 'emoji-heavy' | 'brief';
  preferredOrderingMethod: 'voice' | 'text' | 'mixed';
  averageOrderValue: number;
  orderFrequency: number; // orders per month
  lastOrderDate: Date;
  
  // Smart Recommendations
  suggestedItems: Array<{
    itemId: string;
    reason: string;
    confidence: number;
  }>;
}

export interface LoyaltyProgram {
  programName: string;
  isActive: boolean;
  
  // Point System
  pointsPerDollar: number;
  bonusPointEvents: Array<{
    event: 'birthday' | 'first_order' | 'review' | 'referral';
    points: number;
  }>;
  
  // Tier Benefits
  tiers: Array<{
    name: string;
    minPoints: number;
    benefits: Array<{
      type: 'discount_percentage' | 'free_item' | 'priority_support' | 'free_delivery';
      value: string | number;
      description: string;
    }>;
    color: string; // for UI theming
  }>;
  
  // Rewards Catalog
  rewards: Array<{
    id: string;
    name: string;
    description: string;
    pointsCost: number;
    type: 'free_item' | 'discount' | 'upgrade';
    itemId?: string; // if type is free_item
    discountPercentage?: number; // if type is discount
  }>;
}

export interface PersonalizationEngine {
  isEnabled: boolean;
  
  // Dynamic Greeting
  greetingStyle: 'formal' | 'friendly' | 'adaptive';
  useCustomerName: boolean;
  rememberLastOrder: boolean;
  
  // Menu Personalization
  showRecommendations: boolean;
  hideDislikedItems: boolean;
  prioritizePreferredItems: boolean;
  adaptToTimeOfDay: boolean; // breakfast items in morning, etc.
  
  // Communication Style
  adaptToCustomerStyle: boolean;
  useEmojis: boolean;
  conversationLength: 'brief' | 'detailed' | 'adaptive';
  
  // Smart Upselling
  intelligentUpselling: boolean;
  maxUpsellAttempts: number;
  upsellBehavior: 'gentle' | 'moderate' | 'aggressive';
}

export type SubscriptionTier = 'basic' | 'professional' | 'enterprise' | 'custom'; 