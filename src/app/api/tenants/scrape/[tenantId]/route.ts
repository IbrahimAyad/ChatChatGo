import { NextRequest, NextResponse } from 'next/server';
import { MenuScraper } from '@/lib/menu-scraper';

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log(`🔍 Scraping menu for tenant ${tenantId} from: ${url}`);

    // Scrape the menu
    const scrapedData = await MenuScraper.scrapeMenu(url);

    // You could optionally save this to your tenant database here
    // For now, we'll just return the scraped data
    
    return NextResponse.json({
      success: true,
      tenantId,
      scrapedData,
      message: `Successfully scraped menu from ${scrapedData.source}`
    });

  } catch (error) {
    console.error('❌ Scraping error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to scrape menu',
      details: error instanceof Error ? error.message : 'Unknown error'
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

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Same logic as POST but for GET requests
    const scrapedData = await MenuScraper.scrapeMenu(url);

    return NextResponse.json({
      success: true,
      tenantId,
      scrapedData
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to scrape menu',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 