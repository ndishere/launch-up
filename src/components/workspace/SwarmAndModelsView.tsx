import React, { useState } from 'react';
import {
  Bot,
  Cpu,
  Plus,
  Sparkles,
  GitBranch,
  Zap,
  Sliders,
  Shield,
} from 'lucide-react';
import { ProjectModelRouting, ProjectWorkspaceState } from '../../types';

interface AgentSwarmViewProps {
  workspace: ProjectWorkspaceState;
  onDispatchTask: (slotId: string, prompt: string) => void;
}

export const AgentSwarmView: React.FC<AgentSwarmViewProps> = ({
  workspace,
  onDispatchTask,
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState(workspace.swarmAgents[0]?.id || '');
  const [taskInput, setTaskInput] = useState('');

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || !taskInput.trim()) return;
    onDispatchTask(selectedSlotId, taskInput.trim());
    setTaskInput('');
  };

  return (
    <div className="space-y-5">
      {/* Task Dispatch Bar */}
      <form
        onSubmit={handleDispatch}
        className="bg-slate-50/80 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
      >
        <select
          value={selectedSlotId}
          onChange={(e) => setSelectedSlotId(e.target.value)}
          className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          {workspace.swarmAgents.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.roleTitle} — {slot.agentName}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Assign micro-task to selected agent (updates queue & token ledger)..."
          className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={!taskInput.trim()}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Queue Agent Task</span>
        </button>
      </form>

      {/* Allocated Virtual Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspace.swarmAgents.map((slot) => {
          const pct =
            slot.tokenBudgetUsd > 0
              ? Math.min(100, Math.round((slot.tokensSpentUsd / slot.tokenBudgetUsd) * 100))
              : 0;
          return (
            <div
              key={slot.id}
              className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {slot.agentName}
                      </h4>
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {slot.roleTitle}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      slot.status === 'Active'
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                        : slot.status === 'Completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5">
                  {slot.specialty}
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 inline-flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    <code className="font-mono">{slot.assignedBranch}</code>
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Queue: {slot.activeQueue}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Token Budget Usage</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                      ${slot.tokensSpentUsd.toFixed(2)} / ${slot.tokenBudgetUsd.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct > 85 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface AIModelsViewProps {
  routing: ProjectModelRouting;
  onUpdateRouting: (patch: Partial<ProjectModelRouting>) => void;
}

const MODEL_TIERS = [
  {
    key: 'fastReasoning' as const,
    label: 'Fast Reasoning & Triage',
    description: 'Used by CEO Agent, log parsing, UI events & low-latency webhook classification.',
    options: ['Gemini 2.5 Flash', 'Gemini 2.0 Flash-Lite', 'Claude 3.5 Haiku', 'GPT-4.1 Nano'],
    costHint: '$0.10 / 1M tokens · ~320ms',
  },
  {
    key: 'deepArchitecture' as const,
    label: 'Deep Architecture & Coding',
    description: 'Used by Tech Architect, Parallel Coding Swarm, PostgreSQL RLS & OpenAPI synthesis.',
    options: ['Claude 3.7 Sonnet', 'Gemini 2.5 Pro', 'GPT-4.1', 'DeepSeek-R1'],
    costHint: '$3.00 / 1M tokens · High Precision',
  },
  {
    key: 'uiDesign' as const,
    label: 'Design System & UI Tree',
    description: 'Used by Iris Design Team for FigCraft JSON, CSS tokens & 375px-1920px responsiveness.',
    options: ['Gemini 2.5 Pro', 'Claude 3.7 Sonnet', 'GPT-4o', 'Gemini 2.5 Flash'],
    costHint: '$1.25 / 1M tokens · Multimodal UI',
  },
  {
    key: 'qaSecurity' as const,
    label: 'QA & SecOps Verification',
    description: 'Used by Sentinel Testing Agents for Semgrep triage, GDPR/DPDP audit & hotfix diffs.',
    options: ['GPT-4.1 Mini', 'Gemini 2.5 Flash', 'Claude 3.5 Haiku', 'Phi-3.5-mini Local'],
    costHint: '$0.40 / 1M tokens · Deterministic',
  },
];

export const AIModelsView: React.FC<AIModelsViewProps> = ({ routing, onUpdateRouting }) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODEL_TIERS.map((tier) => (
          <div
            key={tier.key}
            className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {tier.label}
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {tier.costHint}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">{tier.description}</p>

            <select
              value={routing[tier.key]}
              onChange={(e) => onUpdateRouting({ [tier.key]: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              {tier.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Edge Fallback & Inference Guardrails */}
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Local Edge SLM FinOps Fallback</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Automatically routes non-critical tasks to on-device Phi-3.5 / Qwen2.5-Coder when MOD-10 monthly token cap hits Tier 3.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onUpdateRouting({ localEdgeFallback: !routing.localEdgeFallback })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              routing.localEdgeFallback
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {routing.localEdgeFallback ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              Determinism Temperature
            </span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {routing.temperature.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={routing.temperature}
            onChange={(e) => onUpdateRouting({ temperature: parseFloat(e.target.value) })}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0.0 Strict SQL / Contracts</span>
            <span>0.5 Balanced</span>
            <span>1.0 Creative Copy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
