import { Tenant } from '@/types/tenant';

// N8N Dynamic Template System - Solves the 5-15 workflow limit
export class N8NDynamicTemplates {
  
  /**
   * Master Restaurant Workflow Template
   * ONE workflow handles ALL restaurants by loading data dynamically
   */
  static createMasterRestaurantWorkflow() {
    return {
      name: "🍕 Master Restaurant AI Agent",
      settings: {
        saveDataErrorExecution: 'all',
        saveDataSuccessExecution: 'all',
        saveManualExecutions: true,
        timezone: 'UTC'
      },
      nodes: [
        // 1. Webhook Trigger (handles all restaurants)
        {
          parameters: {
            httpMethod: 'POST',
            path: 'restaurant-master',
            responseMode: 'responseNode',
            options: {}
          },
          id: 'webhook-trigger',
          name: 'Customer Message',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300]
        },

        // 2. Extract Tenant ID and Validate
        {
          parameters: {
            functionCode: `
// Extract tenant ID from incoming request
const tenantId = $('Customer Message').first().json.tenantId;
const message = $('Customer Message').first().json.message;

if (!tenantId) {
  throw new Error('Missing tenantId in request');
}

return [{
  json: {
    tenantId,
    message,
    customerInfo: $('Customer Message').first().json.customerInfo,
    conversationId: $('Customer Message').first().json.conversationId
  }
}];`
          },
          id: 'extract-tenant',
          name: 'Extract Tenant Info',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [460, 300]
        },

        // 3. Load Restaurant Data Dynamically (API call to your system)
        {
          parameters: {
            url: `={{$node["Extract Tenant Info"].json["tenantId"]}}`,
            authentication: 'genericCredentialType',
            genericAuthType: 'httpHeaderAuth',
            options: {
              timeout: 10000,
              fullResponse: false
            }
          },
          id: 'load-restaurant-data',
          name: 'Load Restaurant Data',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [680, 300],
          credentials: {
            httpHeaderAuth: {
              id: 'restaurant-api-auth',
              name: 'Restaurant API Auth'
            }
          }
        },

        // 4. Business Hours Check (Dynamic)
        {
          parameters: {
            functionCode: `
const restaurantData = $('Load Restaurant Data').first().json;
const tenantInfo = $('Extract Tenant Info').first().json;

// Get current time in restaurant's timezone
const timezone = restaurantData.settings.timezone;
const now = new Date();
const restaurantTime = new Date(now.toLocaleString("en-US", {timeZone: timezone}));

const currentHour = restaurantTime.getHours();
const currentDay = restaurantTime.getDay();
const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const today = dayNames[currentDay];

const todayHours = restaurantData.settings.businessHours[today];
const isOpen = todayHours?.isOpen && 
              currentHour >= parseInt(todayHours.open.split(':')[0]) && 
              currentHour < parseInt(todayHours.close.split(':')[0]);

return [{
  json: {
    ...tenantInfo,
    restaurantData,
    isOpen,
    currentTime: restaurantTime.toISOString(),
    todayHours
  }
}];`
          },
          id: 'check-hours',
          name: 'Check Business Hours',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [900, 300]
        },

        // 5. Branch: Closed Hours Response
        {
          parameters: {
            conditions: {
              boolean: [
                {
                  value1: `={{$node["Check Business Hours"].json["isOpen"]}}`,
                  operation: 'equal',
                  value2: false
                }
              ]
            }
          },
          id: 'if-closed',
          name: 'If Restaurant Closed',
          type: 'n8n-nodes-base.if',
          typeVersion: 1,
          position: [1120, 200]
        },

        // 6. Closed Response
        {
          parameters: {
            functionCode: `
const data = $('Check Business Hours').first().json;
const restaurant = data.restaurantData;

const hoursText = Object.entries(restaurant.settings.businessHours)
  .map(([day, hours]) => hours.isOpen ? \`\${day}: \${hours.open} - \${hours.close}\` : \`\${day}: Closed\`)
  .join('\\n');

return [{
  json: {
    response: \`Hi! Thanks for contacting \${restaurant.name}. We're currently closed. 

Our hours are:
\${hoursText}

You can still place an order for when we reopen! What would you like?\`,
    orderDetected: false,
    items: []
  }
}];`
          },
          id: 'closed-response',
          name: 'Generate Closed Response',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [1340, 100]
        },

        // 7. Load Menu Context (Dynamic)
        {
          parameters: {
            functionCode: `
const data = $('Check Business Hours').first().json;
const restaurant = data.restaurantData;

// Build dynamic menu context
const menuUrl = \`YOUR_API_BASE/api/tenants/\${data.tenantId}/menu\`;

// For now, use restaurant type to determine menu template
// In production, this would be an API call to get actual menu
const menuTemplates = {
  'italian': [
    { name: 'Margherita Pizza', price: 16.99, category: 'Pizza', description: 'Fresh tomato, mozzarella, basil' },
    { name: 'Pepperoni Pizza', price: 18.99, category: 'Pizza', description: 'Classic pepperoni with mozzarella' },
    { name: 'Caesar Salad', price: 12.99, category: 'Salads', description: 'Romaine, parmesan, croutons' },
    { name: 'Tiramisu', price: 8.99, category: 'Desserts', description: 'Traditional Italian dessert' }
  ],
  'mexican': [
    { name: 'Chicken Tacos', price: 12.99, category: 'Tacos', description: 'Grilled chicken with fresh salsa' },
    { name: 'Beef Burrito', price: 14.99, category: 'Burritos', description: 'Seasoned beef with rice and beans' },
    { name: 'Guacamole', price: 8.99, category: 'Appetizers', description: 'Fresh avocado dip with chips' }
  ],
  'default': [
    { name: 'House Special', price: 15.99, category: 'Entrees', description: 'Chef\\'s recommended dish' },
    { name: 'Soft Drink', price: 2.99, category: 'Beverages', description: 'Assorted sodas' }
  ]
};

// Determine restaurant cuisine type from name/description
const cuisineType = restaurant.name.toLowerCase().includes('italian') ? 'italian' :
                   restaurant.name.toLowerCase().includes('mexican') ? 'mexican' : 'default';

const menu = menuTemplates[cuisineType] || menuTemplates['default'];

// Create rich context prompt
const context = \`You are an expert AI assistant for \${restaurant.name}, a \${restaurant.industry} business.

RESTAURANT INFO:
- Name: \${restaurant.name}
- Address: \${restaurant.contact?.address || 'Location available upon request'}
- Phone: \${restaurant.contact?.phone || 'Call for info'}
- Currently: OPEN (verified)

MENU:
\${menu.map(item => 
  \`- \${item.name}: $\${item.price} (\${item.category}) - \${item.description}\`
).join('\\n')}

ORDERING GUIDELINES:
- Always mention exact prices when discussing menu items
- Ask clarifying questions for customizations
- Guide customers toward completing their order
- Be enthusiastic about the food and restaurant
- If they want to order, collect all details and create an order summary

IMPORTANT: You represent this specific restaurant. Be knowledgeable about the menu and prices above.\`;

return [{
  json: {
    ...data,
    menu,
    context,
    cuisineType
  }
}];`
          },
          id: 'load-menu',
          name: 'Load Menu Context',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [1340, 400]
        },

        // 8. OpenAI Chat (Dynamic Context)
        {
          parameters: {
            model: 'gpt-4',
            messages: {
              messageType: 'multipleMessages',
              values: [
                {
                  role: 'system',
                  content: `={{$node["Load Menu Context"].json["context"]}}`
                },
                {
                  role: 'user',
                  content: `={{$node["Load Menu Context"].json["message"]}}`
                }
              ]
            },
            options: {
              temperature: 0.3,
              maxTokens: 500
            }
          },
          id: 'openai-chat',
          name: 'AI Restaurant Assistant',
          type: '@n8n/n8n-nodes-langchain.openAi',
          typeVersion: 1,
          position: [1560, 400]
        },

        // 9. Order Detection & Processing
        {
          parameters: {
            functionCode: `
const aiResponse = $('AI Restaurant Assistant').first().json.message.content;
const menu = $('Load Menu Context').first().json.menu;
const restaurantData = $('Load Menu Context').first().json.restaurantData;

// Enhanced order detection
const orderKeywords = ['order', 'get', 'want', 'like', 'buy', 'purchase', 'take'];
const containsOrderIntent = orderKeywords.some(keyword => 
  aiResponse.toLowerCase().includes(keyword)
);

// Find mentioned menu items
const mentionedItems = menu.filter(item => 
  aiResponse.toLowerCase().includes(item.name.toLowerCase()) ||
  item.name.toLowerCase().split(' ').some(word => 
    aiResponse.toLowerCase().includes(word) && word.length > 3
  )
);

// Calculate total if items detected
const orderTotal = mentionedItems.reduce((sum, item) => sum + item.price, 0);

return [{
  json: {
    response: aiResponse,
    orderDetected: mentionedItems.length > 0,
    items: mentionedItems,
    orderTotal: orderTotal.toFixed(2),
    restaurantName: restaurantData.name,
    tenantId: $('Load Menu Context').first().json.tenantId
  }
}];`
          },
          id: 'process-order',
          name: 'Process Order Intent',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [1780, 400]
        },

        // 10. Final Response
        {
          parameters: {
            responseBody: `={{JSON.stringify($node["Process Order Intent"].json)}}`,
            options: {
              responseHeaders: {
                'Content-Type': 'application/json'
              }
            }
          },
          id: 'final-response',
          name: 'Send Response',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [2000, 400]
        },

        // 11. Closed Response Webhook
        {
          parameters: {
            responseBody: `={{JSON.stringify($node["Generate Closed Response"].json)}}`,
            options: {
              responseHeaders: {
                'Content-Type': 'application/json'
              }
            }
          },
          id: 'closed-webhook-response',
          name: 'Send Closed Response',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [1560, 100]
        }
      ],
      connections: {
        'Customer Message': {
          main: [[{ node: 'Extract Tenant Info', type: 'main', index: 0 }]]
        },
        'Extract Tenant Info': {
          main: [[{ node: 'Load Restaurant Data', type: 'main', index: 0 }]]
        },
        'Load Restaurant Data': {
          main: [[{ node: 'Check Business Hours', type: 'main', index: 0 }]]
        },
        'Check Business Hours': {
          main: [[{ node: 'If Restaurant Closed', type: 'main', index: 0 }]]
        },
        'If Restaurant Closed': {
          main: [
            [{ node: 'Generate Closed Response', type: 'main', index: 0 }], // true (closed)
            [{ node: 'Load Menu Context', type: 'main', index: 0 }]        // false (open)
          ]
        },
        'Generate Closed Response': {
          main: [[{ node: 'Send Closed Response', type: 'main', index: 0 }]]
        },
        'Load Menu Context': {
          main: [[{ node: 'AI Restaurant Assistant', type: 'main', index: 0 }]]
        },
        'AI Restaurant Assistant': {
          main: [[{ node: 'Process Order Intent', type: 'main', index: 0 }]]
        },
        'Process Order Intent': {
          main: [[{ node: 'Send Response', type: 'main', index: 0 }]]
        }
      }
    };
  }

  /**
   * Additional template workflows for different business types
   */
  static createMasterRetailWorkflow() {
    // Similar structure but for retail businesses
    return {
      name: "🛍️ Master Retail AI Agent",
      // ... similar structure with retail-specific logic
    };
  }

  static createMasterHealthcareWorkflow() {
    return {
      name: "🏥 Master Healthcare AI Agent", 
      // ... similar structure with healthcare-specific logic
    };
  }
}

/**
 * Workflow Templates Strategy:
 * 
 * Instead of 1 workflow per restaurant (hitting 5-15 limit):
 * 
 * Template 1: Master Restaurant Agent (handles ALL restaurants)
 * Template 2: Master Retail Agent (handles ALL retail stores)  
 * Template 3: Master Healthcare Agent (handles ALL healthcare)
 * Template 4: Premium Custom Agent (for high-value clients)
 * Template 5: Fallback/Testing Agent
 * 
 * = Only 5 workflows total, infinite restaurants! 🚀
 */ 