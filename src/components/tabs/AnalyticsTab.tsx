import React, { useState } from 'react';
import { TrendingUp, Users, Globe, Sparkles } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Analytics
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md">
              Attribution
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Traffic performance, conversion rates, SEO health, and acquisition channels.
          </p>
        </div>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="bg-white dark:bg-[#111318] border border-slate-200/80 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="All">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Hairline KPI Strip */}
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800/80">
        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Monthly Visitors</span>
            <Users className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">190,800</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">+21.4% MoM</p>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Conversion Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">3.18%</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">+0.4% baseline</p>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Lighthouse & SEO</span>
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">99 / 100</div>
          <p className="text-[11px] text-slate-400 mt-0.5">0.6s LCP</p>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Acquisition CAC</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">$14.20</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">-12% cost</p>
        </div>
      </div>

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
