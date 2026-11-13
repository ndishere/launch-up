import React, { useState } from 'react';
import { 
  Users, FolderKanban, Rocket, DollarSign, Activity, Plus, 
  ArrowUpRight, CheckCircle2, Eye, ChevronRight,
  Sparkles, ExternalLink, ShieldCheck, Check, Clock, Phone, Mail,
  MessageSquare, FileText, ArrowRight, Play, XCircle, AlertTriangle,
  Server
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { ThreeZoneScreenLayout } from '../layout/ThreeZoneScreenLayout';
import { ExpandableDetailToggleButton } from '../common/ExpandableRightDetailPanel';
import { HealthPulseModal } from '../modals/HealthPulseModal';
import { MICROSERVICE_CATALOG } from '../../services/api';

interface DashboardSelectedItem {
  type: 'follow-up' | 'approval' | 'client' | 'service-health';
  id: string;
  title: string;
  subtitle: string;
  status: 'good' | 'warn' | 'bad' | 'live' | 'neutral';
  statusLabel: string;
  clientName?: string;
  domain?: string;
  contact?: string;
  previewUrl?: string;
  details: string;
  actionType: 'approve-gate' | 'open-preview' | 'send-message' | 'open-workspace' | 'check-services';
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
  } = useApp();

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
      actionDesc: 'Requirements document signed by co-owner. Ready for Project Plan Sign-Off (Gate 2) to trigger coding swarm.',
      badge: 'Plan Sign-Off',
      badgeTone: 'warn' as const,
    },
    {
      id: 'fu-3',
      clientName: 'Urban Fit Studio',
      domain: 'urbanfit.club',
      contact: '+91 91234 56789 (WhatsApp)',
      previewUrl: 'http://localhost:3000/#preview-urbanfit',
      actionTitle: 'Lead pitch viewed',
      actionDesc: 'Canva pitch deck viewed. AI Pitch Agent scheduled automated 24h follow-up WhatsApp message.',
      badge: 'Pitch Sent',
      badgeTone: 'live' as const,
    },
  ];

  // Approvals Inbox (Human-in-the-loop Governance Gates)
  const approvalItems = [
    {
      id: 'gate-prd-smiledental',
      title: 'Project Plan Sign-Off (Gate 2)',
      project: 'Smile Dental Clinic App',
      law: 'DPDP_INDIA & PostgreSQL RLS',
      status: 'Awaiting Decision',
      summary: 'BA Agent synthesized multi-tenant schema with 100% Row-Level Security and patient record encryption.',
    },
    {
      id: 'gate-deploy-freshbite',
      title: 'Go-Live Approval (Gate 3)',
      project: 'Fresh Bite Food Ordering Engine',
      law: 'GDPR_EU & SSL Certificate Verified',
      status: 'Awaiting Decision',
      summary: 'Docker multi-stage build passed QA/SecOps. Zero high CVEs in Trivy audit and Lighthouse score is 98.',
    },
    {
      id: 'gate-sre-apex',
      title: 'Quick Fix Approval (Gate 5)',
      project: 'Apex Logistics Tracking System',
      law: 'Auto-Fix Care (MOD-09)',
      status: 'Awaiting Decision',
      summary: 'Auto-detected 500 error in tracking webhook. Synthetic fix verified against Graphify AST call graph.',
    },
  ];

  const [approvedGateIds, setApprovedGateIds] = useState<Set<string>>(new Set());
  const [requestedChangesIds, setRequestedChangesIds] = useState<Set<string>>(new Set());
  const [revisionFeedback, setRevisionFeedback] = useState<string>('');

  // Selected Item for Right Detail Panel
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
    setApprovedGateIds((prev) => new Set(prev).add(gateId));
    setRequestedChangesIds((prev) => {
      const next = new Set(prev);
      next.delete(gateId);
      return next;
    });
  };

  const handleRequestChanges = (gateId: string) => {
    setRequestedChangesIds((prev) => new Set(prev).add(gateId));
    setApprovedGateIds((prev) => {
      const next = new Set(prev);
      next.delete(gateId);
      return next;
    });
  };

  return (
    <>
      <ThreeZoneScreenLayout
        title="Agency Command Center"
        subtitle="1-Person Software Agency Operating System. Autonomous specialist agents executing discovery, builds, and delivery."
        badge="Autonomous Engine"
        isSidePanelOpen={isSidePanelOpen}
        onToggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)}
        sidePanelTitle={selectedItem.subtitle || 'Details & Actions'}
        sidePanelSubtitle={selectedItem.title}
        headerActions={
          <>
            <button
              onClick={() => {
                setSelectedItem({
                  type: 'service-health',
                  id: 'health-pulse',
                  title: 'Microservices & Self-Healing Health',
                  subtitle: 'System Health Pulse',
                  status: pulseStatusTone,
                  statusLabel: `${healthyMeshCount}/10 Services Live`,
                  details: 'Live telemetry and auto-healing heartbeat for all 10 core Launch Up microservices.',
                  actionType: 'check-services',
                });
                setIsSidePanelOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mesh Health ({healthyMeshCount}/10)</span>
            </button>

            <button
              id="dashboard-add-client-btn"
              onClick={() => setIsAddClientModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Client</span>
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
              onClick={() => {
                setSelectedItem({
                  type: 'service-health',
                  id: 'health-pulse',
                  title: 'Microservices & Self-Healing Health',
                  subtitle: 'System Health Pulse',
                  status: pulseStatusTone,
                  statusLabel: `${healthyMeshCount}/10 Services Live`,
                  details: 'Live status and self-healing telemetry for all 10 core Launch Up microservices.',
                  actionType: 'check-services',
                });
                setIsSidePanelOpen(true);
              }}
            />
          </SummaryMetricGrid>
        }
        sidePanelContent={
          <div className="space-y-4">
            {/* Status Pill & Title */}
            <div className="flex items-center justify-between gap-2">
              <span
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${
                  selectedItem.status === 'good'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : selectedItem.status === 'warn'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : selectedItem.status === 'bad'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                }`}
              >
                {selectedItem.statusLabel}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Instant Action</span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {selectedItem.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {selectedItem.details}
              </p>
            </div>

            {/* Special Inspector View: Microservice & Health Pulse */}
            {selectedItem.type === 'service-health' && (
              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Total Mesh Score</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{systemHealthPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Live Fastify Endpoints</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{healthyMeshCount} of 10</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">10 Core Microservices</span>
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {Object.values(MICROSERVICE_CATALOG).map((svc) => {
                      const isLive = Boolean(meshStatuses[svc.id]);
                      return (
                        <div
                          key={svc.id}
                          className="p-2 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 text-[11px]"
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isLive ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50' : 'bg-slate-400 dark:bg-slate-600'
                              }`}
                            />
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{svc.name}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 shrink-0">:{svc.port}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsHealthPulseOpen(true)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Open Full Mesh Diagnostics</span>
                </button>
              </div>
            )}

            {/* Special Inspector View: Approvals with Feedback Textarea */}
            {selectedItem.type === 'approval' && (
              <div className="space-y-3 pt-1">
                {selectedItem.gateStage && (
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Governance Gate & Standard</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedItem.gateStage}</span>
                  </div>
                )}

                {/* Feedback Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Feedback / Change Request Note
                  </label>
                  <textarea
                    value={revisionFeedback}
                    onChange={(e) => setRevisionFeedback(e.target.value)}
                    placeholder="Enter any required adjustments, edge cases, or compliance instructions..."
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 resize-none h-16"
                  />
                </div>

                {requestedChangesIds.has(selectedItem.id) && (
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Changes requested! Autonomous agent notified for revision.</span>
                  </div>
                )}

                {approvedGateIds.has(selectedItem.id) && (
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Gate signed off! Autonomous swarm authorized to proceed.</span>
                  </div>
                )}

                {/* 1-Click Approve and Request Changes Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApproveGate(selectedItem.id)}
                    disabled={approvedGateIds.has(selectedItem.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all ${
                      approvedGateIds.has(selectedItem.id)
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{approvedGateIds.has(selectedItem.id) ? 'Approved' : 'Approve'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRequestChanges(selectedItem.id)}
                    className="py-2 px-3 rounded-xl text-xs font-semibold border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Request Changes</span>
                  </button>
                </div>
              </div>
            )}

            {/* Client / Target Details */}
            {selectedItem.clientName && (
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Client</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedItem.clientName}</span>
                </div>
                {selectedItem.domain && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Domain</span>
                    <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{selectedItem.domain}</span>
                  </div>
                )}
                {selectedItem.contact && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Channel</span>
                    <span className="text-slate-700 dark:text-slate-300">{selectedItem.contact}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {selectedItem.actionType === 'send-message' && (
                <>
                  <button
                    onClick={() => setCurrentTab('clients')}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send WhatsApp Closing Note</span>
                  </button>

                  {selectedItem.previewUrl && (
                    <a
                      href={selectedItem.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Open Customer Live Preview</span>
                    </a>
                  )}
                </>
              )}

              {selectedItem.actionType === 'open-workspace' && (
                <>
                  <button
                    onClick={() => {
                      if (projects.length > 0) {
                        openProjectWorkspace(projects[0].id);
                      } else {
                        setCurrentTab('projects');
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Open Autonomous Workspace</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('preview-studio')}
                    className="w-full py-2 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Preview Multi-Viewport (375px–1920px)</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentTab('clients')}
                className="w-full text-center text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline py-1 cursor-pointer"
              >
                View all client records →
              </button>
            </div>
          </div>
        }
      >
        {/* Section 2: Main Content Area (Column 1) */}
        
        {/* Card 1: Today's Follow-Ups */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Today&apos;s Follow-Ups</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {followUps.length} actions
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                High-intent leads and clients awaiting communication or review.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('clients')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
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
                      ? 'ring-2 ring-indigo-500/80 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{fu.clientName}</span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">({fu.domain})</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                          fu.badgeTone === 'good'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : fu.badgeTone === 'warn'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                        }`}
                      >
                        {fu.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                      {fu.actionTitle}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {fu.actionDesc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:underline">
                      <span>Take Action</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Funnel This Week */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Funnel This Week</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Conversion progress across the 1-Person autonomous pipeline.
              </p>
            </div>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              33.3% Close Rate
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { stage: '1. Found Leads', count: 24, percent: 100, barColor: 'bg-indigo-500' },
              { stage: '2. Prototypes Ready', count: 18, percent: 75, barColor: 'bg-sky-500' },
              { stage: '3. Pitched Outreach', count: 12, percent: 50, barColor: 'bg-amber-500' },
              { stage: '4. Won Retainers', count: 8, percent: 33, barColor: 'bg-emerald-500' },
            ].map((step) => (
              <div
                key={step.stage}
                className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800"
              >
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  {step.stage}
                </span>
                <div className="flex items-baseline justify-between mt-1.5">
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {step.count}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
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
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Approvals Inbox</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {approvalItems.length - approvedGateIds.size} pending
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Business Approvals & Gatekeepers (Access & Approvals · MOD-10) guarding quality & security before production.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('team')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
            >
              All Approvals & Teams
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
                      ? 'ring-2 ring-indigo-500/80 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{gate.title}</span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">{gate.law}</span>
                      {isApproved && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Approved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                      Project: {gate.project}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
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
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Active Client Retainers</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Current onboarded businesses and live software deployments.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('clients')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
            >
              Open Clients View →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="pb-2.5">Business</th>
                  <th className="pb-2.5">Domain</th>
                  <th className="pb-2.5">Tier</th>
                  <th className="pb-2.5">Retainer</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                    className={`transition-colors cursor-pointer group ${
                      selectedItem.id === client.id
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {client.name}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {client.domain}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">{client.tier}</span>
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      ${client.monthlySubscription}/mo
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs group-hover:underline">
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
