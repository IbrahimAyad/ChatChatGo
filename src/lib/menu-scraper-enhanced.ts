// Enhanced Menu Web Scraping Service with Puppeteer Browser Automation
// Handles dynamic content from GrubHub, DoorDash, UberEats, and other modern platforms
// Automatically activates browser automation and intelligent parsing when 0 items found

import { load } from 'cheerio';
import puppeteer, { Browser, Page } from 'puppeteer';

export interface ScrapedMenuItem {
  name: string;
  description?: string;
  price?: string;
  category?: string;
  image?: string;
  allergens?: string[];
  customizations?: MenuCustomization[];
  toppings?: MenuTopping[];
  modifications?: string[];
  availability?: boolean;
  isPopular?: boolean;
  baseIngredients?: string[];
  dietaryInfo?: DietaryInfo;
}

export interface MenuCustomization {
  type: 'substitute' | 'add' | 'remove' | 'side' | 'sauce' | 'size' | 'cooking';
  name: string;
  options: string[];
  price?: string;
  category?: string;
}

export interface MenuTopping {
  name: string;
  price?: string;
  category: 'meat' | 'cheese' | 'vegetable' | 'sauce' | 'other';
  isDefault?: boolean;
  isRemovable?: boolean;
}

export interface DietaryInfo {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isHalal?: boolean;
  isKosher?: boolean;
  isSpicy?: boolean;
  spiceLevel?: number;
}

export interface ScrapedMenuData {
  restaurantName: string;
  cuisine?: string;
  location?: string;
  phone?: string;
  hours?: string;
  website?: string;
  menu: ScrapedMenuItem[];
  globalCustomizations?: MenuCustomization[];
  specialOffers?: string[];
  aiContext: string;
  source: string;
  lastUpdated: string;
  scrapingMethod: 'static' | 'browser' | 'intelligent' | 'universal';
  debugInfo?: {
    screenshotPath?: string;
    elementsFound?: number;
    retryAttempts?: number;
    strategies?: string[];
  };
}

export class EnhancedMenuScraper {
  private static browser: Browser | null = null;
  private static readonly USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  /**
   * Initialize browser instance (reuse for performance)
   */
  private static async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      console.log('🚀 Launching Puppeteer browser...');
      this.browser = await puppeteer.launch({
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
    }
    return this.browser;
  }

  /**
   * Enhanced price extraction utility
   */
  private static extractPrice(element: Element | null, fallbackText?: string): string | undefined {
    if (!element && !fallbackText) return undefined;
    
    const textSources = [
      element?.textContent,
      element?.getAttribute('data-price'),
      element?.getAttribute('aria-label'),
      fallbackText
    ].filter(Boolean);
    
    for (const text of textSources) {
      if (!text) continue;
      
      // Enhanced price patterns for multiple currencies and formats
      const pricePatterns = [
        /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,    // $12.99, $1,299.99
        /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*\$/g,    // 12.99$, 1,299.99$
        /€\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,     // €12.99
        /£\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,     // £12.99
        /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|usd)/g,  // 12.99 USD
        /Price:\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,   // Price: $12.99
        /Cost:\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,    // Cost: $12.99
        /(\d+\.\d{2})/g                              // Basic decimal price 12.99
      ];
      
      for (const pattern of pricePatterns) {
        const matches = Array.from(text.matchAll(pattern));
        if (matches.length > 0) {
          // Find the most likely price (prefer currency symbols)
          for (const match of matches) {
            const priceValue = match[1] || match[0];
            const numericValue = parseFloat(priceValue.replace(/,/g, ''));
            
            // Validate price range (reasonable menu item prices)
            if (numericValue >= 0.50 && numericValue <= 999.99) {
              // Return formatted price with currency symbol
              if (text.includes('$')) return `$${numericValue.toFixed(2)}`;
              if (text.includes('€')) return `€${numericValue.toFixed(2)}`;
              if (text.includes('£')) return `£${numericValue.toFixed(2)}`;
              return `$${numericValue.toFixed(2)}`; // Default to USD
            }
          }
        }
      }
    }
    
