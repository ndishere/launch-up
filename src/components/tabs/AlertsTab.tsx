import React from 'react';
import { 
  Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, 
  Trash2, CheckCheck, RefreshCw, ExternalLink 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AlertsTab: React.FC = () => {
  const { alerts, markAlertAsRead, clearAlert } = useApp();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Alerts & Monitoring
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-full">
              {alerts.length} Incidents Logged
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time observability feeds for deployment faults, certificate expirations, and traffic latency anomalies.
          </p>
        </div>

        <button
          onClick={() => alerts.forEach((a) => markAlertAsRead(a.id))}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111622] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs transition-all"
        >
          <CheckCheck className="w-4 h-4 text-emerald-500" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Alerts Feed */}
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 flex items-start gap-4 transition-colors ${
              !alert.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
            }`}
          >
            <div className="mt-1">
              {alert.type === 'error' && (
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              {alert.type === 'warning' && (
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              {alert.type === 'info' && (
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
              )}
              {alert.type === 'success' && (
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {alert.title}
                  </h3>
                  {!alert.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </div>
                <span className="text-xs text-slate-400">{alert.timeAgo}</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {alert.description}
              </p>

              {alert.relatedEntity && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-400">Entity:</span>
                  <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    {alert.relatedEntity}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!alert.read && (
                <button
                  onClick={() => markAlertAsRead(alert.id)}
                  className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                >
                  Mark Read
                </button>
              )}
              <button
                onClick={() => clearAlert(alert.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Dismiss Alert"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
