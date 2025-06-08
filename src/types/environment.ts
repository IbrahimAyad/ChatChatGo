// Infrastructure and Environment Types for Ranking System

export type DatabaseType = 
  | 'firebase' 
  | 'supabase' 
  | 'postgresql' 
  | 'mysql' 
  | 'mongodb' 
  | 'sqlite' 
  | 'redis'
  | 'custom_api';

export type CloudProvider = 
  | 'vercel' 
  | 'aws' 
  | 'gcp' 
  | 'azure' 
  | 'cloudflare' 
  | 'self_hosted'
  | 'shared_hosting';

export type IntegrationType = 
  | 'webhook' 
  | 'rest_api' 
  | 'graphql' 
  | 'n8n' 
  | 'zapier' 
  | 'custom'
  | 'none';

export type ScaleRequirement = 'small' | 'medium' | 'large' | 'enterprise';
export type BudgetRange = 'free' | 'starter' | 'professional' | 'enterprise';
export type TechnicalLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface InfrastructureProfile {
  id: string;
  name: string;
  description: string;
  
  // Technical Stack
  database: DatabaseType;
  cloudProvider: CloudProvider;
  integrations: IntegrationType[];
  
  // Requirements
  scaleRequirement: ScaleRequirement;
  budgetRange: BudgetRange;
  technicalLevel: TechnicalLevel;
  
  // Constraints
  constraints: {
    maxLatency: number; // milliseconds
    dataResidency?: string; // country/region
    complianceRequired: string[]; // ['GDPR', 'HIPAA', 'SOC2']
    highAvailability: boolean;
    realTimeRequired: boolean;
  };
  
  // Existing Infrastructure
  existingServices: {
    auth?: string; // 'auth0', 'firebase_auth', 'custom'
    storage?: string; // 's3', 'gcs', 'local'
    monitoring?: string; // 'datadog', 'newrelic', 'custom'
    analytics?: string; // 'google_analytics', 'mixpanel', 'custom'
  };
}

export interface ChatbotConfiguration {
  id: string;
  name: string;
  description: string;
  
  // Core Features
  features: {
    voiceEnabled: boolean;
    multiLanguage: boolean;
    analytics: boolean;
    leadCapture: boolean;
    customBranding: boolean;
    apiIntegration: boolean;
    realTimeChat: boolean;
  };
  
  // Technical Requirements
  requirements: {
    minDatabaseConnections: number;
    estimatedQPS: number; // queries per second
    storageNeeds: 'low' | 'medium' | 'high';
    computeIntensity: 'low' | 'medium' | 'high';
    bandwidthUsage: 'low' | 'medium' | 'high';
  };
  
  // Compatibility
  compatibility: {
    supportedDatabases: DatabaseType[];
    supportedClouds: CloudProvider[];
    supportedIntegrations: IntegrationType[];
    minTechnicalLevel: TechnicalLevel;
  };
  
  // Pricing
  pricing: {
    setupComplexity: 1 | 2 | 3 | 4 | 5; // 1 = simple, 5 = complex
    monthlyCost: {
      min: number;
      max: number;
    };
    implementationTime: number; // days
  };
}

export interface CompatibilityScore {
  overall: number; // 0-100
  breakdown: {
    technical: number; // database, cloud, integration compatibility
    performance: number; // latency, scale, reliability
    cost: number; // budget alignment
    complexity: number; // implementation difficulty
    features: number; // feature match
  };
  
  reasons: {
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
  
  estimatedCosts: {
    setup: number;
    monthly: number;
    annual: number;
  };
  
  implementationPlan: {
    phases: Array<{
      name: string;
      duration: number; // days
      tasks: string[];
    }>;
    totalDuration: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface RankingResult {
  configuration: ChatbotConfiguration;
  score: CompatibilityScore;
  rank: number;
  confidence: number; // 0-100
  tags: string[]; // ['Recommended', 'Best Value', 'Enterprise Ready', etc.]
} 