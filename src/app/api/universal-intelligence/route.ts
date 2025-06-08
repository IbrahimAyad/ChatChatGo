import { NextRequest, NextResponse } from 'next/server';
import { universalIntelligence } from '@/lib/universal-intelligence';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const tenantId = searchParams.get('tenantId');
  const restaurantType = searchParams.get('restaurantType');

  try {
    switch (action) {
      case 'get_insights':
        if (!tenantId || !restaurantType) {
          return NextResponse.json({ error: 'tenantId and restaurantType required' }, { status: 400 });
        }
        
        const insights = universalIntelligence.getPersonalizedInsights(tenantId, restaurantType);
        return NextResponse.json({ insights });

      case 'get_universal_analytics':
        const analytics = universalIntelligence.getUniversalAnalytics();
        return NextResponse.json({ analytics });

      case 'generate_suggestion':
        if (!tenantId || !restaurantType) {
          return NextResponse.json({ error: 'tenantId and restaurantType required' }, { status: 400 });
        }

        const currentOrder = searchParams.get('currentOrder')?.split(',') || [];
        const timeOfDay = parseInt(searchParams.get('timeOfDay') || '12');
        const userBehavior = searchParams.get('userBehavior')?.split(',') || [];
        const sentiment = (searchParams.get('sentiment') as 'positive' | 'neutral' | 'negative') || 'neutral';

        const suggestions = universalIntelligence.generateUniversalSuggestion({
          tenantId,
          restaurantType,
          currentOrder,
          timeOfDay,
          userBehavior,
          sentiment
        });

        return NextResponse.json({ suggestions });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Universal Intelligence API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    const body = await request.json();

    switch (action) {
      case 'contribute_data':
        const { tenantId, interactionData } = body;
        
        if (!tenantId || !interactionData) {
          return NextResponse.json({ error: 'tenantId and interactionData required' }, { status: 400 });
        }

        await universalIntelligence.contributeInteractionData(tenantId, interactionData);
        return NextResponse.json({ success: true });

      case 'bulk_contribute':
        const { contributions } = body;
        
        if (!Array.isArray(contributions)) {
          return NextResponse.json({ error: 'contributions must be an array' }, { status: 400 });
        }

        const results = await Promise.allSettled(
          contributions.map(({ tenantId, interactionData }: any) => 
            universalIntelligence.contributeInteractionData(tenantId, interactionData)
          )
        );

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        
        return NextResponse.json({ 
          success: true, 
          processed: contributions.length,
          successful: successCount,
          failed: contributions.length - successCount
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Universal Intelligence POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}