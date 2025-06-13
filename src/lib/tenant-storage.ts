import fs from 'fs';
import path from 'path';
import { Tenant } from '@/types/tenant';

const STORAGE_DIR = path.join(process.cwd(), 'data');
const TENANTS_FILE = path.join(STORAGE_DIR, 'tenants.json');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Default tenants (your demo data)
const defaultTenants: Tenant[] = [
  {
    id: 'mario-restaurant',
    name: "Mario's Italian Restaurant",
    slug: 'mario-restaurant',
    industry: 'restaurant',
    status: 'active',
    subscription: 'growth',
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
    subscription: 'starter',
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

export class TenantStorage {
  private static loadTenants(): Tenant[] {
    try {
      if (fs.existsSync(TENANTS_FILE)) {
        const data = fs.readFileSync(TENANTS_FILE, 'utf8');
        const tenants = JSON.parse(data);
        // Convert date strings back to Date objects
        return tenants.map((tenant: any) => ({
          ...tenant,
          createdAt: new Date(tenant.createdAt),
          updatedAt: new Date(tenant.updatedAt),
        }));
      } else {
        // First time - initialize with default tenants
        this.saveTenants(defaultTenants);
        return defaultTenants;
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      return defaultTenants;
    }
  }

  private static saveTenants(tenants: Tenant[]): void {
    try {
      fs.writeFileSync(TENANTS_FILE, JSON.stringify(tenants, null, 2));
    } catch (error) {
      console.error('Error saving tenants:', error);
    }
  }

  static getAllTenants(): Tenant[] {
    return this.loadTenants();
  }

  static getTenantById(id: string): Tenant | undefined {
    const tenants = this.loadTenants();
    return tenants.find(t => t.id === id);
  }

  static getTenantBySlug(slug: string): Tenant | undefined {
    const tenants = this.loadTenants();
    return tenants.find(t => t.slug === slug);
  }

  static createTenant(tenant: Tenant): Tenant {
    const tenants = this.loadTenants();
    
    // Check if slug already exists
    if (tenants.find(t => t.slug === tenant.slug)) {
      throw new Error(`Tenant with slug "${tenant.slug}" already exists`);
    }

    tenants.push(tenant);
    this.saveTenants(tenants);
    return tenant;
  }

  static updateTenant(id: string, updates: Partial<Tenant>): Tenant | null {
    const tenants = this.loadTenants();
    const index = tenants.findIndex(t => t.id === id);
    
    if (index === -1) {
      return null;
    }

    tenants[index] = { 
      ...tenants[index], 
      ...updates, 
      updatedAt: new Date() 
    };
    
    this.saveTenants(tenants);
    return tenants[index];
  }

  static deleteTenant(id: string): boolean {
    const tenants = this.loadTenants();
    const index = tenants.findIndex(t => t.id === id);
    
    if (index === -1) {
      return false;
    }

    tenants.splice(index, 1);
    this.saveTenants(tenants);
    return true;
  }
} 