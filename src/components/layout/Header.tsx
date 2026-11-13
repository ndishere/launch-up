import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Search, Bell, Sun, Moon, Monitor, ChevronDown, CheckCircle2, 
  AlertTriangle, AlertCircle, Info, ExternalLink, Sparkles, Palette,
  Activity, ShieldCheck, CheckCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Theme, ThemeMode, ColorPalette } from '../../types';
import { getTabHeaderMeta } from '../../constants/tabHeaders';

export const Header: React.FC = () => {
  const { 
    uiThemeStyle,
    setUiThemeStyle,
    themeMode,
    setThemeMode,
    palette,
    setPalette,
    resolvedTheme,
    toggleTheme, 
    isSidebarCollapsed, 
    setIsSidebarCollapsed, 
    searchQuery, 
    setSearchQuery,
    alerts,
    markAlertAsRead,
    currentTab,
    setCurrentTab,
    setIsCommandPaletteOpen,
    setIsAddClientModalOpen,
    resetDemoState,
    meshStatuses
  } = useApp();

  const isPrototype = uiThemeStyle === 'prototype';
  const liveCount = Object.values(meshStatuses).filter(Boolean).length;
  const tabMeta = getTabHeaderMeta(currentTab);

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const alertsMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
      if (alertsMenuRef.current && !alertsMenuRef.current.contains(e.target as Node)) {
        setShowAlertsDropdown(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // OS detection for keyboard shortcut display (Ctrl K on Windows/Linux, ⌘K on macOS)
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl K';

  // Plain-English notifications matching prototype + actual system alerts
  const [readDemoNotificationIds, setReadDemoNotificationIds] = useState<Set<string>>(new Set());

  const prototypeNotifications = [
    {
      id: 'proto-notif-1',
      title: 'Fresh Bite Café opened the preview',
      desc: 'Client spent 4m reviewing the mobile layout on 375px viewport.',
      timeAgo: '12m ago',
      type: 'success' as const,
      tab: 'clients' as const,
    },
    {
      id: 'proto-notif-2',
      title: 'Smile Dental Clinic is awaiting approval',
      desc: 'Gate 2 PRD & DPDP_INDIA checklist awaiting co-owner sign-off.',
      timeAgo: '45m ago',
      type: 'warning' as const,
      tab: 'team' as const,
    },
    {
      id: 'proto-notif-3',
      title: 'Apex Logistics triggered auto-healing hotfix',
      desc: 'SRE Agent healed shipping rate null error. Gate 5 PR created.',
      timeAgo: '2h ago',
      type: 'info' as const,
      tab: 'alerts' as const,
    },
    {
      id: 'proto-notif-4',
      title: 'Urban Fit Studio prototype ready for review',
      desc: 'Tailwind & Next.js landing page built with 88% reusable code.',
      timeAgo: '3h ago',
      type: 'success' as const,
      tab: 'projects' as const,
    },
  ];

  const unreadAlerts = alerts.filter((a) => !a.read);
  const unreadProtoCount = prototypeNotifications.filter((n) => !readDemoNotificationIds.has(n.id)).length;
  const totalUnreadCount = unreadAlerts.length + unreadProtoCount;

  const handleMarkAllRead = () => {
    alerts.forEach((a) => markAlertAsRead(a.id));
    setReadDemoNotificationIds(new Set(prototypeNotifications.map((n) => n.id)));
  };

  const paletteOptions: { id: ColorPalette; label: string; color: string; desc: string }[] = [
    { id: 'indigo', label: 'Indigo Obsidian', color: '#6366f1', desc: 'Classic deep tech indigo' },
    { id: 'cyan', label: 'Cyber Cyan', color: '#06b6d4', desc: 'Futuristic electric teal' },
    { id: 'emerald', label: 'Emerald Matrix', color: '#10b981', desc: 'Terminal matrix jade green' },
    { id: 'amber', label: 'Sunset Amber', color: '#f59e0b', desc: 'Warm solar gold & amber' },
    { id: 'rose', label: 'Rose Amethyst', color: '#f43f5e', desc: 'Vibrant crimson & magenta' },
  ];

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-150 px-4 sm:px-6 flex items-center justify-between ${
        isPrototype
          ? 'h-[72px] bg-[var(--surf)] border-b border-[var(--line)] text-[var(--ink)] shadow-xs'
          : 'h-14 bg-white/90 dark:bg-[#0D1017]/90 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md text-slate-800 dark:text-slate-200'
      }`}
    >
      {/* Left: Sidebar Toggle & Compact Tab Heading + Subtitle */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-4 overflow-hidden">
        <button
          id="sidebar-toggle-btn"
          onClick={() => setIsSidebarCollapsed((prev: boolean) => !prev)}
          className={`p-2 rounded-xl transition-colors focus:outline-none shrink-0 ${
            isPrototype
              ? 'text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--surf2)] border border-[var(--line)]'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex flex-col justify-center min-w-0 flex-1 overflow-hidden">
          <h1
            className={`text-sm sm:text-base font-bold tracking-tight leading-tight truncate ${
              isPrototype ? 'text-[var(--ink)]' : 'text-slate-900 dark:text-white'
            }`}
          >
            {tabMeta.title}
          </h1>
          <p
            title={tabMeta.subtitle}
            className={`text-[11px] sm:text-xs leading-tight truncate mt-0.5 ${
              isPrototype ? 'text-[var(--mut)]' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {tabMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Command Palette Trigger (Search clients, projects, apps...) */}
      <div className="flex-1 max-w-xs lg:max-w-sm mx-2 sm:mx-3 hidden md:block shrink-0">
        <button
          id="global-command-palette-btn"
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs rounded-xl border transition-all cursor-pointer ${
            isPrototype
              ? 'bg-[var(--surf2)] hover:bg-[var(--surf)] border-[var(--line)] text-[var(--mut)] hover:border-[var(--acc)] hover:text-[var(--ink)]'
              : 'bg-slate-50 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-[#111318] border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400'
          }`}
          title={`Search clients, projects, apps (${shortcutLabel})`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="truncate">Search clients, projects, apps...</span>
          </div>
          <kbd
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ml-2 shrink-0 ${
              isPrototype
                ? 'bg-[var(--surf)] border-[var(--line)] text-[var(--mut)]'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            {shortcutLabel}
          </kbd>
        </button>
      </div>

      {/* Right Actions: Theme Switcher Pill, Mode Toggles, Notification Bell, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="md:hidden p-2 rounded-xl border border-[var(--line)] text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--surf2)]"
          title={`Search (${shortcutLabel})`}
          aria-label="Open search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* 1. UI Theme Preset Switcher Pill (Prototype UI vs Classic UI) */}
        <button
          id="ui-theme-preset-switcher"
          type="button"
          onClick={() => setUiThemeStyle(uiThemeStyle === 'prototype' ? 'classic' : 'prototype')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            isPrototype
              ? 'bg-[var(--acc)] text-white border-transparent shadow-xs hover:brightness-110'
              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800 hover:bg-indigo-100'
          }`}
          title={`Active Theme: ${uiThemeStyle === 'prototype' ? 'Prototype UI (New)' : 'Classic UI (Previous)'}. Click to switch.`}
          aria-label="Switch UI Theme Style"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Theme:</span>
          <span>{isPrototype ? 'Prototype UI' : 'Classic UI'}</span>
        </button>

        {/* 2. Light / Night / System Mode Toggle Buttons */}
        <div
          className={`hidden sm:flex items-center p-0.5 rounded-xl border ${
            isPrototype
              ? 'bg-[var(--surf2)] border-[var(--line)]'
              : 'bg-slate-100 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <button
            type="button"
            data-mode="light"
            onClick={() => setThemeMode('light')}
            className={`p-1.5 rounded-lg transition-all ${
              themeMode === 'light'
                ? isPrototype
                  ? 'bg-[var(--surf)] text-amber-600 shadow-xs font-bold'
                  : 'bg-white dark:bg-slate-800 text-amber-600 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Light Mode"
            aria-label="Light Mode"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            data-mode="dark"
            onClick={() => setThemeMode('dark')}
            className={`p-1.5 rounded-lg transition-all ${
              themeMode === 'dark'
                ? isPrototype
                  ? 'bg-[var(--surf)] text-indigo-400 shadow-xs font-bold'
                  : 'bg-white dark:bg-slate-800 text-indigo-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Night/Dark Mode"
            aria-label="Night/Dark Mode"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            type="button"
            data-mode="system"
            onClick={() => setThemeMode('system')}
            className={`p-1.5 rounded-lg transition-all ${
              themeMode === 'system'
                ? isPrototype
                  ? 'bg-[var(--surf)] text-sky-500 shadow-xs font-bold'
                  : 'bg-white dark:bg-slate-800 text-sky-500 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="System Mode"
            aria-label="System Mode"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette Menu (Available in Classic or Prototype mode) */}
        <div className="relative" ref={themeMenuRef}>
          <button
            id="theme-palette-btn"
            onClick={() => setShowThemeMenu((prev) => !prev)}
            className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 border ${
              isPrototype
                ? 'border-[var(--line)] text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--surf2)]'
                : 'border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Color Palette Presets"
            aria-label="Color Palette Presets"
          >
            <Palette className="w-4 h-4 text-palette" />
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10 dark:ring-white/10"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            />
          </button>

          {showThemeMenu && (
            <div
              className={`absolute right-0 mt-2 w-64 rounded-xl shadow-lg z-50 p-2.5 border animate-in fade-in duration-150 ${
                isPrototype
                  ? 'bg-[var(--surf)] border-[var(--line)] text-[var(--ink)]'
                  : 'bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 px-1 opacity-60">
                Color Palette (5 Themes)
              </span>
              <div className="space-y-1">
                {paletteOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPalette(opt.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      palette === opt.id
                        ? 'bg-[var(--surf2)] text-[var(--ink)] font-semibold ring-1 ring-[var(--line)]'
                        : 'hover:bg-[var(--surf2)] text-[var(--ink2)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 dark:border-white/10"
                        style={{ backgroundColor: opt.color }}
                      />
                      <div className="truncate">
                        <span className="block leading-tight">{opt.label}</span>
                        <span className="text-[10px] opacity-60 block leading-tight">{opt.desc}</span>
                      </div>
                    </div>
                    {palette === opt.id && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-1.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Notification Bell Dropdown (48x48px) with Unread Badge & Mark All Read */}
        <div className="relative" ref={alertsMenuRef}>
          <button
            id="alerts-bell-btn"
            onClick={() => setShowAlertsDropdown((prev) => !prev)}
            className={`relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border transition-colors ${
              isPrototype
                ? 'bg-[var(--surf2)] border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surf)]'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
            title="System Alerts & Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--mut)]" />
            {totalUnreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 min-w-4 h-4 px-1 text-[10px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900"
                style={{ backgroundColor: 'var(--badge)' }}
              >
                {totalUnreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showAlertsDropdown && (
            <div
              className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-xl z-50 overflow-hidden border animate-in fade-in slide-in-from-top-2 duration-150 ${
                isPrototype
                  ? 'bg-[var(--surf)] border-[var(--line)] text-[var(--ink)]'
                  : 'bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800'
              }`}
            >
              <div
                className={`p-3.5 border-b flex items-center justify-between ${
                  isPrototype ? 'border-[var(--line)] bg-[var(--surf2)]' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">Notifications</span>
                  <span className="chip a text-[10px]">
                    {totalUnreadCount} unread
                  </span>
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-[var(--acc)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[var(--line)]">
                {/* Prototype Interactive Client Notifications */}
                {prototypeNotifications.map((n) => {
                  const isRead = readDemoNotificationIds.has(n.id);
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        setReadDemoNotificationIds((prev) => new Set([...prev, n.id]));
                        setCurrentTab(n.tab);
                        setShowAlertsDropdown(false);
                      }}
                      className={`p-3 text-left cursor-pointer transition-colors flex items-start gap-3 hover:bg-[var(--surf2)] ${
                        !isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : n.type === 'info' ? (
                          <Info className="w-4 h-4 text-indigo-500" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold truncate text-[var(--ink)]">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-[var(--mut)] shrink-0 ml-2">{n.timeAgo}</span>
                        </div>
                        <p className="text-[11px] text-[var(--mut)] mt-0.5 line-clamp-2">
                          {n.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* System Alerts */}
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      markAlertAsRead(alert.id);
                      setCurrentTab('alerts');
                      setShowAlertsDropdown(false);
                    }}
                    className={`p-3 text-left hover:bg-[var(--surf2)] cursor-pointer transition-colors flex items-start gap-3 ${
                      !alert.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {alert.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                      {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {alert.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                      {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold truncate text-[var(--ink)]">{alert.title}</p>
                        <span className="text-[10px] text-[var(--mut)] shrink-0 ml-2">{alert.timeAgo}</span>
                      </div>
                      <p className="text-[11px] text-[var(--mut)] mt-0.5 line-clamp-2">{alert.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={profileMenuRef}>
          <button
            id="user-profile-menu-btn"
            onClick={() => setShowProfileDropdown((prev) => !prev)}
            className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-colors border ${
              isPrototype
                ? 'border-[var(--line)] bg-[var(--surf2)] hover:bg-[var(--surf)]'
                : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--acc)] text-white font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-[var(--ink)]">Alex Doe</span>
              <span className="text-[10px] text-[var(--mut)] leading-tight">Admin / Owner</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--mut)] ml-0.5" />
          </button>

          {showProfileDropdown && (
            <div
              className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-50 p-1.5 border animate-in fade-in duration-150 ${
                isPrototype
                  ? 'bg-[var(--surf)] border-[var(--line)] text-[var(--ink)]'
                  : 'bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="px-3 py-2 border-b border-[var(--line)]">
                <p className="text-xs font-bold">Alex Doe</p>
                <p className="text-[11px] text-[var(--mut)] truncate">admin@launchup.io</p>
                <span className="chip b text-[9px] mt-1">Super Administrator</span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setCurrentTab('settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[var(--ink2)] hover:bg-[var(--surf2)] rounded-lg"
                >
                  Workspace Settings
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('billing');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[var(--ink2)] hover:bg-[var(--surf2)] rounded-lg"
                >
                  Billing & Subscriptions
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('system-design');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[var(--acc)] hover:bg-[var(--surf2)] rounded-lg font-medium flex items-center justify-between"
                >
                  <span>SDLC & System Architecture</span>
                  <Sparkles className="w-3 h-3" />
                </button>
              </div>
              <div className="pt-1 border-t border-[var(--line)] space-y-0.5">
                <button
                  onClick={() => {
                    setIsAddClientModalOpen(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[var(--ink2)] hover:bg-[var(--surf2)] rounded-lg"
                >
                  + New Client Intake
                </button>
                <button
                  onClick={() => {
                    resetDemoState();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-medium"
                >
                  Reset Demo State
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
