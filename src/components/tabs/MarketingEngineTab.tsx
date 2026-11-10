import React, { useState } from 'react';
import { 
  Megaphone, TrendingUp, DollarSign, Target, Sparkles, 
  RefreshCw, CheckCircle2, Play, Users, BarChart3, Plus, 
  ExternalLink, Layers, ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MarketingCampaign } from '../../types';

export const MarketingEngineTab: React.FC = () => {
  const { campaigns, rebalanceCampaign, createCampaign, clients } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [businessName, setBusinessName] = useState(clients[0]?.name || 'Acme Co.');
  const [channel, setChannel] = useState<any>('LinkedIn B2B');
  const [budgetMonthly, setBudgetMonthly] = useState(3000);
  const [targetRoas, setTargetRoas] = useState(5.0);

  const totalMonthlySpend = campaigns.reduce((acc, c) => acc + c.budgetMonthly, 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + c.leadsGenerated, 0);
  const avgRoas = (campaigns.reduce((acc, c) => acc + c.roas, 0) / (campaigns.length || 1)).toFixed(1);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    createCampaign({
      title,
      businessName,
      channel,
      status: 'Running',
      budgetMonthly,
      roas: targetRoas,
      conversionRate: 10.4,
      aiAgentManager: 'Vortex Growth',
      creativeAssetCount: 16,
      generatedHeadlines: [
        `Transform Your ${businessName} Operations with Full Automation`,
        `The Autonomous Advantage: How Fast Teams Outpace Competitors`,
        `Zero-Manual Bottlenecks: Realtime FDE & Edge Intelligence`,
      ],
    });

    setShowCreateModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Digital Marketing & Growth Automation Engine
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 font-semibold">
                  Autonomous ROAS
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Self-driving marketing campaigns powered by Vortex Growth Agent. Autonomous copy generation, ad creative testing, and real-time bid optimization.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Launch Autonomous Campaign</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Average ROAS</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {avgRoas}x <span className="text-xs text-emerald-500 font-medium">Return</span>
          </div>
          <p className="text-[11px] text-emerald-500 mt-1 font-mono">
            Autonomous Bid Rebalancing
          </p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Monthly Managed Budget</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            ${totalMonthlySpend.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Spread across {campaigns.length} active channels
          </p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Inbound Leads Captured</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalLeads}
          </div>
          <p className="text-[11px] text-purple-500 mt-1 font-mono">
            Synced directly to CRM
          </p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Autonomous Creative Sets</span>
            <Sparkles className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            84 Hooks
          </div>
          <p className="text-[11px] text-pink-500 mt-1 font-mono">
            Dynamic A/B Evaluation
          </p>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
          Active Autonomous Growth Campaigns
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white dark:bg-[#111622] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between space-y-4 hover:border-pink-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {camp.title}
                    </h3>
                    <p className="text-[11px] text-slate-400">{camp.businessName}</p>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {camp.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Target Channel:</span>
                    <span className="font-bold text-pink-600 dark:text-pink-400">{camp.channel}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Monthly Budget:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">${camp.budgetMonthly.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current ROAS:</span>
                    <span className="font-bold text-emerald-500 font-mono text-sm">{camp.roas}x</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Leads Generated:</span>
                    <span className="font-bold text-purple-400 font-mono">{camp.leadsGenerated}</span>
                  </div>
                </div>

                {/* Generated Copy Hooks */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                    AI Agent Top-Converting Hooks:
                  </span>
                  {camp.generatedHeadlines.map((headline, i) => (
                    <div
                      key={i}
                      className="p-1.5 rounded bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-600 dark:text-slate-300 font-sans border border-slate-200/50 dark:border-slate-800"
                    >
                      "{headline}"
                    </div>
                  ))}
                </div>

                {/* Optimization audit note */}
                <div className="mt-3 p-2 rounded-lg bg-pink-50/50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/50 text-[11px] text-pink-700 dark:text-pink-300">
                  ⚡ <strong>Autonomous Log:</strong> {camp.lastAutonomousOptimization}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Manager: {camp.aiAgentManager}
                </span>
                <button
                  onClick={() => rebalanceCampaign(camp.id)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Rebalance Bids</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Launch Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111622] rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-pink-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Launch Autonomous Marketing Campaign
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Inbound Enterprise Pipeline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Business Entity
                  </label>
                  <select
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="Apex Logistics">Apex Logistics</option>
                    <option value="Solaria Health">Solaria Health</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Channel Mode
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="LinkedIn B2B">LinkedIn B2B</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Meta Dynamic">Meta Dynamic Ads</option>
                    <option value="Automated SEO Blog">Automated SEO Blog</option>
                    <option value="Cold Email Sequence">Cold Email Sequence</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Monthly Budget ($)
                  </label>
                  <input
                    type="number"
                    value={budgetMonthly}
                    onChange={(e) => setBudgetMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target ROAS Floor
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetRoas}
                    onChange={(e) => setTargetRoas(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800 text-[11px] text-pink-700 dark:text-pink-300">
                🎯 <strong>Hands-Free Automation:</strong> The Vortex Growth agent writes copy, generates visual layout specs, monitors daily conversion telemetry, and pauses underperforming ad groups without human intervention.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Deploy Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
