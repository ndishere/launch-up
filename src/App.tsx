import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Tabs
import { DashboardTab } from './components/tabs/DashboardTab';
import { AgentCompanyTab } from './components/tabs/AgentCompanyTab';
import { FDESystemsTab } from './components/tabs/FDESystemsTab';
import { SLMLabTab } from './components/tabs/SLMLabTab';
import { MarketingEngineTab } from './components/tabs/MarketingEngineTab';
import { TelemetryHubTab } from './components/tabs/TelemetryHubTab';
import { ProjectsTab } from './components/tabs/ProjectsTab';
import { ClientsTab } from './components/tabs/ClientsTab';
import { DeploymentsTab } from './components/tabs/DeploymentsTab';
import { SystemDesignTab } from './components/tabs/SystemDesignTab';
import { TemplatesTab } from './components/tabs/TemplatesTab';
import { IntegrationsTab } from './components/tabs/IntegrationsTab';
import { AnalyticsTab } from './components/tabs/AnalyticsTab';
import { AlertsTab } from './components/tabs/AlertsTab';
import { TeamTab } from './components/tabs/TeamTab';
import { BillingTab } from './components/tabs/BillingTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { ProjectCanvasTab } from './components/tabs/ProjectCanvasTab';
import { ConnectedAppsTab } from './components/tabs/ConnectedAppsTab';
import { WorkflowsTab } from './components/tabs/WorkflowsTab';

// Modals & Drawers
import { CreateProjectModal } from './components/modals/CreateProjectModal';
import { AddClientModal } from './components/modals/AddClientModal';
import { DeploymentLogModal } from './components/modals/DeploymentLogModal';
import { ClientDetailDrawer } from './components/modals/ClientDetailDrawer';
import { CommandPalette } from './components/modals/CommandPalette';
import { UpgradePlanModal } from './components/modals/UpgradePlanModal';
import { ClientPortalModal } from './components/modals/ClientPortalModal';

const AppLayout: React.FC = () => {
  const { currentTab } = useApp();

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'clients':
        return <ClientsTab />;
      case 'projects':
        return <ProjectsTab />;
      case 'project-canvas':
        return <ProjectCanvasTab />;
      case 'slm-lab':
        return <SLMLabTab />;
      case 'deployments':
        return <DeploymentsTab />;
      case 'templates':
        return <TemplatesTab />;
      case 'connected-apps':
        return <ConnectedAppsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'team':
        return <TeamTab />;
      case 'ams':
      case 'agent-company':
        return <AgentCompanyTab />;
      case 'remote-telemetry':
      case 'telemetry-hub':
        return <TelemetryHubTab />;
      case 'services':
      case 'fde-systems':
        return <FDESystemsTab />;
      case 'workflows':
        return <WorkflowsTab />;
      case 'alerts':
        return <AlertsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'marketing-engine':
        return <MarketingEngineTab />;
      case 'integrations':
        return <IntegrationsTab />;
      case 'billing':
        return <BillingTab />;
      case 'system-design':
        return <SystemDesignTab />;
      default:
        return <DashboardTab />;
    }
  };


  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
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
