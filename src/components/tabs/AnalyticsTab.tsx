import React, { useState } from 'react';
import { TrendingUp, Users, Globe, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';

export const AnalyticsTab: React.FC = () => {
  const { projects } = useApp();
  const [selectedProject, setSelectedProject] = useState<string>('All');

  const campaigns = [
    {
      name: 'Q3 Enterprise Product Hunt Launch',
      project: 'TechFlow CRM Platform',
      visitors: '14,280',
      conversions: '420 signups (2.9%)',
      channel: 'Product Hunt / X',
      status: 'Active',
    },
    {
      name: 'High-Intent Google Ads (B2B)',
      project: 'Visionary Inc. E-commerce',
      visitors: '28,400',
      conversions: '890 sales (3.1%)',
      channel: 'Google Search',
      status: 'Active',
    },
    {
      name: 'Organic Technical SEO',
      project: 'Acme Co. Marketing Website',
      visitors: '45,200',
      conversions: '1,240 leads (2.7%)',
      channel: 'Google Organic',
      status: 'Optimized',
    },
    {
      name: 'GrowthLabs Staging Beta Invite',
      project: 'GrowthLabs Landing Page',
      visitors: '3,200',
      conversions: '310 waitlist (9.6%)',
      channel: 'LinkedIn',
      status: 'Completed',
    },
  ];

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-150">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-3 pb-0.5">
        <span className="px-2 py-0.5 text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md">
          Attribution
        </span>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="bg-white dark:bg-[#111318] border border-slate-200/80 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none ml-auto"
        >
          <option value="All">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Unified 5-Cell Horizontal Summary Bar */}
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

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            Campaigns & Attribution
          </h2>
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
              {campaigns.map((camp, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{camp.name}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{camp.project}</td>
                  <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200">{camp.visitors}</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">{camp.conversions}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{camp.channel}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                      {camp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
