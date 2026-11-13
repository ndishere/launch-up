import React, { useState } from 'react';
import { TrendingUp, Users, Globe, Sparkles, RefreshCw, Download, ArrowUpRight, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { ExpandableRightDetailPanel, ExpandableDetailToggleButton } from '../common/ExpandableRightDetailPanel';
import { StandardContextInspector } from '../common/StandardContextInspector';

export const AnalyticsTab: React.FC = () => {
  const { projects, setCurrentTab } = useApp();
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  const campaigns = [
    {
      id: 'camp-ph-01',
      name: 'Q3 Enterprise Product Hunt Launch',
      project: 'TechFlow CRM Platform',
      visitors: '14,280',
      conversions: '420 signups (2.9%)',
      channel: 'Product Hunt / X',
      status: 'Active',
      cac: '$12.40',
      roi: '8.4x',
    },
    {
      id: 'camp-gads-02',
      name: 'High-Intent Google Ads (B2B)',
      project: 'Visionary Inc. E-commerce',
      visitors: '28,400',
      conversions: '890 sales (3.1%)',
      channel: 'Google Search',
      status: 'Active',
      cac: '$16.80',
      roi: '5.2x',
    },
    {
      id: 'camp-seo-03',
      name: 'Organic Technical SEO',
      project: 'Acme Co. Marketing Website',
      visitors: '45,200',
      conversions: '1,240 leads (2.7%)',
      channel: 'Google Organic',
      status: 'Optimized',
      cac: '$3.10',
      roi: '14.8x',
    },
    {
      id: 'camp-li-04',
      name: 'GrowthLabs Staging Beta Invite',
      project: 'GrowthLabs Landing Page',
      visitors: '3,200',
      conversions: '310 waitlist (9.6%)',
      channel: 'LinkedIn',
      status: 'Completed',
      cac: '$9.20',
      roi: '6.1x',
    },
  ];

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0].id);
  const [optimizedCampaignIds, setOptimizedCampaignIds] = useState<Set<string>>(new Set());

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-150">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-3 pb-0.5">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Attribution & Growth Analytics</span>
        </span>

        <div className="flex items-center gap-2.5 ml-auto">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-white dark:bg-[#111318] border border-slate-200/80 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <ExpandableDetailToggleButton
            isOpen={isSidePanelOpen}
            onToggle={() => setIsSidePanelOpen((prev) => !prev)}
          />
        </div>
      </div>

      {/* Row 1: Unified 5-Cell Horizontal Summary Bar */}
      <SummaryMetricGrid>
        <SummaryMetricCard
          title="Monthly Visitors"
          primaryValue="190,800"
          subtitle="+21.4% MoM"
          status="good"
        />
        <SummaryMetricCard
          title="Conversion Rate"
          primaryValue="3.18%"
          subtitle="+0.4% baseline"
          status="good"
        />
        <SummaryMetricCard
          title="Lighthouse & SEO"
          primaryValue="99 / 100"
          subtitle="0.6s LCP"
          status="good"
        />
        <SummaryMetricCard
          title="Acquisition CAC"
          primaryValue="$14.20"
          subtitle="-12% cost"
          status="live"
        />
        <SummaryMetricCard
          title="Tracked Projects"
          primaryValue={selectedProject === 'All' ? projects.length : 1}
          subtitle={`${campaigns.length} active campaigns`}
          status="neutral"
        />
      </SummaryMetricGrid>

      {/* Row 2: 2-Column Section */}
      <div className="flex flex-col lg:flex-row items-start gap-5 w-full min-w-0">
        {/* Column 1: Main Content Area */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Campaigns Table */}
          <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                Campaigns & Attribution Channels ({campaigns.length})
              </h2>
              <span className="text-[11px] text-slate-400">Click row to inspect</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                    <th className="py-2.5 px-4">Campaign</th>
                    <th className="py-2.5 px-4">Project</th>
                    <th className="py-2.5 px-4">Visitors</th>
                    <th className="py-2.5 px-4">Conversions</th>
                    <th className="py-2.5 px-4">Channel</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {campaigns.map((camp) => {
                    const isSelected = selectedCampaign.id === camp.id;
                    return (
                      <tr
                        key={camp.id}
                        onClick={() => {
                          setSelectedCampaignId(camp.id);
                          setIsSidePanelOpen(true);
                        }}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{camp.name}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{camp.project}</td>
                        <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200">{camp.visitors}</td>
                        <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">{camp.conversions}</td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{camp.channel}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                            {camp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Column 2: Expandable Right Detail Panel */}
        <ExpandableRightDetailPanel
          isOpen={isSidePanelOpen}
          onToggle={() => setIsSidePanelOpen((prev) => !prev)}
          title={selectedCampaign.name}
          subtitle={`${selectedCampaign.project} · ${selectedCampaign.channel}`}
        >
          <StandardContextInspector
            title={selectedCampaign.name}
            subtitle={`Project: ${selectedCampaign.project} · Channel: ${selectedCampaign.channel}`}
            badge={selectedCampaign.status}
            badgeTone="good"
            overview={{
              statusSummary: `Visitors: ${selectedCampaign.visitors} · Conversions: ${selectedCampaign.conversions} · CAC: ${selectedCampaign.cac} · ROI: ${selectedCampaign.roi}`,
              details: `Campaign is tracking via server-side analytics proxy with zero third-party cookie dependencies.`,
              domainOrUrl: selectedCampaign.channel,
              previewUrl: 'http://localhost:3000',
              previewThumbnailLabel: 'Landing Page Attribution Preview (375px)',
              primaryActionLabel: 'Open Device Preview',
              onPrimaryAction: () => setCurrentTab('preview-studio'),
            }}
            legalShield={{
              dpdpStatus: 'Verified',
              gdprStatus: 'Verified',
              ccpaStatus: 'Verified',
              playSafetyStatus: 'Verified',
              rlsSecurityStatus: '100% Pass',
            }}
            costPortability={{
              baseReusedPercent: 91,
              compressionActive: true,
              estimatedAiCost: '₹5 / $0.06',
              profitMarginPercent: 99.5,
              monthlyRevenue: '$2,500/mo',
              dockerBranchesStatus: 'Analytics Proxy Edge Bundled',
              localFolderPath: 'd:/Projects/launch-up',
              portabilityNote: 'Server-Side Anonymized Attribution Events',
            }}
            approvalBar={{
              decisionStatus: optimizedCampaignIds.has(selectedCampaign.id) ? 'APPROVED' : 'PENDING',
              approveLabel: optimizedCampaignIds.has(selectedCampaign.id) ? 'Bids Optimized' : 'Optimize Channel Bids',
              onApprove: () => setOptimizedCampaignIds((prev) => new Set(prev).add(selectedCampaign.id)),
            }}
          />
        </ExpandableRightDetailPanel>
      </div>
    </div>
  );
};
