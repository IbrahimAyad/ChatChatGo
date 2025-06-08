import { NextRequest, NextResponse } from 'next/server';
import { EnhancedMenuScraper } from '@/lib/menu-scraper-enhanced';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { url, filename } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log(`📸 Taking screenshot of: ${url}`);

    // Launch browser for screenshot
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    try {
      // Set realistic browser settings
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });

      // Block unnecessary resources for faster loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['font', 'media', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Navigate to page
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 15000 
      });

      // Wait a bit for JavaScript to render
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Take screenshot
      const timestamp = Date.now();
      const screenshotFilename = filename || `screenshot-${timestamp}`;
      const screenshotPath = `./public/debug-screenshots/${screenshotFilename}.png` as const;
      
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });

      // Also get page content for analysis
      const pageContent = await page.evaluate(() => {
        return {
          title: document.title,
          bodyText: document.body?.innerText?.substring(0, 500) || 'No body text',
          elementCounts: {
            totalElements: document.querySelectorAll('*').length,
            menuItems: document.querySelectorAll('[data-testid="menu-item"], .menu-item, .menuitem').length,
            buttons: document.querySelectorAll('button').length,
            divs: document.querySelectorAll('div').length
          }
        };
      });

      console.log(`✅ Screenshot saved: ${screenshotPath}`);

      return NextResponse.json({
        success: true,
        screenshot: {
          path: screenshotPath,
          url: `/debug-screenshots/${screenshotFilename}.png`,
          filename: `${screenshotFilename}.png`
        },
        pageInfo: pageContent,
        timestamp
      });

    } finally {
      await page.close();
      await browser.close();
    }

  } catch (error) {
    console.error('❌ Screenshot error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to take screenshot',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Same logic as POST but for GET requests
    return await POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ url })
    }));

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to take screenshot',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 