    return undefined;
  }

  /**
   * Enhanced price detection with multiple selector strategies
   */
  private static findPriceInContainer(container: Element): string | undefined {
    const priceSelectors = [
      // Specific price selectors
      '[data-testid*="price"]', '[data-testid*="cost"]', '[data-testid*="amount"]',
      '[class*="price"]', '[class*="cost"]', '[class*="amount"]', '[class*="currency"]',
      '[id*="price"]', '[id*="cost"]',
      
      // Generic text containers that might contain prices
      'span', 'div', 'p', 'strong', 'b', 'em',
      
      // Common price container patterns
      '.price-value', '.item-price', '.menu-price', '.product-price',
      '[role="text"]', '[aria-label*="price"]', '[aria-label*="cost"]',
      
      // Currency-specific selectors
      '[class*="dollar"]', '[class*="usd"]', '[class*="currency"]'
    ];
    
    // Try each selector in order of specificity
    for (const selector of priceSelectors) {
      const elements = container.querySelectorAll(selector);
      
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const price = this.extractPrice(element);
        if (price) return price;
      }
    }
    
    // Fallback: check the entire container text
    return this.extractPrice(null, container.textContent || undefined);
  }

  /**
   * Main scraping function with intelligent fallback when 0 items found
   */
  static async scrapeMenu(url: string): Promise<ScrapedMenuData> {
    try {
      console.log(`🔍 Enhanced scraping menu from: ${url}`);
      
      let result: ScrapedMenuData;
      let retryAttempts = 0;
      const strategies: string[] = [];

      // First attempt: Try appropriate method based on URL
      if (this.requiresBrowserAutomation(url) || this.isComplexSite(url)) {
        strategies.push('browser-automation');
        result = await this.scrapeWithBrowser(url);
      } else {
        strategies.push('static-scraping');
        result = await this.scrapeStatic(url);
      }

      // If 0 menu items found, activate intelligent fallback scraping
      if (result.menu.length === 0) {
        console.log('🎯 0 menu items found, activating intelligent fallback scraping...');
        retryAttempts++;
        
        // Try browser automation with universal parsing
        console.log('🤖 Attempting universal browser automation...');
        strategies.push('universal-browser');
        result = await this.scrapeWithUniversalBrowser(url);
        
        // If still 0, try aggressive text mining
        if (result.menu.length === 0) {
          console.log('🔬 Attempting aggressive text mining...');
          retryAttempts++;
          strategies.push('text-mining');
          result = await this.scrapeWithTextMining(url);
        }
      }

      // Add debug info
      result.debugInfo = {
        retryAttempts,
        strategies,
        elementsFound: result.menu.length
      };

      return result;
      
    } catch (error) {
      console.error(`❌ Enhanced scraping error for ${url}:`, error);
      throw new Error(`Failed to scrape menu from ${url}: ${error}`);
    }
  }

  /**
   * Determine if URL requires browser automation
   */
  private static requiresBrowserAutomation(url: string): boolean {
    const browserRequiredDomains = [
      'ubereats.com',
      'doordash.com', 
      'grubhub.com',
      'seamless.com',
      'postmates.com',
      'caviar.com',
      'yelp.com'
    ];

    return browserRequiredDomains.some(domain => url.includes(domain));
  }

  /**
   * Determine if site is complex and likely needs browser automation
   */
  private static isComplexSite(url: string): boolean {
    const complexIndicators = [
      'app.',
      'order.',
      'menu.',
      'delivery.',
      '/store/',
      '/restaurant/',
      '/menu/',
      'react',
      'angular',
      'vue'
    ];

    return complexIndicators.some(indicator => url.includes(indicator));
  }

  /**
   * Browser automation scraping for dynamic content
   */
  private static async scrapeWithBrowser(url: string): Promise<ScrapedMenuData> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      // Set user agent and viewport
      await page.setUserAgent(this.USER_AGENT);
      await page.setViewport({ width: 1366, height: 768 });

      // Add request interception to block unnecessary resources and improve speed
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        const url = req.url();
        
        // Block unnecessary resources to speed up loading
        if (['image', 'stylesheet', 'font', 'media', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'].includes(resourceType)) {
          req.abort();
        } else if (url.includes('google-analytics') || url.includes('facebook') || url.includes('twitter') || url.includes('ads')) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log(`🌐 Loading page with browser: ${url}`);
      
      // Navigate to page with shorter timeout and more permissive wait condition
      try {
        await page.goto(url, { 
          waitUntil: 'domcontentloaded', 
          timeout: 15000 
        });
        
        // Try to wait for some content, but don't fail if it times out
        try {
          await page.waitForFunction(
            () => document.body && document.body.children.length > 0,
            { timeout: 5000 }
          );
        } catch (e) {
          console.log('⚠️ Content loading timeout, proceeding with what we have...');
        }
        
      } catch (error) {
        // If navigation fails completely, try with even more permissive settings
        console.log(`⚠️ Navigation failed, trying again with basic loading: ${error}`);
        await page.goto(url, { 
          waitUntil: 'networkidle2', 
          timeout: 10000 
        });
      }

      // Add a small delay to let JavaScript render
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Take a screenshot for debugging (save to public folder)
      try {
        const screenshotPath = `./public/debug-screenshots/screenshot-${Date.now()}.png` as const;
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
      } catch (screenshotError) {
        console.log('⚠️ Screenshot failed:', screenshotError);
      }

      // Platform-specific scraping logic
      if (url.includes('ubereats.com')) {
        return await this.scrapeUberEatsWithBrowser(page, url);
      } else if (url.includes('doordash.com')) {
        return await this.scrapeDoorDashWithBrowser(page, url);
      } else if (url.includes('grubhub.com')) {
        return await this.scrapeGrubHubWithBrowser(page, url);
      } else {
        return await this.scrapeGenericWithBrowser(page, url);
      }

    } finally {
      await page.close();
    }
  }

  /**
   * UberEats browser scraping
   */
  private static async scrapeUberEatsWithBrowser(page: Page, url: string): Promise<ScrapedMenuData> {
    console.log('🍔 Scraping UberEats with browser automation...');
    
    // Wait for content to load
    try {
      await page.waitForSelector('h1', { timeout: 10000 });
    } catch (e) {
      console.log('⚠️ Timeout waiting for content, proceeding anyway...');
    }

    // Extract restaurant name
    const restaurantName = await page.evaluate(() => {
      const selectors = [
        'h1[data-testid="store-header-title"]',
        'h1[data-testid="store-title"]',
        'h1',
        '[data-testid="store-info-name"]'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          return element.textContent.trim();
        }
      }
      return 'Restaurant';
    }) || 'Restaurant';

    // Extract menu items with multiple attempts
    const menuItems = await page.evaluate(() => {
      const items: any[] = [];
      
      // Multiple selector strategies for UberEats
      const itemSelectors = [
        '[data-testid="menu-item"]',
        '[data-testid*="menu-item"]',
        '[class*="menu-item"]',
        '[class*="MenuItem"]',
        'div[role="button"]:has(h3)',
        'div:has([data-testid="rich-text"])'
      ];

      for (const selector of itemSelectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
        
        elements.forEach((element, index) => {
          if (index > 50) return; // Limit to 50 items
          
          const nameEl = element.querySelector('h3, [data-testid="rich-text"], span[class*="title"]');
          const name = nameEl?.textContent?.trim();
          
          if (name && name.length > 2) {
            const descEl = element.querySelector('div[color="black50"], p, span[class*="description"]');
            const description = descEl?.textContent?.trim();
            
            const price = this.findPriceInContainer(element);

            items.push({
              name,
              description: description || undefined,
              price: price || undefined,
              category: 'Menu Item',
              availability: true
            });
          }
        });
        
        if (items.length > 0) break; // Found items, stop trying other selectors
      }

      return items;
    });

    console.log(`✅ UberEats: Found ${menuItems.length} menu items`);

    return {
      restaurantName,
      menu: menuItems,
      aiContext: this.buildAIContext(restaurantName, menuItems),
      source: url,
      lastUpdated: new Date().toISOString(),
      scrapingMethod: 'browser'
    };
  }

  /**
   * DoorDash browser scraping
   */
  private static async scrapeDoorDashWithBrowser(page: Page, url: string): Promise<ScrapedMenuData> {
    console.log('🚪 Scraping DoorDash with browser automation...');
    
    // Wait for content to load
    try {
      await page.waitForSelector('h1, [data-anchor-id*="StoreHeader"]', { timeout: 10000 });
    } catch (e) {
      console.log('⚠️ Timeout waiting for DoorDash content...');
    }

    const restaurantName = await page.evaluate(() => {
      const selectors = [
        'h1[data-anchor-id="StoreHeader"]',
        'h1[data-testid="store-name"]',
        'h1',
        '[data-testid="store-title"]'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          return element.textContent.trim();
        }
      }
      return 'Restaurant';
    }) || 'Restaurant';

    const menuItems = await page.evaluate(() => {
      const items: any[] = [];
      
      const itemSelectors = [
        '[data-anchor-id*="MenuItem"]',
        '[data-testid*="menu-item"]',
        'div[role="button"]:has(span)',
        '[class*="MenuItem"]'
      ];

      for (const selector of itemSelectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`DoorDash: Found ${elements.length} elements with selector: ${selector}`);
        
        elements.forEach((element, index) => {
          if (index > 50) return;
          
          const nameEl = element.querySelector('span[data-anchor-id="MenuItemName"], h3, span[class*="name"]');
          const name = nameEl?.textContent?.trim();
          
          if (name && name.length > 2) {
            const descEl = element.querySelector('span[data-anchor-id="MenuItemDescription"], p, div[class*="description"]');
            const description = descEl?.textContent?.trim();
            
            const price = this.findPriceInContainer(element);

            items.push({
              name,
              description: description || undefined,
              price: price || undefined,
              category: 'Menu Item',
              availability: true
            });
          }
        });
        
        if (items.length > 0) break;
      }

      return items;
    });

    console.log(`✅ DoorDash: Found ${menuItems.length} menu items`);

    return {
      restaurantName,
      menu: menuItems,
      aiContext: this.buildAIContext(restaurantName, menuItems),
      source: url,
      lastUpdated: new Date().toISOString(),
      scrapingMethod: 'browser'
    };
  }

  /**
   * GrubHub browser scraping
   */
  private static async scrapeGrubHubWithBrowser(page: Page, url: string): Promise<ScrapedMenuData> {
    console.log('🥘 Scraping GrubHub with browser automation...');
    
    try {
      await page.waitForSelector('h1, .restaurant-name', { timeout: 10000 });
    } catch (e) {
      console.log('⚠️ Timeout waiting for GrubHub content...');
    }

    const restaurantName = await page.evaluate(() => {
      const selectors = [
        'h1.restaurant-name',
        'h1[data-testid="restaurant-name"]',
        'h1',
        '.restaurant-title'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          return element.textContent.trim();
        }
      }
      return 'Restaurant';
    }) || 'Restaurant';

    const menuItems = await page.evaluate(() => {
      const items: any[] = [];
      
      // Enhanced price extraction function (browser context)
      const extractPrice = (element: Element | null, fallbackText?: string): string | undefined => {
        if (!element && !fallbackText) return undefined;
        
        const textSources = [
          element?.textContent,
          element?.getAttribute('data-price'),
          element?.getAttribute('aria-label'),
          fallbackText
        ].filter(Boolean);
        
        for (const text of textSources) {
          if (!text) continue;
          
          const pricePatterns = [
            /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
            /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*\$/g,
            /€\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
            /£\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
            /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|usd)/g,
            /Price:\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
            /Cost:\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
            /(\d+\.\d{2})/g
          ];
          
          for (const pattern of pricePatterns) {
            const matches = Array.from(text.matchAll(pattern));
            if (matches.length > 0) {
              for (const match of matches) {
                const priceValue = match[1] || match[0];
                const numericValue = parseFloat(priceValue.replace(/,/g, ''));
                
                if (numericValue >= 0.50 && numericValue <= 999.99) {
                  if (text.includes('$')) return `$${numericValue.toFixed(2)}`;
                  if (text.includes('€')) return `€${numericValue.toFixed(2)}`;
                  if (text.includes('£')) return `£${numericValue.toFixed(2)}`;
                  return `$${numericValue.toFixed(2)}`;
                }
              }
            }
          }
        }
        return undefined;
      };
      
      const findPriceInContainer = (container: Element): string | undefined => {
        const priceSelectors = [
          '[data-testid*="price"]', '[class*="price"]', '[class*="cost"]',
          '.itemPrice', '.item-price', '.price', 'span[class*="price"]',
          'span', 'div', 'p', 'strong', 'b'
        ];
        
        for (const selector of priceSelectors) {
          const elements = container.querySelectorAll(selector);
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const price = extractPrice(element);
            if (price) return price;
          }
        }
        
        return extractPrice(null, container.textContent || undefined);
      };
      
      const itemSelectors = [
        '.menuItem',
        '.menu-item',
        '[data-testid*="menu-item"]',
        'div[role="button"]:has(.itemName)',
        '[class*="MenuItem"]'
      ];

      for (const selector of itemSelectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`GrubHub: Found ${elements.length} elements with selector: ${selector}`);
        
        elements.forEach((element, index) => {
          if (index > 50) return;
          
          const nameEl = element.querySelector('.itemName, .item-name, h3, span[class*="name"]');
          const name = nameEl?.textContent?.trim();
          
          if (name && name.length > 2) {
            const descEl = element.querySelector('.itemDescription, .item-description, p');
            const description = descEl?.textContent?.trim();
            
            const price = findPriceInContainer(element);

            items.push({
              name,
              description: description || undefined,
              price: price || undefined,
              category: 'Menu Item',
              availability: true
            });
          }
        });
        
        if (items.length > 0) break;
      }

      return items;
    });

    console.log(`✅ GrubHub: Found ${menuItems.length} menu items`);

    return {
      restaurantName,
      menu: menuItems,
      aiContext: this.buildAIContext(restaurantName, menuItems),
      source: url,
      lastUpdated: new Date().toISOString(),
      scrapingMethod: 'browser'
    };
  }

  /**
   * Generic browser scraping for other dynamic sites
   */
  private static async scrapeGenericWithBrowser(page: Page, url: string): Promise<ScrapedMenuData> {
    console.log('🌐 Generic browser scraping...');
    
    const restaurantName = await page.evaluate(() => {
      const selectors = ['h1', '.restaurant-name', '.business-name', 'title'];
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          return element.textContent.trim();
        }
      }
      return 'Restaurant';
    }) || 'Restaurant';

    const menuItems = await page.evaluate(() => {
      const items: any[] = [];
      const itemSelectors = [
        '.menu-item', '.menuitem', '.menu_item', '.food-item', '.dish'
      ];

      for (const selector of itemSelectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
          if (index > 50) return;
          
          const name = element.querySelector('h1, h2, h3, h4, .name, .title')?.textContent?.trim();
          if (name && name.length > 2) {
            const description = element.querySelector('.description, .desc, p')?.textContent?.trim();
            const price = element.querySelector('.price, .cost')?.textContent?.trim();

            items.push({
              name,
              description: description || undefined,
              price: price || undefined,
              category: 'Menu Item'
            });
          }
        });
        if (items.length > 0) break;
      }

      return items;
    });

    return {
      restaurantName,
      menu: menuItems,
      aiContext: this.buildAIContext(restaurantName, menuItems),
      source: url,
      lastUpdated: new Date().toISOString(),
      scrapingMethod: 'browser'
    };
  }

  /**
   * Static HTML scraping (fallback for simple sites)
   */
  private static async scrapeStatic(url: string): Promise<ScrapedMenuData> {
    console.log(`📄 Static scraping for: ${url}`);
    
    const response = await fetch(url, {
      headers: { 'User-Agent': this.USER_AGENT }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = load(html);
    
    const restaurantName = $('h1').first().text().trim() || 'Restaurant';
    const menuItems: ScrapedMenuItem[] = [];
    
    $('.menu-item, .menuitem').each((_, element) => {
      const $item = $(element);
      const name = $item.find('h1, h2, h3, h4, .name, .title').first().text().trim();
      const description = $item.find('.description, .desc, p').first().text().trim();
      const price = $item.find('.price, .cost').first().text().trim();
      
      if (name) {
        menuItems.push({
          name,
          description: description || undefined,
          price: price || undefined,
          category: 'Menu Item'
        });
      }
    });
    
    return {
      restaurantName,
      menu: menuItems,
      aiContext: this.buildAIContext(restaurantName, menuItems),
      source: url,
      lastUpdated: new Date().toISOString(),
      scrapingMethod: 'static'
    };
  }

  /**
   * Build AI context from scraped data
   */
  private static buildAIContext(restaurantName: string, menuItems: ScrapedMenuItem[]): string {
    let context = `Welcome to ${restaurantName}!\n\nMENU:\n`;
    
    menuItems.forEach((item, index) => {
      context += `${index + 1}. ${item.name}`;
      if (item.price) context += ` - ${item.price}`;
      if (item.description) context += `\n   ${item.description}`;
      context += '\n';
    });
    
    return context;
  }

  /**
   * Cleanup browser instance
   */
  static async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🔒 Browser instance closed');
    }
  }

  /**
   * Universal browser automation with comprehensive menu detection
   */
  private static async scrapeWithUniversalBrowser(url: string): Promise<ScrapedMenuData> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      // Set user agent and viewport
      await page.setUserAgent(this.USER_AGENT);
      await page.setViewport({ width: 1366, height: 768 });

      // Add request interception to block unnecessary resources
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        const url = req.url();
        
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else if (url.includes('google-analytics') || url.includes('facebook')) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log(`🌐 Loading page with universal browser: ${url}`);
      
      // Navigate with multiple fallback strategies
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 });
      } catch (e) {
        console.log('⚠️ Using fallback navigation method...');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      }

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Take screenshot for debugging
      const timestamp = Date.now();
      const screenshotPath = `./public/debug-screenshots/universal-${timestamp}.png` as const;
      try {
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 Debug screenshot saved: ${screenshotPath}`);
      } catch (e) {
        console.log('⚠️ Screenshot failed');
      }

      // Universal menu extraction with customization parsing
      const result = await page.evaluate(() => {
        // Enhanced price extraction function (browser context)
        const extractPrice = (element: Element | null, fallbackText?: string): string | undefined => {
          if (!element && !fallbackText) return undefined;
          
          const textSources = [
            element?.textContent,
            element?.getAttribute('data-price'),
            element?.getAttribute('aria-label'),
            fallbackText
          ].filter(Boolean);
          
          for (const text of textSources) {
            if (!text) continue;
            
            const pricePatterns = [
              /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
              /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*\$/g,
              /€\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
              /£\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
              /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|usd)/g,
              /Price:\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
              /Cost:\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
              /(\d+\.\d{2})/g
            ];
            
            for (const pattern of pricePatterns) {
              const matches = Array.from(text.matchAll(pattern));
              if (matches.length > 0) {
                for (const match of matches) {
                  const priceValue = match[1] || match[0];
                  const numericValue = parseFloat(priceValue.replace(/,/g, ''));
                  
                  if (numericValue >= 0.50 && numericValue <= 999.99) {
                    if (text.includes('$')) return `$${numericValue.toFixed(2)}`;
                    if (text.includes('€')) return `€${numericValue.toFixed(2)}`;
                    if (text.includes('£')) return `£${numericValue.toFixed(2)}`;
                    return `$${numericValue.toFixed(2)}`;
                  }
                }
              }
            }
          }
          return undefined;
        };
        
        const findPriceInContainer = (container: Element): string | undefined => {
          const priceSelectors = [
            '[data-testid*="price"]', '[data-testid*="cost"]', '[data-testid*="amount"]',
            '[class*="price"]', '[class*="cost"]', '[class*="amount"]', '[class*="currency"]',
            '[id*="price"]', '[id*="cost"]',
            'span', 'div', 'p', 'strong', 'b', 'em',
            '.price-value', '.item-price', '.menu-price', '.product-price',
            '[role="text"]', '[aria-label*="price"]', '[aria-label*="cost"]',
            '[class*="dollar"]', '[class*="usd"]', '[class*="currency"]'
          ];
          
          for (const selector of priceSelectors) {
            const elements = container.querySelectorAll(selector);
            for (let i = 0; i < elements.length; i++) {
              const element = elements[i];
              const price = extractPrice(element);
              if (price) return price;
            }
          }
          
          return extractPrice(null, container.textContent || undefined);
        };
        
        const restaurantName = (() => {
          const selectors = [
            'h1', 'h2', '[class*="restaurant"]', '[class*="store"]', '[class*="business"]',
            '[data-testid*="name"]', '[data-testid*="title"]', 'title', '.title'
          ];
          
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            const text = element?.textContent?.trim();
            if (text && text.length > 1 && text.length < 100) {
              return text;
            }
          }
          return 'Restaurant';
        })();

        const menuItems: any[] = [];
        const globalCustomizations: any[] = [];
        
        // Helper function to parse customizations from text
        const parseCustomizations = (text: string) => {
          const customizations: any[] = [];
          const toppings: any[] = [];
          const modifications: string[] = [];
          const baseIngredients: string[] = [];
          
          // Detect substitution options
          const substitutionPatterns = [
            /substitute.*?(?:with|for)\s+([^.]+)/gi,
            /choose.*?(?:from|between|one)\s*:?\s*([^.]+)/gi,
            /available.*?(?:options|choices)\s*:?\s*([^.]+)/gi
          ];
          
          substitutionPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
              matches.forEach(match => {
                const options = match.split(/,|and|or|\|/).map(s => s.trim()).filter(s => s.length > 0);
                if (options.length > 1) {
                  customizations.push({
                    type: 'substitute',
                    name: 'Protein/Base Options',
                    options: options
                  });
                }
              });
            }
          });
          
          // Detect additional toppings
          const toppingsPatterns = [
            /(?:additional|extra|add)\s+(?:toppings?|ingredients?)\s*:?\s*([^.]+)/gi,
            /(?:toppings?|add-ons?)\s*:?\s*([^.]+)/gi,
            /(?:available\s+)?(?:add|extras?)\s*:?\s*([^.]+)/gi
          ];
          
          toppingsPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
              matches.forEach(match => {
                const items = match.split(/,|and|\|/).map(s => s.trim()).filter(s => s.length > 0);
                items.forEach(item => {
                  const priceMatch = item.match(/\$[\d.]+/);
                  const name = item.replace(/\$[\d.]+/, '').trim();
                  if (name.length > 2) {
                                         toppings.push({
                       name: name,
                       price: priceMatch ? priceMatch[0] : undefined,
                       category: categorizeTopping(name),
                       isRemovable: true
                     });
                  }
                });
              });
            }
          });
          
          // Detect sauce options
          const saucePatterns = [
            /(?:sauces?|dressings?)\s*:?\s*([^.]+)/gi,
            /(?:side\s+)?(?:sauces?|dips?)\s*:?\s*([^.]+)/gi
          ];
          
          saucePatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
              matches.forEach(match => {
                const sauces = match.split(/,|and|\|/).map(s => s.trim()).filter(s => s.length > 0);
                if (sauces.length > 1) {
                  customizations.push({
                    type: 'sauce',
                    name: 'Sauce Options',
                    options: sauces
                  });
                }
              });
            }
          });
          
          // Detect allergen information
          const allergens: string[] = [];
          const allergenKeywords = ['gluten', 'dairy', 'nuts', 'peanuts', 'shellfish', 'soy', 'eggs'];
          allergenKeywords.forEach(allergen => {
            if (text.toLowerCase().includes(allergen)) {
              allergens.push(allergen);
            }
          });
          
          // Extract base ingredients from descriptions
          const commonIngredients = [
            'lettuce', 'tomato', 'onion', 'pickle', 'cheese', 'bacon', 'avocado',
            'mushrooms', 'peppers', 'chicken', 'beef', 'turkey', 'ham', 'mayo',
            'mustard', 'ketchup', 'ranch', 'bbq', 'sauce'
          ];
          
          commonIngredients.forEach(ingredient => {
            if (text.toLowerCase().includes(ingredient)) {
              baseIngredients.push(ingredient);
            }
          });
          
          return { customizations, toppings, modifications, baseIngredients, allergens };
        };
        
        // Helper function to categorize toppings
        const categorizeTopping = (name: string): string => {
          const nameLower = name.toLowerCase();
          if (['chicken', 'beef', 'turkey', 'bacon', 'ham', 'sausage'].some(meat => nameLower.includes(meat))) {
            return 'meat';
          }
          if (['cheese', 'cheddar', 'swiss', 'american', 'provolone'].some(cheese => nameLower.includes(cheese))) {
            return 'cheese';
          }
          if (['lettuce', 'tomato', 'onion', 'pickle', 'avocado', 'mushroom'].some(veg => nameLower.includes(veg))) {
            return 'vegetable';
          }
          if (['sauce', 'mayo', 'mustard', 'ketchup', 'ranch', 'bbq'].some(sauce => nameLower.includes(sauce))) {
            return 'sauce';
          }
          return 'other';
        };
        
        // Comprehensive menu item detection strategies
        const strategies = [
          // Strategy 1: Look for common menu item patterns
          {
            name: 'common-patterns',
            containerSelectors: [
              '[class*="menu"]', '[class*="item"]', '[class*="dish"]', '[class*="food"]',
              '[class*="product"]', '[data-testid*="menu"]', '[data-testid*="item"]'
            ],
            nameSelectors: ['h1', 'h2', 'h3', 'h4', 'h5', 'span', 'div', 'p'],
            priceSelectors: ['[class*="price"]', '[data-testid*="price"]', 'span', 'div']
          },
          
          // Strategy 2: Look for list-like structures
          {
            name: 'list-structures',
            containerSelectors: ['li', 'tr', '[role="listitem"]', '.row', '.card'],
            nameSelectors: ['h1', 'h2', 'h3', 'h4', 'span', 'strong', 'b'],
            priceSelectors: ['[class*="price"]', '[class*="cost"]', 'span', 'div']
          },
          
          // Strategy 3: Look for button-like elements (ordering buttons)
          {
            name: 'interactive-elements',
            containerSelectors: ['button', '[role="button"]', 'a[href*="add"]', '[class*="add"]'],
            nameSelectors: ['span', 'div', 'p', 'h1', 'h2', 'h3'],
            priceSelectors: ['[class*="price"]', 'span', 'div']
          }
        ];

        // First, look for global customization information
        const allText = document.body.textContent || '';
        const globalCustomizationInfo = parseCustomizations(allText);
        globalCustomizations.push(...globalCustomizationInfo.customizations);

        for (const strategy of strategies) {
          console.log(`Trying strategy: ${strategy.name}`);
          
          for (const containerSelector of strategy.containerSelectors) {
            const containers = document.querySelectorAll(containerSelector);
            console.log(`Found ${containers.length} containers with ${containerSelector}`);
            
            containers.forEach((container, index) => {
              if (index > 100) return; // Limit processing
              
              // Find potential name
              let name = '';
              for (const nameSelector of strategy.nameSelectors) {
                const nameEl = container.querySelector(nameSelector);
                const text = nameEl?.textContent?.trim();
                if (text && text.length > 2 && text.length < 200 && !text.includes('$')) {
                  name = text;
                  break;
                }
              }
              
              // Find potential price using enhanced extraction
              const price = findPriceInContainer(container);
              
              // Find description and parse customizations
              const descEl = container.querySelector('p, [class*="desc"], [class*="detail"]');
              const description = descEl?.textContent?.trim();
              const fullText = container.textContent || '';
              
              // Parse customizations for this specific item
              const itemCustomizations = parseCustomizations(fullText);
              
              if (name && name.length > 2) {
                const menuItem: any = {
                  name,
                  description: description && description.length > 5 ? description : undefined,
                  price: price || undefined,
                  category: 'Menu Item',
                  availability: true
                };
                
                // Add customization data if found
                if (itemCustomizations.customizations.length > 0) {
                  menuItem.customizations = itemCustomizations.customizations;
                }
                if (itemCustomizations.toppings.length > 0) {
                  menuItem.toppings = itemCustomizations.toppings;
                }
                if (itemCustomizations.baseIngredients.length > 0) {
                  menuItem.baseIngredients = itemCustomizations.baseIngredients;
                }
                if (itemCustomizations.allergens.length > 0) {
                  menuItem.allergens = itemCustomizations.allergens;
                }
                
                menuItems.push(menuItem);
              }
            });
            
            if (menuItems.length > 0) break;
          }
          
          if (menuItems.length > 0) break;
        }

        return { restaurantName, menuItems, globalCustomizations };
      });

      console.log(`✅ Universal scraping: Found ${result.menuItems.length} menu items`);

      return {
        restaurantName: result.restaurantName,
        menu: result.menuItems,
        globalCustomizations: result.globalCustomizations,
        aiContext: this.buildAIContext(result.restaurantName, result.menuItems),
        source: url,
        lastUpdated: new Date().toISOString(),
        scrapingMethod: 'universal',
        debugInfo: { screenshotPath }
      };

    } finally {
      await page.close();
    }
  }

  /**
   * Aggressive text mining for menu items when all else fails
   */
  private static async scrapeWithTextMining(url: string): Promise<ScrapedMenuData> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent(this.USER_AGENT);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise(resolve => setTimeout(resolve, 2000));

             // Take screenshot for debugging
       const timestamp = Date.now();
       const screenshotPath = `./public/debug-screenshots/textmine-${timestamp}.png` as const;
       try {
         await page.screenshot({ path: screenshotPath, fullPage: true });
         console.log(`📸 Text mining screenshot: ${screenshotPath}`);
       } catch (e) {}

      const result = await page.evaluate(() => {
        // Extract all text content from the page
        const allText = document.body.textContent || '';
        const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        const menuItems: any[] = [];
        const potentialItems: any[] = [];
        
        // Enhanced menu item patterns with better price detection
        const menuPatterns = [
          /^[A-Z][a-zA-Z\s&'-]+(?:\s*[\$€£]\d+(?:\.\d{2})?)?$/,  // "Burger $12.99"
          /^[A-Z][a-zA-Z\s&'-]+.*[\$€£]\d+(?:\.\d{2})?$/,        // "Delicious Pizza with cheese $15.50"
          /^[A-Z][a-zA-Z\s&'-]{3,30}$/                            // Just food names without prices
        ];
        
        // Enhanced price patterns
        const pricePatterns = [
          /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
          /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*\$/g,
          /€\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
          /£\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
          /(\d+\.\d{2})/g
        ];
        
                  // Enhanced price extraction function
          const extractPriceFromText = (text: string): { price?: string, cleanText: string } => {
            for (const pattern of pricePatterns) {
              const matches = Array.from(text.matchAll(pattern));
              if (matches.length > 0) {
                for (const match of matches) {
                  const priceValue = match[1] || match[0];
                  const numericValue = parseFloat(priceValue.replace(/,/g, ''));
                  
                  if (numericValue >= 0.50 && numericValue <= 999.99) {
                    const formattedPrice = text.includes('€') ? `€${numericValue.toFixed(2)}` :
                                         text.includes('£') ? `£${numericValue.toFixed(2)}` :
                                         `$${numericValue.toFixed(2)}`;
                    const cleanText = text.replace(match[0], '').trim();
                    return { price: formattedPrice, cleanText };
                  }
                }
              }
            }
            return { cleanText: text };
          };
          
          lines.forEach((line, index) => {
            // Skip lines that are too short or too long
            if (line.length < 3 || line.length > 150) return;
            
            // Skip common non-menu text
            if (line.includes('http') || line.includes('@') || line.includes('©')) return;
            
            // Check if line matches menu item patterns
            for (const pattern of menuPatterns) {
              if (pattern.test(line)) {
                const { price, cleanText } = extractPriceFromText(line);
                const name = cleanText;
                
                // Look ahead for description
                let description = '';
                if (index + 1 < lines.length) {
                  const nextLine = lines[index + 1];
                  const hasPrice = pricePatterns.some(p => p.test(nextLine));
                  if (nextLine.length > 10 && nextLine.length < 200 && !hasPrice) {
                    description = nextLine;
                  }
                }
                
                potentialItems.push({
                  name,
                  description: description || undefined,
                  price,
                  category: 'Menu Item'
                });
                break;
              }
            }
          });
        
        // Filter and deduplicate items
        const seen = new Set();
        potentialItems.forEach(item => {
          const key = item.name.toLowerCase();
          if (!seen.has(key) && item.name.length > 2) {
            seen.add(key);
            menuItems.push(item);
          }
        });
        
        // Try to extract restaurant name
        const restaurantName = (() => {
          const titleEl = document.querySelector('title');
          if (titleEl?.textContent) {
            return titleEl.textContent.split('|')[0].split('-')[0].trim();
          }
          
          const h1El = document.querySelector('h1');
          if (h1El?.textContent) {
            return h1El.textContent.trim();
          }
          
          return 'Restaurant';
        })();

        return { restaurantName, menuItems: menuItems.slice(0, 50) }; // Limit to 50 items
      });

      console.log(`🔬 Text mining: Found ${result.menuItems.length} potential menu items`);

      return {
        restaurantName: result.restaurantName,
        menu: result.menuItems,
        aiContext: this.buildAIContext(result.restaurantName, result.menuItems),
        source: url,
        lastUpdated: new Date().toISOString(),
        scrapingMethod: 'intelligent',
        debugInfo: { screenshotPath }
      };

    } finally {
      await page.close();
    }
  }
} 