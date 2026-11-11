// FeatureRegistryRoot (Mutable Slot)
export function calculateFreightRatePerKg(totalUsd: number, weightKg: number): number {
  if (weightKg <= 0) {
    throw new Error('ZeroDivisionError: weightKg must be greater than zero in /api/v1/rates');
  }
  return Number((totalUsd / weightKg).toFixed(2));
}
