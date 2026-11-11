export interface WidgetSlotDefinition {
  id: string;
  title: string;
  endpoint: string;
}

export const DEFAULT_PORTAL_WIDGETS: WidgetSlotDefinition[] = [
  { id: 'w-usage', title: 'Usage Telemetry', endpoint: '/api/v1/portal/widgets' },
  { id: 'w-invoices', title: 'Invoices & Receipts', endpoint: '/api/v1/billing/invoices' },
];
