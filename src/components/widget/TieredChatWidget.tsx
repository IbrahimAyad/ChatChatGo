'use client';

import { useState, useEffect } from 'react';
import { SubscriptionTier } from '@/types/tenant';
import { getTierUI, isTierFeatureEnabled } from '@/config/subscriptions';

// Import different widget versions
import { BasicChatWidget } from './tiers/BasicChatWidget';
import { ProfessionalChatWidget } from './tiers/ProfessionalChatWidget';
import { EnterpriseChatWidget } from './tiers/EnterpriseChatWidget';
import { CustomChatWidget } from './tiers/CustomChatWidget';

interface TieredChatWidgetProps {
  tenantId: string;
  tier: SubscriptionTier;
  embedded?: boolean;
  className?: string;
}

export function TieredChatWidget({ 
  tenantId, 
  tier, 
  embedded = false, 
  className = '' 
}: TieredChatWidgetProps) {
  const [tenantData, setTenantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenantData();
  }, [tenantId]);

  const fetchTenantData = async () => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}`);
      const data = await response.json();
      setTenantData(data.tenant);
    } catch (error) {
      console.error('Error fetching tenant data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get tier configuration
  const uiConfig = getTierUI(tier);
  const hasVoiceFeature = isTierFeatureEnabled(tier, 'voiceChat');
  const hasAnalytics = isTierFeatureEnabled(tier, 'analytics');

  // Render appropriate widget based on tier
  switch (tier) {
    case 'basic':
      return (
        <BasicChatWidget
          tenantData={tenantData}
          embedded={embedded}
          className={className}
          config={uiConfig}
        />
      );

    case 'professional':
      return (
        <ProfessionalChatWidget
          tenantData={tenantData}
          embedded={embedded}
          className={className}
          config={uiConfig}
          hasVoice={hasVoiceFeature}
          hasAnalytics={hasAnalytics}
        />
      );

    case 'enterprise':
      return (
        <EnterpriseChatWidget
          tenantData={tenantData}
          embedded={embedded}
          className={className}
          config={uiConfig}
          hasVoice={hasVoiceFeature}
          hasAnalytics={hasAnalytics}
        />
      );

    case 'custom':
      return (
        <CustomChatWidget
          tenantData={tenantData}
          embedded={embedded}
          className={className}
          config={uiConfig}
        />
      );

    default:
      // Fallback to basic
      return (
        <BasicChatWidget
          tenantData={tenantData}
          embedded={embedded}
          className={className}
          config={getTierUI('basic')}
        />
      );
  }
}

export default TieredChatWidget; 