import React, { useState } from 'react';
import { 
  Plus, Search, Mail, ExternalLink, 
  FolderKanban, Eye, Sparkles, Phone, MessageSquare,
  Globe, Check, LayoutGrid, Table as TableIcon, ArrowRight,
  Filter, Building2, MapPin
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
    setIsAddClientModalOpen, 
    setSelectedClient,
    setCurrentTab,
    openProjectWorkspace,
    uiThemeStyle,
  } = useApp();

  const isPrototype = uiThemeStyle === 'prototype';
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
    joinedDate: '2024-05-15',
    notes: 'Google Maps lead converted into mobile ordering prototype.',
  });

  const totalMRR = clients.reduce((acc, c) => acc + (c.monthlySubscription || 0), 0);
  const activeClients = clients.filter((c) => c.status === 'Active').length;
  const avgRetainer = clients.length > 0 ? Math.round(totalMRR / clients.length) : 1800;

  // Source categorization for plain-English filters
  const sources = ['All', 'Google Maps', 'WhatsApp', 'Email', 'Instagram DM'];

  // Map clients to sample pipeline stages if not explicitly staged
  const getClientStage = (client: Client): 'Prototype ready' | 'Pitched' | 'Sales follow-up' | 'Won' => {
    if (client.status === 'Active') return 'Won';
    if (client.status === 'Pending') return 'Sales follow-up';
    if (client.tier === 'Enterprise B2B') return 'Prototype ready';
    return 'Pitched';
  };

  const getClientSource = (client: Client): string => {
    if (client.notes?.includes('Maps') || client.domain.includes('fresh') || client.domain.includes('cafe')) return 'Google Maps';
    if (client.notes?.includes('WhatsApp') || client.phone) return 'WhatsApp';
    if (client.domain.includes('tech') || client.email) return 'Email';
    return 'Instagram DM';
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const clientSource = getClientSource(client);
    const matchesSource = sourceFilter === 'All' || clientSource === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const kanbanColumns: Array<{ id: 'Prototype ready' | 'Pitched' | 'Sales follow-up' | 'Won'; label: string; chipClass: string }> = [
    { id: 'Prototype ready', label: 'Prototype Ready', chipClass: 'chip b' },
    { id: 'Pitched', label: 'Pitched Outreach', chipClass: 'chip a' },
    { id: 'Sales follow-up', label: 'Sales Follow-Up', chipClass: 'chip a' },
    { id: 'Won', label: 'Won Retainer', chipClass: 'chip g' },
  ];

  return (
    <>
      <ThreeZoneScreenLayout
        title="Clients & Requirement Ingestion"
        subtitle="1-Person Autonomous Software Factory: Discover, synthesize PRDs, pitch interactive prototypes, and manage business retainers."
        badge="Autonomous Pipeline"
        isSidePanelOpen={isSidePanelOpen}
        onToggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)}
        sidePanelTitle={activeClient ? activeClient.name : 'Client Details'}
        sidePanelSubtitle={activeClient ? activeClient.domain : 'Select a client'}
        headerActions={
          <>
            <button
              id="generate-lead-btn"
              type="button"
              onClick={() => setIsGenerateLeadOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isPrototype
                  ? 'bg-[var(--surf)] border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surf2)]'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Generate Lead (Scan)</span>
            </button>

            <button
              id="add-client-btn"
              type="button"
              onClick={() => setIsAddClientModalOpen(true)}
              className="btn pri btn-pri px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:brightness-110"
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
                <span className={activeClient.status === 'Active' ? 'chip g' : 'chip a'}>
                  {getClientStage(activeClient)}
                </span>
                <span className="text-[11px] text-[var(--mut)]">
                  Source: {getClientSource(activeClient)}
                </span>
              </div>

              {/* Business Name & Domain */}
              <div>
                <h4 className="text-base font-bold text-[var(--ink)] leading-tight">
                  {activeClient.name}
                </h4>
                <a
                  href={`https://${activeClient.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-[var(--acc)] hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <span>{activeClient.domain}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Financial & Contract Spec */}
              <div
                className={`p-3.5 rounded-xl border space-y-2.5 text-xs ${
                  isPrototype
                    ? 'bg-[var(--surf2)] border-[var(--line)]'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[var(--mut)]">Retainer Value</span>
                  <span className="font-bold text-[var(--ink)] tabular-nums">
                    ${activeClient.monthlySubscription}/month
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--mut)]">Contract Tier</span>
                  <span className="chip b text-[10px]">{activeClient.tier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--mut)]">Joined Date</span>
                  <span className="text-[var(--ink2)]">{activeClient.joinedDate || 'Recently'}</span>
                </div>
                {activeClient.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--mut)]">Email</span>
                    <span className="text-[var(--ink2)] truncate max-w-[170px]">{activeClient.email}</span>
                  </div>
                )}
                {activeClient.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--mut)]">Phone</span>
                    <span className="text-[var(--ink2)]">{activeClient.phone}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {activeClient.notes && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[var(--mut)] uppercase tracking-wider">
                    Discovery Notes
                  </span>
                  <p className="text-xs text-[var(--ink2)] bg-[var(--surf)] p-2.5 rounded-xl border border-[var(--line)]">
                    {activeClient.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setCurrentTab('preview-studio')}
                  className="w-full btn pri btn-pri py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer hover:brightness-110"
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
                  className={`w-full py-2 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isPrototype
                      ? 'border-[var(--line)] bg-[var(--surf)] hover:bg-[var(--surf2)] text-[var(--ink)]'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
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
                  className="w-full text-center text-xs text-[var(--acc)] font-medium hover:underline py-1 cursor-pointer"
                >
                  Send personalized pitch message →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[var(--mut)] text-xs">
              Select a client to view full details and pitch actions.
            </div>
          )
        }
      >
        {/* Section 2: Main Content Area (Column 1) */}
        
        {/* Search, Source Filter & View Switcher Bar */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs ${
            isPrototype
              ? 'bg-[var(--surf)] border-[var(--line)]'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by business name, domain, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                isPrototype
                  ? 'bg-[var(--surf2)] border-[var(--line)] text-[var(--ink)] focus:border-[var(--acc)]'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
              }`}
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
                    ? isPrototype
                      ? 'bg-[var(--acc)] text-white shadow-xs'
                      : 'bg-indigo-600 text-white'
                    : isPrototype
                    ? 'text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--surf2)]'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Kanban vs Table */}
          <div
            className={`flex items-center p-0.5 rounded-xl border shrink-0 ${
              isPrototype
                ? 'bg-[var(--surf2)] border-[var(--line)]'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-[var(--ink)] shadow-xs font-bold'
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
                  ? 'bg-white dark:bg-slate-700 text-[var(--ink)] shadow-xs font-bold'
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
                  className={`rounded-2xl border p-3.5 flex flex-col gap-3 min-h-[380px] shadow-xs transition-colors ${
                    isPrototype
                      ? 'bg-[var(--surf)] border-[var(--line)]'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                    <span className="text-xs font-bold text-[var(--ink)]">{col.label}</span>
                    <span className={`${col.chipClass} text-[10px]`}>
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
                              ? isPrototype
                                ? 'border-[var(--acc)] bg-[var(--surf2)] shadow-xs ring-1 ring-[var(--acc)]'
                                : 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                              : isPrototype
                              ? 'border-[var(--line)] bg-[var(--surf2)] hover:border-[var(--acc)] hover:bg-[var(--surf)]'
                              : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-xs text-[var(--ink)] truncate">
                              {client.name}
                            </span>
                            <span className="text-[10px] text-[var(--mut)] shrink-0">
                              {getClientSource(client)}
                            </span>
                          </div>

                          <span className="font-mono text-[11px] text-[var(--acc)] block mt-0.5 truncate">
                            {client.domain}
                          </span>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--line)]">
                            <span className="text-xs font-bold text-[var(--ink)] tabular-nums">
                              ${client.monthlySubscription}/mo
                            </span>
                            <span className="text-[10px] text-[var(--mut)] font-medium">
                              {client.tier}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {columnClients.length === 0 && (
                      <div className="text-center py-8 text-[var(--mut)] text-xs border border-dashed border-[var(--line)] rounded-xl">
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
          <div
            className={`rounded-2xl border p-4 shadow-xs overflow-x-auto transition-colors ${
              isPrototype
                ? 'bg-[var(--surf)] border-[var(--line)]'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--mut)] font-semibold">
                  <th className="pb-3">Business Name</th>
                  <th className="pb-3">Domain</th>
                  <th className="pb-3">Source</th>
                  <th className="pb-3">Stage</th>
                  <th className="pb-3">Contract Value</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
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
                      className={`hover:bg-[var(--surf2)] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[var(--surf2)] font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 font-semibold text-[var(--ink)]">
                        {client.name}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-[var(--acc)]">
                        {client.domain}
                      </td>
                      <td className="py-3 text-[var(--mut)]">
                        {getClientSource(client)}
                      </td>
                      <td className="py-3">
                        <span className={stage === 'Won' ? 'chip g' : 'chip a'}>
                          {stage}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-[var(--ink)] tabular-nums">
                        ${client.monthlySubscription}/mo
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-[var(--acc)] font-semibold hover:underline">
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
