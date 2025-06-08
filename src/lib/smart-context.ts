// Smart Context Detection System for ChatChatGo
// Handles user recognition, behavioral tracking, and contextual suggestions

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  lastOrder?: Date;
  totalOrderAmount: number;
  orderHistory: Order[];
  preferences: UserPreferences;
  loyaltyLevel: 'new' | 'regular' | 'vip' | 'champion';
}

interface Order {
  id: string;
  date: Date;
  items: OrderItem[];
  total: number;
  restaurantId: string;
}

interface OrderItem {
  name: string;
  price: number;
  customizations: string[];
  category: string;
}

interface UserPreferences {
  dietaryRestrictions: string[];
  favoriteItems: string[];
  dislikedIngredients: string[];
  spiceLevel: 'mild' | 'medium' | 'hot' | 'extreme';
  avgOrderValue: number;
  preferredOrderTime: string;
}

interface BehaviorData {
  pageViews: PageView[];
  timeSpent: number;
  scrollDepth: number;
  itemsViewedToday: string[];
  cartAbandonment: boolean;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  location?: string;
}

interface PageView {
  page: string;
  timestamp: Date;
  duration: number;
  interactions: string[];
}

interface SmartSuggestion {
  id: string;
  type: 'upsell' | 'cross-sell' | 'loyalty' | 'personalized' | 'behavioral' | 'themed';
  message: string;
  action: string;
  confidence: number;
  reasoning: string;
  data?: any;
}

interface ContextTrigger {
  id: string;
  condition: (userData: UserProfile, behavior: BehaviorData) => boolean;
  suggestion: (userData: UserProfile, behavior: BehaviorData) => SmartSuggestion;
  priority: number;
}

class SmartContextEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private behaviorData: Map<string, BehaviorData> = new Map();
  private contextTriggers: ContextTrigger[] = [];
  private restaurantThemes: Map<string, RestaurantTheme> = new Map();

  constructor() {
    this.initializeContextTriggers();
    this.initializeRestaurantThemes();
  }

  // User Recognition & Profile Management
  async recognizeUser(identifier: string): Promise<UserProfile | null> {
    // First check local cache
    if (this.userProfiles.has(identifier)) {
      return this.userProfiles.get(identifier)!;
    }

    // Simulate database lookup
    try {
      const userProfile = await this.fetchUserProfile(identifier);
      if (userProfile) {
        this.userProfiles.set(identifier, userProfile);
        return userProfile;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }

    return null;
  }

  async createGuestProfile(behaviorData: BehaviorData): Promise<UserProfile> {
    const guestProfile: UserProfile = {
      id: `guest_${Date.now()}`,
      totalOrderAmount: 0,
      orderHistory: [],
      preferences: {
        dietaryRestrictions: [],
        favoriteItems: [],
        dislikedIngredients: [],
        spiceLevel: 'medium',
        avgOrderValue: 0,
        preferredOrderTime: 'evening'
      },
      loyaltyLevel: 'new'
    };

    this.userProfiles.set(guestProfile.id, guestProfile);
    return guestProfile;
  }

  // Behavioral Tracking
  trackBehavior(userId: string, action: string, data: any) {
    const currentBehavior = this.behaviorData.get(userId) || this.createEmptyBehaviorData();
    
    switch (action) {
      case 'page_view':
        currentBehavior.pageViews.push({
          page: data.page,
          timestamp: new Date(),
          duration: data.duration || 0,
          interactions: []
        });
        break;
        
      case 'item_view':
        if (!currentBehavior.itemsViewedToday.includes(data.itemName)) {
          currentBehavior.itemsViewedToday.push(data.itemName);
        }
        break;
        
      case 'time_spent':
        currentBehavior.timeSpent += data.duration;
        break;
        
      case 'scroll':
        currentBehavior.scrollDepth = Math.max(currentBehavior.scrollDepth, data.depth);
        break;
        
      case 'cart_abandon':
        currentBehavior.cartAbandonment = true;
        break;
    }

    this.behaviorData.set(userId, currentBehavior);
  }

  // Smart Suggestion Generation
  async generateSmartSuggestions(userId: string, context: any): Promise<SmartSuggestion[]> {
    const userProfile = await this.recognizeUser(userId) || await this.createGuestProfile(this.behaviorData.get(userId) || this.createEmptyBehaviorData());
    const behavior = this.behaviorData.get(userId) || this.createEmptyBehaviorData();

    const suggestions: SmartSuggestion[] = [];

    // Run through all context triggers
    for (const trigger of this.contextTriggers) {
      if (trigger.condition(userProfile, behavior)) {
        const suggestion = trigger.suggestion(userProfile, behavior);
        suggestions.push(suggestion);
      }
    }

    // Sort by priority and confidence
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3); // Return top 3 suggestions
  }

  // Context Triggers Initialization
  private initializeContextTriggers() {
    // Welcome back trigger
    this.contextTriggers.push({
      id: 'welcome_back',
      priority: 10,
      condition: (user, behavior) => user.orderHistory.length > 0,
      suggestion: (user, behavior) => ({
        id: 'welcome_back',
        type: 'personalized',
        message: `Welcome back, ${user.name || 'friend'}! Your usual ${user.preferences.favoriteItems[0] || 'order'}?`,
        action: 'add_to_cart',
        confidence: 0.9,
        reasoning: 'Returning customer with order history',
        data: { item: user.preferences.favoriteItems[0] }
      })
    });

    // Cart upsell trigger
    this.contextTriggers.push({
      id: 'cart_upsell',
      priority: 8,
      condition: (user, behavior) => behavior.itemsViewedToday.some(item => item.includes('burger')) && !behavior.itemsViewedToday.some(item => item.includes('fries')),
      suggestion: (user, behavior) => ({
        id: 'cart_upsell',
        type: 'upsell',
        message: `🍟 Add fries for just $2.99? Perfect with your burger!`,
        action: 'add_fries',
        confidence: 0.8,
        reasoning: 'User viewing burgers but no sides',
        data: { item: 'fries', price: 2.99 }
      })
    });

    // Time-based lunch trigger
    this.contextTriggers.push({
      id: 'lunch_time',
      priority: 6,
      condition: (user, behavior) => {
        const hour = new Date().getHours();
        return hour >= 11 && hour <= 14;
      },
      suggestion: (user, behavior) => ({
        id: 'lunch_time',
        type: 'behavioral',
        message: `⏰ Quick 15-min lunch combo? Perfect for your busy day!`,
        action: 'show_lunch_combos',
        confidence: 0.7,
        reasoning: 'Lunch time detected',
        data: { combos: ['quick_burger_combo', 'salad_wrap_combo'] }
      })
    });

    // High spender VIP trigger
    this.contextTriggers.push({
      id: 'vip_treatment',
      priority: 9,
      condition: (user, behavior) => user.totalOrderAmount > 500,
      suggestion: (user, behavior) => ({
        id: 'vip_treatment',
        type: 'loyalty',
        message: `🌟 VIP exclusive: Try our chef's special with complimentary dessert!`,
        action: 'show_vip_menu',
        confidence: 0.85,
        reasoning: 'High-value customer detected',
        data: { specialOffer: 'chef_special_with_dessert' }
      })
    });

    // Samuel L. Jackson themed trigger for Royale with Cheese
    this.contextTriggers.push({
      id: 'pulp_fiction_theme',
      priority: 7,
      condition: (user, behavior) => {
        const hasRoyaleItem = behavior.itemsViewedToday.some(item => item.toLowerCase().includes('royale'));
        const isRoyaleRestaurant = true; // This would check restaurant ID
        return hasRoyaleItem || isRoyaleRestaurant;
      },
      suggestion: (user, behavior) => ({
        id: 'pulp_fiction_theme',
        type: 'themed',
        message: `🎬 "What do they call a Quarter Pounder with Cheese in Paris?" - Try our Royale with Cheese!`,
        action: 'samuel_jackson_order',
        confidence: 0.75,
        reasoning: 'Pulp Fiction themed restaurant interaction',
        data: { 
          voiceActor: 'samuel_l_jackson',
          specialItem: 'royale_with_cheese',
          movieQuote: true
        }
      })
    });

    // Dietary preference trigger
    this.contextTriggers.push({
      id: 'dietary_preference',
      priority: 7,
      condition: (user, behavior) => user.preferences.dietaryRestrictions.length > 0,
      suggestion: (user, behavior) => ({
        id: 'dietary_preference',
        type: 'personalized',
        message: `🥗 We remember you're ${user.preferences.dietaryRestrictions[0]} - check out our special menu!`,
        action: 'show_dietary_menu',
        confidence: 0.8,
        reasoning: 'User has dietary restrictions',
        data: { restrictions: user.preferences.dietaryRestrictions }
      })
    });

    // Cart abandonment recovery
    this.contextTriggers.push({
      id: 'cart_recovery',
      priority: 9,
      condition: (user, behavior) => behavior.cartAbandonment,
      suggestion: (user, behavior) => ({
        id: 'cart_recovery',
        type: 'behavioral',
        message: `💭 Still thinking? How about 10% off your order to help you decide?`,
        action: 'apply_discount',
        confidence: 0.85,
        reasoning: 'Cart abandonment detected',
        data: { discount: 0.1, code: 'THINK10' }
      })
    });

    // New customer onboarding
    this.contextTriggers.push({
      id: 'new_customer',
      priority: 5,
      condition: (user, behavior) => user.orderHistory.length === 0 && behavior.timeSpent > 30000, // 30 seconds
      suggestion: (user, behavior) => ({
        id: 'new_customer',
        type: 'personalized',
        message: `👋 First time here? Let us help you find the perfect meal! What are you in the mood for?`,
        action: 'start_food_quiz',
        confidence: 0.7,
        reasoning: 'New customer spending time browsing',
        data: { quiz: 'food_preference_quiz' }
      })
    });
  }

  // Restaurant Theme Configurations
  private initializeRestaurantThemes() {
    this.restaurantThemes.set('royale-with-cheese', {
      id: 'royale-with-cheese',
      name: 'Royale with Cheese',
      theme: 'pulp_fiction',
      specialTriggers: ['pulp_fiction_theme'],
      voiceActors: ['samuel_l_jackson', 'john_travolta'],
      brandColor: '#8B0000',
      catchphrases: [
        "What do they call a Quarter Pounder with Cheese in Paris?",
        "That's a pretty good milkshake, I don't know if it's worth five dollars",
        "Royale with Cheese... that's what they call it"
      ]
    });

    this.restaurantThemes.set('marios-pizza', {
      id: 'marios-pizza',
      name: "Mario's Pizza",
      theme: 'italian_family',
      specialTriggers: ['family_recipe_theme'],
      voiceActors: ['italian_chef'],
      brandColor: '#228B22',
      catchphrases: [
        "Mama mia! That's a spicy meatball!",
        "Made with love from our family to yours",
        "Just like Nonna used to make"
      ]
    });
  }

  // Utility Methods
  private createEmptyBehaviorData(): BehaviorData {
    return {
      pageViews: [],
      timeSpent: 0,
      scrollDepth: 0,
      itemsViewedToday: [],
      cartAbandonment: false,
      deviceType: 'mobile'
    };
  }

  private async fetchUserProfile(identifier: string): Promise<UserProfile | null> {
    // This would integrate with your existing user database
    // For now, simulate with some mock data
    const mockProfiles: Record<string, UserProfile> = {
      'sarah@example.com': {
        id: 'sarah_123',
        name: 'Sarah',
        email: 'sarah@example.com',
        phone: '555-0123',
        lastOrder: new Date('2025-01-05'),
        totalOrderAmount: 247.50,
        orderHistory: [
          {
            id: 'order_1',
            date: new Date('2025-01-05'),
            items: [
              { name: 'Chicken Sandwich', price: 12.99, customizations: ['no onions'], category: 'sandwich' },
              { name: 'Diet Coke', price: 2.50, customizations: [], category: 'drink' }
            ],
            total: 15.49,
            restaurantId: 'royale-with-cheese'
          }
        ],
        preferences: {
          dietaryRestrictions: [],
          favoriteItems: ['Chicken Sandwich'],
          dislikedIngredients: ['onions'],
          spiceLevel: 'mild',
          avgOrderValue: 15.49,
          preferredOrderTime: 'lunch'
        },
        loyaltyLevel: 'regular'
      }
    };

    return mockProfiles[identifier] || null;
  }

  // Analytics & Training Data Collection
  collectTrainingData(suggestion: SmartSuggestion, userAction: 'clicked' | 'ignored' | 'dismissed', tenantId?: string, restaurantType?: string) {
    const trainingPoint = {
      suggestionId: suggestion.id,
      suggestionType: suggestion.type,
      confidence: suggestion.confidence,
      userAction,
      timestamp: new Date(),
      reasoning: suggestion.reasoning
    };

    // This would be sent to your ML training pipeline
    console.log('Training data collected:', trainingPoint);
    
    // Store for batch processing
    this.storeTrainingData(trainingPoint);

    // Contribute to Universal Intelligence Hub
    if (tenantId && restaurantType) {
      import('./universal-intelligence').then(({ universalIntelligence }) => {
        universalIntelligence.contributeInteractionData(tenantId, {
          interactionType: this.mapSuggestionTypeToInteraction(suggestion.type),
          contextTriggers: [suggestion.reasoning],
          userSentiment: 'neutral', // Could be determined from context
          timeOfDay: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          success: userAction === 'clicked',
          confidence: suggestion.confidence,
          restaurantType
        });
      });
    }
  }

  private storeTrainingData(data: any) {
    // Implementation would store to database/analytics service
    // For now, just log
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('smartbox_training_data') || '[]');
      stored.push(data);
      localStorage.setItem('smartbox_training_data', JSON.stringify(stored));
    }
  }

  private mapSuggestionTypeToInteraction(suggestionType: string): 'upsell' | 'cross-sell' | 'complaint' | 'compliment' | 'question' | 'order' {
    const mapping: Record<string, 'upsell' | 'cross-sell' | 'complaint' | 'compliment' | 'question' | 'order'> = {
      'upsell': 'upsell',
      'cross-sell': 'cross-sell',
      'loyalty': 'upsell',
      'personalized': 'order',
      'behavioral': 'question',
      'themed': 'upsell'
    };
    return mapping[suggestionType] || 'question';
  }
}

interface RestaurantTheme {
  id: string;
  name: string;
  theme: string;
  specialTriggers: string[];
  voiceActors: string[];
  brandColor: string;
  catchphrases: string[];
}

// Export singleton instance
export const smartContextEngine = new SmartContextEngine();
export type { UserProfile, BehaviorData, SmartSuggestion, ContextTrigger }; 