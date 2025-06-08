// Menu Web Scraping Service
// Dynamically scrapes menu data from restaurant websites and delivery platforms

import { load } from 'cheerio';

export interface ScrapedMenuItem {
  name: string;
  description?: string;
  price?: string;
  category?: string;
  image?: string;
  allergens?: string[];
  customizations?: string[];
}

export interface ScrapedMenuData {
  restaurantName: string;
  cuisine?: string;
  location?: string;
  phone?: string;
  hours?: string;
  menu: ScrapedMenuItem[];
  specialOffers?: string[];
  aiContext: string;
  source: string;
  lastUpdated: string;
}

export class MenuScraper {
  private static readonly USER_AGENT = 'Mozilla/5.0 (compatible/restaurant-menu-bot)';
  
  /**
   * Main scraping function - automatically detects platform and scrapes accordingly
   */
  static async scrapeMenu(url: string): Promise<ScrapedMenuData> {
    try {
      console.log(`🔍 Scraping menu from: ${url}`);
      
      // Detect platform and use appropriate scraper
      if (url.includes('ubereats.com')) {
        return await this.scrapeUberEats(url);
      } else if (url.includes('doordash.com')) {
        return await this.scrapeDoorDash(url);
      } else if (url.includes('grubhub.com')) {
        return await this.scrapeGrubHub(url);
      } else if (url.includes('seamless.com')) {
        return await this.scrapeSeamless(url);
      } else if (url.includes('postmates.com')) {
        return await this.scrapePostmates(url);
      } else {
        // Generic website scraper
        return await this.scrapeGenericWebsite(url);
      }
    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error);
      throw new Error(`Failed to scrape menu from ${url}: ${error}`);
    }
  }

  /**
   * Generic website scraper - works for most restaurant websites
   */
  private static async scrapeGenericWebsite(url: string): Promise<ScrapedMenuData> {
    const response = await fetch(url, {
      headers: { 'User-Agent': this.USER_AGENT }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = load(html);
    
    // Extract restaurant name
    const restaurantName = this.extractRestaurantName($);
    
    // Extract menu items using common selectors
    const menuItems = this.extractMenuItems($);
    
    // Extract contact info
    const phone = this.extractPhone($);
    const location = this.extractLocation($);
    const hours = this.extractHours($);
    
    // Extract special offers
    const specialOffers = this.extractSpecialOffers($);
    
    return {
      restaurantName,
      phone,
      location,
      hours,
      menu: menuItems,
      specialOffers,
      aiContext: this.buildAIContext(restaurantName, menuItems, specialOffers),
      source: url,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * UberEats scraper
   */
  private static async scrapeUberEats(url: string): Promise<ScrapedMenuData> {
    const response = await fetch(url, {
      headers: { 'User-Agent': this.USER_AGENT }
    });
    
    const html = await response.text();
    const $ = load(html);
    
    const restaurantName = $('h1[data-testid="store-header-title"]').text().trim() ||
                          $('h1').first().text().trim() ||
                          'Restaurant';
    
    const menuItems: ScrapedMenuItem[] = [];
    
    // UberEats menu items
    $('[data-testid="menu-item"]').each((_: any, element: any) => {
      const $item = $(element);
      const name = $item.find('h3, [data-testid="rich-text"]').first().text().trim();
      const description = $item.find('div[color="black50"]').text().trim();
      const price = $item.find('[data-testid="price-text"]').text().trim();
      
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
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * DoorDash scraper
   */
  private static async scrapeDoorDash(url: string): Promise<ScrapedMenuData> {
    const response = await fetch(url, {
      headers: { 'User-Agent': this.USER_AGENT }
    });
    
    const html = await response.text();
    const $ = load(html);
    
    const restaurantName = $('h1[data-anchor-id="StoreHeader"]').text().trim() ||
                          $('h1').first().text().trim() ||
                          'Restaurant';
    
    const menuItems: ScrapedMenuItem[] = [];
    
    // DoorDash menu items
    $('[data-anchor-id*="MenuItem"]').each((_: any, element: any) => {
      const $item = $(element);
      const name = $item.find('span[data-anchor-id="MenuItemName"]').text().trim();
      const description = $item.find('span[data-anchor-id="MenuItemDescription"]').text().trim();
      const price = $item.find('span[data-anchor-id="MenuItemPrice"]').text().trim();
      
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
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * GrubHub scraper
   */
  private static async scrapeGrubHub(url: string): Promise<ScrapedMenuData> {
    // Similar implementation for GrubHub
    const response = await fetch(url, {
      headers: { 'User-Agent': this.USER_AGENT }
    });
    
    const html = await response.text();
    const $ = load(html);
    
    const restaurantName = $('h1.restaurant-name, h1').first().text().trim() || 'Restaurant';
    const menuItems: ScrapedMenuItem[] = [];
    
    // GrubHub has different selectors
    $('.menuItem, .menu-item').each((_: any, element: any) => {
      const $item = $(element);
      const name = $item.find('.itemName, .item-name, .menu-item-name').text().trim();
      const description = $item.find('.itemDescription, .item-description').text().trim();
      const price = $item.find('.itemPrice, .item-price, .price').text().trim();
      
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
      lastUpdated: new Date().toISOString()
    };
  }

  // Helper functions for generic website scraping
  private static extractRestaurantName($: any): string {
    const selectors = [
      'h1.restaurant-name',
      'h1.business-name', 
      '.restaurant-title',
      '.business-title',
      'h1',
      'title'
    ];
    
    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      if (text && text.length > 0) {
        return text.replace(/\s*-\s*Menu.*$/i, '').trim();
      }
    }
    
    return 'Restaurant';
  }

  private static extractMenuItems($: any): ScrapedMenuItem[] {
    const menuItems: ScrapedMenuItem[] = [];
    
    // Common menu item selectors
    const itemSelectors = [
      '.menu-item',
      '.menuitem',
      '.menu_item',
      '.food-item',
      '.dish',
      '.product-item',
      '[class*="menu"][class*="item"]'
    ];
    
    for (const selector of itemSelectors) {
      $(selector).each((_: any, element: any) => {
        const $item = $(element);
        
        // Try to find name
        const name = $item.find('h1, h2, h3, h4, .name, .title, .item-name, .dish-name').first().text().trim();
        
        // Try to find description
        const description = $item.find('.description, .desc, p, .item-description').first().text().trim();
        
        // Try to find price
        const priceText = $item.find('.price, .cost, [class*="price"]').first().text().trim();
        
        if (name && name.length > 0) {
          menuItems.push({
            name,
            description: description || undefined,
            price: priceText || undefined,
            category: 'Menu Item'
          });
        }
      });
      
      if (menuItems.length > 0) break; // Found items with this selector
    }
    
    return menuItems;
  }

  private static extractPhone($: any): string | undefined {
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
    
    const phoneSelectors = [
      '.phone',
      '.telephone',
      '.contact-phone',
      '.phone-number',
      '[href^="tel:"]'
    ];
    
    for (const selector of phoneSelectors) {
      const text = $(selector).text().trim();
      const match = text.match(phoneRegex);
      if (match) {
        return match[0];
      }
    }
    
    // Check all text for phone numbers
    const bodyText = $('body').text();
    const match = bodyText.match(phoneRegex);
    return match ? match[0] : undefined;
  }

  private static extractLocation($: any): string | undefined {
    const locationSelectors = [
      '.address',
      '.location',
      '.restaurant-address',
      '.contact-address',
      '[class*="address"]'
    ];
    
    for (const selector of locationSelectors) {
      const text = $(selector).first().text().trim();
      if (text && text.length > 10) {
        return text;
      }
    }
    
    return undefined;
  }

  private static extractHours($: any): string | undefined {
    const hourSelectors = [
      '.hours',
      '.business-hours',
      '.opening-hours',
      '.restaurant-hours',
      '[class*="hours"]'
    ];
    
    for (const selector of hourSelectors) {
      const text = $(selector).first().text().trim();
      if (text && text.length > 0) {
        return text;
      }
    }
    
    return undefined;
  }

  private static extractSpecialOffers($: any): string[] {
    const offers: string[] = [];
    
    const offerSelectors = [
      '.special',
      '.offer',
      '.promotion',
      '.deal',
      '.discount',
      '[class*="special"]',
      '[class*="offer"]'
    ];
    
    for (const selector of offerSelectors) {
      $(selector).each((_: any, element: any) => {
        const text = $(element).text().trim();
        if (text && text.length > 10) {
          offers.push(text);
        }
      });
    }
    
    return offers;
  }

  private static buildAIContext(restaurantName: string, menuItems: ScrapedMenuItem[], specialOffers?: string[]): string {
    let context = `Welcome to ${restaurantName}!\n\nMENU:\n`;
    
    menuItems.forEach((item, index) => {
      context += `${index + 1}. ${item.name}`;
      if (item.price) context += ` - ${item.price}`;
      if (item.description) context += `\n   ${item.description}`;
      context += '\n';
    });
    
    if (specialOffers && specialOffers.length > 0) {
      context += '\nSPECIAL OFFERS:\n';
      specialOffers.forEach(offer => {
        context += `• ${offer}\n`;
      });
    }
    
    return context;
  }

  // Additional scrapers for other platforms
  private static async scrapeSeamless(url: string): Promise<ScrapedMenuData> {
    // Seamless is owned by GrubHub, so similar structure
    return this.scrapeGrubHub(url);
  }

  private static async scrapePostmates(url: string): Promise<ScrapedMenuData> {
    // Postmates is now part of Uber Eats
    return this.scrapeUberEats(url);
  }
} 