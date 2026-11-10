import React, { useState } from 'react';
import { 
  Bot, Sparkles, Cpu, Zap, Activity, CheckCircle2, 
  Send, RefreshCw, Terminal, Layers, Play, Clock, ArrowRight,
  ShieldAlert, HardDrive, Laptop, Globe, Users, Filter,
  Check, ChevronRight, AlertCircle, Copy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AutonomousAgent, AgentRole } from '../../types';

export const AgentCompanyTab: React.FC = () => {
  const { 
    agents, 
    dispatchAgentTask, 
    intakes, 
    submitBusinessIntake,
    setCurrentTab
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'fleet' | 'intakes' | 'logs'>('fleet');
  const [selectedAgent, setSelectedAgent] = useState<AutonomousAgent>(agents[0] || null);
  const [agentFilter, setAgentFilter] = useState<'all' | 'local' | 'cloud'>('all');
  const [taskPrompt, setTaskPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<Array<{ id: string; time: string; agent: string; text: string; type: 'info' | 'success' | 'exec' }>>([
    {
      id: 'log-1',
      time: '10:14:02',
      agent: 'Aegis Core',
      text: 'Swarm consensus initialized. 7 specialist agents synchronized on zero-latency mesh.',
      type: 'success',
    },
    {
      id: 'log-2',
      time: '10:14:18',
      agent: 'Vulcan FDE',
      text: 'Synthesized CQRS + TimescaleDB architecture for client Apex Freight Global.',
      type: 'info',
    },
    {
      id: 'log-3',
      time: '10:14:35',
      agent: 'Synapse SLM',
      text: 'Fine-tuned Phi-3.5-mini 4-bit GGUF checkpoint. Inference latency steady at 8.4ms.',
      type: 'exec',
    },
  ]);

  // Intake Modal state
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [bottlenecks, setBottlenecks] = useState('');
  const [fdeArch, setFdeArch] = useState<'Event-Driven Microservices' | 'Realtime WebSocket Mesh' | 'CQRS + TimescaleDB' | 'Serverless Edge Cluster'>('Event-Driven Microservices');
  const [slmType, setSlmType] = useState('Phi-3.5-mini Fine-Tuned (Custom Edge)');

  const filteredAgents = agents.filter((agent) => {
    if (agentFilter === 'local') return agent.isLocal;
    if (agentFilter === 'cloud') return !agent.isLocal;
    return true;
  });

  const handleDispatch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskPrompt.trim() || !selectedAgent) return;

    const currentTask = taskPrompt.trim();
    setIsExecuting(true);
    dispatchAgentTask(selectedAgent.id, currentTask);

    const now = new Date().toLocaleTimeString();
    const newLogId = `log-${Date.now()}`;

    setExecutionLogs((prev) => [
      {
        id: newLogId,
        time: now,
        agent: selectedAgent.name,
        text: `Mission dispatched: "${currentTask}". Model ${selectedAgent.model} running inference at ~${selectedAgent.latencyMs}ms.`,
        type: 'exec',
      },
      ...prev,
    ]);

    setTimeout(() => {
      setIsExecuting(false);
      setExecutionLogs((prev) => [
        {
          id: `log-done-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          agent: selectedAgent.name,
          text: `Mission complete with 99.8% precision score. Output artifacts committed to project registry.`,
          type: 'success',
        },
        ...prev,
      ]);
    }, 2500);

    setTaskPrompt('');
  };

  const handleCreateIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) return;

    submitBusinessIntake({
      businessName,
      industry: industry || 'Tech & B2B Services',
      targetAudience: targetAudience || 'Corporate Clients & Enterprises',
      currentBottlenecks: bottlenecks ? bottlenecks.split(',').map((s) => s.trim()) : ['Manual client ticketing', 'Slow API responses'],
      desiredAutomations: ['Autonomous Client Intake', 'Local Edge SLM Support Envoy', 'FDE Realtime Mesh', 'Multi-Channel Ad Automation'],
      fdeArchitecture: fdeArch,
      slmChoice: slmType,
      slmDeployment: 'Local Edge Device',
      marketingChannels: ['LinkedIn B2B', 'Google Ads', 'Automated SEO Blog'],
      autoUpdatePolicy: 'Continuous Auto-Deploy',
    });

    setShowIntakeForm(false);
    setBusinessName('');
    setIndustry('');
    setBottlenecks('');
    setActiveSubTab('intakes');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Clean Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                Company of Agents
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                  Autonomous Fleet
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Autonomous specialist agents coordinating to intake businesses, build FDE online systems, train SLMs, and run marketing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowIntakeForm(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Intake Business</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Metric Cards (Simplified, Uniform Styling) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#111622] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Specialist Agents</span>
            <Bot className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {agents.length}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% Operational & Ready
          </p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Edge / Local Ratio</span>
            <Laptop className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            67% <span className="text-xs font-normal text-slate-400">On-Device</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Sub-10ms Inference Speed
          </p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Missions Completed</span>
            <Zap className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            10,468
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            99.5% Success Accuracy
          </p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Automated Pipelines</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {intakes.length} Deployed
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            FDE Systems + Custom SLMs
          </p>
        </div>
      </div>

      {/* Screen Sub-Navigation for Clean Separation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('fleet')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeSubTab === 'fleet'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Agent Fleet & Mission Deck</span>
        </button>

        <button
          onClick={() => setActiveSubTab('intakes')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeSubTab === 'intakes'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Automated Pipelines ({intakes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeSubTab === 'logs'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Swarm Execution Feed</span>
        </button>
      </div>

      {/* View 1: Agent Fleet & Interactive Mission Deck */}
      {activeSubTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Fleet Roster (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Specialist Fleet ({filteredAgents.length})
              </span>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                {(['all', 'local', 'cloud'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAgentFilter(mode)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors uppercase ${
                      agentFilter === mode
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filteredAgents.map((agent) => {
                const isSelected = selectedAgent?.id === agent.id;
                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white dark:bg-[#111622] flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-400'
                        : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                        {agent.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                            {agent.name}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            ~{agent.latencyMs}ms
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {agent.role}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-slate-400">
                          <span className="truncate max-w-[150px]">{agent.model}</span>
                          <span>•</span>
                          <span>{agent.isLocal ? '⚡ Local' : '☁️ Cloud'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                          agent.status === 'Executing' || agent.status === 'Training' || agent.status === 'Streaming Logs'
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            agent.status === 'Executing' || agent.status === 'Training'
                              ? 'bg-emerald-500 animate-pulse'
                              : 'bg-slate-400'
                          }`}
                        />
                        {agent.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {agent.tasksCompleted} tasks
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Mission Deck & Execution Console (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111622] rounded-xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between space-y-4">
            {selectedAgent ? (
              <>
                {/* Agent Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
                      {selectedAgent.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                          {selectedAgent.name}
                        </h2>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {selectedAgent.isLocal ? '⚡ On-Device Node' : '☁️ Cloud Frontier'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {selectedAgent.role} · Model: <span className="font-mono">{selectedAgent.model}</span> (~{selectedAgent.latencyMs}ms)
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white block">
                      {selectedAgent.accuracyScore}% Acc
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {selectedAgent.tokensProcessed.toLocaleString()} tokens
                    </span>
                  </div>
                </div>

                {/* Capabilities Tags */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
                    Autonomous Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAgent.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        ✓ {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Workflow Presets */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
                    Quick Autonomous Instructions
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {[
                      'Synthesize FDE Realtime Architecture for client intake',
                      'Train domain SLM model with quantized GGUF weights',
                      'Deploy multi-channel marketing campaign on LinkedIn & Ads',
                      'Analyze client telemetry logs and deploy zero-downtime update',
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTaskPrompt(preset)}
                        className="text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] transition-colors flex items-center justify-between group"
                      >
                        <span className="truncate">{preset}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Task Dispatch Form */}
                <form onSubmit={handleDispatch} className="pt-2">
                  <div className="relative">
                    <textarea
                      value={taskPrompt}
                      onChange={(e) => setTaskPrompt(e.target.value)}
                      placeholder={`Direct instruction to ${selectedAgent.name}...`}
                      rows={3}
                      className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans resize-none transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Sub-10ms edge dispatch · Zero human bottleneck
                    </span>
                    <button
                      type="submit"
                      disabled={!taskPrompt.trim() || isExecuting}
                      className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      {isExecuting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Executing Mission...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Execute Mission</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Recent Output Terminal */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      Live Terminal Feed
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {executionLogs.length} events logged
                    </span>
                  </div>
                  <div className="bg-slate-900 dark:bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-slate-300 space-y-1.5 max-h-36 overflow-y-auto">
                    {executionLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-slate-500 shrink-0 text-[10px]">[{log.time}]</span>
                        <span className="text-indigo-400 shrink-0 font-bold">{log.agent}:</span>
                        <span className="text-slate-300 break-words">{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Select an agent from the fleet to direct instructions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* View 2: Automated Business Pipelines */}
      {activeSubTab === 'intakes' && (
        <div className="bg-white dark:bg-[#111622] rounded-xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Active Client Pipelines & Business Automations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Businesses powered by automated FDE online architectures, local edge SLMs, and automated marketing funnels.
              </p>
            </div>
            <button
              onClick={() => setShowIntakeForm(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors self-start sm:self-auto"
            >
              + Onboard Business
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {intakes.map((intake) => (
              <div
                key={intake.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {intake.businessName}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        intake.status === 'Deployed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                          : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400'
                      }`}
                    >
                      {intake.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{intake.industry}</p>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">FDE System:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{intake.fdeArchitecture}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Custom SLM:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[150px]">{intake.slmChoice}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Auto-Update:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{intake.autoUpdatePolicy}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                      Automated Ad Funnels:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {intake.marketingChannels.map((ch, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-800">
                  <span>Created {intake.createdAt}</span>
                  <span
                    className="text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline"
                    onClick={() => setCurrentTab('telemetry-hub')}
                  >
                    Telemetry Logs →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 3: Swarm Execution Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-white dark:bg-[#111622] rounded-xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Autonomous Swarm Event Stream
              </h2>
              <p className="text-xs text-slate-400">
                Live inter-agent coordination signals and distributed model inference events.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Mesh Connected
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {executionLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3"
              >
                <span className="text-slate-400 text-[11px] shrink-0 font-medium">{log.time}</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold shrink-0 text-[10px]">
                  {log.agent}
                </span>
                <p className="text-slate-700 dark:text-slate-300 flex-1 leading-relaxed">
                  {log.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intake Business Modal */}
      {showIntakeForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111622] rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Intake Business & Deploy Automation
                </h3>
              </div>
              <button
                onClick={() => setShowIntakeForm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIntake} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Freight Global"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HealthTech, Logistics"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hospitals, B2B Freight"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Operational Bottlenecks (Comma Separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Manual invoice review, 3-hour customer inquiry delays"
                  value={bottlenecks}
                  onChange={(e) => setBottlenecks(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    FDE System Architecture
                  </label>
                  <select
                    value={fdeArch}
                    onChange={(e) => setFdeArch(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Event-Driven Microservices">Event-Driven Microservices</option>
                    <option value="Realtime WebSocket Mesh">Realtime WebSocket Mesh</option>
                    <option value="CQRS + TimescaleDB">CQRS + TimescaleDB</option>
                    <option value="Serverless Edge Cluster">Serverless Edge Cluster</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Custom SLM Model Choice
                  </label>
                  <select
                    value={slmType}
                    onChange={(e) => setSlmType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Phi-3.5-mini Fine-Tuned (Custom Edge)">Phi-3.5-mini (3.8B Local Edge)</option>
                    <option value="Llama-3.2-3B Quantized (Local Clinic Node)">Llama-3.2 (3B Local Node)</option>
                    <option value="Qwen2.5-Coder-1.5B (Local WASM/WebGPU)">Qwen2.5-Coder (1.5B Local WebGPU)</option>
                    <option value="Gemma-2-2B (Edge TPU Ultra-Fast)">Gemma-2 (2B Edge TPU)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                ⚡ <strong>Autonomous Engine:</strong> Our company of agents will generate the online management system code, train the selected SLM, and activate digital marketing campaigns automatically upon submission.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIntakeForm(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl shadow-xs"
                >
                  Deploy Automation Swarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
