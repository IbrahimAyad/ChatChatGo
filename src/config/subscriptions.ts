import { SubscriptionPlanDetails, SubscriptionTier } from '@/types/tenant';

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlanDetails> = {
  basic: {
    tier: 'basic',
    name: 'Basic Chat',
    price: 99,
    features: {
      voiceChat: false,
      textChat: true,
      fileUpload: false,
      analytics: false,
      leadCapture: true,
      appointments: false,
      payments: false,
      multiLanguage: false,
      webhooks: false,
      apiAccess: false,
      whiteLabel: false,
      customDomain: false,
      maxConversationsPerMonth: 500,
      maxUsersPerMonth: 100,
      maxStorageGB: 1
    },
    ui: {
      theme: 'basic',
      animations: false,
      customBranding: false,
      advancedLayout: false,
      premiumEffects: false
    }
  },

  professional: {
    tier: 'professional',
    name: 'Professional Voice',
    price: 149,
    features: {
      voiceChat: true,
      textChat: true,
      fileUpload: true,
      analytics: true,
      leadCapture: true,
      appointments: true,
      payments: false,
      multiLanguage: false,
      webhooks: false,
      apiAccess: false,
      whiteLabel: false,
      customDomain: false,
      maxConversationsPerMonth: 2000,
      maxUsersPerMonth: 500,
      maxStorageGB: 5
    },
    ui: {
      theme: 'professional',
      animations: true,
      customBranding: true,
      advancedLayout: true,
      premiumEffects: false
    }
  },

  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise Suite',
    price: 299,
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
      whiteLabel: true,
      customDomain: true,
      maxConversationsPerMonth: 10000,
      maxUsersPerMonth: 2000,
      maxStorageGB: 50
    },
    ui: {
      theme: 'premium',
      animations: true,
      customBranding: true,
      advancedLayout: true,
      premiumEffects: true
    }
  },

  custom: {
    tier: 'custom',
    name: 'Custom Solution',
    price: 999,
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
      whiteLabel: true,
      customDomain: true,
      maxConversationsPerMonth: -1, // Unlimited
      maxUsersPerMonth: -1, // Unlimited
      maxStorageGB: -1 // Unlimited
    },
    ui: {
      theme: 'custom',
      animations: true,
      customBranding: true,
      advancedLayout: true,
      premiumEffects: true
    }
  }
};

export const getTierFeatures = (tier: SubscriptionTier) => {
  return SUBSCRIPTION_PLANS[tier]?.features;
};

export const getTierUI = (tier: SubscriptionTier) => {
  return SUBSCRIPTION_PLANS[tier]?.ui;
};

export const isTierFeatureEnabled = (tier: SubscriptionTier, feature: keyof SubscriptionPlanDetails['features']) => {
  return SUBSCRIPTION_PLANS[tier]?.features[feature] || false;
}; 