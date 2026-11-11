import React, { useState } from 'react';
import {
  Play,
  Terminal,
  Cpu,
  Database,
  Layers,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Box,
  Bot,
  Code,
  Zap,
  PenTool,
  MonitorSmartphone,
  Workflow,
  GitBranch,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProjectBuilderTab } from './ProjectBuilderTab';
import { NoCodeEditorTab } from './NoCodeEditorTab';
import { PreviewStudioTab } from './PreviewStudioTab';
import { N8nWorkflowsTab } from './N8nWorkflowsTab';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';

type WorkspaceSection = 'overview' | 'builder' | 'design' | 'preview' | 'workflows';
type OverviewSubView = 'sdlc' | 'agents' | 'docker' | 'logs';

export const ProjectCanvasTab: React.FC = () => {
  const {
    projects,
    clients,
    activeCanvasProjectId,
    setActiveCanvasProjectId,
    setCurrentTab,
    agents,
    triggerDeployment,
    createManualBackup,
    restoreGitStableBuild,
  } = useApp();

  const currentProject = projects.find((p) => p.id === activeCanvasProjectId) || projects[0];
  const linkedClientNames = clients
    .filter((c) => currentProject.clientIds.includes(c.id))
    .map((c) => c.name)
    .join(', ') || 'Agency Internal';

  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview');
  const [overviewSubView, setOverviewSubView] = useState<OverviewSubView>('sdlc');
  const [isSimulatingBuild, setIsSimulatingBuild] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([
    `[00:00.12] -> [MCP Orchestrator] Connected to Model Context Protocol endpoints`,
    `[00:01.04] -> [Aegis Core Agent] Parsed requirements document & decomposed modules`,
    `[00:02.15] [OK] [Data Architect] Synthesized PostgreSQL 16 schema + RLS migrations`,
    `[00:03.40] -> [Full-Stack Agent] Built responsive Tailwind layouts & mobile views`,
    `[00:05.10] [OK] [Docker Engine] Packaged production image (42.8 MB)`,
    `[00:06.88] -> [Sentinel Agent] Verified Semgrep/Trivy/Gitleaks & tests (98.4% pass)`,
    `[00:07.95] [OK] [CI/CD] Sandbox live and synchronized.`,
  ]);

  const runBuildSimulation = () => {
    setIsSimulatingBuild(true);
    const ts = new Date().toLocaleTimeString();
    const newLogs = [
      `[${ts}] -> [Swarm] Initiating parallel SDLC pipeline for ${currentProject.name}...`,
      `[${ts}] -> [MCP Host] Querying local Ollama SLM & cloud API...`,
      `[${ts}] [OK] Verified AST integrity across 48 modules.`,
      `[${ts}] -> Packaging Docker container layers (Alpine 3.20 + Node 22)...`,
      `[${ts}] [OK] Sandbox synced with edge cluster. 0 vulnerabilities.`,
    ];

    setTimeout(() => {
      setBuildLogs((prev) => [...prev, ...newLogs]);
      setIsSimulatingBuild(false);
    }, 1200);
  };

  const workspaceTabs: { id: WorkspaceSection; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'builder', label: 'Scope & ER', icon: Database },
    { id: 'design', label: 'Design Studio', icon: PenTool },
    { id: 'preview', label: 'Preview & QA', icon: MonitorSmartphone },
    { id: 'workflows', label: 'n8n Workflows', icon: Workflow },
  ];

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-150">
      {/* Minimalist Top Bar: Back + Project Switcher + Key Status */}
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setCurrentTab('projects')}
              className="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shrink-0"
              title="Back to Projects"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                  {currentProject.name}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                  {currentProject.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {linkedClientNames} · {currentProject.framework || 'Next.js 15 + Fastify'} · Health {currentProject.healthPercent}% · {currentProject.serverTarget}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <select
              value={currentProject.id}
              onChange={(e) => setActiveCanvasProjectId(e.target.value)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => restoreGitStableBuild(currentProject.id)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <span>Rollback</span>
            </button>

            <button
              onClick={runBuildSimulation}
              disabled={isSimulatingBuild}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingBuild ? 'animate-spin' : ''}`} />
              <span>{isSimulatingBuild ? 'Building...' : 'Run Pipeline'}</span>
            </button>
          </div>
        </div>

        {/* Workspace Section Switcher: Overview + 4 Interactive Studios */}
        <div className="flex items-center gap-1 pt-2 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto">
          {workspaceTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Unified 5-Cell Horizontal Summary Bar */}
      <SummaryMetricGrid>
        <SummaryMetricCard
          title="Project Health"
          primaryValue={`${currentProject.healthPercent}%`}
          subtitle={currentProject.status}
          status={currentProject.healthPercent >= 90 ? 'good' : 'warn'}
        />
        <SummaryMetricCard
          title="Linked Clients"
          primaryValue={currentProject.clientIds.length}
          subtitle={linkedClientNames}
          status="live"
        />
        <SummaryMetricCard
          title="Target Runtime"
          primaryValue={currentProject.serverTarget}
          subtitle={currentProject.framework || 'Next.js 15 + Fastify'}
          status="neutral"
        />
        <SummaryMetricCard
          title="Swarm Fleet"
          primaryValue={`${agents.length} Agents`}
          subtitle="MOD-01–MOD-10 Mesh"
          status="good"
        />
        <SummaryMetricCard
          title="Build Logs"
          primaryValue={`${buildLogs.length} Steps`}
          subtitle={isSimulatingBuild ? 'Running Pipeline' : 'Sandbox Synced'}
          status={isSimulatingBuild ? 'live' : 'good'}
        />
      </SummaryMetricGrid>

      {/* SECTION 1: PROJECT OVERVIEW (SDLC, AGENTS, DOCKER, LOGS) */}
      {activeSection === 'overview' && (
        <div className="space-y-4">
          {/* Sub-view switcher */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#111318] p-1 rounded-lg border border-slate-200/80 dark:border-slate-800/80 w-fit">
            {[
              { id: 'sdlc', label: 'Architecture', icon: Cpu },
              { id: 'agents', label: 'Agents', icon: Bot },
              { id: 'docker', label: 'Docker', icon: Box },
              { id: 'logs', label: 'Logs', icon: Terminal },
            ].map((sub) => {
              const Icon = sub.icon;
              return (
                <button
                  key={sub.id}
                  onClick={() => setOverviewSubView(sub.id as OverviewSubView)}
                  className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    overviewSubView === sub.id
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {overviewSubView === 'sdlc' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Architecture Summary */}
              <div className="lg:col-span-2 bg-white dark:bg-[#111318] rounded-xl p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    SDLC Stack & Service Wiring
                  </h3>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Git HEAD Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">Database & Data Structure</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {currentProject.dataStructureModel || 'PostgreSQL 16 Multi-Tenant + Redis'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">Starter Template</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {currentProject.templatesUsed || 'Enterprise B2B SaaS Boilerplate'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    Connected Microservices
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      currentProject.connectedServices || [
                        'WhatsApp Automation API',
                        'Email SLM Handler',
                        'Stripe Webhook',
                        'n8n Event Hub',
                      ]
                    ).map((serv, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 inline-flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-indigo-500" />
                        {serv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Jumps into the 4 Studios */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    Project Studios
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {workspaceTabs
                      .filter((t) => t.id !== 'overview')
                      .map((studio) => {
                        const Icon = studio.icon;
                        return (
                          <button
                            key={studio.id}
                            onClick={() => setActiveSection(studio.id)}
                            className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 text-left transition-colors bg-slate-50/40 dark:bg-slate-900/30"
                          >
                            <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-1" />
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">
                              {studio.label}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* CI/CD & Backup Panel */}
              <div className="bg-white dark:bg-[#111318] rounded-xl p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Deploy & Snapshots
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ship updates to production or snapshot current state.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => triggerDeployment(currentProject.id, 'Production')}
                    className="w-full py-2 px-3 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Deploy to Production</span>
                  </button>

                  <button
                    onClick={() => createManualBackup(currentProject.id)}
                    className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Take Snapshot</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5 font-medium mb-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Auto-Rollback Active</span>
                  </div>
                  <span className="text-[11px] opacity-85">
                    Restores last green commit automatically on runtime failure.
                  </span>
                </div>
              </div>
            </div>
          )}

          {overviewSubView === 'agents' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents.map((ag) => (
                <div
                  key={ag.id}
                  className="bg-white dark:bg-[#111318] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{ag.avatar}</span>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                            {ag.name}
                          </h4>
                          <p className="text-[11px] text-slate-400">{ag.role}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                        {ag.status}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-900/50 text-xs space-y-1 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Model</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{ag.model}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Accuracy</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{ag.accuracyScore}%</span>
                      </div>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2">
                      {ag.activeTask || 'Awaiting instruction'}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{(ag.tokensProcessed / 1000000).toFixed(1)}M tokens</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      {ag.tasksCompleted} done
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {overviewSubView === 'docker' && (
            <div className="bg-white dark:bg-[#111318] rounded-xl p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Box className="w-4 h-4 text-indigo-500" />
                    <span>Docker Sandbox Containerfile</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Multi-stage distroless build running in isolated project sandbox.
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-md">
                  Docker v26.1
                </span>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto space-y-1.5">
                <div className="text-slate-400"># Dockerfile for {currentProject.name}</div>
                <div className="text-cyan-400">FROM node:22-alpine AS builder</div>
                <div>WORKDIR /app</div>
                <div>COPY package*.json ./ && RUN npm ci --omit=dev</div>
                <div>COPY . . && RUN npm run build</div>
                <div className="text-cyan-400 pt-1">FROM gcr.io/distroless/nodejs22-debian12</div>
                <div>COPY --from=builder /app/dist /app/dist</div>
                <div>EXPOSE 3000</div>
                <div className="text-emerald-400">CMD ["/app/dist/server.js"]</div>
              </div>
            </div>
          )}

          {overviewSubView === 'logs' && (
            <div className="bg-slate-950 text-slate-200 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SDLC Agent Stream</span>
                </span>
                <span className="text-emerald-400">Active</span>
              </div>

              <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
                {buildLogs.map((log, i) => (
                  <div key={i} className="text-slate-300 text-[11px] leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: SCOPE & ER STUDIO (MOD-02 & MOD-05) */}
      {activeSection === 'builder' && (
        <ProjectBuilderTab
          projectId={currentProject.id}
          projectName={currentProject.name}
          embedded
        />
      )}

      {/* SECTION 3: FIGCRAFT DESIGN STUDIO (MOD-03 & MOD-04) */}
      {activeSection === 'design' && (
        <NoCodeEditorTab
          projectId={currentProject.id}
          projectName={currentProject.name}
          embedded
        />
      )}

      {/* SECTION 4: MULTI-VIEWPORT & ANDROID PREVIEW STUDIO (MOD-03, 04, 06) */}
      {activeSection === 'preview' && (
        <PreviewStudioTab
          projectId={currentProject.id}
          projectName={currentProject.name}
          embedded
        />
      )}

      {/* SECTION 5: N8N WORKFLOW ENGINE (@xyflow/react) */}
      {activeSection === 'workflows' && (
        <N8nWorkflowsTab
          projectId={currentProject.id}
          projectName={currentProject.name}
          embedded
        />
      )}
    </div>
  );
};
