import { NextRequest, NextResponse } from 'next/server';
import { EnhancedMenuScraper } from '@/lib/menu-scraper-enhanced';
import { TenantScrapedMenuData, ScrapedMenuItem } from '@/types/tenant';

// Access the global menu storage
declare global {
  var tenantMenuData: Record<string, TenantScrapedMenuData>;
}

if (!global.tenantMenuData) {
  global.tenantMenuData = {};
}

// Helper function to convert enhanced scraper data to tenant storage format
function convertToTenantStorageFormat(scrapedData: any, source: string, tenantId: string): TenantScrapedMenuData {
  const now = new Date();
  
  return {
    restaurantName: scrapedData.restaurantName,
    cuisine: scrapedData.cuisine,
    location: scrapedData.location,
    phone: scrapedData.phone,
    hours: scrapedData.hours,
    website: scrapedData.website || source,
    
    menu: scrapedData.menu.map((item: any): ScrapedMenuItem => ({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category || 'Menu Item',
      image: item.image,
      allergens: item.allergens || [],
      customizations: item.customizations || [],
      availability: item.availability !== false,
      isPopular: item.isPopular || false
    })),
    
    globalCustomizations: scrapedData.globalCustomizations || [],
    specialOffers: scrapedData.specialOffers || [],
    aiContext: scrapedData.aiContext || `Menu for ${scrapedData.restaurantName} with ${scrapedData.menu?.length || 0} items.`,
    
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

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log(`🚀 Enhanced scraping menu for tenant ${tenantId} from: ${url}`);

    // Check if we have fresh cached data (unless force refresh is requested)
    if (!forceRefresh && global.tenantMenuData[tenantId]) {
      const existingData = global.tenantMenuData[tenantId];
      const isDataFresh = existingData.lastScraped && 
        (new Date().getTime() - new Date(existingData.lastScraped).getTime()) < (2 * 60 * 60 * 1000); // 2 hours
      
      if (isDataFresh) {
        console.log(`📋 Using cached data for ${tenantId} (${existingData.menu.length} items)`);
        return NextResponse.json({
          success: true,
          tenantId,
          scrapedData: {
            restaurantName: existingData.restaurantName,
            menu: existingData.menu,
            globalCustomizations: existingData.globalCustomizations,
            scrapingMethod: `cached-${existingData.dataSource}`,
            source: existingData.source,
            lastUpdated: existingData.lastUpdated
          },
          cached: true,
          message: `Using cached scraping data (${existingData.menu.length} items) - use forceRefresh=true to scrape again`,
          stats: {
            itemsFound: existingData.menu.length,
            scrapingMethod: `cached-${existingData.dataSource}`,
            restaurantName: existingData.restaurantName,
            retryAttempts: 0,
            strategiesUsed: ['cached'],
            dataAge: `${Math.round((new Date().getTime() - new Date(existingData.lastScraped).getTime()) / (1000 * 60))} minutes`,
            savedToProfile: true
          }
        });
      }
    }

    const startTime = Date.now();

    // Use enhanced scraper with intelligent fallback
    const scrapedData = await EnhancedMenuScraper.scrapeMenu(url);
    
    const processingTime = Date.now() - startTime;

    // Save ALL successful scrapes to storage (including 0 items) for debugging and caching
    console.log(`💾 Saving scraping result (${scrapedData.menu.length} menu items) to tenant storage for ${tenantId}`);
    
    // Convert to tenant storage format
    const tenantStorageData = convertToTenantStorageFormat(scrapedData, url, tenantId);
    tenantStorageData.scrapingHistory[0].processingTime = processingTime;
    
    // Add to existing history if we have previous data
    const existingData = global.tenantMenuData[tenantId];
    if (existingData) {
      tenantStorageData.scrapingHistory = [
        tenantStorageData.scrapingHistory[0],
        ...existingData.scrapingHistory.slice(0, 9) // Keep last 10 attempts
      ];
    }
    
    // Save to global storage
    global.tenantMenuData[tenantId] = tenantStorageData;
    
    if (scrapedData.menu.length > 0) {
      console.log(`✅ Successfully scraped and saved ${scrapedData.menu.length} items for ${tenantId}`);
    } else {
      console.log(`✅ Successfully scraped ${tenantId} - 0 items found but scraping data saved for debugging`);
    }

    return NextResponse.json({
      success: true,
      tenantId,
      scrapedData,
      saved: true, // All successful scrapes are now saved
      message: scrapedData.menu.length > 0 
        ? `Successfully scraped and saved ${scrapedData.menu.length} items using ${scrapedData.scrapingMethod} method`
        : `Scraping completed with 0 items found - scraping data saved for debugging and caching`,
      stats: {
        itemsFound: scrapedData.menu.length,
        scrapingMethod: scrapedData.scrapingMethod,
        restaurantName: scrapedData.restaurantName,
        retryAttempts: scrapedData.debugInfo?.retryAttempts || 0,
        strategiesUsed: scrapedData.debugInfo?.strategies || [],
        screenshotPath: scrapedData.debugInfo?.screenshotPath,
        processingTime: `${processingTime}ms`,
        savedToProfile: true // All successful scrapes are now saved
      },
      debug: scrapedData.debugInfo
    });

  } catch (error) {
    console.error('❌ Enhanced scraping error:', error);
    
    // Record failed attempt if we have existing data
    const existingData = global.tenantMenuData[params.tenantId];
    if (existingData) {
      const failedAttempt = {
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
      error: 'Failed to scrape menu with enhanced scraper',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallbackDataAvailable: !!existingData
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const url = request.nextUrl.searchParams.get('url');
    const forceRefresh = request.nextUrl.searchParams.get('forceRefresh') === 'true';

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Check for cached data first
    if (!forceRefresh && global.tenantMenuData[tenantId]) {
      const existingData = global.tenantMenuData[tenantId];
      const isDataFresh = existingData.lastScraped && 
        (new Date().getTime() - new Date(existingData.lastScraped).getTime()) < (2 * 60 * 60 * 1000);
      
      if (isDataFresh && existingData.menu.length > 0) {
        return NextResponse.json({
          success: true,
          tenantId,
          scrapedData: {
            restaurantName: existingData.restaurantName,
            menu: existingData.menu,
            globalCustomizations: existingData.globalCustomizations,
            scrapingMethod: `cached-${existingData.dataSource}`,
            source: existingData.source,
            lastUpdated: existingData.lastUpdated
          },
          cached: true,
          stats: {
            itemsFound: existingData.menu.length,
            scrapingMethod: `cached-${existingData.dataSource}`,
            retryAttempts: 0,
            strategiesUsed: ['cached']
          }
        });
      }
    }

    // If no cached data or force refresh, scrape new data
    const scrapedData = await EnhancedMenuScraper.scrapeMenu(url);

    // Save to storage if successful
    if (scrapedData.menu && scrapedData.menu.length > 0) {
      const tenantStorageData = convertToTenantStorageFormat(scrapedData, url, tenantId);
      global.tenantMenuData[tenantId] = tenantStorageData;
    }

    return NextResponse.json({
      success: true,
      tenantId,
      scrapedData,
      saved: scrapedData.menu && scrapedData.menu.length > 0,
      stats: {
        itemsFound: scrapedData.menu.length,
        scrapingMethod: scrapedData.scrapingMethod,
        retryAttempts: scrapedData.debugInfo?.retryAttempts || 0,
        strategiesUsed: scrapedData.debugInfo?.strategies || [],
        savedToProfile: scrapedData.menu && scrapedData.menu.length > 0
      },
      debug: scrapedData.debugInfo
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to scrape menu with enhanced scraper',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Cleanup endpoint to close browser instances
export async function DELETE() {
  try {
    await EnhancedMenuScraper.cleanup();
    return NextResponse.json({
      success: true,
      message: 'Browser instances cleaned up successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to cleanup browser instances',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 