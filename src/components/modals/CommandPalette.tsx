import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Rocket, Building, Plus, LayoutDashboard, 
  FolderKanban, Layers, Database, Shield, X, ArrowRight,
  Sun, Moon, Monitor, Palette, CreditCard, Users, Bell, Settings, Check,
  BarChart3, Cpu, Globe, Server, Bot, Network, Megaphone, Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    currentTab,
    setCurrentTab, 
    setIsCreateProjectModalOpen, 
    setIsAddClientModalOpen,
    setIsUpgradeModalOpen,
    setSelectedClient,
    setSelectedProject,
    toggleTheme,
    theme,
    themeMode,
    setThemeMode,
    palette,
    setPalette,
    resolvedTheme,
    projects,
    clients,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with global search query when palette opens
  useEffect(() => {
    if (isCommandPaletteOpen) {
      if (searchQuery) {
        setQuery(searchQuery);
      }
      setSelectedIndex(0);
      // Ensure focus is applied smoothly
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen, searchQuery]);

  // Handle keyboard navigation within the list (Up/Down/Enter)
  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    const handleListNavigation = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].run();
        }
      }
    };

    window.addEventListener('keydown', handleListNavigation);
    return () => window.removeEventListener('keydown', handleListNavigation);
  }, [isCommandPaletteOpen, selectedIndex]);

  // Base list of platform navigation and actions
  const staticItems = useMemo(() => [
    {
      id: 'act-create-project',
      title: 'Create New Project',
      subtitle: 'Launch 4-step wizard with repo & target server setup',
      category: 'Actions' as const,
      icon: Plus,
      badge: 'Wizard',
      run: () => {
        setIsCommandPaletteOpen(false);
        setIsCreateProjectModalOpen(true);
      },
    },
    {
      id: 'act-onboard-client',
      title: 'Onboard New Client',
      subtitle: 'Intake client details, SLA tier, and link projects',
      category: 'Actions' as const,
      icon: Building,
      badge: 'B2B/B2C',
      run: () => {
        setIsCommandPaletteOpen(false);
        setIsAddClientModalOpen(true);
      },
    },
    {
      id: 'act-agent-swarm',
      title: 'Company of Agents Cockpit',
      subtitle: 'Dispatch autonomous tasks to specialist agents',
      category: 'Actions' as const,
      icon: Bot,
      badge: 'Agents',
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('agent-company');
      },
    },
    {
      id: 'act-slm-train',
      title: 'Train Small Language Model (SLM)',
      subtitle: 'Quantize and test local 1.5B - 3.8B domain models',
      category: 'Actions' as const,
      icon: Cpu,
      badge: 'SLM',
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('slm-lab');
      },
    },
    {
      id: 'act-fde-system',
      title: 'FDE Management Systems',
      subtitle: 'CQRS, event sourcing & realtime online architectures',
      category: 'Actions' as const,
      icon: Network,
      badge: 'FDE',
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('fde-systems');
      },
    },
    {
      id: 'act-marketing-auto',
      title: 'Marketing Automation Engine',
      subtitle: 'Autonomous ad creation, programmatic SEO & ROAS optimization',
      category: 'Actions' as const,
      icon: Megaphone,
      badge: 'Growth',
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('marketing-engine');
      },
    },
    {
      id: 'act-telemetry-hub',
      title: 'Remote Telemetry & Auto-Updates',
      subtitle: 'Live client stdout stream & autonomous canary hot-patching',
      category: 'Actions' as const,
      icon: Radio,
      badge: 'Logs',
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('telemetry-hub');
      },
    },
    {
      id: 'act-mode-dark',
      title: 'Appearance: Dark Mode',
      subtitle: 'Switch workspace interface to dark obsidian mode',
      category: 'Actions' as const,
      icon: Moon,
      badge: 'Mode',
      run: () => {
        setThemeMode('dark');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-mode-light',
      title: 'Appearance: Light Mode',
      subtitle: 'Switch workspace interface to crisp light mode',
      category: 'Actions' as const,
      icon: Sun,
      badge: 'Mode',
      run: () => {
        setThemeMode('light');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-mode-system',
      title: 'Appearance: System Mode',
      subtitle: `Synchronize appearance automatically with device OS (${resolvedTheme})`,
      category: 'Actions' as const,
      icon: Monitor,
      badge: 'Mode',
      run: () => {
        setThemeMode('system');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-pal-indigo',
      title: 'Color Palette: Indigo Obsidian',
      subtitle: 'Default classic tech violet & deep indigo accents',
      category: 'Actions' as const,
      icon: Palette,
      badge: 'Palette',
      run: () => {
        setPalette('indigo');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-pal-cyan',
      title: 'Color Palette: Cyber Cyan',
      subtitle: 'Electric teal & futuristic cyber cyan accents',
      category: 'Actions' as const,
      icon: Palette,
      badge: 'Palette',
      run: () => {
        setPalette('cyan');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-pal-emerald',
      title: 'Color Palette: Emerald Matrix',
      subtitle: 'Terminal matrix jade green accents',
      category: 'Actions' as const,
      icon: Palette,
      badge: 'Palette',
      run: () => {
        setPalette('emerald');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-pal-amber',
      title: 'Color Palette: Sunset Amber',
      subtitle: 'Warm solar gold & amber radiant glow',
      category: 'Actions' as const,
      icon: Palette,
      badge: 'Palette',
      run: () => {
        setPalette('amber');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-pal-rose',
      title: 'Color Palette: Rose Amethyst',
      subtitle: 'Vibrant crimson & magenta rose accents',
      category: 'Actions' as const,
      icon: Palette,
      badge: 'Palette',
      run: () => {
        setPalette('rose');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-billing',
      title: 'Upgrade Subscription Plan',
      subtitle: 'View enterprise tiers, cloud quotas, and SLA options',
      category: 'Actions' as const,
      icon: CreditCard,
      badge: 'Billing',
      run: () => {
        setIsCommandPaletteOpen(false);
        setIsUpgradeModalOpen(true);
      },
    },
    {
      id: 'nav-dashboard',
      title: 'Dashboard Overview',
      subtitle: 'Health metrics, deployment status, and system alerts',
      category: 'Navigation' as const,
      icon: LayoutDashboard,
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('dashboard');
      },
    },
    {
      id: 'nav-projects',
      title: 'Projects Orchestration',
      subtitle: 'Manage client-linked projects, repos, and backups',
      category: 'Navigation' as const,
      icon: FolderKanban,
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('projects');
      },
    },
    {
      id: 'nav-clients',
      title: 'Client Management',
      subtitle: 'Directory of enterprise B2B and startup B2C clients',
      category: 'Navigation' as const,
      icon: Users,
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('clients');
      },
    },
    {
      id: 'nav-deployments',
      title: 'Cloud Deployments & CI/CD',
      subtitle: 'Live logs, rollback triggers, and server pipeline',
      category: 'Navigation' as const,
      icon: Rocket,
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('deployments');
      },
    },
    {
      id: 'nav-system-design',
      title: 'System Design & Architecture',
      subtitle: 'Interactive architecture flow, DB schema, and SDLC docs',
      category: 'Navigation' as const,
      icon: Database,
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('system-design');
      },
    },
    {
      id: 'nav-templates',
      title: 'Starter Templates',
      subtitle: 'Production boilerplates for SaaS, E-comm, and AI apps',
      category: 'Navigation' as const,
      icon: Layers,
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('templates');
      },
    },
    {
      id: 'nav-analytics',
      title: 'Marketing & Analytics',
      subtitle: 'Traffic graphs, SEO health, conversion rates, and ROI',
      category: 'Navigation' as const,
      icon: BarChart3,
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('analytics');
      },
    },
    {
      id: 'nav-alerts',
      title: 'System Alerts & Monitoring',
      subtitle: 'Real-time pipeline incidents and performance warnings',
      category: 'Navigation' as const,
      icon: Bell,
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('alerts');
      },
    },
    {
      id: 'nav-settings',
      title: 'Settings & Security Vault',
      subtitle: 'API secrets, environment keys, and audit logs',
      category: 'Navigation' as const,
      icon: Settings,
      run: () => {
        setIsCommandPaletteOpen(false);
        setCurrentTab('settings');
      },
    },
  ], [theme, toggleTheme, setIsCommandPaletteOpen, setIsCreateProjectModalOpen, setIsAddClientModalOpen, setIsUpgradeModalOpen, setCurrentTab]);

  // Search items incorporating dynamic clients and projects
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1. Matched Client records
    const matchedClients = clients
      .filter(c => 
        !q || 
        c.name.toLowerCase().includes(q) || 
        c.domain.toLowerCase().includes(q) || 
        c.tier.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
      .map(c => ({
        id: `client-${c.id}`,
        title: c.name,
        subtitle: `${c.domain} · ${c.tier} (${c.projectIds.length} projects)`,
        category: 'Clients' as const,
        icon: Building,
        badge: c.tier.includes('B2B') ? 'B2B' : 'B2C',
        run: () => {
          setSelectedClient(c);
          setCurrentTab('clients');
          setIsCommandPaletteOpen(false);
        }
      }));

    // 2. Matched Project records
    const matchedProjects = projects
      .filter(p => 
        !q || 
        p.name.toLowerCase().includes(q) || 
        p.type.toLowerCase().includes(q) || 
        p.framework.toLowerCase().includes(q) ||
        p.serverTarget.toLowerCase().includes(q)
      )
      .map(p => ({
        id: `project-${p.id}`,
        title: p.name,
        subtitle: `${p.type} · ${p.framework} on ${p.serverTarget}`,
        category: 'Projects' as const,
        icon: Server,
        badge: p.status,
        run: () => {
          setSelectedProject(p);
          setCurrentTab('projects');
          setIsCommandPaletteOpen(false);
        }
      }));

    // 3. Matched Actions & Navigation
    const matchedStatic = staticItems.filter(item => 
      !q || 
      item.title.toLowerCase().includes(q) || 
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );

    // If there is an active search term, prioritize direct entities (Projects & Clients)
    if (q) {
      return [...matchedProjects, ...matchedClients, ...matchedStatic];
    }

    // Default view: Actions first, then Navigation, then quick samples
    return [...matchedStatic, ...matchedProjects.slice(0, 3), ...matchedClients.slice(0, 3)];
  }, [query, clients, projects, staticItems, setSelectedClient, setSelectedProject, setCurrentTab, setIsCommandPaletteOpen]);

  // Keep selected index within valid bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isCommandPaletteOpen) return null;

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsCommandPaletteOpen(false);
        }
      }}
    >
      <div 
        className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, clients, commands, or jump to screen..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchQuery(e.target.value);
            }}
            className="w-full text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Close (ESC)"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filter / Summary Row */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#0B0F17]/60 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-medium">
            {filteredItems.length} result{filteredItems.length === 1 ? '' : 's'} {query ? `for "${query}"` : 'available'}
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] shadow-2xs">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] shadow-2xs">↵</kbd> select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] shadow-2xs">ESC</kbd> close
            </span>
          </div>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1 text-xs">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium text-slate-600 dark:text-slate-300">No matching results found</p>
              <p className="text-[11px] mt-0.5">Try searching for &quot;CRM&quot;, &quot;TechFlow&quot;, &quot;Deploy&quot;, or &quot;Schema&quot;</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={item.run}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left transition-all group ${
                    isSelected 
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs' 
                      : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold text-xs truncate ${
                        isSelected 
                          ? 'text-indigo-950 dark:text-white' 
                          : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.badge && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        item.badge === 'Live' || item.badge === 'Wizard'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded font-medium">
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${
                      isSelected 
                        ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5 opacity-100' 
                        : 'opacity-0 -translate-x-1'
                    }`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50/70 dark:bg-[#0E131E] border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Launch Up Command Engine
          </span>
          <span>
            Shortcut: <kbd className="font-semibold text-slate-700 dark:text-slate-300">{shortcutLabel}</kbd>
          </span>
        </div>
      </div>
    </div>
  );
};
