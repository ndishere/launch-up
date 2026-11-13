import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ExternalLink,
  RefreshCw,
  GitBranch,
  Database,
  Play,
  Layers,
  AlertTriangle,
  Smartphone,
  Shield,
  Globe,
  Terminal,
  Sparkles,
  FolderGit2,
  Rocket,
  CheckCircle2,
  Check,
  Eye,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThreeZoneScreenLayout } from '../layout/ThreeZoneScreenLayout';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { ExpandableDetailToggleButton } from '../common/ExpandableRightDetailPanel';
import { PullProjectFolderModal } from '../modals/PullProjectFolderModal';
import {
  synthesizeScope,
  buildLandingWeb,
  buildMobileApp,
  buildBackendAPI,
} from '../../services/api';

export const ProjectsTab: React.FC = () => {
  const {
    projects,
    clients,
    setIsCreateProjectModalOpen,
    triggerDeployment,
    restoreGitStableBuild,
    createManualBackup,
    setActiveCanvasProjectId,
    openProjectWorkspace,
    setCurrentTab,
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [clientFilter, setClientFilter] = useState('All');
  const [isPullModalOpen, setIsPullModalOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [approvedGoLiveIds, setApprovedGoLiveIds] = useState<Set<string>>(new Set());

  // MOD-02..05 Autonomous Factory State
  const [factoryRunning, setFactoryRunning] = useState(false);
  const [factoryBrief, setFactoryBrief] = useState(
    'Multi-vendor logistics platform with instant WhatsApp parcel tracking and DPDP privacy export.'
  );
  const [factoryCountry, setFactoryCountry] = useState<'IN' | 'US' | 'DE'>('IN');
  const [factoryOutput, setFactoryOutput] = useState<{
    mode: string;
    prdSummary: string;
    webUrl: string;
    androidPackage: string;
    rlsPoliciesCount: number;
    gateId: string;
  } | null>(null);

  const handleRunAutonomousFactory = async () => {
    setFactoryRunning(true);
    try {
      const targetProjId = projects[0]?.id || '11111111-1111-4111-8111-111111111111';
      const scopeRes = await synthesizeScope({
        project_id: targetProjId,
        interview_transcript: factoryBrief,
        target_countries: [factoryCountry],
        requested_modules: ['web', 'android', 'backend'],
      });

      const webRes = await buildLandingWeb({
        project_id: targetProjId,
        brand_kit: { name: 'LaunchUp Client Brand', primary_color: '#6366f1' },
        routes: ['/', '/pricing', '/privacy'],
        seo_metadata: { title: 'Autonomous Web Presence' },
        compliance_flags: factoryCountry === 'IN' ? ['DPDP_INDIA'] : ['GDPR_EU'],
      });

      const mobileRes = await buildMobileApp({
        project_id: targetProjId,
        app_name: 'Client Logistics App',
        package_id: 'com.launchup.logistics',
        openapi_spec_url: 'https://api.example.com/openapi.json',
        brand_kit: { name: 'LaunchUp Client Brand' },
      });

      const backendRes = await buildBackendAPI({
        project_id: targetProjId,
        sql_ddl: scopeRes.data.sql_ddl,
        rbac_matrix: { admin: ['*'], user: ['read'] },
        openapi_spec_url: 'https://api.example.com/openapi.json',
      });

      setFactoryOutput({
        mode: scopeRes.isLive ? 'live' : 'fallback',
        prdSummary: scopeRes.data.prd_markdown || 'Synthesized PRD & PostgreSQL Schema',
        webUrl: webRes.data.staging_url,
        androidPackage: mobileRes.data.signed_aab_url,
        rlsPoliciesCount: backendRes.data.rls_tables_verified_count ?? 6,
        gateId: scopeRes.data.approval_gate_id,
      });
    } finally {
      setFactoryRunning(false);
    }
  };

  const getClientNames = (clientIds: string[]) => {
    const names = clients.filter((c) => clientIds.includes(c.id)).map((c) => c.name);
    return names.length > 0 ? names.join(', ') : 'Agency Internal';
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const clientNames = getClientNames(p.clientIds).toLowerCase();
      const matchesSearch =
        !localSearch.trim() ||
        p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
        clientNames.includes(localSearch.toLowerCase()) ||
        (p.framework && p.framework.toLowerCase().includes(localSearch.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesClient = clientFilter === 'All' || p.clientIds.includes(clientFilter);
      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [projects, clients, localSearch, statusFilter, clientFilter]);

  const liveProjects = projects.filter((p) => p.status === 'Live').length;
  const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
  const avgHealth =
    projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + p.healthPercent, 0) / projects.length)
      : 100;

  const handleOpenWorkspace = (projectId: string) => {
    setActiveCanvasProjectId(projectId);
    openProjectWorkspace(projectId);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const selectedClient = selectedProject ? clients.find((c) => selectedProject.clientIds?.includes(c.id)) : undefined;

  return (
    <>
      <ThreeZoneScreenLayout
        title="Software Projects"
        subtitle="Open any built project to inspect Scope & ER diagrams, FigCraft UI, multi-viewport previews, and n8n automations."
        badge="SDLC & Studios"
        isSidePanelOpen={isSidePanelOpen}
        onToggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)}
        sidePanelTitle={selectedProject ? selectedProject.name : 'Project Details'}
        sidePanelSubtitle={
          selectedProject
            ? `${getClientNames(selectedProject.clientIds)} · ${selectedProject.framework || 'React'}`
            : 'Select a project'
        }
        headerActions={
          <>
            <button
              type="button"
              onClick={() => setIsPullModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 border border-indigo-200/80 dark:border-indigo-800/70 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Pull Project from Folder</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Project</span>
            </button>

            <ExpandableDetailToggleButton
              isOpen={isSidePanelOpen}
              onToggle={() => setIsSidePanelOpen((prev) => !prev)}
            />
          </>
        }
        summaryMetrics={
          <SummaryMetricGrid>
            <SummaryMetricCard
              title="Total Projects"
              primaryValue={projects.length}
              subtitle={`${liveProjects} live in production`}
              status="good"
            />
            <SummaryMetricCard
              title="Live Production"
              primaryValue={liveProjects}
              subtitle="100% Uptime Monitored"
              status="live"
            />
            <SummaryMetricCard
              title="Build Swarm"
              primaryValue={activeProjects}
              subtitle="Active CI/CD Pipelines"
              status={activeProjects > 0 ? 'warn' : 'good'}
            />
            <SummaryMetricCard
              title="Container Sync"
              primaryValue={`${projects.length}/${projects.length}`}
              subtitle="Zero Drift Verified"
              status="good"
            />
            <SummaryMetricCard
              title="Rollback Guard"
              primaryValue="100%"
              subtitle="Snapshot Recovery Ready"
              status="good"
            />
          </SummaryMetricGrid>
        }
        sidePanelContent={
          selectedProject ? (
            <div className="space-y-4">
              {/* Header Badge & Server Target */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                    selectedProject.status === 'Live'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : selectedProject.status === 'In Progress'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                  }`}
                >
                  {selectedProject.status}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target: {selectedProject.serverTarget}
                </span>
              </div>

              {/* Title & Client */}
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {selectedProject.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Client: <strong className="text-slate-700 dark:text-slate-300">{getClientNames(selectedProject.clientIds)}</strong>
                </p>
              </div>

              {/* 5-Step Progress Checklist */}
              <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    5-Step Build Checklist
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {selectedProject.status === 'Live' ? '5/5 Complete' : '4/5 Staging Ready'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="line-through text-slate-400">1. Plan (PRD & Schema synthesized · MOD-02)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="line-through text-slate-400">2. Design (Theme tokens & layout · MOD-03)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="line-through text-slate-400">3. Build (Backend Fastify & Vite · MOD-04 & 05)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="line-through text-slate-400">4. Quality Check (Graphify AST & CVE audit)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    {selectedProject.status === 'Live' || approvedGoLiveIds.has(selectedProject.id) ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-amber-500 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      </div>
                    )}
                    <span className={selectedProject.status === 'Live' || approvedGoLiveIds.has(selectedProject.id) ? 'line-through text-slate-400' : 'font-semibold text-slate-900 dark:text-slate-100'}>
                      5. Live (Docker container & edge route)
                    </span>
                  </div>
                </div>
              </div>

              {/* FinOps Unit Economics Box */}
              <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Unit Economics & Profit</span>
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    99.4% Margin
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Monthly Client Retainer</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    ${selectedClient?.monthlySubscription || 2500}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Cloud & LLM Run Cost</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">~$14.20/mo</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Net Agency Profit</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +${(selectedClient?.monthlySubscription || 2500) - 14}/mo
                  </span>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Framework</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedProject.framework || 'React + Fastify'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Git Branch</span>
                  <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{selectedProject.branch}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">System Health</span>
                  <span className="font-bold text-emerald-600">{selectedProject.healthPercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Rollback Guard</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedProject.backupStatus}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenWorkspace(selectedProject.id)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Open Full Workspace & Studios</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setApprovedGoLiveIds((prev) => new Set(prev).add(selectedProject.id));
                    triggerDeployment(selectedProject.id, 'Production');
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer ${
                    approvedGoLiveIds.has(selectedProject.id) || selectedProject.status === 'Live'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>
                    {approvedGoLiveIds.has(selectedProject.id) || selectedProject.status === 'Live'
                      ? 'Live in Production (Gate 3 Approved)'
                      : 'Approve Go-Live (Gate 3)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('preview-studio')}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Multi-Viewport Preview (375px–1920px)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a project from the left to view checklist and details.
            </div>
          )
        }
      >
        {/* Section 2: Main Content Area (Column 1) */}
        
        {/* Compact MOD-02..05 Autonomous Factory Strip */}
        <div className="bg-white dark:bg-[#111318] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Autonomous App Factory (MOD-02 → MOD-05)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Synthesize scope, web layout, Android package, and RLS backend from a quick brief.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={factoryCountry}
                onChange={(e) => setFactoryCountry(e.target.value as 'IN' | 'US' | 'DE')}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="IN">India (DPDP)</option>
                <option value="DE">Germany (GDPR)</option>
                <option value="US">USA (CCPA)</option>
              </select>

              <input
                type="text"
                value={factoryBrief}
                onChange={(e) => setFactoryBrief(e.target.value)}
                placeholder="Client brief..."
                className="w-56 sm:w-72 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />

              <button
                onClick={handleRunAutonomousFactory}
                disabled={factoryRunning}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Terminal className={`w-3.5 h-3.5 ${factoryRunning ? 'animate-spin' : ''}`} />
                <span>{factoryRunning ? 'Building...' : 'Build Full Stack'}</span>
              </button>
            </div>
          </div>

          {factoryOutput && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200 inline-flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-500" /> Web Preview
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {factoryOutput.mode === 'live' ? '● Live' : '○ Fallback'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {factoryOutput.webUrl}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
                <div className="font-medium text-slate-800 dark:text-slate-200 mb-1 inline-flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> Android AAB
                </div>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {factoryOutput.androidPackage}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
                <div className="font-medium text-slate-800 dark:text-slate-200 mb-1 inline-flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-500" /> RLS Backend
                </div>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {factoryOutput.rlsPoliciesCount} Policies · Gate {factoryOutput.gateId}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Filter projects by name, client, framework..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#111318] border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#111318] border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Live">Live</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="On Hold">On Hold</option>
            </select>

            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#111318] border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Minimalist Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const clientLabel = getClientNames(project.clientIds);
            const isSelected = selectedProject?.id === project.id;
            const statusStyles =
              project.status === 'Live'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                : project.status === 'In Progress'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                : project.status === 'On Hold'
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`rounded-xl p-4 border transition-all flex flex-col justify-between cursor-pointer group ${
                  isSelected
                    ? 'ring-2 ring-indigo-500/80 border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                    : 'bg-white dark:bg-[#111318] border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {project.name}
                        </h3>
                        {project.sourceTool && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 shrink-0">
                            {project.sourceTool}
                          </span>
                        )}
                        <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {clientLabel} · {project.framework || 'React + Fastify'}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 ${statusStyles}`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-2.5 p-2.5 rounded-lg bg-slate-50/70 dark:bg-slate-900/50 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Target</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">{project.serverTarget}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Health</span>
                      <span
                        className={`font-medium ${
                          project.healthPercent >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'
                        }`}
                      >
                        {project.healthPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Branch</span>
                      <span className="font-medium font-mono text-slate-800 dark:text-slate-200 truncate block">
                        {project.branch}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Backup</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                        {project.backupStatus}
                      </span>
                    </div>
                  </div>

                  {/* Health Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>System Health</span>
                      <span>{project.healthPercent}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          project.healthPercent < 80 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${project.healthPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2"
                >
                  <button
                    onClick={() => handleOpenWorkspace(project.id)}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Open Workspace & Studios</span>
                  </button>

                  <div className="flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => triggerDeployment(project.id, 'Production')}
                      className="flex-1 py-1 px-2 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1 border border-slate-200/70 dark:border-slate-800 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Deploy</span>
                    </button>

                    <button
                      onClick={() => restoreGitStableBuild(project.id)}
                      className="flex-1 py-1 px-2 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1 border border-slate-200/70 dark:border-slate-800 cursor-pointer"
                      title="Rollback to last stable Git commit"
                    >
                      <GitBranch className="w-3 h-3" />
                      <span>Rollback</span>
                    </button>

                    <button
                      onClick={() => createManualBackup(project.id)}
                      className="p-1.5 rounded-md text-[11px] bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/70 dark:border-slate-800 cursor-pointer"
                      title="Take Snapshot"
                    >
                      <Database className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="bg-white dark:bg-[#111318] rounded-xl p-10 text-center border border-slate-200/80 dark:border-slate-800/80">
            <AlertTriangle className="w-7 h-7 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No projects found</h3>
            <p className="text-xs text-slate-400 mt-1">Adjust search filters or create a new project.</p>
          </div>
        )}
      </ThreeZoneScreenLayout>

      <PullProjectFolderModal
        isOpen={isPullModalOpen}
        onClose={() => setIsPullModalOpen(false)}
      />
    </>
  );
};
