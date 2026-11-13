import React, { useState } from 'react';
import { 
  Settings, Save, Key, Shield, Globe, Bell, 
  Terminal, CheckCircle2, Moon, Sun, Monitor, Lock, Palette, RotateCcw,
  Sparkles, Layers, Sliders, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeMode, ColorPalette, UiThemeStyle } from '../../types';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { CustomApiGatewayPanel } from '../common/CustomApiGatewayPanel';
import { ThreeZoneScreenLayout } from '../layout/ThreeZoneScreenLayout';

export const SettingsTab: React.FC = () => {
  const { 
    uiThemeStyle,
    setUiThemeStyle,
    themeMode, 
    setThemeMode, 
    palette, 
    setPalette, 
    resolvedTheme, 
    resetDemoState 
  } = useApp();

  const isPrototype = uiThemeStyle === 'prototype';
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
      subtitle="Configure Launch Up workspace branding, UI theme style, color modes, and autonomous gateway rules."
      badge="Customization Engine"
      isSidePanelOpen={isSidePanelOpen}
      onToggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)}
      sidePanelTitle="Theme & Appearance Summary"
      sidePanelSubtitle={`Style: ${uiThemeStyle} · Mode: ${themeMode}`}
      headerActions={
        <>
          {savedSuccess && (
            <span className="chip g text-xs flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved Successfully</span>
            </span>
          )}
          {resetSuccess && (
            <span className="chip a text-xs flex items-center gap-1.5 animate-in fade-in">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>State Reset Cleanly</span>
            </span>
          )}
        </>
      }
      summaryMetrics={
        <SummaryMetricGrid>
          <SummaryMetricCard
            title="UI Theme Style"
            primaryValue={uiThemeStyle === 'prototype' ? 'Prototype UI' : 'Classic UI'}
            subtitle={uiThemeStyle === 'prototype' ? 'Simplified Working Prototype' : 'Original Launch Up Palette'}
            status="good"
          />
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
            title="State Sync"
            primaryValue="LocalStorage"
            subtitle="lu-theme-style & lu-theme"
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
            <span className="chip b text-[11px]">Active Preset</span>
            <span className="text-[11px] text-[var(--mut)]">Auto-persisted</span>
          </div>

          <div
            className={`p-3.5 rounded-xl border space-y-2.5 text-xs ${
              isPrototype
                ? 'bg-[var(--surf2)] border-[var(--line)]'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[var(--mut)]">Theme Style</span>
              <span className="font-bold text-[var(--ink)]">
                {uiThemeStyle === 'prototype' ? 'Prototype UI' : 'Classic UI'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--mut)]">Color Mode</span>
              <span className="font-semibold text-[var(--ink)] capitalize">{themeMode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--mut)]">Resolved Shade</span>
              <span className="font-mono text-[var(--acc)] capitalize">{resolvedTheme}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--mut)]">Palette Accent</span>
              <span
                className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: 'var(--acc)' }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[var(--mut)] uppercase tracking-wider">
              Token Preview Swatches
            </span>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { name: 'Surface', bg: 'var(--surf)', border: 'var(--line)' },
                { name: 'Accent', bg: 'var(--acc)', border: 'transparent' },
                { name: 'Green', bg: 'var(--g)', border: 'transparent' },
                { name: 'Amber', bg: 'var(--a)', border: 'transparent' },
              ].map((sw) => (
                <div
                  key={sw.name}
                  className="rounded-lg p-2 text-center text-[10px] font-semibold border flex flex-col items-center gap-1 shadow-2xs"
                  style={{ backgroundColor: sw.bg, borderColor: sw.border }}
                >
                  <span className="text-[var(--ink)]">{sw.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-[var(--line)]">
            <button
              onClick={handleResetDemo}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>
      }
    >
      {/* Column 1: Main Content Settings Cards */}

      {/* 1. Theme Engine & Appearance Settings */}
      <div
        className={`rounded-2xl border p-6 shadow-xs space-y-5 transition-colors ${
          isPrototype
            ? 'bg-[var(--surf)] border-[var(--line)]'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--acc)]" />
              <span>Theme Style & Appearance Engine</span>
            </h2>
            <p className="text-xs text-[var(--mut)] mt-0.5">
              Switch seamlessly between our new simplified Prototype Theme and your saved Classic Theme.
            </p>
          </div>
          <span className="chip b text-xs font-bold">Dual Theme Active</span>
        </div>

        {/* UI Theme Style Switcher: Prototype Theme vs Classic Saved Theme */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--ink)] block">
            UI Theme Preset
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 'prototype' as UiThemeStyle,
                title: 'Prototype Theme (New)',
                badge: 'Recommended',
                desc: 'Clean 72px header, 9 primary sidebar tabs, 3-section layout, and Inter typography from Working Prototype.',
              },
              {
                id: 'classic' as UiThemeStyle,
                title: 'Classic Theme (Previous)',
                badge: 'Saved',
                desc: 'Original Launch Up theme with multi-palette selection, deep obsidian surfaces, and legacy layout.',
              },
            ].map((st) => {
              const isSelected = uiThemeStyle === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setUiThemeStyle(st.id)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? isPrototype
                        ? 'border-[var(--acc)] bg-[var(--surf2)] shadow-xs ring-2 ring-[var(--acc)]/20'
                        : 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : isPrototype
                      ? 'border-[var(--line)] bg-[var(--surf)] hover:bg-[var(--surf2)]'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--ink)] flex items-center gap-2">
                      <span>{st.title}</span>
                      <span className="chip b text-[10px]">{st.badge}</span>
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[var(--acc)]" />}
                  </div>
                  <p className="text-xs text-[var(--mut)] leading-relaxed">
                    {st.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Mode Selection (Light / Night / System) */}
        <div className="space-y-2 pt-2 border-t border-[var(--line)]">
          <label className="text-xs font-bold text-[var(--ink)] block">
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
                      ? isPrototype
                        ? 'border-[var(--acc)] bg-[var(--surf2)] shadow-xs ring-2 ring-[var(--acc)]/20'
                        : 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : isPrototype
                      ? 'border-[var(--line)] bg-[var(--surf)] hover:bg-[var(--surf2)]'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[var(--ink)] flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${m.iconColor}`} />
                      {m.label}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[var(--acc)]" />}
                  </div>
                  <span className="text-[11px] text-[var(--mut)] leading-snug">
                    {m.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Palette (5 Options) */}
        <div className="space-y-2 pt-2 border-t border-[var(--line)]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[var(--acc)]" />
              <span>Accent Color Palette</span>
            </label>
            <span className="text-[11px] text-[var(--mut)]">
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
                    ? isPrototype
                      ? 'border-[var(--acc)] bg-[var(--surf2)] shadow-xs ring-2 ring-[var(--acc)]/20'
                      : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                    : isPrototype
                    ? 'border-[var(--line)] bg-[var(--surf)] hover:bg-[var(--surf2)]'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                    style={{ backgroundColor: opt.color }}
                  />
                  <span className="text-xs font-semibold text-[var(--ink)] truncate">
                    {opt.label.split(' ')[0]}
                  </span>
                </div>
                {palette === opt.id && <Check className="w-3.5 h-3.5 text-[var(--acc)] shrink-0" />}
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
        className={`rounded-2xl border p-6 shadow-xs space-y-4 transition-colors ${
          isPrototype
            ? 'bg-[var(--surf)] border-[var(--line)]'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
        }`}
      >
        <h2 className="text-base font-bold text-[var(--ink)]">
          Workspace Branding & Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[var(--ink2)] block mb-1">
              Platform Name
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--surf2)] border border-[var(--line)] rounded-xl text-[var(--ink)] focus:outline-none focus:border-[var(--acc)]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--ink2)] block mb-1">
              Canonical Base URL
            </label>
            <input
              type="text"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--surf2)] border border-[var(--line)] rounded-xl text-[var(--ink)] focus:outline-none focus:border-[var(--acc)]"
            />
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="pt-3 border-t border-[var(--line)] space-y-3">
          <label className="text-xs font-bold text-[var(--ink)] block">
            Autonomous Notifications
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2.5 text-xs text-[var(--ink2)] cursor-pointer">
              <input
                type="checkbox"
                checked={whatsAppAlerts}
                onChange={(e) => setWhatsAppAlerts(e.target.checked)}
                className="rounded accent-indigo-600 w-4 h-4"
              />
              <span>WhatsApp Inbound Alerts</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-[var(--ink2)] cursor-pointer">
              <input
                type="checkbox"
                checked={gateAlerts}
                onChange={(e) => setGateAlerts(e.target.checked)}
                className="rounded accent-indigo-600 w-4 h-4"
              />
              <span>Gate Approval Requests</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-[var(--ink2)] cursor-pointer">
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
            className="btn pri btn-pri px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer hover:brightness-110"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </ThreeZoneScreenLayout>
  );
};
