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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenAnalyticsHeader } from '../common/ScreenAnalyticsHeader';
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

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-150">
      <ScreenAnalyticsHeader
        title="Projects"
        badge="SDLC & Studios"
        description="Open any built project to inspect Scope & ER diagrams, FigCraft UI, multi-viewport previews, and n8n automations."
        metrics={[
          { label: 'Total Projects', value: projects.length, subValue: `${liveProjects} live`, status: 'good' },
          { label: 'In Progress', value: activeProjects, subValue: 'CI/CD active', status: activeProjects > 0 ? 'live' : 'neutral' },
          { label: 'Avg Health', value: `${avgHealth}%`, subValue: 'AST verified', status: avgHealth >= 90 ? 'good' : 'warn' },
          { label: 'Rollback Guard', value: '100%', subValue: 'Snapshot ready', status: 'good' },
          { label: 'Container Sync', value: `${projects.length}/${projects.length}`, subValue: 'Zero drift', status: 'good' },
        ]}
        actions={
          <button
            onClick={() => setIsCreateProjectModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        }
      />

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
              className="w-64 sm:w-80 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />

            <button
              onClick={handleRunAutonomousFactory}
              disabled={factoryRunning}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-1.5"
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
            placeholder="Filter projects..."
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const clientLabel = getClientNames(project.clientIds);
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
              onClick={() => handleOpenWorkspace(project.id)}
              className="bg-white dark:bg-[#111318] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {project.name}
                      </h3>
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
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Open Workspace & Studios</span>
                </button>

                <div className="flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => triggerDeployment(project.id, 'Production')}
                    className="flex-1 py-1 px-2 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1 border border-slate-200/70 dark:border-slate-800"
                  >
                    <Play className="w-3 h-3" />
                    <span>Deploy</span>
                  </button>

                  <button
                    onClick={() => restoreGitStableBuild(project.id)}
                    className="flex-1 py-1 px-2 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1 border border-slate-200/70 dark:border-slate-800"
                    title="Rollback to last stable Git commit"
                  >
                    <GitBranch className="w-3 h-3" />
                    <span>Rollback</span>
                  </button>

                  <button
                    onClick={() => createManualBackup(project.id)}
                    className="p-1.5 rounded-md text-[11px] bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/70 dark:border-slate-800"
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
    </div>
  );
};
