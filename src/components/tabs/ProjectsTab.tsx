import React, { useState } from 'react';
import { 
  FolderKanban, Plus, Search, Filter, Rocket, Database, 
  ExternalLink, GitBranch, Server, CheckCircle2, Clock, 
  AlertCircle, ArrowUpRight, ShieldCheck, Users, RefreshCw,
  Sparkles, Play, Code, Box
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus } from '../../types';
import { ScreenAnalyticsHeader } from '../common/ScreenAnalyticsHeader';

export const ProjectsTab: React.FC = () => {
  const { 
    projects, 
    clients, 
    setIsCreateProjectModalOpen, 
    triggerDeployment, 
    createManualBackup,
    setSelectedProject,
    setActiveCanvasProjectId,
    setCurrentTab
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [clientFilter, setClientFilter] = useState<string>('All');

  const liveProjects = projects.filter(p => p.status === 'Live').length;
  const inProgressProjects = projects.filter(p => p.status === 'In Progress').length;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.framework.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesClient = clientFilter === 'All' || p.clientIds.includes(clientFilter);
    return matchesSearch && matchesStatus && matchesClient;
  });

  const handleOpenCanvas = (projectId: string) => {
    setActiveCanvasProjectId(projectId);
    setCurrentTab('project-canvas');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Combined Analytics Section with Live Success/Error Rates */}
      <ScreenAnalyticsHeader
        title="Projects Orchestrator & Multi-Stack SDLC"
        badge="Parallel Build Mesh Active"
        description="Connect clients to projects, configure git repositories, selected stacks (MERN, MEAN, Kafka, Android KMP), and launch the AI Project Canvas for autonomous agent code generation and Docker shipping."
        metrics={[
          {
            label: 'Total Projects',
            value: projects.length,
            subValue: `${liveProjects} Live • ${inProgressProjects} In Dev`,
            status: 'good',
          },
          {
            label: 'Live Success Rate',
            value: '99.94%',
            subValue: 'Across edge & cloud runs',
            status: 'live',
          },
          {
            label: 'Active Error Rate',
            value: '0.06%',
            subValue: 'Auto-rollback protected',
            status: 'good',
          },
          {
            label: 'Docker Sandboxes',
            value: `${projects.length} / ${projects.length}`,
            subValue: '100% Synced',
            status: 'good',
          },
          {
            label: 'Git Mirror Backups',
            value: 'Continuous',
            subValue: 'Disaster proof S3/Git',
            status: 'good',
          },
        ]}
        actions={
          <button
            id="create-project-btn"
            onClick={() => setIsCreateProjectModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, framework, stack..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Live">Live</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          {/* Client Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Linked Client:</span>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
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
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          // Find all clients linked to this project (Many-to-Many!)
          const linkedClients = clients.filter((c) => project.clientIds.includes(c.id));

          return (
            <div
              key={project.id}
              className="bg-white dark:bg-[#111622] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Project Name + Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-400">{project.type}</p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                      project.status === 'Live'
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                        : project.status === 'In Progress'
                        ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Many-to-Many: Linked Clients Badge Row */}
                <div className="mb-4 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Linked Stakeholders / Clients ({linkedClients.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {linkedClients.map((client) => (
                      <span
                        key={client.id}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {client.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech Stack & Environment details */}
                <div className="space-y-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800/80 mb-4">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-indigo-400" />
                      Server Target:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {project.serverTarget}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                      Branch:
                    </span>
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {project.branch}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-500" />
                      Git & DB Backup:
                    </span>
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {project.lastBackupDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Deploy & Backup & Open Canvas */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => handleOpenCanvas(project.id)}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center justify-center gap-1.5 border border-indigo-200/60 dark:border-indigo-800/60"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Open AI Project Canvas (SDLC & Agents)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerDeployment(project.id, 'Production')}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Deploy</span>
                  </button>

                  <button
                    onClick={() => createManualBackup(project.id)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Run Git & Snapshot Backup"
                  >
                    <Database className="w-4 h-4 text-emerald-500" />
                  </button>

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Open Live URL"
                    >
                      <ExternalLink className="w-4 h-4 text-indigo-400" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
