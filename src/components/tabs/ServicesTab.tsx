import React, { useState, useEffect } from 'react';
import { Share2, ShieldAlert, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MarketingEngineTab } from './MarketingEngineTab';
import { AlertsTab } from './AlertsTab';
import { TelemetryHubTab } from './TelemetryHubTab';

export const ServicesTab: React.FC = () => {
  const { currentTab, setCurrentTab, alerts } = useApp();

  const unreadAlerts = alerts.filter((a) => !a.read).length;

  const getInitialSubTab = (): 'marketing-engine' | 'alerts' | 'telemetry-hub' => {
    if (currentTab === 'alerts') return 'alerts';
    if (currentTab === 'telemetry-hub' || currentTab === 'remote-telemetry') return 'telemetry-hub';
    return 'marketing-engine';
  };

  const [activeSubTab, setActiveSubTab] = useState<'marketing-engine' | 'alerts' | 'telemetry-hub'>(getInitialSubTab);

  useEffect(() => {
    if (currentTab === 'alerts') setActiveSubTab('alerts');
    else if (currentTab === 'telemetry-hub' || currentTab === 'remote-telemetry') setActiveSubTab('telemetry-hub');
    else if (currentTab === 'marketing-engine' || currentTab === 'services' || currentTab === 'fde-systems') setActiveSubTab('marketing-engine');
  }, [currentTab]);

  const handleSelectSubTab = (id: 'marketing-engine' | 'alerts' | 'telemetry-hub') => {
    setActiveSubTab(id);
    setCurrentTab(id);
  };

  const subTabs = [
    { id: 'marketing-engine' as const, label: 'Marketing & WhatsApp', icon: Share2 },
    { id: 'alerts' as const, label: 'Website Health & Auto-Fix', icon: ShieldAlert, badge: unreadAlerts > 0 ? unreadAlerts : undefined },
    { id: 'telemetry-hub' as const, label: 'Live Uptime & Logs', icon: Activity },
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
                {sub.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${active ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500'}`}>
                    {sub.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Sub-View */}
      {activeSubTab === 'marketing-engine' && <MarketingEngineTab />}
      {activeSubTab === 'alerts' && <AlertsTab />}
      {activeSubTab === 'telemetry-hub' && <TelemetryHubTab />}
    </div>
  );
};
