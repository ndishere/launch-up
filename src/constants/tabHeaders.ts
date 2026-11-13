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
    subtitle: 'Discover leads, synthesize project scopes, pitch interactive prototypes, and manage business retainers.',
  },
  projects: {
    title: 'Projects',
    subtitle: 'Client deliverables, builder orchestration, releases, and local workspace adapters.',
  },
  'project-canvas': {
    title: 'Project Canvas',
    subtitle: 'Visual interactive architecture designer and microservice graph representation.',
  },
  'project-builder': {
    title: 'Project Builder',
    subtitle: 'Step-by-step software build orchestration and automated blueprint generator.',
  },
  'nocode-editor': {
    title: 'Visual Page Editor',
    subtitle: 'Drag-and-drop page, form, and screen editor with live design tokens.',
  },
  'preview-studio': {
    title: 'Device Previewer',
    subtitle: 'Responsive testing across mobile, tablet, and desktop viewports.',
  },
  services: {
    title: 'Services',
    subtitle: 'Digital marketing, WhatsApp outreach, website health monitoring, and system uptime.',
  },
  'tools-apps': {
    title: 'Tools & Apps',
    subtitle: 'Reusable project templates, connected accounts, visual page editor, and device previewer.',
  },
  'ai-workshop': {
    title: 'AI Workshop',
    subtitle: 'AI team helpers, local PC memory optimization, model setup, and workflow automations.',
  },
  'fde-systems': {
    title: 'Services Architecture',
    subtitle: 'High-throughput microservices, event streams, and database schemas.',
  },
  'connected-apps': {
    title: 'Connected Accounts',
    subtitle: 'External tool connections, third-party connectors, and automated integrations.',
  },
  templates: {
    title: 'Project Templates',
    subtitle: 'Pre-built production templates with locked core, editable slots, and themes.',
  },
  integrations: {
    title: 'Connected Accounts',
    subtitle: 'External tool connections including GitHub, Docker Hub, Canva, and WhatsApp.',
  },
  deployments: {
    title: 'Deployments & Releases',
    subtitle: 'Multi-stage release approvals, live cloud containers, and URL routing.',
  },
  ams: {
    title: 'AI Team Helpers',
    subtitle: 'Virtual specialized executive and technical agents operating continuous factories.',
  },
  'agent-company': {
    title: 'AI Team Helpers',
    subtitle: 'Virtual specialized executive and technical agents operating continuous factories.',
  },
  'slm-lab': {
    title: 'AI Models & Local PC',
    subtitle: 'Local PC memory saver, Ollama discovery, and custom API connections.',
  },
  workflows: {
    title: 'Automation Flows',
    subtitle: 'Event-driven triggers, client intake pipelines, and automated CRM outreach sequences.',
  },
  'n8n-workflows': {
    title: 'Automation Flows',
    subtitle: 'Event-driven business automations, CRM triggers, and workflow connectors.',
  },
  'remote-telemetry': {
    title: 'Live Uptime & Logs',
    subtitle: 'Real-time uptime telemetry, container performance metrics, and activity logs.',
  },
  'telemetry-hub': {
    title: 'Live Uptime & Logs',
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
    title: 'Teams & Governance',
    subtitle: 'Business approval gates, team access permissions, and co-owner sign-offs.',
  },
  alerts: {
    title: 'Website Health & Auto-Fix',
    subtitle: 'Real-time health pulse, autonomous fix generator, and self-healing care.',
  },
  settings: {
    title: 'Workspace Settings',
    subtitle: 'Appearance theme, color palettes, organization branding, and custom AI gateway setup.',
  },
  'marketing-engine': {
    title: 'Marketing & WhatsApp',
    subtitle: 'Canva Pro social marketing campaigns, content calendar, and CRM outreach.',
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
