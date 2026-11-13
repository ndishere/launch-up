import React, { useState } from 'react';
import {
  Bug,
  Play,
  RefreshCw,
  GitPullRequest,
  CheckCircle2,
  ShieldAlert,
  FileCode2,
  Activity,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { healIncident } from '../../services/api';
import {
  analyzeStackTraceWithGraphify,
  type SreDebugTraceResult,
} from '../../lib/project-folder-adapter';
import type { Project } from '../../types';

interface DebugHotfixInspectorProps {
  project?: Project | null;
}

export const DebugHotfixInspector: React.FC<DebugHotfixInspectorProps> = ({
  project: forcedProject,
}) => {
  const { projects } = useApp();
  const pulledProjects = projects.filter((p) => Boolean(p.pulledManifest || p.sourceTool));
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    forcedProject?.id || pulledProjects[0]?.id || projects[0]?.id || ''
  );

  const activeProject =
    forcedProject || projects.find((p) => p.id === selectedProjectId) || projects[0];

  const [stackTrace, setStackTrace] = useState(
    `ZeroDivisionError: weightKg must be greater than zero in /api/v1/rates\n  at calculateFreightRatePerKg (src/routes/rates.ts:4:11)\n  at handleRateQuoteDispatch (src/server.ts:28:5)`
  );
  const [running, setRunning] = useState(false);
  const [traceResult, setTraceResult] = useState<SreDebugTraceResult | null>(null);
  const [gate5Id, setGate5Id] = useState<string | null>(null);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [isLiveSre, setIsLiveSre] = useState<boolean>(false);

  const runDebugAndQueueHotfix = async (customTrace?: string) => {
    const traceInput = customTrace ?? stackTrace;
    setRunning(true);
    try {
      const localAnalysis = analyzeStackTraceWithGraphify(traceInput, activeProject);
      const res = await healIncident({
        project_id: activeProject?.id || 'proj-0009-0000-0000-000000000001',
        incident_source: 'SENTRY_5XX',
        error_signature: localAnalysis.errorSignature,
        stack_trace_or_metric: {
          file: localAnalysis.faultyFile,
          faulty_node: localAnalysis.faultyNode,
          dependency_path: localAnalysis.dependencyPath,
        },
      });
      setTraceResult(localAnalysis);
      setGate5Id(res.data.approval_gate_id || 'gate-0005-hotfix');
      setPrUrl(res.data.hotfix_pr_url || null);
      setIsLiveSre(res.isLive);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Bug className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Auto-Fix Care &amp; SRE Hotfix Inspector (Graphify AST + Quick Fix Approval)
            </h3>
            {activeProject?.sourceTool && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {activeProject.sourceTool} Project
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Paste a runtime stack trace or run a health probe to trace faulty nodes in <code>graphify-out/GRAPH_REPORT.md</code>, verify regression, and queue a Quick Fix Approval (Gate 5) PR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!forcedProject && (
            <select
              value={activeProject?.id || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() =>
              void runDebugAndQueueHotfix(
                `HealthProbeTimeout: /health on port ${activeProject?.localDevPort || 4100} via src/routes/rates.ts`
              )
            }
            disabled={running}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg inline-flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Run Health Check</span>
          </button>
          <button
            type="button"
            onClick={() => void runDebugAndQueueHotfix()}
            disabled={running}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-lg inline-flex items-center gap-1.5"
          >
            {running ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>Trace &amp; Queue Quick Fix PR</span>
          </button>
        </div>
      </div>

      <textarea
        value={stackTrace}
        onChange={(e) => setStackTrace(e.target.value)}
        rows={3}
        placeholder="Paste runtime exception stack trace..."
        className="w-full p-3 text-xs font-mono bg-[#0D111A] text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-rose-500"
      />

      {traceResult && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Fault Isolated · Regression Verified · Quick Fix PR Queued ({gate5Id})</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {isLiveSre ? '● Live MOD-09 (8013)' : '○ Graphify Fallback'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block">Graphify Faulty Node</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 break-all">
                {traceResult.faultyNode}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block">Graphify Dependency Path</span>
              <span className="font-mono text-slate-700 dark:text-slate-200 break-all">
                {traceResult.dependencyPath.join(' → ')}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block">Lock &amp; Quick Fix Status (Gate 5)</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {traceResult.blockedByLock ? 'Core-Locked Guarded' : 'Mutable Slot Patched'} ·{' '}
                {traceResult.gate5Status}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            {traceResult.rootCauseSummary}
          </p>

          <div className="rounded-lg overflow-hidden border border-slate-800">
            <div className="px-3 py-1.5 bg-slate-950 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
                Root-Cause Hotfix Diff ({traceResult.faultyFile})
              </span>
              {prUrl && (
                <span className="text-indigo-400 inline-flex items-center gap-1">
                  <GitPullRequest className="w-3 h-3" />
                  {prUrl}
                </span>
              )}
            </div>
            <pre className="p-3 bg-[#0D111A] text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
              {traceResult.suggestedDiff}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
