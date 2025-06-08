// N8N Dynamic Restaurant Data Loader Script
// Paste this into the "Demo Config Loader" code node

// Get the tenantId from the webhook payload
const webhookData = $input.first().json;
const tenantId = webhookData.tenantId || 'mario-restaurant'; // fallback for testing

// Your ChatChatGo API base URL - CORRECTED PORT
const API_BASE_URL = 'http://localhost:3006'; // Your app runs on port 3006, not 3000

try {
  // 1. Load Menu Data - CORRECTED ENDPOINT
  const menuResponse = await fetch(`${API_BASE_URL}/api/tenants/${tenantId}/menu-data`);
  if (!menuResponse.ok) {
    throw new Error(`Menu API failed: ${menuResponse.status}`);
  }
  const menuData = await menuResponse.json();
  
  // 2. Load Tenant Info - CORRECTED ENDPOINT
  let tenantInfo = {
    name: "Restaurant", // fallback
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
        name: tenant.name || tenant.displayName || "Restaurant",
        phone: tenant.phone || tenant.owner?.phone || "N/A",
        address: tenant.address || tenant.owner?.email || "N/A", 
        hours: tenant.businessHours || "9 AM - 9 PM",
        timezone: tenant.timezone || "America/New_York"
      };
    }
  } catch (error) {
    console.log('Tenant info not available, using menu data');
    // Use menu data if available
    if (menuData.restaurantName) {
      tenantInfo.name = menuData.restaurantName;
    }
  }

  // 3. Enhanced business hours check
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday
  
  // Basic implementation - can be enhanced with actual business hours data
  let isOpen = false;
  if (currentDay >= 1 && currentDay <= 6) { // Monday-Saturday
    isOpen = currentHour >= 9 && currentHour < 21; // 9 AM to 9 PM
  } else { // Sunday
    isOpen = currentHour >= 10 && currentHour < 20; // 10 AM to 8 PM
  }

  // 4. Build the complete context for the AI
  const restaurantContext = {
    tenantId: tenantId,
    restaurantInfo: tenantInfo,
    isCurrentlyOpen: isOpen,
    currentTime: now.toISOString(),
    currentDay: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDay],
    
    // Menu data structure (adapt based on your actual API response)
    menu: menuData.menu || menuData.menuItems || [],
    categories: menuData.categories || [],
    specialOffers: menuData.specialOffers || [],
    aiContext: menuData.aiContext || '', // Pre-formatted context string
    
    // Voice command context
    voiceCommand: webhookData.data?.command || '',
    voiceDetected: webhookData.data?.voice_detected || false,
    confidence: webhookData.data?.confidence || 0,
    
    // System instructions for the AI
    systemInstructions: `You are an AI assistant for ${tenantInfo.name}. 
    Current status: ${isOpen ? 'OPEN' : 'CLOSED'} (${now.toLocaleTimeString()})
    Day: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDay]}
    
    MENU CONTEXT:
    ${menuData.aiContext || 'Menu data loading...'}
    
    AVAILABLE CATEGORIES:
    ${menuData.categories?.map(cat => `- ${cat.name}: ${cat.description || ''}`).join('\n') || 'Categories loading...'}
    
    SPECIAL OFFERS:
    ${menuData.specialOffers?.map(offer => `- ${offer.name}: ${offer.description} (${offer.discount})`).join('\n') || 'No current offers'}
    
    VOICE INTEGRATION:
    - Voice command detected: ${webhookData.data?.voice_detected ? 'YES' : 'NO'}
    - Command: "${webhookData.data?.command || 'N/A'}"
    - Confidence: ${(webhookData.data?.confidence * 100 || 0).toFixed(1)}%
    
    INSTRUCTIONS:
    - Be friendly and helpful
    - If we're closed, inform customers of our hours: ${tenantInfo.hours}
    - Help customers navigate our menu and make recommendations
    - For voice commands, provide concise but comprehensive responses
    - Handle analytics requests: "Show me menu analytics", "What's today's revenue?"
    - For orders, collect: items, quantities, customizations, customer contact info
    - Always confirm order details before finalizing
    - If asked about items not on our menu, politely explain what we do offer
    
    ANALYTICS COMMANDS:
    - Menu analytics: Provide insights on popular items, categories
    - Revenue data: Show sales trends, daily/weekly comparisons
    - Customer insights: Analyze ordering patterns
    
    Remember: You represent ${tenantInfo.name} - be knowledgeable about our offerings!`
  };

  // 5. Return the context for the next node
  return [{
    json: {
      ...restaurantContext,
      // Add the original message for the AI to respond to
      userMessage: webhookData.message || webhookData.text || webhookData.data?.command || "Hello!",
      messageType: webhookData.type || 'text',
      // Include original webhook data for reference
      originalWebhookData: webhookData,
      // Success flag
      dataLoaded: true,
      timestamp: new Date().toISOString()
    }
  }];

} catch (error) {
  console.error('Error loading restaurant data:', error);
  
  // Enhanced fallback response if API calls fail
  return [{
    json: {
      tenantId: tenantId,
      error: true,
      errorMessage: error.message,
      dataLoaded: false,
      userMessage: webhookData.message || webhookData.data?.command || "Hello!",
      messageType: webhookData.type || 'text',
      systemInstructions: `You are an AI assistant for a restaurant. 
      I'm currently unable to load the specific menu and restaurant details due to a technical issue.
      
      Error: ${error.message}
      
      Please apologize for the technical difficulty and ask the customer to try again in a moment.
      You can still have a general conversation about food and dining, but cannot provide specific menu information right now.
      
      If this is a voice command about analytics or restaurant data, explain that the system is temporarily unavailable.`,
      originalWebhookData: webhookData,
      timestamp: new Date().toISOString()
    }
  }];
} 