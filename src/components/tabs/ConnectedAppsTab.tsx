import React, { useState } from 'react';
import { 
  Layers, Plus, CheckCircle2, XCircle, RefreshCw, 
  Trash2, ShieldCheck, Zap, Server, Code, Box, Globe
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenAnalyticsHeader } from '../common/ScreenAnalyticsHeader';
import { ConnectedAppPlugin } from '../../types';

export const ConnectedAppsTab: React.FC = () => {
  const { connectedApps, toggleAppInstall, stackPresets, addStackPreset } = useApp();

  const [activeSubView, setActiveSubView] = useState<'plugins' | 'stacks'>('plugins');
  const [showAddStackModal, setShowAddStackModal] = useState(false);

  // New Stack Form
  const [newStackName, setNewStackName] = useState('');
  const [newFrontend, setNewFrontend] = useState('');
  const [newBackend, setNewBackend] = useState('');
  const [newDatabase, setNewDatabase] = useState('');
  const [newQueue, setNewQueue] = useState('');
  const [newDevops, setNewDevops] = useState('Docker + Cloud Run');

  const installedCount = connectedApps.filter(a => a.installed).length;

  const handleCreateStack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStackName || !newFrontend || !newBackend) return;

    addStackPreset({
      name: newStackName,
      category: 'Full-Stack',
      frontend: newFrontend,
      backend: newBackend,
      database: newDatabase || 'PostgreSQL 16',
      streamingOrQueue: newQueue || undefined,
      devops: newDevops,
      tags: [newFrontend.split(' ')[0], newBackend.split(' ')[0], 'Custom Stack'],
    });

    setShowAddStackModal(false);
    setNewStackName('');
    setNewFrontend('');
    setNewBackend('');
    setNewDatabase('');
    setNewQueue('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <ScreenAnalyticsHeader
        title="Connected Apps & Tech Stacks"
        badge="Plugin Ecosystem & Multi-Architecture Presets"
        description="Add on plugins to enhance Launch Up with more superpowers (n8n workflows, WhatsApp API, Ollama SLM, Stripe billing, Docker). Configure preset combinations of languages and stacks (MERN, MEAN, Kafka event-driven, Kotlin Android, etc.)."
        metrics={[
          {
            label: 'Connected Plugins',
            value: installedCount,
            subValue: `${connectedApps.length} in ecosystem`,
            status: 'good',
          },
          {
            label: 'Tech Stack Presets',
            value: stackPresets.length,
            subValue: 'MERN, MEAN, Kafka, KMP',
            status: 'good',
          },
          {
            label: 'Ecosystem Health',
            value: '100% Operational',
            subValue: 'Zero conflict detected',
            status: 'live',
          },
          {
            label: 'API Webhooks Live',
            value: '146 Endpoints',
            subValue: 'Auto-synchronized',
            status: 'neutral',
          },
          {
            label: 'Sync Coverage',
            value: '100% Active',
            subValue: 'Zero auth drift',
            status: 'good',
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubView('plugins')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                activeSubView === 'plugins'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Plugins & Marketplace ({installedCount})
            </button>
            <button
              onClick={() => setActiveSubView('stacks')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                activeSubView === 'stacks'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Tech Stack Presets ({stackPresets.length})
            </button>
            {activeSubView === 'stacks' && (
              <button
                onClick={() => setShowAddStackModal(true)}
                className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Stack</span>
              </button>
            )}
          </div>
        }
      />

      {/* SubView: Plugins */}
      {activeSubView === 'plugins' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {connectedApps.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-white dark:bg-[#111318] rounded-xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {plugin.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {plugin.category} • {plugin.version}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleAppInstall(plugin.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                      plugin.installed
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600'
                    }`}
                  >
                    {plugin.installed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Install</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {plugin.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {plugin.author}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{plugin.apiEndpointsConfigured} Endpoints Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SubView: Tech Stack Presets */}
      {activeSubView === 'stacks' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stackPresets.map((stack) => (
              <div
                key={stack.id}
                className="bg-white dark:bg-[#111318] rounded-xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {stack.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {stack.category}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {stack.isPreset ? 'Official Preset' : 'Custom Stack'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800/80 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Frontend:</span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">{stack.frontend}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Backend:</span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">{stack.backend}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Database:</span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">{stack.database}</span>
                    </div>
                    {stack.streamingOrQueue && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Queue/Kafka:</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400 truncate max-w-[180px]">{stack.streamingOrQueue}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">DevOps & Ship:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[180px]">{stack.devops}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {stack.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready for Projects</span>
                  <span className="text-[11px] text-slate-400">Auto-wired in Project Wizard</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Stack Modal */}
          {showAddStackModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Add New Tech Stack Preset</h3>
                  <button onClick={() => setShowAddStackModal(false)} className="text-slate-400 hover:text-slate-600">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateStack} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Stack Preset Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FastAPI + Next.js + ClickHouse"
                      value={newStackName}
                      onChange={e => setNewStackName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-1">Frontend *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Next.js 15 / Tailwind"
                        value={newFrontend}
                        onChange={e => setNewFrontend(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Backend *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. FastAPI / Python 3.12"
                        value={newBackend}
                        onChange={e => setNewBackend(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-1">Database</label>
                      <input
                        type="text"
                        placeholder="e.g. ClickHouse + Redis"
                        value={newDatabase}
                        onChange={e => setNewDatabase(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Queue / Kafka</label>
                      <input
                        type="text"
                        placeholder="e.g. Apache Kafka"
                        value={newQueue}
                        onChange={e => setNewQueue(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">DevOps Target</label>
                    <input
                      type="text"
                      placeholder="e.g. Docker + AWS ECS Fargate"
                      value={newDevops}
                      onChange={e => setNewDevops(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddStackModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                    >
                      Save Stack Preset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
