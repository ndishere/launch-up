import React from 'react';
import { Star, Rocket, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';

export const TemplatesTab: React.FC = () => {
  const { templates, setIsCreateProjectModalOpen } = useApp();
  const avgStars = (templates.reduce((acc, t) => acc + t.stars, 0) / (templates.length || 1)).toFixed(1);
  const categoryCount = new Set(templates.map((t) => t.category)).size;
  const techCount = new Set(templates.flatMap((t) => t.techStack)).size;

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Templates
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md">
              Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Starter architectures for enterprise web, mobile, and SaaS stacks.
          </p>
        </div>

        <button
          onClick={() => setIsCreateProjectModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Launch Template</span>
        </button>
      </div>

      {/* Unified 5-Cell Horizontal Summary Bar */}
      <SummaryMetricGrid>
        <SummaryMetricCard
          title="Verified Blueprints"
          primaryValue={templates.length}
          subtitle="Production Starters"
          status="good"
        />
        <SummaryMetricCard
          title="Avg Template Rating"
          primaryValue={`${avgStars} / 5.0`}
          subtitle="Agency Battle-Tested"
          status="good"
        />
        <SummaryMetricCard
          title="Architecture Domains"
          primaryValue={categoryCount}
          subtitle="Web, Mobile & SaaS"
          status="live"
        />
        <SummaryMetricCard
          title="Tech Stack Modules"
          primaryValue={techCount}
          subtitle="Pre-wired Frameworks"
          status="neutral"
        />
        <SummaryMetricCard
          title="Provision SLA"
          primaryValue="< 4 mins"
          subtitle="1-Click Scaffold Ready"
          status="good"
        />
      </SummaryMetricGrid>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col justify-between hover:border-indigo-300 dark:hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="h-36 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={tmpl.previewImage}
                  alt={tmpl.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-white/95 dark:bg-slate-900/90 rounded-md text-slate-700 dark:text-slate-200">
                    {tmpl.category}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md text-white text-[10px]">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{tmpl.stars}</span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {tmpl.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                  {tmpl.description}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                  {tmpl.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="w-full py-1.5 px-3 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
