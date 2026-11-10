import React, { useState } from 'react';
import { 
  Network, Server, Activity, Cpu, ShieldCheck, 
  RefreshCw, CheckCircle2, ArrowRight, Layers, Database,
  Terminal, HardDrive, Box, Code, Sparkles, ExternalLink, Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FDESystemArchitecture } from '../../types';
import { ScreenAnalyticsHeader } from '../common/ScreenAnalyticsHeader';

export const FDESystemsTab: React.FC = () => {
  const { fdeSystems, deployFDESystem, clients, setCurrentTab } = useApp();

  const [showDeployModal, setShowDeployModal] = useState(false);
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState(clients[0]?.name || 'Acme Co.');
  const [pattern, setPattern] = useState<any>('Event Sourcing + CQRS');
  const [dbTech, setDbTech] = useState('PostgreSQL 16 + Redis Cluster');
  const [frontendStack, setFrontendStack] = useState('Next.js 14 App Router + Tailwind');
  const [backendRuntime, setBackendRuntime] = useState('Node.js 22 LTS / Docker / TypeScript');
  const [throughputRps, setThroughputRps] = useState(10000);

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    deployFDESystem({
      name,
      clientName,
      pattern,
      dbTechnology: dbTech,
      frontendStack,
      backendRuntime,
      throughputRps,
      uptimeSla: '99.99%',
      activePipelines: 8,
    });

    setShowDeployModal(false);
    setName('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Combined Analytics Section with Live Success/Error Rates */}
      <ScreenAnalyticsHeader
        title="Services & Online Systems Management"
        badge="FDE Online Management Mesh"
        description="High-throughput client services built and managed by Launch Up. Event sourcing, CQRS schemas, WhatsApp automation connectors, and zero-downtime microservices sync."
        metrics={[
          {
            label: 'Total Active Services',
            value: fdeSystems.length,
            subValue: 'Across client tenancies',
            status: 'good',
          },
          {
            label: 'Live Success Rate',
            value: '99.98%',
            subValue: 'Zero dropped requests',
            status: 'live',
          },
          {
            label: 'Live Error Rate',
            value: '0.02%',
            subValue: 'Automated recovery active',
            status: 'good',
          },
          {
            label: 'Peak Throughput',
            value: '24,800 rps',
            subValue: 'Sub-10ms response',
            status: 'good',
          },
          {
            label: 'SLA Guarantee',
            value: '99.995%',
            subValue: 'Canary failover mesh',
            status: 'good',
          },
        ]}
        actions={
          <button
            onClick={() => setShowDeployModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Synthesize New Service</span>
          </button>
        }
      />

      {/* FDE Systems Bento Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
          Synthesized Online Management Architectures
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {fdeSystems.map((sys) => (
            <div
              key={sys.id}
              className="bg-white dark:bg-[#111622] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between space-y-4 hover:border-cyan-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {sys.name}
                    </h3>
                    <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">{sys.clientName}</p>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {sys.status}
                  </span>
                </div>

                <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs font-mono mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Architecture:</span>
                    <span className="font-bold text-indigo-500">{sys.pattern}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Database Layer:</span>
                    <span className="text-slate-700 dark:text-slate-200">{sys.dbTechnology}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Runtime:</span>
                    <span className="text-slate-700 dark:text-slate-200">{sys.backendRuntime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Max Throughput:</span>
                    <span className="text-emerald-500 font-bold">{sys.throughputRps.toLocaleString()} rps</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">SLA Commitment:</span>
                    <span className="text-purple-400 font-bold">{sys.uptimeSla}</span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/50 text-[11px] text-cyan-800 dark:text-cyan-300">
                  ⚡ <strong>FDE Architect Check:</strong> {sys.lastArchitectureAudit}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  {sys.activePipelines} Live Endpoints
                </span>
                <button
                  onClick={() => setCurrentTab('telemetry-hub')}
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Inspect Telemetry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Synthesis Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111622] rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-cyan-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Synthesize Custom FDE Online System
                </h3>
              </div>
              <button
                onClick={() => setShowDeployModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeploy} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  System Architecture Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Multi-Tenant Order Gateway"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Client Organization
                  </label>
                  <select
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="Apex Logistics">Apex Logistics</option>
                    <option value="Solaria Health">Solaria Health</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    FDE Architectural Pattern
                  </label>
                  <select
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Event Sourcing + CQRS">Event Sourcing + CQRS</option>
                    <option value="Realtime WebSocket Engine">Realtime WebSocket Engine</option>
                    <option value="Zero-Trust Secure Enclave">Zero-Trust Secure Enclave</option>
                    <option value="Edge Streaming Mesh">Edge Streaming Mesh</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Database Stack
                  </label>
                  <input
                    type="text"
                    value={dbTech}
                    onChange={(e) => setDbTech(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Backend Runtime
                  </label>
                  <input
                    type="text"
                    value={backendRuntime}
                    onChange={(e) => setBackendRuntime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Throughput Capacity (RPS)
                </label>
                <input
                  type="number"
                  value={throughputRps}
                  onChange={(e) => setThroughputRps(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-[11px] text-cyan-800 dark:text-cyan-300">
                🚀 <strong>FDE Automation Guarantee:</strong> Our forward-deployed autonomous agent generates standard database migration scripts, Docker multi-stage profiles, and CI/CD pipelines compliant with NIST encryption standards.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Deploy FDE Architecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
