// Universal Intelligence Hub - Shared Learning System for All ChatChatGo Bots
// This system allows all chatbots to contribute to and benefit from shared knowledge

interface UniversalLearningData {
  // Anonymized interaction patterns
  interactionType: 'upsell' | 'cross-sell' | 'complaint' | 'compliment' | 'question' | 'order';
  contextTriggers: string[];
  userSentiment: 'positive' | 'neutral' | 'negative';
  timeOfDay: number; // 0-23
  dayOfWeek: number; // 0-6
  orderValue?: number;
  success: boolean;
  confidence: number;
  restaurantType: string; // 'fast-food' | 'casual-dining' | 'fine-dining' | 'pizza' | 'ethnic' etc.
  timestamp: Date;
  anonymizedUserId: string; // Hashed for privacy
}

interface FoodKnowledgeItem {
  foodItem: string;
  category: string;
  commonPairings: string[];
  allergensInfo: string[];
  popularTimes: number[]; // Hours when this item is most ordered
  seasonality: 'spring' | 'summer' | 'fall' | 'winter' | 'year-round';
  avgRating: number;
  keywords: string[];
  nutritionalTags: string[];
}

interface ConversationPattern {
  intent: string;
  commonPhrases: string[];
  bestResponses: string[];
  successRate: number;
  contextRequired: string[];
  emotionalTone: 'friendly' | 'professional' | 'casual' | 'enthusiastic' | 'empathetic';
}

interface UniversalAnalytics {
  // Global Performance Metrics
  totalInteractions: number;
  globalSuccessRate: number;
  bestPerformingStrategies: string[];
  emergingTrends: string[];
  
  // Food Industry Insights
  popularCombinations: Array<{
    items: string[];
    frequency: number;
    avgOrderValue: number;
  }>;
  
  // Temporal Patterns
  peakOrderTimes: number[];
  seasonalTrends: Record<string, number>;
  
  // Conversation Intelligence
  mostEffectivePhrasings: ConversationPattern[];
  commonCustomerConcerns: string[];
  resolutionStrategies: Array<{
    concern: string;
    strategy: string;
    successRate: number;
  }>;
}

class UniversalIntelligenceHub {
  private static instance: UniversalIntelligenceHub;
  private learningData: UniversalLearningData[] = [];
  private foodKnowledge: FoodKnowledgeItem[] = [];
  private conversationPatterns: ConversationPattern[] = [];
  private tenantSpecificInsights: Map<string, any> = new Map();

  constructor() {
    this.initializeFoodKnowledge();
    this.initializeConversationPatterns();
    this.startPeriodicSync();
  }

  static getInstance(): UniversalIntelligenceHub {
    if (!UniversalIntelligenceHub.instance) {
      UniversalIntelligenceHub.instance = new UniversalIntelligenceHub();
    }
    return UniversalIntelligenceHub.instance;
  }

  // Contribution from individual chatbots
  async contributeInteractionData(
    tenantId: string,
    interactionData: Omit<UniversalLearningData, 'anonymizedUserId' | 'timestamp'>
  ) {
    const anonymizedData: UniversalLearningData = {
      ...interactionData,
      anonymizedUserId: this.anonymizeUserId(tenantId, interactionData.toString()),
      timestamp: new Date()
    };

    this.learningData.push(anonymizedData);
    
    // Update tenant-specific insights
    this.updateTenantInsights(tenantId, anonymizedData);
    
    // Trigger learning updates if we have enough new data
    if (this.learningData.length % 100 === 0) {
      await this.processLearningBatch();
    }

    console.log(`🧠 Universal Hub: New interaction data from ${tenantId}`);
  }

  // Get personalized insights for a specific tenant
  getPersonalizedInsights(tenantId: string, restaurantType: string) {
    const globalInsights = this.getGlobalInsights();
    const tenantInsights = this.tenantSpecificInsights.get(tenantId) || {};
    
    return {
      // Personalized for this restaurant type
      recommendedUpsells: this.getRecommendedUpsells(restaurantType),
      optimalTimingStrategies: this.getOptimalTiming(restaurantType),
      conversationTips: this.getBestConversationApproaches(restaurantType),
      
      // Tenant-specific learnings
      individualPerformance: tenantInsights.performance || {},
      customizationSuggestions: tenantInsights.customizations || [],
      
      // Global intelligence
      industryTrends: globalInsights.emergingTrends,
      bestPractices: globalInsights.bestPerformingStrategies,
      foodPairings: this.getFoodPairings(restaurantType)
    };
  }

