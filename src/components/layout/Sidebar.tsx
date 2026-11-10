import React from 'react';
import { 
  LayoutDashboard, Users, FolderKanban, Rocket, LayoutTemplate, 
  Layers, BarChart3, Bell, UserCheck, Settings, Crown, ChevronDown,
  Database, Zap, Bot, Network, Cpu, Megaphone, Radio, GitFork, 
  SlidersHorizontal, Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TabId } from '../../types';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  highlight?: boolean;
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
    agents,
    telemetryPackages,
    connectedApps,
    setIsUpgradeModalOpen
  } = useApp();

  const unreadAlerts = alerts.filter((a) => !a.read).length;

  // Exact left navbar items ordered as requested by user:
  // - Dashboard
  // - Clients
  // - Projects
  // - SLM Lab
  // - Deployments
  // - Templates
  // - Connected Apps
  // - Analytics
  // - Team
  // - AMS (Agent Management System)
  // - Remote Telemetry
  // - Services
  // - Workflows
  // - Alerts
  // - Settings
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users, badge: clients.length },
    { id: 'projects', label: 'Projects', icon: FolderKanban, badge: projects.length },
    { id: 'slm-lab', label: 'SLM Lab', icon: Cpu, badge: 'Edge' },
    { id: 'deployments', label: 'Deployments', icon: Rocket },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'connected-apps', label: 'Connected Apps', icon: Layers, badge: 'Plugins' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: UserCheck },
    { id: 'ams', label: 'AMS (Agent Mgmt)', icon: Bot, badge: 'Swarm', highlight: true },
    { id: 'remote-telemetry', label: 'Remote Telemetry', icon: Radio, badge: telemetryPackages.length },
    { id: 'services', label: 'Services', icon: Network, badge: 'FDE' },
    { id: 'workflows', label: 'Workflows', icon: GitFork, badge: 'n8n' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlerts > 0 ? unreadAlerts : undefined },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];


  return (
    <>
      {/* Mobile Backdrop */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-[#0B0F17] border-r border-slate-200/90 dark:border-slate-800/80 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed 
            ? '-translate-x-full lg:translate-x-0 lg:w-20' 
            : 'translate-x-0 w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div 
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* Launch Up Rocket/Energy Logo */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white text-white rotate-12" />
            </div>
            
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  Launch Up
                </span>
                <span className="text-[10px] font-medium tracking-wide uppercase text-indigo-600 dark:text-indigo-400 -mt-1">
                  Enterprise Orchestrator
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  // Auto close on small screens
                  if (window.innerWidth < 1024) {
                    setIsSidebarCollapsed(true);
                  }
                }}
                title={item.label}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 dark:bg-indigo-600 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                
                {!isSidebarCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!isSidebarCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Docs'
                        ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: User info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
          {/* User profile row */}
          <div className={`flex items-center gap-2.5 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-600">
              AD
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                  Alex Doe
                </p>
                <p className="text-[11px] text-slate-400 truncate leading-tight">
                  admin@launchup.io
                </p>
              </div>
            )}
            {!isSidebarCollapsed && (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
