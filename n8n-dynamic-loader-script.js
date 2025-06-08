// N8N Dynamic Restaurant Data Loader Script with Profile Storage
// Paste this into the "Demo Config Loader" code node

// Get the tenantId from the webhook payload
const webhookData = $input.first().json;
const tenantId = webhookData.tenantId || 'mario-restaurant'; // fallback for testing

// Your ChatChatGo API base URL
const API_BASE_URL = 'http://localhost:3000'; // Update this to your actual URL

try {
  // 1. First try to load STORED menu data from tenant profile
  let menuData = null;
  let dataSource = 'stored';
  
  try {
    console.log(`📖 Checking stored menu data for ${tenantId}...`);
    const storedMenuResponse = await fetch(`${API_BASE_URL}/api/tenants/${tenantId}/menu-data`);
    
    if (storedMenuResponse.ok) {
      const storedResult = await storedMenuResponse.json();
      if (storedResult.success && !storedResult.isStale) {
        menuData = {
          restaurantName: storedResult.menuData.restaurantName,
          menu: storedResult.menuData.menu,
          specialOffers: storedResult.menuData.specialOffers,
          aiContext: storedResult.menuData.aiContext
        };
        console.log(`✅ Using stored menu data (${storedResult.metadata.totalItems} items, ${storedResult.metadata.dataAge} old)`);
      } else if (storedResult.success && storedResult.isStale) {
        console.log(`⚠️ Stored data is stale (${storedResult.metadata.dataAge} old), will try to refresh`);
        // Keep stale data as fallback
        const staleData = {
          restaurantName: storedResult.menuData.restaurantName,
          menu: storedResult.menuData.menu,
          specialOffers: storedResult.menuData.specialOffers,
          aiContext: storedResult.menuData.aiContext
        };
        
        // Try to refresh the data
        await tryToRefreshStoredData(tenantId, storedResult.menuData.source);
        
        // Check if refresh was successful
        const refreshedResponse = await fetch(`${API_BASE_URL}/api/tenants/${tenantId}/menu-data`);
        if (refreshedResponse.ok) {
          const refreshedResult = await refreshedResponse.json();
          if (refreshedResult.success && !refreshedResult.isStale) {
            menuData = {
              restaurantName: refreshedResult.menuData.restaurantName,
              menu: refreshedResult.menuData.menu,
              specialOffers: refreshedResult.menuData.specialOffers,
              aiContext: refreshedResult.menuData.aiContext
            };
            dataSource = 'refreshed';
            console.log('✅ Successfully refreshed stored data');
          } else {
            menuData = staleData;
            dataSource = 'stale';
            console.log('⚠️ Using stale data (refresh failed)');
          }
        } else {
          menuData = staleData;
          dataSource = 'stale';
        }
      }
    } else {
      console.log('💡 No stored menu data found, will try other sources');
    }
  } catch (error) {
    console.log('⚠️ Error accessing stored menu data:', error.message);
  }

  // 2. If no stored data, try original API endpoint
  if (!menuData) {
    try {
      console.log('🔄 Trying original menu API...');
      const menuResponse = await fetch(`${API_BASE_URL}/api/tenants/menu/${tenantId}`);
      if (menuResponse.ok) {
        menuData = await menuResponse.json();
        dataSource = 'api';
        console.log('✅ Successfully loaded menu from original API');
      }
    } catch (error) {
      console.log('⚠️ Original API menu loading failed:', error.message);
    }
  }

  // 3. If still no data, try web scraping and store results
  if (!menuData || !menuData.menu || menuData.menu.length === 0) {
    console.log('🔍 Attempting web scraping...');
    
    // URLs to try (can be passed in webhook or configured per tenant)
    const possibleUrls = [
      webhookData.websiteUrl,
      webhookData.menuUrl,
      webhookData.ubereatsUrl,
      webhookData.doordashUrl,
      webhookData.grubhubUrl
    ].filter(Boolean);

    for (const url of possibleUrls) {
      try {
        console.log(`🌐 Scraping and storing: ${url}`);
        
        // Use the new endpoint that scrapes AND stores
        const scrapeAndStoreResponse = await fetch(`${API_BASE_URL}/api/tenants/${tenantId}/menu-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, forceRefresh: true })
        });
        
        if (scrapeAndStoreResponse.ok) {
          const result = await scrapeAndStoreResponse.json();
          if (result.success) {
            menuData = {
              restaurantName: result.menuData.restaurantName,
              menu: result.menuData.menu,
              specialOffers: result.menuData.specialOffers,
              aiContext: result.menuData.aiContext
            };
            dataSource = 'scraped-and-stored';
            console.log(`✅ Successfully scraped and stored ${result.metadata.itemsScraped} items from: ${url}`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Failed to scrape ${url}:`, error.message);
        continue;
      }
    }
  }

  // 4. Load Tenant Info
  let tenantInfo = {
    name: "Restaurant",
    phone: "N/A",
    address: "N/A",
    hours: "9 AM - 9 PM",
    timezone: "America/New_York"
  };
  
  try {
    const tenantResponse = await fetch(`${API_BASE_URL}/api/tenants/${tenantId}`);
    if (tenantResponse.ok) {
      const tenant = await tenantResponse.json();
      tenantInfo = {
        name: tenant.name,
        phone: tenant.phone || "N/A",
        address: tenant.address || "N/A", 
        hours: tenant.businessHours || "9 AM - 9 PM",
        timezone: tenant.timezone || "America/New_York"
      };
    }
  } catch (error) {
    console.log('Tenant info not available from API');
    if (menuData && menuData.restaurantName) {
      tenantInfo.name = menuData.restaurantName;
    }
  }

  // 5. Check if currently open
  const now = new Date();
  const currentHour = now.getHours();
  const isOpen = currentHour >= 9 && currentHour < 21;

  // 6. Ensure we have some menu data (final fallback)
  if (!menuData || !menuData.menu || menuData.menu.length === 0) {
    menuData = {
      restaurantName: tenantInfo.name,
      menu: [
        { name: "Today's Special", price: "Market Price", description: "Ask about our daily special!" },
        { name: "House Favorite", price: "Varies", description: "Our chef's recommendation" }
      ],
      specialOffers: ["Ask about our daily specials!"],
      aiContext: `Welcome to ${tenantInfo.name}! We're currently updating our menu system. Please ask about our available dishes and daily specials.`
    };
    dataSource = 'fallback';
  }

  // 7. Build comprehensive context
  const restaurantContext = {
    tenantId: tenantId,
    restaurantInfo: tenantInfo,
    isCurrentlyOpen: isOpen,
    currentTime: now.toISOString(),
    menu: menuData.menu,
    specialOffers: menuData.specialOffers,
    aiContext: menuData.aiContext,
    dataSource: dataSource,
    
    systemInstructions: `You are an AI assistant for ${tenantInfo.name}. 
    Current status: ${isOpen ? 'OPEN' : 'CLOSED'}
    Data source: ${dataSource}
    
    MENU CONTEXT:
    ${menuData.aiContext}
    
    SPECIAL OFFERS:
    ${menuData.specialOffers?.map(offer => typeof offer === 'string' ? offer : `${offer.name}: ${offer.description} ${offer.discount ? '(' + offer.discount + ')' : ''}`).join('\n') || 'No current offers'}
    
    INSTRUCTIONS:
    - Be friendly and helpful
    - If we're closed, inform customers of our hours: ${tenantInfo.hours}
    - Help customers navigate our menu and make recommendations
    ${dataSource === 'fallback' ? '- Our menu system is being updated, encourage customers to ask about specific dishes and daily specials' : ''}
    ${dataSource === 'stale' ? '- Menu information may be slightly outdated, verify current pricing and availability' : ''}
    ${dataSource === 'stored' || dataSource === 'refreshed' ? '- This menu is up-to-date and accurate' : ''}
    - For orders, collect: items, quantities, customizations, customer contact info
    - Always confirm order details before finalizing
    - If asked about items not on our menu, politely explain what we do offer
    
    Remember: You represent ${tenantInfo.name} - be knowledgeable about our offerings!`
  };

  // 8. Return the context
  return [{
    json: {
      ...restaurantContext,
      userMessage: webhookData.message || webhookData.text || "Hello!",
      originalWebhookData: webhookData,
      performance: {
        dataSource,
        menuItems: menuData.menu.length,
        loadTime: new Date().toISOString()
      }
    }
  }];

} catch (error) {
  console.error('❌ Error in menu loading system:', error);
  
  return [{
    json: {
      tenantId: tenantId,
      error: true,
      userMessage: webhookData.message || "Hello!",
      dataSource: 'error-fallback',
      systemInstructions: `You are an AI assistant for a restaurant. 
      I'm currently experiencing technical difficulties with our menu system.
      
      Please:
      - Apologize for the technical difficulty
      - Suggest the customer try again in a few minutes
      - Offer to take their contact information for a callback
      - Provide general information about dining and food
      - Ask if they'd like to visit our website or call us directly
      
      Be helpful and professional despite the technical issues.`,
      originalWebhookData: webhookData
    }
  }];
}

// Helper function to refresh stored data
async function tryToRefreshStoredData(tenantId, sourceUrl) {
  if (!sourceUrl) return;
  
  try {
    await fetch(`${API_BASE_URL}/api/tenants/${tenantId}/menu-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: sourceUrl, forceRefresh: true })
    });
  } catch (error) {
    console.log('Failed to refresh stored data:', error.message);
  }
} 