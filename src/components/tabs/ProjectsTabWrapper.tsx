import React, { useState, useEffect } from 'react';
import { FolderKanban, Sparkles, Rocket } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProjectsTab } from './ProjectsTab';
import { ProjectBuilderTab } from './ProjectBuilderTab';
import { DeploymentsTab } from './DeploymentsTab';

export const ProjectsTabWrapper: React.FC = () => {
  const { currentTab, setCurrentTab } = useApp();

  const getInitialSubTab = (): 'projects' | 'project-builder' | 'deployments' => {
    if (currentTab === 'project-builder') return 'project-builder';
    if (currentTab === 'deployments') return 'deployments';
    return 'projects';
  };

  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'project-builder' | 'deployments'>(getInitialSubTab);

  useEffect(() => {
    if (currentTab === 'project-builder') setActiveSubTab('project-builder');
    else if (currentTab === 'deployments') setActiveSubTab('deployments');
    else if (currentTab === 'projects') setActiveSubTab('projects');
  }, [currentTab]);

  const handleSelectSubTab = (id: 'projects' | 'project-builder' | 'deployments') => {
    setActiveSubTab(id);
    setCurrentTab(id);
  };

  const subTabs = [
    { id: 'projects' as const, label: 'All Projects', icon: FolderKanban },
    { id: 'project-builder' as const, label: 'Project Builder', icon: Sparkles },
    { id: 'deployments' as const, label: 'Deployments & Releases', icon: Rocket },
  ];

  return (
    <div className="space-y-4">
      {/* Segmented Sub-View Switcher Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800">
          {subTabs.map((sub) => {
            const active = activeSubTab === sub.id;
            const Icon = sub.icon;
            return (
              <button
                key={sub.id}
                id={`subtab-${sub.id}`}
                type="button"
                onClick={() => handleSelectSubTab(sub.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Sub-View */}
      {activeSubTab === 'projects' && <ProjectsTab />}
      {activeSubTab === 'project-builder' && <ProjectBuilderTab />}
      {activeSubTab === 'deployments' && <DeploymentsTab />}
    </div>
  );
};
