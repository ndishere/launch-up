import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Circle,
  Terminal,
  FileText,
  ShieldCheck,
  Palette,
  Code2,
  ArrowRight,
  ChevronRight,
  Cpu,
  Download,
  Sparkles,
  FileArchive,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateProjectContextCompactMd } from '../../lib/token-compressor';
import {
  GovernanceFrameworkKey,
  Project,
  ProjectWorkspaceState,
} from '../../types';
import { SWARM_STAGE_DEFINITIONS } from './workspaceDefaults';

interface BuildAreaViewProps {
  project: Project;
  workspace: ProjectWorkspaceState;
  isSimulating: boolean;
  onStartBuild: () => void;
  onResetBuild: () => void;
  onToggleCompliance: (framework: GovernanceFrameworkKey, itemId: string) => void;
  onUpdateBlueprint: (field: 'prd' | 'tdd' | 'designTheme', value: string) => void;
}

export const BuildAreaView: React.FC<BuildAreaViewProps> = ({
  project,
  workspace,
  isSimulating,
  onStartBuild,
  onResetBuild,
  onToggleCompliance,
  onUpdateBlueprint,
}) => {
  const { tokenOptimizer, updateTokenOptimizer } = useApp();
  const [blueprintTab, setBlueprintTab] = useState<'prd' | 'tdd' | 'designTheme' | 'compliance'>('prd');
  const [showCompactModal, setShowCompactModal] = useState(false);

  const completedStages = workspace.stages.filter((s) => s.status === 'completed').length;
  const allDone = completedStages === workspace.stages.length;

  const compactDigest = generateProjectContextCompactMd({
    projectName: project.name,
    projectType: project.type,
    branchNames: workspace.gitDocker.map((b) => b.branch),
    workspaceSummary: `Project ${project.name} (${project.type}) on ${project.framework}. Stages completed: ${completedStages}/${workspace.stages.length}.`,
    handoffCheckpointMd: workspace.blueprints.prd,
    templateFiles: [
      {
        path: 'src/blueprints/tdd-contract.ts',
        content: workspace.blueprints.tdd,
      },
      {
        path: 'src/blueprints/design-tokens.ts',
        content: workspace.blueprints.designTheme,
      },
    ],
    optimizer: tokenOptimizer,
  });

  const handleDownloadCompactMd = () => {
    const blob = new Blob([compactDigest.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = compactDigest.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Pipeline Control Banner */}
      <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Hierarchical Agent Swarm Pipeline
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              {completedStages} / {workspace.stages.length} Stages Verified
            </span>
            <button
              type="button"
              onClick={() =>
                updateTokenOptimizer({
                  cavemanMode:
                    tokenOptimizer.cavemanMode === 'off'
                      ? 'lite'
                      : tokenOptimizer.cavemanMode === 'lite'
                      ? 'full'
                      : tokenOptimizer.cavemanMode === 'full'
                      ? 'ultra'
                      : 'off',
                })
              }
              className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/60 inline-flex items-center gap-1"
              title="Cycle Caveman Agent Output Mode (off -> lite -> full -> ultra)"
            >
              <Sparkles className="w-3 h-3" />
              <span>/caveman {tokenOptimizer.cavemanMode}</span>
            </button>
            {tokenOptimizer.goldenTemplateDeltaOnly && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                88% Delta Clone ($0)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            CEO Agent → Tech Architect → Design Team → Parallel Coding Agents → Testing Agents → Tech Manager Integration → UAT / Deployment
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCompactModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg transition-colors inline-flex items-center gap-1.5"
            title="View & download Graphify + Repomix + Caveman PROJECT_CONTEXT_COMPACT.md"
          >
            <FileArchive className="w-3.5 h-3.5" />
            <span>Compact Context ({compactDigest.reductionPercent}% saved)</span>
          </button>
          <button
            type="button"
            onClick={onResetBuild}
            disabled={isSimulating}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Swarm</span>
          </button>

          <button
            type="button"
            onClick={onStartBuild}
            disabled={isSimulating}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-all inline-flex items-center gap-1.5 shadow-sm"
          >
            {isSimulating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>
              {isSimulating
                ? 'Swarm Executing...'
                : allDone
                ? 'Re-run Autonomous Build'
                : 'Start Autonomous Build'}
            </span>
          </button>
        </div>
      </div>

      {/* Horizontal Hierarchical Stage Chain */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
        {workspace.stages.map((stage, idx) => {
          const def = SWARM_STAGE_DEFINITIONS[idx];
          const isRunning = stage.status === 'running';
          const isDone = stage.status === 'completed';

          return (
            <div
              key={stage.id}
              className={`relative rounded-xl border p-3 transition-all flex flex-col justify-between ${
                isRunning
                  ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/35 ring-2 ring-indigo-500/20'
                  : isDone
                  ? 'border-emerald-300/80 dark:border-emerald-800/70 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111318]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-mono font-semibold text-slate-400">
                    S0{idx + 1}
                  </span>
                  {isRunning ? (
                    <Loader2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  ) : isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {stage.title}
                </h4>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 truncate">
                  {stage.leadAgent}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {stage.summary}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/70 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">{def?.branch || 'feature/dev'}</span>
                <span
                  className={
                    isRunning
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : isDone
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  {isRunning ? 'ACTIVE' : isDone ? 'DONE' : 'WAIT'}
                </span>
              </div>

              {idx < workspace.stages.length - 1 && (
                <ChevronRight className="hidden lg:block w-3.5 h-3.5 text-slate-300 dark:text-slate-700 absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-[#111318] rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Split: Live Agent Reasoning Logs + Generated Blueprints & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Live Agent Reasoning Terminal (5 cols) */}
        <div className="lg:col-span-5 bg-[#0D111A] rounded-xl border border-slate-800 flex flex-col overflow-hidden min-h-[340px] max-h-[420px]">
          <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-white">
                Agent Reasoning Stream
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
              {workspace.logs.length} traces · {project.name.slice(0, 18)}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 font-mono text-[11px]">
            {workspace.logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1"
              >
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="font-semibold text-indigo-300 inline-flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    {log.agentName}
                  </span>
                  <span className="text-slate-500">
                    {log.modelUsed} · {log.timestamp}
                  </span>
                </div>
                <p
                  className={`leading-relaxed ${
                    log.level === 'success'
                      ? 'text-emerald-300'
                      : log.level === 'warn'
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  <ArrowRight className="w-3 h-3 inline mr-1 opacity-60" />
                  {log.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Blueprints & Security/Law Governance Checklists (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden min-h-[340px] max-h-[420px]">
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900/40">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              Generated Blueprints & Governance
            </span>

            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-[11px]">
              {[
                { id: 'prd', label: 'PRD', icon: FileText },
                { id: 'tdd', label: 'TDD', icon: Code2 },
                { id: 'designTheme', label: 'Design Theme', icon: Palette },
                { id: 'compliance', label: 'Security & Law', icon: ShieldCheck },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setBlueprintTab(t.id as any)}
                    className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                      blueprintTab === t.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {blueprintTab !== 'compliance' ? (
              <textarea
                value={workspace.blueprints[blueprintTab]}
                onChange={(e) => onUpdateBlueprint(blueprintTab, e.target.value)}
                rows={11}
                className="w-full h-full min-h-[260px] p-3 text-xs font-mono bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            ) : (
              <div className="space-y-4">
                {(['GDPR_EU', 'DPDP_INDIA', 'CCPA_US'] as GovernanceFrameworkKey[]).map((fw) => {
                  const items = workspace.blueprints.compliance[fw] || [];
                  const doneCount = items.filter((i) => i.checked).length;
                  return (
                    <div
                      key={fw}
                      className="rounded-lg border border-slate-200/80 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/40"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                          {fw}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          {doneCount}/{items.length} Controls Checked
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {items.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                          >
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => onToggleCompliance(fw, item.id)}
                              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className={item.checked ? '' : 'text-amber-700 dark:text-amber-300'}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PROJECT_CONTEXT_COMPACT.md Inspector & Download Modal */}
      {showCompactModal && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCompactModal(false);
          }}
        >
          <div className="w-full max-w-3xl max-h-[88vh] flex flex-col bg-white dark:bg-[#0D1017] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {compactDigest.filename}
                </h3>
                <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {compactDigest.rawTokens} raw → {compactDigest.compressedTokens} compressed tokens ({compactDigest.reductionPercent}% reduced · Graphify {compactDigest.breakdown.graphifyTokens}t · Repomix {compactDigest.breakdown.repomixTokens}t · Caveman {compactDigest.breakdown.cavemanHandoffTokens}t)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadCompactMd}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompactModal(false)}
                  aria-label="Close compact context viewer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto p-4 bg-[#0D111A] text-slate-200 font-mono text-[11px] leading-relaxed">
              {compactDigest.markdown}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
