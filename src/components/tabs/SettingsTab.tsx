import React, { useState } from 'react';
import { 
  Settings, Save, Key, Shield, Globe, Bell, 
  Terminal, CheckCircle2, Moon, Sun, Monitor, Lock, Palette, RotateCcw,
  Sparkles, Layers, Sliders, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeMode, ColorPalette } from '../../types';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { CustomApiGatewayPanel } from '../common/CustomApiGatewayPanel';
import { ThreeZoneScreenLayout } from '../layout/ThreeZoneScreenLayout';

export const SettingsTab: React.FC = () => {
  const { 
    themeMode, 
    setThemeMode, 
    palette, 
    setPalette, 
    resolvedTheme, 
    resetDemoState 
  } = useApp();

  const [appName, setAppName] = useState('Launch Up');
  const [appUrl, setAppUrl] = useState('https://app.launchup.io');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  // Notifications toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsAppAlerts, setWhatsAppAlerts] = useState(true);
  const [gateAlerts, setGateAlerts] = useState(true);

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
    <ThreeZoneScreenLayout
      title="Workspace Settings"
      subtitle="Configure Launch Up workspace branding, color modes, accent palettes, and autonomous gateway rules."
      badge="Customization Engine"
      isSidePanelOpen={isSidePanelOpen}
      onToggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)}
      sidePanelTitle="Theme & Appearance Summary"
      sidePanelSubtitle={`Mode: ${themeMode} · Palette: ${palette}`}
      headerActions={
        <>
          {savedSuccess && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved Successfully</span>
            </span>
          )}
          {resetSuccess && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 animate-in fade-in">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>State Reset Cleanly</span>
            </span>
          )}
        </>
      }
      summaryMetrics={
        <SummaryMetricGrid>
          <SummaryMetricCard
            title="Appearance Mode"
            primaryValue={themeMode.toUpperCase()}
            subtitle={`Active: ${resolvedTheme}`}
            status="live"
          />
          <SummaryMetricCard
            title="Color Palette"
            primaryValue={palette.toUpperCase()}
            subtitle="Theme Accent Tokens"
            status="good"
          />
          <SummaryMetricCard
            title="Theme Engine"
            primaryValue="Control Plane"
            subtitle="Sleek Slate & Indigo"
            status="good"
          />
          <SummaryMetricCard
            title="State Sync"
            primaryValue="LocalStorage"
            subtitle="Auto-persisted"
            status="good"
          />
          <SummaryMetricCard
            title="Secrets Vault"
            primaryValue="AES-256-GCM"
            subtitle="Zero Plaintext Keys"
            status="good"
          />
        </SummaryMetricGrid>
      }
      sidePanelContent={
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Active Preset
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Auto-persisted</span>
          </div>

          <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Theme Theme</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">Control Plane (Slate/Indigo)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Color Mode</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 capitalize">{themeMode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Palette Accent</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">{palette}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Font Stack</span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">Plus Jakarta Sans</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetDemo}
              className="w-full py-2 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200/80 dark:border-rose-900/60 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State & Clear Cache</span>
            </button>
          </div>
        </div>
      }
    >
      {/* 1. Theme Engine & Appearance Settings */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Theme & Appearance Engine</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Original Launch Up Slate & Indigo control plane theme with Light/Dark/System modes and 5 accent palettes.
            </p>
          </div>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
            Active Theme
          </span>
        </div>

        {/* Color Mode Selection (Light / Night / System) */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
            Color Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { 
                id: 'light' as ThemeMode, 
                label: 'Light Mode', 
                icon: Sun, 
                iconColor: 'text-amber-500', 
                desc: 'Crisp, high-contrast light surfaces' 
              },
              { 
                id: 'dark' as ThemeMode, 
                label: 'Night/Dark Mode', 
                icon: Moon, 
                iconColor: 'text-indigo-400', 
                desc: 'Low-light obsidian dark surfaces' 
              },
              { 
                id: 'system' as ThemeMode, 
                label: 'System Default', 
                icon: Monitor, 
                iconColor: 'text-sky-500', 
                desc: `Auto-synchronize with OS (Active: ${resolvedTheme})` 
              },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = themeMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setThemeMode(m.id)}
                  className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${m.iconColor}`} />
                      {m.label}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {m.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Palette (5 Options) */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Accent Color Palette</span>
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Applies across both Light & Dark modes
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { id: 'indigo' as ColorPalette, label: 'Indigo Obsidian', color: '#6366f1' },
              { id: 'cyan' as ColorPalette, label: 'Cyber Cyan', color: '#06b6d4' },
              { id: 'emerald' as ColorPalette, label: 'Emerald Matrix', color: '#10b981' },
              { id: 'amber' as ColorPalette, label: 'Sunset Amber', color: '#f59e0b' },
              { id: 'rose' as ColorPalette, label: 'Rose Amethyst', color: '#f43f5e' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPalette(opt.id)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  palette === opt.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                    style={{ backgroundColor: opt.color }}
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {opt.label.split(' ')[0]}
                  </span>
                </div>
                {palette === opt.id && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Custom AI & Universal Gateway Panel */}
      <CustomApiGatewayPanel />

      {/* 3. Branding & Workspace Identity Form */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 transition-colors"
      >
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Workspace Branding & Identity
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
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
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
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
            Autonomous Notifications
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsAppAlerts}
                onChange={(e) => setWhatsAppAlerts(e.target.checked)}
                className="rounded accent-indigo-600 w-4 h-4"
              />
              <span>WhatsApp Inbound Alerts</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={gateAlerts}
                onChange={(e) => setGateAlerts(e.target.checked)}
                className="rounded accent-indigo-600 w-4 h-4"
              />
              <span>Gate Approval Requests</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded accent-indigo-600 w-4 h-4"
              />
              <span>Daily Client Summary Email</span>
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </ThreeZoneScreenLayout>
  );
};
