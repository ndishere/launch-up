import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Tabs
import { DashboardTab } from './components/tabs/DashboardTab';
import { ClientsTab } from './components/tabs/ClientsTab';
import { ProjectsTabWrapper } from './components/tabs/ProjectsTabWrapper';
import { ServicesTab } from './components/tabs/ServicesTab';
import { ToolsAppsTab } from './components/tabs/ToolsAppsTab';
import { AIWorkshopTab } from './components/tabs/AIWorkshopTab';
import { AnalyticsTab } from './components/tabs/AnalyticsTab';
import { TeamTab } from './components/tabs/TeamTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { BillingTab } from './components/tabs/BillingTab';
import { SystemDesignTab } from './components/tabs/SystemDesignTab';
import { ProjectCanvasTab } from './components/tabs/ProjectCanvasTab';

// Modals & Drawers
import { CreateProjectModal } from './components/modals/CreateProjectModal';
import { AddClientModal } from './components/modals/AddClientModal';
import { DeploymentLogModal } from './components/modals/DeploymentLogModal';
import { ClientDetailDrawer } from './components/modals/ClientDetailDrawer';
import { CommandPalette } from './components/modals/CommandPalette';
import { UpgradePlanModal } from './components/modals/UpgradePlanModal';
import { ClientPortalModal } from './components/modals/ClientPortalModal';
import { ProjectWorkspaceModal } from './components/workspace/ProjectWorkspaceModal';

const AppLayout: React.FC = () => {
  const { currentTab } = useApp();

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'clients':
        return <ClientsTab />;
      case 'projects':
      case 'project-builder':
      case 'deployments':
        return <ProjectsTabWrapper />;
      case 'project-canvas':
        return <ProjectCanvasTab />;
      case 'services':
      case 'marketing-engine':
      case 'alerts':
      case 'telemetry-hub':
      case 'remote-telemetry':
      case 'fde-systems':
        return <ServicesTab />;
      case 'tools-apps':
      case 'templates':
      case 'integrations':
      case 'connected-apps':
      case 'nocode-editor':
      case 'preview-studio':
        return <ToolsAppsTab />;
      case 'ai-workshop':
      case 'agent-company':
      case 'ams':
      case 'slm-lab':
      case 'workflows':
      case 'n8n-workflows':
        return <AIWorkshopTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'team':
        return <TeamTab />;
      case 'settings':
        return <SettingsTab />;
      case 'billing':
        return <BillingTab />;
      case 'system-design':
        return <SystemDesignTab />;
      default:
        return <DashboardTab />;
    }
  };


  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/80 dark:bg-[#090B10] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 sm:px-7 py-5 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>

      {/* Global Interactive Modals and Drawers */}
      <CreateProjectModal />
      <AddClientModal />
      <ClientPortalModal />
      <DeploymentLogModal />
      <ClientDetailDrawer />
      <CommandPalette />
      <UpgradePlanModal />
      <ProjectWorkspaceModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
