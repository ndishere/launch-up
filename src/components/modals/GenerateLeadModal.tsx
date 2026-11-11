import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Globe,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Briefcase,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { discoverLead } from '../../services/api';

interface GenerateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INDUSTRY_PRESETS = [
  'Logistics',
  'Healthcare',
  'FinTech',
  'E-Commerce',
  'Real Estate',
  'Custom',
] as const;

export const GenerateLeadModal: React.FC<GenerateLeadModalProps> = ({ isOpen, onClose }) => {
  const { projects, clients, setCurrentTab } = useApp();

  const [industry, setIndustry] = useState<string>('Logistics');
  const [customIndustry, setCustomIndustry] = useState<string>('');
  const [prospectUrl, setProspectUrl] = useState('https://apex-freight-example.com');
  const [isAuditing, setIsAuditing] = useState(false);
  const [leadResult, setLeadResult] = useState<any>(null);

  if (!isOpen) return null;

  const resolvedCategory =
    industry === 'Custom' ? customIndustry.trim() || 'Custom Industry' : industry;

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
        category: resolvedCategory,
      });
      setLeadResult(res);
    } catch (err: any) {
      setLeadResult({ error: err?.message || 'Audit request failed' });
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Generate Lead & Canva Pitch (MOD-01)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Autonomous Lead Discovery & Pitch Engine (Port 8005)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Brief Explanation Banner */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/35 border border-indigo-200/60 dark:border-indigo-900/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Audit a prospective business website for missing mobile apps, responsive viewport gaps, and low Lighthouse scores.{' '}
            <strong>MOD-01</strong> synthesizes a branded Canva Pro pitch deck and creates a human-gated{' '}
            <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">Gate 1 (OUTREACH_PITCH)</span>{' '}
            approval record.
          </div>

          <form onSubmit={handleAuditLead} className="space-y-4">
            {/* Business Category / Industry */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Business Category / Industry
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {INDUSTRY_PRESETS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {industry === 'Custom' && (
                <input
                  type="text"
                  required
                  placeholder="Enter custom business category (e.g. SaaS Supply Chain)..."
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  className="mt-2 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>

            {/* Prospect Website URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Prospect Website URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  required
                  placeholder="https://example-business.com"
                  value={prospectUrl}
                  onChange={(e) => setProspectUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isAuditing}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                {isAuditing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isAuditing ? 'Auditing Prospect...' : 'Run Audit & Generate Pitch'}</span>
              </button>
            </div>
          </form>

          {/* Generated Result & Gate 1 Status */}
          {leadResult?.error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{leadResult.error}</span>
            </div>
          )}

          {leadResult && !leadResult.error && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Audit & Proposal Synthesis Complete ({resolvedCategory})</span>
                </span>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    leadResult.isLive ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                >
                  {leadResult.isLive ? '● Live Fastify 8005' : '● Schema Fallback'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Lighthouse Score</span>
                  <span className="text-base font-bold text-amber-500">
                    {leadResult.data?.lighthouse_audit_score ?? 58}/100
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Gate 1 (PENDING)</span>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 break-all">
                    {leadResult.data?.approval_gate_id}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Canva Pitch Deck</span>
                  <a
                    href={leadResult.data?.proposal_canva_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>Open Proposal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {Array.isArray(leadResult.data?.missing_assets) && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <strong>Detected Gaps:</strong> {leadResult.data.missing_assets.join(', ')}
                </div>
              )}

              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setCurrentTab('team');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Review Gate 1 in Team & Gates</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
