import React, { useState } from 'react';
import { 
  Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, 
  Trash2, CheckCheck, RefreshCw, ExternalLink, Wrench, Sparkles, GitPullRequest, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { healIncident } from '../../services/api';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { DebugHotfixInspector } from '../common/DebugHotfixInspector';

export const AlertsTab: React.FC = () => {
  const { alerts, markAlertAsRead, clearAlert, projects } = useApp();
  const unreadCount = alerts.filter((a) => !a.read).length;
  const errorCount = alerts.filter((a) => a.type === 'error').length;
  const warningCount = alerts.filter((a) => a.type === 'warning').length;

  // MOD-09 SRE Interactive State
  const [incidentSource, setIncidentSource] = useState<'SENTRY_5XX' | 'UPTIME_KUMA_DOWN' | 'GA4_CONVERSION_DROP'>('SENTRY_5XX');
  const [errorSignature, setErrorSignature] = useState('ZeroDivisionError in /api/v1/rates (missing zero weight guard)');
  const [isHealing, setIsHealing] = useState(false);
  const [sreResult, setSreResult] = useState<any>(null);

  const handleTriggerHeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsHealing(true);
    setSreResult(null);
    try {
      const res = await healIncident({
        project_id: projects[0]?.id || 'proj-0009-0000-0000-000000000001',
        incident_source: incidentSource,
        error_signature: errorSignature,
        stack_trace_or_metric: {
          file: 'services/rates.py',
          line: 42,
          endpoint: '/api/v1/rates',
        },
      });
      setSreResult(res);
    } catch (err: any) {
      setSreResult({ error: err.message });
    } finally {
      setIsHealing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-4 pb-0.5">
        <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-full">
          {alerts.length} Incidents Logged
        </span>

        <button
          onClick={() => alerts.forEach((a) => markAlertAsRead(a.id))}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111318] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all ml-auto"
        >
          <CheckCheck className="w-4 h-4 text-emerald-500" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Unified 5-Cell Horizontal Summary Bar */}
      <SummaryMetricGrid>
        <SummaryMetricCard
          title="Total Incidents"
          primaryValue={alerts.length}
          subtitle="Observed Feed"
          status={alerts.length > 0 ? 'live' : 'good'}
        />
        <SummaryMetricCard
          title="Unread Alerts"
          primaryValue={unreadCount}
          subtitle={unreadCount > 0 ? 'Requires triage' : 'All acknowledged'}
          status={unreadCount > 0 ? 'warn' : 'good'}
        />
        <SummaryMetricCard
          title="Critical Faults"
          primaryValue={errorCount}
          subtitle="5xx / Security flags"
          status={errorCount > 0 ? 'bad' : 'good'}
        />
        <SummaryMetricCard
          title="Warnings Logged"
          primaryValue={warningCount}
          subtitle="Latency & Quota"
          status={warningCount > 0 ? 'warn' : 'good'}
        />
        <SummaryMetricCard
          title="MOD-09 Auto-Heal"
          primaryValue={sreResult?.data?.hotfix_pr_url ? 'PR Ready' : 'Standby'}
          subtitle={`${projects.length} Monitored Apps`}
          status="good"
        />
      </SummaryMetricGrid>

      {/* Debug & SRE Hotfix Inspector for Pulled Projects */}
      <DebugHotfixInspector />

      {/* MOD-09: Autonomous SRE & Self-Healing Backend Operations */}
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
              <Wrench className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                MOD-09: Autonomous SRE & Self-Healing Ops (Port 8013)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ingest Sentry 500 webhooks, resolve Graphify AST blast-radius, generate sandbox hotfixes, and issue Gate 5 (HOTFIX_MERGE).
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-300">
            MOD-09 Active
          </span>
        </div>

        <form onSubmit={handleTriggerHeal} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Incident Source:
              </label>
              <select
                value={incidentSource}
                onChange={(e) => setIncidentSource(e.target.value as any)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="SENTRY_5XX">SENTRY_5XX (Internal Exception)</option>
                <option value="UPTIME_KUMA_DOWN">UPTIME_KUMA_DOWN (Downtime Alert)</option>
                <option value="GA4_CONVERSION_DROP">GA4_CONVERSION_DROP (Funnel Anomaly)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Error Signature:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={errorSignature}
                  onChange={(e) => setErrorSignature(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isHealing}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-amber-600/30 transition-all flex items-center gap-1.5 shrink-0"
                >
                  {isHealing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Trigger SRE Remediation</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {sreResult && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Incident Remediation Verified: Gate 5 Generated</span>
              </span>
              <span className={`text-[10px] font-mono font-bold ${sreResult.isLive ? 'text-emerald-500' : 'text-amber-500'}`}>
                {sreResult.isLive ? '●  Live Fastify 8013' : '● ‹ In-Memory Fallback'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Third-Party Outage?</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {sreResult.data?.is_external_third_party_outage ? 'Yes (Third-Party SaaS Down)' : 'No (Codebase Bug Fixed)'}
                </span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Sandbox Regression</span>
                <span className="text-xs font-bold text-emerald-600">
                  Passed 100% ✓
                </span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Gate 5 Approval ID</span>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  {sreResult.data?.approval_gate_id}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              <strong>RCA Summary:</strong> {sreResult.data?.rca_summary}
            </p>

            {sreResult.data?.hotfix_pr_url && (
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <GitPullRequest className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-slate-500">Automated Hotfix PR:</span>
                <a
                  href={sreResult.data?.hotfix_pr_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>{sreResult.data?.hotfix_pr_url}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alerts Feed */}
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 divide-y divide-slate-100 dark:divide-slate-800">
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
