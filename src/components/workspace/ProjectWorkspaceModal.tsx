import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Hammer,
  Workflow,
  Bot,
  Cpu,
  DollarSign,
  GitBranch,
  Layers,
  ExternalLink,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { N8nWorkflowsTab } from '../tabs/N8nWorkflowsTab';
import { BuildAreaView } from './BuildAreaView';
import { AgentSwarmView, AIModelsView } from './SwarmAndModelsView';
import { FinOpsUnitEconomicsView, GitDockerStagingView } from './FinOpsAndGitView';
import {
  calculateProjectUnitEconomics,
  createDefaultProjectWorkspace,
  SWARM_STAGE_DEFINITIONS,
} from './workspaceDefaults';
import { GitStageBranchName, GovernanceFrameworkKey } from '../../types';

type WorkspaceTabId = 'build' | 'n8n' | 'swarm' | 'models' | 'finops' | 'git-docker';

export const ProjectWorkspaceModal: React.FC = () => {
  const {
    isProjectWorkspaceOpen,
    workspaceProjectId,
    closeProjectWorkspace,
    openProjectWorkspace,
    projects,
    clients,
    projectWorkspaces,
    updateProjectWorkspace,
    setCurrentTab,
    setActiveCanvasProjectId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('build');
  const [simulatingProjectId, setSimulatingProjectId] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isProjectWorkspaceOpen) {
        closeProjectWorkspace();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isProjectWorkspaceOpen, closeProjectWorkspace]);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, [workspaceProjectId]);

  if (!isProjectWorkspaceOpen) return null;

  const project = projects.find((p) => p.id === workspaceProjectId) || projects[0];
  if (!project) return null;

  const linkedClients = clients.filter((c) => project.clientIds.includes(c.id));
  const workspace =
    projectWorkspaces[project.id] || createDefaultProjectWorkspace(project, linkedClients);
  const finopsSummary = calculateProjectUnitEconomics(workspace.finops);

  const completedStages = workspace.stages.filter((s) => s.status === 'completed').length;
  const complianceTotal = Object.values(workspace.blueprints.compliance).flat();
  const complianceChecked = complianceTotal.filter((item) => item.checked).length;
  const isSimulating = simulatingProjectId === project.id || workspace.buildStatus === 'running';

  const handleStartAutonomousBuild = async () => {
    if (simulatingProjectId) return;
    setSimulatingProjectId(project.id);
    cancelledRef.current = false;

    updateProjectWorkspace(project.id, (prev) => ({
      ...prev,
      buildStatus: 'running',
      currentStageIndex: 0,
      stages: prev.stages.map((s, idx) => ({
        ...s,
        status: idx === 0 ? 'running' : 'pending',
        progressPercent: idx === 0 ? 35 : 0,
      })),
      logs: [
        {
          id: `log-start-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          stageId: 'ceo' as const,
          agentName: 'Aegis CEO Orchestrator',
          modelUsed: prev.modelRouting.fastReasoning,
          message: `Autonomous Factory started for "${project.name}" across 7 hierarchical stages.`,
          level: 'info' as const,
        },
        ...prev.logs,
      ].slice(0, 60),
    }));

    for (let i = 0; i < SWARM_STAGE_DEFINITIONS.length; i++) {
      if (cancelledRef.current) break;
      const def = SWARM_STAGE_DEFINITIONS[i];

      updateProjectWorkspace(project.id, (prev) => ({
        ...prev,
        currentStageIndex: i,
        stages: prev.stages.map((s, idx) =>
          idx === i
            ? { ...s, status: 'running', progressPercent: 60 }
            : idx < i
            ? { ...s, status: 'completed', progressPercent: 100 }
            : s
        ),
        swarmAgents: prev.swarmAgents.map((slot) =>
          slot.roleTitle.toLowerCase().includes(def.id === 'uat' ? 'integration' : def.id)
            ? { ...slot, status: 'Active' }
            : slot
        ),
      }));

      await new Promise((r) => setTimeout(r, 420));
      if (cancelledRef.current) break;

      updateProjectWorkspace(project.id, (prev) => {
        const chosenModel = prev.modelRouting[def.modelKey];
        const newSha = Math.random().toString(16).slice(2, 9);
        return {
          ...prev,
          stages: prev.stages.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  status: 'completed',
                  progressPercent: 100,
                  completedAt: new Date().toLocaleTimeString(),
                }
              : s
          ),
          swarmAgents: prev.swarmAgents.map((slot) =>
            slot.assignedBranch === def.branch || slot.roleTitle === def.title
              ? {
                  ...slot,
                  status: 'Completed',
                  activeQueue: Math.max(0, slot.activeQueue - 1),
                  tokensSpentUsd: Number((slot.tokensSpentUsd + def.tokenCostUsd * 0.45).toFixed(2)),
                }
              : slot
          ),
          finops: {
            ...prev.finops,
            actualLlmSpendUsd: Number((prev.finops.actualLlmSpendUsd + def.tokenCostUsd).toFixed(2)),
            containerHours: Number((prev.finops.containerHours + def.containerHoursDelta).toFixed(2)),
            agentComputeMinutes: Number((prev.finops.agentComputeMinutes + def.computeMinsDelta).toFixed(1)),
          },
          gitDocker: prev.gitDocker.map((b) =>
            b.branch === def.branch
              ? {
                  ...b,
                  status: 'Synced',
                  lastCommitSha: newSha,
                  dockerHealth: 'Healthy',
                  replicas: b.branch === 'feature/production' ? '3/3 Live' : '2/2 Verified',
                }
              : b
          ),
          logs: [
            {
              id: `log-step-${i}-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              stageId: def.id,
              agentName: def.leadAgent,
              modelUsed: chosenModel,
              message: def.reasoning,
              level: (i === SWARM_STAGE_DEFINITIONS.length - 1 ? 'success' : 'reasoning') as 'success' | 'reasoning',
              tokensUsed: Math.round(def.tokenCostUsd * 1200),
            },
            ...prev.logs,
          ].slice(0, 60),
        };
      });
    }

    updateProjectWorkspace(project.id, (prev) => ({
      ...prev,
      buildStatus: 'completed',
      currentStageIndex: SWARM_STAGE_DEFINITIONS.length - 1,
    }));
    setSimulatingProjectId(null);
  };

  const handleResetBuild = () => {
    const fresh = createDefaultProjectWorkspace({ ...project, status: 'In Progress' }, linkedClients);
    updateProjectWorkspace(project.id, () => ({
      ...fresh,
      buildStatus: 'idle',
      currentStageIndex: 0,
    }));
  };

  const handlePromoteBranch = (sourceBranch: GitStageBranchName) => {
    const order: GitStageBranchName[] = [
      'feature/dev',
      'feature/testing',
      'feature/uat',
      'feature/production',
    ];
    const nextBranch = order[order.indexOf(sourceBranch) + 1];
    if (!nextBranch) return;
    const sha = Math.random().toString(16).slice(2, 9);

    updateProjectWorkspace(project.id, (prev) => ({
      ...prev,
      gitDocker: prev.gitDocker.map((b) =>
        b.branch === nextBranch
          ? {
              ...b,
              status: 'Active',
              lastCommitSha: sha,
              lastCommitMsg: `merge: promoted verified build from ${sourceBranch}`,
              dockerHealth: 'Healthy',
              replicas: nextBranch === 'feature/production' ? '3/3 Live' : '2/2 Healthy',
            }
          : b
      ),
      logs: [
        {
          id: `log-git-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          stageId: 'integration' as const,
          agentName: 'Atlas Integration Lead',
          modelUsed: prev.modelRouting.deepArchitecture,
          message: `Promoted isolated Git branch ${sourceBranch} → ${nextBranch} (${sha}). Containers healthy.`,
          level: 'success' as const,
        },
        ...prev.logs,
      ].slice(0, 60),
    }));
  };

  const TABS: Array<{ id: WorkspaceTabId; label: string; icon: React.ElementType }> = [
    { id: 'build', label: 'Build Area', icon: Hammer },
    { id: 'n8n', label: 'n8n Workflows', icon: Workflow },
    { id: 'swarm', label: 'Agent Swarm', icon: Bot },
    { id: 'models', label: 'AI Models', icon: Cpu },
    { id: 'finops', label: 'FinOps & Unit Economics', icon: DollarSign },
    { id: 'git-docker', label: 'Git & Docker Staging', icon: GitBranch },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-50 dark:bg-[#090B10] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-[1400px] h-[92vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Top Command Header */}
        <div className="bg-white dark:bg-[#111318] border-b border-slate-200/80 dark:border-slate-800 px-5 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {project.name}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
                  {project.type}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-500" />
                  {linkedClients.length > 0
                    ? linkedClients.map((c) => `${c.name} (${c.tier})`).join(' · ')
                    : 'Agency Internal'}
                </span>
                <span>•</span>
                <span>{project.framework}</span>
                <span>•</span>
                <span>{project.serverTarget}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <select
              value={project.id}
              onChange={(e) => openProjectWorkspace(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setActiveCanvasProjectId(project.id);
                setCurrentTab('project-canvas');
                closeProjectWorkspace();
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
              <span>Legacy Canvas</span>
            </button>

            <button
              type="button"
              onClick={closeProjectWorkspace}
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close Project Workspace"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Top-Level Tab Strip */}
        <div className="bg-white dark:bg-[#111318] border-b border-slate-200/80 dark:border-slate-800 px-5 py-2 flex items-center gap-1 overflow-x-auto shrink-0">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Workspace Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Unified 5-Cell Summary Bar */}
          <SummaryMetricGrid>
            <SummaryMetricCard
              title="Swarm Pipeline"
              primaryValue={`${completedStages} / ${workspace.stages.length}`}
              subtitle={isSimulating ? 'Agents Executing' : completedStages === 7 ? 'All Gates Passed' : 'Ready to Build'}
              status={isSimulating ? 'live' : completedStages === 7 ? 'good' : 'neutral'}
            />
            <SummaryMetricCard
              title="LLM Spend / Cap"
              primaryValue={`$${workspace.finops.actualLlmSpendUsd.toFixed(2)} / $${workspace.finops.llmTokenBudgetUsd}`}
              subtitle={`${workspace.modelRouting.deepArchitecture}`}
              status={
                workspace.finops.actualLlmSpendUsd > workspace.finops.llmTokenBudgetUsd
                  ? 'warn'
                  : 'good'
              }
            />
            <SummaryMetricCard
              title="Gross Profit Margin"
              primaryValue={`${finopsSummary.profitMarginPercent}%`}
              subtitle={`Net $${finopsSummary.grossProfitUsd.toFixed(2)} Profit`}
              status={finopsSummary.profitMarginPercent >= 50 ? 'good' : 'warn'}
            />
            <SummaryMetricCard
              title="Law & Governance"
              primaryValue={`${complianceChecked} / ${complianceTotal.length}`}
              subtitle="GDPR · DPDP · CCPA"
              status={complianceChecked === complianceTotal.length ? 'good' : 'live'}
            />
            <SummaryMetricCard
              title="Git & Docker Sync"
              primaryValue={`${workspace.gitDocker.filter((b) => b.dockerHealth === 'Healthy').length} / 4 Branches`}
              subtitle="Isolated Compose Containers"
              status="good"
            />
          </SummaryMetricGrid>

          {activeTab === 'build' && (
            <BuildAreaView
              project={project}
              workspace={workspace}
              isSimulating={isSimulating}
              onStartBuild={handleStartAutonomousBuild}
              onResetBuild={handleResetBuild}
              onToggleCompliance={(framework: GovernanceFrameworkKey, itemId: string) =>
                updateProjectWorkspace(project.id, (prev) => ({
                  ...prev,
                  blueprints: {
                    ...prev.blueprints,
                    compliance: {
                      ...prev.blueprints.compliance,
                      [framework]: prev.blueprints.compliance[framework].map((item) =>
                        item.id === itemId ? { ...item, checked: !item.checked } : item
                      ),
                    },
                  },
                }))
              }
              onUpdateBlueprint={(field, value) =>
                updateProjectWorkspace(project.id, (prev) => ({
                  ...prev,
                  blueprints: { ...prev.blueprints, [field]: value },
                }))
              }
            />
          )}

          {activeTab === 'n8n' && (
            <N8nWorkflowsTab projectId={project.id} projectName={project.name} embedded />
          )}

          {activeTab === 'swarm' && (
            <AgentSwarmView
              workspace={workspace}
              onDispatchTask={(slotId, prompt) =>
                updateProjectWorkspace(project.id, (prev) => {
                  const target = prev.swarmAgents.find((a) => a.id === slotId);
                  return {
                    ...prev,
                    swarmAgents: prev.swarmAgents.map((slot) =>
                      slot.id === slotId
                        ? {
                            ...slot,
                            status: 'Active',
                            activeQueue: slot.activeQueue + 1,
                            tokensSpentUsd: Number((slot.tokensSpentUsd + 0.18).toFixed(2)),
                          }
                        : slot
                    ),
                    finops: {
                      ...prev.finops,
                      actualLlmSpendUsd: Number((prev.finops.actualLlmSpendUsd + 0.18).toFixed(2)),
                      agentComputeMinutes: Number((prev.finops.agentComputeMinutes + 1.5).toFixed(1)),
                    },
                    logs: [
                      {
                        id: `log-task-${Date.now()}`,
                        timestamp: new Date().toLocaleTimeString(),
                        stageId: 'coding' as const,
                        agentName: target?.agentName || 'Swarm Worker',
                        modelUsed: prev.modelRouting.fastReasoning,
                        message: `Queued manual swarm task: "${prompt}" on branch ${target?.assignedBranch || 'feature/dev'}.`,
                        level: 'info' as const,
                      },
                      ...prev.logs,
                    ].slice(0, 60),
                  };
                })
              }
            />
          )}

          {activeTab === 'models' && (
            <AIModelsView
              routing={workspace.modelRouting}
              onUpdateRouting={(patch) =>
                updateProjectWorkspace(project.id, (prev) => ({
                  ...prev,
                  modelRouting: { ...prev.modelRouting, ...patch },
                }))
              }
            />
          )}

          {activeTab === 'finops' && (
            <FinOpsUnitEconomicsView
              finops={workspace.finops}
              onUpdateFinOps={(patch) =>
                updateProjectWorkspace(project.id, (prev) => ({
                  ...prev,
                  finops: { ...prev.finops, ...patch },
                }))
              }
              onAddExpense={(expense) =>
                updateProjectWorkspace(project.id, (prev) => ({
                  ...prev,
                  finops: {
                    ...prev.finops,
                    manualExpenses: [
                      {
                        ...expense,
                        id: `exp-${Date.now()}`,
                        date: new Date().toISOString().slice(0, 10),
                      },
                      ...prev.finops.manualExpenses,
                    ],
                  },
                }))
              }
              onRemoveExpense={(expenseId) =>
                updateProjectWorkspace(project.id, (prev) => ({
                  ...prev,
                  finops: {
                    ...prev.finops,
                    manualExpenses: prev.finops.manualExpenses.filter((e) => e.id !== expenseId),
                  },
                }))
              }
            />
          )}

          {activeTab === 'git-docker' && (
            <GitDockerStagingView
              project={project}
              branches={workspace.gitDocker}
              onPromoteBranch={handlePromoteBranch}
            />
          )}
        </div>
      </div>
    </div>
  );
};
