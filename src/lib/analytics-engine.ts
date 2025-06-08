import { TenantAnalytics } from '@/types/tenant';
import { customerMemory } from './customer-memory';

export interface RealTimeMetrics {
  // Live Performance
  activeConversations: number;
  avgResponseTime: number;
  currentConversionRate: number;
  hourlyOrderValue: number;
  
  // Peak Time Analysis
  currentPeakStatus: 'low' | 'moderate' | 'peak' | 'overflow';
  peakTimeRemaining: number; // minutes
  expectedOrdersNextHour: number;
  
  // Voice vs Text Insights
  voiceUsageRate: number;
  voiceOrderCompletionRate: number;
  textOrderCompletionRate: number;
  
  // Customer Satisfaction Indicators
  avgConversationLength: number;
  customerRetryRate: number;
  upsellSuccessRate: number;
}

export interface ConversionFunnelData {
  stage: string;
  count: number;
  conversionRate: number;
  dropOffReasons: string[];
  averageTimeSpent: number;
}

export interface PopularItemInsight {
  itemId: string;
  itemName: string;
  ordersToday: number;
  ordersThisWeek: number;
  revenueToday: number;
  revenueThisWeek: number;
  popularityTrend: 'rising' | 'stable' | 'declining';
  averageRating: number;
  complementaryItems: string[];
  peakOrderTimes: number[];
}

export interface CustomerBehaviorInsight {
  segment: 'new_customers' | 'regular_customers' | 'vip_customers' | 'at_risk_customers';
  count: number;
  averageOrderValue: number;
  conversionRate: number;
  preferredCommunicationStyle: string;
  commonRequests: string[];
  retentionRate: number;
}

export interface PredictiveAlert {
  id: string;
  type: 'inventory_low' | 'demand_surge' | 'customer_churn' | 'peak_approaching' | 'staff_needed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timeframe: string;
  confidence: number;
  actionable: boolean;
  suggestedActions: string[];
  affectedItems?: string[];
  estimatedImpact: string;
}

export class AnalyticsEngine {
  private tenantMetrics = new Map<string, any>();
  private realTimeData = new Map<string, RealTimeMetrics>();
  private predictiveAlerts = new Map<string, PredictiveAlert[]>();
  
  // Real-time metrics collection
  async trackConversationEvent(tenantId: string, event: {
    type: 'conversation_start' | 'message_sent' | 'order_completed' | 'conversation_abandoned';
    customerId: string;
    sessionId: string;
    data: any;
    timestamp: Date;
  }) {
    // Update real-time metrics
    await this.updateRealTimeMetrics(tenantId, event);
    
    // Feed data to predictive models
    await this.updatePredictiveModels(tenantId, event);
    
    // Check for alert conditions
    await this.checkAlertConditions(tenantId);
  }
  
  // Generate real-time analytics dashboard data
  async getRealTimeAnalytics(tenantId: string): Promise<{
    metrics: RealTimeMetrics;
    conversionFunnel: ConversionFunnelData[];
    popularItems: PopularItemInsight[];
    customerSegments: CustomerBehaviorInsight[];
    alerts: PredictiveAlert[];
    performanceComparison: {
      todayVsYesterday: number;
      thisWeekVsLastWeek: number;
      monthOverMonth: number;
    };
  }> {
    const metrics = await this.calculateRealTimeMetrics(tenantId);
    const conversionFunnel = await this.generateConversionFunnel(tenantId);
    const popularItems = await this.getPopularItemsInsights(tenantId);
    const customerSegments = await this.analyzeCustomerSegments(tenantId);
    const alerts = this.predictiveAlerts.get(tenantId) || [];
    const performanceComparison = await this.calculatePerformanceComparison(tenantId);
    
    return {
      metrics,
      conversionFunnel,
      popularItems,
      customerSegments,
      alerts,
      performanceComparison
    };
  }
  
