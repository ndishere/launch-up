import React, { useState } from 'react';
import {
  X,
  Building,
  Link,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClientTier, ClientStatus } from '../../types';

const DEFAULT_GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSd-LaunchUp-Client-Intake-Form/viewform';

export const AddClientModal: React.FC = () => {
  const { isAddClientModalOpen, setIsAddClientModalOpen, addClient, projects } = useApp();

  const [activeTab, setActiveTab] = useState<'manual' | 'intake-link'>('manual');

  // Manual Form State
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('Head of Operations');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState<ClientTier>('Enterprise B2B');
  const [status, setStatus] = useState<ClientStatus>('Active');
  const [monthlySubscription, setMonthlySubscription] = useState<number>(1499);
  const [notes, setNotes] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // Google Form Intake Link State
  const [googleFormUrl, setGoogleFormUrl] = useState(DEFAULT_GOOGLE_FORM_URL);
  const [copiedFormLink, setCopiedFormLink] = useState(false);

  if (!isAddClientModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !domain || !email) return;

    addClient({
      name,
      domain,
      email,
      phone,
      tier,
      status,
      monthlySubscription: Number(monthlySubscription),
      primaryContact: {
        name: contactName || name + ' Contact',
        role: contactRole,
        email,
      },
      notes,
      projectIds: selectedProjectIds,
    });

    setName('');
    setDomain('');
    setEmail('');
    setContactName('');
    setNotes('');
    setSelectedProjectIds([]);
    setIsAddClientModalOpen(false);
  };

  const toggleProjectSelection = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleCopyGoogleForm = () => {
    navigator.clipboard.writeText(googleFormUrl);
    setCopiedFormLink(true);
    setTimeout(() => setCopiedFormLink(false), 2200);
  };

  const handleOpenPreview = () => {
    if (!googleFormUrl.trim()) return;
    window.open(googleFormUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Client & Onboarding
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter client details directly or share a synced Google Form intake link.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddClientModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Tab Switcher */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-2">
          <button
            id="add-client-tab-manual"
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Client Details Form</span>
          </button>

          <button
            id="add-client-tab-intake-link"
            type="button"
            onClick={() => setActiveTab('intake-link')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'intake-link'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Via Client Intake Link</span>
          </button>
        </div>

        {/* Tab 1: Manual Client Details Form */}
        {activeTab === 'manual' && (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Helix Robotics Inc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Domain / Website *
                </label>
                <input
                  type="text"
                  required
                  placeholder="helixrobotics.ai"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Julian Cole"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@helixrobotics.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tier
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as ClientTier)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Enterprise B2B">Enterprise B2B</option>
                  <option value="Growth B2B">Growth B2B</option>
                  <option value="Startup B2C">Startup B2C</option>
                  <option value="Agency">Agency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClientStatus)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly MRR (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={monthlySubscription}
                  onChange={(e) => setMonthlySubscription(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {projects.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Link Existing Projects (Optional)
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  {projects.map((p) => {
                    const isSelected = selectedProjectIds.includes(p.id);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => toggleProjectSelection(p.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Scope & SLA Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Multi-tenant web dashboard, Android app, DPDP/GDPR compliance, automated backups."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all"
              >
                Save & Onboard Client
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Via Client Intake Link (Google Form) */}
        {activeTab === 'intake-link' && (
          <div className="p-6 overflow-y-auto space-y-5 animate-in fade-in duration-150">
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/50 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-4 h-4" />
                <span>Shareable Google Form Client Intake Link</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Send this Google Form link to your prospective client. Submissions automatically sync via webhook into Launch Up to populate Client Records and trigger MOD-02 Scope Synthesis.
              </p>
            </div>

            <div>
              <label
                htmlFor="google-form-intake-url"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Google Form Intake URL (Editable)
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  id="google-form-intake-url"
                  type="url"
                  value={googleFormUrl}
                  onChange={(e) => setGoogleFormUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleCopyGoogleForm}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 shrink-0"
                >
                  {copiedFormLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedFormLink ? 'Copied Link!' : 'Copy Google Form Link'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Automatic Webhook Sync Active</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  AES-256 Encrypted Stream
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Google Forms AppScript webhook posts directly to{' '}
                <code className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  /api/v1/client-intake/stream
                </code>
                , automatically creating the client profile, linking initial scope notes, and queuing MOD-02 PRD generation with zero manual copy-pasting.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleOpenPreview}
                className="px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-950 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Form Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
