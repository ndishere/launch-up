export const LOCKED_LANDING_ROUTES = ['/', '/pricing', '/privacy', '/terms'] as const;

export function createLandingRouterConfig(brandSlug: string) {
  return {
    brandSlug,
    routes: LOCKED_LANDING_ROUTES,
    strictHeaders: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
    },
  };
}