  // Predictive Order Intelligence
  async generateInventoryPredictions(tenantId: string): Promise<Array<{
    itemId: string;
    itemName: string;
    currentStock: number;
    predictedDemand: {
      nextHour: number;
      next4Hours: number;
      today: number;
      tomorrow: number;
    };
    stockoutRisk: 'low' | 'medium' | 'high' | 'critical';
    recommendedAction: string;
    confidence: number;
  }>> {
    // Mock implementation - in production, this would use ML models
    const predictions = [
      {
        itemId: 'chicken-wings',
        itemName: 'Chicken Wings',
        currentStock: 45,
        predictedDemand: {
          nextHour: 12,
          next4Hours: 38,
          today: 85,
          tomorrow: 72
        },
        stockoutRisk: 'high' as const,
        recommendedAction: 'Reorder immediately - high demand expected during game time',
        confidence: 0.87
      },
      {
        itemId: 'pizza-dough',
        itemName: 'Pizza Dough',
        currentStock: 120,
        predictedDemand: {
          nextHour: 8,
          next4Hours: 25,
          today: 55,
          tomorrow: 48
        },
        stockoutRisk: 'low' as const,
        recommendedAction: 'Stock levels adequate for weekend',
        confidence: 0.92
      }
    ];
    
    return predictions;
  }
  
  // Weather-based demand predictions
  async generateWeatherBasedPredictions(tenantId: string, weatherData: {
    current: { temperature: number; condition: string; humidity: number };
    forecast: Array<{ hour: number; temperature: number; condition: string }>;
  }): Promise<Array<{
    category: string;
    demandChange: number; // percentage change
    reason: string;
    affectedItems: string[];
    confidence: number;
  }>> {
    const predictions = [];
    
    // Hot weather predictions
    if (weatherData.current.temperature > 80) {
      predictions.push({
        category: 'Cold Beverages',
        demandChange: 45,
        reason: 'Temperature above 80°F increases cold drink demand',
        affectedItems: ['ice-cream', 'cold-drinks', 'smoothies', 'salads'],
        confidence: 0.83
      });
      
      predictions.push({
        category: 'Hot Foods',
        demandChange: -25,
        reason: 'Hot weather reduces demand for warm, heavy meals',
        affectedItems: ['soup', 'hot-sandwiches', 'coffee'],
        confidence: 0.79
      });
    }
    
    // Rainy weather predictions
    if (weatherData.current.condition.includes('rain')) {
      predictions.push({
        category: 'Comfort Foods',
        demandChange: 35,
        reason: 'Rainy weather increases comfort food cravings',
        affectedItems: ['soup', 'pasta', 'hot-chocolate', 'pizza'],
        confidence: 0.88
      });
      
      predictions.push({
        category: 'Delivery Orders',
        demandChange: 60,
        reason: 'Rain significantly increases delivery order volume',
        affectedItems: ['all-items'],
        confidence: 0.91
      });
    }
    
    return predictions;
  }
  
  // Peak time management insights
  async generatePeakTimeInsights(tenantId: string): Promise<{
    currentStatus: 'normal' | 'building' | 'peak' | 'declining';
    peakPrediction: {
      startTime: Date;
      endTime: Date;
      expectedVolume: number;
      confidence: number;
    };
    staffingRecommendations: Array<{
      timeSlot: string;
      currentStaff: number;
      recommendedStaff: number;
      reason: string;
    }>;
    systemOptimizations: Array<{
      issue: string;
      impact: string;
      solution: string;
      priority: 'low' | 'medium' | 'high';
    }>;
  }> {
    // Calculate current hour and predict peak times
    const currentHour = new Date().getHours();
    
    return {
      currentStatus: this.determineCurrentPeakStatus(currentHour),
      peakPrediction: {
        startTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        endTime: new Date(Date.now() + 150 * 60 * 1000), // 2.5 hours from now
        expectedVolume: 180, // Expected order count
        confidence: 0.84
      },
      staffingRecommendations: [
        {
          timeSlot: '6:00 PM - 8:00 PM',
          currentStaff: 3,
          recommendedStaff: 5,
          reason: 'Dinner rush typically increases order volume by 200%'
        }
      ],
      systemOptimizations: [
        {
          issue: 'AI response time degrades during peak hours',
          impact: '12% increase in customer drop-off',
          solution: 'Pre-load AI responses for popular menu items',
          priority: 'high'
        }
      ]
    };
  }
  