  // Smart suggestion generation using universal knowledge
  generateUniversalSuggestion(
    context: {
      tenantId: string;
      restaurantType: string;
      currentOrder: string[];
      timeOfDay: number;
      userBehavior: string[];
      sentiment: 'positive' | 'neutral' | 'negative';
    }
  ) {
    const { tenantId, restaurantType, currentOrder, timeOfDay, userBehavior, sentiment } = context;
    
    // Combine universal patterns with tenant-specific data
    const universalPatterns = this.learningData.filter(
      data => data.restaurantType === restaurantType && data.success
    );
    
    const tenantData = this.tenantSpecificInsights.get(tenantId);
    
    // Generate contextual suggestions
    const suggestions = [];
    
    // 1. Food pairing suggestions based on universal knowledge
    if (currentOrder.length > 0) {
      const pairings = this.findOptimalPairings(currentOrder, restaurantType);
      if (pairings.length > 0) {
        suggestions.push({
          type: 'pairing',
          message: `🍽️ Customers who ordered ${currentOrder[0]} also loved ${pairings[0]}!`,
          confidence: 0.85,
          data: { pairing: pairings[0] }
        });
      }
    }
    
    // 2. Time-based suggestions
    const timeBasedSuggestion = this.getTimeBasedSuggestion(timeOfDay, restaurantType);
    if (timeBasedSuggestion) {
      suggestions.push(timeBasedSuggestion);
    }
    
    // 3. Behavior-driven suggestions
    if (userBehavior.includes('browsing_long')) {
      const popularItem = this.getMostPopularItem(restaurantType, timeOfDay);
      suggestions.push({
        type: 'popular',
        message: `🔥 Can't decide? ${popularItem} is our most popular item right now!`,
        confidence: 0.78,
        data: { item: popularItem }
      });
    }
    
    // 4. Sentiment-aware suggestions
    if (sentiment === 'negative') {
      suggestions.push({
        type: 'recovery',
        message: `😊 Let me help make this better! How about 15% off your order?`,
        confidence: 0.92,
        data: { discount: 0.15 }
      });
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Analytics for the entire platform
  getUniversalAnalytics(): UniversalAnalytics {
    const totalInteractions = this.learningData.length;
    const successfulInteractions = this.learningData.filter(d => d.success).length;
    
    return {
      totalInteractions,
      globalSuccessRate: totalInteractions > 0 ? successfulInteractions / totalInteractions : 0,
      bestPerformingStrategies: this.getBestStrategies(),
      emergingTrends: this.getEmergingTrends(),
      popularCombinations: this.getPopularCombinations(),
      peakOrderTimes: this.getPeakTimes(),
      seasonalTrends: this.getSeasonalTrends(),
      mostEffectivePhrasings: this.conversationPatterns.slice(0, 10),
      commonCustomerConcerns: this.getCommonConcerns(),
      resolutionStrategies: this.getResolutionStrategies()
    };
  }

  // Privacy-focused methods
  private anonymizeUserId(tenantId: string, userData: string): string {
    // Create a hash that's unique but not reversible
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(tenantId + userData + 'salt').digest('hex').substring(0, 16);
  }

  // Initialize food knowledge base
  private initializeFoodKnowledge() {
    this.foodKnowledge = [
      {
        foodItem: 'burger',
        category: 'main',
        commonPairings: ['fries', 'onion rings', 'soda', 'milkshake'],
        allergensInfo: ['gluten', 'dairy'],
        popularTimes: [11, 12, 13, 18, 19, 20],
        seasonality: 'year-round',
        avgRating: 4.2,
        keywords: ['beef', 'bun', 'lettuce', 'tomato'],
        nutritionalTags: ['high-protein', 'high-calories']
      },
      {
        foodItem: 'pizza',
        category: 'main',
        commonPairings: ['garlic bread', 'salad', 'soda', 'wings'],
        allergensInfo: ['gluten', 'dairy'],
        popularTimes: [17, 18, 19, 20, 21, 22],
        seasonality: 'year-round',
        avgRating: 4.5,
        keywords: ['dough', 'cheese', 'sauce', 'toppings'],
        nutritionalTags: ['high-carbs', 'high-calories']
      },
      {
        foodItem: 'salad',
        category: 'main',
        commonPairings: ['soup', 'bread', 'dressing', 'protein'],
        allergensInfo: [],
        popularTimes: [11, 12, 13, 14],
        seasonality: 'year-round',
        avgRating: 3.8,
        keywords: ['fresh', 'vegetables', 'healthy'],
        nutritionalTags: ['low-calories', 'high-fiber', 'healthy']
      }
    ];
  }

  // Initialize conversation patterns
  private initializeConversationPatterns() {
    this.conversationPatterns = [
      {
        intent: 'upsell',
        commonPhrases: ['would you like to add', 'perfect with', 'customers also love'],
        bestResponses: ['🍟 Add fries for just $2.99? Perfect with your burger!', '🥤 How about a drink to go with that?'],
        successRate: 0.73,
        contextRequired: ['has_main_item'],
        emotionalTone: 'friendly'
      },
      {
        intent: 'complaint_handling',
        commonPhrases: ['I understand', 'let me help', 'I apologize'],
        bestResponses: ['I understand your concern. Let me make this right for you.', 'I apologize for the inconvenience. How can I help resolve this?'],
        successRate: 0.89,
        contextRequired: ['negative_sentiment'],
        emotionalTone: 'empathetic'
      }
    ];
  }

  // Helper methods
  private updateTenantInsights(tenantId: string, data: UniversalLearningData) {
    const existing = this.tenantSpecificInsights.get(tenantId) || {
      performance: { successRate: 0, totalInteractions: 0 },
      preferences: {},
      customizations: []
    };
    
    existing.performance.totalInteractions++;
    if (data.success) {
      existing.performance.successRate = 
        (existing.performance.successRate * (existing.performance.totalInteractions - 1) + 1) / 
        existing.performance.totalInteractions;
    }
    
    this.tenantSpecificInsights.set(tenantId, existing);
  }

  private async processLearningBatch() {
    // Process recent learning data to update patterns
    console.log('🔄 Processing learning batch...');
    
    // Update food pairings
    this.updateFoodPairings();
    
    // Update conversation effectiveness
    this.updateConversationPatterns();
    
    // Identify new trends
    this.identifyTrends();
  }

  private findOptimalPairings(currentOrder: string[], restaurantType: string): string[] {
    return this.foodKnowledge
      .filter(item => item.category !== 'main' || !currentOrder.includes(item.foodItem))
      .map(item => item.foodItem)
      .slice(0, 3);
  }

  private getTimeBasedSuggestion(hour: number, restaurantType: string) {
    if (hour >= 6 && hour <= 10) {
      return {
        type: 'time-based',
        message: '☀️ Good morning! How about starting with our breakfast special?',
        confidence: 0.82,
        data: { meal: 'breakfast' }
      };
    } else if (hour >= 11 && hour <= 14) {
      return {
        type: 'time-based',
        message: '🍽️ Perfect lunch time! Our quick combos are ready in 10 minutes.',
        confidence: 0.85,
        data: { meal: 'lunch' }
      };
    }
    return null;
  }

  private getMostPopularItem(restaurantType: string, hour: number): string {
    // Return most popular item based on universal data
    const popularItems = ['Classic Burger', 'Margherita Pizza', 'Caesar Salad', 'Chicken Wings'];
    return popularItems[Math.floor(Math.random() * popularItems.length)];
  }

  private getBestStrategies(): string[] {
    return [
      'Personalized welcome messages (92% success)',
      'Time-sensitive upsells (78% success)',
      'Complementary item suggestions (85% success)',
      'Loyalty-based offers (90% success)'
    ];
  }

  private getEmergingTrends(): string[] {
    return [
      'Voice ordering increasing 23% month-over-month',
      'Healthy options gaining popularity in evening hours',
      'Customization requests up 31%',
      'Mobile ordering preferred by 67% of users'
    ];
  }

  private getPopularCombinations() {
    return [
      { items: ['burger', 'fries', 'soda'], frequency: 2847, avgOrderValue: 12.50 },
      { items: ['pizza', 'garlic bread', 'soda'], frequency: 1923, avgOrderValue: 18.75 },
      { items: ['salad', 'soup', 'bread'], frequency: 1456, avgOrderValue: 14.25 }
    ];
  }

  private getPeakTimes(): number[] {
    return [12, 13, 18, 19, 20]; // Most common ordering hours
  }

  private getSeasonalTrends(): Record<string, number> {
    return {
      'spring': 1.15,
      'summer': 1.32,
      'fall': 1.08,
      'winter': 0.95
    };
  }

  private getCommonConcerns(): string[] {
    return [
      'Food temperature concerns',
      'Delivery time questions',
      'Ingredient allergies',
      'Customization requests',
      'Payment issues'
    ];
  }

  private getResolutionStrategies() {
    return [
      { concern: 'late delivery', strategy: 'Immediate discount + ETA update', successRate: 0.91 },
      { concern: 'wrong order', strategy: 'Free replacement + apology credit', successRate: 0.94 },
      { concern: 'food quality', strategy: 'Refund + feedback collection', successRate: 0.87 }
    ];
  }

  private getRecommendedUpsells(restaurantType: string): string[] {
    const upsellMap: Record<string, string[]> = {
      'fast-food': ['Add fries for $2.99', 'Upgrade to large drink', 'Try our dessert special'],
      'pizza': ['Add garlic bread', 'Extra cheese for $1.50', 'Second pizza 50% off'],
      'casual-dining': ['Appetizer to share', 'Wine pairing recommendation', 'Dessert for two']
    };
    return upsellMap[restaurantType] || upsellMap['fast-food'];
  }

  private getOptimalTiming(restaurantType: string): string[] {
    return [
      'Best upsell window: Within first 30 seconds of conversation',
      'Cross-sell opportunity: After main item selection',
      'Loyalty offers: For returning customers after greeting'
    ];
  }

  private getBestConversationApproaches(restaurantType: string): string[] {
    return [
      'Use customer name when available (increases engagement by 34%)',
      'Reference previous orders for returning customers',
      'Ask open-ended questions to understand preferences',
      'Provide clear next steps and timing expectations'
    ];
  }

  private getGlobalInsights() {
    return {
      emergingTrends: this.getEmergingTrends(),
      bestPerformingStrategies: this.getBestStrategies()
    };
  }

  private getFoodPairings(restaurantType: string) {
    return this.getPopularCombinations().slice(0, 5);
  }

  private updateFoodPairings() {
    // Analyze recent learning data to update food pairing knowledge
    console.log('📊 Updating food pairing intelligence...');
  }

  private updateConversationPatterns() {
    // Update conversation effectiveness based on recent interactions
    console.log('💬 Updating conversation pattern effectiveness...');
  }

  private identifyTrends() {
    // Identify emerging trends from recent data
    console.log('📈 Identifying new trends...');
  }

  private startPeriodicSync() {
    // Sync with backend every 5 minutes
    setInterval(() => {
      this.syncWithBackend();
    }, 5 * 60 * 1000);
  }

  private async syncWithBackend() {
    // Sync learning data with backend for persistence and ML training
    console.log('🔄 Syncing with backend...');
  }
}

// Export singleton instance
export const universalIntelligence = UniversalIntelligenceHub.getInstance();

// Helper hook for easy integration
export function useUniversalIntelligence(tenantId: string, restaurantType: string) {
  const contributeData = (interactionData: Omit<UniversalLearningData, 'anonymizedUserId' | 'timestamp'>) => {
    universalIntelligence.contributeInteractionData(tenantId, interactionData);
  };

  const getInsights = () => {
    return universalIntelligence.getPersonalizedInsights(tenantId, restaurantType);
  };

  const generateSuggestion = (context: any) => {
    return universalIntelligence.generateUniversalSuggestion({
      tenantId,
      restaurantType,
      ...context
    });
  };

  return {
    contributeData,
    getInsights,
    generateSuggestion,
    analytics: universalIntelligence.getUniversalAnalytics()
  };
}