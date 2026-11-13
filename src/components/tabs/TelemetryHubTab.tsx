import React, { useState } from 'react';
import { 
  Radio, RefreshCw, Terminal, CheckCircle2, AlertTriangle, 
  RotateCcw, ShieldCheck, Cpu, ArrowUpRight, Copy, Check,
  Activity, Play, HardDrive, Box, Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RemoteTelemetryPackage } from '../../types';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { ExpandableRightDetailPanel, ExpandableDetailToggleButton } from '../common/ExpandableRightDetailPanel';
import { StandardContextInspector } from '../common/StandardContextInspector';

export const TelemetryHubTab: React.FC = () => {
  const { telemetryPackages, triggerAutoUpdate, setCurrentTab } = useApp();

  const [selectedPkg, setSelectedPkg] = useState<RemoteTelemetryPackage>(telemetryPackages[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [approvedUpdateIds, setApprovedUpdateIds] = useState<Set<string>>(new Set());

  const sdkInstallCode = `// 1. Install Launch Up Modern Telemetry SDK in client app
npm install @launchup/telemetry-agent

// 2. Initialize in your React/Node application entry point
import { initLaunchUpWatcher } from '@launchup/telemetry-agent';

initLaunchUpWatcher({
  appId: "${selectedPkg.id}",
  package: "${selectedPkg.packageName}",
  client: "${selectedPkg.clientName}",
  autoUpdate: true, // Enables zero-downtime hot-patching from Launch Up
  endpoint: "https://app.launchup.io/api/telemetry/v1/stream"
});`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sdkInstallCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-4 pb-0.5">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Realtime Telemetry & Auto-Updates</span>
        </span>

        <div className="flex items-center gap-2.5 ml-auto">
          <button
            onClick={() => {
              triggerAutoUpdate(selectedPkg.id);
              setApprovedUpdateIds((prev) => new Set(prev).add(selectedPkg.id));
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Trigger Hotfix Auto-Update</span>
          </button>

          <ExpandableDetailToggleButton
            isOpen={isSidePanelOpen}
            onToggle={() => setIsSidePanelOpen((prev) => !prev)}
          />
        </div>
      </div>

      {/* Row 1: Unified 5-Cell Horizontal Summary Bar */}
      <SummaryMetricGrid>
        <SummaryMetricCard
          title="Connected Packages"
          primaryValue={`${telemetryPackages.length} Live`}
          subtitle="Bi-directional WebSockets"
          status="good"
        />
        <SummaryMetricCard
          title="Live Success Rate"
          primaryValue="99.96%"
          subtitle="Zero dropped heartbeats"
          status="live"
        />
        <SummaryMetricCard
          title="Avg Error Rate"
          primaryValue="0.04%"
          subtitle="Below 0.1% alert ceiling"
          status="good"
        />
        <SummaryMetricCard
          title="P99 Edge Latency"
          primaryValue="14.2ms"
          subtitle="Global CDN Telemetry"
          status="good"
        />
        <SummaryMetricCard
          title="Auto-Update SLA"
          primaryValue="100% In Sync"
          subtitle="Canary Shift Guard"
          status="good"
        />
      </SummaryMetricGrid>

      {/* Row 2: 2-Column Section */}
      <div className="flex flex-col lg:flex-row items-start gap-5 w-full min-w-0">
        {/* Column 1: Main Content Area */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {/* Monitored Software Packages List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Monitored Software Packages ({telemetryPackages.length})
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">Live WebSocket Feed</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {telemetryPackages.map((pkg) => {
                const isSelected = selectedPkg.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPkg(pkg);
                      setIsSidePanelOpen(true);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-[#111318] ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                          {pkg.packageName}
                        </h3>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{pkg.clientName}</p>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          pkg.autoUpdateStatus === 'In Sync'
                            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                            : pkg.autoUpdateStatus === 'Deploying Update'
                            ? 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400'
                            : 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {pkg.autoUpdateStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Active Version</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{pkg.installedVersion}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Latest Available</span>
                        <span className="text-indigo-500 font-semibold">{pkg.latestVersionAvailable}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Error Rate</span>
                        <span className="text-emerald-500 font-bold">{pkg.errorRateLastHour}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Active Users</span>
                        <span className="text-purple-400 font-bold">{pkg.activeUsers.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">Heartbeat: {pkg.lastLogTimestamp}</span>
                      {pkg.installedVersion !== pkg.latestVersionAvailable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerAutoUpdate(pkg.id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Push {pkg.latestVersionAvailable}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Terminal Stream & Auto-Update Controller */}
          <div className="bg-white dark:bg-[#111318] rounded-xl p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                    Live Telemetry Stream: {selectedPkg.packageName}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Client Node: {selectedPkg.clientName} · P99 Latency: {selectedPkg.p99LatencyMs}ms
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-500 font-bold">
                WebSocket Connected
              </span>
            </div>

            {/* Terminal Window */}
            <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] min-h-[180px] max-h-[260px] overflow-y-auto leading-relaxed border border-slate-800 shadow-inner space-y-2">
              <div className="text-slate-500 text-[10px] pb-1 border-b border-slate-900 flex justify-between">
                <span>[STDOUT / STDERR REALTIME FEED]</span>
                <span>AGENT WATCHDOG: ACTIVE</span>
              </div>
              {selectedPkg.recentLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`px-1 rounded text-[10px] font-bold shrink-0 ${
                      log.level === 'INFO'
                        ? 'bg-blue-950 text-blue-400'
                        : log.level === 'WARN'
                        ? 'bg-amber-950 text-amber-400'
                        : log.level === 'METRIC'
                        ? 'bg-purple-950 text-purple-400'
                        : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    {log.level}
                  </span>
                  <div className="flex-1">
                    <span className="text-slate-400 mr-1.5 font-semibold">[{log.source}]:</span>
                    <span className="text-slate-200">{log.message}</span>
                    {log.autoTriggeredAction && (
                      <div className="mt-1 text-emerald-400 text-[10px] bg-emerald-950/40 p-1.5 rounded border border-emerald-900/60">
                        ⚡ <strong>AUTONOMOUS SENTINEL INTERVENTION:</strong> {log.autoTriggeredAction}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* SDK Code Snippet */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Client Package Integration SDK
                </span>
                <button
                  onClick={copyToClipboard}
                  className="text-[11px] text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy SDK Snippet'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[10px] overflow-x-auto border border-slate-800">
                {sdkInstallCode}
              </pre>
            </div>
          </div>
        </div>

        {/* Column 2: Expandable Right Detail Panel */}
        <ExpandableRightDetailPanel
          isOpen={isSidePanelOpen}
          onToggle={() => setIsSidePanelOpen((prev) => !prev)}
          title={selectedPkg.packageName}
          subtitle={`${selectedPkg.clientName} · ${selectedPkg.autoUpdateStatus}`}
        >
          <StandardContextInspector
            title={selectedPkg.packageName}
            subtitle={`Client: ${selectedPkg.clientName} · Version: ${selectedPkg.installedVersion}`}
            badge={selectedPkg.autoUpdateStatus}
            badgeTone={selectedPkg.autoUpdateStatus === 'In Sync' ? 'live' : 'warn'}
            overview={{
              statusSummary: `Latest: ${selectedPkg.latestVersionAvailable} · Error Rate: ${selectedPkg.errorRateLastHour}% · P99 Latency: ${selectedPkg.p99LatencyMs}ms · Active Users: ${selectedPkg.activeUsers.toLocaleString()}`,
              details: `Last Heartbeat: ${selectedPkg.lastLogTimestamp}. Bi-directional WebSocket telemetry streaming stdout/stderr without log loss.`,
              domainOrUrl: selectedPkg.packageName,
              previewUrl: 'http://localhost:3000',
              previewThumbnailLabel: 'Device Previewer (375px)',
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
              baseReusedPercent: 94,
              compressionActive: true,
              estimatedAiCost: '₹3 / $0.03',
              profitMarginPercent: 99.7,
              monthlyRevenue: '$2,500/mo',
              dockerBranchesStatus: 'Canary Shift Zero-Downtime Ready',
              localFolderPath: 'd:/Projects/launch-up',
              portabilityNote: 'Bi-directional WebSockets + Local Fallback',
            }}
            approvalBar={{
              decisionStatus: approvedUpdateIds.has(selectedPkg.id) || selectedPkg.autoUpdateStatus === 'In Sync' ? 'APPROVED' : 'PENDING',
              approveLabel: approvedUpdateIds.has(selectedPkg.id) || selectedPkg.autoUpdateStatus === 'In Sync'
                ? 'Package In Sync (Gate 5)'
                : 'Push Autonomous Update Now',
              onApprove: () => {
                triggerAutoUpdate(selectedPkg.id);
                setApprovedUpdateIds((prev) => new Set(prev).add(selectedPkg.id));
              },
            }}
          />
        </ExpandableRightDetailPanel>
      </div>
    </div>
  );
};
