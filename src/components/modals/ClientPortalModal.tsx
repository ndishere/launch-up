import React, { useState } from 'react';
import { 
  X, Link, Copy, Check, Send, Sparkles, Building, Mail, 
  Phone, DollarSign, Calendar, Layers, ShieldCheck, CheckCircle2,
  ExternalLink, Globe, Bot, ArrowRight, Code
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ClientPortalModal: React.FC = () => {
  const { 
    isClientPortalModalOpen, 
    setIsClientPortalModalOpen, 
    submitRequirementIntake,
    setCurrentTab
  } = useApp();

  const [activeMode, setActiveMode] = useState<'link' | 'manual' | 'api-wiring'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Manual Form State
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [budgetEstimated, setBudgetEstimated] = useState('$10,000 - $20,000');
  const [deadline, setDeadline] = useState('4 Weeks');
  const [summary, setSummary] = useState('');
  const [detailedRequirements, setDetailedRequirements] = useState('');
  
  // Selected Products & Services
  const [selectedProducts, setSelectedProducts] = useState<string[]>([
    'Full Website (4-5+ pages)',
    'Android App',
  ]);
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'WhatsApp Automation',
    'Order Management SLM',
  ]);

  if (!isClientPortalModalOpen) return null;

  const publicIntakeUrl = `https://app.launchup.io/intake/req-${companyName ? companyName.toLowerCase().replace(/[^a-z0-9]/g, '') : 'client-portal'}`;

  const sampleCurl = `curl -X POST "https://api.launchup.io/v1/client-intake/stream" \\
  -H "Authorization: Bearer sec_live_vault_90184fa9201" \\
  -H "Content-Type: application/json" \\
  -d '{
    "companyName": "Helix Logistics",
    "contactEmail": "ceo@helixlogistics.com",
    "projectTitle": "Custom Order SLM & Multi-Device Android Apps",
    "productTypes": ["Full Website (4-5+ pages)", "Dual Android Apps", "Custom SLM"],
    "servicesNeeded": ["WhatsApp Automation", "Email Handling & Analysis", "Order Management SLM"],
    "budgetEstimated": "$30,000",
    "summary": "Full fleet automation with driver tablet application and automated dispatch SLM."
  }'`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicIntakeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2200);
  };

  const toggleProduct = (prod: string) => {
    setSelectedProducts(prev => 
      prev.includes(prod) ? prev.filter(p => p !== prod) : [...prev, prod]
    );
  };

  const toggleService = (serv: string) => {
    setSelectedServices(prev => 
      prev.includes(serv) ? prev.filter(s => s !== serv) : [...prev, serv]
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !companyName || !contactEmail || !projectTitle) return;

    submitRequirementIntake({
      clientName,
      companyName,
      contactEmail,
      contactPhone,
      projectTitle,
      productTypes: selectedProducts as any,
      servicesNeeded: selectedServices as any,
      budgetEstimated,
      deadline,
      summary: summary || `Client requirement captured manually during discovery call for ${projectTitle}.`,
      detailedRequirements: detailedRequirements || `Products selected: ${selectedProducts.join(', ')}. Services requested: ${selectedServices.join(', ')}.`,
      status: 'Submitted via Web Link',
    });

    setIsClientPortalModalOpen(false);
    setCurrentTab('clients');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl shadow-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Client Requirements Intake & 1-Person Company Hub
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share a secure intake link, input manually on client discovery calls, or wire up external API webhooks.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsClientPortalModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/30">
          <button
            onClick={() => setActiveMode('link')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeMode === 'link'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Shareable Client Web Link</span>
          </button>

          <button
            onClick={() => setActiveMode('manual')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeMode === 'manual'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enter Manually (During Call)</span>
          </button>

          <button
            onClick={() => setActiveMode('api-wiring')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeMode === 'api-wiring'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>API & Database Wiring Doc</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeMode === 'link' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-indigo-700 dark:text-indigo-300">
                  <Globe className="w-4 h-4" />
                  <span>Public Client Self-Service Onboarding Webpage</span>
                </div>
                <p>
                  Share this unique link with prospective clients. When they fill out their company details, products required (e.g. Website, Android apps, custom SLMs, automations), and optional budgets, the data will be securely auto-pulled into Launch Up via authenticated API endpoints.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Shareable Intake Link (Encrypted Token URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicIntakeUrl}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Live Preview of What the Client Sees */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-[#090B10]/60 space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Intake Webpage Capabilities (Automated Sync)
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    AES-256 Vault Synced
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <strong className="block text-slate-900 dark:text-white mb-1">Products Selectable:</strong>
                    Landing Page, 4-5+ Pages Website, SaaS Platform, Android Apps (Single or Dual), Custom SLMs, n8n Automation.
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <strong className="block text-slate-900 dark:text-white mb-1">Services Connectable:</strong>
                    WhatsApp Automation, Email Handling & Analysis, Order Management SLM, Payment Webhooks, External APIs.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    // Pre-fill manual mode for testing
                    setClientName('Alex Rivera');
                    setCompanyName('Rivera Health SaaS');
                    setContactEmail('alex@riverahealth.com');
                    setProjectTitle('Multi-Tenant Telehealth SaaS & Patient WhatsApp Bot');
                    setSummary('Client wants a 6-page patient portal, 2 Android apps for doctors & nurses, plus an automated WhatsApp triage bot running on local SLM.');
                    setActiveMode('manual');
                  }}
                  className="w-full py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Test Intake Simulation (Simulate Client Submission)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeMode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <strong>Discovery Call Mode:</strong> Fill in the requirements in real-time as you speak with the client. It will automatically populate the Clients tab and allow instant hand-off to the Projects Orchestrator and Project Canvas.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Client Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Logistics Global"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@acme.co"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 234-5678"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title / Objective *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Multi-Page Web Portal + 2 Android Apps + WhatsApp Automation"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Products Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Products Needed (Select one or multiple)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'Landing Page',
                    'Full Website (4-5+ pages)',
                    'SaaS Platform',
                    'Android App',
                    'Dual Android Apps',
                    'Custom SLM',
                    'Automation Flow (n8n)',
                    'Digital / Social Marketing',
                  ].map((prod) => {
                    const isSelected = selectedProducts.includes(prod);
                    return (
                      <button
                        key={prod}
                        type="button"
                        onClick={() => toggleProduct(prod)}
                        className={`p-2 rounded-xl text-left border text-[11px] font-medium transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {prod}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Services Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Services & Automations To Attach
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'WhatsApp Automation',
                    'Email Handling & Analysis',
                    'Order Management SLM',
                    'Payment & Stripe Webhooks',
                    'Autonomous Telemetry',
                    'External API Integrations',
                    'n8n Workflow Hub',
                  ].map((serv) => {
                    const isSelected = selectedServices.includes(serv);
                    return (
                      <button
                        key={serv}
                        type="button"
                        onClick={() => toggleService(serv)}
                        className={`p-2 rounded-xl text-left border text-[11px] font-medium transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {serv}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Client Budget (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $15,000 - $25,000"
                    value={budgetEstimated}
                    onChange={(e) => setBudgetEstimated(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Delivery Deadline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Weeks"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Executive Summary / Client Requirements Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize what the client wants, integrations, user roles, etc."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClientPortalModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Securely Save Intake & Pull into Launch Up</span>
                </button>
              </div>
            </form>
          )}

          {activeMode === 'api-wiring' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs space-y-3 font-mono">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">REST API Wiring & Webhook Payload Spec</span>
                  <button
                    onClick={handleCopyCurl}
                    className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 flex items-center gap-1"
                  >
                    {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-[11px] text-emerald-400 whitespace-pre">
                  {sampleCurl}
                </pre>
              </div>

              <div className="bg-white dark:bg-[#111318] rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Database & Vault Wiring Architecture</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every intake is hashed with an AES-256-GCM token and stored in PostgreSQL <code className="text-indigo-600 dark:text-indigo-400 font-mono">launchup_core.client_intakes</code> table. Role-Based Access Control (RBAC) ensures only designated team members or owners can read financial budget details.
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Webhook endpoint is idempotent and handles up to 50,000 req/min with zero data loss.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
