import React, { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  CheckCircle2,
  Play,
  ShieldCheck,
  Wifi,
  Battery,
  ShieldAlert,
  Gauge,
} from 'lucide-react';

import { useApp } from '../../context/AppContext';
import { verifyQA } from '../../services/api';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';

type ViewportMode = 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'android-device';

interface PreviewStudioTabProps {
  projectId?: string;
  projectName?: string;
  embedded?: boolean;
}

export const PreviewStudioTab: React.FC<PreviewStudioTabProps> = ({
  projectId,
  projectName,
  embedded = false,
}) => {
  const {
    figcraftProject,
    liveTelemetryScores,
    setLiveTelemetryScores,
    activeCanvasProjectId,
    projects,
  } = useApp();
  const [selectedPreviewProjId, setSelectedPreviewProjId] = useState<string>(
    projectId || activeCanvasProjectId || projects[0]?.id || 'proj-0001-0000-0000-000000000001'
  );
  const effectiveProject =
    projects.find((p) => p.id === (projectId || selectedPreviewProjId)) || projects[0];
  const targetProjectId = projectId || effectiveProject?.id || 'proj-0001-0000-0000-000000000001';
  const displayName = projectName || effectiveProject?.name || figcraftProject.projectName;
  const boundPreviewUrl =
    effectiveProject?.pulledManifest?.runtimeAndDeploy.previewUrl ||
    effectiveProject?.previewUrl ||
    (effectiveProject?.localDevPort ? `http://localhost:${effectiveProject.localDevPort}` : null) ||
    effectiveProject?.liveUrl ||
    'https://preview-staging.launchup.internal';
  const complianceBadges =
    effectiveProject?.pulledManifest?.complianceFrameworks ?? ['DPDP_INDIA', 'GDPR_EU'];

  const [activeViewport, setActiveViewport] = useState<ViewportMode>('mobile');
  const [isRunningQA, setIsRunningQA] = useState(false);
  const [qaLogs, setQaLogs] = useState<string[]>([]);
  const [gate3Certificate, setGate3Certificate] = useState<string | null>(null);

  const VIEWPORT_WIDTHS: Record<ViewportMode, string> = {
    mobile: '375px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '100%',
    'android-device': '375px',
  };

  const handleRunQAVerification = async () => {
    setIsRunningQA(true);
    const logs = [`[MOD-06] Running Playwright, Semgrep, Trivy, Gitleaks & Lighthouse on ${displayName}...`];
    setQaLogs([...logs]);

    try {
      const res = await verifyQA({
        project_id: targetProjectId,
        web_staging_url: boundPreviewUrl,
        api_staging_url: `${boundPreviewUrl.replace(/\/$/, '')}/api`,
      });

      setLiveTelemetryScores({
        performance: res.data.lighthouse_scores.performance,
        accessibility: res.data.lighthouse_scores.accessibility,
        bestPractices: res.data.lighthouse_scores.best_practices,
        seo: res.data.lighthouse_scores.seo,
        semgrep: res.data.semgrep_critical_findings,
        trivy: res.data.trivy_critical_cves,
        gitleaks: res.data.gitleaks_secrets_found,
        lastAuditedAt: new Date().toISOString(),
      });

      setGate3Certificate(res.data.approval_gate_id);
      logs.push(`[OK] Gate 3 issued: ${res.data.approval_gate_id}`);
      setQaLogs([...logs]);
    } catch (err: any) {
      logs.push(`[ERR] ${err.message}`);
      setQaLogs([...logs]);
    } finally {
      setIsRunningQA(false);
    }
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-[#111318] text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden ${
        embedded ? 'min-h-[640px]' : 'h-[calc(100vh-5.5rem)]'
      }`}
    >
      {/* Top Viewport Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0D1017]">
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Preview & QA Studio
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {displayName} · Bound: <span className="font-mono text-indigo-600 dark:text-indigo-400">{boundPreviewUrl}</span> · {complianceBadges.join(' · ')} + RLS
            </p>
          </div>
          {!projectId && projects.length > 0 && (
            <select
              value={effectiveProject?.id || ''}
              onChange={(e) => setSelectedPreviewProjId(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Viewport Selectors */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs">
          {[
            { id: 'mobile', label: '375px', icon: Smartphone },
            { id: 'tablet', label: '768px', icon: Tablet },
            { id: 'laptop', label: '1024px', icon: Laptop },
            { id: 'desktop', label: 'Full', icon: Monitor },
            { id: 'android-device', label: 'Android', icon: Smartphone },
          ].map((vp) => {
            const Icon = vp.icon;
            return (
              <button
                key={vp.id}
                onClick={() => setActiveViewport(vp.id as ViewportMode)}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                  activeViewport === vp.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{vp.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            0px Overflow
          </span>

          <button
            onClick={handleRunQAVerification}
            disabled={isRunningQA}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningQA ? 'animate-spin' : ''}`} />
            <span>{isRunningQA ? 'Auditing...' : 'Run QA (MOD-06)'}</span>
          </button>
        </div>
      </div>

      {/* Unified 5-Cell Horizontal Summary Bar */}
      <div className="px-4 pt-3 shrink-0">
        <SummaryMetricGrid>
          <SummaryMetricCard
            title="Lighthouse Perf"
            primaryValue={`${liveTelemetryScores?.performance ?? 99} / 100`}
            subtitle="Core Web Vitals"
            status="good"
          />
          <SummaryMetricCard
            title="Accessibility"
            primaryValue={`${liveTelemetryScores?.accessibility ?? 98} / 100`}
            subtitle="WCAG Contrast Check"
            status="good"
          />
          <SummaryMetricCard
            title="Security Findings"
            primaryValue={(liveTelemetryScores?.semgrep ?? 0) + (liveTelemetryScores?.trivy ?? 0) + (liveTelemetryScores?.gitleaks ?? 0)}
            subtitle="Semgrep + Trivy + Gitleaks"
            status={((liveTelemetryScores?.semgrep ?? 0) + (liveTelemetryScores?.trivy ?? 0) + (liveTelemetryScores?.gitleaks ?? 0)) === 0 ? 'good' : 'warn'}
          />
          <SummaryMetricCard
            title="Active Viewport"
            primaryValue={VIEWPORT_WIDTHS[activeViewport]}
            subtitle={`${activeViewport} preview`}
            status="live"
          />
          <SummaryMetricCard
            title="Gate 3 QA Audit"
            primaryValue={gate3Certificate ? 'Certified' : 'Ready'}
            subtitle={isRunningQA ? 'Running MOD-06...' : 'Zero Horizontal Overflow'}
            status={gate3Certificate ? 'good' : 'neutral'}
          />
        </SummaryMetricGrid>
      </div>

      {/* Preview Stage */}
      <div className="flex-1 overflow-auto bg-slate-50/70 dark:bg-[#090B10] p-5 flex flex-col items-center">
        {activeViewport === 'android-device' ? (
          <div className="w-[360px] h-[640px] bg-slate-900 rounded-[40px] p-2.5 border-2 border-slate-700 flex flex-col overflow-hidden">
            <div className="h-5 w-full flex items-center justify-between px-5 text-white text-[10px] font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-[#111318] rounded-[30px] overflow-y-auto p-4 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-slate-800">
                  <span className="font-semibold text-xs">{displayName}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-medium">
                    Play Safe
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 text-center">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wider block">
                    Android Build
                  </span>
                  <h3 className="text-sm font-semibold mt-1">Active Order #PF-9482</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    In transit · ETA Today, 4:30 PM
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
                  <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-medium text-xs mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    <span>In-App Account Deletion</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    Route <code>/settings/delete-account</code> triggers cryptographic erasure.
                  </p>
                  <button className="w-full py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium">
                    Request Account Deletion
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <div className="w-24 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{ width: VIEWPORT_WIDTHS[activeViewport] }}
            className="min-h-[460px] bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 transition-all duration-200"
            dir={figcraftProject.tokens.direction}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 mb-5 font-mono">
              <span>Viewport: {VIEWPORT_WIDTHS[activeViewport]}</span>
              <span>{displayName} Staging</span>
            </div>

            <div className="space-y-4">
              {figcraftProject.rootComponents.map((comp) => (
                <div key={comp.id}>
                  {comp.type === 'hero' && (
                    <div className="text-center py-6 space-y-2.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        {comp.props.badgeText || 'High-Velocity Platform'}
                      </span>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {comp.props.headline || 'Your Headline Here'}
                      </h1>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        {comp.props.subheadline || 'Subheadline description for the application.'}
                      </p>
                      <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-xs">
                        {comp.props.ctaText || 'Get Started'}
                      </button>
                    </div>
                  )}

                  {comp.type === 'features' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { t: 'Fast Delivery', d: 'Real-time routing' },
                        { t: 'Android Suite', d: 'Data Safety CSV' },
                        { t: 'RLS Isolation', d: 'Postgres security' },
                      ].map((f) => (
                        <div
                          key={f.t}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800"
                        >
                          <h4 className="text-xs font-semibold">{f.t}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{f.d}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {comp.type === 'cookie-banner' && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                        DPDP India 2023 & EU GDPR consent active.
                      </span>
                      <button className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-medium text-[10px]">
                        Accept
                      </button>
                    </div>
                  )}

                  {comp.type === 'account-deletion' && (
                    <div className="p-3 rounded-lg bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs">
                      <div className="font-medium">Account Deletion (/settings/delete-account)</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {qaLogs.length > 0 && (
          <div className="w-full max-w-3xl mt-4 p-3 rounded-lg bg-white dark:bg-[#111318] border border-slate-200/80 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            {qaLogs.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Telemetry Strip */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0D1017] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-indigo-500" />
            Lighthouse
          </span>
          {[
            { label: 'Perf', score: liveTelemetryScores.performance },
            { label: 'A11y', score: liveTelemetryScores.accessibility },
            { label: 'BP', score: liveTelemetryScores.bestPractices },
            { label: 'SEO', score: liveTelemetryScores.seo },
          ].map((s) => (
            <span key={s.label} className="text-[11px] text-slate-600 dark:text-slate-300">
              {s.label}: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{s.score}</strong>
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Semgrep <strong className="font-mono">{liveTelemetryScores.semgrep}</strong>
          </span>
          <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
            Trivy <strong className="font-mono">{liveTelemetryScores.trivy}</strong>
          </span>
          <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
            Gitleaks <strong className="font-mono">{liveTelemetryScores.gitleaks}</strong>
          </span>
          {gate3Certificate && (
            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">
              Gate 3: {gate3Certificate.slice(0, 12)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
