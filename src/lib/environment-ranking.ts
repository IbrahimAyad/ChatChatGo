import { 
  InfrastructureProfile, 
  ChatbotConfiguration, 
  CompatibilityScore, 
  RankingResult,
  DatabaseType,
  CloudProvider,
  IntegrationType,
  ScaleRequirement,
  BudgetRange,
  TechnicalLevel
} from '@/types/environment';

// Predefined Chatbot Configurations
export const CHATBOT_CONFIGURATIONS: ChatbotConfiguration[] = [
  {
    id: 'lite_starter',
    name: 'ChatChatGo Lite',
    description: 'Perfect for small businesses just getting started with AI chat',
    features: {
      voiceEnabled: false,
      multiLanguage: false,
      analytics: true,
      leadCapture: true,
      customBranding: false,
      apiIntegration: false,
      realTimeChat: true,
    },
    requirements: {
      minDatabaseConnections: 5,
      estimatedQPS: 10,
      storageNeeds: 'low',
      computeIntensity: 'low',
      bandwidthUsage: 'low',
    },
    compatibility: {
      supportedDatabases: ['firebase', 'supabase', 'sqlite', 'mysql'],
      supportedClouds: ['vercel', 'shared_hosting', 'self_hosted'],
      supportedIntegrations: ['webhook', 'none'],
      minTechnicalLevel: 'beginner',
    },
    pricing: {
      setupComplexity: 1,
      monthlyCost: { min: 0, max: 29 },
      implementationTime: 1,
    },
  },
  {
    id: 'professional_voice',
    name: 'ChatChatGo Professional + Voice',
    description: 'Advanced voice-enabled chatbot with full analytics suite',
    features: {
      voiceEnabled: true,
      multiLanguage: true,
      analytics: true,
      leadCapture: true,
      customBranding: true,
      apiIntegration: true,
      realTimeChat: true,
    },
    requirements: {
      minDatabaseConnections: 25,
      estimatedQPS: 100,
      storageNeeds: 'medium',
      computeIntensity: 'medium',
      bandwidthUsage: 'high',
    },
    compatibility: {
      supportedDatabases: ['firebase', 'supabase', 'postgresql', 'mysql', 'mongodb'],
      supportedClouds: ['vercel', 'aws', 'gcp', 'azure'],
      supportedIntegrations: ['webhook', 'rest_api', 'n8n', 'zapier'],
      minTechnicalLevel: 'intermediate',
    },
    pricing: {
      setupComplexity: 3,
      monthlyCost: { min: 99, max: 299 },
      implementationTime: 5,
    },
  },
  {
    id: 'enterprise_suite',
    name: 'ChatChatGo Enterprise Suite',
    description: 'Full-scale enterprise solution with custom integrations and compliance',
    features: {
      voiceEnabled: true,
      multiLanguage: true,
      analytics: true,
      leadCapture: true,
      customBranding: true,
      apiIntegration: true,
      realTimeChat: true,
    },
    requirements: {
      minDatabaseConnections: 100,
      estimatedQPS: 1000,
      storageNeeds: 'high',
      computeIntensity: 'high',
      bandwidthUsage: 'high',
    },
    compatibility: {
      supportedDatabases: ['postgresql', 'mysql', 'mongodb', 'redis', 'custom_api'],
      supportedClouds: ['aws', 'gcp', 'azure', 'self_hosted'],
      supportedIntegrations: ['rest_api', 'graphql', 'n8n', 'custom'],
      minTechnicalLevel: 'advanced',
    },
    pricing: {
      setupComplexity: 5,
      monthlyCost: { min: 500, max: 2000 },
      implementationTime: 21,
    },
  },
  {
    id: 'restaurant_special',
    name: 'Restaurant Pro',
    description: 'Specialized for restaurants with voice ordering and POS integration',
    features: {
      voiceEnabled: true,
      multiLanguage: false,
      analytics: true,
      leadCapture: true,
      customBranding: true,
      apiIntegration: true,
      realTimeChat: true,
    },
    requirements: {
      minDatabaseConnections: 15,
      estimatedQPS: 50,
      storageNeeds: 'medium',
      computeIntensity: 'medium',
      bandwidthUsage: 'medium',
    },
    compatibility: {
      supportedDatabases: ['firebase', 'supabase', 'mysql', 'postgresql'],
      supportedClouds: ['vercel', 'aws', 'gcp'],
      supportedIntegrations: ['webhook', 'rest_api', 'n8n'],
      minTechnicalLevel: 'intermediate',
    },
    pricing: {
      setupComplexity: 2,
      monthlyCost: { min: 79, max: 199 },
      implementationTime: 3,
    },
  },
];

