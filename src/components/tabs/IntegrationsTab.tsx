import React from 'react';
import { 
  Layers, CheckCircle2, XCircle, ExternalLink, RefreshCw, 
  Key, Shield, AlertCircle, Plus 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const IntegrationsTab: React.FC = () => {
  const { integrations, toggleIntegration } = useApp();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Cloud & Tool Integrations
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-full">
              {integrations.filter((i) => i.connected).length} Connected
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect version control, cloud infrastructure, payment gateways, and automated webhook dispatchers.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#111622] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleIntegration(item.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                    item.connected
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.connected ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-slate-400" />
                      <span>Disconnected</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {item.description}
              </p>

              {item.configuredDate && (
                <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {item.configuredDate}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => toggleIntegration(item.id)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {item.connected ? 'Configure Keys' : 'Connect Integration'}
              </button>

              <span className="text-[10px] text-slate-400 font-mono">OAuth 2.0 / API Key</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
