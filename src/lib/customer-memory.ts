import { CustomerProfile, LoyaltyProgram, PersonalizationEngine } from '@/types/tenant';

interface ConversationContext {
  sessionId: string;
  customerId: string;
  tenantId: string;
  startTime: Date;
  lastActivity: Date;
  
  // Current conversation state
  currentOrder?: {
    items: Array<{
      itemId: string;
      itemName: string;
      quantity: number;
      price: number;
      customizations: string[];
    }>;
    subtotal: number;
    estimatedTotal: number;
    specialInstructions?: string;
  };
  
  // Conversation flow
  conversationStage: 'greeting' | 'browsing' | 'ordering' | 'customizing' | 'checkout' | 'completed';
  lastIntent: string;
  pendingQuestions: string[];
  
  // Context for AI
  mentionedItems: string[];
  expressedPreferences: string[];
  currentMood: 'excited' | 'casual' | 'hurried' | 'undecided';
}

interface CustomerBehaviorPattern {
  customerId: string;
  
  // Ordering Patterns
  preferredOrderingTimes: number[]; // hours of day
  averageOrderValue: number;
  orderFrequency: number; // days between orders
  seasonalPreferences: Record<string, string[]>; // season -> preferred items
  
  // Communication Patterns
  preferredCommunicationStyle: 'formal' | 'friendly' | 'brief' | 'detailed';
  responseTimePattern: number; // average seconds to respond
  usesVoice: boolean;
  usesEmojis: boolean;
  
  // Decision Making
  decisionSpeed: 'quick' | 'moderate' | 'deliberate';
  pricesensitivity: 'high' | 'medium' | 'low';
  adventurousness: 'conservative' | 'moderate' | 'adventurous'; // tries new items
  
  // Upselling Response
  respondsToUpselling: boolean;
  successfulUpsellTypes: string[];
  upsellResistance: string[];
}

export class CustomerMemoryEngine {
  private customerProfiles = new Map<string, CustomerProfile>();
  private conversationContexts = new Map<string, ConversationContext>();
  private behaviorPatterns = new Map<string, CustomerBehaviorPattern>();
  
  // Initialize or load customer profile
  async getCustomerProfile(customerId: string, tenantId: string): Promise<CustomerProfile> {
    let profile = this.customerProfiles.get(customerId);
    
    if (!profile) {
      // Create new customer profile
      profile = {
        customerId,
        loyaltyPoints: 0,
        loyaltyTier: 'bronze',
        totalSpent: 0,
        visitCount: 0,
        dietaryRestrictions: [],
        preferredItems: [],
        dislikedItems: [],
        spicePreference: 'medium',
        orderHistory: [],
        conversationStyle: 'casual',
        preferredOrderingMethod: 'mixed',
        averageOrderValue: 0,
        orderFrequency: 0,
        lastOrderDate: new Date(),
        suggestedItems: []
      };
      
      this.customerProfiles.set(customerId, profile);
    }
    
    return profile;
  }
  
  // Start new conversation session
  async startConversationSession(customerId: string, tenantId: string, sessionId: string): Promise<ConversationContext> {
    const context: ConversationContext = {
      sessionId,
      customerId,
      tenantId,
      startTime: new Date(),
      lastActivity: new Date(),
      conversationStage: 'greeting',
      lastIntent: 'greeting',
      pendingQuestions: [],
      mentionedItems: [],
      expressedPreferences: [],
      currentMood: 'casual'
    };
    
    this.conversationContexts.set(sessionId, context);
    return context;
  }
  
  // Generate personalized greeting
  async generatePersonalizedGreeting(customerId: string, tenantId: string): Promise<string> {
    const profile = await this.getCustomerProfile(customerId, tenantId);
    const patterns = this.behaviorPatterns.get(customerId);
    
    // First-time customer
    if (profile.visitCount === 0) {
      return "👋 Welcome! I'm your AI ordering assistant. What sounds delicious today?";
    }
    
         // Returning customer with name
     if (profile.name) {
       const lastOrder = profile.orderHistory[profile.orderHistory.length - 1];
       if (lastOrder && this.isRecentOrder(lastOrder.timestamp)) {
         // Get item name from order history - we'll need to fetch this from menu data
         const firstItemId = lastOrder.items[0]?.itemId;
         const popularItem = firstItemId ? 'your usual order' : 'something delicious';
         return `Hi ${profile.name}! 😊 Would you like ${popularItem}, or shall we try something new today?`;
       }
      
      return `Welcome back, ${profile.name}! 🌟 What can I get started for you?`;
    }
    
    // Returning customer without name but with history
    if (profile.orderHistory.length > 0) {
      const loyaltyMessage = this.getLoyaltyGreeting(profile);
      return `Welcome back! ${loyaltyMessage} What sounds good today?`;
    }
    
    return "Welcome back! Ready to order something delicious? 🍕";
  }
  