// Scoring Weights
const SCORING_WEIGHTS = {
  technical: 0.25,
  performance: 0.20,
  cost: 0.20,
  complexity: 0.15,
  features: 0.20,
};

export class EnvironmentRankingEngine {
  
  // Technical Compatibility Score (0-100)
  private calculateTechnicalScore(
    profile: InfrastructureProfile, 
    config: ChatbotConfiguration
  ): number {
    let score = 0;
    let maxScore = 0;

    // Database compatibility (40 points)
    maxScore += 40;
    if (config.compatibility.supportedDatabases.includes(profile.database)) {
      score += 40;
    } else {
      // Partial points for close matches
      const databaseCompatibility = this.getDatabaseCompatibility(profile.database, config.compatibility.supportedDatabases);
      score += databaseCompatibility * 40;
    }

    // Cloud provider compatibility (35 points)
    maxScore += 35;
    if (config.compatibility.supportedClouds.includes(profile.cloudProvider)) {
      score += 35;
    }

    // Integration compatibility (25 points)
    maxScore += 25;
    const matchingIntegrations = profile.integrations.filter(integration =>
      config.compatibility.supportedIntegrations.includes(integration)
    );
    score += (matchingIntegrations.length / Math.max(profile.integrations.length, 1)) * 25;

    return Math.round((score / maxScore) * 100);
  }

  // Performance Score based on scale and requirements (0-100)
  private calculatePerformanceScore(
    profile: InfrastructureProfile, 
    config: ChatbotConfiguration
  ): number {
    let score = 0;

    // Scale matching (40 points)
    const scaleMatch = this.getScaleCompatibility(profile.scaleRequirement, config);
    score += scaleMatch * 40;

    // Latency requirements (30 points)
    const latencyScore = this.getLatencyScore(profile.constraints.maxLatency, config);
    score += latencyScore * 30;

    // High availability requirement (30 points)
    if (profile.constraints.highAvailability) {
      const haScore = this.getHighAvailabilityScore(profile.cloudProvider, config);
      score += haScore * 30;
    } else {
      score += 30; // No HA requirement, full points
    }

    return Math.round(score);
  }

  // Cost Alignment Score (0-100)
  private calculateCostScore(
    profile: InfrastructureProfile, 
    config: ChatbotConfiguration
  ): number {
    const budgetRanges = {
      free: { min: 0, max: 0 },
      starter: { min: 0, max: 50 },
      professional: { min: 50, max: 500 },
      enterprise: { min: 500, max: 10000 },
    };

    const budget = budgetRanges[profile.budgetRange];
    const configCost = config.pricing.monthlyCost;

    if (configCost.min > budget.max) {
      return 0; // Too expensive
    }

    if (configCost.max <= budget.max && configCost.min >= budget.min) {
      return 100; // Perfect fit
    }

    // Partial scoring based on overlap
    const overlap = Math.min(budget.max, configCost.max) - Math.max(budget.min, configCost.min);
    const budgetRange = budget.max - budget.min;
    
    return Math.max(0, Math.round((overlap / Math.max(budgetRange, 1)) * 100));
  }

  // Implementation Complexity Score (0-100, higher = less complex)
  private calculateComplexityScore(
    profile: InfrastructureProfile, 
    config: ChatbotConfiguration
  ): number {
    let score = 100;

    // Technical level requirement
    const technicalLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const profileLevel = technicalLevels.indexOf(profile.technicalLevel);
    const requiredLevel = technicalLevels.indexOf(config.compatibility.minTechnicalLevel);
    
    if (profileLevel < requiredLevel) {
      score -= (requiredLevel - profileLevel) * 25; // Penalize if too complex
    }

    // Setup complexity
    const complexityPenalty = (config.pricing.setupComplexity - 1) * 10;
    score -= complexityPenalty;

    // Implementation time
    if (config.pricing.implementationTime > 7) {
      score -= 20; // Penalty for long implementation
    }

    return Math.max(0, Math.round(score));
  }

