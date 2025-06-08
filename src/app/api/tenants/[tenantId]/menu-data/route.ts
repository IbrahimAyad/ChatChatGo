import { NextRequest, NextResponse } from 'next/server';
import { MenuScraper } from '@/lib/menu-scraper';
import { TenantScrapedMenuData, ScrapingAttempt, ScrapedMenuItem } from '@/types/tenant';

// In-memory storage for demo (replace with database)
declare global {
  var tenantMenuData: Record<string, TenantScrapedMenuData>;
}

if (!global.tenantMenuData) {
  global.tenantMenuData = {};
}

const tenantMenuData = global.tenantMenuData;

// Helper function to check if data is stale
function isDataStale(data: TenantScrapedMenuData, maxAgeHours: number = 24): boolean {
  if (!data.lastScraped) return true;
  
  const now = new Date();
  // Handle both Date objects and string dates from JSON storage
  const lastScrapedDate = typeof data.lastScraped === 'string' 
    ? new Date(data.lastScraped) 
    : data.lastScraped;
  
  const ageInHours = (now.getTime() - lastScrapedDate.getTime()) / (1000 * 60 * 60);
  return ageInHours > maxAgeHours;
}

// Helper function to convert scraped data to tenant format
function convertScrapedDataToTenantFormat(scrapedData: any, source: string): TenantScrapedMenuData {
  const now = new Date();
  
  return {
    restaurantName: scrapedData.restaurantName,
    cuisine: scrapedData.cuisine,
    location: scrapedData.location,
    phone: scrapedData.phone,
    hours: scrapedData.hours,
    website: scrapedData.source,
    
    menu: scrapedData.menu.map((item: any): ScrapedMenuItem => ({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category || 'Menu Item',
      image: item.image,
      allergens: item.allergens || [],
      customizations: item.customizations || [],
      availability: true,
      isPopular: false
    })),
    
    specialOffers: scrapedData.specialOffers || [],
    aiContext: scrapedData.aiContext,
    
    source,
    dataSource: 'scraped',
    lastScraped: now,
    lastUpdated: now,
    isStale: false,
    
    scrapingHistory: [{
      timestamp: now,
      source,
      success: true,
      itemsFound: scrapedData.menu?.length || 0,
      processingTime: 0
    }]
  };
}

// GET - Retrieve stored menu data
export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const url = request.nextUrl.searchParams;
    const forceRefresh = url.get('refresh') === 'true';
    const maxAge = parseInt(url.get('maxAge') || '24'); // hours
    
    console.log(`📖 Getting menu data for tenant: ${tenantId}`);
    
    // Check if we have stored data
    const storedData = tenantMenuData[tenantId];
    
    if (!storedData) {
      return NextResponse.json({
        success: false,
        error: 'No menu data found for this tenant',
        hasStoredData: false,
        suggestion: 'Use POST to scrape and store menu data'
      }, { status: 404 });
    }
    
    // Check if data is stale
    const isStale = isDataStale(storedData, maxAge);
    storedData.isStale = isStale;
    
    return NextResponse.json({
      success: true,
      tenantId,
      menuData: storedData,
      isStale,
      metadata: {
        totalItems: storedData.menu.length,
        lastScraped: storedData.lastScraped,
        dataAge: `${Math.round((new Date().getTime() - (typeof storedData.lastScraped === 'string' ? new Date(storedData.lastScraped) : storedData.lastScraped).getTime()) / (1000 * 60 * 60))} hours`,
        source: storedData.source,
        scrapingHistory: storedData.scrapingHistory.length
      }
    });

  } catch (error) {
    console.error('❌ Error retrieving menu data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve menu data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Scrape and store new menu data
export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const { url, forceRefresh = false } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log(`🔍 Scraping and storing menu for tenant ${tenantId} from: ${url}`);
    
    // Check if we should skip scraping (data is fresh)
    const existingData = tenantMenuData[tenantId];
    if (!forceRefresh && existingData && !isDataStale(existingData, 1)) {
      return NextResponse.json({
        success: true,
        message: 'Using cached data (less than 1 hour old)',
        tenantId,
        menuData: existingData,
        cached: true
      });
    }

    const startTime = Date.now();
    
    // Scrape the menu
    const scrapedData = await MenuScraper.scrapeMenu(url);
    
    const processingTime = Date.now() - startTime;
    
    // Convert and store the data
    const tenantMenuDataFormatted = convertScrapedDataToTenantFormat(scrapedData, url);
    tenantMenuDataFormatted.scrapingHistory[0].processingTime = processingTime;
    
    // Add to existing history if we have previous data
    if (existingData) {
      tenantMenuDataFormatted.scrapingHistory = [
        tenantMenuDataFormatted.scrapingHistory[0],
        ...existingData.scrapingHistory.slice(0, 9) // Keep last 10 attempts
      ];
    }
    
    // Store in memory (replace with database save)
    tenantMenuData[tenantId] = tenantMenuDataFormatted;
    
    console.log(`✅ Successfully scraped and stored ${scrapedData.menu.length} items for ${tenantId}`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully scraped and stored menu data`,
      tenantId,
      menuData: tenantMenuDataFormatted,
      metadata: {
        itemsScraped: scrapedData.menu.length,
        processingTime: `${processingTime}ms`,
        source: url,
        previousData: !!existingData
      }
    });

  } catch (error) {
    console.error('❌ Scraping and storage error:', error);
    
    // Record failed attempt if we have existing data
    const existingData = tenantMenuData[params.tenantId];
    if (existingData) {
      const failedAttempt: ScrapingAttempt = {
        timestamp: new Date(),
        source: 'unknown',
        success: false,
        itemsFound: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: 0
      };
      
      existingData.scrapingHistory = [
        failedAttempt,
        ...existingData.scrapingHistory.slice(0, 9)
      ];
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to scrape and store menu data',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallbackAvailable: !!existingData
    }, { status: 500 });
  }
}

// PUT - Update existing menu data (manual editing)
export async function PUT(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const updates = await request.json();
    
    const existingData = tenantMenuData[tenantId];
    if (!existingData) {
      return NextResponse.json({
        error: 'No existing menu data found. Use POST to create initial data.'
      }, { status: 404 });
    }
    
    // Update the data
    const updatedData: TenantScrapedMenuData = {
      ...existingData,
      ...updates,
      lastUpdated: new Date(),
      dataSource: 'manual', // Mark as manually updated
      isStale: false
    };
    
    // Store updated data
    tenantMenuData[tenantId] = updatedData;
    
    return NextResponse.json({
      success: true,
      message: 'Menu data updated successfully',
      tenantId,
      menuData: updatedData
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update menu data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Remove stored menu data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    
    if (tenantMenuData[tenantId]) {
      delete tenantMenuData[tenantId];
      
      return NextResponse.json({
        success: true,
        message: 'Menu data deleted successfully',
        tenantId
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No menu data found to delete'
      }, { status: 404 });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to delete menu data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 