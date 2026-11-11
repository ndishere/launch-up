import React from 'react';
import { X, Terminal, CheckCircle2, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DeploymentLogModal: React.FC = () => {
  const { isDeployModalOpen, setIsDeployModalOpen, activeDeployLog } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!isDeployModalOpen || !activeDeployLog) return null;

  const copyLogs = () => {
    navigator.clipboard.writeText(activeDeployLog.logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#0B0F19] text-slate-200 border border-slate-800 rounded-xl w-full max-w-2xl shadow-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Terminal Header */}
        <div className="px-5 py-3.5 bg-[#0D121F] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono font-semibold text-slate-300 ml-2">
              build-stdout: {activeDeployLog.projectName} ({activeDeployLog.environment})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyLogs}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy Output"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsDeployModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metadata bar */}
        <div className="px-5 py-2 bg-[#090D16] border-b border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
          <div>
            Commit: <span className="text-indigo-400 font-semibold">{activeDeployLog.commitHash}</span> - {activeDeployLog.commitMessage}
          </div>
          <div className="flex items-center gap-2">
            <span>Status: <strong className="text-emerald-400">{activeDeployLog.status}</strong></span>
            <span>Duration: <strong className="text-slate-200">{activeDeployLog.durationSeconds}s</strong></span>
          </div>
        </div>

        {/* Console Log Area */}
        <div className="p-5 font-mono text-xs overflow-y-auto space-y-1.5 leading-relaxed text-slate-300 max-h-[55vh]">
          {activeDeployLog.logs.map((line, idx) => {
            const isSuccess = line.includes('✔') || line.includes('Successfully') || line.includes('Passed');
            const isWarning = line.includes('WARN');
            const isInfo = line.includes('[info]') || line.includes('Fetching') || line.includes('Building');

            return (
              <div
                key={idx}
                className={`transition-colors ${
                  isSuccess
                    ? 'text-emerald-400 font-medium'
                    : isWarning
                    ? 'text-amber-400'
                    : isInfo
                    ? 'text-indigo-300'
                    : 'text-slate-300'
                }`}
              >
                {line}
              </div>
            );
          })}
        </div>

        {/* Terminal Footer */}
        <div className="px-5 py-2.5 bg-[#0D121F] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Ingress listening on port 3000 & 443
          </span>
          <button
            onClick={() => setIsDeployModalOpen(false)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