  // Feature Match Score (0-100)
  private calculateFeatureScore(
    profile: InfrastructureProfile, 
    config: ChatbotConfiguration
  ): number {
    let score = 0;
    let requirements = 0;

    // Voice requirement based on scale and industry
    if (profile.scaleRequirement !== 'small') {
      requirements++;
      if (config.features.voiceEnabled) score++;
    }

    // Real-time requirement
    if (profile.constraints.realTimeRequired) {
      requirements++;
      if (config.features.realTimeChat) score++;
    }

    // Analytics for non-free tiers
    if (profile.budgetRange !== 'free') {
      requirements++;
      if (config.features.analytics) score++;
    }

    // Lead capture is always valuable
    requirements++;
    if (config.features.leadCapture) score++;

    // API integration for advanced users
    if (profile.technicalLevel === 'advanced' || profile.technicalLevel === 'expert') {
      requirements++;
      if (config.features.apiIntegration) score++;
    }

    return requirements > 0 ? Math.round((score / requirements) * 100) : 100;
  }

  // Helper methods
  private getDatabaseCompatibility(profileDb: DatabaseType, supportedDbs: DatabaseType[]): number {
    const compatibility: Record<DatabaseType, DatabaseType[]> = {
      'firebase': ['supabase', 'mongodb'],
      'supabase': ['firebase', 'postgresql'],
      'postgresql': ['mysql', 'supabase'],
      'mysql': ['postgresql', 'sqlite'],
      'mongodb': ['firebase'],
      'sqlite': ['mysql'],
      'redis': ['mongodb'],
      'custom_api': [],
    };

    const compatible = compatibility[profileDb] || [];
    const matches = supportedDbs.filter(db => compatible.includes(db));
    return matches.length > 0 ? 0.6 : 0; // 60% compatibility for close matches
  }

  private getScaleCompatibility(scale: ScaleRequirement, config: ChatbotConfiguration): number {
    const scaleToQPS = {
      small: { min: 0, max: 50 },
      medium: { min: 25, max: 200 },
      large: { min: 100, max: 1000 },
      enterprise: { min: 500, max: 10000 },
    };

    const scaleRange = scaleToQPS[scale];
    const configQPS = config.requirements.estimatedQPS;

    if (configQPS >= scaleRange.min && configQPS <= scaleRange.max) {
      return 1.0;
    }

    if (configQPS < scaleRange.min) {
      return 0.6; // Under-powered but might work
    }

    return 0.3; // Over-powered, inefficient
  }

  private getLatencyScore(maxLatency: number, config: ChatbotConfiguration): number {
    // Voice-enabled requires lower latency
    const baseLatency = config.features.voiceEnabled ? 200 : 500;
    
    if (maxLatency >= baseLatency) {
      return 1.0;
    }

    return Math.max(0.3, maxLatency / baseLatency);
  }

  private getHighAvailabilityScore(cloud: CloudProvider, config: ChatbotConfiguration): number {
    const haCapable = ['aws', 'gcp', 'azure', 'vercel'];
    return haCapable.includes(cloud) && config.compatibility.supportedClouds.includes(cloud) ? 1.0 : 0.4;
  }

  // Main ranking method
  public rankConfigurations(profile: InfrastructureProfile): RankingResult[] {
    const results: RankingResult[] = [];

    for (const config of CHATBOT_CONFIGURATIONS) {
      const technical = this.calculateTechnicalScore(profile, config);
      const performance = this.calculatePerformanceScore(profile, config);
      const cost = this.calculateCostScore(profile, config);
      const complexity = this.calculateComplexityScore(profile, config);
      const features = this.calculateFeatureScore(profile, config);

      const overall = Math.round(
        technical * SCORING_WEIGHTS.technical +
        performance * SCORING_WEIGHTS.performance +
        cost * SCORING_WEIGHTS.cost +
        complexity * SCORING_WEIGHTS.complexity +
        features * SCORING_WEIGHTS.features
      );

      const score: CompatibilityScore = {
        overall,
        breakdown: { technical, performance, cost, complexity, features },
        reasons: this.generateReasons(profile, config, { technical, performance, cost, complexity, features }),
        estimatedCosts: this.calculateEstimatedCosts(config, profile),
        implementationPlan: this.generateImplementationPlan(config, profile),
      };

      results.push({
        configuration: config,
        score,
        rank: 0, // Will be set after sorting
        confidence: this.calculateConfidence(score),
        tags: this.generateTags(config, score, profile),
      });
    }

    // Sort by overall score and assign ranks
    results.sort((a, b) => b.score.overall - a.score.overall);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    return results;
  }

