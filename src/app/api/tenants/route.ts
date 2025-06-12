import { NextRequest, NextResponse } from 'next/server';
import { CreateTenantRequest, Tenant, TenantScrapedMenuData } from '@/types/tenant';
import { SubscriptionPlan } from "@/types";
import { TenantStorage } from '@/lib/tenant-storage';

// Global storage for menu data (same as used by menu APIs)
declare global {
  var tenantMenuData: Record<string, TenantScrapedMenuData>;
}

if (!global.tenantMenuData) {
  global.tenantMenuData = {};
}

// Mock database for demo purposes (now using persistent storage)
const mockTenants: Tenant[] = [
  {
    id: 'mario-restaurant',
    name: "Mario's Italian Restaurant",
    slug: 'mario-restaurant',
    industry: 'restaurant',
    status: 'active',
    subscription: 'growth' as SubscriptionPlan,
    settings: {
      aiModel: 'gpt-3.5-turbo',
      systemPrompt: `You are a helpful restaurant assistant for Mario's Italian Restaurant. You help customers with menu inquiries, reservations, hours, and general questions about our authentic Italian cuisine. Be warm, welcoming, and knowledgeable about Italian food.`,
      temperature: 0.7,
      maxTokens: 500,
      voiceEnabled: true,
      voiceId: '21m00Tcm4TlvDq8ikWAM',
      voiceSettings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
      welcomeMessage: "Welcome to Mario's! I'm here to help you with our menu, reservations, or any questions about our restaurant. How can I assist you today?",
      fallbackMessage: "I apologize, but I didn't understand your request. Could you please rephrase your question about our restaurant?",
      timezone: 'America/New_York',
      language: 'en',
      businessHours: {
        monday: { open: true, openTime: '11:00', closeTime: '22:00' },
        tuesday: { open: true, openTime: '11:00', closeTime: '22:00' },
        wednesday: { open: true, openTime: '11:00', closeTime: '22:00' },
        thursday: { open: true, openTime: '11:00', closeTime: '22:00' },
        friday: { open: true, openTime: '11:00', closeTime: '23:00' },
        saturday: { open: true, openTime: '11:00', closeTime: '23:00' },
        sunday: { open: true, openTime: '12:00', closeTime: '21:00' },
      },
      integrations: {},
      n8nEnabled: false,
    },
    branding: {
      primaryColor: '#e53e3e',
      secondaryColor: '#38a169',
      accentColor: '#f6e05e',
      fontFamily: 'Inter',
      widgetPosition: 'bottom-right',
      widgetSize: 'medium',
      borderRadius: 12,
    },
    owner: {
      id: 'owner-mario',
      email: 'mario@italianrestaurant.com',
      name: 'Mario Rossi',
      phone: '+1-555-0123',
      role: 'owner',
    },
    features: {
      voiceChat: true,
      textChat: true,
      fileUpload: true,
      analytics: true,
      leadCapture: true,
      appointments: true,
      payments: true,
      multiLanguage: true,
      webhooks: true,
      apiAccess: true,
      whiteLabel: false,
      customDomain: false,
      maxConversationsPerMonth: 2000,
      maxUsersPerMonth: 1000,
      maxStorageGB: 5,
    },
    usage: {
      currentMonth: {
        conversations: 245,
        uniqueUsers: 189,
        voiceMinutes: 432,
        storageUsedGB: 2.1,
        apiCalls: 1834,
      },
      lastMonth: {
        conversations: 198,
        uniqueUsers: 156,
        voiceMinutes: 378,
        storageUsedGB: 1.8,
        apiCalls: 1456,
      },
      totalAllTime: {
        conversations: 2341,
        uniqueUsers: 1876,
        voiceMinutes: 4532,
        leads: 123,
      },
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: 'techstore-retail',
    name: 'TechStore Electronics',
    slug: 'techstore-retail',
    industry: 'retail',
    status: 'active',
    subscription: 'starter' as const,
    settings: {
      aiModel: 'gpt-3.5-turbo',
      systemPrompt: `You are a helpful customer service assistant for TechStore Electronics. You help customers with product information, availability, technical specs, warranties, and general shopping questions. Be knowledgeable, helpful, and professional.`,
      temperature: 0.7,
      maxTokens: 500,
      voiceEnabled: true,
      voiceId: '21m00Tcm4TlvDq8ikWAM',
      voiceSettings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
      welcomeMessage: "Hello! Welcome to TechStore Electronics. I'm here to help you find the perfect tech products and answer any questions. What can I help you with today?",
      fallbackMessage: "I'm sorry, I didn't quite catch that. Could you please ask me about our products, services, or store information?",
      timezone: 'America/New_York',
      language: 'en',
      businessHours: {
        monday: { open: true, openTime: '09:00', closeTime: '17:00' },
        tuesday: { open: true, openTime: '09:00', closeTime: '17:00' },
        wednesday: { open: true, openTime: '09:00', closeTime: '17:00' },
        thursday: { open: true, openTime: '09:00', closeTime: '17:00' },
        friday: { open: true, openTime: '09:00', closeTime: '17:00' },
        saturday: { open: false },
        sunday: { open: false },
      },
      integrations: {},
      n8nEnabled: false,
    },
    branding: {
      primaryColor: '#3182ce',
      secondaryColor: '#805ad5',
      accentColor: '#ed8936',
      fontFamily: 'Roboto',
      widgetPosition: 'bottom-right',
      widgetSize: 'large',
      borderRadius: 8,
    },
    owner: {
      id: 'owner-tech',
      email: 'admin@techstore.com',
      name: 'Sarah Johnson',
      role: 'owner',
    },
    features: {
      voiceChat: true,
      textChat: true,
      fileUpload: true,
      analytics: true,
      leadCapture: true,
      appointments: false,
      payments: false,
      multiLanguage: false,
      webhooks: false,
      apiAccess: false,
      whiteLabel: false,
      customDomain: false,
      maxConversationsPerMonth: 500,
      maxUsersPerMonth: 200,
      maxStorageGB: 1,
    },
    usage: {
      currentMonth: {
        conversations: 89,
        uniqueUsers: 67,
        voiceMinutes: 156,
        storageUsedGB: 0.8,
        apiCalls: 534,
      },
      lastMonth: {
        conversations: 76,
        uniqueUsers: 54,
        voiceMinutes: 123,
        storageUsedGB: 0.6,
        apiCalls: 445,
      },
      totalAllTime: {
        conversations: 823,
        uniqueUsers: 634,
        voiceMinutes: 1234,
        leads: 45,
      },
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  },
];

// GET /api/tenants - List all tenants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const industry = searchParams.get('industry');

    let filteredTenants = TenantStorage.getAllTenants();

    // Merge menu data from global storage into tenant settings
    filteredTenants = filteredTenants.map(tenant => {
      const menuData = global.tenantMenuData[tenant.id];
      if (menuData) {
        return {
          ...tenant,
          settings: {
            ...tenant.settings,
            scrapedMenuData: menuData
          }
        };
      }
      return tenant;
    });

    // Apply filters
    if (status) {
      filteredTenants = filteredTenants.filter(t => t.status === status);
    }
    
    if (industry) {
      filteredTenants = filteredTenants.filter(t => t.industry === industry);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTenants = filteredTenants.slice(startIndex, endIndex);

    return NextResponse.json({
      tenants: paginatedTenants,
      pagination: {
        page,
        limit,
        total: filteredTenants.length,
        pages: Math.ceil(filteredTenants.length / limit),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Tenants GET error:', error);
    return NextResponse.json({
      error: 'Failed to fetch tenants',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// POST /api/tenants - Create new tenant
export async function POST(request: NextRequest) {
  try {
    const createRequest: CreateTenantRequest = await request.json();

    // Validate required fields
    if (!createRequest.name || !createRequest.slug || !createRequest.industry) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['name', 'slug', 'industry', 'owner'],
      }, { status: 400 });
    }

    // Check if slug is already taken
    const existingTenant = mockTenants.find(t => t.slug === createRequest.slug);
    if (existingTenant) {
      return NextResponse.json({
        error: 'Slug already exists',
        message: `The slug "${createRequest.slug}" is already taken.`,
      }, { status: 409 });
    }

    // Create new tenant
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: createRequest.name,
      slug: createRequest.slug,
      industry: createRequest.industry,
      status: 'trial',
      subscription: createRequest.subscription || 'starter',
      settings: getDefaultSettings(createRequest.industry),
      branding: getDefaultBranding(),
      owner: {
        id: `owner-${Date.now()}`,
        ...createRequest.owner,
        role: 'owner',
      },
      features: getFeaturesByPlan(createRequest.subscription || 'starter'),
      usage: {
        currentMonth: {
          conversations: 0,
          uniqueUsers: 0,
          voiceMinutes: 0,
          storageUsedGB: 0,
          apiCalls: 0,
        },
        lastMonth: {
          conversations: 0,
          uniqueUsers: 0,
          voiceMinutes: 0,
          storageUsedGB: 0,
          apiCalls: 0,
        },
        totalAllTime: {
          conversations: 0,
          uniqueUsers: 0,
          voiceMinutes: 0,
          leads: 0,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to persistent storage
    TenantStorage.createTenant(newTenant);

    return NextResponse.json({
      tenant: newTenant,
      message: 'Tenant created successfully',
      timestamp: new Date().toISOString(),
    }, { status: 201 });

  } catch (error) {
    console.error('Tenant creation error:', error);
    return NextResponse.json({
      error: 'Failed to create tenant',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Helper functions
function getDefaultSettings(industry: string) {
  const baseSettings = {
    aiModel: 'gpt-3.5-turbo' as const,
    temperature: 0.7,
    maxTokens: 500,
    voiceEnabled: true,
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    voiceSettings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    },
    timezone: 'America/New_York',
    language: 'en',
    businessHours: {
      monday: { open: true, openTime: '09:00', closeTime: '17:00' },
      tuesday: { open: true, openTime: '09:00', closeTime: '17:00' },
      wednesday: { open: true, openTime: '09:00', closeTime: '17:00' },
      thursday: { open: true, openTime: '09:00', closeTime: '17:00' },
      friday: { open: true, openTime: '09:00', closeTime: '17:00' },
      saturday: { open: false },
      sunday: { open: false },
    },
    integrations: {},
    n8nEnabled: false,
  };

  const industryPrompts = {
    restaurant: {
      systemPrompt: `You are a helpful restaurant assistant. You help customers with menu inquiries, reservations, hours, and general questions about the restaurant. Be warm, welcoming, and knowledgeable.`,
      welcomeMessage: "Welcome! I'm here to help you with our menu, reservations, or any questions about our restaurant. How can I assist you today?",
      fallbackMessage: "I apologize, but I didn't understand your request. Could you please rephrase your question about our restaurant?",
    },
    retail: {
      systemPrompt: `You are a helpful customer service assistant. You help customers with product information, availability, technical specs, warranties, and general shopping questions. Be knowledgeable, helpful, and professional.`,
      welcomeMessage: "Hello! I'm here to help you find the perfect products and answer any questions. What can I help you with today?",
      fallbackMessage: "I'm sorry, I didn't quite catch that. Could you please ask me about our products, services, or store information?",
    },
    healthcare: {
      systemPrompt: `You are a helpful medical clinic assistant. You help patients with appointment scheduling, general health information, clinic services, and basic inquiries. Always maintain HIPAA compliance and direct patients to healthcare professionals for medical advice.`,
      welcomeMessage: "Hello! I'm the virtual assistant for this medical clinic. I can help you with appointments, services, and general information. How may I assist you today?",
      fallbackMessage: "I apologize for any confusion. Please let me know if you need help with appointments, our services, or general clinic information.",
    },
  };

  const industryDefaults = industryPrompts[industry as keyof typeof industryPrompts] || industryPrompts.restaurant;

  return {
    ...baseSettings,
    ...industryDefaults,
  };
}

function getDefaultBranding() {
  return {
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    fontFamily: 'Inter',
    widgetPosition: 'bottom-right' as const,
    widgetSize: 'medium' as const,
    borderRadius: 12,
  };
}

function getFeaturesByPlan(plan: string) {
  const plans = {
    free: {
      voiceChat: false,
      textChat: true,
      fileUpload: false,
      analytics: false,
      leadCapture: false,
      appointments: false,
      payments: false,
      multiLanguage: false,
      webhooks: false,
      apiAccess: false,
      whiteLabel: false,
      customDomain: false,
      maxConversationsPerMonth: 100,
      maxUsersPerMonth: 50,
      maxStorageGB: 0.1,
    },
    starter: {
      voiceChat: true,
      textChat: true,
      fileUpload: true,
      analytics: true,
      leadCapture: true,
      appointments: false,
      payments: false,
      multiLanguage: false,
      webhooks: false,
      apiAccess: false,
      whiteLabel: false,
      customDomain: false,
      maxConversationsPerMonth: 500,
      maxUsersPerMonth: 200,
      maxStorageGB: 1,
    },
    growth: {
      voiceChat: true,
      textChat: true,
      fileUpload: true,
      analytics: true,
      leadCapture: true,
      appointments: true,
      payments: true,
      multiLanguage: true,
      webhooks: true,
      apiAccess: true,
      whiteLabel: false,
      customDomain: false,
      maxConversationsPerMonth: 2000,
      maxUsersPerMonth: 1000,
      maxStorageGB: 5,
    },
    enterprise: {
      voiceChat: true,
      textChat: true,
      fileUpload: true,
      analytics: true,
      leadCapture: true,
      appointments: true,
      payments: true,
      multiLanguage: true,
      webhooks: true,
      apiAccess: true,
      whiteLabel: true,
      customDomain: true,
      maxConversationsPerMonth: 10000,
      maxUsersPerMonth: 5000,
      maxStorageGB: 25,
    },
  };

  return plans[plan as keyof typeof plans] || plans.starter;
} 