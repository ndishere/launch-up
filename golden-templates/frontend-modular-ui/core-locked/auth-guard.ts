export function verifyPortalSession(token: string | null): boolean {
  return Boolean(token && token.trim().length >= 16);
}
