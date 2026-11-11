import React, { useState } from 'react';
import {
  X,
  FolderGit2,
  Sparkles,
  CheckCircle2,
  Loader2,
  Terminal,
  GitBranch,
  FileCode2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ExternalBuilderTool, ProjectType } from '../../types';

interface PullProjectFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported?: (projectId: string) => void;
}

const SOURCE_TOOLS: ExternalBuilderTool[] = [
  'Claude Code',
  'ChatGPT Codex',
  'Cursor',
  'Launch Up Template',
];

export const PullProjectFolderModal: React.FC<PullProjectFolderModalProps> = ({
  isOpen,
  onClose,
  onImported,
}) => {
  const { clients, discoveredWorkspaces, importProjectFolder, openProjectWorkspace } = useApp();

  const [folderPath, setFolderPath] = useState(
    discoveredWorkspaces[0]?.folderPath || 'workspaces/sample-claude-code-app'
  );
  const [sourceTool, setSourceTool] = useState<ExternalBuilderTool>('Claude Code');
  const [clientId, setClientId] = useState<string>(clients[0]?.id || 'client-1');
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('SaaS Platform');
  const [autoBootstrap, setAutoBootstrap] = useState(true);
  const [isPulling, setIsPulling] = useState(false);

  if (!isOpen) return null;

  const matchedDiscovered = discoveredWorkspaces.find(
    (w) => w.folderPath === folderPath.trim()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath.trim() || isPulling) return;
    setIsPulling(true);
    try {
      const { project } = await importProjectFolder({
        folderPath: folderPath.trim(),
        sourceTool,
        clientId: clientId || undefined,
        projectName: projectName.trim() || undefined,
        projectType,
        autoBootstrap,
      });
      onClose();
      if (onImported) {
        onImported(project.id);
      } else {
        openProjectWorkspace(project.id);
      }
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-[#0D1017] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Pull External Project from Local Folder
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Import projects built with Claude Code, ChatGPT Codex, or Cursor into Launch Up Deployments, QA, SRE &amp; FinOps.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Pull Project Modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Auto-Discovered workspaces/* quick selector */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Auto-Discovered Workspaces (`workspaces/*`)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {discoveredWorkspaces.map((ws) => (
                <button
                  key={ws.folderPath}
                  type="button"
                  onClick={() => {
                    setFolderPath(ws.folderPath);
                    if (ws.manifest?.sourceTool) setSourceTool(ws.manifest.sourceTool);
                    if (ws.manifest?.name) setProjectName(ws.manifest.name);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    folderPath === ws.folderPath
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white truncate">
                      {ws.folderName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                      {ws.hasManifest ? 'project.launchup.json' : 'Raw Folder'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {ws.manifest?.name || ws.folderPath}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Local Folder Path Input */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Local Project Folder Path (e.g. `D:\Projects\my-claude-app` or `workspaces/sample-claude-code-app`)
            </label>
            <input
              type="text"
              required
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              placeholder="D:\Projects\my-claude-app"
              className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Built With Tool
              </label>
              <select
                value={sourceTool}
                onChange={(e) => setSourceTool(e.target.value as ExternalBuilderTool)}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {SOURCE_TOOLS.map((tool) => (
                  <option key={tool} value={tool}>
                    {tool}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link Client (M:N Tenant)
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.tier})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="SaaS Platform">SaaS Platform</option>
                <option value="Marketing Website">Marketing Website</option>
                <option value="Landing Page">Landing Page</option>
                <option value="CRM Platform">CRM Platform</option>
                <option value="Mobile App API">Mobile App API</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Override Display Name (Optional)
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Auto-inferred from folder or project.launchup.json"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Raw Folder Auto-Bootstrapper Card */}
          <div className="rounded-xl border border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5 space-y-2">
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span className="font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Auto-Bootstrapper for Raw Folders</span>
              </span>
              <input
                type="checkbox"
                checked={autoBootstrap}
                onChange={(e) => setAutoBootstrap(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
              <span className="inline-flex items-center gap-1">
                <FileCode2 className="w-3 h-3 text-emerald-500" />
                {matchedDiscovered?.hasManifest ? 'Reads existing project.launchup.json' : 'Generates project.launchup.json'}
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Initializes checkpoint_handoff_state.md
              </span>
              <span className="inline-flex items-center gap-1">
                <Terminal className="w-3 h-3 text-indigo-500" />
                Runs `graphify update .` AST index
              </span>
              <span className="inline-flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-purple-500" />
                feature/dev · testing · uat · main
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPulling}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 inline-flex items-center gap-1.5"
            >
              {isPulling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderGit2 className="w-3.5 h-3.5" />}
              <span>{isPulling ? 'Bootstrapping...' : 'Pull & Open Workspace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
