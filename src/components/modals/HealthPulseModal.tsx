import React, { useState } from 'react';
import {
  X,
  Activity,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Server,
  CloudOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MICROSERVICE_CATALOG } from '../../services/api';

interface HealthPulseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthPulseModal: React.FC<HealthPulseModalProps> = ({ isOpen, onClose }) => {
  const {
    meshStatuses,
    systemHealthPercent,
    lastPulseCheckedAt,
    isPulseChecking,
    healthPulseLogs,
    lastVendorReadiness,
    triggerInternalHealthPulse,
    verifyVendorReadiness,
    clearHealthPulseLogs,
  } = useApp();

  const [isCheckingVendors, setIsCheckingVendors] = useState(false);

  if (!isOpen) return null;

  const catalogList = Object.values(MICROSERVICE_CATALOG);
  const healthyCount = catalogList.filter((svc) => meshStatuses[svc.id]).length;

  const handleCheckVendorsOnDemand = async () => {
    setIsCheckingVendors(true);
    try {
      await verifyVendorReadiness('On-Demand Readiness Audit');
    } finally {
      setIsCheckingVendors(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Two-Tier Health Pulse & Self-Healing Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tier 1 free internal mesh pulse (bounded max 3 retries via MOD-09) • Tier 2 vendor APIs verified strictly on project start
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Tier 1: Internal Microservice Mesh (Free Pulse) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Tier 1: Internal Microservice Mesh ({healthyCount}/{catalogList.length} Live • {systemHealthPercent}%)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {lastPulseCheckedAt && (
                  <span className="text-[11px] text-slate-400">
                    Checked {new Date(lastPulseCheckedAt).toLocaleTimeString()}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => void triggerInternalHealthPulse()}
                  disabled={isPulseChecking}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPulseChecking ? 'animate-spin' : ''}`} />
                  <span>{isPulseChecking ? 'Probing Mesh...' : 'Run Tier 1 Pulse'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {catalogList.map((svc) => {
                const isUp = Boolean(meshStatuses[svc.id]);
                return (
                  <div
                    key={svc.id}
                    className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                      isUp
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/25 border-emerald-200/70 dark:border-emerald-800/50 text-slate-800 dark:text-slate-200'
                        : 'bg-amber-50/50 dark:bg-amber-950/25 border-amber-200/70 dark:border-amber-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-mono font-semibold block truncate">{svc.id}</span>
                      <span className="text-[10px] text-slate-400 block">:{svc.port}</span>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isUp ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier 2: External Vendor APIs (Zero Idle Polling) */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CloudOff className="w-4 h-4 text-emerald-500" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Tier 2: External Vendor APIs — Zero Idle Polling Active
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Canva, Meta WhatsApp, LLM Gateways & Stripe are never polled on background timers to save API costs.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckVendorsOnDemand}
                disabled={isCheckingVendors}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isCheckingVendors ? 'Verifying...' : 'Run Project-Start Check'}</span>
              </button>
            </div>

            {lastVendorReadiness ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {lastVendorReadiness.vendors.map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 rounded-lg bg-white dark:bg-[#111318] border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">
                        {v.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">{v.detail}</span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                External APIs: Checked on Project Start (no idle background requests executed).
              </p>
            )}
          </div>

          {/* Bounded Self-Healing Logs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Bounded Self-Healing Retry Logs ({healthPulseLogs.length})
              </h3>
              {healthPulseLogs.length > 0 && (
                <button
                  type="button"
                  onClick={clearHealthPulseLogs}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Logs</span>
                </button>
              )}
            </div>

            {healthPulseLogs.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                All probed internal services responded cleanly on first check — zero self-healing retries required.
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {healthPulseLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {log.status === 'RECOVERED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {log.serviceName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            :{log.port} • Attempt {log.attempt}/3
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {log.message}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded ${
                          log.status === 'RECOVERED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
