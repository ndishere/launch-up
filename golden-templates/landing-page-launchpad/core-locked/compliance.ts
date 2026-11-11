export interface LockedComplianceConfig {
  frameworks: Array<'DPDP_INDIA' | 'GDPR_EU' | 'CCPA_US'>;
  requireExplicitConsent: boolean;
}

export const DEFAULT_LANDING_COMPLIANCE: LockedComplianceConfig = {
  frameworks: ['DPDP_INDIA', 'GDPR_EU'],
  requireExplicitConsent: true,
};
