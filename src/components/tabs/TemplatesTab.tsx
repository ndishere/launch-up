import React, { useState } from 'react';
import { Star, Rocket, ArrowRight, FileCode2, Sparkles, X, Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { packRepoToCompressedMd, type RepomixSkeletonResult } from '../../lib/token-compressor';
import type { Template } from '../../types';

export const TemplatesTab: React.FC = () => {
  const { templates, setIsCreateProjectModalOpen, tokenOptimizer, updateTokenOptimizer } = useApp();
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [skeletonResult, setSkeletonResult] = useState<RepomixSkeletonResult | null>(null);
  const [copiedDigest, setCopiedDigest] = useState(false);

  const avgStars = (templates.reduce((acc, t) => acc + t.stars, 0) / (templates.length || 1)).toFixed(1);
  const categoryCount = new Set(templates.map((t) => t.category)).size;
  const techCount = new Set(templates.flatMap((t) => t.techStack)).size;

  const handleOpenSkeleton = (tmpl: Template) => {
    const sampleFiles = [
      {
        path: `${tmpl.id}/src/schema.sql`,
        content: `-- PostgreSQL 16 Multi-Tenant Schema for ${tmpl.name}\nCREATE TABLE projects_tenant_items (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  client_id UUID NOT NULL,\n  title TEXT NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT now()\n);\nENABLE ROW LEVEL SECURITY;\nCREATE POLICY tenant_isolation_policy ON projects_tenant_items USING (client_id = current_setting('app.current_client_id')::uuid);`,
      },
      {
        path: `${tmpl.id}/src/routes/index.ts`,
        content: `// Primary route handler with verbose boilerplate comments\nexport interface ${tmpl.id.replace(/[^a-zA-Z0-9]/g, '')}Config {\n  projectName: string;\n  stack: string[];\n  deltaCloneRatio: number;\n}\nexport function registerTemplateRoutes(app: any) {\n  // Implementation body stripped by Repomix AST skeleton packer\n  const secretPlaceholder = "postgresql://admin:pass@localhost:5432/app";\n  return { ok: true, dsn: secretPlaceholder };\n}\napp.get('/api/v1/template/health', async () => ({ status: 'ok' }));`,
      },
    ];
    const packed = packRepoToCompressedMd(sampleFiles, {
      stripComments: true,
      sanitize: true,
    });
    setPreviewTemplate(tmpl);
    setSkeletonResult(packed);
    setCopiedDigest(false);
  };

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

      {/* Golden Template Delta-Only Generation Banner */}
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-indigo-200/70 dark:border-indigo-900/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">
              Golden Template Delta-Only Generation
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              {tokenOptimizer.goldenTemplateDeltaOnly
                ? '88% Boilerplate @ $0 · 12% LLM Delta'
                : 'Full Generation Mode (Disabled)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Clones verified Golden Shells at zero LLM cost and feeds only Repomix AST skeletons + Caveman client deltas to your agent swarm.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            updateTokenOptimizer({
              goldenTemplateDeltaOnly: !tokenOptimizer.goldenTemplateDeltaOnly,
            })
          }
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
            tokenOptimizer.goldenTemplateDeltaOnly
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          {tokenOptimizer.goldenTemplateDeltaOnly ? 'Delta-Only: ON' : 'Delta-Only: OFF'}
        </button>
      </div>

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

            <div className="p-4 pt-0 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md">
                <span>Delta Clone: 88% Free</span>
                <span>12% Custom Delta</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenSkeleton(tmpl)}
                  className="py-1.5 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors inline-flex items-center justify-center gap-1"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Repomix AST</span>
                </button>
                <button
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  className="flex-1 py-1.5 px-3 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Use Delta Shell</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Repomix Skeleton Digest Preview Modal */}
      {previewTemplate && skeletonResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewTemplate(null);
          }}
        >
          <div className="w-full max-w-2xl bg-white dark:bg-[#0D1017] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Repomix Sanitized AST Skeleton — {previewTemplate.name}
                </h3>
                <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {skeletonResult.rawTokens} raw tokens → {skeletonResult.compressedTokens} AST tokens ({skeletonResult.reductionPercent}% saved · {skeletonResult.secretsScrubbed} secret(s) scrubbed)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(skeletonResult.markdownDigest);
                    setCopiedDigest(true);
                    setTimeout(() => setCopiedDigest(false), 1800);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 inline-flex items-center gap-1"
                >
                  {copiedDigest ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDigest ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto p-4 bg-[#0D111A] text-slate-200 font-mono text-[11px] leading-relaxed">
              {skeletonResult.markdownDigest}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
