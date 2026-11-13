import React, { useState } from 'react';
import { 
  Users, Plus, Search, ExternalLink, Mail, Phone, 
  Sparkles, Filter, ChevronRight, Eye, FolderKanban, 
  MessageSquare, LayoutGrid, Table as TableIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { ThreeZoneScreenLayout } from '../layout/ThreeZoneScreenLayout';
import { GenerateLeadModal } from '../modals/GenerateLeadModal';

export const ClientsTab: React.FC = () => {
  const { 
    clients, 
    projects,
    setSelectedClient, 
    setIsAddClientModalOpen,
    setCurrentTab,
    openProjectWorkspace,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isGenerateLeadOpen, setIsGenerateLeadOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  // Default active client
  const [activeClient, setActiveClient] = useState<Client>(clients[0] || {
    id: 'c-default',
    name: 'Fresh Bite Café',
    email: 'contact@freshbite.cafe',
    phone: '+91 98765 43210',
    domain: 'freshbite.cafe',
    status: 'Active',
    tier: 'Enterprise',
    monthlySubscription: 2500,
    joinedDate: '2026-01-10',
    notes: 'Fast casual bakery chain. Multi-tenant online ordering platform.',
    initials: 'FB',
    totalSpend: 15000,
  });

  const activeClients = clients.filter((c) => c.status === 'Active').length;
  const totalMRR = clients.reduce((acc, c) => acc + (c.monthlySubscription || 0), 0);
  const avgRetainer = clients.length > 0 ? Math.round(totalMRR / clients.length) : 0;

  // Filter pipeline
  const filteredClients = clients.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (sourceFilter === 'All') return matchesSearch;
    const clientSource = (c as any).source || 'Google Maps';
    return matchesSearch && clientSource.toLowerCase().includes(sourceFilter.toLowerCase());
  });

  const sources = ['All', 'Google Maps', 'WhatsApp', 'Email', 'Instagram DM'];

  const kanbanColumns = [
    { id: 'Prototype ready', label: 'Prototype Ready', badgeTone: 'good' as const },
    { id: 'Pitched', label: 'Pitched', badgeTone: 'live' as const },
    { id: 'Sales follow-up', label: 'Sales Follow-Up', badgeTone: 'warn' as const },
    { id: 'Won', label: 'Won Retainer', badgeTone: 'good' as const },
  ];

  const getClientStage = (c: Client): string => {
    if (c.status === 'Active') return 'Won';
    if ((c as any).pipelineStage) return (c as any).pipelineStage;
    const hash = c.id.charCodeAt(c.id.length - 1) % 4;
    return kanbanColumns[hash].id;
  };

  const getClientSource = (c: Client): string => {
    return (c as any).source || 'Google Maps';
  };

  return (
    <>
      <ThreeZoneScreenLayout
        title="Client Accounts & Funnel"
        subtitle="Manage client retainers, discovery leads, live software prototypes, and high-conversion pitch workflows."
        badge="Autonomous CRM"
        isSidePanelOpen={isSidePanelOpen}
        onToggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)}
        sidePanelTitle={activeClient ? activeClient.name : 'Client Details'}
        sidePanelSubtitle={activeClient ? activeClient.domain : 'Select a client'}
        headerActions={
          <>
            <button
              id="generate-lead-scan-btn"
              type="button"
              onClick={() => setIsGenerateLeadOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-indigo-200/80 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Generate Lead (Scan)</span>
            </button>

            <button
              id="add-client-btn"
              type="button"
              onClick={() => setIsAddClientModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Client</span>
            </button>
          </>
        }
        summaryMetrics={
          <SummaryMetricGrid>
            <SummaryMetricCard
              title="Active Retainers"
              primaryValue={activeClients}
              subtitle="Paying Businesses"
              status="good"
            />
            <SummaryMetricCard
              title="Pipeline Leads"
              primaryValue={filteredClients.length}
              subtitle="Scanned & Staged"
              status="live"
            />
            <SummaryMetricCard
              title="Monthly Retainers"
              primaryValue={`$${totalMRR.toLocaleString()}/mo`}
              subtitle="Gross Billed Value"
              status="good"
            />
            <SummaryMetricCard
              title="Avg Monthly Retainer"
              primaryValue={`$${avgRetainer.toLocaleString()}`}
              subtitle="Per Client Contract"
              status="good"
            />
            <SummaryMetricCard
              title="Fast-Track Protos"
              primaryValue={filteredClients.filter((c) => getClientStage(c) === 'Prototype ready').length || 4}
              subtitle="88% Reusable Code"
              status="good"
            />
          </SummaryMetricGrid>
        }
        sidePanelContent={
          activeClient ? (
            <div className="space-y-4">
              {/* Header Badge & Stage */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                    activeClient.status === 'Active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {getClientStage(activeClient)}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Source: {getClientSource(activeClient)}
                </span>
              </div>

              {/* Business Name & Domain */}
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {activeClient.name}
                </h4>
                <a
                  href={`https://${activeClient.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <span>{activeClient.domain}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Financial & Contract Spec */}
              <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Retainer Value</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    ${activeClient.monthlySubscription}/month
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Contract Tier</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">{activeClient.tier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Joined Date</span>
                  <span className="text-slate-700 dark:text-slate-300">{activeClient.joinedDate || 'Recently'}</span>
                </div>
                {activeClient.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Email</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[170px]">{activeClient.email}</span>
                  </div>
                )}
                {activeClient.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Phone</span>
                    <span className="text-slate-700 dark:text-slate-300">{activeClient.phone}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {activeClient.notes && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Discovery Notes
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    {activeClient.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setCurrentTab('preview-studio')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Multi-Viewport Preview (375px)</span>
                </button>

                <button
                  onClick={() => {
                    const clientProj = projects.find((p) => p.clientIds?.includes(activeClient.id)) || projects[0];
                    if (clientProj) {
                      openProjectWorkspace(clientProj.id);
                    } else {
                      setCurrentTab('projects');
                    }
                  }}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Open Client Project Workspace</span>
                </button>

                <button
                  onClick={() => {
                    if (activeClient.phone) {
                      window.open(`https://wa.me/${activeClient.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(activeClient.name)},%20your%20software%20prototype%20is%20ready!`, '_blank');
                    } else {
                      window.location.href = `mailto:${activeClient.email}?subject=Launch%20Up%20Prototype%20Demo`;
                    }
                  }}
                  className="w-full text-center text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline py-1 cursor-pointer"
                >
                  Send personalized pitch message →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a client to view full details and pitch actions.
            </div>
          )
        }
      >
        {/* Section 2: Main Content Area (Column 1) */}
        
        {/* Search, Source Filter & View Switcher Bar */}
        <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by business name, domain, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Source Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {sources.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setSourceFilter(src)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  sourceFilter === src
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Kanban vs Table */}
          <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Kanban Pipeline View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* View Mode 1: Kanban Pipeline View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {kanbanColumns.map((col) => {
              const columnClients = filteredClients.filter(
                (c) => getClientStage(c) === col.id
              );

              return (
                <div
                  key={col.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col gap-3 min-h-[380px] shadow-xs transition-colors"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{col.label}</span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {columnClients.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px]">
                    {columnClients.map((client) => {
                      const isSelected = activeClient?.id === client.id;
                      return (
                        <div
                          key={client.id}
                          onClick={() => {
                            setActiveClient(client);
                            setSelectedClient(client);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/20'
                              : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                              {client.name}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {getClientSource(client)}
                            </span>
                          </div>

                          <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 block mt-0.5 truncate">
                            {client.domain}
                          </span>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                              ${client.monthlySubscription}/mo
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              {client.tier}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {columnClients.length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        No clients in this stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Mode 2: Clean Table View */}
        {viewMode === 'table' && (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs overflow-x-auto transition-colors">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="pb-3">Business Name</th>
                  <th className="pb-3">Domain</th>
                  <th className="pb-3">Source</th>
                  <th className="pb-3">Stage</th>
                  <th className="pb-3">Contract Value</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClients.map((client) => {
                  const isSelected = activeClient?.id === client.id;
                  const stage = getClientStage(client);
                  return (
                    <tr
                      key={client.id}
                      onClick={() => {
                        setActiveClient(client);
                        setSelectedClient(client);
                      }}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {client.name}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                        {client.domain}
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">
                        {getClientSource(client)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                            stage === 'Won'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {stage}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        ${client.monthlySubscription}/mo
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                          Select →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ThreeZoneScreenLayout>

      {/* Generate Lead Modal */}
      {isGenerateLeadOpen && (
        <GenerateLeadModal
          isOpen={isGenerateLeadOpen}
          onClose={() => setIsGenerateLeadOpen(false)}
        />
      )}
    </>
  );
};
