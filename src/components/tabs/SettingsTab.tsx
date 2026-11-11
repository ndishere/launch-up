import React, { useState } from 'react';
import { 
  Settings, Save, Key, Shield, Globe, Bell, 
  Terminal, CheckCircle2, Moon, Sun, Monitor, Lock, Palette, RotateCcw 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeMode, ColorPalette } from '../../types';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';

export const SettingsTab: React.FC = () => {
  const { themeMode, setThemeMode, palette, setPalette, resolvedTheme, resetDemoState } = useApp();
  const [appName, setAppName] = useState('Launch Up');
  const [appUrl, setAppUrl] = useState('https://app.launchup.io');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDemo = () => {
    resetDemoState();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Workspace Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure Launch Up workspace branding, secrets vault, and environment rules.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully</span>
          </span>
        )}
      </div>

      {/* Unified 5-Cell Horizontal Summary Bar */}
      <SummaryMetricGrid>
        <SummaryMetricCard
          title="Appearance Mode"
          primaryValue={themeMode.toUpperCase()}
          subtitle={`Resolved: ${resolvedTheme}`}
          status="live"
        />
        <SummaryMetricCard
          title="Color Palette"
          primaryValue={palette.toUpperCase()}
          subtitle="Active Theme Tokens"
          status="good"
        />
        <SummaryMetricCard
          title="State Sync"
          primaryValue="LocalStorage"
          subtitle="Auto-Persisted Workspace"
          status="good"
        />
        <SummaryMetricCard
          title="Secrets Vault"
          primaryValue="AES-256-GCM"
          subtitle="Zero Plaintext Keys"
          status="good"
        />
        <SummaryMetricCard
          title="Workspace Host"
          primaryValue="Production"
          subtitle={appUrl.replace(/^https?:\/\//, '')}
          status="neutral"
        />
      </SummaryMetricGrid>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Branding */}
        <div className="bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Branding & Application Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Platform Name
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Canonical Base URL
              </label>
              <input
                type="text"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Appearance Mode Selection */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Appearance Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { 
                  id: 'light' as ThemeMode, 
                  label: 'Light Mode', 
                  icon: Sun, 
                  iconColor: 'text-amber-500', 
                  desc: 'Clean, high-contrast crisp light interface' 
                },
                { 
                  id: 'dark' as ThemeMode, 
                  label: 'Dark Mode', 
                  icon: Moon, 
                  iconColor: 'text-indigo-400', 
                  desc: 'Sleek dark obsidian palette engineered for low-light' 
                },
                { 
                  id: 'system' as ThemeMode, 
                  label: 'System Auto', 
                  icon: Monitor, 
                  iconColor: 'text-sky-500', 
                  desc: `Automatically synchronizes with your device OS (Currently: ${resolvedTheme})` 
                },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = themeMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setThemeMode(m.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/25 bg-indigo-50/50 dark:bg-indigo-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${m.iconColor}`} />
                        {m.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {m.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Palettes (5 Options) */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                <span>Color Palette (5 Themes)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Applies across Light, Dark & System modes
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { 
                  id: 'indigo' as ColorPalette, 
                  label: 'Indigo Obsidian', 
                  color: '#6366f1',
                  desc: 'Classic deep tech indigo & obsidian' 
                },
                { 
                  id: 'cyan' as ColorPalette, 
                  label: 'Cyber Cyan', 
                  color: '#06b6d4',
                  desc: 'Electric neon teal & cyber cyan' 
                },
                { 
                  id: 'emerald' as ColorPalette, 
                  label: 'Emerald Matrix', 
                  color: '#10b981',
                  desc: 'Terminal matrix jade green' 
                },
                { 
                  id: 'amber' as ColorPalette, 
                  label: 'Sunset Amber', 
                  color: '#f59e0b',
                  desc: 'Warm solar gold & amber glow' 
                },
                { 
                  id: 'rose' as ColorPalette, 
                  label: 'Rose Amethyst', 
                  color: '#f43f5e',
                  desc: 'Vibrant crimson & magenta' 
                },
              ].map((p) => {
                const isSelected = palette === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPalette(p.id)}
                    style={isSelected ? {
                      borderColor: p.color,
                      boxShadow: `0 0 0 2px ${p.color}33`,
                    } : {}}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-100/80 dark:bg-slate-800/80'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span 
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 dark:border-white/10" 
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="truncate">{p.label}</span>
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Local & Online AI Models & MCP Configuration */}
        <div className="bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                MCP (Model Context Protocol) & AI Models Engine
              </h2>
            </div>
            <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 px-2 py-0.5 rounded font-semibold">
              Local Ollama + Gemini API Active
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure local and online AI model endpoints used by autonomous agents inside the Project Canvas and SLM Lab to build and ship applications.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Local SLM Endpoint (Ollama / vLLM / WebGPU)
              </label>
              <input
                type="text"
                defaultValue="http://127.0.0.1:11434/v1"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                MCP Server Host Endpoint (Model Context Protocol)
              </label>
              <input
                type="text"
                defaultValue="mcp://localhost:8080/v1/orchestrator"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Security & Secrets Vault */}
        <div className="bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Server-Side Secrets & Credentials Vault
              </h2>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 px-2 py-0.5 rounded">
              AES-256-GCM Active
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keys and sensitive tokens are encrypted and managed server-side, never exposed to client browsers.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                GitHub Personal Access Token (PAT)
              </label>
              <input
                type="password"
                defaultValue="ghp_9204928109841029841029841092841"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Stripe Secret Key (Live Webhook)
              </label>
              <input
                type="password"
                defaultValue="sk_live_51M00000000000000000000000"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save & Reset Demo Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetDemo}
              className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-800/60 rounded-xl transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
            {resetSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Local state restored to initial fixtures.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Workspace Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
