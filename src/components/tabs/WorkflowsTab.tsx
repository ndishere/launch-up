import React, { useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenAnalyticsHeader } from '../common/ScreenAnalyticsHeader';

export const WorkflowsTab: React.FC = () => {
  const { workflows, triggerWorkflowRun } = useApp();
  const [runningId, setRunningId] = useState<string | null>(null);

  const handleRun = (id: string) => {
    setRunningId(id);
    triggerWorkflowRun(id);
    setTimeout(() => {
      setRunningId(null);
    }, 1200);
  };

  const totalRuns = workflows.reduce((acc, w) => acc + w.executionsCount, 0);
  const avgSuccess = (workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length).toFixed(1);

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-150">
      <ScreenAnalyticsHeader
        title="Workflows"
        badge="Webhook Mesh"
        description="Agency-wide event triggers linking intake, WhatsApp messaging, email SLMs, auto-rollbacks, and backups."
        metrics={[
          { label: 'Active', value: workflows.filter((w) => w.status === 'Active').length, subValue: '100% healthy', status: 'good' },
          { label: 'Executions', value: totalRuns.toLocaleString(), subValue: 'Total triggers', status: 'live' },
          { label: 'Success Rate', value: `${avgSuccess}%`, subValue: 'Zero faults', status: 'good' },
          { label: 'Latency', value: '42ms', subValue: 'P99 webhook', status: 'good' },
        ]}
        actions={
          <button
            onClick={() => handleRun(workflows[0].id)}
            className="px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Mesh</span>
          </button>
        }
      />

      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 divide-y divide-slate-100 dark:divide-slate-800/80">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
          >
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {wf.name}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                  {wf.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Trigger: {wf.trigger}</span>
                <span>·</span>
                {wf.integrationsInvolved.map((node, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
                  >
                    {node}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-5 shrink-0 text-xs">
              <div className="text-right">
                <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                  {wf.executionsCount.toLocaleString()} runs
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {wf.successRate}% ok
                </span>
              </div>

              <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                <span>Last run</span>
                <span className="block text-slate-600 dark:text-slate-300">{wf.lastExecuted}</span>
              </div>

              <button
                onClick={() => handleRun(wf.id)}
                disabled={runningId === wf.id}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition-colors flex items-center gap-1.5"
              >
                {runningId === wf.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>{runningId === wf.id ? 'Running...' : 'Trigger'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
