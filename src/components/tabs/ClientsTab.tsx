import React, { useState } from 'react';
import { 
  Plus, Search, Mail, ExternalLink, 
  FolderKanban, Eye, Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { GenerateLeadModal } from '../modals/GenerateLeadModal';

export const ClientsTab: React.FC = () => {
  const { 
    clients, 
    projects, 
    setIsAddClientModalOpen, 
    setSelectedClient,
    requirementIntakes,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isGenerateLeadOpen, setIsGenerateLeadOpen] = useState(false);

  const totalMRR = clients.reduce((acc, c) => acc + c.monthlySubscription, 0);
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const pendingIntakesCount = requirementIntakes.filter(r => r.status !== 'Converted to Project').length;

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'All' || client.tier === tierFilter;
    const matchesStatus = statusFilter === 'All' || client.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Clients & Requirement Ingestion
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-medium bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50 rounded-md inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              1-Person Company Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Discover and pitch leads autonomously via MOD-01 or onboard clients manually and through shareable Google Form intake links.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            id="generate-lead-btn"
            type="button"
            onClick={() => setIsGenerateLeadOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-950 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Lead</span>
          </button>

          <button
            id="add-client-btn"
            type="button"
            onClick={() => setIsAddClientModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Standardized 5-Cell Summary Bar */}
      <SummaryMetricGrid>
        <SummaryMetricCard
          title="Total Clients"
          primaryValue={clients.length}
          subtitle={`${activeClients} Active Contracts`}
          status="good"
        />
        <SummaryMetricCard
          title="Retainer MRR"
          primaryValue={`$${totalMRR.toLocaleString()}/mo`}
          subtitle="Stripe Connect Synced"
          status="good"
        />
        <SummaryMetricCard
          title="Intake Pull Rate"
          primaryValue="100% Success"
          subtitle="0 Webhook Dropped"
          status="live"
        />
        <SummaryMetricCard
          title="Live Error Rate"
          primaryValue="0.00%"
          subtitle="Encryption Vault Healthy"
          status="good"
        />
        <SummaryMetricCard
          title="Pending Intakes"
          primaryValue={pendingIntakesCount}
          subtitle="Awaiting Project Canvas"
          status="warn"
        />
      </SummaryMetricGrid>

      <GenerateLeadModal
        isOpen={isGenerateLeadOpen}
        onClose={() => setIsGenerateLeadOpen(false)}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111318] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, domain, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Tier Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Tier:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All">All Tiers</option>
              <option value="Enterprise B2B">Enterprise B2B</option>
              <option value="Growth B2B">Growth B2B</option>
              <option value="Startup B2C">Startup B2C</option>
              <option value="Agency">Agency</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => {
          // Find projects linked via Many-to-Many
          const linkedProjects = projects.filter((p) => client.projectIds.includes(p.id) || p.clientIds.includes(client.id));

          return (
            <div
              key={client.id}
              className="bg-white dark:bg-[#111318] rounded-xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top Row: Avatar + Tier + Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold text-base flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                      {client.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {client.name}
                      </h3>
                      <a
                        href={`https://${client.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-indigo-500 inline-flex items-center gap-1 mt-0.5"
                      >
                        <span>{client.domain}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      client.status === 'Active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                        : client.status === 'Onboarding'
                        ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60'
                        : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>

                {/* Badge for Tier */}
                <div className="mb-4">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                    {client.tier}
                  </span>
                </div>

                {/* Primary Contact details */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800/80 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-slate-200">Contact:</span>
                    <span>{client.primaryContact.name} ({client.primaryContact.role})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                </div>

                {/* Many-to-Many Linked Projects */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                      Linked Projects ({linkedProjects.length})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {linkedProjects.map((p) => (
                      <span
                        key={p.id}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 font-medium"
                      >
                        {p.name}
                      </span>
                    ))}
                    {linkedProjects.length === 0 && (
                      <span className="text-[11px] text-slate-400 italic">No projects assigned yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">MRR Retainer</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ${client.monthlySubscription.toLocaleString()}/mo
                  </span>
                </div>

                <button
                  onClick={() => setSelectedClient(client)}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect & Manage</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
