import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Layers, Edit3, Smartphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TemplatesTab } from './TemplatesTab';
import { IntegrationsTab } from './IntegrationsTab';
import { NoCodeEditorTab } from './NoCodeEditorTab';
import { PreviewStudioTab } from './PreviewStudioTab';

export const ToolsAppsTab: React.FC = () => {
  const { currentTab, setCurrentTab } = useApp();

  const getInitialSubTab = (): 'templates' | 'integrations' | 'nocode-editor' | 'preview-studio' => {
    if (currentTab === 'integrations' || currentTab === 'connected-apps') return 'integrations';
    if (currentTab === 'nocode-editor') return 'nocode-editor';
    if (currentTab === 'preview-studio') return 'preview-studio';
    return 'templates';
  };

  const [activeSubTab, setActiveSubTab] = useState<'templates' | 'integrations' | 'nocode-editor' | 'preview-studio'>(getInitialSubTab);

  useEffect(() => {
    if (currentTab === 'integrations' || currentTab === 'connected-apps') setActiveSubTab('integrations');
    else if (currentTab === 'nocode-editor') setActiveSubTab('nocode-editor');
    else if (currentTab === 'preview-studio') setActiveSubTab('preview-studio');
    else if (currentTab === 'templates' || currentTab === 'tools-apps') setActiveSubTab('templates');
  }, [currentTab]);

  const handleSelectSubTab = (id: 'templates' | 'integrations' | 'nocode-editor' | 'preview-studio') => {
    setActiveSubTab(id);
    setCurrentTab(id);
  };

  const subTabs = [
    { id: 'templates' as const, label: 'Project Templates', icon: LayoutTemplate },
    { id: 'integrations' as const, label: 'Connected Accounts', icon: Layers },
    { id: 'nocode-editor' as const, label: 'Visual Page Editor', icon: Edit3 },
    { id: 'preview-studio' as const, label: 'Device Previewer', icon: Smartphone },
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
      {activeSubTab === 'templates' && <TemplatesTab />}
      {activeSubTab === 'integrations' && <IntegrationsTab />}
      {activeSubTab === 'nocode-editor' && <NoCodeEditorTab />}
      {activeSubTab === 'preview-studio' && <PreviewStudioTab />}
    </div>
  );
};
