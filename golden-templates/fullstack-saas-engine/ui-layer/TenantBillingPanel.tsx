export function formatTenantPlanSummary(planName: string, monthlyUsd: number): string {
  return `${planName}: $${monthlyUsd}/mo`;
}