  // Customer churn prediction
  async identifyChurnRisk(tenantId: string): Promise<Array<{
    customerId: string;
    riskLevel: 'low' | 'medium' | 'high';
    churnProbability: number;
    lastOrderDate: Date;
    reasonsForChurn: string[];
    retentionStrategies: string[];
    potentialLifetimeValueLoss: number;
  }>> {
    const customers = await this.getCustomerData(tenantId);
    const churnRiskAnalysis = [];
    
    for (const customer of customers) {
      const daysSinceLastOrder = this.calculateDaysSinceLastOrder(customer.lastOrderDate);
      const riskLevel = this.calculateChurnRisk(customer, daysSinceLastOrder);
      
      if (riskLevel !== 'low') {
        churnRiskAnalysis.push({
          customerId: customer.customerId,
          riskLevel,
          churnProbability: this.calculateChurnProbability(customer),
          lastOrderDate: customer.lastOrderDate,
          reasonsForChurn: this.identifyChurnReasons(customer),
          retentionStrategies: this.generateRetentionStrategies(customer),
          potentialLifetimeValueLoss: customer.averageOrderValue * 15 // Estimated 15 orders per year
        });
      }
    }
    
    return churnRiskAnalysis.sort((a, b) => b.churnProbability - a.churnProbability);
  }
  
  // Private helper methods
  private async updateRealTimeMetrics(tenantId: string, event: any) {
    let metrics = this.realTimeData.get(tenantId);
    if (!metrics) {
      metrics = {
        activeConversations: 0,
        avgResponseTime: 2.1,
        currentConversionRate: 0.67,
        hourlyOrderValue: 0,
        currentPeakStatus: 'moderate',
        peakTimeRemaining: 45,
        expectedOrdersNextHour: 23,
        voiceUsageRate: 0.34,
        voiceOrderCompletionRate: 0.78,
        textOrderCompletionRate: 0.82,
        avgConversationLength: 4.2,
        customerRetryRate: 0.12,
        upsellSuccessRate: 0.31
      };
    }
    
    // Update metrics based on event
    if (event.type === 'conversation_start') {
      metrics.activeConversations++;
    } else if (event.type === 'order_completed') {
      metrics.hourlyOrderValue += event.data.orderValue || 0;
      metrics.activeConversations = Math.max(0, metrics.activeConversations - 1);
    }
    
    this.realTimeData.set(tenantId, metrics);
  }
  
  private async updatePredictiveModels(tenantId: string, event: any) {
    // Feed event data to ML models for future predictions
    // This would integrate with your ML pipeline
  }
  
  private async checkAlertConditions(tenantId: string) {
    const alerts: PredictiveAlert[] = [];
    
    // Check for high demand periods
    const currentHour = new Date().getHours();
    if (currentHour >= 17 && currentHour <= 19) { // Dinner rush
      alerts.push({
        id: 'peak-approaching',
        type: 'peak_approaching',
        severity: 'medium',
        title: 'Dinner Rush Starting',
        message: 'Order volume expected to increase 200% in next 30 minutes',
        timeframe: 'Next 30 minutes',
        confidence: 0.87,
        actionable: true,
        suggestedActions: [
          'Pre-load popular menu items in AI responses',
          'Alert kitchen staff for increased prep',
          'Consider activating backup AI assistant'
        ],
        estimatedImpact: '+$850 revenue opportunity'
      });
    }
    
    this.predictiveAlerts.set(tenantId, alerts);
  }
  
  private async calculateRealTimeMetrics(tenantId: string): Promise<RealTimeMetrics> {
    return this.realTimeData.get(tenantId) || {
      activeConversations: 0,
      avgResponseTime: 2.1,
      currentConversionRate: 0.67,
      hourlyOrderValue: 0,
      currentPeakStatus: 'moderate',
      peakTimeRemaining: 45,
      expectedOrdersNextHour: 23,
      voiceUsageRate: 0.34,
      voiceOrderCompletionRate: 0.78,
      textOrderCompletionRate: 0.82,
      avgConversationLength: 4.2,
      customerRetryRate: 0.12,
      upsellSuccessRate: 0.31
    };
  }
  
  private async generateConversionFunnel(tenantId: string): Promise<ConversionFunnelData[]> {
    return [
      {
        stage: 'Greeting',
        count: 450,
        conversionRate: 1.0,
        dropOffReasons: [],
        averageTimeSpent: 15
      },
      {
        stage: 'Menu Browsing',
        count: 380,
        conversionRate: 0.84,
        dropOffReasons: ['Menu confusion', 'Price concerns'],
        averageTimeSpent: 120
      },
      {
        stage: 'Item Selection',
        count: 320,
        conversionRate: 0.84,
        dropOffReasons: ['Indecision', 'Item unavailable'],
        averageTimeSpent: 90
      },
      {
        stage: 'Customization',
        count: 285,
        conversionRate: 0.89,
        dropOffReasons: ['Complex options', 'Price increase'],
        averageTimeSpent: 60
      },
      {
        stage: 'Order Completion',
        count: 245,
        conversionRate: 0.86,
        dropOffReasons: ['Payment issues', 'Changed mind'],
        averageTimeSpent: 45
      }
    ];
  }
  
