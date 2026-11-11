import React, { useState } from 'react';
import {
  Plus,
  Wifi,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Pencil,
  Trash2,
  Bot,
  KeyRound,
  Cpu,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  API_PROVIDER_PRESETS,
  SWARM_AGENT_ROLE_METADATA,
  calculateBlendedCostPer1MTokens,
  maskApiKey,
} from '../../lib/custom-api-gateway';
import type { CustomApiProviderConfig } from '../../types';
import { CustomApiSetupModal } from './CustomApiSetupModal';

interface CustomApiGatewayPanelProps {
  title?: string;
  subtitle?: string;
  showAssignmentMatrix?: boolean;
}

export const CustomApiGatewayPanel: React.FC<CustomApiGatewayPanelProps> = ({
  title = 'Custom AI & External API Gateway Manager',
  subtitle = 'Configure OpenRouter, OpenAI, Anthropic, Gemini, Groq, Ollama, or any Custom Base URL with live MOD-10 verification.',
  showAssignmentMatrix = true,
}) => {
  const {
    customApiProviders,
    agentModelAssignments,
    addCustomApiProvider,
    updateCustomApiProvider,
    removeCustomApiProvider,
    testCustomApiProvider,
    setAgentModelAssignment,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<CustomApiProviderConfig | null>(null);
  const [testingIds, setTestingIds] = useState<Record<string, boolean>>({});
  const [testingAll, setTestingAll] = useState(false);

  const connectedCount = customApiProviders.filter((p) => p.status === 'CONNECTED').length;
  const blendedRate = calculateBlendedCostPer1MTokens(customApiProviders, agentModelAssignments);

  const handleOpenAdd = () => {
    setEditingProvider(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: CustomApiProviderConfig) => {
    setEditingProvider(item);
    setModalOpen(true);
  };

  const handleSaveModal = (
    payload: Omit<CustomApiProviderConfig, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      updateCustomApiProvider(existingId, payload);
    } else {
      addCustomApiProvider(payload);
    }
  };

  const handleTestCard = async (id: string) => {
    setTestingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await testCustomApiProvider(id);
    } finally {
      setTestingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleTestAll = async () => {
    setTestingAll(true);
    try {
      await Promise.all(customApiProviders.map((item) => handleTestCard(item.id)));
    } finally {
      setTestingAll(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-indigo-500" />
              <span>{title}</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              {connectedCount}/{customApiProviders.length} Connected
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Blended Swarm Rate: ${blendedRate.toFixed(2)}/1M
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {customApiProviders.length > 0 && (
            <button
              type="button"
              onClick={handleTestAll}
              disabled={testingAll}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingAll ? 'animate-spin text-indigo-500' : ''}`} />
              <span>{testingAll ? 'Testing All...' : 'Test All'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom API</span>
          </button>
        </div>
      </div>

      {/* Saved API Provider Cards */}
      {customApiProviders.length === 0 ? (
        <div className="bg-white dark:bg-[#111318] rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No custom AI or API endpoints configured yet. Click &ldquo;Add Custom API&rdquo; to register OpenRouter, OpenAI, Anthropic, Gemini, Groq, Ollama, or any custom endpoint.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customApiProviders.map((item) => {
            const presetLabel = API_PROVIDER_PRESETS[item.provider]?.label ?? item.provider;
            const isTesting = Boolean(testingIds[item.id]);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {presetLabel}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit API provider"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomApiProvider(item.id)}
                        title="Delete API provider"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Live Status Badge */}
                  <div>
                    {isTesting ? (
                      <div className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 inline-flex items-center gap-1.5 w-full">
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>Pinging endpoint...</span>
                      </div>
                    ) : item.status === 'CONNECTED' ? (
                      <div className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1.5 w-full">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          Connected • {item.latencyMs ?? 0}ms • Model Verified
                        </span>
                      </div>
                    ) : item.status === 'FAILED' ? (
                      <div
                        title={item.lastMessage}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 inline-flex items-center gap-1.5 w-full"
                      >
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          Connection Failed • {item.lastMessage || 'Unauthorized or Unreachable'}
                        </span>
                      </div>
                    ) : (
                      <div className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 inline-flex items-center gap-1.5 w-full">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Unverified • Click Test to Verify</span>
                      </div>
                    )}
                  </div>

                  {/* Endpoint & Model Details */}
                  <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-slate-400 shrink-0">
                        <Cpu className="w-3 h-3" />
                        Model:
                      </span>
                      <code className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.verifiedModel || item.defaultModelId}
                      </code>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-slate-400 shrink-0">
                        <KeyRound className="w-3 h-3" />
                        Key:
                      </span>
                      <code className="font-mono text-slate-700 dark:text-slate-300 truncate">
                        {maskApiKey(item.apiKey)}
                      </code>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-slate-400 shrink-0">
                        <DollarSign className="w-3 h-3" />
                        Rate / 1M:
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        ${item.costPer1MInputUsd.toFixed(2)} in / ${item.costPer1MOutputUsd.toFixed(2)} out
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {item.baseUrl}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Timestamp + Test Connection Button */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 truncate">
                    {item.lastTestedAt
                      ? `Tested ${new Date(item.lastTestedAt).toLocaleTimeString()}`
                      : 'Not tested yet'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTestCard(item.id)}
                    disabled={isTesting}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 disabled:opacity-50 inline-flex items-center gap-1 transition-colors shrink-0"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Pinging...</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3 h-3" />
                        <span>Test Connection</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Per-Agent Model Assignment Matrix */}
      {showAssignmentMatrix && (
        <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-500" />
                <span>Per-Agent Swarm Model Assignment Matrix</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Assign any saved API connection to each hierarchical swarm role. Pre-flight verification runs automatically on build start.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-center">
              6 Swarm Roles Mapped
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SWARM_AGENT_ROLE_METADATA.map((roleMeta) => {
              const assignedId = agentModelAssignments[roleMeta.roleKey] || '';
              const assignedProvider = customApiProviders.find((p) => p.id === assignedId);

              return (
                <div
                  key={roleMeta.roleKey}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {roleMeta.label}
                      </div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {roleMeta.agentName}
                      </div>
                    </div>

                    {assignedProvider && (
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
                          assignedProvider.status === 'CONNECTED'
                            ? 'bg-emerald-500'
                            : assignedProvider.status === 'FAILED'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                        title={`Gateway status: ${assignedProvider.status}`}
                      />
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                    {roleMeta.description}
                  </p>

                  <select
                    value={assignedId}
                    onChange={(e) => setAgentModelAssignment(roleMeta.roleKey, e.target.value)}
                    aria-label={`Assign API connection for ${roleMeta.label}`}
                    className="w-full px-2.5 py-1.5 text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Default Built-In Model Routing</option>
                    {customApiProviders.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.name} ({prov.defaultModelId}) — {prov.status}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <CustomApiSetupModal
        isOpen={modalOpen}
        editingProvider={editingProvider}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  );
};
