// Core tenant and user types
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  settings: TenantSettings;
  subscription: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  voiceEnabled: boolean;
  defaultLanguage: string;
  allowFallbackToText: boolean;
  analytics: {
    enabled: boolean;
    retentionDays: number;
  };
  integrations: {
    n8n?: {
      webhookUrl: string;
      apiKey: string;
    };
    firebase?: {
      projectId: string;
    };
    openai?: {
      apiKey: string;
      model: string;
    };
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'owner' | 'member';
  tenantId: string;
  avatar?: string;
  preferences: UserPreferences;
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    newLeads: boolean;
    systemUpdates: boolean;
  };
}

// Chat and AI Assistant types
export interface ChatBot {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  vertical: BusinessVertical;
  template: ChatTemplate;
  config: BotConfiguration;
  status: 'active' | 'inactive' | 'draft';
  analytics: BotAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatTemplate {
  id: string;
  name: string;
  vertical: BusinessVertical;
  description: string;
  personality: BotPersonality;
  flows: ConversationFlow[];
  intents: Intent[];
  responses: ResponseTemplate[];
  demoScripts: DemoScript[];
}

export interface BotConfiguration {
  voice: VoiceConfig;
  appearance: AppearanceConfig;
  behavior: BehaviorConfig;
  integrations: IntegrationConfig;
}

export interface VoiceConfig {
  enabled: boolean;
  provider: 'openai' | 'elevenlabs' | 'google';
  voiceId: string;
  speed: number;
  pitch: number;
  fallbackToText: boolean;
}

export interface AppearanceConfig {
  widgetPosition: 'bottom-right' | 'bottom-left' | 'center';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  avatar?: string;
  companyLogo?: string;
}

export interface BehaviorConfig {
  greeting: string;
  fallbackMessages: string[];
  maxRetries: number;
  sessionTimeout: number;
  collectLeadInfo: boolean;
  requireName: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
}

// Conversation and Lead types
export interface ChatSession {
  id: string;
  botId: string;
  tenantId: string;
  userId?: string;
  messages: Message[];
  metadata: SessionMetadata;
  leadInfo?: LeadInformation;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: Date;
  endedAt?: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  audioUrl?: string;
  intent?: string;
  confidence?: number;
  timestamp: Date;
}

export interface SessionMetadata {
  userAgent: string;
  ipAddress: string;
  referrer?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  deviceType: 'mobile' | 'tablet' | 'desktop';
  voiceUsed: boolean;
}

export interface LeadInformation {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  score: number;
  source: string;
  qualified: boolean;
  tags: string[];
}

// Analytics types
export interface BotAnalytics {
  totalSessions: number;
  completedSessions: number;
  averageSessionDuration: number;
  leadsGenerated: number;
  conversionRate: number;
  voiceUsageRate: number;
  topIntents: IntentUsage[];
  satisfaction: {
    averageRating: number;
    totalRatings: number;
  };
}

export interface IntentUsage {
  intent: string;
  count: number;
  successRate: number;
}

// Business and subscription types
export type BusinessVertical = 
  | 'restaurant'
  | 'retail'
  | 'healthcare'
  | 'finance'
  | 'education'
  | 'hospitality'
  | 'automotive'
  | 'real-estate'
  | 'other';

export type SubscriptionPlan = 
  | 'starter'
  | 'growth' 
  | 'enterprise'
  | 'custom';

export interface SubscriptionDetails {
  plan: SubscriptionPlan;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  limits: {
    bots: number;
    sessions: number;
    analytics: boolean;
    whiteLabel: boolean;
    customVoice: boolean;
  };
  trialEndsAt?: Date;
  nextBillingAt: Date;
}

// Conversation flow types
export interface ConversationFlow {
  id: string;
  name: string;
  description: string;
  trigger: FlowTrigger;
  steps: FlowStep[];
  fallbacks: FallbackOption[];
}

export interface FlowTrigger {
  type: 'intent' | 'keyword' | 'context' | 'time';
  value: string;
  conditions?: Record<string, any>;
}

export interface FlowStep {
  id: string;
  type: 'message' | 'question' | 'action' | 'condition' | 'n8n_webhook';
  content?: string;
  actions?: StepAction[];
  conditions?: StepCondition[];
  nextStep?: string;
}

export interface StepAction {
  type: 'collect_info' | 'send_webhook' | 'update_context' | 'transfer_human';
  parameters: Record<string, any>;
}

export interface StepCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  nextStep: string;
}

export interface FallbackOption {
  trigger: 'no_response' | 'low_confidence' | 'error' | 'timeout';
  response: string;
  action?: 'retry' | 'transfer' | 'end';
}

// Intent and NLU types
export interface Intent {
  id: string;
  name: string;
  description: string;
  examples: string[];
  responses: string[];
  actions?: IntentAction[];
  confidence_threshold: number;
}

export interface IntentAction {
  type: 'webhook' | 'collect_lead' | 'transfer' | 'end_conversation';
  parameters: Record<string, any>;
}

export interface ResponseTemplate {
  id: string;
  intent: string;
  variations: string[];
  conditions?: Record<string, any>;
  personalization?: PersonalizationRule[];
}

export interface PersonalizationRule {
  field: string;
  value: any;
  response: string;
}

// Demo and template types
export interface DemoScript {
  id: string;
  name: string;
  description: string;
  vertical: BusinessVertical;
  scenario: string;
  expectedFlow: string[];
  demoData: Record<string, any>;
}

export interface BotPersonality {
  tone: 'professional' | 'friendly' | 'casual' | 'formal';
  style: 'concise' | 'detailed' | 'conversational';
  emoji: boolean;
  humor: boolean;
  empathy: boolean;
}

// N8N and integration types
export interface IntegrationConfig {
  n8n?: {
    enabled: boolean;
    webhookUrl: string;
    workflows: N8NWorkflow[];
  };
  crm?: {
    provider: 'hubspot' | 'salesforce' | 'pipedrive';
    apiKey: string;
    mappings: Record<string, string>;
  };
  analytics?: {
    provider: 'google' | 'mixpanel' | 'amplitude';
    trackingId: string;
  };
}

export interface N8NWorkflow {
  id: string;
  name: string;
  description: string;
  triggerType: 'lead_captured' | 'session_ended' | 'intent_matched';
  webhookUrl: string;
  active: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Widget and embedding types
export interface WidgetConfig {
  botId: string;
  tenantId: string;
  appearance: AppearanceConfig;
  behavior: BehaviorConfig;
  authentication?: {
    required: boolean;
    provider: 'jwt' | 'api_key';
  };
}

export interface WidgetEmbed {
  id: string;
  botId: string;
  domain: string;
  config: WidgetConfig;
  stats: {
    impressions: number;
    sessions: number;
    leads: number;
  };
  createdAt: Date;
} 