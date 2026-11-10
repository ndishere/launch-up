import React, { useState } from 'react';
import { 
  GitFork, Play, CheckCircle2, Clock, AlertTriangle, 
  Plus, ExternalLink, RefreshCw, Zap, ArrowRight, Layers
} from 'lucide-react';
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
    }, 1500);
  };

  const totalRuns = workflows.reduce((acc, w) => acc + w.executionsCount, 0);
  const avgSuccess = (workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length).toFixed(1);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <ScreenAnalyticsHeader
        title="Automation Workflows & n8n Engine"
        badge="Autonomous Trigger-Action Mesh"
        description="Event-driven workflows linking client requirements intake, WhatsApp business messaging, email analysis, order management SLMs, git auto-rollbacks, and disaster backup routines."
        metrics={[
          {
            label: 'Active Workflows',
            value: workflows.filter(w => w.status === 'Active').length,
            subValue: '100% Mesh Health',
            status: 'good',
          },
          {
            label: 'Total Executions',
            value: totalRuns.toLocaleString(),
            subValue: 'Live trigger events',
            status: 'live',
          },
          {
            label: 'Workflow Success Rate',
            value: `${avgSuccess}%`,
            subValue: 'Zero unhandled faults',
            status: 'good',
          },
          {
            label: 'Engine Latency',
            value: '42ms P99',
            subValue: 'n8n Node Webhook',
            status: 'good',
          },
        ]}
        actions={
          <button
            onClick={() => handleRun(workflows[0].id)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Primary Webhook Mesh</span>
          </button>
        }
      />

      {/* Workflows List */}
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {wf.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600">
                  {wf.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Trigger: {wf.trigger}</span>
                <span>•</span>
                <span>Involved Nodes:</span>
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

            <div className="flex items-center gap-6 shrink-0 text-xs">
              <div className="text-right">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {wf.executionsCount.toLocaleString()} runs
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {wf.successRate}% Success
                </span>
              </div>

              <div className="text-right text-[11px] text-slate-400">
                <span>Last executed:</span>
                <span className="block font-medium text-slate-600 dark:text-slate-300">{wf.lastExecuted}</span>
              </div>

              <button
                onClick={() => handleRun(wf.id)}
                disabled={runningId === wf.id}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
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
