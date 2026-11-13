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

  const tabMeta = getTabHeaderMeta(currentTab);
  const liveCount = Object.values(meshStatuses).filter(Boolean).length;

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

  const unreadAlerts = alerts.filter((a) => !a.read);

  const paletteOptions: { id: ColorPalette; label: string; color: string; desc: string }[] = [
    { id: 'indigo', label: 'Indigo Obsidian', color: '#6366f1', desc: 'Classic deep tech indigo' },
    { id: 'cyan', label: 'Cyber Cyan', color: '#06b6d4', desc: 'Futuristic electric teal' },
    { id: 'emerald', label: 'Emerald Matrix', color: '#10b981', desc: 'Terminal matrix jade green' },
    { id: 'amber', label: 'Sunset Amber', color: '#f59e0b', desc: 'Warm solar gold & amber' },
    { id: 'rose', label: 'Rose Amethyst', color: '#f43f5e', desc: 'Vibrant crimson & magenta' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0D1017]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Sidebar Toggle & Compact Tab Heading + Subtitle */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-4 overflow-hidden">
        <button
          id="sidebar-toggle-btn"
          onClick={() => setIsSidebarCollapsed((prev: boolean) => !prev)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none shrink-0"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex flex-col justify-center min-w-0 flex-1 overflow-hidden">
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight truncate">
            {tabMeta.title}
          </h1>
          <p
            title={tabMeta.subtitle}
            className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight truncate mt-0.5"
          >
            {tabMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-xs lg:max-w-sm mx-2 sm:mx-3 hidden md:block shrink-0">
        <button
          id="global-command-palette-btn"
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-[#111318] text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
          title={`Search clients, projects, apps (${shortcutLabel})`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="truncate">Search clients, projects, apps...</span>
          </div>
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 ml-2 shrink-0">
            {shortcutLabel}
          </kbd>
        </button>
      </div>

      {/* Right Actions: Mode Toggles, Palette, Notification Bell, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Mobile Search Icon Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="md:hidden p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          title={`Search (${shortcutLabel})`}
          aria-label="Open search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* 1. Light / Dark / System Mode Toggles */}
        <div className="hidden sm:flex items-center p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setThemeMode('light')}
            className={`p-1.5 rounded-lg transition-all ${
              themeMode === 'light'
                ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Light Mode"
            aria-label="Light Mode"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setThemeMode('dark')}
            className={`p-1.5 rounded-lg transition-all ${
              themeMode === 'dark'
                ? 'bg-white dark:bg-slate-800 text-indigo-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Night/Dark Mode"
            aria-label="Night/Dark Mode"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setThemeMode('system')}
            className={`p-1.5 rounded-lg transition-all ${
              themeMode === 'system'
                ? 'bg-white dark:bg-slate-800 text-sky-500 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="System Mode"
            aria-label="System Mode"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Color Palette Menu */}
        <div className="relative" ref={themeMenuRef}>
          <button
            id="theme-palette-btn"
            onClick={() => setShowThemeMenu((prev) => !prev)}
            className="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            title="Color Palette Presets"
            aria-label="Color Palette Presets"
          >
            <Palette className="w-4 h-4 text-indigo-500" />
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10 dark:ring-white/10"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg z-50 p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] animate-in fade-in duration-150">
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 px-1 text-slate-400">
                Color Palette (5 Themes)
              </span>
              <div className="space-y-1">
                {paletteOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPalette(opt.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      palette === opt.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold ring-1 ring-indigo-200 dark:ring-indigo-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 dark:border-white/10"
                        style={{ backgroundColor: opt.color }}
                      />
                      <div className="truncate">
                        <span className="block leading-tight">{opt.label}</span>
                        <span className="text-[10px] text-slate-400 block leading-tight">{opt.desc}</span>
                      </div>
                    </div>
                    {palette === opt.id && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-1.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Notification Bell Dropdown */}
        <div className="relative" ref={alertsMenuRef}>
          <button
            id="alerts-bell-btn"
            onClick={() => setShowAlertsDropdown((prev) => !prev)}
            className="relative p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            title="System Alerts & Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-xl z-50 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] animate-in fade-in duration-150">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifications</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    {unreadAlerts.length} unread
                  </span>
                </div>
                {unreadAlerts.length > 0 && (
                  <button
                    onClick={() => {
                      unreadAlerts.forEach((a) => markAlertAsRead(a.id));
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active notifications
                  </div>
                ) : (
                  alerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => markAlertAsRead(alert.id)}
                      className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                        alert.read
                          ? 'opacity-60 hover:opacity-100 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                          : 'bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/50'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {alert.type === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        ) : alert.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Info className="w-4 h-4 text-sky-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {alert.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {alert.timeAgo}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. User Profile Pill: AD Alex Doe Admin ⌄ */}
        <div className="relative" ref={profileMenuRef}>
          <button
            id="user-profile-menu-btn"
            onClick={() => setShowProfileDropdown((prev) => !prev)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center border border-slate-300 dark:border-slate-600">
              AD
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                Alex Doe
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">Admin</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Alex Doe</p>
                <p className="text-[11px] text-slate-400 truncate">admin@launchup.io</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-medium bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 rounded">
                  Super Administrator
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setCurrentTab('settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Workspace Settings
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('billing');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Billing & Subscriptions
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('system-design');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium flex items-center justify-between"
                >
                  <span>SDLC & System Architecture</span>
                  <Sparkles className="w-3 h-3" />
                </button>
              </div>
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                <button
                  onClick={() => {
                    setIsAddClientModalOpen(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  + New Client Intake
                </button>
                <button
                  onClick={() => {
                    resetDemoState();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-medium"
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