  private generateReasons(
    profile: InfrastructureProfile, 
    config: ChatbotConfiguration, 
    scores: any
  ): { strengths: string[]; concerns: string[]; recommendations: string[] } {
    const strengths: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];

    // Analyze scores and generate insights
    if (scores.technical > 80) strengths.push('Excellent technical compatibility with your infrastructure');
    if (scores.cost > 80) strengths.push('Perfect fit for your budget range');
    if (scores.complexity > 80) strengths.push('Easy to implement with your technical expertise');

    if (scores.technical < 60) concerns.push('Limited compatibility with your current database/cloud setup');
    if (scores.cost < 40) concerns.push('May exceed your budget requirements');
    if (scores.complexity < 50) concerns.push('Implementation complexity may require additional technical resources');

    if (scores.performance < 70) recommendations.push('Consider upgrading your infrastructure for better performance');
    if (!config.features.voiceEnabled && profile.scaleRequirement !== 'small') {
      recommendations.push('Voice features could significantly improve user engagement');
    }

    return { strengths, concerns, recommendations };
  }

  private calculateEstimatedCosts(config: ChatbotConfiguration, profile: InfrastructureProfile) {
    const setupMultiplier = profile.technicalLevel === 'beginner' ? 1.5 : 1.0;
    const setup = config.pricing.setupComplexity * 500 * setupMultiplier;
    
    return {
      setup,
      monthly: config.pricing.monthlyCost.min,
      annual: config.pricing.monthlyCost.min * 12 * 0.9, // 10% annual discount
    };
  }

  private generateImplementationPlan(config: ChatbotConfiguration, profile: InfrastructureProfile) {
    const phases = [
      {
        name: 'Setup & Configuration',
        duration: Math.ceil(config.pricing.implementationTime * 0.3),
        tasks: ['Environment setup', 'Database configuration', 'Initial deployment'],
      },
      {
        name: 'Customization & Integration',
        duration: Math.ceil(config.pricing.implementationTime * 0.5),
        tasks: ['Brand customization', 'API integrations', 'Feature configuration'],
      },
      {
        name: 'Testing & Launch',
        duration: Math.ceil(config.pricing.implementationTime * 0.2),
        tasks: ['Testing', 'User training', 'Go-live support'],
      },
    ];

    return {
      phases,
      totalDuration: config.pricing.implementationTime,
      riskLevel: (config.pricing.setupComplexity > 3 ? 'high' : 
                 config.pricing.setupComplexity > 2 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
    };
  }

  private calculateConfidence(score: CompatibilityScore): number {
    // Higher confidence when scores are consistent
    const scores = Object.values(score.breakdown);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    const consistency = Math.max(0, 100 - variance);
    
    return Math.round((score.overall + consistency) / 2);
  }

  private generateTags(config: ChatbotConfiguration, score: CompatibilityScore, profile: InfrastructureProfile): string[] {
    const tags: string[] = [];

    if (score.overall >= 90) tags.push('Highly Recommended');
    if (score.overall >= 80) tags.push('Great Match');
    if (score.breakdown.cost >= 90) tags.push('Best Value');
    if (config.pricing.setupComplexity <= 2) tags.push('Easy Setup');
    if (config.features.voiceEnabled) tags.push('Voice Enabled');
    if (profile.scaleRequirement === 'enterprise' && config.id === 'enterprise_suite') tags.push('Enterprise Ready');
    if (config.id === 'restaurant_special') tags.push('Industry Specialized');

    return tags;
  }
}

// Initialize the ranking engine
export const rankingEngine = new EnvironmentRankingEngine(); 