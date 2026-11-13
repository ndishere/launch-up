import React, { useState, useEffect } from 'react';
import { Bot, Cpu, GitFork } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AgentCompanyTab } from './AgentCompanyTab';
import { SLMLabTab } from './SLMLabTab';
import { N8nWorkflowsTab } from './N8nWorkflowsTab';

export const AIWorkshopTab: React.FC = () => {
  const { currentTab, setCurrentTab } = useApp();

  const getInitialSubTab = (): 'agent-company' | 'slm-lab' | 'n8n-workflows' => {
    if (currentTab === 'slm-lab') return 'slm-lab';
    if (currentTab === 'n8n-workflows' || currentTab === 'workflows') return 'n8n-workflows';
    return 'agent-company';
  };

  const [activeSubTab, setActiveSubTab] = useState<'agent-company' | 'slm-lab' | 'n8n-workflows'>(getInitialSubTab);

  useEffect(() => {
    if (currentTab === 'slm-lab') setActiveSubTab('slm-lab');
    else if (currentTab === 'n8n-workflows' || currentTab === 'workflows') setActiveSubTab('n8n-workflows');
    else if (currentTab === 'agent-company' || currentTab === 'ams' || currentTab === 'ai-workshop') setActiveSubTab('agent-company');
  }, [currentTab]);

  const handleSelectSubTab = (id: 'agent-company' | 'slm-lab' | 'n8n-workflows') => {
    setActiveSubTab(id);
    setCurrentTab(id);
  };

  const subTabs = [
    { id: 'agent-company' as const, label: 'AI Team Helpers', icon: Bot },
    { id: 'slm-lab' as const, label: 'AI Models & Local PC', icon: Cpu },
    { id: 'n8n-workflows' as const, label: 'Automation Flows', icon: GitFork },
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
      {activeSubTab === 'agent-company' && <AgentCompanyTab />}
      {activeSubTab === 'slm-lab' && <SLMLabTab />}
      {activeSubTab === 'n8n-workflows' && <N8nWorkflowsTab />}
    </div>
  );
};
