import React from 'react';
import { 
  LayoutTemplate, Star, Rocket, Check, ArrowRight, Layers, 
  ExternalLink, Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Template } from '../../types';

export const TemplatesTab: React.FC = () => {
  const { templates, setIsCreateProjectModalOpen } = useApp();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Project Starter Templates
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-full">
              Production Verified
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Accelerate delivery with pre-architected templates built for B2B Enterprise and high-converting B2C applications.
          </p>
        </div>

        <button
          onClick={() => setIsCreateProjectModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-600/30 transition-all"
        >
          <Rocket className="w-4 h-4" />
          <span>Launch from Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-indigo-300 dark:hover:border-slate-700 transition-all group"
          >
            <div>
              {/* Image Banner */}
              <div className="h-40 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={tmpl.previewImage}
                  alt={tmpl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-lg text-slate-800 dark:text-slate-200 shadow-xs">
                    {tmpl.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full text-white text-[11px]">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{tmpl.stars}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tmpl.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {tmpl.description}
                </p>

                {/* Tech Stack Pills */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-2">
                    Included Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tmpl.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="p-5 pt-0">
              <button
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="w-full py-2 px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Use This Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
