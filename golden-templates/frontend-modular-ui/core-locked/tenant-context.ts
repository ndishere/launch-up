export interface LockedTenantContext {
  clientId: string;
  isolationMode: 'STRICT_RLS';
}

export function resolveTenantContext(clientId: string): LockedTenantContext {
  return { clientId, isolationMode: 'STRICT_RLS' };
}
