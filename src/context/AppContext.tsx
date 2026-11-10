import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Theme, ThemeMode, ColorPalette, TabId, Client, Project, DeploymentLog, SystemAlert, 
  BackupRecord, Invoice, Template, Integration, TeamMember,
  AutonomousAgent, BusinessAutomationIntake, SLMModel, MarketingCampaign,
  RemoteTelemetryPackage, FDESystemArchitecture,
  TechStackPreset, ConnectedAppPlugin, ClientRequirementIntake, AutomationWorkflow
} from '../types';
import { 
  initialClients, initialProjects, initialAlerts, initialDeployments, 
  initialBackups, initialInvoices, initialTemplates, initialIntegrations, 
  initialTeamMembers, initialAgents, initialIntakes, initialSLMs,
  initialCampaigns, initialTelemetryPackages, initialFDESystems,
  initialStackPresets, initialConnectedApps, initialRequirementIntakes, initialWorkflows
} from '../data/mockData';

interface AppContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  palette: ColorPalette;
  setPalette: (palette: ColorPalette) => void;
  resolvedTheme: 'dark' | 'light';
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  currentTab: TabId;
  setCurrentTab: (tab: TabId) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  
  // Data
  clients: Client[];
  projects: Project[];
  alerts: SystemAlert[];
  deployments: DeploymentLog[];
  backups: BackupRecord[];
  invoices: Invoice[];
  templates: Template[];
  integrations: Integration[];
  teamMembers: TeamMember[];
  agents: AutonomousAgent[];
  intakes: BusinessAutomationIntake[];
  slms: SLMModel[];
  campaigns: MarketingCampaign[];
  telemetryPackages: RemoteTelemetryPackage[];
  fdeSystems: FDESystemArchitecture[];
  stackPresets: TechStackPreset[];
  connectedApps: ConnectedAppPlugin[];
  requirementIntakes: ClientRequirementIntake[];
  workflows: AutomationWorkflow[];

  // Actions
  addClient: (client: Omit<Client, 'id' | 'initials' | 'joinedDate' | 'totalSpend'>) => void;
  addProject: (project: Omit<Project, 'id' | 'lastBackupDate' | 'backupStatus' | 'healthPercent'>) => void;
  triggerDeployment: (projectId: string, environment?: 'Production' | 'Staging' | 'Preview') => void;
  createManualBackup: (projectId: string) => void;
  markAlertAsRead: (alertId: string) => void;
  clearAlert: (alertId: string) => void;
  toggleIntegration: (integrationId: string) => void;

  // Agent Company & Autonomous Actions
  dispatchAgentTask: (agentId: string, taskDesc: string) => void;
  submitBusinessIntake: (intake: Omit<BusinessAutomationIntake, 'id' | 'status' | 'createdAt'>) => void;
  trainSLMModel: (modelId: string) => void;
  addSLMModel: (model: Omit<SLMModel, 'id' | 'status' | 'tokensPerSec' | 'lastEvaluated' | 'evalScores'>) => void;
  triggerAutoUpdate: (packageId: string) => void;
  rebalanceCampaign: (campaignId: string) => void;
  createCampaign: (campaign: Omit<MarketingCampaign, 'id' | 'leadsGenerated' | 'lastAutonomousOptimization'>) => void;
  deployFDESystem: (system: Omit<FDESystemArchitecture, 'id' | 'status' | 'lastArchitectureAudit'>) => void;

  // Tech Stacks, Plugins, Intakes & Workflows Actions
  addStackPreset: (preset: Omit<TechStackPreset, 'id' | 'isPreset'>) => void;
  toggleAppInstall: (appId: string) => void;
  submitRequirementIntake: (intake: Omit<ClientRequirementIntake, 'id' | 'submittedAt' | 'apiWiringEndpoint' | 'databaseWiringKey'>) => void;
  convertIntakeToProject: (intakeId: string) => void;
  triggerWorkflowRun: (workflowId: string) => void;
  restoreGitStableBuild: (projectId: string) => void;
  addTeamMember: (member: Omit<TeamMember, 'id' | 'avatarInitials'>) => void;
  removeTeamMember: (memberId: string) => void;

  // Selected Entities
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;

  // Modals & Canvas
  isAddClientModalOpen: boolean;
  setIsAddClientModalOpen: (open: boolean) => void;
  isCreateProjectModalOpen: boolean;
  setIsCreateProjectModalOpen: (open: boolean) => void;
  isDeployModalOpen: boolean;
  setIsDeployModalOpen: (open: boolean) => void;
  activeDeployLog: DeploymentLog | null;
  setActiveDeployLog: (log: DeploymentLog | null) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isUpgradeModalOpen: boolean;
  setIsUpgradeModalOpen: (open: boolean) => void;
  isClientPortalModalOpen: boolean;
  setIsClientPortalModalOpen: (open: boolean) => void;
  activeCanvasProjectId: string | null;
  setActiveCanvasProjectId: (id: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const PALETTE_DEFINITIONS: Record<ColorPalette, {
  name: string;
  colors: Record<number, string>;
  accent: string;
  hover: string;
  glow: string;
  subtle: string;
  chart: {
    primary: string;
    secondary: string;
    tertiary: string;
    traffic: string;
  };
}> = {
  indigo: {
    name: 'Indigo Obsidian',
    colors: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
    },
    accent: '#6366f1',
    hover: '#4f46e5',
    glow: 'rgba(99, 102, 241, 0.28)',
    subtle: 'rgba(99, 102, 241, 0.12)',
    chart: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      tertiary: '#c084fc',
      traffic: '#6366f1',
    },
  },
  cyan: {
    name: 'Cyber Cyan',
    colors: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
    },
    accent: '#06b6d4',
    hover: '#0891b2',
    glow: 'rgba(6, 182, 212, 0.28)',
    subtle: 'rgba(6, 182, 212, 0.14)',
    chart: {
      primary: '#06b6d4',
      secondary: '#0ea5e9',
      tertiary: '#38bdf8',
      traffic: '#06b6d4',
    },
  },
  emerald: {
    name: 'Emerald Matrix',
    colors: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
    accent: '#10b981',
    hover: '#059669',
    glow: 'rgba(16, 185, 129, 0.28)',
    subtle: 'rgba(16, 185, 129, 0.14)',
    chart: {
      primary: '#10b981',
      secondary: '#14b8a6',
      tertiary: '#6ee7b7',
      traffic: '#10b981',
    },
  },
  amber: {
    name: 'Sunset Amber',
    colors: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    accent: '#f59e0b',
    hover: '#d97706',
    glow: 'rgba(245, 158, 11, 0.28)',
    subtle: 'rgba(245, 158, 11, 0.14)',
    chart: {
      primary: '#f59e0b',
      secondary: '#f97316',
      tertiary: '#fbbf24',
      traffic: '#f59e0b',
    },
  },
  rose: {
    name: 'Rose Amethyst',
    colors: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
      950: '#4c0519',
    },
    accent: '#f43f5e',
    hover: '#e11d48',
    glow: 'rgba(244, 63, 94, 0.28)',
    subtle: 'rgba(244, 63, 94, 0.14)',
    chart: {
      primary: '#f43f5e',
      secondary: '#fb7185',
      tertiary: '#fda4af',
      traffic: '#f43f5e',
    },
  },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Color Mode: 'dark' | 'light' | 'system'
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('launchup_theme_mode') as ThemeMode | null;
    if (saved && ['dark', 'light', 'system'].includes(saved)) {
      return saved;
    }
    const legacy = localStorage.getItem('launchup_theme');
    if (legacy === 'light') return 'light';
    return 'dark';
  });

  // Color Palette: 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose'
  const [palette, setPalette] = useState<ColorPalette>(() => {
    const saved = localStorage.getItem('launchup_palette') as ColorPalette | null;
    if (saved && ['indigo', 'cyan', 'emerald', 'amber', 'rose'].includes(saved)) {
      return saved;
    }
    const legacy = localStorage.getItem('launchup_theme');
    if (legacy === 'midnight-cyber' || legacy === 'nordic-frost') return 'cyan';
    if (legacy === 'emerald-matrix') return 'emerald';
    if (legacy === 'sunset-amber') return 'amber';
    return 'indigo';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Listen to system color scheme changes when in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'dark' | 'light' = themeMode === 'system' ? (systemIsDark ? 'dark' : 'light') : themeMode;

  // Apply mode & palette to root HTML element
  useEffect(() => {
    const root = document.documentElement;
    
    // 1. Handle Light / Dark class
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 2. Set data attributes
    root.setAttribute('data-palette', palette);
    root.setAttribute('data-theme', palette);

    // 3. Directly inject all palette CSS variables onto root inline style
    const pal = PALETTE_DEFINITIONS[palette] || PALETTE_DEFINITIONS.indigo;
    Object.entries(pal.colors).forEach(([shade, hex]) => {
      root.style.setProperty(`--palette-${shade}`, hex);
      root.style.setProperty(`--color-indigo-${shade}`, hex);
      root.style.setProperty(`--color-primary-${shade}`, hex);
    });

    root.style.setProperty('--theme-accent', pal.accent);
    root.style.setProperty('--theme-accent-hover', pal.hover);
    root.style.setProperty('--theme-accent-glow', pal.glow);
    root.style.setProperty('--theme-accent-subtle', pal.subtle);

    root.style.setProperty('--chart-primary', pal.chart.primary);
    root.style.setProperty('--chart-secondary', pal.chart.secondary);
    root.style.setProperty('--chart-tertiary', pal.chart.tertiary);
    root.style.setProperty('--chart-traffic', pal.chart.traffic);

    // 4. Save preferences
    localStorage.setItem('launchup_theme_mode', themeMode);
    localStorage.setItem('launchup_palette', palette);
    localStorage.setItem('launchup_theme', resolvedTheme);
  }, [resolvedTheme, palette, themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  const setTheme = (val: Theme) => {
    if (val === 'dark' || val === 'light' || val === 'system') {
      setThemeMode(val);
    } else if (['indigo', 'cyan', 'emerald', 'amber', 'rose'].includes(val)) {
      setPalette(val as ColorPalette);
    } else if (val === 'midnight-cyber' || val === 'nordic-frost') {
      setPalette('cyan');
      setThemeMode('dark');
    } else if (val === 'emerald-matrix') {
      setPalette('emerald');
      setThemeMode('dark');
    } else if (val === 'sunset-amber') {
      setPalette('amber');
      setThemeMode('dark');
    }
  };

  const theme: Theme = resolvedTheme;

  const [currentTab, setCurrentTab] = useState<TabId>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Core entities
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [alerts, setAlerts] = useState<SystemAlert[]>(initialAlerts);
  const [deployments, setDeployments] = useState<DeploymentLog[]>(initialDeployments);
  const [backups, setBackups] = useState<BackupRecord[]>(initialBackups);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [templates] = useState<Template[]>(initialTemplates);
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers);

  // Advanced Autonomous Systems State
  const [agents, setAgents] = useState<AutonomousAgent[]>(initialAgents);
  const [intakes, setIntakes] = useState<BusinessAutomationIntake[]>(initialIntakes);
  const [slms, setSLMs] = useState<SLMModel[]>(initialSLMs);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(initialCampaigns);
  const [telemetryPackages, setTelemetryPackages] = useState<RemoteTelemetryPackage[]>(initialTelemetryPackages);
  const [fdeSystems, setFDESystems] = useState<FDESystemArchitecture[]>(initialFDESystems);
  const [stackPresets, setStackPresets] = useState<TechStackPreset[]>(initialStackPresets);
  const [connectedApps, setConnectedApps] = useState<ConnectedAppPlugin[]>(initialConnectedApps);
  const [requirementIntakes, setRequirementIntakes] = useState<ClientRequirementIntake[]>(initialRequirementIntakes);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(initialWorkflows);

  // Modals & drawers & canvas
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [activeDeployLog, setActiveDeployLog] = useState<DeploymentLog | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isClientPortalModalOpen, setIsClientPortalModalOpen] = useState(false);
  const [activeCanvasProjectId, setActiveCanvasProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut listener for Command Palette (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isKeyK = e.key === 'k' || e.key === 'K' || e.code === 'KeyK';
      const isModifier = e.metaKey || e.ctrlKey;

      if (isModifier && isKeyK) {
        e.preventDefault();
        e.stopPropagation();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  // Agent Dispatching
  const dispatchAgentTask = (agentId: string, taskDesc: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        return {
          ...a,
          status: 'Executing',
          activeTask: taskDesc,
          tasksCompleted: a.tasksCompleted + 1,
          tokensProcessed: a.tokensProcessed + 14200,
        };
      }
      return a;
    }));

    setAlerts(prev => [
      {
        id: `alert-agent-${Date.now()}`,
        title: 'Agent Dispatched',
        description: `Agent task started: "${taskDesc.slice(0, 50)}..."`,
        type: 'info',
        timeAgo: 'Just now',
        timestamp: new Date().toISOString(),
        read: false,
        relatedEntity: 'Company of Agents',
      },
      ...prev,
    ]);

    // Return to idle after execution simulation
    setTimeout(() => {
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'Idle', activeTask: 'Standby for next autonomous signal' } : a));
    }, 4000);
  };

  // Business Automation Intake Synthesis
  const submitBusinessIntake = (intakeData: Omit<BusinessAutomationIntake, 'id' | 'status' | 'createdAt'>) => {
    const newIntake: BusinessAutomationIntake = {
      ...intakeData,
      id: `intake-${Date.now()}`,
      status: 'Synthesizing',
      createdAt: 'Just now',
    };

    setIntakes(prev => [newIntake, ...prev]);

    // Automatically trigger agent company workflow
    setAlerts(prev => [
      {
        id: `alert-intake-${Date.now()}`,
        title: `Autonomous Engine Engaged: ${newIntake.businessName}`,
        description: `FDE Architect and SLM Trainer agents are synthesizing custom automation pipeline.`,
        type: 'success',
        timeAgo: 'Just now',
        timestamp: new Date().toISOString(),
        read: false,
        relatedEntity: newIntake.businessName,
      },
      ...prev,
    ]);

    // After 2.5s update intake to Deployed
    setTimeout(() => {
      setIntakes(prev => prev.map(i => i.id === newIntake.id ? { ...i, status: 'Deployed' } : i));
    }, 2800);
  };

  // SLM Model Training
  const trainSLMModel = (modelId: string) => {
    setSLMs(prev => prev.map(m => m.id === modelId ? { ...m, status: 'Training' } : m));
    
    setAlerts(prev => [
      {
        id: `alert-slm-${Date.now()}`,
        title: 'SLM Model Training Initiated',
        description: 'LoRA adapters compiling with local quantization benchmarks.',
        type: 'info',
        timeAgo: 'Just now',
        timestamp: new Date().toISOString(),
        read: false,
        relatedEntity: 'SLM Studio',
      },
      ...prev,
    ]);

    setTimeout(() => {
      setSLMs(prev => prev.map(m => m.id === modelId ? { 
        ...m, 
        status: 'Ready', 
        trainingLoss: Math.max(0.02, m.trainingLoss - 0.015),
        lastEvaluated: 'Just now',
        evalScores: {
          ...m.evalScores,
          accuracy: Math.min(99.9, m.evalScores.accuracy + 0.3),
        }
      } : m));
    }, 3500);
  };

  const addSLMModel = (modelData: Omit<SLMModel, 'id' | 'status' | 'tokensPerSec' | 'lastEvaluated' | 'evalScores'>) => {
    const newModel: SLMModel = {
      ...modelData,
      id: `slm-${Date.now()}`,
      status: 'Ready',
      tokensPerSec: modelData.isLocal ? 190 : 135,
      lastEvaluated: 'Just created',
      evalScores: {
        accuracy: 98.8,
        hallucinationRate: 0.4,
        latencyMs: modelData.isLocal ? 6.5 : 18.2,
        throughputTps: modelData.isLocal ? 190 : 135,
      },
    };
    setSLMs(prev => [newModel, ...prev]);
  };

  // Remote Telemetry Auto-Update
  const triggerAutoUpdate = (packageId: string) => {
    setTelemetryPackages(prev => prev.map(p => {
      if (p.id === packageId) {
        return {
          ...p,
          autoUpdateStatus: 'Deploying Update',
        };
      }
      return p;
    }));

    setTimeout(() => {
      setTelemetryPackages(prev => prev.map(p => {
        if (p.id === packageId) {
          return {
            ...p,
            installedVersion: p.latestVersionAvailable,
            autoUpdateStatus: 'In Sync',
            recentLogs: [
              {
                timestamp: new Date().toLocaleTimeString(),
                level: 'INFO',
                source: 'launchup-auto-updater',
                message: `Autonomous canary rollout succeeded for ${p.latestVersionAvailable}. Zero downtime achieved.`,
                autoTriggeredAction: 'Updated live instances and updated checksum in registry.',
              },
              ...p.recentLogs,
            ],
          };
        }
        return p;
      }));
    }, 3000);
  };

  // Rebalance Marketing Campaign
  const rebalanceCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          roas: parseFloat((c.roas + 0.4).toFixed(1)),
          leadsGenerated: c.leadsGenerated + 28,
          lastAutonomousOptimization: 'Just now (AI dynamically reallocated $400 budget to highest-converting ad sets)',
        };
      }
      return c;
    }));
  };

  const createCampaign = (campaignData: Omit<MarketingCampaign, 'id' | 'leadsGenerated' | 'lastAutonomousOptimization'>) => {
    const newCamp: MarketingCampaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
      leadsGenerated: 12,
      lastAutonomousOptimization: 'Created and initialized with autonomous bid agents',
    };
    setCampaigns(prev => [newCamp, ...prev]);
  };

  const deployFDESystem = (systemData: Omit<FDESystemArchitecture, 'id' | 'status' | 'lastArchitectureAudit'>) => {
    const newSystem: FDESystemArchitecture = {
      ...systemData,
      id: `fde-${Date.now()}`,
      status: 'Operational',
      lastArchitectureAudit: 'Just now (Zero architectural flaws detected)',
    };
    setFDESystems(prev => [newSystem, ...prev]);
  };

  // Stack Presets Configuration
  const addStackPreset = (presetData: Omit<TechStackPreset, 'id' | 'isPreset'>) => {
    const newPreset: TechStackPreset = {
      ...presetData,
      id: `stack-${Date.now()}`,
      isPreset: false,
    };
    setStackPresets(prev => [newPreset, ...prev]);
    setAlerts(prev => [
      {
        id: `alert-stack-${Date.now()}`,
        title: 'Tech Stack Preset Added',
        description: `New architecture preset "${newPreset.name}" registered in Launch Up app configuration.`,
        type: 'success',
        timeAgo: 'Just now',
        timestamp: new Date().toISOString(),
        read: false,
        relatedEntity: newPreset.name,
      },
      ...prev,
    ]);
  };

  // Connected Apps / Plugins Toggle
  const toggleAppInstall = (appId: string) => {
    setConnectedApps(prev => prev.map(app => {
      if (app.id === appId) {
        const nextState = !app.installed;
        return { ...app, installed: nextState };
      }
      return app;
    }));
  };

  // Client Requirement Intake Management (Web link / manual call)
  const submitRequirementIntake = (intakeData: Omit<ClientRequirementIntake, 'id' | 'submittedAt' | 'apiWiringEndpoint' | 'databaseWiringKey'>) => {
    const id = `req-${Date.now()}`;
    const newIntake: ClientRequirementIntake = {
      ...intakeData,
      id,
      submittedAt: 'Just now',
      apiWiringEndpoint: `https://api.launchup.io/v1/client-intake/${id}`,
      databaseWiringKey: `vault_sec_${Math.random().toString(16).substring(2, 10)}`,
    };
    setRequirementIntakes(prev => [newIntake, ...prev]);

    // Also auto-create or match client if companyName exists
    const existingClient = clients.find(c => c.name.toLowerCase() === newIntake.companyName.toLowerCase());
    if (!existingClient) {
      addClient({
        name: newIntake.companyName,
        domain: `${newIntake.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        email: newIntake.contactEmail,
        phone: newIntake.contactPhone || '+1 (555) 000-0000',
        tier: 'Growth B2B',
        status: 'Onboarding',
        monthlySubscription: 1499,
        primaryContact: {
          name: newIntake.clientName,
          role: 'Decision Maker',
          email: newIntake.contactEmail,
        },
        notes: `Automatically pulled via Client Requirement Intake Link (${newIntake.projectTitle}). Summary: ${newIntake.summary}`,
        projectIds: [],
      });
    }

    setAlerts(prev => [
      {
        id: `alert-intake-${Date.now()}`,
        title: 'New Client Requirement Received',
        description: `${newIntake.clientName} from ${newIntake.companyName} submitted requirements for "${newIntake.projectTitle}".`,
        type: 'info',
        timeAgo: 'Just now',
        timestamp: new Date().toISOString(),
        read: false,
        relatedEntity: newIntake.companyName,
      },
      ...prev,
    ]);
  };

  // Convert Intake to Project (Seamless Hand-off into Projects & Canvas)
  const convertIntakeToProject = (intakeId: string) => {
    const intake = requirementIntakes.find(r => r.id === intakeId);
    if (!intake) return;

    // Find or fallback client
    const targetClient = clients.find(c => c.name.toLowerCase() === intake.companyName.toLowerCase()) || clients[0];
    const newProjName = intake.projectTitle;

    addProject({
      name: newProjName,
      type: intake.productTypes.includes('SaaS Platform') ? 'SaaS Platform' : intake.productTypes.includes('Landing Page') ? 'Landing Page' : 'Marketing Website',
      status: 'In Progress',
      framework: 'Next.js 15 / Tailwind / Fastlane KMP',
      serverTarget: 'Cloud Run',
      repoUrl: `https://github.com/launchup/${intake.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-core`,
      branch: 'main',
      clientIds: targetClient ? [targetClient.id] : ['client-1'],
      liveUrl: `https://${intake.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.launchup.app`,
      description: intake.summary,
      requirementDocLink: intake.apiWiringEndpoint,
      appDesignUrl: 'https://www.figma.com/design/launchup-prototype',
      dataStructureModel: 'PostgreSQL 16 Multi-Tenant + Redis Cluster',
      assignedAgents: ['Aegis Core', 'Atlas FDE', 'Chronos DevOps'],
      templatesUsed: 'Enterprise B2B SaaS Boilerplate',
      connectedServices: intake.servicesNeeded,
      integrationsActive: ['GitHub', 'Docker Hub', 'Cloud Run', 'n8n'],
      deploymentStatus: 'Provisioned',
      sandboxSynced: true,
      sandboxSyncTimestamp: 'Just now',
    });

    setRequirementIntakes(prev => prev.map(r => r.id === intakeId ? { ...r, status: 'Converted to Project' } : r));
  };

  // Workflow Trigger Action
  const triggerWorkflowRun = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === workflowId) {
        return {
          ...w,
          executionsCount: w.executionsCount + 1,
          lastExecuted: 'Just now',
        };
      }
      return w;
    }));
  };

  // Automatic Git Restore to Stable Build
  const restoreGitStableBuild = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          status: 'Live',
          healthPercent: 100,
          backupStatus: 'Healthy',
          deploymentStatus: 'Auto-Patched',
          lastBackupDate: 'Restored from stable git tag just now',
        };
      }
      return p;
    }));

    setAlerts(prev => [
      {
        id: `alert-git-restore-${Date.now()}`,
        title: 'Git Rollback Successful',
        description: `Project "${project?.name || projectId}" restored cleanly to last verified green commit. Zero downtime.`,
        type: 'success',
        timeAgo: 'Just now',
        timestamp: new Date().toISOString(),
        read: false,
        relatedEntity: project?.name,
      },
      ...prev,
    ]);
  };

  // Team Member Management
  const addTeamMember = (memberData: Omit<TeamMember, 'id' | 'avatarInitials'>) => {
    const initials = memberData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'TM';
    const newMember: TeamMember = {
      ...memberData,
      id: `tm-${Date.now()}`,
      avatarInitials: initials,
    };
    // setTeamMembers exists via functional state if needed or we update state
  };

  const removeTeamMember = (memberId: string) => {
    // handled in TeamTab or state
  };

  const addClient = (clientData: Omit<Client, 'id' | 'initials' | 'joinedDate' | 'totalSpend'>) => {
    const newId = `client-${Date.now()}`;
    const initials = clientData.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newClient: Client = {
      ...clientData,
      id: newId,
      initials: initials || 'CL',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      totalSpend: clientData.monthlySubscription || 999,
    };

    setClients((prev) => [newClient, ...prev]);

    setAlerts((prev) => [
      {
        id: `alert-${Date.now()}`,
        title: 'New Client Onboarded',
        description: `${newClient.name} (${newClient.tier}) was successfully added.`,
        type: 'success',
        timeAgo: 'Just now',
        timestamp: new Date().toISOString(),
        read: false,
        relatedEntity: newClient.name,
      },
      ...prev,
    ]);
  };

  const addProject = (projectData: Omit<Project, 'id' | 'lastBackupDate' | 'backupStatus' | 'healthPercent'>) => {
    const newId = `proj-${Date.now()}`;
    const newProj: Project = {
      ...projectData,
      id: newId,
      healthPercent: projectData.status === 'Live' ? 100 : 0,
      lastBackupDate: 'Initial commit pending',
      backupStatus: 'Healthy',
    };

    setProjects((prev) => [newProj, ...prev]);

    setClients((prevClients) =>
      prevClients.map((cl) => {
        if (newProj.clientIds.includes(cl.id)) {
          return {
            ...cl,
            projectIds: [...new Set([...cl.projectIds, newId])],
          };
        }
        return cl;
      })
    );

    setAlerts((prev) => [
      {
        id: `alert-${Date.now()}`,
        title: 'Project Initialized',
        description: `${newProj.name} created and linked to ${newProj.clientIds.length} client(s).`,
        type: 'info',
        timeAgo: 'Just now',
        timestamp: new Date().toISOString(),
        read: false,
        relatedEntity: newProj.name,
      },
      ...prev,
    ]);
  };

  const triggerDeployment = (
    projectId: string, 
    environment: 'Production' | 'Staging' | 'Preview' = 'Production'
  ) => {
    const targetProj = projects.find((p) => p.id === projectId);
    const projName = targetProj ? targetProj.name : 'Project Build';

    const newDepLog: DeploymentLog = {
      id: `dep-${Date.now()}`,
      projectId,
      projectName: projName,
      commitHash: Math.random().toString(16).substring(2, 9),
      commitMessage: 'build: automated deployment pipeline dispatch via Launch Up engine',
      author: 'Chronos DevOps (Agent)',
      timestamp: 'Just now',
      environment,
      status: 'In Progress',
      durationSeconds: 0,
      logs: [
        '[00:01] ➔ Initializing container runtime environment with lightning-fast caching...',
        '[00:03] ➔ Connecting to source git repository branch: main',
        '[00:07] ✔ Verified cryptographic signature on commit head',
        '[00:14] ➔ Compiling FDE architecture and compiling local SLM weight bindings...',
        '[00:22] ✔ Zero vulnerability audit passed (NIST SP 800-38D AES-GCM)',
        '[00:28] ➔ Provisioning edge network routing, SSL and Telemetry webhook stream...',
        '[00:35] ✔ Deployment complete! Traffic routed to live container instance.',
      ],
    };

    setDeployments((prev) => [newDepLog, ...prev]);
    setActiveDeployLog(newDepLog);
    setIsDeployModalOpen(true);

    setTimeout(() => {
      setDeployments((prev) =>
        prev.map((d) => (d.id === newDepLog.id ? { ...d, status: 'Success', durationSeconds: 35 } : d))
      );
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                status: 'Live',
                healthPercent: 100,
                deployedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              }
            : p
        )
      );
    }, 3200);
  };

  const createManualBackup = (projectId: string) => {
    const targetProj = projects.find((p) => p.id === projectId);
    const projName = targetProj ? targetProj.name : 'All Projects';

    const newBackup: BackupRecord = {
      id: `bak-${Date.now()}`,
      projectId,
      projectName: projName,
      type: 'Manual Snapshot',
      storageTarget: 'GitHub Mirror + AWS S3',
      sizeBytes: `${(Math.random() * 3 + 1).toFixed(1)} GB`,
      timestamp: 'Just now',
      status: 'Verified',
    };

    setBackups((prev) => [newBackup, ...prev]);
    setAlerts((prev) => [
      {
        id: `alert-${Date.now()}`,
        title: 'Manual Backup Verified',
        description: `Snapshot for ${projName} archived to encrypted S3 & Git mirror.`,
        type: 'success',
        timeAgo: 'Just now',
        timestamp: new Date().toISOString(),
        read: false,
        relatedEntity: projName,
      },
      ...prev,
    ]);
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, read: true } : a)));
  };

  const clearAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const toggleIntegration = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === integrationId ? { ...i, connected: !i.connected } : i))
    );
  };

  return (
    <AppContext.Provider
      value={{
        themeMode,
        setThemeMode,
        palette,
        setPalette,
        resolvedTheme,
        theme,
        setTheme,
        toggleTheme,
        currentTab,
        setCurrentTab,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        clients,
        projects,
        alerts,
        deployments,
        backups,
        invoices,
        templates,
        integrations,
        teamMembers,
        agents,
        intakes,
        slms,
        campaigns,
        telemetryPackages,
        fdeSystems,
        stackPresets,
        connectedApps,
        requirementIntakes,
        workflows,
        addClient,
        addProject,
        triggerDeployment,
        createManualBackup,
        markAlertAsRead,
        clearAlert,
        toggleIntegration,
        dispatchAgentTask,
        submitBusinessIntake,
        trainSLMModel,
        addSLMModel,
        triggerAutoUpdate,
        rebalanceCampaign,
        createCampaign,
        deployFDESystem,
        addStackPreset,
        toggleAppInstall,
        submitRequirementIntake,
        convertIntakeToProject,
        triggerWorkflowRun,
        restoreGitStableBuild,
        addTeamMember,
        removeTeamMember,
        selectedClient,
        setSelectedClient,
        selectedProject,
        setSelectedProject,
        isAddClientModalOpen,
        setIsAddClientModalOpen,
        isCreateProjectModalOpen,
        setIsCreateProjectModalOpen,
        isDeployModalOpen,
        setIsDeployModalOpen,
        activeDeployLog,
        setActiveDeployLog,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isUpgradeModalOpen,
        setIsUpgradeModalOpen,
        isClientPortalModalOpen,
        setIsClientPortalModalOpen,
        activeCanvasProjectId,
        setActiveCanvasProjectId,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
