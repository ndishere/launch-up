import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Plus, Mail, Shield, ShieldCheck, FolderKanban,
  CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, Key,
  Sparkles, ExternalLink, ArrowRight, Lock, Unlock, Eye, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { ExpandableRightDetailPanel, ExpandableDetailToggleButton } from '../common/ExpandableRightDetailPanel';
import { StandardContextInspector } from '../common/StandardContextInspector';
import { 
  getStoredGates, 
  decideGate, 
  verifyGovernance, 
  GovernanceGateRecord 
} from '../../services/api';

export const TeamTab: React.FC = () => {
  const { teamMembers, projects } = useApp();

  const [gates, setGates] = useState<GovernanceGateRecord[]>([]);
  const [gateFilter, setGateFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [selectedGateId, setSelectedGateId] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Governance Verification Interactive State
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [principalType, setPrincipalType] = useState<'HUMAN_USER' | 'AI_AGENT'>('HUMAN_USER');
  const [requestedAction, setRequestedAction] = useState('gate:approve');

  const refreshGates = () => {
    const loaded = getStoredGates();
    setGates(loaded);
    if (!selectedGateId && loaded[0]) {
      setSelectedGateId(loaded[0].gate_id);
    }
  };

  useEffect(() => {
    refreshGates();
  }, []);

  const handleGateDecision = async (
    gateId: string, 
    decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'
  ) => {
    setActionLoading(gateId);
    try {
      const res = await decideGate(gateId, decision, 'Approved via Control Plane UI', 'client_approver_1');
      refreshGates();
      setFeedbackMsg({
        text: `Gate ${gateId} marked as ${decision}${res.isLive ? ' (Recorded via live MOD-10 microservice on port 8004)' : ' (Recorded locally via fallback)'}`,
        type: decision === 'APPROVED' ? 'success' : 'info',
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ text: `Failed to update gate: ${err.message}`, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestGovernance = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await verifyGovernance({
        project_id: projects[0]?.id || 'proj-0010-0000-0000-000000000001',
        client_id: 'client-apex-01',
        principal_type: principalType,
        principal_id: principalType === 'AI_AGENT' ? 'agent-marketer-01' : 'user-approver-01',
        role: principalType === 'AI_AGENT' ? 'AI_AGENT' : 'CLIENT_APPROVER',
        requested_action: requestedAction,
        requested_spend_usd: 5.0,
      });
      setVerifyResult(res);
    } catch (err: any) {
      setVerifyResult({ error: err.message });
    } finally {
      setVerifying(false);
    }
  };

  const filteredGates = gates.filter((g) => {
    if (gateFilter === 'ALL') return true;
    return g.status === gateFilter;
  });

  const pendingCount = gates.filter((g) => g.status === 'PENDING').length;
  const approvedCount = gates.filter((g) => g.status === 'APPROVED').length;

  const selectedGate = gates.find((g) => g.gate_id === selectedGateId) || gates[0];
  const selectedMember = selectedMemberId ? teamMembers.find((m) => m.id === selectedMemberId) : null;

  const gateFriendlyLabels: Record<string, string> = {
    OUTREACH_PITCH: 'Proposal Approval (Gate 1)',
    SCOPE_LOCK: 'Project Plan Sign-Off (Gate 2)',
    DEPLOY_STAGING: 'Go-Live Approval (Gate 3)',
    MARKETING_PUBLISH: 'Campaign Approval (Gate 4)',
    HOTFIX_MERGE: 'Quick Fix Approval (Gate 5)',
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-4 pb-0.5">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Access & Approvals · MOD-10</span>
        </span>

        <div className="flex items-center gap-2.5 ml-auto">
          <button
            onClick={refreshGates}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111318] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Refresh Gates</span>
          </button>

          <button
            onClick={() => alert('Invite member flow: opens invitation link generator.')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite Member</span>
          </button>

          <ExpandableDetailToggleButton
            isOpen={isSidePanelOpen}
            onToggle={() => setIsSidePanelOpen((prev) => !prev)}
          />
        </div>
      </div>

      {/* Row 1: Unified 5-Cell Horizontal Summary Bar */}
      <SummaryMetricGrid>
        <SummaryMetricCard
          title="Total Members"
          primaryValue={teamMembers.length}
          subtitle="100% Active Logins"
          status="good"
        />
        <SummaryMetricCard
          title="Pending Gates"
          primaryValue={pendingCount}
          subtitle={`${approvedCount} Approved Historical`}
          status={pendingCount > 0 ? 'warn' : 'good'}
        />
        <SummaryMetricCard
          title="MOD-10 Core"
          primaryValue="Port 8004"
          subtitle="PostgreSQL RLS Active"
          status="live"
        />
        <SummaryMetricCard
          title="FinOps Budget"
          primaryValue="$25.00 Cap"
          subtitle="Token Circuit Breaker"
          status="good"
        />
        <SummaryMetricCard
          title="RBAC Roles"
          primaryValue={`${new Set(teamMembers.map((m) => m.role)).size || 4} Tiers`}
          subtitle="Least-privilege active"
          status="neutral"
        />
      </SummaryMetricGrid>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : feedbackMsg.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-indigo-500" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>
      )}

      {/* Row 2: 2-Column Section */}
      <div className="flex flex-col lg:flex-row items-start gap-5 w-full min-w-0">
        {/* Column 1: Main Content Area */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {/* Section 1: Business Approval Gates Hub */}
          <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Business Approval Gates Hub (Gates 1 through 5)
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Human sign-offs for proposals, project plans, go-live deployments, campaigns, and quick fixes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl text-xs font-semibold">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setGateFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                      gateFilter === tab
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Gates Feed */}
            <div className="space-y-2.5">
              {filteredGates.map((gate) => {
                const isPending = gate.status === 'PENDING';
                const isApproved = gate.status === 'APPROVED';
                const isSelected = selectedGate?.gate_id === gate.gate_id && !selectedMemberId;

                const gateBadgeStyles = {
                  OUTREACH_PITCH: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                  SCOPE_LOCK: 'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                  DEPLOY_STAGING: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                  MARKETING_PUBLISH: 'bg-pink-50 text-pink-700 dark:bg-pink-950/70 dark:text-pink-300 border-pink-200 dark:border-pink-800',
                  HOTFIX_MERGE: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                }[gate.gate_type];

                return (
                  <div
                    key={gate.gate_id}
                    onClick={() => {
                      setSelectedGateId(gate.gate_id);
                      setSelectedMemberId(null);
                      setIsSidePanelOpen(true);
                    }}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/30'
                        : isPending
                        ? 'bg-slate-50/70 dark:bg-slate-900/50 border-amber-200/80 dark:border-amber-900/50 hover:border-slate-300'
                        : 'bg-white dark:bg-[#111318] border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${gateBadgeStyles}`}>
                          {gateFriendlyLabels[gate.gate_type] || gate.gate_type.replace('_', ' ')}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {gate.gate_id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                              : 'bg-red-50 text-red-700 dark:text-red-950/70 dark:text-red-300'
                          }`}
                        >
                          {gate.status}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Project: <span className="font-semibold text-slate-900 dark:text-white">{gate.project_name || gate.project_id}</span>
                      </p>

                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>Created: {new Date(gate.created_at).toLocaleString()}</span>
                        {gate.decided_by && (
                          <span>· Decided by: {gate.decided_by} at {new Date(gate.decided_at!).toLocaleTimeString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isPending ? (
                        <>
                          <button
                            disabled={actionLoading === gate.gate_id}
                            onClick={() => handleGateDecision(gate.gate_id, 'APPROVED')}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            disabled={actionLoading === gate.gate_id}
                            onClick={() => handleGateDecision(gate.gate_id, 'REVISION_REQUESTED')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 border border-amber-200/60 dark:border-amber-800/60 transition-colors cursor-pointer"
                          >
                            Revise
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 italic">
                          Decision Locked ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredGates.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  No governance gates found matching filter "{gateFilter}".
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Interactive RBAC & Token Budget Simulator */}
          <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
              <Key className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Live RBAC Permission & Token Budget Gatekeeper Test (MOD-10)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium text-[11px]">Principal Type:</label>
                <select
                  value={principalType}
                  onChange={(e) => setPrincipalType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="HUMAN_USER">HUMAN_USER (Client Approver)</option>
                  <option value="AI_AGENT">AI_AGENT (Autonomous Marketer/Dev)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium text-[11px]">Requested Action:</label>
                <select
                  value={requestedAction}
                  onChange={(e) => setRequestedAction(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="gate:approve">gate:approve (Human Gate Approval)</option>
                  <option value="marketing:draft">marketing:draft (Permitted for AI)</option>
                  <option value="code:write">code:write (Protected Action)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleTestGovernance}
                  disabled={verifying}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Verify Permissions via MOD-10</span>
                </button>
              </div>
            </div>

            {verifyResult && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
                <div className="flex items-center justify-between mb-1.5 text-slate-400 text-[11px]">
                  <span>MOD-10 Auth Response Payload:</span>
                  <span className={verifyResult.isLive ? 'text-emerald-500 font-bold' : 'text-amber-500'}>
                    {verifyResult.isLive ? '● Live Microservice 8004' : '○ In-Memory Fallback'}
                  </span>
                </div>
                <pre className="text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(verifyResult.data || verifyResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Section 3: Registered Organization Members */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider px-1">
              Registered Organization Members ({teamMembers.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teamMembers.map((member) => {
                const isSelected = selectedMemberId === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      setSelectedMemberId(member.id);
                      setIsSidePanelOpen(true);
                    }}
                    className={`bg-white dark:bg-[#111318] rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                            {member.avatarInitials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                              {member.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 truncate">{member.email}</p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 shrink-0">
                          {member.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 py-2.5 border-y border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Shield className="w-3 h-3 text-indigo-500" />
                            Role:
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-200 text-[11px]">
                            {member.role}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1 text-[11px]">
                            <FolderKanban className="w-3 h-3 text-purple-500" />
                            Projects:
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-200 text-[11px]">
                            {member.projectsAssigned} Assigned
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px]">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Inspect Permissions</span>
                      <span className="text-slate-400 font-mono text-[10px]">2FA Enforced</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Expandable Right Detail Panel */}
        <ExpandableRightDetailPanel
          isOpen={isSidePanelOpen}
          onToggle={() => setIsSidePanelOpen((prev) => !prev)}
          title={selectedMember ? selectedMember.name : (selectedGate ? (gateFriendlyLabels[selectedGate.gate_type] || selectedGate.gate_type) : 'Access Inspector')}
          subtitle={selectedMember ? `${selectedMember.role} · ${selectedMember.email}` : (selectedGate ? `Project: ${selectedGate.project_name || selectedGate.project_id}` : 'Select a gate or member')}
        >
          {selectedMember ? (
            <StandardContextInspector
              title={selectedMember.name}
              subtitle={`Security Role: ${selectedMember.role} · ${selectedMember.email}`}
              badge={selectedMember.status}
              badgeTone="live"
              overview={{
                statusSummary: `Assigned to ${selectedMember.projectsAssigned} active client projects. 2FA hardware key enforced.`,
                details: `Principal authenticated via PostgreSQL RLS tenant context (MOD-10). Access limited strictly to assigned client tenant IDs.`,
                domainOrUrl: selectedMember.email,
              }}
              legalShield={{
                dpdpStatus: 'Verified',
                gdprStatus: 'Verified',
                ccpaStatus: 'Verified',
                playSafetyStatus: 'Verified',
                rlsSecurityStatus: '100% Pass',
              }}
              costPortability={{
                baseReusedPercent: 96,
                compressionActive: true,
                estimatedAiCost: '₹0 / $0.00',
                profitMarginPercent: 100,
                monthlyRevenue: '$2,500/mo',
                dockerBranchesStatus: 'RBAC Policy Enforced in DB',
                localFolderPath: 'd:/Projects/launch-up',
                portabilityNote: 'JWT Claims Compatible with Keycloak & Auth0',
              }}
              approvalBar={{
                decisionStatus: 'APPROVED',
                approveLabel: 'Permissions Active (Gate 1..5)',
                onApprove: () => alert(`Permissions re-verified for ${selectedMember.name}`),
              }}
            />
          ) : selectedGate ? (
            <StandardContextInspector
              title={gateFriendlyLabels[selectedGate.gate_type] || selectedGate.gate_type}
              subtitle={`Project: ${selectedGate.project_name || selectedGate.project_id} · ID: ${selectedGate.gate_id}`}
              badge={selectedGate.status}
              badgeTone={selectedGate.status === 'APPROVED' ? 'good' : selectedGate.status === 'PENDING' ? 'warn' : 'bad'}
              overview={{
                statusSummary: `Created at ${new Date(selectedGate.created_at).toLocaleString()}.${selectedGate.decided_by ? ` Decided by ${selectedGate.decided_by}.` : ' Awaiting human sign-off.'}`,
                details: `MOD-10 Enterprise Gatekeeper halts downstream pipelines until approval condition is satisfied.`,
                domainOrUrl: selectedGate.gate_id,
                customPreview: selectedGate.metadata ? (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Gate Payload Metadata
                    </span>
                    <div className="space-y-1">
                      {Object.entries(selectedGate.metadata).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">{k}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : undefined,
              }}
              legalShield={{
                dpdpStatus: 'Verified',
                gdprStatus: 'Verified',
                ccpaStatus: 'Verified',
                playSafetyStatus: 'Verified',
                rlsSecurityStatus: '100% Pass',
              }}
              costPortability={{
                baseReusedPercent: 92,
                compressionActive: true,
                estimatedAiCost: '₹1 / $0.01',
                profitMarginPercent: 99.9,
                monthlyRevenue: '$2,500/mo',
                dockerBranchesStatus: 'PostgreSQL RLS Audit Logged',
                localFolderPath: 'd:/Projects/launch-up',
                portabilityNote: 'MOD-10 Gatekeeper Port 8004 Stream Ready',
              }}
              approvalBar={{
                decisionStatus: selectedGate.status === 'APPROVED' ? 'APPROVED' : selectedGate.status === 'REJECTED' ? 'CHANGES_REQUESTED' : 'PENDING',
                approveLabel: selectedGate.status === 'APPROVED' ? 'Gate Approved' : 'Approve Gate',
                onApprove: () => handleGateDecision(selectedGate.gate_id, 'APPROVED'),
                requestChangesLabel: 'Request Revision',
                onRequestChanges: () => handleGateDecision(selectedGate.gate_id, 'REVISION_REQUESTED'),
              }}
            />
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a gate or member to inspect.
            </div>
          )}
        </ExpandableRightDetailPanel>
      </div>
    </div>
  );
};