import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Plus, Mail, Shield, ShieldCheck, FolderKanban,
  CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, Key,
  Sparkles, ExternalLink, ArrowRight, Lock, Unlock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenAnalyticsHeader } from '../common/ScreenAnalyticsHeader';
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

  // Governance Verification Interactive State
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [principalType, setPrincipalType] = useState<'HUMAN_USER' | 'AI_AGENT'>('HUMAN_USER');
  const [requestedAction, setRequestedAction] = useState('gate:approve');

  const refreshGates = () => {
    setGates(getStoredGates());
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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Combined Analytics Section with Live Success/Error Rates */}
      <ScreenAnalyticsHeader
        title="Team, Multi-Tenant RBAC & Governance Gates (MOD-10)"
        badge="Enterprise Gatekeeper Active"
        description="Enforce strict M:N tenancy, FinOps token budgets, and cryptographic Human-in-the-Loop approval gates (Gates 1 through 5) before code, pitches, or deployments proceed."
        metrics={[
          {
            label: 'Total Members',
            value: teamMembers.length,
            subValue: '100% Active Logins',
            status: 'good',
          },
          {
            label: 'Pending Governance Gates',
            value: pendingCount,
            subValue: `${approvedCount} Approved Historical`,
            status: pendingCount > 0 ? 'warn' : 'good',
          },
          {
            label: 'MOD-10 Governance Core',
            value: 'Port 8004',
            subValue: 'PostgreSQL RLS Active',
            status: 'live',
          },
          {
            label: 'FinOps Budget Ledger',
            value: '$25.00 Cap',
            subValue: 'Token Circuit Breaker',
            status: 'good',
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={refreshGates}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111318] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
              <span>Refresh Gates</span>
            </button>
            <button
              onClick={() => alert('Invite member flow: opens invitation link generator.')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Team Member</span>
            </button>
          </div>
        }
      />

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
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

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 1: GOVERNANCE GATES APPROVAL HUB (Gates 1 through 5)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Autonomous Governance Gates & Approvals Hub (MOD-10)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Human-in-the-Loop decision gateway. AI agents generate Gates 1-5; only verified Client Approvers can unlock downstream stages.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setGateFilter(tab)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  gateFilter === tab
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Gates Feed */}
        <div className="space-y-3">
          {filteredGates.map((gate) => {
            const isPending = gate.status === 'PENDING';
            const isApproved = gate.status === 'APPROVED';

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
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPending
                    ? 'bg-slate-50/70 dark:bg-slate-900/50 border-amber-200/80 dark:border-amber-900/50'
                    : 'bg-white dark:bg-[#111318] border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${gateBadgeStyles}`}>
                      {gate.gate_type.replace('_', ' ')}
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
                          : 'bg-red-50 text-red-700 dark:bg-red-950/70 dark:text-red-300'
                      }`}
                    >
                      {gate.status}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Project: <span className="font-semibold text-slate-900 dark:text-white">{gate.project_name || gate.project_id}</span>
                  </p>

                  {/* Metadata display */}
                  {gate.metadata && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                      {Object.entries(gate.metadata).map(([k, v]) => (
                        <span key={k}>
                          <strong className="text-slate-700 dark:text-slate-300">{k}:</strong> {String(v)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Created: {new Date(gate.created_at).toLocaleString()}</span>
                    {gate.decided_by && (
                      <span>· Decided by: {gate.decided_by} at {new Date(gate.decided_at!).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isPending ? (
                    <>
                      <button
                        disabled={actionLoading === gate.gate_id}
                        onClick={() => handleGateDecision(gate.gate_id, 'APPROVED')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Gate</span>
                      </button>
                      <button
                        disabled={actionLoading === gate.gate_id}
                        onClick={() => handleGateDecision(gate.gate_id, 'REVISION_REQUESTED')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800/60 transition-colors"
                      >
                        Request Revision
                      </button>
                      <button
                        disabled={actionLoading === gate.gate_id}
                        onClick={() => handleGateDecision(gate.gate_id, 'REJECTED')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      >
                        Reject
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

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: INTERACTIVE RBAC & TOKEN BUDGET SIMULATOR          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <Key className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Live RBAC Permission & Token Budget Gatekeeper Test (POST /api/v1/governance/verify)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Principal Type:</label>
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
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Requested Action:</label>
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
              className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5"
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

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 3: TEAM MEMBERS CARDS GRID                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Registered Organization Members ({teamMembers.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-[#111318] rounded-xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-base flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      {member.avatarInitials}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {member.name}
                      </h3>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                    {member.status}
                  </span>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-500" />
                      Security Role:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {member.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-purple-500" />
                      Projects Assigned:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {member.projectsAssigned} Projects
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  onClick={() => alert(`Configuring permissions for ${member.name}`)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Edit Permissions
                </button>
                <span className="text-[10px] text-slate-400 font-mono">2FA Enforced</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
