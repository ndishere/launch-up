import React, { useState } from 'react';
import { 
  Users, FolderKanban, Rocket, DollarSign, Activity, Plus, 
  ArrowUpRight, CheckCircle2, Eye, ChevronRight,
  Sparkles, ExternalLink, ShieldCheck, Check, Clock, Phone, Mail,
  MessageSquare, FileText, ArrowRight, Play
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { ThreeZoneScreenLayout } from '../layout/ThreeZoneScreenLayout';
import { HealthPulseModal } from '../modals/HealthPulseModal';

interface DashboardSelectedItem {
  type: 'follow-up' | 'approval' | 'client';
  id: string;
  title: string;
  subtitle: string;
  status: 'good' | 'warn' | 'live';
  statusLabel: string;
  clientName?: string;
  domain?: string;
  contact?: string;
  previewUrl?: string;
  details: string;
  actionType: 'approve-gate' | 'open-preview' | 'send-message' | 'open-workspace';
  gateStage?: string;
}

export const DashboardTab: React.FC = () => {
  const { 
    clients, 
    projects, 
    setCurrentTab, 
    setIsAddClientModalOpen,
    openProjectWorkspace,
    setSelectedClient,
    meshStatuses,
    systemHealthPercent,
    uiThemeStyle,
  } = useApp();

  const isPrototype = uiThemeStyle === 'prototype';
  const [isHealthPulseOpen, setIsHealthPulseOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  // Metrics
  const activeClientsCount = clients.filter((c) => c.status === 'Active').length;
  const clientRetentionPct = clients.length > 0 ? Math.round((activeClientsCount / clients.length) * 100) : 100;
  const liveProjectsCount = projects.filter((p) => p.status === 'Live').length;
  const inProgressProjectsCount = projects.filter((p) => p.status === 'In Progress').length;
  const totalMRR = clients.reduce((acc, c) => acc + (c.monthlySubscription || 0), 0);
  const healthyMeshCount = Object.values(meshStatuses).filter(Boolean).length;
  const pulseStatusTone = systemHealthPercent >= 80 ? 'good' : systemHealthPercent > 0 ? 'warn' : 'bad';

  // Today's Follow-Ups
  const followUps = [
    {
      id: 'fu-1',
      clientName: 'Fresh Bite Café',
      domain: 'freshbite.cafe',
      contact: '+91 98765 43210 (WhatsApp)',
      previewUrl: 'http://localhost:3000/#preview-freshbite',
      actionTitle: 'Opened preview link 2h ago',
      actionDesc: 'Customer spent 4 minutes reviewing the 375px mobile viewport. Send personalized closing message.',
      badge: 'High Intent',
      badgeTone: 'good' as const,
    },
    {
      id: 'fu-2',
      clientName: 'Smile Dental Clinic',
      domain: 'smiledental.example',
      contact: 'dr.sharma@smiledental.example',
      previewUrl: 'http://localhost:3000/#preview-smiledental',
      actionTitle: 'PRD synthesized & DPDP verified',
      actionDesc: 'Requirements document signed by co-owner. Ready for Gate 2 final approval to trigger coding swarm.',
      badge: 'Gate 2 Sign-off',
      badgeTone: 'warn' as const,
    },
    {
      id: 'fu-3',
      clientName: 'Apex Logistics',
      domain: 'apexroute.example',
      contact: 'ops@apexroute.example',
      previewUrl: 'http://localhost:3000/#preview-apex',
      actionTitle: 'Auto-healing SRE hotfix generated',
      actionDesc: 'Incident SENTRY_5XX resolved on isolated branch feature/dev. Gate 5 PR awaits review.',
      badge: 'Hotfix PR',
      badgeTone: 'live' as const,
    },
    {
      id: 'fu-4',
      clientName: 'Urban Fit Studio',
      domain: 'urbanfit.example',
      contact: '+1 415 555 0199',
      previewUrl: 'http://localhost:3000/#preview-urbanfit',
      actionTitle: 'Prototype ready across viewports',
      actionDesc: 'Tailwind landing page built with 88% reusable code tokens. Share demo link with owner.',
      badge: 'Ready for Review',
      badgeTone: 'good' as const,
    },
  ];

  // Approvals Inbox (Governance Gates)
  const [approvedGateIds, setApprovedGateIds] = useState<Set<string>>(new Set());
  const approvalItems = [
    {
      id: 'gate-prd-1',
      title: 'Gate 2: Synthesized PRD & DDL',
      project: 'Smile Dental Clinic Portal',
      law: 'DPDP_INDIA & GDPR_EU',
      author: 'CEO Agent & Tech Architect',
      summary: 'Verified RLS enabled on 100% of tables, zero unmapped OpenAPI endpoints.',
    },
    {
      id: 'gate-deploy-1',
      title: 'Gate 3: Production Deploy Approval',
      project: 'Acme SaaS Web App',
      law: 'CCPA_US Compliant',
      author: 'QA & SecOps Agent',
      summary: 'Docker-compose container built, 0 vulnerability CVEs, 100% test pass rate.',
    },
    {
      id: 'gate-hotfix-1',
      title: 'Gate 5: Autonomous SRE Hotfix Merge',
      project: 'Express Delivery Rates API',
      law: 'Self-Healing Engine (MOD-09)',
      author: 'Autonomous SRE Agent',
      summary: 'Healed TypeError on rates calculator. Verified 0 regression on 90 concurrent requests.',
    },
  ];

  // Active Selected Item in Column 2 (Dynamic Info Panel)
  const [selectedItem, setSelectedItem] = useState<DashboardSelectedItem>({
    type: 'follow-up',
    id: followUps[0].id,
    title: followUps[0].actionTitle,
    subtitle: followUps[0].clientName,
    status: followUps[0].badgeTone,
    statusLabel: followUps[0].badge,
    clientName: followUps[0].clientName,
    domain: followUps[0].domain,
    contact: followUps[0].contact,
    previewUrl: followUps[0].previewUrl,
    details: followUps[0].actionDesc,
    actionType: 'send-message',
  });

  const handleApproveGate = (gateId: string) => {
    setApprovedGateIds((prev) => new Set([...prev, gateId]));
  };

  return (
    <>
      <ThreeZoneScreenLayout
        title="Agency Command Center"
        subtitle="Autonomous 1-Person Software Factory: Real-time client pipelines, follow-ups, and approval inbox."
        badge="Phase 1 Prototype"
        isSidePanelOpen={isSidePanelOpen}
        onToggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)}
        sidePanelTitle={selectedItem.subtitle || 'Details & Actions'}
        sidePanelSubtitle={selectedItem.title}
        headerActions={
          <>
            <button
              onClick={() => setIsHealthPulseOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isPrototype
                  ? 'bg-[var(--surf)] border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surf2)]'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mesh Health ({healthyMeshCount}/10)</span>
            </button>

            <button
              id="dashboard-add-client-btn"
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
              primaryValue={activeClientsCount}
              subtitle={`${clientRetentionPct}% Retention`}
              status="good"
            />
            <SummaryMetricCard
              title="Live Software"
              primaryValue={liveProjectsCount}
              subtitle={`${inProgressProjectsCount} In Build Swarm`}
              status="live"
            />
            <SummaryMetricCard
              title="Monthly Revenue"
              primaryValue={`$${totalMRR.toLocaleString()}/mo`}
              subtitle="Gross Retainers"
              status="good"
            />
            <SummaryMetricCard
              title="Actions Pending"
              primaryValue={followUps.length + (approvalItems.length - approvedGateIds.size)}
              subtitle="Follow-ups & Gates"
              status="warn"
            />
            <SummaryMetricCard
              title="Agency Health"
              primaryValue={`${systemHealthPercent}%`}
              subtitle={`${healthyMeshCount}/10 Services Live`}
              status={pulseStatusTone}
              onClick={() => setIsHealthPulseOpen(true)}
            />
          </SummaryMetricGrid>
        }
        sidePanelContent={
          <div className="space-y-4">
            {/* Status Pill & Title */}
            <div className="flex items-center justify-between gap-2">
              <span
                className={
                  selectedItem.status === 'good'
                    ? 'chip g'
                    : selectedItem.status === 'warn'
                    ? 'chip a'
                    : 'chip b'
                }
              >
                {selectedItem.statusLabel}
              </span>
              <span className="text-[11px] text-[var(--mut)]">Instant Action</span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[var(--ink)] leading-snug">
                {selectedItem.title}
              </h4>
              <p className="text-xs text-[var(--mut)] mt-1.5 leading-relaxed">
                {selectedItem.details}
              </p>
            </div>

            {/* Client / Target Details */}
            {selectedItem.clientName && (
              <div
                className={`p-3 rounded-xl border space-y-2 text-xs ${
                  isPrototype
                    ? 'bg-[var(--surf2)] border-[var(--line)]'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[var(--mut)]">Client</span>
                  <span className="font-semibold text-[var(--ink)]">{selectedItem.clientName}</span>
                </div>
                {selectedItem.domain && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--mut)]">Domain</span>
                    <span className="font-mono text-[11px] text-[var(--acc)]">{selectedItem.domain}</span>
                  </div>
                )}
                {selectedItem.contact && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--mut)]">Contact</span>
                    <span className="text-[var(--ink2)]">{selectedItem.contact}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {selectedItem.type === 'approval' ? (
                <button
                  onClick={() => handleApproveGate(selectedItem.id)}
                  disabled={approvedGateIds.has(selectedItem.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all ${
                    approvedGateIds.has(selectedItem.id)
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'btn pri btn-pri hover:brightness-110 cursor-pointer'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {approvedGateIds.has(selectedItem.id)
                      ? 'Gate Approved Successfully'
                      : 'Approve Gate & Advance Swarm'}
                  </span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (projects.length > 0) {
                        openProjectWorkspace(projects[0].id);
                      } else {
                        setCurrentTab('projects');
                      }
                    }}
                    className="w-full btn pri btn-pri py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer hover:brightness-110"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Open Autonomous Workspace</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('preview-studio')}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isPrototype
                        ? 'border-[var(--line)] bg-[var(--surf)] hover:bg-[var(--surf2)] text-[var(--ink)]'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Preview Multi-Viewport (375px–1920px)</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentTab('clients')}
                className="w-full text-center text-xs text-[var(--acc)] font-medium hover:underline py-1 cursor-pointer"
              >
                View all client records →
              </button>
            </div>
          </div>
        }
      >
        {/* Section 2: Main Content Area (Column 1) */}
        
        {/* Card 1: Today's Follow-Ups */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-colors ${
            isPrototype
              ? 'bg-[var(--surf)] border-[var(--line)]'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                <span>Today&apos;s Follow-Ups</span>
                <span className="chip a text-[10px]">{followUps.length} actions</span>
              </h2>
              <p className="text-xs text-[var(--mut)] mt-0.5">
                High-intent leads and clients awaiting communication or review.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('clients')}
              className="text-xs text-[var(--acc)] font-semibold hover:underline cursor-pointer"
            >
              View pipeline
            </button>
          </div>

          <div className="space-y-2.5">
            {followUps.map((fu) => {
              const isSelected = selectedItem.id === fu.id;
              return (
                <div
                  key={fu.id}
                  onClick={() =>
                    setSelectedItem({
                      type: 'follow-up',
                      id: fu.id,
                      title: fu.actionTitle,
                      subtitle: fu.clientName,
                      status: fu.badgeTone,
                      statusLabel: fu.badge,
                      clientName: fu.clientName,
                      domain: fu.domain,
                      contact: fu.contact,
                      previewUrl: fu.previewUrl,
                      details: fu.actionDesc,
                      actionType: 'send-message',
                    })
                  }
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? isPrototype
                        ? 'border-[var(--acc)] bg-[var(--surf2)] shadow-xs ring-1 ring-[var(--acc)]'
                        : 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : isPrototype
                      ? 'border-[var(--line)] bg-[var(--surf)] hover:bg-[var(--surf2)] hover:border-[var(--acc)]'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-[var(--ink)]">{fu.clientName}</span>
                      <span className="font-mono text-[11px] text-[var(--mut)]">({fu.domain})</span>
                      <span
                        className={
                          fu.badgeTone === 'good'
                            ? 'chip g text-[10px]'
                            : fu.badgeTone === 'warn'
                            ? 'chip a text-[10px]'
                            : 'chip b text-[10px]'
                        }
                      >
                        {fu.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--ink2)] font-medium mt-1">
                      {fu.actionTitle}
                    </p>
                    <p className="text-[11px] text-[var(--mut)] mt-0.5 line-clamp-1">
                      {fu.actionDesc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[var(--acc)] font-semibold flex items-center gap-1 group-hover:underline">
                      <span>Take Action</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Funnel This Week (Found -> Prototype -> Pitched -> Won) */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-colors ${
            isPrototype
              ? 'bg-[var(--surf)] border-[var(--line)]'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)]">Funnel This Week</h2>
              <p className="text-xs text-[var(--mut)] mt-0.5">
                Conversion progress across the 1-Person autonomous pipeline.
              </p>
            </div>
            <span className="chip g text-xs font-bold">33.3% Close Rate</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { stage: '1. Found Leads', count: 24, percent: 100, barColor: 'bg-indigo-500' },
              { stage: '2. Prototypes Ready', count: 18, percent: 75, barColor: 'bg-sky-500' },
              { stage: '3. Pitched Outreach', count: 12, percent: 50, barColor: 'bg-amber-500' },
              { stage: '4. Won Retainers', count: 8, percent: 33, barColor: 'bg-emerald-500' },
            ].map((step, idx) => (
              <div
                key={step.stage}
                className={`p-3.5 rounded-xl border ${
                  isPrototype
                    ? 'bg-[var(--surf2)] border-[var(--line)]'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <span className="text-[11px] font-medium text-[var(--mut)] block">
                  {step.stage}
                </span>
                <div className="flex items-baseline justify-between mt-1.5">
                  <span className="text-xl font-bold text-[var(--ink)] tabular-nums">
                    {step.count}
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--mut)]">
                    {step.percent}%
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${step.barColor}`}
                    style={{ width: `${step.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Approvals Inbox (Governance Gates) */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-colors ${
            isPrototype
              ? 'bg-[var(--surf)] border-[var(--line)]'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                <span>Approvals Inbox</span>
                <span className="chip b text-[10px]">
                  {approvalItems.length - approvedGateIds.size} pending
                </span>
              </h2>
              <p className="text-xs text-[var(--mut)] mt-0.5">
                Human-in-the-loop Governance Gates (MOD-10) guarding quality & security before production.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('team')}
              className="text-xs text-[var(--acc)] font-semibold hover:underline cursor-pointer"
            >
              All Gates & RBAC
            </button>
          </div>

          <div className="space-y-3">
            {approvalItems.map((gate) => {
              const isApproved = approvedGateIds.has(gate.id);
              const isSelected = selectedItem.id === gate.id;

              return (
                <div
                  key={gate.id}
                  onClick={() =>
                    setSelectedItem({
                      type: 'approval',
                      id: gate.id,
                      title: gate.title,
                      subtitle: gate.project,
                      status: isApproved ? 'good' : 'warn',
                      statusLabel: isApproved ? 'Approved' : 'Awaiting Decision',
                      details: gate.summary,
                      actionType: 'approve-gate',
                      gateStage: gate.law,
                    })
                  }
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? isPrototype
                        ? 'border-[var(--acc)] bg-[var(--surf2)] shadow-xs ring-1 ring-[var(--acc)]'
                        : 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : isPrototype
                      ? 'border-[var(--line)] bg-[var(--surf)] hover:bg-[var(--surf2)]'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-[var(--ink)]">{gate.title}</span>
                      <span className="chip b text-[10px]">{gate.law}</span>
                      {isApproved && <span className="chip g text-[10px]">Approved</span>}
                    </div>
                    <p className="text-xs text-[var(--ink2)] font-medium mt-1">
                      Project: {gate.project}
                    </p>
                    <p className="text-[11px] text-[var(--mut)] mt-0.5">
                      {gate.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isApproved ? (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        <span>Approved</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveGate(gate.id);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 4: Recent Active Clients Quick View */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-colors ${
            isPrototype
              ? 'bg-[var(--surf)] border-[var(--line)]'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)]">Active Client Retainers</h2>
              <p className="text-xs text-[var(--mut)] mt-0.5">
                Current onboarded businesses and live software deployments.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('clients')}
              className="text-xs text-[var(--acc)] font-semibold hover:underline cursor-pointer"
            >
              Open Clients View →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--mut)] font-semibold">
                  <th className="pb-2.5">Business</th>
                  <th className="pb-2.5">Domain</th>
                  <th className="pb-2.5">Tier</th>
                  <th className="pb-2.5">Retainer</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {clients.slice(0, 5).map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                      setSelectedItem({
                        type: 'client',
                        id: client.id,
                        title: `Client Profile: ${client.name}`,
                        subtitle: client.name,
                        status: client.status === 'Active' ? 'good' : 'warn',
                        statusLabel: client.status,
                        clientName: client.name,
                        domain: client.domain,
                        contact: client.email,
                        details: `Subscribed on ${client.tier} tier for $${client.monthlySubscription}/mo. Linked to ${projects.filter(p => p.clientIds?.includes(client.id)).length} projects.`,
                        actionType: 'open-workspace',
                      });
                    }}
                    className="hover:bg-[var(--surf2)] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 font-semibold text-[var(--ink)]">
                      {client.name}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-[var(--mut)]">
                      {client.domain}
                    </td>
                    <td className="py-3">
                      <span className="chip b text-[10px]">{client.tier}</span>
                    </td>
                    <td className="py-3 font-bold text-[var(--ink)] tabular-nums">
                      ${client.monthlySubscription}/mo
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-[var(--acc)] font-semibold text-xs group-hover:underline">
                        Details →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ThreeZoneScreenLayout>

      {/* Health Pulse Modal */}
      {isHealthPulseOpen && (
        <HealthPulseModal isOpen={isHealthPulseOpen} onClose={() => setIsHealthPulseOpen(false)} />
      )}
    </>
  );
};
