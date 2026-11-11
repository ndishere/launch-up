import React from 'react';
import { Layers, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const IntegrationsTab: React.FC = () => {
  const { integrations, toggleIntegration } = useApp();

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Integrations
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-md">
              {integrations.filter((i) => i.connected).length} Connected
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect cloud infrastructure, Git providers, payments, and webhook dispatchers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#111318] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2.5 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleIntegration(item.id)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium inline-flex items-center gap-1 transition-colors ${
                    item.connected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.connected ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-slate-400" />
                  )}
                  <span>{item.connected ? 'Connected' : 'Off'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>

              {item.configuredDate && (
                <p className="text-[11px] text-slate-400 mt-2.5">{item.configuredDate}</p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => toggleIntegration(item.id)}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {item.connected ? 'Configure' : 'Connect'}
              </button>
              <span className="text-[10px] text-slate-400 font-mono">OAuth / Key</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
