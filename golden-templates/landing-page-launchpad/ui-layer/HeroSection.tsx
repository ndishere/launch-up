export interface HeroSectionProps {
  headline: string;
  subheadline: string;
  ctaText: string;
}

export function renderHeroSlotSummary(props: HeroSectionProps): string {
  return `${props.headline} | ${props.ctaText}`;
}
