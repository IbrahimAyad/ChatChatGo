import { NextRequest, NextResponse } from 'next/server';

interface BusinessMetrics {
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    changeVsLastWeek: number;
  };
  orders: {
    today: number;
    pending: number;
    completed: number;
    averageValue: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    satisfaction: number;
  };
  voice: {
    totalMinutes: number;
    conversionRate: number;
    responseTime: number;
    accuracy: number;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || '7d';

    // In production, this would pull real data from your analytics database
    // For now, we'll generate realistic demo data based on tenant and timeframe
    const metrics = await generateMetricsData(tenantId, timeframe);

    return NextResponse.json({
      success: true,
      metrics,
      timeframe,
      generatedAt: new Date().toISOString(),
      tenantId
    });

  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}

async function generateMetricsData(tenantId: string, timeframe: string): Promise<BusinessMetrics> {
  // Generate realistic data based on tenant and timeframe
  const timeMultiplier = getTimeMultiplier(timeframe);
  const baseRevenue = 2847; // From our existing Royale with Cheese data
  
  // Simulate different performance based on tenant ID
  const tenantSeed = tenantId.length * 137; // Simple seed based on tenant ID
  const performanceModifier = 0.8 + (tenantSeed % 100) / 250; // 0.8 to 1.2 range
  
  const revenueToday = Math.round(baseRevenue * performanceModifier);
  const ordersToday = Math.round(89 * performanceModifier);
  const averageOrderValue = revenueToday / ordersToday;
  
  return {
    revenue: {
      today: revenueToday,
      thisWeek: Math.round(revenueToday * 7 * 1.1), // Slightly higher weekly average
      thisMonth: Math.round(revenueToday * 30 * 1.05), // Slightly higher monthly average
      changeVsLastWeek: Math.round((Math.random() - 0.3) * 40) // -12% to +28% range
    },
    orders: {
      today: ordersToday,
      pending: Math.round(Math.random() * 8 + 2), // 2-10 pending orders
      completed: ordersToday - Math.round(Math.random() * 8 + 2),
      averageValue: Math.round(averageOrderValue * 100) / 100
    },
    customers: {
      total: Math.round(450 * performanceModifier),
      new: Math.round(23 * performanceModifier),
      returning: Math.round(156 * performanceModifier),
      satisfaction: Math.round((0.85 + Math.random() * 0.1) * 100) / 100 // 85-95% satisfaction
    },
    voice: {
      totalMinutes: Math.round(342 * performanceModifier),
      conversionRate: Math.round((0.65 + Math.random() * 0.25) * 100) / 100, // 65-90% conversion
      responseTime: Math.round((1.5 + Math.random() * 2) * 10) / 10, // 1.5-3.5 seconds
      accuracy: Math.round((0.87 + Math.random() * 0.1) * 100) / 100 // 87-97% accuracy
    }
  };
}

function getTimeMultiplier(timeframe: string): number {
  switch (timeframe) {
    case '1d': return 1;
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    default: return 7;
  }
} 