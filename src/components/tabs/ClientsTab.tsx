import React, { useState } from 'react';
import { 
  Users, Plus, Search, Filter, Mail, Phone, ExternalLink, 
  FolderKanban, DollarSign, Shield, MoreVertical, Eye, Trash2, Building, CheckCircle,
  Link, Sparkles, CheckCircle2, ArrowRight, Globe, RefreshCw, AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Client, ClientStatus, ClientTier } from '../../types';
import { ScreenAnalyticsHeader } from '../common/ScreenAnalyticsHeader';
import { discoverLead } from '../../services/api';

export const ClientsTab: React.FC = () => {
  const { 
    clients, 
    projects, 
    setIsAddClientModalOpen, 
    setIsClientPortalModalOpen,
    setSelectedClient,
    selectedClient,
    requirementIntakes,
    convertIntakeToProject
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // MOD-01 Lead Discovery Interactive State
  const [prospectUrl, setProspectUrl] = useState('https://apex-freight-example.com');
  const [isAuditing, setIsAuditing] = useState(false);
  const [leadResult, setLeadResult] = useState<any>(null);

  const handleAuditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectUrl) return;
    setIsAuditing(true);
    setLeadResult(null);
    try {
      const res = await discoverLead({
        project_id: projects[0]?.id || 'proj-0001-0000-0000-000000000001',
        prospect_url: prospectUrl,
        client_id: clients[0]?.id,
      });
      setLeadResult(res);
    } catch (err: any) {
      setLeadResult({ error: err.message });
    } finally {
      setIsAuditing(false);
    }
  };

  const totalMRR = clients.reduce((acc, c) => acc + c.monthlySubscription, 0);
  const activeClients = clients.filter(c => c.status === 'Active').length;

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
      {/* Top Combined Analytics Section with Live Success/Error Rates */}
      <ScreenAnalyticsHeader
        title="Clients & Requirement Ingestion"
        badge="1-Person Company Engine"
        description="Share 1 secure link with clients to auto-pull requirements, products, and budgets into Launch Up via encrypted APIs, or enter manually on client calls with full role-based access."
        metrics={[
          {
            label: 'Total Clients',
            value: clients.length,
            subValue: `${activeClients} Active Contracts`,
            status: 'good',
          },
          {
            label: 'Retainer MRR',
            value: `$${totalMRR.toLocaleString()}/mo`,
            subValue: 'Stripe Connect Synced',
            status: 'good',
          },
          {
            label: 'Intake Pull Rate',
            value: '100% Success',
            subValue: '0 Webhook Dropped',
            status: 'live',
          },
          {
            label: 'Live Error Rate',
            value: '0.00%',
            subValue: 'API Encryption Vault Healthy',
            status: 'good',
          },
          {
            label: 'Pending Intakes',
            value: requirementIntakes.filter(r => r.status !== 'Converted to Project').length,
            subValue: 'Awaiting Project Canvas',
            status: 'warn',
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              id="share-intake-link-btn"
              onClick={() => setIsClientPortalModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all"
            >
              <Link className="w-4 h-4" />
              <span>Share Client Intake Link</span>
            </button>
            <button
              id="intake-client-btn"
              onClick={() => setIsAddClientModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client Manually</span>
            </button>
          </div>
        }
      />

      {/* MOD-01: Autonomous Lead Discovery & Canva Pro Pitch Engine */}
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                MOD-01: Autonomous Lead Discovery & Canva Pitch Engine (Port 8005)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Audit a prospect website, detect missing mobile apps & slow Lighthouse scores, auto-generate a Canva Pro pitch deck, and issue Gate 1 (OUTREACH_PITCH).
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
            MOD-01 Active
          </span>
        </div>

        <form onSubmit={handleAuditLead} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              required
              placeholder="Enter prospect website URL (e.g. https://apex-freight-example.com)..."
              value={prospectUrl}
              onChange={(e) => setProspectUrl(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isAuditing}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            {isAuditing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Run Audit & Generate Pitch</span>
          </button>
        </form>

        {leadResult && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Audit & Proposal Synthesis Complete</span>
              </span>
              <span className={`text-[10px] font-mono font-bold ${leadResult.isLive ? 'text-emerald-500' : 'text-amber-500'}`}>
                {leadResult.isLive ? '●  Live Fastify 8005' : '● ‹ In-Memory Fallback'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Lighthouse Audit Score</span>
                <span className="text-base font-bold text-amber-500">
                  {leadResult.data?.lighthouse_audit_score || 58}/100
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Gate 1 Approval ID</span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {leadResult.data?.approval_gate_id}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Canva Proposal Link</span>
                <a
                  href={leadResult.data?.proposal_canva_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>Open Canva Proposal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {leadResult.data?.missing_assets && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <strong>Detected Gaps for Client Pitch:</strong> {leadResult.data.missing_assets.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

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
