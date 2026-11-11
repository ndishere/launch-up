export function registerFeatureRoutes(prefix = '/api/v1/domain') {
  return [`${prefix}/orders`, `${prefix}/metrics`];
}
