import React from 'react';
import { 
  X, Building, Mail, Globe, Phone, ShieldCheck, 
  ExternalLink, Rocket, Database, DollarSign, FolderKanban, CheckCircle2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ClientDetailDrawer: React.FC = () => {
  const {
    selectedClient,
    setSelectedClient,
    projects,
    triggerDeployment,
    createManualBackup,
    setActiveCanvasProjectId,
    setCurrentTab,
  } = useApp();

  if (!selectedClient) return null;

  // Find linked projects for this client (Many-to-Many link)
  const clientProjects = projects.filter((p) => selectedClient.projectIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#111318] border-l border-slate-200 dark:border-slate-800 shadow-lg flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold text-base flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                {selectedClient.initials}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedClient.name}
                </h2>
                <a
                  href={`https://${selectedClient.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>{selectedClient.domain}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <button
              onClick={() => setSelectedClient(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Tier & Retainer Card */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Account Tier:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">{selectedClient.tier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Monthly Retainer:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  ${selectedClient.monthlySubscription.toLocaleString()}/mo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Account Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {selectedClient.status}
                </span>
              </div>
            </div>

            {/* Primary Contact */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
                Primary Contact Information
              </h3>
              <div className="space-y-2 bg-white dark:bg-[#151C2C] p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedClient.primaryContact.name} ({selectedClient.primaryContact.role})
                </p>
                <p className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  {selectedClient.primaryContact.email}
                </p>
                {selectedClient.phone && (
                  <p className="text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    {selectedClient.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Linked Projects (Many-to-Many Architecture) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Associated Projects ({clientProjects.length})
                </h3>
              </div>

              <div className="space-y-2.5">
                {clientProjects.length === 0 ? (
                  <p className="text-slate-400 italic">No projects linked yet.</p>
                ) : (
                  clientProjects.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-[11px] text-slate-400">{p.type} • {p.framework}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {p.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                        <button
                          onClick={() => {
                            setActiveCanvasProjectId(p.id);
                            setCurrentTab('project-canvas');
                            setSelectedClient(null);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                          Open Studios
                        </button>

                        <button
                          onClick={() => triggerDeployment(p.id, 'Production')}
                          className="px-2.5 py-1 text-[11px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-1 transition-colors"
                        >
                          <Rocket className="w-3 h-3" />
                          <span>Deploy</span>
                        </button>

                        <button
                          onClick={() => createManualBackup(p.id)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md flex items-center gap-1 transition-colors"
                        >
                          <Database className="w-3 h-3 text-emerald-500" />
                          <span>Backup</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Client Notes & SLA */}
            {selectedClient.notes && (
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1.5">
                  SLA & Project Requirements
                </h3>
                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                  {selectedClient.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
