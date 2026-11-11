// ApiRouterRoot (Locked)
export function createFreightServerConfig() {
  return {
    port: 4100,
    routes: ['/health', '/api/v1/rates', '/api/v1/privacy/me/export'],
  };
}
