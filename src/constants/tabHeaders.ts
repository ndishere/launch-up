export interface TabHeaderMeta {
  title: string;
  subtitle: string;
}

export const TAB_HEADER_META: Record<string, TabHeaderMeta> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Autonomous 1-Person Software Factory: Real-time client pipelines, follow-ups, and approval inbox.',
  },
  clients: {
    title: 'Clients & Requirements',
    subtitle: 'Discover leads, synthesize PRDs, pitch interactive prototypes, and manage business retainers.',
  },
  projects: {
    title: 'Projects Command Center',
    subtitle: 'Manage client deliverables, isolated Git branches, Docker staging, and pull external workspaces.',
  },
  'project-canvas': {
    title: 'Project Canvas',
    subtitle: 'Visual interactive architecture designer and microservice graph representation.',
  },
  'project-builder': {
    title: 'Project Builder',
    subtitle: 'Hierarchical agent swarm build orchestration and automated blueprint generator.',
  },
  'nocode-editor': {
    title: 'No-Code Visual Builder',
    subtitle: 'Drag-and-drop landing page, form, and mobile interface designer with live theme token bindings.',
  },
  'preview-studio': {
    title: 'Multi-Viewport Preview Studio',
    subtitle: 'Responsive testing across 375px mobile, tablet, and 1920px desktop viewports with GDPR/DPDP checks.',
  },
  services: {
    title: 'Microservices Mesh',
    subtitle: 'Control plane mesh spanning MOD-01 through MOD-10 microservices, health pulse, and routes.',
  },
  'fde-systems': {
    title: 'FDE Systems Architecture',
    subtitle: 'Forward deployed engineering microservices, event streams, and database schemas.',
  },
  'connected-apps': {
    title: 'Tools & Connected Apps',
    subtitle: 'Enterprise plugins, third-party connectors, and automated factory integrations.',
  },
  templates: {
    title: 'Golden Templates',
    subtitle: '88% reusable production templates with locked core, mutable slots, and decoupled UI tokens.',
  },
  integrations: {
    title: 'Integrations & Cloud Providers',
    subtitle: 'External tool connections including GitHub, Docker Hub, Canva, Meta WhatsApp, and Sentry.',
  },
  deployments: {
    title: 'Deployments & Releases',
    subtitle: 'Multi-stage Docker containers, Gate 3 release approvals, and multi-tenant live URL routing.',
  },
  ams: {
    title: 'AI Workshop & Swarm',
    subtitle: 'Multi-agent hierarchical swarm management, active reasoning queues, and token budgets.',
  },
  'agent-company': {
    title: 'Autonomous Agent Company',
    subtitle: 'Virtual specialized executive and technical agents operating continuous software factories.',
  },
  'slm-lab': {
    title: 'SLM Lab & Local Models',
    subtitle: 'Local 6GB VRAM hardware optimizer, Ollama model auto-discovery, and RTX 3050 TurboQuant.',
  },
  workflows: {
    title: 'Automation Workflows',
    subtitle: 'Event-driven triggers, client intake pipelines, and automated CRM outreach sequences.',
  },
  'n8n-workflows': {
    title: 'n8n Workflow Automation',
    subtitle: 'Embedded self-hosted n8n workflow canvas for complex cross-service business automation.',
  },
  'remote-telemetry': {
    title: 'Remote Telemetry Hub',
    subtitle: 'Live container metrics, p95 latency sweeps, memory limits, and socket connections.',
  },
  'telemetry-hub': {
    title: 'Telemetry & Observability',
    subtitle: 'Real-time performance metrics, health pulse telemetry, and cross-service traces.',
  },
  analytics: {
    title: 'Analytics & FinOps',
    subtitle: 'Automated unit economics, token consumption costs, client retainers, and gross margins.',
  },
  billing: {
    title: 'Billing & Invoicing',
    subtitle: 'Client subscription management, automated Stripe/Razorpay invoices, and profit shares.',
  },
  team: {
    title: 'Team & Governance Gates',
    subtitle: 'Human-in-the-loop Governance Gates (MOD-10), RBAC permission matrix, and co-owner sign-offs.',
  },
  alerts: {
    title: 'Alerts & SRE Healing',
    subtitle: 'Real-time incident logs, autonomous SRE hotfix PR generator, and self-healing engine.',
  },
  settings: {
    title: 'Workspace Settings',
    subtitle: 'Dual theme customization, appearance mode, color palettes, and custom API gateway.',
  },
  'marketing-engine': {
    title: 'Digital Marketing Engine',
    subtitle: 'Autonomous Canva Pro social campaigns, content calendars, and targeted creative assets.',
  },
  'system-design': {
    title: 'System Design & Architecture',
    subtitle: 'High-level SDLC specifications, 10 microservice contracts, and compliance framework matrices.',
  },
};

export function getTabHeaderMeta(tabId: string): TabHeaderMeta {
  if (TAB_HEADER_META[tabId]) {
    return TAB_HEADER_META[tabId];
  }
  const formattedTitle = tabId
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return {
    title: formattedTitle || 'Workspace',
    subtitle: 'Autonomous Enterprise Software Factory & Agency Control Plane',
  };
}
