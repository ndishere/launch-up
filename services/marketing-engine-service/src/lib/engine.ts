import crypto from 'node:crypto';
import type {
  Mod07MarketingRequest,
  Mod07MarketingResponse,
  CalendarItem,
  SocialPlatform,
} from '../types/index.ts';
import {
  CanvaRateLimitError,
  TemplateFieldMismatchError,
} from '../types/index.ts';

const PLATFORM_ROTATION: SocialPlatform[] = ['INSTAGRAM', 'LINKEDIN', 'FACEBOOK'];

export function generatePlatformPost(
  day: number,
  platform: SocialPlatform,
  theme: string,
  companyName: string
): string {
  const brand = companyName || 'LaunchUp Partner';

  switch (platform) {
    case 'INSTAGRAM':
      return `✨ Day ${day} with ${brand}: ${theme}! Experience next-level speed, modern real-time tracking, and seamless fulfillment. Link in bio to get started 🚀 #Logistics #Innovation #TechFulfillment #${theme.replace(/\s+/g, '')}`;

    case 'LINKEDIN':
      return `Day ${day} Insights | How ${brand} is leading enterprise transformation through "${theme}". By streamlining supply chains and optimizing delivery SLAs, organizations achieve unprecedented operational efficiency. Let's connect and discuss your digital roadmap. #B2B #SupplyChain #EnterpriseTech #Leadership`;

    case 'FACEBOOK':
      return `Exciting news from ${brand}! 🎉 Day ${day} of our "${theme}" showcase. We're proud to bring transparent, reliable service to our growing community. Click below to explore our services today!`;
  }
}

export async function processMarketingCampaign(
  request: Mod07MarketingRequest
): Promise<Mod07MarketingResponse> {
  // 1. Check Canva rate limits
  if (request.simulate_rate_limit) {
    throw new CanvaRateLimitError(
      'Canva Pro API rate limit exceeded: 429 Too Many Requests. Burst limit reached on export rendering.',
      60
    );
  }

  // 2. Validate template IDs presence
  if (
    !request.canva_brand_template_ids ||
    !Array.isArray(request.canva_brand_template_ids) ||
    request.canva_brand_template_ids.length === 0
  ) {
    throw new TemplateFieldMismatchError(
      'Validation failure: At least one Canva brand template ID is required to generate the marketing calendar.'
    );
  }

  // 3. Check for template field mismatches
  if (request.simulate_field_mismatch) {
    throw new TemplateFieldMismatchError(
      'Canva brand template field mismatch: Required fields [company_logo_svg, hero_headline_text] were not provided in brand_kit',
      ['company_logo_svg', 'hero_headline_text']
    );
  }

  const daysCount = Math.max(1, Math.min(request.days_count || 30, 365));
  const companyName = request.brand_kit?.company_name || 'Launch Up Partner';
  const prefix = request.project_id.slice(0, 8);

  const calendarItems: CalendarItem[] = [];

  for (let day = 1; day <= daysCount; day++) {
    const platform = PLATFORM_ROTATION[(day - 1) % PLATFORM_ROTATION.length];
    const caption = generatePlatformPost(day, platform, request.campaign_theme, companyName);
    const exportUrl = `https://export.canva.com/${prefix}_day${day}.png`;

    calendarItems.push({
      day,
      platform,
      caption,
      canva_export_url: exportUrl,
      // Mandatory compliance: EU AI Act (Regulation 2024/1689) Article 50 machine-readable labeling
      eu_ai_act_disclosure_attached: true,
    });
  }

  // Generate Gate 4 (MARKETING_PUBLISH) approval gate ID
  const approvalGateId = `gate-0004-${crypto.randomUUID()}`;

  return {
    project_id: request.project_id,
    calendar_items: calendarItems,
    approval_gate_id: approvalGateId,
  };
}