  // Track customer behavior during conversation
  async trackBehavior(sessionId: string, behavior: {
    type: 'item_mention' | 'preference_expressed' | 'mood_indicator' | 'decision_made' | 'hesitation';
    data: any;
  }) {
    const context = this.conversationContexts.get(sessionId);
    if (!context) return;
    
    context.lastActivity = new Date();
    
    switch (behavior.type) {
      case 'item_mention':
        if (!context.mentionedItems.includes(behavior.data.itemName)) {
          context.mentionedItems.push(behavior.data.itemName);
        }
        break;
        
      case 'preference_expressed':
        context.expressedPreferences.push(behavior.data.preference);
        await this.updateCustomerPreferences(context.customerId, behavior.data.preference);
        break;
        
      case 'mood_indicator':
        context.currentMood = behavior.data.mood;
        break;
        
      case 'decision_made':
        context.conversationStage = 'ordering';
        break;
        
      case 'hesitation':
        // Customer seems undecided, prepare helpful suggestions
        await this.prepareHelpfulSuggestions(context);
        break;
    }
    
    this.conversationContexts.set(sessionId, context);
  }
  
  // Smart upselling recommendations
  async generateUpsellSuggestions(sessionId: string, currentOrder: any): Promise<Array<{
    itemId: string;
    itemName: string;
    reason: string;
    confidence: number;
    suggestedPrice: number;
    conversionProbability: number;
  }>> {
    const context = this.conversationContexts.get(sessionId);
    if (!context) return [];
    
    const profile = await this.getCustomerProfile(context.customerId, context.tenantId);
    const patterns = this.behaviorPatterns.get(context.customerId);
    
    const suggestions = [];
    
    // Analyze current order for complementary items
    for (const item of currentOrder.items) {
      const complementaryItems = await this.getComplementaryItems(item.itemId, profile);
      
      for (const compItem of complementaryItems) {
        const confidence = this.calculateUpsellConfidence(profile, patterns, compItem);
        
        if (confidence > 0.3) { // Only suggest if >30% confidence
          suggestions.push({
            itemId: compItem.id,
            itemName: compItem.name,
            reason: this.generateUpsellReason(item.itemName, compItem.name, profile),
            confidence,
            suggestedPrice: compItem.price,
            conversionProbability: confidence * 0.8 // Slightly lower than confidence
          });
        }
      }
    }
    
    // Sort by confidence and return top 3
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }
  
  // Generate smart bundle recommendations
  async generateBundleRecommendations(customerId: string, currentOrder: any): Promise<Array<{
    bundleName: string;
    items: string[];
    originalPrice: number;
    bundlePrice: number;
    savings: number;
    reason: string;
  }>> {
    const profile = await this.getCustomerProfile(customerId, '');
    
    // Example intelligent bundle logic
    const bundles = [];
    
    // If ordering pizza, suggest "Perfect Meal Deal"
    const hasPizza = currentOrder.items.some((item: any) => 
      item.itemName.toLowerCase().includes('pizza')
    );
    
    if (hasPizza && !currentOrder.items.some((item: any) => 
      item.itemName.toLowerCase().includes('drink')
    )) {
      bundles.push({
        bundleName: "Perfect Meal Deal",
        items: ["2L Soda", "Garlic Bread"],
        originalPrice: 8.98,
        bundlePrice: 6.99,
        savings: 1.99,
        reason: "Complete your pizza with our most popular sides - save $2!"
      });
    }
    
    return bundles;
  }
  
