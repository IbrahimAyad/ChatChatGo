import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { TenantScrapedMenuData } from '@/types/tenant';

// Global storage for tenant data (in production, use a database)
declare global {
  var tenantMenuData: Record<string, TenantScrapedMenuData>;
  var menuSubmissions: Record<string, any>;
}

if (!global.tenantMenuData) {
  global.tenantMenuData = {};
}

if (!global.menuSubmissions) {
  global.menuSubmissions = {};
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      return await handleFileUpload(request);
    } else {
      // Handle manual entry
      return await handleManualEntry(request);
    }
  } catch (error) {
    console.error('Manual menu submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Submission failed' },
      { status: 500 }
    );
  }
}

async function handleFileUpload(request: NextRequest) {
  try {
    const formData = await request.formData();
    const tenantId = formData.get('tenantId') as string;
    const submissionType = formData.get('submissionType') as string;
    const files = formData.getAll('files') as File[];

    if (!tenantId || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing tenant ID or files' },
        { status: 400 }
      );
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'uploads', 'menu-submissions', tenantId);
    await mkdir(uploadDir, { recursive: true });

    // Save uploaded files
    const savedFiles = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return NextResponse.json(
          { success: false, error: `File ${file.name} exceeds 10MB limit` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filename = `${Date.now()}-${file.name}`;
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      savedFiles.push({
        originalName: file.name,
        filename,
        size: file.size,
        type: file.type
      });
    }

    // Create submission record
    const submission = {
      id: `submission-${Date.now()}`,
      tenantId,
      type: 'file-upload',
      status: 'pending',
      files: savedFiles,
      submittedAt: new Date().toISOString(),
      processingFee: 49.00,
      estimatedCompletion: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
    };

    // Store submission (in production, save to database)
    if (!global.menuSubmissions) {
      global.menuSubmissions = {};
    }
    global.menuSubmissions[submission.id] = submission;

    // Send email notification (mock implementation)
    await sendSubmissionNotification(tenantId, submission);

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Files uploaded successfully. You will receive an email confirmation shortly.',
      estimatedCompletion: submission.estimatedCompletion,
      processingFee: submission.processingFee
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: 'File upload failed' },
      { status: 500 }
    );
  }
}

async function handleManualEntry(request: NextRequest) {
  try {
    const { tenantId, submissionType, menuItems } = await request.json();

    if (!tenantId || !menuItems || menuItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing tenant ID or menu items' },
        { status: 400 }
      );
    }

    // Validate menu items
    const validItems = menuItems.filter((item: any) => item.name && item.name.trim());
    if (validItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid menu items provided' },
        { status: 400 }
      );
    }

    // Convert to tenant storage format
    const menuData: TenantScrapedMenuData = {
      restaurantName: `Restaurant ${tenantId}`, // In production, get from tenant data
      cuisine: 'Various',
      menu: validItems.map((item: any) => ({
        name: item.name.trim(),
        description: item.description?.trim() || '',
        price: item.price?.trim() || '',
        category: item.category || 'Main Course',
        availability: true
      })),
      globalCustomizations: [],
      specialOffers: [],
      aiContext: generateAIContext(validItems),
      source: 'manual-entry',
      dataSource: 'manual' as const,
      lastScraped: new Date(),
      lastUpdated: new Date(),
      isStale: false,
      scrapingHistory: [{
        timestamp: new Date(),
        source: 'manual-entry',
        success: true,
        itemsFound: validItems.length,
        processingTime: 0
      }]
    };

    // Save to tenant storage
    global.tenantMenuData[tenantId] = menuData;

    // Create submission record
    const submission = {
      id: `manual-${Date.now()}`,
      tenantId,
      type: 'manual-entry',
      status: 'completed',
      itemsAdded: validItems.length,
      submittedAt: new Date().toISOString(),
      processingFee: 0, // Manual entry is free
    };

    // Store submission
    if (!global.menuSubmissions) {
      global.menuSubmissions = {};
    }
    global.menuSubmissions[submission.id] = submission;

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      itemsAdded: validItems.length,
      message: `Successfully added ${validItems.length} menu items. Your menu is now active!`
    });

  } catch (error) {
    console.error('Manual entry error:', error);
    return NextResponse.json(
      { success: false, error: 'Manual entry failed' },
      { status: 500 }
    );
  }
}

function generateAIContext(menuItems: any[]): string {
  const categorySet = new Set(menuItems.map(item => item.category));
  const categories = Array.from(categorySet);
  const itemList = menuItems.map(item => 
    `${item.name}${item.price ? ` - ${item.price}` : ''}${item.description ? `: ${item.description}` : ''}`
  ).join('\n');

  return `Menu Categories: ${categories.join(', ')}

Menu Items:
${itemList}

This restaurant offers ${menuItems.length} menu items across ${categories.length} categories. All items are manually entered and verified.`;
}

async function sendSubmissionNotification(tenantId: string, submission: any) {
  // Mock email notification - in production, integrate with email service
  console.log(`📧 Email Notification Sent:
    To: Restaurant Owner (${tenantId})
    Subject: Menu Submission Received - Processing Started
    
    Dear Restaurant Owner,
    
    We've received your menu submission with ${submission.files.length} files.
    
    Submission Details:
    - Submission ID: ${submission.id}
    - Processing Fee: $${submission.processingFee}
    - Estimated Completion: ${new Date(submission.estimatedCompletion).toLocaleDateString()}
    
    Our team will process your menu and notify you when it's ready.
    
    Best regards,
    ChatChatGo Team
  `);
  
  return true;
}

// GET endpoint to retrieve submission status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');
    const tenantId = searchParams.get('tenantId');

    if (submissionId) {
      // Get specific submission
      const submission = global.menuSubmissions?.[submissionId];
      if (!submission) {
        return NextResponse.json(
          { success: false, error: 'Submission not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        submission
      });
    }

    if (tenantId) {
      // Get all submissions for tenant
      const submissions = Object.values(global.menuSubmissions || {})
        .filter((sub: any) => sub.tenantId === tenantId)
        .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      return NextResponse.json({
        success: true,
        submissions
      });
    }

    return NextResponse.json(
      { success: false, error: 'Missing submissionId or tenantId parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Get submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve submission' },
      { status: 500 }
    );
  }
} 