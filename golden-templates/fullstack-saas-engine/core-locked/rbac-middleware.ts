export interface RbacPrincipal {
  id: string;
  role: 'SUPER_ADMIN' | 'CLIENT_ADMIN' | 'AI_AGENT';
}

export function enforceLockedRbac(principal: RbacPrincipal, action: string): boolean {
  if (principal.role === 'AI_AGENT' && action === 'gate:approve') {
    return false;
  }
  return true;
}
