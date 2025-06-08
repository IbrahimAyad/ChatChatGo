import { NextRequest, NextResponse } from 'next/server';

interface BusinessInsight {
  id: string;
  type: 'revenue_opportunity' | 'operational_efficiency' | 'customer_satisfaction' | 'inventory_optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  priority: number;
  actionable: boolean;
  estimatedRevenueIncrease?: string;
  implementationDifficulty: 'easy' | 'medium' | 'complex';
  recommendedActions: string[];
  data: any;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || '30d';
    const category = searchParams.get('category'); // 'revenue', 'operations', 'customer', 'inventory'

    // Simulate real-time data analysis
    const insights = await generateBusinessInsights(tenantId, timeframe, category);

    return NextResponse.json({
      success: true,
      insights,
      generatedAt: new Date().toISOString(),
      timeframe,
      totalInsights: insights.length,
      highPriorityInsights: insights.filter(i => i.impact === 'high').length
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

async function generateBusinessInsights(
  tenantId: string, 
  timeframe: string, 
  category?: string | null
): Promise<BusinessInsight[]> {
  
  // This would normally pull real data from your analytics system
  // For now, we'll generate smart demo insights
  
  const insights: BusinessInsight[] = [
    {
      id: 'upsell-fries-opportunity',
      type: 'revenue_opportunity',
      title: 'Untapped Upselling Potential: French Fries',
      description: 'Only 34% of burger orders include fries, but customers who add fries spend 28% more on average.',
      impact: 'high',
      priority: 1,
      actionable: true,
      estimatedRevenueIncrease: '+$2,400/month',
      implementationDifficulty: 'easy',
      recommendedActions: [
        'Add AI suggestion: "Would you like fries with that?"',
        'Create combo meal discounts',
        'Train AI to mention fries with every burger order',
        'A/B test different frying timing for freshness mentions'
      ],
      data: {
        burgerOrders: 850,
        friesUpsellRate: 0.34,
        averageOrderIncrease: 4.20,
        potentialMonthlyIncrease: 2400,
        competitorBenchmark: 0.67
      }
    },
    
    {
      id: 'peak-hour-staffing',
      type: 'operational_efficiency',
      title: 'Peak Hour Response Time Bottleneck',
      description: 'AI response times increase 340% during 7-9 PM rush, leading to 12% customer drop-off.',
      impact: 'high',
      priority: 2,
      actionable: true,
      estimatedRevenueIncrease: '+$1,800/month',
      implementationDifficulty: 'medium',
      recommendedActions: [
        'Implement advanced AI pre-loading during peak hours',
        'Add queue management with wait time estimates',
        'Create express ordering for repeat customers',
        'Consider dedicated peak-hour AI assistant'
      ],
      data: {
        peakHours: ['19:00-21:00'],
        normalResponseTime: 2.1,
        peakResponseTime: 9.2,
        dropOffRate: 0.12,
        potentialRecoveredOrders: 85,
        averageOrderValue: 21.20
      }
    },

    {
      id: 'dietary-restriction-gap',
      type: 'customer_satisfaction',
      title: 'Growing Vegan Customer Segment Underserved',
      description: 'Vegan option requests increased 180% but only 8% successfully convert to orders.',
      impact: 'medium',
      priority: 3,
      actionable: true,
      estimatedRevenueIncrease: '+$950/month',
      implementationDifficulty: 'medium',
      recommendedActions: [
        'Add 2-3 clearly marked vegan options to menu',
        'Train AI to proactively suggest vegan alternatives',
        'Partner with local vegan suppliers',
        'Create vegan-specific promotional campaigns'
      ],
      data: {
        veganInquiries: 145,
        successfulConversions: 12,
        marketDemandGrowth: 1.8,
        competitorVeganOptions: 4.2,
        estimatedDemand: 45
      }
    },

    {
      id: 'inventory-waste-reduction',
      type: 'inventory_optimization',
      title: 'Predictable Ingredient Waste Pattern',
      description: 'Lettuce waste averages 15% daily due to over-ordering for weekend rushes that don\'t materialize.',
      impact: 'medium',
      priority: 4,
      actionable: true,
      estimatedRevenueIncrease: '+$680/month (cost savings)',
      implementationDifficulty: 'easy',
      recommendedActions: [
        'Implement weather-based demand forecasting',
        'Adjust lettuce orders based on 7-day weather forecast',
        'Create special "fresh salad" promotions on high-inventory days',
        'Partner with local farms for smaller, more frequent deliveries'
      ],
      data: {
        averageDailyWaste: 2.4, // kg
        wastePercentage: 0.15,
        costPerKg: 3.80,
        monthlyWasteCost: 274,
        potentialSavings: 0.6 // 60% reduction potential
      }
    },

    {
      id: 'weekend-breakfast-opportunity',
      type: 'revenue_opportunity',
      title: 'Untapped Weekend Breakfast Market',
      description: 'Saturday-Sunday 8-11 AM shows 78% lower order volume than weekday lunch, but high local foot traffic.',
      impact: 'high',
      priority: 5,
      actionable: true,
      estimatedRevenueIncrease: '+$3,200/month',
      implementationDifficulty: 'complex',
      recommendedActions: [
        'Launch weekend breakfast menu with 5-7 items',
        'Create breakfast combo deals',
        'Implement breakfast-specific AI responses',
        'Partner with local coffee roaster for premium coffee',
        'Test weekend breakfast hours: 8 AM - 12 PM'
      ],
      data: {
        weekendMorningTraffic: 'high',
        currentWeekendOrders: 23,
        weekdayLunchComparison: 105,
        marketOpportunitySize: 65,
        estimatedBreakfastAOV: 12.40
      }
    },

    {
      id: 'customer-retention-risk',
      type: 'customer_satisfaction',
      title: 'Declining Repeat Customer Rate',
      description: 'Repeat customer rate dropped from 45% to 38% over past 3 months. Exit surveys cite "predictable menu".',
      impact: 'high',
      priority: 6,
      actionable: true,
      estimatedRevenueIncrease: '+$1,950/month',
      implementationDifficulty: 'medium',
      recommendedActions: [
        'Introduce weekly chef specials via AI announcements',
        'Create seasonal limited-time offers',
        'Implement customer preference learning in AI',
        'Add surprise loyalty rewards for repeat customers',
        'Test menu rotation strategy'
      ],
      data: {
        previousRepeatRate: 0.45,
        currentRepeatRate: 0.38,
        customerLifetimeValue: 156,
        churnReasons: ['menu_boredom', 'lack_of_novelty', 'competitor_variety'],
        retentionImpactEstimate: 0.12
      }
    }
  ];

  // Filter by category if specified
  if (category) {
    const categoryMap: Record<string, string> = {
      'revenue': 'revenue_opportunity',
      'operations': 'operational_efficiency', 
      'customer': 'customer_satisfaction',
      'inventory': 'inventory_optimization'
    };
    
    const filterType = categoryMap[category];
    if (filterType) {
      return insights.filter(insight => insight.type === filterType);
    }
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

// POST endpoint for marking insights as implemented
export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const body = await request.json();
    const { insightId, action, implementationDate } = body;

    // Here you would normally save the implementation tracking
    // For now, we'll return a success response
    
    return NextResponse.json({
      success: true,
      message: 'Insight implementation tracked',
      insightId,
      action,
      implementationDate,
      followUpRecommendations: [
        'Monitor metrics for 2-week period',
        'A/B test different implementation approaches',
        'Set up automated alerts for key performance indicators'
      ]
    });

  } catch (error) {
    console.error('Error tracking insight implementation:', error);
    return NextResponse.json(
      { error: 'Failed to track implementation' },
      { status: 500 }
    );
  }
} 