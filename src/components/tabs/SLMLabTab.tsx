import React, { useState } from 'react';
import { 
  Cpu, Zap, Sparkles, Sliders, CheckCircle2, Play, 
  Download, HardDrive, Gauge, Laptop, Database, ArrowRight,
  TrendingDown, RefreshCw, Layers, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SLMModel, SLMQuantization } from '../../types';
import { ScreenAnalyticsHeader } from '../common/ScreenAnalyticsHeader';
import { VramTokenOptimizerPanel } from '../common/VramTokenOptimizerPanel';
import { compressToCavemanMd } from '../../lib/token-compressor';

export const SLMLabTab: React.FC = () => {
  const { slms, trainSLMModel, addSLMModel, tokenOptimizer } = useApp();

  const [selectedModel, setSelectedModel] = useState<SLMModel>(slms[0]);
  const [showCreateModelModal, setShowCreateModelModal] = useState(false);
  const [modelName, setModelName] = useState('');
  const [baseArch, setBaseArch] = useState('Phi-3.5-mini (3.8B)');
  const [domainSpec, setDomainSpec] = useState<any>('B2B Customer Support');
  const [quantChoice, setQuantChoice] = useState<SLMQuantization>('GGUF-Q4');
  const [targetDevice, setTargetDevice] = useState<any>('Local WebGPU / ONNX');
  const [isLocalModel, setIsLocalModel] = useState(true);

  // Playground tester
  const [playgroundPrompt, setPlaygroundPrompt] = useState('Explain how to optimize PostgreSQL connection pooling for a high-traffic logistics app');
  const [playgroundOutput, setPlaygroundOutput] = useState('');
  const [isInferencing, setIsInferencing] = useState(false);

  const handleTestInference = () => {
    setIsInferencing(true);
    setPlaygroundOutput('');

    const rawResponse = `[Inference complete in ${selectedModel.evalScores.latencyMs}ms @ ${selectedModel.tokensPerSec} tps on ${selectedModel.deviceTarget}]

1. Max Connection Tuning: You should make sure to configure PostgreSQL max_connections based on the available RAM (typically 100-200) rather than spawning unbounded threads.
2. Connection Pooler: In order to reduce overhead, mount PgBouncer or Odyssey in Transaction Pooling mode at the cluster edge. Therefore, this reduces the thread switching overhead by 80%.
3. Keepalives: Please note that you should configure tcp_keepalives_idle = 60 in order to prune dead edge connections immediately.
4. Autonomous Telemetry: It is important to note that the pool is monitored via Launch Up Sentinel Agent with auto-scaling connection thresholds.`;

    let simulatedResponse = rawResponse;
    if (tokenOptimizer.cavemanMode !== 'off') {
      const compressed = compressToCavemanMd(rawResponse, tokenOptimizer.cavemanMode);
      simulatedResponse = `[/caveman ${tokenOptimizer.cavemanMode} · ${compressed.rawTokens} -> ${compressed.compressedTokens} tokens (${compressed.reductionPercent}% saved)]\n\n${compressed.compressedText}`;
    }

    let i = 0;
    const interval = setInterval(() => {
      setPlaygroundOutput(simulatedResponse.slice(0, i));
      i += 12;
      if (i > simulatedResponse.length) {
        clearInterval(interval);
        setPlaygroundOutput(simulatedResponse);
        setIsInferencing(false);
      }
    }, 25);
  };

  const handleCreateModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName) return;

    addSLMModel({
      name: modelName,
      baseArchitecture: baseArch,
      parameterSize: baseArch.includes('1.5B') ? '1.5B' : baseArch.includes('2B') ? '2B' : '3.8B',
      contextLength: 64000,
      domainSpecialization: domainSpec,
      trainingLoss: 0.088,
      quantization: quantChoice,
      isLocal: isLocalModel,
      deviceTarget: targetDevice,
    });

    setShowCreateModelModal(false);
    setModelName('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Combined Analytics Section with Live Success/Error Rates */}
      <ScreenAnalyticsHeader
        title="SLM (Small Language Model) Lab & Studio"
        badge="Edge & Private GPU Fleet"
        description="Train, benchmark, and deploy custom Small Language Models (1.5B - 3.8B) for business automations. Run locally on device with Ollama/vLLM or online via private endpoints with zero data leaks."
        metrics={[
          {
            label: 'Trained Models',
            value: slms.length,
            subValue: 'Phi-3.5, Llama-3.2, Qwen',
            status: 'good',
          },
          {
            label: 'Inference Success Rate',
            value: '99.7%',
            subValue: 'Zero timeout crashes',
            status: 'live',
          },
          {
            label: 'Hallucination Rate',
            value: '< 0.3%',
            subValue: 'Pruned via domain DDL',
            status: 'good',
          },
          {
            label: 'Peak Token Throughput',
            value: '260 tps',
            subValue: 'WebGPU / ONNX Runtime',
            status: 'good',
          },
          {
            label: 'Edge Latency',
            value: '4.8ms P99',
            subValue: 'Zero network overhead',
            status: 'good',
          },
        ]}
        actions={
          <button
            onClick={() => setShowCreateModelModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Train New Domain SLM</span>
          </button>
        }
      />

      {/* RTX 3050 (6GB VRAM) Hardware & 4-Layer Token Compression Optimizer */}
      <VramTokenOptimizerPanel />

      {/* Model Cards Grid & Benchmarking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Models List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Trained Domain SLM Fleet
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Select model to benchmark
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slms.map((model) => {
              const isSelected = selectedModel.id === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-[#111318] relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-purple-500 ring-2 ring-purple-500/20'
                      : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {model.name}
                        </h3>
                        <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                          {model.domainSpecialization}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          model.status === 'Ready'
                            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                            : 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400'
                        }`}
                      >
                        {model.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] font-mono mt-3">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Architecture:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{model.baseArchitecture}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Quantization:</span>
                        <span className="text-indigo-500 font-bold">{model.quantization}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Target Device:</span>
                        <span className="text-purple-400 font-medium">{model.deviceTarget}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Loss Rate:</span>
                        <span className="text-emerald-500 font-bold">{model.trainingLoss}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {model.tokensPerSec} tps
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        trainSLMModel(model.id);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Fine-Tune</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Model Inference & Benchmarking (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111318] rounded-xl p-5 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Active Sandbox: {selectedModel.name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedModel.isLocal ? '⚡ Embedded Local In-Memory Inference' : '☁️ Private Cloud Node'}
                </p>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-500 font-bold">
                {selectedModel.evalScores.latencyMs}ms Latency
              </span>
            </div>

            {/* Benchmark Scores */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Accuracy</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedModel.evalScores.accuracy}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Hallucination</span>
                <span className="text-sm font-bold text-emerald-500">{selectedModel.evalScores.hallucinationRate}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Speed</span>
                <span className="text-sm font-bold text-purple-500">{selectedModel.evalScores.throughputTps} tps</span>
              </div>
            </div>

            {/* Test prompt area */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                Test Prompt / Domain Evaluation
              </label>
              <textarea
                rows={2}
                value={playgroundPrompt}
                onChange={(e) => setPlaygroundPrompt(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-sans"
              />
            </div>

            {/* Response area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Model Output Stream
                </span>
                {isInferencing && (
                  <span className="text-[10px] text-purple-500 font-mono">
                    Generating at {selectedModel.tokensPerSec} tps...
                  </span>
                )}
              </div>
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] min-h-[140px] max-h-[180px] overflow-y-auto leading-relaxed border border-slate-800">
                {playgroundOutput || (
                  <span className="text-slate-500 italic">
                    Press "Run Local Inference" to evaluate domain SLM response with zero cloud roundtrip...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              Target: {selectedModel.deviceTarget}
            </span>
            <button
              onClick={handleTestInference}
              disabled={isInferencing}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Local Inference</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create SLM Modal */}
      {showCreateModelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111318] rounded-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Train & Quantize New Domain SLM
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModelModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateModel} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Model Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme-Support-SLM-v1"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Base Open Architecture
                  </label>
                  <select
                    value={baseArch}
                    onChange={(e) => setBaseArch(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Phi-3.5-mini (3.8B)">Phi-3.5-mini (3.8B)</option>
                    <option value="Qwen2.5-Coder (1.5B)">Qwen2.5-Coder (1.5B)</option>
                    <option value="Llama-3.2 (3B)">Llama-3.2 (3B)</option>
                    <option value="Gemma-2 (2B)">Gemma-2 (2B)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Domain Specialization
                  </label>
                  <select
                    value={domainSpec}
                    onChange={(e) => setDomainSpec(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="B2B Customer Support">B2B Customer Support</option>
                    <option value="Enterprise Code & FDE">Enterprise Code & FDE</option>
                    <option value="Marketing Copywriter">Marketing Copywriter</option>
                    <option value="Telemetry Log Parser">Telemetry Log Parser</option>
                    <option value="Finance & Invoicing">Finance & Invoicing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Quantization Method
                  </label>
                  <select
                    value={quantChoice}
                    onChange={(e) => setQuantChoice(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="GGUF-Q4">GGUF-Q4 (Best Local RAM Balance)</option>
                    <option value="Q4_K_M">Q4_K_M (High Precision 4-bit)</option>
                    <option value="AWQ 4-bit">AWQ 4-bit (Fastest Tensor Cores)</option>
                    <option value="FP16">FP16 (Uncompressed)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Hardware Target
                  </label>
                  <select
                    value={targetDevice}
                    onChange={(e) => setTargetDevice(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Local WebGPU / ONNX">Local WebGPU / ONNX (Browser)</option>
                    <option value="Local Ollama / vLLM">Local Ollama / vLLM (Desktop Node)</option>
                    <option value="Edge TPU">Edge TPU (Hardware Device)</option>
                    <option value="Private Cloud H100">Private Cloud H100</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-700 dark:text-purple-300">
                🚀 <strong>Zero Cloud Dependency:</strong> Small Language Models compiled via Launch Up run entirely on the client's local node, preventing data leakage and guaranteeing sub-10ms response times.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModelModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Compile & Train SLM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
