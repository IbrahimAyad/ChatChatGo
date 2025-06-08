import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TENANTS_FILE = path.join(process.cwd(), 'data', 'tenants.json');

export async function PUT(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const tenantId = params.tenantId;
    const updateData = await request.json();

    // Read current tenants data
    const tenantsData = JSON.parse(fs.readFileSync(TENANTS_FILE, 'utf8'));
    
    // Find the tenant to update
    const tenantIndex = tenantsData.findIndex((t: any) => t.id === tenantId);
    
    if (tenantIndex === -1) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Update the tenant data
    const currentTenant = tenantsData[tenantIndex];
    
    // Update basic information
    if (updateData.name) {
      currentTenant.name = updateData.name;
    }
    
    // Update address
    if (updateData.address) {
      currentTenant.address = {
        ...currentTenant.address,
        ...updateData.address
      };
    }
    
    // Update settings (including business hours)
    if (updateData.settings) {
      currentTenant.settings = {
        ...currentTenant.settings,
        ...updateData.settings
      };
    }
    
    // Update the updatedAt timestamp
    currentTenant.updatedAt = new Date().toISOString();
    
    // Replace the tenant in the array
    tenantsData[tenantIndex] = currentTenant;
    
    // Write back to file
    fs.writeFileSync(TENANTS_FILE, JSON.stringify(tenantsData, null, 2));
    
    return NextResponse.json({
      success: true,
      tenant: currentTenant
    });
    
  } catch (error) {
    console.error('Error updating tenant settings:', error);
    return NextResponse.json(
      { error: 'Failed to update tenant settings' },
      { status: 500 }
    );
  }
} 