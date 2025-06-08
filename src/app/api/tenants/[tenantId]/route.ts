import { NextRequest, NextResponse } from 'next/server';
import { TenantStorage } from '@/lib/tenant-storage';

// Get tenant by ID or slug
function getTenantById(tenantId: string) {
  return TenantStorage.getTenantById(tenantId) || TenantStorage.getTenantBySlug(tenantId);
}

// GET /api/tenants/[tenantId] - Get specific tenant
export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const tenant = getTenantById(params.tenantId);

    if (!tenant) {
      return NextResponse.json({
        error: 'Tenant not found',
        message: `No tenant found with ID or slug: ${params.tenantId}`,
      }, { status: 404 });
    }

    return NextResponse.json({
      tenant,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Tenant GET error:', error);
    return NextResponse.json({
      error: 'Failed to fetch tenant',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// PUT /api/tenants/[tenantId] - Update tenant
export async function PUT(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const updateData = await request.json();
    const tenant = getTenantById(params.tenantId);

    if (!tenant) {
      return NextResponse.json({
        error: 'Tenant not found',
        message: `No tenant found with ID or slug: ${params.tenantId}`,
      }, { status: 404 });
    }

    // Update using persistent storage
    const updatedTenant = TenantStorage.updateTenant(tenant.id, updateData);

    if (!updatedTenant) {
      return NextResponse.json({
        error: 'Failed to update tenant',
      }, { status: 500 });
    }

    return NextResponse.json({
      tenant: updatedTenant,
      message: 'Tenant updated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Tenant UPDATE error:', error);
    return NextResponse.json({
      error: 'Failed to update tenant',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// DELETE /api/tenants/[tenantId] - Delete tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const tenant = getTenantById(params.tenantId);

    if (!tenant) {
      return NextResponse.json({
        error: 'Tenant not found',
        message: `No tenant found with ID or slug: ${params.tenantId}`,
      }, { status: 404 });
    }

    // Delete using persistent storage
    const deleted = TenantStorage.deleteTenant(tenant.id);
    
    if (!deleted) {
      return NextResponse.json({
        error: 'Failed to delete tenant',
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Tenant deleted successfully',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Tenant DELETE error:', error);
    return NextResponse.json({
      error: 'Failed to delete tenant',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 