  private async getPopularItemsInsights(tenantId: string): Promise<PopularItemInsight[]> {
    // Mock data - in production, this would query your order database
    return [
      {
        itemId: 'margherita-pizza',
        itemName: 'Margherita Pizza',
        ordersToday: 45,
        ordersThisWeek: 289,
        revenueToday: 675,
        revenueThisWeek: 4335,
        popularityTrend: 'rising',
        averageRating: 4.7,
        complementaryItems: ['garlic-bread', 'caesar-salad'],
        peakOrderTimes: [12, 13, 18, 19, 20]
      },
      {
        itemId: 'chicken-wings',
        itemName: 'Buffalo Wings',
        ordersToday: 32,
        ordersThisWeek: 198,
        revenueToday: 384,
        revenueThisWeek: 2376,
        popularityTrend: 'stable',
        averageRating: 4.5,
        complementaryItems: ['ranch-dip', 'celery-sticks'],
        peakOrderTimes: [17, 18, 19, 20, 21]
      }
    ];
  }
  
  private async analyzeCustomerSegments(tenantId: string): Promise<CustomerBehaviorInsight[]> {
    return [
      {
        segment: 'new_customers',
        count: 23,
        averageOrderValue: 18.50,
        conversionRate: 0.65,
        preferredCommunicationStyle: 'detailed',
        commonRequests: ['Menu recommendations', 'Popular items', 'Delivery time'],
        retentionRate: 0.45
      },
      {
        segment: 'regular_customers',
        count: 156,
        averageOrderValue: 24.30,
        conversionRate: 0.82,
        preferredCommunicationStyle: 'brief',
        commonRequests: ['Usual order', 'New items', 'Modifications'],
        retentionRate: 0.78
      },
      {
        segment: 'vip_customers',
        count: 12,
        averageOrderValue: 45.60,
        conversionRate: 0.91,
        preferredCommunicationStyle: 'friendly',
        commonRequests: ['Premium options', 'Special requests', 'Catering'],
        retentionRate: 0.89
      }
    ];
  }
  
  private async calculatePerformanceComparison(tenantId: string) {
    return {
      todayVsYesterday: 1.12, // 12% increase
      thisWeekVsLastWeek: 1.08, // 8% increase
      monthOverMonth: 1.15 // 15% increase
    };
  }
  
  private determineCurrentPeakStatus(hour: number): 'normal' | 'building' | 'peak' | 'declining' {
    if (hour >= 11 && hour <= 13) return 'peak'; // Lunch rush
    if (hour >= 17 && hour <= 20) return 'peak'; // Dinner rush
    if (hour >= 10 || hour >= 16) return 'building';
    return 'normal';
  }
  
  private async getCustomerData(tenantId: string) {
    // Mock customer data - in production, this would query your customer database
    return [
      {
        customerId: 'customer-1',
        lastOrderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        averageOrderValue: 25.50,
        orderFrequency: 7, // days between orders
        totalOrders: 8
      }
    ];
  }
  
  private calculateDaysSinceLastOrder(lastOrderDate: Date): number {
    return Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  private calculateChurnRisk(customer: any, daysSinceLastOrder: number): 'low' | 'medium' | 'high' {
    if (daysSinceLastOrder > customer.orderFrequency * 2) return 'high';
    if (daysSinceLastOrder > customer.orderFrequency * 1.5) return 'medium';
    return 'low';
  }
  
  private calculateChurnProbability(customer: any): number {
    // Simple churn probability model
    const daysSinceLastOrder = this.calculateDaysSinceLastOrder(customer.lastOrderDate);
    const expectedDays = customer.orderFrequency;
    return Math.min(0.95, daysSinceLastOrder / (expectedDays * 3));
  }
  
  private identifyChurnReasons(customer: any): string[] {
    return ['Decreased order frequency', 'No recent engagement', 'Lower order values'];
  }
  
  private generateRetentionStrategies(customer: any): string[] {
    return [
      'Send personalized discount offer',
      'Recommend new menu items based on preferences',
      'Offer loyalty points bonus',
      'Request feedback on recent experience'
    ];
  }
}

// Singleton instance
export const analyticsEngine = new AnalyticsEngine(); 