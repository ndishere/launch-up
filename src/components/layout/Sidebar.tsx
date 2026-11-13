import React from 'react';
import { 
  LayoutDashboard, Users, FolderKanban, Network, Layers, 
  Bot, BarChart3, UserCheck, Settings, Crown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TabId } from '../../types';
import { LaunchUpLogo } from '../common/LaunchUpLogo';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  matchTabs?: TabId[];
}

export const Sidebar: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    isSidebarCollapsed, 
    setIsSidebarCollapsed,
    alerts,
    projects,
    clients,
    uiThemeStyle,
    setIsUpgradeModalOpen
  } = useApp();

  const isPrototype = uiThemeStyle === 'prototype';
  const unreadAlerts = alerts.filter((a) => !a.read).length;

  // The 9 Canonical Navigation Tabs
  const navItems: NavItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      matchTabs: ['dashboard']
    },
    { 
      id: 'clients', 
      label: 'Clients', 
      icon: Users, 
      badge: clients.length,
      matchTabs: ['clients']
    },
    { 
      id: 'projects', 
      label: 'Projects', 
      icon: FolderKanban, 
      badge: projects.length,
      matchTabs: ['projects', 'project-canvas', 'project-builder', 'nocode-editor', 'preview-studio']
    },
    { 
      id: 'services', 
      label: 'Services', 
      icon: Network,
      matchTabs: ['services', 'fde-systems', 'marketing-engine']
    },
    { 
      id: 'connected-apps', 
      label: 'Tools/Apps', 
      icon: Layers,
      matchTabs: ['connected-apps', 'templates', 'integrations', 'deployments']
    },
    { 
      id: 'ams', 
      label: 'AI Workshop', 
      icon: Bot,
      matchTabs: ['ams', 'agent-company', 'slm-lab', 'workflows', 'n8n-workflows', 'remote-telemetry', 'telemetry-hub']
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      matchTabs: ['analytics', 'billing']
    },
    { 
      id: 'team', 
      label: 'Teams', 
      icon: UserCheck, 
      badge: unreadAlerts > 0 ? unreadAlerts : undefined,
      matchTabs: ['team', 'alerts', 'system-design']
    },
  ];

  const isTabActive = (item: NavItem) => {
    if (item.matchTabs) {
      return item.matchTabs.includes(currentTab);
    }
    return currentTab === item.id;
  };

  const isSettingsActive = currentTab === 'settings';

  return (
    <>
      {/* Mobile Backdrop */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-slate-950/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-200 ${
          isSidebarCollapsed
            ? '-translate-x-full lg:translate-x-0 lg:w-[68px]'
            : 'translate-x-0 w-[220px]'
        } ${
          isPrototype
            ? 'border-[var(--line)]'
            : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0D1017]'
        }`}
        style={
          isPrototype
            ? { backgroundColor: 'var(--side)', color: 'var(--sidetxt)' }
            : undefined
        }
      >
        {/* Brand Header */}
        <div
          className={`h-[72px] flex items-center justify-between px-4 border-b shrink-0 ${
            isPrototype ? 'border-white/10' : 'border-slate-200/80 dark:border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <LaunchUpLogo size={34} />
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span
                  className={`font-bold text-sm tracking-tight truncate ${
                    isPrototype ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  Launch Up
                </span>
                <span
                  className={`text-[10px] font-medium truncate ${
                    isPrototype ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  Agency Control Plane
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 9 Primary Navigation Tabs */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isTabActive(item);

            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (window.innerWidth < 1024) {
                    setIsSidebarCollapsed(true);
                  }
                }}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all relative cursor-pointer ${
                  active
                    ? isPrototype
                      ? 'text-white font-semibold shadow-xs'
                      : 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : isPrototype
                    ? 'text-[var(--sidetxt)] opacity-75 hover:opacity-100 hover:bg-white/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                style={
                  active && isPrototype
                    ? { backgroundColor: 'var(--acc)', color: '#ffffff' }
                    : undefined
                }
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active
                      ? isPrototype
                        ? 'text-white'
                        : 'text-indigo-600 dark:text-indigo-400'
                      : isPrototype
                      ? 'text-slate-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                {!isSidebarCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left font-medium">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                          active
                            ? isPrototype
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300'
                            : isPrototype
                            ? 'bg-white/10 text-slate-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* 9th Tab: Settings (Pinned to Bottom) + Owner Profile Footer */}
        <div
          className={`p-2.5 border-t shrink-0 space-y-2 ${
            isPrototype ? 'border-white/10' : 'border-slate-200/80 dark:border-slate-800/80'
          }`}
        >
          {/* Pinned Tab 9: Settings */}
          <button
            id="nav-tab-settings"
            onClick={() => {
              setCurrentTab('settings');
              if (window.innerWidth < 1024) {
                setIsSidebarCollapsed(true);
              }
            }}
            title={isSidebarCollapsed ? 'Settings' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
              isSettingsActive
                ? isPrototype
                  ? 'text-white font-semibold shadow-xs'
                  : 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                : isPrototype
                ? 'text-[var(--sidetxt)] opacity-75 hover:opacity-100 hover:bg-white/10'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            style={
              isSettingsActive && isPrototype
                ? { backgroundColor: 'var(--acc)', color: '#ffffff' }
                : undefined
            }
          >
            <Settings
              className={`w-4 h-4 shrink-0 ${
                isSettingsActive
                  ? isPrototype
                    ? 'text-white'
                    : 'text-indigo-600 dark:text-indigo-400'
                  : isPrototype
                  ? 'text-slate-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            {!isSidebarCollapsed && (
              <span className="truncate flex-1 text-left font-medium">Settings</span>
            )}
          </button>

          {/* Owner Profile Footer */}
          {!isSidebarCollapsed && (
            <div
              className={`pt-2 border-t flex items-center justify-between gap-2 px-1 ${
                isPrototype ? 'border-white/10' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded-full text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: 'var(--acc)' }}
                >
                  O
                </div>
                <div className="truncate flex flex-col">
                  <span
                    className={`text-xs font-semibold leading-tight truncate ${
                      isPrototype ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    Launch Up Agency
                  </span>
                  <span
                    className={`text-[10px] leading-tight truncate ${
                      isPrototype ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    Owner (Pro Tier)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className={`p-1.5 rounded-lg text-amber-400 hover:bg-white/10 transition-colors shrink-0`}
                title="Upgrade Plan"
              >
                <Crown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
