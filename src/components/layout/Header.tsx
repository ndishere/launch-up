import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Search, Bell, Sun, Moon, Monitor, ChevronDown, CheckCircle2, 
  AlertTriangle, AlertCircle, Info, ExternalLink, Sparkles, Palette,
  Activity, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Theme, ThemeMode, ColorPalette } from '../../types';

export const Header: React.FC = () => {
  const { 
    theme, 
    setTheme,
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
    setCurrentTab,
    setIsCommandPaletteOpen,
    setIsAddClientModalOpen,
    resetDemoState,
    meshStatuses
  } = useApp();

  const liveCount = Object.values(meshStatuses).filter(Boolean).length;

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close theme dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    if (showThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showThemeMenu]);

  // OS detection for keyboard shortcut display (Ctrl K on Windows/Linux, ⌘K on macOS)
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl K';

  const unreadAlerts = alerts.filter(a => !a.read);

  const paletteOptions: { id: ColorPalette; label: string; color: string; desc: string }[] = [
    { id: 'indigo', label: 'Indigo Obsidian', color: '#6366f1', desc: 'Classic deep tech indigo' },
    { id: 'cyan', label: 'Cyber Cyan', color: '#06b6d4', desc: 'Futuristic electric teal' },
    { id: 'emerald', label: 'Emerald Matrix', color: '#10b981', desc: 'Terminal matrix jade green' },
    { id: 'amber', label: 'Sunset Amber', color: '#f59e0b', desc: 'Warm solar gold & amber' },
    { id: 'rose', label: 'Rose Amethyst', color: '#f43f5e', desc: 'Vibrant crimson & magenta' },
  ];

  return (
    <header className="sticky top-0 z-30 h-14 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0D1017]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Sidebar Toggle & Microservices Mesh Pill */}
      <div className="flex items-center gap-3">
        <button
          id="sidebar-toggle-btn"
          onClick={() => setIsSidebarCollapsed((prev: boolean) => !prev)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          onClick={() => setCurrentTab('team')}
          className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
          title="Microservices Mesh Control: Click to view Governance Gates & RBAC"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${liveCount > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="font-mono text-[11px]">
            {liveCount > 0 ? `${liveCount}/10 Services Live` : 'Mesh Ready'}
          </span>
        </button>
      </div>

      {/* Center/Right: Search, Quick Actions, Theme, Alerts, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Search Bar */}
        <div className="relative w-48 sm:w-64 md:w-72">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            id="global-search-input"
            type="text"
            placeholder={`Search... (${shortcutLabel})`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsCommandPaletteOpen(true);
            }}
            onClick={() => setIsCommandPaletteOpen(true)}
            onFocus={() => setIsCommandPaletteOpen(true)}
            className="w-full pl-8 pr-14 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 placeholder-slate-400 rounded-lg border border-slate-200/80 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111318] focus:outline-none transition-colors cursor-pointer"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="absolute inset-y-0 right-0 pr-1.5 flex items-center cursor-pointer"
            title={`Open search & command palette (${shortcutLabel})`}
            aria-label={`Open search & command palette (${shortcutLabel})`}
          >
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
              {shortcutLabel}
            </span>
          </button>
        </div>

        {/* Color Palette & Appearance Dropdown */}
        <div className="relative" ref={themeMenuRef}>
          <button
            id="theme-palette-btn"
            onClick={() => setShowThemeMenu(prev => !prev)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors flex items-center gap-1.5"
            title="Color Palettes & Theme Mode"
            aria-label="Color Palettes & Theme Mode"
          >
            <Palette className="w-5 h-5 text-palette" />
            <span 
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#0B0F17]"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 p-2.5 animate-in fade-in duration-150">
              {/* Mode Selector */}
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                  Appearance Mode
                </span>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`py-1.5 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      themeMode === 'light'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`py-1.5 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      themeMode === 'dark'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode('system')}
                    className={`py-1.5 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      themeMode === 'system'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5 text-sky-500" />
                    <span>System</span>
                  </button>
                </div>
              </div>

              {/* Palette Options */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                  Color Palette (5 Themes)
                </span>
                <div className="space-y-1">
                  {paletteOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setPalette(opt.id);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        palette === opt.id
                          ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold ring-1 ring-slate-300 dark:ring-slate-700'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 dark:border-white/10" 
                          style={{ backgroundColor: opt.color }}
                        />
                        <div className="truncate">
                          <span className="block leading-tight">{opt.label}</span>
                          <span className="text-[10px] text-slate-400 font-normal block leading-tight">{opt.desc}</span>
                        </div>
                      </div>
                      {palette === opt.id && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-1.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Dark/Light/System Toggle Button */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors relative"
          title={`Mode: ${themeMode} (Active: ${resolvedTheme}). Click to cycle Light → Dark → System.`}
          aria-label="Toggle theme mode"
        >
          {themeMode === 'system' ? (
            <div className="relative">
              <Monitor className="w-5 h-5 text-sky-500" />
              <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900" />
            </div>
          ) : resolvedTheme === 'light' ? (
            <Sun className="w-5 h-5 text-amber-500 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-400 transition-transform hover:-rotate-12" />
          )}
        </button>


        {/* Alerts Bell with Unread Badge */}
        <div className="relative">
          <button
            id="alerts-bell-btn"
            onClick={() => setShowAlertsDropdown((prev) => !prev)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
            title="System Alerts & Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-indigo-600 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Alerts Popup Menu */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">System Alerts</span>
                  <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                    {unreadAlerts.length} new
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCurrentTab('alerts');
                    setShowAlertsDropdown(false);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  View All
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {alerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => markAlertAsRead(alert.id)}
                    className={`p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex items-start gap-3 ${
                      !alert.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {alert.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                      {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {alert.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                      {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {alert.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">{alert.timeAgo}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill matching screenshot: AD Alex Doe, Admin ⌄ */}
        <div className="relative">
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
