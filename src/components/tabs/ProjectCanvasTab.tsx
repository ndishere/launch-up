import React, { useState } from 'react';
import { 
  FolderKanban, Play, Terminal, Cpu, Database, GitBranch, 
  Layers, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, 
  ShieldCheck, Box, ExternalLink, Sparkles, Bot, Code, Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenAnalyticsHeader } from '../common/ScreenAnalyticsHeader';

export const ProjectCanvasTab: React.FC = () => {
  const { 
    projects, 
    activeCanvasProjectId, 
    setActiveCanvasProjectId, 
    setCurrentTab,
    agents,
    triggerDeployment,
    createManualBackup,
    restoreGitStableBuild
  } = useApp();

  const currentProject = projects.find(p => p.id === activeCanvasProjectId) || projects[0];

  const [activeCanvasView, setActiveCanvasView] = useState<'sdlc' | 'agents' | 'docker' | 'mcp' | 'logs'>('sdlc');
  const [isSimulatingBuild, setIsSimulatingBuild] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([
    `[00:00.12] ➔ [MCP Orchestrator] Connected to Model Context Protocol endpoints (Claude 3.5 Sonnet + Local Qwen2.5-Coder)`,
    `[00:01.04] ➔ [Aegis Core Agent] Parsing requirements document and decomposing features...`,
    `[00:02.15] ✔ [Data Architect] Synthesized PostgreSQL 16 schema + automated database migrations`,
    `[00:03.40] ➔ [Full-Stack Coder Agent] Generating responsive frontend components with Tailwind CSS & WebGPU bindings`,
    `[00:05.10] ✔ [Docker Multi-Stage Engine] Created production-grade container image (Image size: 42.8MB)`,
    `[00:06.88] ➔ [Sentinel Agent] Auditing security, AST validation, and test harness (Coverage: 98.4%)`,
    `[00:07.95] ✔ [Cloud CI/CD] Sandbox container live and synced with development environment.`,
  ]);

  const runBuildSimulation = () => {
    setIsSimulatingBuild(true);
    const newLogs = [
      `[${new Date().toLocaleTimeString()}] ➔ [Agent Swarm] Initiating parallel SDLC pipeline for ${currentProject.name}...`,
      `[${new Date().toLocaleTimeString()}] ➔ [MCP Host] Querying local Ollama SLM engine and online Gemini API...`,
      `[${new Date().toLocaleTimeString()}] ✔ Verified AST syntax integrity across 48 modules.`,
      `[${new Date().toLocaleTimeString()}] ➔ Packaging Docker container layers (Alpine 3.20 + Node 22 LTS)...`,
      `[${new Date().toLocaleTimeString()}] ✔ Sandbox synchronized with edge cluster. Zero vulnerabilities found.`,
    ];

    setTimeout(() => {
      setBuildLogs(prev => [...prev, ...newLogs]);
      setIsSimulatingBuild(false);
    }, 1800);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Return to Projects */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentTab('projects')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Orchestrator</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Target Project:</span>
          <select
            value={currentProject.id}
            onChange={(e) => setActiveCanvasProjectId(e.target.value)}
            className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Header for Project Canvas */}
      <ScreenAnalyticsHeader
        title={`Project Canvas: ${currentProject.name}`}
        badge="Autonomous AI SDLC & Docker Sandbox"
        description="Where autonomous AI agents leverage the Model Context Protocol (MCP) and configured local/online models to execute full software development life cycle (SDLC), build Docker containers, and ship live applications."
        metrics={[
          {
            label: 'Project Health',
            value: `${currentProject.healthPercent}%`,
            subValue: 'Production-ready',
            status: 'good',
          },
          {
            label: 'Assigned Agents',
            value: currentProject.assignedAgents ? currentProject.assignedAgents.length : 3,
            subValue: 'Aegis + Atlas + DevOps',
            status: 'live',
          },
          {
            label: 'Docker Sandbox',
            value: currentProject.sandboxSynced !== false ? 'In Sync' : 'Syncing',
            subValue: currentProject.sandboxSyncTimestamp || 'Live Cluster',
            status: 'good',
          },
          {
            label: 'Deployment Status',
            value: currentProject.deploymentStatus || 'Healthy Live',
            subValue: currentProject.serverTarget,
            status: 'good',
          },
          {
            label: 'Git Mirror SLA',
            value: 'Zero Downtime',
            subValue: currentProject.lastBackupDate,
            status: 'good',
          },
        ]}
        actions={
          <>
            <button
              onClick={runBuildSimulation}
              disabled={isSimulatingBuild}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSimulatingBuild ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSimulatingBuild ? 'Agents Building...' : 'Run Autonomous Build'}</span>
            </button>
            <button
              onClick={() => restoreGitStableBuild(currentProject.id)}
              className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
              <span>Git Restore to Stable</span>
            </button>
          </>
        }
      />

      {/* Canvas View Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'sdlc' as const, label: 'SDLC Architecture & Spec', icon: Layers },
          { id: 'agents' as const, label: 'Autonomous Agents & MCP', icon: Bot },
          { id: 'docker' as const, label: 'Docker Sandbox & Containers', icon: Box },
          { id: 'logs' as const, label: 'Live Build & Agent Logs', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCanvasView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCanvasView(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeCanvasView === 'sdlc' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-[#111622] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Project Specifications & Linked Deliverables</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1 font-medium">Requirement Document Link:</span>
                  <a 
                    href={currentProject.requirementDocLink || '#'} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span className="truncate">{currentProject.requirementDocLink || 'https://api.launchup.io/v1/client-intake/portal-spec-v1'}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1 font-medium">App Design System URL:</span>
                  <a 
                    href={currentProject.appDesignUrl || 'https://figma.com'} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span className="truncate">{currentProject.appDesignUrl || 'https://figma.com/@launchup/design-tokens-v2'}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1 font-medium">Database & Data Structure:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currentProject.dataStructureModel || 'PostgreSQL 16 Multi-Tenant + Redis Cluster'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1 font-medium">Starter Template Used:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currentProject.templatesUsed || 'Enterprise B2B SaaS Boilerplate'}
                  </span>
                </div>
              </div>

              {/* Connected Services & Automations */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Connected Microservices & Automations:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(currentProject.connectedServices || [
                    'WhatsApp Automation API', 
                    'Email Handling & Analysis SLM', 
                    'Stripe Webhook Gateway',
                    'n8n Event Hub'
                  ]).map((serv, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800 flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-indigo-500" />
                      {serv}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Deploy Panel */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#111622] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                CI/CD Push & Deployment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Push new updates to created projects directly from Launch Up with zero downtime.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => triggerDeployment(currentProject.id, 'Production')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Push New Update (Production)</span>
                </button>

                <button
                  onClick={() => createManualBackup(currentProject.id)}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Take Disaster Snapshot</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Automatic Git Rollback Active</span>
                </div>
                <span>In case of any runtime fault or build issue, Launch Up restores the project to last verified green commit automatically.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeCanvasView === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {agents.map((ag) => (
            <div
              key={ag.id}
              className="bg-white dark:bg-[#111622] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{ag.avatar}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ag.name}</h4>
                      <p className="text-[11px] text-slate-400">{ag.role}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600">
                    {ag.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 mb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Configured Model:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{ag.model}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">MCP Protocol:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Accuracy:</span>
                    <span>{ag.accuracyScore}%</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Active SDLC Task:</span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] italic">
                    "{ag.activeTask || 'Awaiting instruction'}"
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400">Tokens: {(ag.tokensProcessed / 1000000).toFixed(1)}M</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{ag.tasksCompleted} Tasks Done</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeCanvasView === 'docker' && (
        <div className="bg-white dark:bg-[#111622] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-indigo-500" />
                <span>Docker Sandbox & Isolated Microservices Engine</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-stage containerization builds optimized Docker images and runs local sandboxes prior to live cloud release.
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 rounded-lg">
              Docker Engine v26.1 Active
            </span>
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
            <div className="text-slate-400"># Dockerfile for {currentProject.name} (Generated by Chronos DevOps Agent)</div>
            <div className="text-cyan-400">FROM node:22-alpine AS builder</div>
            <div>WORKDIR /app</div>
            <div>COPY package*.json ./ && RUN npm ci --omit=dev</div>
            <div>COPY . .</div>
            <div>RUN npm run build</div>
            <div className="text-cyan-400 pt-2">FROM gcr.io/distroless/nodejs22-debian12</div>
            <div>COPY --from=builder /app/dist /app/dist</div>
            <div>EXPOSE 3000</div>
            <div className="text-emerald-400">CMD ["/app/dist/server.js"]</div>
          </div>
        </div>
      )}

      {activeCanvasView === 'logs' && (
        <div className="bg-slate-950 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-2xl font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Realtime SDLC Agent Execution Stream</span>
            </span>
            <span className="text-emerald-400 text-[11px] animate-pulse">● Live Stream Active</span>
          </div>

          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-2">
            {buildLogs.map((log, i) => (
              <div key={i} className="text-slate-300 text-[11px] leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
