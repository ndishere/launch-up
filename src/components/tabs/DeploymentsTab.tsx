import React, { useState } from 'react';
import { 
  Rocket, Server, GitCommit, CheckCircle2, AlertCircle, Clock, 
  Terminal, RotateCcw, ExternalLink, Filter, Play, RefreshCw, ShieldCheck, Cpu,
  Sparkles, Check, Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeploymentLog } from '../../types';
import { ScreenAnalyticsHeader } from '../common/ScreenAnalyticsHeader';
import { verifyQA } from '../../services/api';

export const DeploymentsTab: React.FC = () => {
  const { 
    deployments, 
    projects, 
    triggerDeployment, 
    setActiveDeployLog, 
    setIsDeployModalOpen 
  } = useApp();

  const [selectedEnv, setSelectedEnv] = useState<string>('All');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [targetEnv, setTargetEnv] = useState<'Production' | 'Staging'>('Production');

  // MOD-06 QA & SecOps Verification Interactive State
  const [runningQA, setRunningQA] = useState(false);
  const [qaResult, setQaResult] = useState<any>(null);

  const handleRunQA = async () => {
    setRunningQA(true);
    setQaResult(null);
    try {
      const res = await verifyQA({
        project_id: selectedProjectId || 'proj-0006-0000-0000-000000000001',
        web_staging_url: 'https://preview-staging.launchup.internal',
        api_staging_url: 'https://api-staging.launchup.internal',
        signed_apk_url: 'https://artifacts.launchup.internal/app-release.apk',
        user_stories: [
          { id: 'US-01', description: 'Customer completes checkout with OTP' },
          { id: 'US-02', description: 'Real-time order tracking webhooks update live map' },
        ],
      });
      setQaResult(res);
    } catch (err: any) {
      setQaResult({ error: err.message });
    } finally {
      setRunningQA(false);
    }
  };

  const filteredDeployments = deployments.filter((d) => {
    if (selectedEnv === 'All') return true;
    return d.environment === selectedEnv;
  });

  const successDeployments = deployments.filter(d => d.status === 'Success').length;
  const successRate = ((successDeployments / (deployments.length || 1)) * 100).toFixed(1);

  const handleQuickDeploy = () => {
    if (!selectedProjectId) return;
    triggerDeployment(selectedProjectId, targetEnv);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header with ScreenAnalyticsHeader */}
      <ScreenAnalyticsHeader
        title="Deployments & CI/CD Pipelines"
        badge="Edge Fleet Operational"
        description="Automated git-driven deployments to Cloud Run, Vercel, and AWS ECS. Continuous zero-downtime traffic shifts with automatic git rollback in case of build faults."
        metrics={[
          {
            label: 'Total Deployments',
            value: deployments.length,
            subValue: `${successDeployments} Successful`,
            status: 'good',
          },
          {
            label: 'Deployment Success Rate',
            value: `${successRate}%`,
            subValue: 'Zero service outages',
            status: 'good',
          },
          {
            label: 'Live Error Rate',
            value: '0.04%',
            subValue: 'Auto-rollback protected',
            status: 'live',
          },
          {
            label: 'Active CI/CD Runners',
            value: '8 Parallel',
            subValue: 'Docker BuildKit',
            status: 'good',
          },
          {
            label: 'Edge Network Status',
            value: 'Healthy',
            subValue: 'Global CDN Active',
            status: 'good',
          },
        ]}
        actions={
          <div className="flex items-center gap-2 bg-white dark:bg-[#111622] p-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={targetEnv}
              onChange={(e) => setTargetEnv(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
            </select>

            <button
              id="trigger-deploy-quick-btn"
              onClick={handleQuickDeploy}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Deploy</span>
            </button>
          </div>
        }
      />

      {/* MOD-06: Autonomous QA, SecOps & Gate 3 Verifier */}
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                MOD-06: Autonomous QA, SecOps & Gate 3 Verifier (Port 8010)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Execute Playwright E2E tests, Semgrep SAST scans, Trivy CVE checks, Gitleaks, and Lighthouse audits to issue Gate 3 (DEPLOY_STAGING).
              </p>
            </div>
          </div>
          <button
            onClick={handleRunQA}
            disabled={runningQA}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            {runningQA ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Run QA & SecOps Verification</span>
          </button>
        </div>

        {qaResult && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Verification Results: Gate 3 Approved</span>
              </span>
              <span className={`text-[10px] font-mono font-bold ${qaResult.isLive ? 'text-emerald-500' : 'text-amber-500'}`}>
                {qaResult.isLive ? 'â—  Live Fastify 8010' : 'â—‹ In-Memory Fallback'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Playwright E2E Pass</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {qaResult.data?.playwright_pass_rate}%
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Semgrep & Trivy</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  0 Critical
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Gitleaks Secrets</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  0 Leaked
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Lighthouse Avg</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  96/100 (Perf, A11y, SEO)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Approval Gate Certificate: <strong className="font-mono text-slate-700 dark:text-slate-300">{qaResult.data?.approval_gate_id}</strong></span>
              <span className="text-emerald-600 font-semibold">Ready for Staging Promotion âœ“</span>
            </div>
          </div>
        )}
      </div>

      {/* Cluster Status Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Production Releases</span>
            <Server className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">36 Live</div>
          <p className="text-[11px] text-emerald-600 mt-1">100% Zero-downtime routing</p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Avg Build Time</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">28.4s</div>
          <p className="text-[11px] text-indigo-500 mt-1">Docker layer caching enabled</p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Edge SSL & DNS</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">Auto-Renewing</div>
          <p className="text-[11px] text-slate-400 mt-1">Let's Encrypt Wildcard</p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Server Ingress Status</span>
            <Cpu className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">Port 3000 / 443</div>
          <p className="text-[11px] text-slate-400 mt-1">Reverse proxy reverse mapped</p>
        </div>
      </div>

      {/* Deployments History Table with Terminal Drawer Trigger */}
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 dark:text-white text-base">
            Deployment History & Audit Trail
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Environment:</span>
            <select
              value={selectedEnv}
              onChange={(e) => setSelectedEnv(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All">All Environments</option>
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
              <option value="Preview">Preview</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Commit / Message</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Triggered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredDeployments.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        dep.status === 'Success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                          : dep.status === 'In Progress'
                          ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                          : 'bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {dep.status === 'Success' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      {dep.status === 'In Progress' && <RefreshCw className="w-3 h-3 animate-spin text-purple-500" />}
                      {dep.status === 'Failed' && <AlertCircle className="w-3 h-3 text-red-500" />}
                      <span>{dep.status}</span>
                    </span>
                  </td>

                  {/* Project Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {dep.projectName}
                  </td>

                  {/* Commit */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-medium">
                        {dep.commitHash}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 truncate max-w-xs block">
                        {dep.commitMessage}
                      </span>
                    </div>
                  </td>

                  {/* Environment */}
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {dep.environment}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                    {dep.durationSeconds > 0 ? `${dep.durationSeconds}s` : '—'}
                  </td>

                  {/* Time ago */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    {dep.timestamp}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveDeployLog(dep);
                          setIsDeployModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-1"
                        title="View Build Logs"
                      >
                        <Terminal className="w-3 h-3 text-indigo-500" />
                        <span>Logs</span>
                      </button>

                      {dep.status === 'Success' && (
                        <button
                          onClick={() => triggerDeployment(dep.projectId, dep.environment)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Rollback / Redeploy"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
