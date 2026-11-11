import React, { useEffect, useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wifi,
  Save,
  KeyRound,
  Globe,
  Cpu,
  DollarSign,
} from 'lucide-react';
import {
  API_PROVIDER_PRESETS,
  parseCustomHeadersJson,
} from '../../lib/custom-api-gateway';
import { verifyApiConnection } from '../../services/api';
import type {
  ApiConnectionStatus,
  CustomApiProviderConfig,
  CustomApiProviderType,
} from '../../types';

interface CustomApiSetupModalProps {
  isOpen: boolean;
  editingProvider: CustomApiProviderConfig | null;
  onClose: () => void;
  onSave: (payload: Omit<CustomApiProviderConfig, 'id' | 'createdAt'>, existingId?: string) => void;
}

const PRESET_ORDER: CustomApiProviderType[] = [
  'openrouter',
  'openai',
  'anthropic',
  'gemini',
  'groq',
  'ollama',
  'ik_llama_cpp',
  'airllm',
  'lmstudio',
  'custom',
];

export const CustomApiSetupModal: React.FC<CustomApiSetupModalProps> = ({
  isOpen,
  editingProvider,
  onClose,
  onSave,
}) => {
  const [provider, setProvider] = useState<CustomApiProviderType>('openrouter');
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [defaultModelId, setDefaultModelId] = useState('');
  const [costPer1MInputUsd, setCostPer1MInputUsd] = useState('3.00');
  const [costPer1MOutputUsd, setCostPer1MOutputUsd] = useState('15.00');
  const [customHeadersText, setCustomHeadersText] = useState('');
  const [headersError, setHeadersError] = useState<string | null>(null);

  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<ApiConnectionStatus>('UNVERIFIED');
  const [testLatencyMs, setTestLatencyMs] = useState<number | undefined>(undefined);
  const [testVerifiedModel, setTestVerifiedModel] = useState<string | undefined>(undefined);
  const [testDiscoveredModels, setTestDiscoveredModels] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState<string>('Unverified • Click Test to Verify');
  const [testErrorCode, setTestErrorCode] = useState<
    'ERR_API_AUTH_FAILED' | 'ERR_API_UNREACHABLE' | undefined
  >(undefined);
  const [lastTestedAt, setLastTestedAt] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) return;
    if (editingProvider) {
      setProvider(editingProvider.provider);
      setName(editingProvider.name);
      setBaseUrl(editingProvider.baseUrl);
      setApiKey(editingProvider.apiKey);
      setDefaultModelId(editingProvider.defaultModelId);
      setCostPer1MInputUsd(String(editingProvider.costPer1MInputUsd));
      setCostPer1MOutputUsd(String(editingProvider.costPer1MOutputUsd));
      setCustomHeadersText(
        editingProvider.customHeaders && Object.keys(editingProvider.customHeaders).length > 0
          ? JSON.stringify(editingProvider.customHeaders, null, 2)
          : ''
      );
      setTestStatus(editingProvider.status);
      setTestLatencyMs(editingProvider.latencyMs);
      setTestVerifiedModel(editingProvider.verifiedModel);
      setTestDiscoveredModels(editingProvider.discoveredModels || []);
      setTestMessage(editingProvider.lastMessage || 'Unverified • Click Test to Verify');
      setTestErrorCode(editingProvider.errorCode);
      setLastTestedAt(editingProvider.lastTestedAt);
    } else {
      const preset = API_PROVIDER_PRESETS.openrouter;
      setProvider('openrouter');
      setName(`${preset.label} Gateway`);
      setBaseUrl(preset.baseUrl);
      setApiKey('');
      setDefaultModelId(preset.defaultModelId);
      setCostPer1MInputUsd(String(preset.defaultInputCostPer1M));
      setCostPer1MOutputUsd(String(preset.defaultOutputCostPer1M));
      setCustomHeadersText('');
      setTestStatus('UNVERIFIED');
      setTestLatencyMs(undefined);
      setTestVerifiedModel(undefined);
      setTestDiscoveredModels([]);
      setTestMessage('Unverified • Click Test to Verify');
      setTestErrorCode(undefined);
      setLastTestedAt(undefined);
    }
    setShowKey(false);
    setHeadersError(null);
    setTesting(false);
  }, [isOpen, editingProvider]);

  if (!isOpen) return null;

  const activePreset = API_PROVIDER_PRESETS[provider];

  const handleSelectPreset = (nextProvider: CustomApiProviderType) => {
    const preset = API_PROVIDER_PRESETS[nextProvider];
    setProvider(nextProvider);
    setBaseUrl(preset.baseUrl);
    setDefaultModelId(preset.defaultModelId);
    setCostPer1MInputUsd(String(preset.defaultInputCostPer1M));
    setCostPer1MOutputUsd(String(preset.defaultOutputCostPer1M));
    if (!editingProvider) {
      setName(`${preset.label} Gateway`);
    }
    setTestStatus('UNVERIFIED');
    setTestLatencyMs(undefined);
    setTestVerifiedModel(undefined);
    setTestErrorCode(undefined);
    setTestMessage('Unverified • Click Test to Verify');
  };

  const handleTestConnection = async () => {
    const parsedHeaders = parseCustomHeadersJson(customHeadersText);
    if (parsedHeaders.error) {
      setHeadersError(parsedHeaders.error);
      return;
    }
    setHeadersError(null);
    setTesting(true);
    try {
      const result = await verifyApiConnection({
        provider,
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        modelId: defaultModelId.trim() || undefined,
        customHeaders: parsedHeaders.headers,
      });

      setTestStatus(result.status);
      setTestLatencyMs(result.latencyMs);
      setLastTestedAt(result.timestamp);
      setTestMessage(result.message);
      if (result.status === 'CONNECTED') {
        setTestVerifiedModel(result.verifiedModel);
        setTestDiscoveredModels(result.discoveredModels || []);
        setTestErrorCode(undefined);
      } else {
        setTestVerifiedModel(undefined);
        setTestDiscoveredModels([]);
        setTestErrorCode(result.errorCode);
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedHeaders = parseCustomHeadersJson(customHeadersText);
    if (parsedHeaders.error) {
      setHeadersError(parsedHeaders.error);
      return;
    }
    setHeadersError(null);

    onSave(
      {
        name: name.trim() || `${activePreset.label} Endpoint`,
        provider,
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        defaultModelId: defaultModelId.trim() || activePreset.defaultModelId,
        costPer1MInputUsd: Math.max(0, parseFloat(costPer1MInputUsd) || 0),
        costPer1MOutputUsd: Math.max(0, parseFloat(costPer1MOutputUsd) || 0),
        customHeaders: parsedHeaders.headers,
        status: testStatus,
        latencyMs: testLatencyMs,
        verifiedModel: testVerifiedModel,
        discoveredModels:
          testDiscoveredModels.length > 0 ? testDiscoveredModels : undefined,
        lastTestedAt,
        lastMessage: testMessage,
        errorCode: testErrorCode,
        enabled: editingProvider ? editingProvider.enabled : true,
      },
      editingProvider?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0D1017] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-indigo-500" />
              <span>
                {editingProvider ? 'Edit Custom AI / API Provider' : 'Add Custom AI / API Provider'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Connect OpenRouter, OpenAI, Anthropic, Gemini, Groq, Local Ollama, or any OpenAI-compatible URL.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Provider Preset Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Provider Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_ORDER.map((presetKey) => {
                const preset = API_PROVIDER_PRESETS[presetKey];
                const selected = provider === presetKey;
                return (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => handleSelectPreset(presetKey)}
                    className={`px-2.5 py-2 rounded-xl border text-left transition-all ${
                      selected
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate">{preset.label}</div>
                    <div className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
                      {preset.provider === 'custom' ? 'Any Base URL' : preset.baseUrl.replace(/^https?:\/\//, '')}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              {activePreset.description}
            </p>
          </div>

          {/* Name & Base URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Custom Connection Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Production OpenRouter"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Endpoint Base URL</span>
              </label>
              <input
                type="url"
                required
                value={baseUrl}
                onChange={(e) => {
                  setBaseUrl(e.target.value);
                  setTestStatus('UNVERIFIED');
                }}
                placeholder="https://openrouter.ai/api/v1"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* API Key with Eye Toggle & Default Model ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>API Key / Bearer Token</span>
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestStatus('UNVERIFIED');
                  }}
                  placeholder={activePreset.keyPlaceholder}
                  className="w-full pl-3 pr-9 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((prev) => !prev)}
                  aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Tip: Keys prefixed with <code className="font-mono">sk-test-</code> or{' '}
                <code className="font-mono">sim-</code> verify offline/sandbox mode.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span>Default Model ID</span>
              </label>
              <input
                type="text"
                required
                value={defaultModelId}
                onChange={(e) => {
                  setDefaultModelId(e.target.value);
                  setTestStatus('UNVERIFIED');
                }}
                placeholder="anthropic/claude-3.7-sonnet"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {Array.from(
                  new Set([...testDiscoveredModels, ...activePreset.suggestedModels])
                )
                  .slice(0, 6)
                  .map((modelOpt) => {
                    const isDiscovered = testDiscoveredModels.includes(modelOpt);
                    return (
                      <button
                        key={modelOpt}
                        type="button"
                        onClick={() => setDefaultModelId(modelOpt)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                          defaultModelId === modelOpt
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300'
                            : isDiscovered
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300/70 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        {isDiscovered ? `✓ ${modelOpt}` : modelOpt}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* FinOps Unit Economics Token Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Input Cost ($ per 1M tokens)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={costPer1MInputUsd}
                onChange={(e) => setCostPer1MInputUsd(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Output Cost ($ per 1M tokens)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={costPer1MOutputUsd}
                onChange={(e) => setCostPer1MOutputUsd(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Optional Custom JSON Headers */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Optional Custom Headers (JSON)
            </label>
            <textarea
              rows={2}
              value={customHeadersText}
              onChange={(e) => {
                setCustomHeadersText(e.target.value);
                setHeadersError(null);
              }}
              placeholder='{"HTTP-Referer": "https://launchup.io", "X-Title": "Launch Up Swarm"}'
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
            {headersError && (
              <p className="text-[11px] text-rose-500 mt-1">{headersError}</p>
            )}
          </div>

          {/* Live Handshake Status Box */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              {testing ? (
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0 mt-0.5" />
              ) : testStatus === 'CONNECTED' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : testStatus === 'FAILED' ? (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {testing
                    ? 'Pinging endpoint...'
                    : testStatus === 'CONNECTED'
                    ? `Connected • ${testLatencyMs ?? 0}ms • Model Verified (${testVerifiedModel || defaultModelId})`
                    : testStatus === 'FAILED'
                    ? `Connection Failed • ${testMessage}`
                    : 'Unverified • Click Test to Verify'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {testStatus === 'FAILED' && testErrorCode
                    ? `Error Code: ${testErrorCode}`
                    : lastTestedAt
                    ? `Last verified: ${new Date(lastTestedAt).toLocaleTimeString()}`
                    : 'Lightweight 5s timeout handshake via MOD-10 /api/v1/governance/verify-api-connection'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !baseUrl.trim()}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Pinging endpoint...</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Test Connection</span>
                </>
              )}
            </button>
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingProvider ? 'Update API Provider' : 'Save API Provider'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
