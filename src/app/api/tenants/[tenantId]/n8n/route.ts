import { NextRequest, NextResponse } from 'next/server';
import { N8NWorkflowManager } from '@/lib/n8n-manager';

// Mock tenant data - in production this would come from your database
const mockTenants = [
  {
    id: 'mario-restaurant',
    name: "Mario's Italian Restaurant",
    industry: 'restaurant',
    settings: {
      businessHours: {
        monday: { isOpen: true, open: '11:00', close: '22:00' },
        tuesday: { isOpen: true, open: '11:00', close: '22:00' },
        wednesday: { isOpen: true, open: '11:00', close: '22:00' },
        thursday: { isOpen: true, open: '11:00', close: '22:00' },
        friday: { isOpen: true, open: '11:00', close: '23:00' },
        saturday: { isOpen: true, open: '11:00', close: '23:00' },
        sunday: { isOpen: true, open: '12:00', close: '21:00' }
      },
      timezone: 'America/New_York',
      language: 'en',
      aiModel: 'gpt-4',
      voiceEnabled: true,
      autoRespond: true,
      responseDelay: 1000,
      maxTokens: 500,
      temperature: 0.3,
      n8nEnabled: false
    }
  }
];

// Create N8N workflow for tenant
export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    
    // Find tenant
    const tenant = mockTenants.find(t => t.id === tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Check if N8N is configured
    if (!process.env.N8N_API_KEY || !process.env.N8N_BASE_URL) {
      return NextResponse.json(
        { 
          error: 'N8N not configured. Please set N8N_API_KEY and N8N_BASE_URL environment variables.',
          configured: false
        },
        { status: 500 }
      );
    }

    // Create N8N workflow manager
    const n8nManager = new N8NWorkflowManager();
    
    // Create restaurant workflow
    const { workflowId, webhookUrl } = await n8nManager.createRestaurantWorkflow(tenant as any);

    // Update tenant settings (in production, save to database)
    tenant.settings.n8nEnabled = true;
    tenant.settings = {
      ...tenant.settings,
      n8nWorkflowId: workflowId,
      n8nWebhookUrl: webhookUrl,
      n8nWorkflowStatus: 'active'
    } as any;

    console.log(`[API] Created N8N workflow for ${tenant.name}:`, {
      workflowId,
      webhookUrl
    });

    return NextResponse.json({
      success: true,
      message: `N8N workflow created for ${tenant.name}`,
      data: {
        tenantId,
        workflowId,
        webhookUrl,
        status: 'active'
      }
    });

  } catch (error: any) {
    console.error('[API] Failed to create N8N workflow:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create N8N workflow',
        details: error.message,
        configured: !!process.env.N8N_API_KEY
      },
      { status: 500 }
    );
  }
}

// Get N8N workflow status for tenant
export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    
    // Find tenant
    const tenant = mockTenants.find(t => t.id === tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const settings = tenant.settings as any;

    return NextResponse.json({
      tenantId,
      n8nEnabled: settings.n8nEnabled || false,
      workflowId: settings.n8nWorkflowId,
      webhookUrl: settings.n8nWebhookUrl,
      status: settings.n8nWorkflowStatus || 'not_created',
      configured: {
        apiKey: !!process.env.N8N_API_KEY,
        baseUrl: !!process.env.N8N_BASE_URL
      }
    });

  } catch (error: any) {
    console.error('[API] Failed to get N8N workflow status:', error);
    
    return NextResponse.json(
      { error: 'Failed to get workflow status' },
      { status: 500 }
    );
  }
}

// Update N8N workflow for tenant
export async function PUT(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const body = await request.json();
    
    // Find tenant
    const tenant = mockTenants.find(t => t.id === tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const settings = tenant.settings as any;
    
    if (!settings.n8nWorkflowId) {
      return NextResponse.json(
        { error: 'No N8N workflow found for this tenant' },
        { status: 400 }
      );
    }

    // Update workflow (implementation depends on what's being updated)
    const n8nManager = new N8NWorkflowManager();
    await n8nManager.updateWorkflow(tenantId, tenant as any);

    return NextResponse.json({
      success: true,
      message: `N8N workflow updated for ${tenant.name}`,
      workflowId: settings.n8nWorkflowId
    });

  } catch (error: any) {
    console.error('[API] Failed to update N8N workflow:', error);
    
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

// Delete N8N workflow for tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    
    // Find tenant
    const tenant = mockTenants.find(t => t.id === tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const settings = tenant.settings as any;
    
    if (!settings.n8nWorkflowId) {
      return NextResponse.json(
        { error: 'No N8N workflow found for this tenant' },
        { status: 400 }
      );
    }

    // Delete workflow
    const n8nManager = new N8NWorkflowManager();
    await n8nManager.deleteWorkflow(settings.n8nWorkflowId);

    // Update tenant settings
    tenant.settings.n8nEnabled = false;
    delete (tenant.settings as any).n8nWorkflowId;
    delete (tenant.settings as any).n8nWebhookUrl;
    delete (tenant.settings as any).n8nWorkflowStatus;

    return NextResponse.json({
      success: true,
      message: `N8N workflow deleted for ${tenant.name}`
    });

  } catch (error: any) {
    console.error('[API] Failed to delete N8N workflow:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
} 