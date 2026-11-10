import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Users, MousePointer, Share2, 
  Search, Eye, ArrowUpRight, ArrowDownRight, Globe, Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AnalyticsTab: React.FC = () => {
  const { projects } = useApp();
  const [selectedProject, setSelectedProject] = useState<string>('All');

  const campaigns = [
    {
      name: 'Q3 Enterprise Product Hunt Launch',
      project: 'TechFlow CRM Platform',
      visitors: '14,280',
      conversions: '420 signups (2.9%)',
      cac: '$18.40',
      channel: 'Product Hunt / Twitter X',
      status: 'Active',
    },
    {
      name: 'High-Intent Google Ads (B2B E-commerce)',
      project: 'Visionary Inc. E-commerce',
      visitors: '28,400',
      conversions: '890 sales (3.1%)',
      cac: '$24.50',
      channel: 'Google Search & Retargeting',
      status: 'Active',
    },
    {
      name: 'Organic Technical SEO & Backlinks',
      project: 'Acme Co. Marketing Website',
      visitors: '45,200',
      conversions: '1,240 leads (2.7%)',
      cac: '$0.00 (Organic)',
      channel: 'Google Organic / Blogs',
      status: 'Optimized',
    },
    {
      name: 'GrowthLabs Staging Beta Invite',
      project: 'GrowthLabs Landing Page',
      visitors: '3,200',
      conversions: '310 waitlist (9.6%)',
      cac: '$8.20',
      channel: 'LinkedIn Referral',
      status: 'Completed',
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Growth Marketing & Traffic Analytics
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-full">
              Real-time Attribution
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track online marketing performance of projects, visitor conversions, SEO health, and acquisition channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none shadow-2xs"
          >
            <option value="All">All Projects Aggregate</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111622] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Total Monthly Visitors</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">190,800</div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">↑ 21.4% vs prev period</p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Average Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">3.18%</div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">↑ 0.4% baseline increase</p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Core Web Vitals & SEO Score</span>
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">99 / 100</div>
          <p className="text-xs text-slate-400 mt-1">0.6s LCP on Google Lighthouse</p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Marketing CAC Efficiency</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">$14.20</div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">↓ 12% acquisition cost</p>
        </div>
      </div>

      {/* Online Marketing Campaigns Table */}
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 dark:text-white text-base">
            Active Marketing Campaigns & Attribution
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Target Project</th>
                <th className="py-3 px-4">Traffic Driven</th>
                <th className="py-3 px-4">Conversion Outcome</th>
                <th className="py-3 px-4">Channel Source</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {campaigns.map((camp, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {camp.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {camp.project}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                    {camp.visitors}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-medium">
                    {camp.conversions}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    {camp.channel}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
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
