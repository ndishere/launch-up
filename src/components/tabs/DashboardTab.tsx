import React, { useState } from 'react';
import { 
  Users, FolderKanban, Rocket, DollarSign, Activity, Plus, 
  ArrowUpRight, ArrowDownRight, AlertTriangle, AlertCircle, 
  Info, CheckCircle2, Eye, MoreVertical, ChevronRight, ChevronDown,
  Bot, Sparkles, Cpu, Radio, Network, Megaphone
} from 'lucide-react';
import { useApp, PALETTE_DEFINITIONS } from '../../context/AppContext';
import { Client } from '../../types';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { HealthPulseModal } from '../modals/HealthPulseModal';

export const DashboardTab: React.FC = () => {
  const { 
    clients, 
    projects, 
    alerts, 
    agents,
    slms,
    intakes,
    telemetryPackages,
    palette,
    setCurrentTab, 
    setIsAddClientModalOpen,
    setActiveCanvasProjectId,
    setSelectedClient,
    triggerDeployment,
    createManualBackup,
    meshStatuses,
    systemHealthPercent,
    healthPulseLogs,
  } = useApp();

  const currentPal = PALETTE_DEFINITIONS[palette] || PALETTE_DEFINITIONS.indigo;
  const chartColors = currentPal.chart;

  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('30D');
  const [trafficFilter, setTrafficFilter] = useState('Last 30 Days');
  const [isHealthPulseOpen, setIsHealthPulseOpen] = useState(false);

  const activeClientsCount = clients.filter((c) => c.status === 'Active').length;
  const clientRetentionPct = clients.length > 0 ? Math.round((activeClientsCount / clients.length) * 100) : 100;
  const liveProjectsCount = projects.filter((p) => p.status === 'Live').length;
  const inProgressProjectsCount = projects.filter((p) => p.status === 'In Progress').length;
  const activeProjectsCount = liveProjectsCount + inProgressProjectsCount;
  const pendingProjectsCount = projects.filter((p) => p.status === 'Pending').length;
  const healthyMeshCount = Object.values(meshStatuses).filter(Boolean).length;
  const totalMeshCount = Math.max(Object.keys(meshStatuses).length, 10);
  const recoveredCount = healthPulseLogs.filter((l) => l.status === 'RECOVERED').length;
  const pulseStatusTone =
    systemHealthPercent >= 80 ? 'good' : systemHealthPercent > 0 ? 'warn' : 'bad';

  // Specific recent clients matching screenshot
  const recentClients = [
    {
      clientName: 'Acme Co.',
      domain: 'acme.co',
      initial: 'A',
      project: 'Marketing Website',
      status: 'Live',
      deployed: 'May 30, 2024',
      health: '100%',
    },
    {
      clientName: 'TechFlow',
      domain: 'techflow.io',
      initial: 'T',
      project: 'CRM Platform',
      status: 'Live',
      deployed: 'May 28, 2024',
      health: '99.8%',
    },
    {
      clientName: 'GrowthLabs',
      domain: 'growthlabs.ai',
      initial: 'G',
      project: 'Landing Page',
      status: 'In Progress',
      deployed: '—',
      health: '—',
    },
    {
      clientName: 'Visionary Inc.',
      domain: 'visionary.com',
      initial: 'V',
      project: 'E-commerce Site',
      status: 'Live',
      deployed: 'May 25, 2024',
      health: '100%',
    },
    {
      clientName: 'BrandBoost',
      domain: 'brandboost.io',
      initial: 'B',
      project: 'Marketing Website',
      status: 'Pending',
      deployed: '—',
      health: '—',
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor clients, active projects, and live pipeline health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="add-client-dashboard-btn"
            onClick={() => setIsAddClientModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Standardized 5-Cell Summary Bar */}
      <SummaryMetricGrid>
        <SummaryMetricCard
          title="Total Clients"
          primaryValue={clients.length}
          subtitle="+12% growth this month"
          status="good"
        />
        <SummaryMetricCard
          title="Active Clients"
          primaryValue={activeClientsCount}
          subtitle={`${clientRetentionPct}% active retention`}
          status="good"
        />
        <SummaryMetricCard
          title="Total Projects"
          primaryValue={projects.length}
          subtitle={`${pendingProjectsCount} queued in pipeline`}
          status="live"
        />
        <SummaryMetricCard
          title="Active Projects"
          primaryValue={activeProjectsCount}
          subtitle={`${liveProjectsCount} Live • ${inProgressProjectsCount} Building`}
          status="live"
        />
        <SummaryMetricCard
          id="dashboard-pulse-health-card"
          title="System & Pulse Health"
          primaryValue={`${systemHealthPercent}% Healthy`}
          subtitle={
            recoveredCount > 0
              ? `${healthyMeshCount}/${totalMeshCount} Mesh • ${recoveredCount} Self-Healed`
              : `${healthyMeshCount}/${totalMeshCount} Mesh • Max 3x Heal`
          }
          secondaryCaption="External APIs: Checked on Project Start"
          status={pulseStatusTone}
          onClick={() => setIsHealthPulseOpen(true)}
        />
      </SummaryMetricGrid>

      <HealthPulseModal
        isOpen={isHealthPulseOpen}
        onClose={() => setIsHealthPulseOpen(false)}
      />

      {/* Middle Row: Projects Overview (Stacked Area Chart) + Deployment Status (Donut) + System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Projects Overview - Stacked Area Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Projects Overview
              </h2>

              {/* Time Range Selector */}
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900/80 rounded-lg text-xs font-medium border border-slate-200/60 dark:border-slate-800">
                {(['7D', '30D', '90D'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      timeRange === r
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 mb-6">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors.primary }} />
                <span>Live</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors.secondary }} />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors.tertiary }} />
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>On Hold</span>
              </div>
            </div>

            {/* Stacked Area Chart Container */}
            <div className="relative h-56 w-full">
              {/* Y-Axis labels */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[11px] text-slate-400 select-none">
                <span>80</span>
                <span>60</span>
                <span>40</span>
                <span>20</span>
                <span>0</span>
              </div>

              {/* Chart SVG */}
              <div className="ml-7 h-full flex flex-col justify-between">
                <svg className="w-full h-48 overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaLive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.primary} stopOpacity="0.45" />
                      <stop offset="100%" stopColor={chartColors.primary} stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="areaProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.secondary} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={chartColors.secondary} stopOpacity="0.01" />
                    </linearGradient>
                    <linearGradient id="areaPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.tertiary} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={chartColors.tertiary} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="0" x2="500" y2="0" stroke="currentColor" className="text-slate-100 dark:text-slate-800/80" strokeDasharray="3 3" />
                  <line x1="0" y1="45" x2="500" y2="45" stroke="currentColor" className="text-slate-100 dark:text-slate-800/80" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="currentColor" className="text-slate-100 dark:text-slate-800/80" strokeDasharray="3 3" />
                  <line x1="0" y1="135" x2="500" y2="135" stroke="currentColor" className="text-slate-100 dark:text-slate-800/80" strokeDasharray="3 3" />
                  <line x1="0" y1="180" x2="500" y2="180" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />

                  {/* Stacked Area: Live top layer */}
                  <path
                    d="M 0 130 C 70 120, 120 95, 170 85 C 220 75, 270 90, 330 70 C 390 50, 440 40, 500 25 L 500 180 L 0 180 Z"
                    fill="url(#areaLive)"
                  />
                  <path
                    d="M 0 130 C 70 120, 120 95, 170 85 C 220 75, 270 90, 330 70 C 390 50, 440 40, 500 25"
                    fill="none"
                    stroke={chartColors.primary}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Layer 2: In Progress */}
                  <path
                    d="M 0 148 C 80 142, 130 125, 180 118 C 240 110, 290 120, 340 105 C 400 90, 450 78, 500 68 L 500 180 L 0 180 Z"
                    fill="url(#areaProgress)"
                  />
                  <path
                    d="M 0 148 C 80 142, 130 125, 180 118 C 240 110, 290 120, 340 105 C 400 90, 450 78, 500 68"
                    fill="none"
                    stroke={chartColors.secondary}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Layer 3: Pending */}
                  <path
                    d="M 0 165 C 90 162, 140 152, 190 148 C 250 144, 300 150, 350 140 C 410 130, 460 125, 500 115 L 500 180 L 0 180 Z"
                    fill="url(#areaPending)"
                  />
                  <path
                    d="M 0 165 C 90 162, 140 152, 190 148 C 250 144, 300 150, 350 140 C 410 130, 460 125, 500 115"
                    fill="none"
                    stroke={chartColors.tertiary}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>

                {/* X-Axis dates */}
                <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>May 6</span>
                  <span>May 13</span>
                  <span>May 20</span>
                  <span>May 27</span>
                  <span>Jun 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deployment Status - Donut Chart (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Deployment Status
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-md inline-flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/60 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                100% Passing
              </span>
            </div>

            {/* Donut Chart - Centered & Responsive */}
            <div className="py-2">
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    fill="transparent" 
                    stroke="currentColor" 
                    className="text-slate-100 dark:text-slate-800" 
                    strokeWidth="11" 
                  />
                  
                  {/* Segment: Live (55% = 44/80) -> strokeDasharray="131.3 107.5" offset 0 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke={chartColors.primary}
                    strokeWidth="11"
                    strokeDasharray="131.3 107.5"
                    strokeDashoffset="0"
                  />
                  {/* Segment: In Progress (30% = 24/80) -> 71.6 167.2 offset -131.3 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke={chartColors.secondary}
                    strokeWidth="11"
                    strokeDasharray="71.6 167.2"
                    strokeDashoffset="-131.3"
                  />
                  {/* Segment: Pending (15% = 12/80) -> 35.8 203 offset -202.9 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke={chartColors.tertiary}
                    strokeWidth="11"
                    strokeDasharray="35.8 203"
                    strokeDashoffset="-202.9"
                  />
                </svg>

                {/* Inner Donut Text: 80 Total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                    80
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium mt-1">
                    Total
                  </span>
                </div>
              </div>

              {/* Legend - Full width, pristine alignment, zero wrapping */}
              <div className="space-y-2 text-xs w-full mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: chartColors.primary }} />
                    <span className="text-slate-600 dark:text-slate-300 whitespace-nowrap">Live</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">44</span>
                    <span className="text-[11px] text-slate-400 tabular-nums">(55%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: chartColors.secondary }} />
                    <span className="text-slate-600 dark:text-slate-300 whitespace-nowrap">In Progress</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">24</span>
                    <span className="text-[11px] text-slate-400 tabular-nums">(30%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: chartColors.tertiary }} />
                    <span className="text-slate-600 dark:text-slate-300 whitespace-nowrap">Pending</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">12</span>
                    <span className="text-[11px] text-slate-400 tabular-nums">(15%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300 whitespace-nowrap">Failed</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">0</span>
                    <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium tabular-nums">(0% · Clean)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('deployments')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800"
          >
            <span>View All Deployments</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* System Alerts (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                System Alerts
              </h2>
              <button
                onClick={() => setCurrentTab('alerts')}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All
              </button>
            </div>

            {/* Alert List items matching screenshot */}
            <div className="space-y-4">
              {/* Alert 1 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Deployment Succeeded
                    </p>
                    <span className="text-[10px] text-slate-400">Just now</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    TechFlow CRM v2.8.2 deployed & verified healthy
                  </p>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      High Response Time
                    </p>
                    <span className="text-[10px] text-slate-400">15m ago</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    GrowthLabs website response time is above 2s
                  </p>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      SSL Certificate Expiring
                    </p>
                    <span className="text-[10px] text-slate-400">1h ago</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Acme Co. SSL certificate expires in 7 days
                  </p>
                </div>
              </div>

              {/* Alert 4 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Backup Completed
                    </p>
                    <span className="text-[10px] text-slate-400">2h ago</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Daily backup completed successfully
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Clients Table (8 cols) + Traffic Overview (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Clients Table */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Clients
              </h2>
              <button
                onClick={() => setCurrentTab('clients')}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View All Clients</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-1">Client</th>
                    <th className="pb-3">Project</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Deployed</th>
                    <th className="pb-3">Health</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {recentClients.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Client info */}
                      <td className="py-3.5 pl-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                            {item.initial}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                              {item.clientName}
                            </p>
                            <p className="text-[11px] text-slate-400 leading-tight">
                              {item.domain}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Project */}
                      <td className="py-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {item.project}
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                            item.status === 'Live'
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                              : item.status === 'In Progress'
                              ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Deployed */}
                      <td className="py-3.5 text-slate-500 dark:text-slate-400">
                        {item.deployed}
                      </td>

                      {/* Health */}
                      <td className="py-3.5">
                        {item.health !== '—' ? (
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{item.health}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right pr-2">
                        <div className="inline-flex items-center gap-1.5 text-slate-400">
                          <button
                            onClick={() => {
                              const found = clients.find(c => c.name === item.clientName);
                              if (found) setSelectedClient(found);
                              setCurrentTab('clients');
                            }}
                            className="p-1.5 rounded-md hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Client Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCurrentTab('projects')}
                            className="p-1.5 rounded-md hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Traffic Overview */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Traffic Overview
              </h2>

              <div className="relative">
                <button className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <span>{trafficFilter}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Total Visitors Big Number */}
            <div className="mb-4">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Total Visitors
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  23,456
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ↑ 18.6%
                </span>
              </div>
            </div>

            {/* Spline Area Line Chart */}
            <div className="relative h-28 w-full my-2">
              <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-[10px] text-slate-400">
                <span>15K</span>
                <span>10K</span>
                <span>5K</span>
                <span>0</span>
              </div>
              <div className="ml-7 h-full flex flex-col justify-between">
                <svg className="w-full h-20 overflow-visible" viewBox="0 0 300 70" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.traffic} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={chartColors.traffic} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 55 C 30 50, 45 35, 75 38 C 105 42, 130 15, 160 22 C 190 28, 220 50, 250 40 C 275 32, 290 10, 300 15 L 300 70 L 0 70 Z"
                    fill="url(#trafficGrad)"
                  />
                  <path
                    d="M 0 55 C 30 50, 45 35, 75 38 C 105 42, 130 15, 160 22 C 190 28, 220 50, 250 40 C 275 32, 290 10, 300 15"
                    fill="none"
                    stroke={chartColors.traffic}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                {/* X-axis dates */}
                <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>May 6</span>
                  <span>May 13</span>
                  <span>May 20</span>
                  <span>May 27</span>
                  <span>Jun 3</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 stats matching screenshot bottom */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-left">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Page Views</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">56,789</p>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">↑ 16.4%</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Unique Visitors</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">23,456</p>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">↑ 18.6%</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Bounce Rate</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">32.4%</p>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">↓ 4.3%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