  // Record completed order for learning
  async recordOrder(customerId: string, orderData: {
    orderId: string;
    items: Array<{
      itemId: string;
      itemName: string;
      quantity: number;
      price: number;
      customizations: string[];
    }>;
    total: number;
    timestamp: Date;
    upsellsAccepted: string[];
    upsellsRejected: string[];
  }) {
    const profile = await this.getCustomerProfile(customerId, '');
    
    // Add to order history
    profile.orderHistory.push({
      orderId: orderData.orderId,
      items: orderData.items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        customizations: item.customizations
      })),
      total: orderData.total,
      timestamp: orderData.timestamp
    });
    
    // Update profile statistics
    profile.totalSpent += orderData.total;
    profile.visitCount += 1;
    profile.averageOrderValue = profile.totalSpent / profile.visitCount;
    profile.lastOrderDate = orderData.timestamp;
    
    // Update preferred items based on frequency
    for (const item of orderData.items) {
      const existingIndex = profile.preferredItems.findIndex(id => id === item.itemId);
      if (existingIndex === -1 && this.calculateItemFrequency(profile, item.itemId) >= 2) {
        profile.preferredItems.push(item.itemId);
      }
    }
    
    // Update loyalty tier
    profile.loyaltyTier = this.calculateLoyaltyTier(profile.totalSpent);
    
    // Learn from upselling success/failure
    await this.updateUpsellLearning(customerId, orderData.upsellsAccepted, orderData.upsellsRejected);
    
    this.customerProfiles.set(customerId, profile);
  }
  
  // Helper methods
  private isRecentOrder(timestamp: Date): boolean {
    const daysSince = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7; // Consider recent if within a week
  }
  
  private getLoyaltyGreeting(profile: CustomerProfile): string {
    if (profile.loyaltyTier === 'platinum') {
      return "🌟 Our platinum member is here!";
    }
    if (profile.loyaltyTier === 'gold') {
      return "✨ Welcome back, gold member!";
    }
    if (profile.loyaltyPoints > 0) {
      return `💎 You have ${profile.loyaltyPoints} points!`;
    }
    return "😊";
  }
  
  private async updateCustomerPreferences(customerId: string, preference: string) {
    // Update customer preferences based on expressed preferences
    // This would normally integrate with your database
  }
  
  private async prepareHelpfulSuggestions(context: ConversationContext) {
    // Prepare suggestions for indecisive customers
    context.pendingQuestions.push("Would you like me to recommend our most popular items?");
  }
  
  private async getComplementaryItems(itemId: string, profile: CustomerProfile) {
    // Mock complementary items logic
    // In production, this would use ML to find actual complementary items
    const complementaryMap: Record<string, any[]> = {
      'pizza': [
        { id: 'garlic-bread', name: 'Garlic Bread', price: 4.99 },
        { id: 'soda', name: '2L Soda', price: 3.99 }
      ],
      'burger': [
        { id: 'fries', name: 'French Fries', price: 2.99 },
        { id: 'onion-rings', name: 'Onion Rings', price: 3.49 }
      ]
    };
    
    return complementaryMap[itemId] || [];
  }
  
  private calculateUpsellConfidence(
    profile: CustomerProfile, 
    patterns: CustomerBehaviorPattern | undefined, 
    item: any
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Adjust based on price sensitivity
    if (patterns?.pricesensitivity === 'low') confidence += 0.2;
    if (patterns?.pricesensitivity === 'high') confidence -= 0.2;
    
    // Adjust based on adventurousness
    if (patterns?.adventurousness === 'adventurous') confidence += 0.1;
    if (patterns?.adventurousness === 'conservative') confidence -= 0.1;
    
    // Adjust based on previous upsell success
    if (patterns?.respondsToUpselling) confidence += 0.2;
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  private generateUpsellReason(mainItem: string, upsellItem: string, profile: CustomerProfile): string {
    const reasons = [
      `${upsellItem} pairs perfectly with ${mainItem}!`,
      `Since you're getting ${mainItem}, add ${upsellItem} for the complete experience`,
      `Our customers love ${upsellItem} with their ${mainItem}`,
      `${upsellItem} is our chef's recommended pairing with ${mainItem}`
    ];
    
    return reasons[Math.floor(Math.random() * reasons.length)];
  }
  
  private calculateItemFrequency(profile: CustomerProfile, itemId: string): number {
    return profile.orderHistory.reduce((count, order) => {
      return count + order.items.filter(item => item.itemId === itemId).length;
    }, 0);
  }
  
  private calculateLoyaltyTier(totalSpent: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (totalSpent >= 500) return 'platinum';
    if (totalSpent >= 250) return 'gold';
    if (totalSpent >= 100) return 'silver';
    return 'bronze';
  }
  
  private async updateUpsellLearning(customerId: string, accepted: string[], rejected: string[]) {
    let patterns = this.behaviorPatterns.get(customerId);
    if (!patterns) {
      patterns = {
        customerId,
        preferredOrderingTimes: [],
        averageOrderValue: 0,
        orderFrequency: 0,
        seasonalPreferences: {},
        preferredCommunicationStyle: 'friendly',
        responseTimePattern: 0,
        usesVoice: false,
        usesEmojis: false,
        decisionSpeed: 'moderate',
        pricesensitivity: 'medium',
        adventurousness: 'moderate',
        respondsToUpselling: false,
        successfulUpsellTypes: [],
        upsellResistance: []
      };
    }
    
    patterns.respondsToUpselling = accepted.length > 0;
    patterns.successfulUpsellTypes.push(...accepted);
    patterns.upsellResistance.push(...rejected);
    
    this.behaviorPatterns.set(customerId, patterns);
  }
}

// Singleton instance
export const customerMemory = new CustomerMemoryEngine(); 