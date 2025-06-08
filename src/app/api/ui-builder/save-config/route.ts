import { NextRequest, NextResponse } from 'next/server';

interface WidgetConfig {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
  };
  position: 'bottom-right' | 'bottom-left' | 'center';
  size: 'small' | 'medium' | 'large';
  components: Array<{
    id: string;
    type: string;
    config: Record<string, any>;
    position: { x: number; y: number };
  }>;
}

// Global storage for widget configurations
declare global {
  var tenantWidgetConfigs: Record<string, WidgetConfig>;
}

if (!global.tenantWidgetConfigs) {
  global.tenantWidgetConfigs = {};
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId, config }: { tenantId: string; config: WidgetConfig } = await request.json();

    if (!tenantId) {
      return NextResponse.json({
        success: false,
        error: 'Tenant ID is required'
      }, { status: 400 });
    }

    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Widget configuration is required'
      }, { status: 400 });
    }

    // Save configuration to global storage
    global.tenantWidgetConfigs[tenantId] = config;

    console.log(`💾 Saved widget config for tenant: ${tenantId}`);
    console.log(`🎨 Components: ${config.components.length}`);
    console.log(`🖌️ Theme: ${config.theme.primaryColor}`);
    console.log(`📍 Position: ${config.position}`);

    return NextResponse.json({
      success: true,
      message: 'Widget configuration saved successfully',
      configId: `widget-${tenantId}-${Date.now()}`,
      componentCount: config.components.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Widget config save error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save widget configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({
        success: false,
        error: 'Tenant ID is required'
      }, { status: 400 });
    }

    const config = global.tenantWidgetConfigs[tenantId];

    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'No widget configuration found for this tenant'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      config,
      tenantId,
      componentCount: config.components.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Widget config retrieval error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve widget configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 