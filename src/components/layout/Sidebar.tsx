import React from 'react';
import { 
  LayoutDashboard, Users, FolderKanban, Rocket, LayoutTemplate, 
  Layers, BarChart3, Bell, UserCheck, Settings, Crown,
  Bot, Network, Cpu, Radio, GitFork
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TabId } from '../../types';
import { LaunchUpLogo } from '../common/LaunchUpLogo';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
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
    telemetryPackages,
    setIsUpgradeModalOpen
  } = useApp();

  const unreadAlerts = alerts.filter((a) => !a.read).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users, badge: clients.length },
    { id: 'projects', label: 'Projects', icon: FolderKanban, badge: projects.length },
    { id: 'services', label: 'Services', icon: Network, badge: unreadAlerts > 0 ? unreadAlerts : undefined },
    { id: 'tools-apps', label: 'Tools/Apps', icon: Layers },
    { id: 'ai-workshop', label: 'AI Workshop', icon: Cpu },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'team', label: 'Teams', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const isProjectsActive =
    currentTab === 'projects' ||
    currentTab === 'project-builder' ||
    currentTab === 'deployments' ||
    currentTab === 'project-canvas';

  const isServicesActive =
    currentTab === 'services' ||
    currentTab === 'marketing-engine' ||
    currentTab === 'alerts' ||
    currentTab === 'telemetry-hub' ||
    currentTab === 'remote-telemetry' ||
    currentTab === 'fde-systems';

  const isToolsAppsActive =
    currentTab === 'tools-apps' ||
    currentTab === 'templates' ||
    currentTab === 'integrations' ||
    currentTab === 'connected-apps' ||
    currentTab === 'nocode-editor' ||
    currentTab === 'preview-studio';

  const isAiWorkshopActive =
    currentTab === 'ai-workshop' ||
    currentTab === 'agent-company' ||
    currentTab === 'ams' ||
    currentTab === 'slm-lab' ||
    currentTab === 'workflows' ||
    currentTab === 'n8n-workflows';

  const isSettingsActive =
    currentTab === 'settings' ||
    currentTab === 'billing' ||
    currentTab === 'system-design';

  return (
    <>
      {/* Mobile Backdrop */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-slate-950/30 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0D1017] transition-all duration-200 ${
          isSidebarCollapsed
            ? '-translate-x-full lg:translate-x-0 lg:w-[68px]'
            : 'translate-x-0 w-60'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <LaunchUpLogo size={34} />
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 tracking-tight truncate">
                  Launch Up
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  Control Plane
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.id === 'dashboard'
                ? currentTab === 'dashboard'
                : item.id === 'clients'
                ? currentTab === 'clients'
                : item.id === 'projects'
                ? isProjectsActive
                : item.id === 'services'
                ? isServicesActive
                : item.id === 'tools-apps'
                ? isToolsAppsActive
                : item.id === 'ai-workshop'
                ? isAiWorkshopActive
                : item.id === 'analytics'
                ? currentTab === 'analytics'
                : item.id === 'team'
                ? currentTab === 'team'
                : item.id === 'settings'
                ? isSettingsActive
                : false;

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
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors relative ${
                  isActive
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                {!isSidebarCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md tabular-nums ${
                          isActive
                            ? 'bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300'
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

        {/* Bottom Workspace Profile */}
        <div className="p-2.5 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1.5 shrink-0">
          {!isSidebarCollapsed && (
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="w-full py-1.5 px-2.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-800"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Agency Plan</span>
            </button>
          )}

          <div
            onClick={() => setCurrentTab('settings')}
            className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Account & Settings"
          >
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
              AD
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                  Alex Doe
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  Admin
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
