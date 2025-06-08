import { Tenant, MenuItem, BusinessInfo, OrderingRules } from '@/types/tenant';

// N8N API Configuration
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;

interface N8NWorkflowTemplate {
  name: string;
  nodes: any[];
  connections: any;
  settings: any;
}

export class N8NWorkflowManager {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    if (!N8N_API_KEY) {
      throw new Error('N8N_API_KEY environment variable is required');
    }
    this.apiKey = N8N_API_KEY;
    this.baseUrl = N8N_BASE_URL;
  }

  /**
   * Create a customized N8N workflow for a restaurant tenant
   */
  async createRestaurantWorkflow(tenant: Tenant): Promise<{
    workflowId: string;
    webhookUrl: string;
  }> {
    try {
      const template = this.generateRestaurantWorkflowTemplate(tenant);
      
      // Create workflow in N8N
      const workflow = await this.createWorkflow(template);
      
      // Activate the workflow
      await this.activateWorkflow(workflow.id);
      
      // Get webhook URL
      const webhookUrl = await this.getWebhookUrl(workflow.id);
      
      console.log(`[N8N] Created workflow for ${tenant.name}: ${workflow.id}`);
      
      return {
        workflowId: workflow.id,
        webhookUrl
      };
      
    } catch (error) {
      console.error(`[N8N] Failed to create workflow for ${tenant.name}:`, error);
      throw error;
    }
  }

  /**
   * Generate a restaurant-specific N8N workflow template
   */
  private generateRestaurantWorkflowTemplate(tenant: Tenant): N8NWorkflowTemplate {
    const businessInfo = this.extractBusinessInfo(tenant);
    const menu = this.extractMenu(tenant);
    const orderingRules = this.extractOrderingRules(tenant);

    return {
      name: `${tenant.name} - Restaurant AI Agent`,
      settings: {
        saveDataErrorExecution: 'all',
        saveDataSuccessExecution: 'all',
        saveManualExecutions: true,
        callerPolicy: 'workflowsFromSameOwner',
        errorWorkflow: '',
        timezone: tenant.settings.timezone
      },
      nodes: [
        // 1. Webhook Trigger
        {
          parameters: {
            httpMethod: 'POST',
            path: `restaurant-${tenant.id}`,
            responseMode: 'responseNode',
            options: {}
          },
          id: 'webhook-trigger',
          name: 'Customer Message',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
          webhookId: `restaurant-${tenant.id}`
        },

        // 2. Business Hours Check
        {
          parameters: {
            functionCode: `
// Business Hours Check
const currentTime = new Date();
const businessHours = ${JSON.stringify(tenant.settings.businessHours)};
const timezone = '${tenant.settings.timezone}';

// Convert to business timezone
const businessTime = new Date(currentTime.toLocaleString("en-US", {timeZone: timezone}));
const currentHour = businessTime.getHours();
const currentDay = businessTime.getDay(); // 0 = Sunday

const todayHours = businessHours[Object.keys(businessHours)[currentDay]];
const isOpen = todayHours.isOpen && 
              currentHour >= parseInt(todayHours.open.split(':')[0]) && 
              currentHour < parseInt(todayHours.close.split(':')[0]);

return [{
  json: {
    isOpen,
    currentTime: businessTime.toISOString(),
    message: $('Customer Message').first().json.message,
    customerInfo: $('Customer Message').first().json.customerInfo
  }
}];`
          },
          id: 'business-hours-check',
          name: 'Check Business Hours',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [460, 300]
        },

        // 3. Closed Hours Response
        {
          parameters: {
            functionCode: `
const businessHours = ${JSON.stringify(tenant.settings.businessHours)};
const businessInfo = ${JSON.stringify(businessInfo)};

return [{
  json: {
    response: \`Hi! Thanks for contacting \${businessInfo.name}. We're currently closed. Our hours are:

\${Object.entries(businessHours).map(([day, hours]) => 
  hours.isOpen ? \`\${day}: \${hours.open} - \${hours.close}\` : \`\${day}: Closed\`
).join('\\n')}

You can place an order for when we reopen! How can I help you?\`,
    shouldContinue: false
  }
}];`
          },
          id: 'closed-response',
          name: 'Closed Hours Response',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [680, 200]
        },

        // 4. Menu & Context Loader
        {
          parameters: {
            functionCode: `
const menu = ${JSON.stringify(menu)};
const businessInfo = ${JSON.stringify(businessInfo)};
const orderingRules = ${JSON.stringify(orderingRules)};

// Create rich context for the AI
const context = \`
RESTAURANT: \${businessInfo.name}
LOCATION: \${businessInfo.address}
PHONE: \${businessInfo.phone}
SPECIALTIES: \${businessInfo.specialties.join(', ')}
AVERAGE ORDER TIME: \${businessInfo.averageOrderTime} minutes

MENU CATEGORIES:
\${[...new Set(menu.map(item => item.category))].map(category => {
  const items = menu.filter(item => item.category === category && item.available);
  return \`\${category.toUpperCase()}:
\${items.map(item => \`- \${item.name}: $\${item.price.toFixed(2)} - \${item.description}\`).join('\\n')}\`;
}).join('\\n\\n')}

ORDERING RULES:
- Modifications allowed: \${orderingRules.allowModifications ? 'Yes' : 'No'}
- Max items per order: \${orderingRules.maxItemsPerOrder}
- Advance ordering: \${orderingRules.advanceOrderHours} hours
- Cancellation window: \${orderingRules.cancellationWindow} minutes

IMPORTANT: You are an expert assistant for this specific restaurant. Always be helpful, accurate about menu items and prices, and guide customers toward placing orders.
\`;

return [{
  json: {
    context,
    message: $('Business Hours Check').first().json.message,
    customerInfo: $('Business Hours Check').first().json.customerInfo,
    menu,
    businessInfo,
    orderingRules
  }
}];`
          },
          id: 'context-loader',
          name: 'Load Restaurant Context',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [680, 400]
        },

        // 5. OpenAI Chat
        {
          parameters: {
            model: 'gpt-4',
            messages: {
              messageType: 'multipleMessages',
              values: [
                {
                  role: 'system',
                  content: `={{$node["Load Restaurant Context"].json["context"]}}`
                },
                {
                  role: 'user', 
                  content: `={{$node["Load Restaurant Context"].json["message"]}}`
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
          position: [900, 400]
        },

        // 6. Order Detection & Processing
        {
          parameters: {
            functionCode: `
const aiResponse = $('AI Restaurant Assistant').first().json.message.content;
const menu = $('Load Restaurant Context').first().json.menu;

// Simple order detection (in production, use more sophisticated NLP)
const orderIndicators = ['order', 'get', 'want', 'like', 'pizza', 'burger', 'drink'];
const containsOrderIndicator = orderIndicators.some(indicator => 
  aiResponse.toLowerCase().includes(indicator)
);

// Extract potential menu items mentioned
const mentionedItems = menu.filter(item => 
  aiResponse.toLowerCase().includes(item.name.toLowerCase())
);

return [{
  json: {
    response: aiResponse,
    containsOrder: containsOrderIndicator,
    mentionedItems,
    shouldProcessOrder: mentionedItems.length > 0,
    timestamp: new Date().toISOString()
  }
}];`
          },
          id: 'order-processor',
          name: 'Process Order Intent',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [1120, 400]
        },

        // 7. Response Formatter
        {
          parameters: {
            functionCode: `
const orderData = $('Process Order Intent').first().json;
const businessInfo = $('Load Restaurant Context').first().json.businessInfo;

// Format final response
let finalResponse = orderData.response;

// Add order summary if order detected
if (orderData.shouldProcessOrder && orderData.mentionedItems.length > 0) {
  const orderSummary = \`

ORDER SUMMARY:
\${orderData.mentionedItems.map(item => \`- \${item.name}: $\${item.price.toFixed(2)}\`).join('\\n')}

Would you like to proceed with this order? Please confirm or let me know if you'd like to make any changes!\`;
  
  finalResponse += orderSummary;
}

// Add contact info for complex orders
if (orderData.containsOrder) {
  finalResponse += \`

For complex orders or immediate assistance, call us at \${businessInfo.phone}!\`;
}

return [{
  json: {
    response: finalResponse,
    orderDetected: orderData.shouldProcessOrder,
    items: orderData.mentionedItems,
    conversationId: $('Customer Message').first().json.conversationId || 'unknown'
  }
}];`
          },
          id: 'response-formatter',
          name: 'Format Response',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [1340, 400]
        },

        // 8. Webhook Response
        {
          parameters: {
            responseBody: `={{JSON.stringify($node["Format Response"].json)}}`,
            options: {
              responseHeaders: {
                'Content-Type': 'application/json'
              }
            }
          },
          id: 'webhook-response',
          name: 'Send Response',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [1560, 400]
        }
      ],
      connections: {
        'Customer Message': {
          main: [
            [
              {
                node: 'Check Business Hours',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Check Business Hours': {
          main: [
            [
              {
                node: 'Closed Hours Response',
                type: 'main',
                index: 0,
                filters: {
                  conditions: [
                    {
                      leftValue: '={{$json.isOpen}}',
                      rightValue: false,
                      operator: {
                        type: 'boolean',
                        operation: 'equals'
                      }
                    }
                  ]
                }
              },
              {
                node: 'Load Restaurant Context',
                type: 'main',
                index: 0,
                filters: {
                  conditions: [
                    {
                      leftValue: '={{$json.isOpen}}',
                      rightValue: true,
                      operator: {
                        type: 'boolean',
                        operation: 'equals'
                      }
                    }
                  ]
                }
              }
            ]
          ]
        },
        'Closed Hours Response': {
          main: [
            [
              {
                node: 'Send Response',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Load Restaurant Context': {
          main: [
            [
              {
                node: 'AI Restaurant Assistant',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'AI Restaurant Assistant': {
          main: [
            [
              {
                node: 'Process Order Intent',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Process Order Intent': {
          main: [
            [
              {
                node: 'Format Response',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Format Response': {
          main: [
            [
              {
                node: 'Send Response',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      }
    };
  }

  /**
   * Extract business information from tenant
   */
  private extractBusinessInfo(tenant: Tenant): BusinessInfo {
    return {
      name: tenant.name,
      address: tenant.owner?.email || 'Address not provided',
      phone: tenant.owner?.phone || 'Phone not provided',
      website: `https://${tenant.slug}.example.com`,
      description: `${tenant.industry} business`,
      specialties: tenant.industry === 'restaurant' ? ['Fresh ingredients', 'Fast service'] : ['Quality products'],
      averageOrderTime: 15,
      deliveryRadius: 5,
      minimumOrder: 10
    };
  }

  /**
   * Extract menu from tenant (mock for now)
   */
  private extractMenu(tenant: Tenant): MenuItem[] {
    // In production, this would come from tenant.config.n8nWorkflow.businessContext.menu
    // For now, generate a sample menu based on tenant name
    const sampleMenus = {
      'restaurant': [
        {
          id: '1',
          name: 'Margherita Pizza',
          description: 'Fresh tomato, mozzarella, basil',
          price: 16.99,
          category: 'Pizza',
          available: true,
          allergens: ['dairy', 'gluten']
        },
        {
          id: '2', 
          name: 'Caesar Salad',
          description: 'Romaine lettuce, parmesan, croutons',
          price: 12.99,
          category: 'Salads',
          available: true,
          allergens: ['dairy', 'gluten']
        },
        {
          id: '3',
          name: 'Craft Beer',
          description: 'Local brewery selection',
          price: 6.99,
          category: 'Beverages', 
          available: true,
          allergens: ['gluten']
        }
      ]
    };

    return sampleMenus.restaurant;
  }

  /**
   * Extract ordering rules from tenant
   */
  private extractOrderingRules(tenant: Tenant): OrderingRules {
    return {
      allowModifications: true,
      maxItemsPerOrder: 20,
      advanceOrderHours: 24,
      cancellationWindow: 30,
      requirePhoneVerification: false
    };
  }

  /**
   * Create workflow in N8N
   */
  private async createWorkflow(template: N8NWorkflowTemplate): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.apiKey
      },
      body: JSON.stringify(template)
    });

    if (!response.ok) {
      throw new Error(`Failed to create N8N workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Activate workflow
   */
  private async activateWorkflow(workflowId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to activate N8N workflow: ${response.statusText}`);
    }
  }

  /**
   * Get webhook URL for workflow
   */
  private async getWebhookUrl(workflowId: string): Promise<string> {
    // Use unified webhook endpoint - tenant info will be in payload
    return process.env.N8N_WEBHOOK_BASE_URL || `${this.baseUrl}/webhook/restaurant-${workflowId}`;
  }

  /**
   * Update existing workflow with new tenant data
   */
  async updateWorkflow(tenantId: string, tenant: Tenant): Promise<void> {
    // Implementation for updating existing workflows
    console.log(`[N8N] Updating workflow for tenant ${tenantId}`);
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}`, {
      method: 'DELETE',
      headers: {
        'X-N8N-API-KEY': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete N8N workflow: ${response.statusText}`);
    }
  }
} 