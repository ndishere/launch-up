import React, { useState } from 'react';
import {
  PenTool,
  Code2,
  Upload,
  Globe,
  Layers,
  Sparkles,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Eye,
  Settings,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

import { useApp } from '../../context/AppContext';
import {
  FigCraftComponentNode,
  compileFigCraftToReact,
  validateMobileWidthSafety,
  generateFigCraftSvgDiagram,
} from '../../lib/figcraft-adapter';
import { buildLandingWeb, buildMobileApp } from '../../services/api';

export const NoCodeEditorTab: React.FC = () => {
  const { figcraftProject, setFigCraftProject } = useApp();

  const [activeMode, setActiveMode] = useState<
    'canvas' | 'code' | 'figma-import' | 'figcraft-embed'
  >('canvas');

  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    figcraftProject.rootComponents[0]?.id || null
  );

  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState<{
    webGitSha?: string;
    mobileGitSha?: string;
    stagingUrl?: string;
    apkUrl?: string;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [importedJson, setImportedJson] = useState('');

  // Selected Component
  const selectedComponent = figcraftProject.rootComponents.find(
    (c) => c.id === selectedComponentId
  );

  // Width safety check
  const widthSafety = validateMobileWidthSafety(figcraftProject.rootComponents);

  // Update component prop
  const handleUpdateProp = (key: string, value: any) => {
    if (!selectedComponentId) return;
    setFigCraftProject((prev) => ({
      ...prev,
      rootComponents: prev.rootComponents.map((c) =>
        c.id === selectedComponentId ? { ...c, props: { ...c.props, [key]: value } } : c
      ),
    }));
  };

  // Reorder component
  const moveComponent = (index: number, direction: 'up' | 'down') => {
    const newComponents = [...figcraftProject.rootComponents];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newComponents.length) return;
    const temp = newComponents[index];
    newComponents[index] = newComponents[targetIndex];
    newComponents[targetIndex] = temp;
    setFigCraftProject((prev) => ({ ...prev, rootComponents: newComponents }));
  };

  // Delete component
  const deleteComponent = (id: string) => {
    setFigCraftProject((prev) => ({
      ...prev,
      rootComponents: prev.rootComponents.filter((c) => c.id !== id),
    }));
    if (selectedComponentId === id) setSelectedComponentId(null);
  };

  // Add component
  const addComponent = (type: FigCraftComponentNode['type']) => {
    const newId = `comp-${type}-${Date.now().toString().slice(-4)}`;
    let newComp: FigCraftComponentNode;

    switch (type) {
      case 'pricing':
        newComp = {
          id: newId,
          type: 'pricing',
          name: 'Pricing Tiers',
          props: {
            title: 'Simple, Transparent Pricing',
            tier1Price: '$29/mo',
            tier2Price: '$99/mo',
          },
          layout: { display: 'grid', gap: 16, padding: 24 },
        };
        break;
      case 'whatsapp-cta':
        newComp = {
          id: newId,
          type: 'whatsapp-cta',
          name: 'WhatsApp Floating CTA',
          props: { label: 'Chat on WhatsApp', number: '+919876543210' },
          layout: { display: 'flex' },
        };
        break;
      case 'account-deletion':
        newComp = {
          id: newId,
          type: 'account-deletion',
          name: 'Account Deletion Screen',
          props: {},
          layout: { display: 'flex', direction: 'column' },
        };
        break;
      default:
        newComp = {
          id: newId,
          type: 'hero',
          name: 'New Section',
          props: { headline: 'Brand Headline' },
          layout: { display: 'flex', direction: 'column', gap: 16, padding: 24 },
        };
    }

    setFigCraftProject((prev) => ({
      ...prev,
      rootComponents: [...prev.rootComponents, newComp],
    }));
    setSelectedComponentId(newId);
  };

  // Compile and Push to Staging (Calls MOD-03 and MOD-04)
  const handleCompileAndPush = async () => {
    setIsCompiling(true);
    try {
      const webRes = await buildLandingWeb({
        project_id: 'proj-0001-0000-0000-000000000001',
        brand_kit: { name: figcraftProject.projectName, tokens: figcraftProject.tokens },
        routes: ['/'],
        seo_metadata: { title: figcraftProject.projectName },
        ga4_measurement_id: figcraftProject.metadata.ga4MeasurementId,
        compliance_flags: figcraftProject.metadata.complianceFlags,
      });

      const mobileRes = await buildMobileApp({
        project_id: 'proj-0001-0000-0000-000000000001',
        app_name: figcraftProject.projectName,
        package_id: 'com.launchup.express',
        openapi_spec_url: 'https://api.launchup.internal/openapi.yaml',
        brand_kit: { name: figcraftProject.projectName },
      });

      setCompileResult({
        webGitSha: webRes.data.approval_gate_id ? webRes.data.approval_gate_id.slice(-8) : 'c8f12a9e',
        mobileGitSha: mobileRes.data.approval_gate_id ? mobileRes.data.approval_gate_id.slice(-8) : 'd4e5f678',
        stagingUrl: webRes.data.staging_url,
        apkUrl: mobileRes.data.signed_apk_url,
      });
    } catch (err: any) {
      alert('Compilation error: ' + err.message);
    } finally {
      setIsCompiling(false);
    }
  };

  // Compile to React code
  const generatedReactCode = compileFigCraftToReact(figcraftProject);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedReactCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importedJson);
      if (parsed.tokens && parsed.rootComponents) {
        setFigCraftProject(parsed);
        setActiveMode('canvas');
        alert('FigCraft project loaded successfully!');
      } else {
        alert('Invalid FigCraft JSON schema: Missing tokens or rootComponents');
      }
    } catch (e: any) {
      alert('Invalid JSON: ' + e.message);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Bar: Mode Switcher & Compile Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-600/20 text-pink-400 border border-pink-500/30">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              FigCraft No-Code Design Studio
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                storytold/figcraft + MOD-03/04
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Code-driven design tokens, auto-layout, and direct staging deployment for Web & Android.
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveMode('canvas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'canvas' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Design Canvas
          </button>
          <button
            onClick={() => setActiveMode('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'code' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            React Dev Mode
          </button>
          <button
            onClick={() => setActiveMode('figma-import')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'figma-import' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Import Tokens / JSON
          </button>
          <button
            onClick={() => setActiveMode('figcraft-embed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'figcraft-embed' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Architecture SVG
          </button>
        </div>

        {/* Compile & Push to Staging Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCompileAndPush}
            disabled={isCompiling}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-600/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Sparkles className={`w-4 h-4 ${isCompiling ? 'animate-spin' : ''}`} />
            {isCompiling ? 'Compiling Artifacts...' : 'Compile & Push to Staging'}
          </button>
        </div>
      </div>

      {/* Staging Deployment Banner */}
      {compileResult && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>Deployed Successfully:</strong> Web SHA <code className="text-white font-mono">{compileResult.webGitSha}</code> | Android SHA <code className="text-white font-mono">{compileResult.mobileGitSha}</code>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={compileResult.stagingUrl}
              target="_blank"
              rel="noreferrer"
              className="underline text-emerald-200 hover:text-white flex items-center gap-1 font-semibold"
            >
              Open Web Preview <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={compileResult.apkUrl}
              target="_blank"
              rel="noreferrer"
              className="underline text-emerald-200 hover:text-white flex items-center gap-1 font-semibold"
            >
              Download Signed APK <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Main Workspace (3-Column for Canvas Mode) */}
      {activeMode === 'canvas' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Component & Layer Tree */}
          <div className="w-72 border-r border-slate-800 bg-slate-900/50 p-4 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Layers & Components</span>
                <span className="text-[10px] text-slate-500 font-mono">{figcraftProject.rootComponents.length} items</span>
              </div>

              <div className="mt-3 space-y-2">
                {figcraftProject.rootComponents.map((comp, idx) => (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedComponentId(comp.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                      selectedComponentId === comp.id
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white font-semibold'
                        : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="truncate">{comp.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveComponent(idx, 'up');
                        }}
                        className="p-1 hover:text-white text-slate-500"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveComponent(idx, 'down');
                        }}
                        className="p-1 hover:text-white text-slate-500"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteComponent(comp.id);
                        }}
                        className="p-1 hover:text-rose-400 text-slate-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Component Menu */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Insert Component
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => addComponent('hero')}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left text-slate-300 flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3 text-indigo-400" /> Hero
                  </button>
                  <button
                    onClick={() => addComponent('pricing')}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left text-slate-300 flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3 text-indigo-400" /> Pricing
                  </button>
                  <button
                    onClick={() => addComponent('whatsapp-cta')}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left text-slate-300 flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" /> WhatsApp
                  </button>
                  <button
                    onClick={() => addComponent('account-deletion')}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left text-slate-300 flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3 text-rose-400" /> Deletion
                  </button>
                </div>
              </div>
            </div>

            {/* Zero-Overflow Validator Warning */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
              <div className="flex items-center gap-2 mb-1">
                {widthSafety.isSafe ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span className="font-bold text-slate-300">Mobile Width Safety</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                {widthSafety.isSafe
                  ? 'All containers adapt smoothly within 375px viewport.'
                  : widthSafety.violatingComponents[0]}
              </p>
            </div>
          </div>

          {/* Center Canvas: WYSIWYG Artboard */}
          <div className="flex-1 bg-slate-950 p-6 overflow-y-auto flex flex-col items-center">
            <div
              dir={figcraftProject.tokens.direction}
              className="w-full max-w-3xl min-h-[580px] bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl p-6 relative transition-all"
            >
              {/* Artboard Frame Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400 mb-6 font-mono">
                <span>Canvas: {figcraftProject.projectName}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-indigo-400">
                  dir={figcraftProject.tokens.direction}
                </span>
              </div>

              {/* Render Components */}
              <div className="space-y-6">
                {figcraftProject.rootComponents.map((comp) => {
                  const isSelected = selectedComponentId === comp.id;

                  return (
                    <div
                      key={comp.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComponentId(comp.id);
                      }}
                      className={`relative p-4 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-indigo-500 bg-indigo-950/20 shadow-md'
                          : 'hover:bg-slate-800/40 border border-transparent hover:border-slate-800'
                      }`}
                    >
                      {/* Selection Bounding Guide */}
                      {isSelected && (
                        <div className="absolute -top-3 right-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-600 text-white shadow">
                          {comp.name}
                        </div>
                      )}

                      {comp.type === 'hero' && (
                        <div className="text-center py-8 space-y-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {comp.props.badgeText || '⚡ High-Velocity Logistics'}
                          </span>
                          <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            {comp.props.headline || 'Your Headline Here'}
                          </h1>
                          <p className="text-sm text-slate-400 max-w-xl mx-auto">
                            {comp.props.subheadline || 'Subheadline description for the application.'}
                          </p>
                          <div>
                            <button className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md">
                              {comp.props.ctaText || 'Get Started'}
                            </button>
                          </div>
                        </div>
                      )}

                      {comp.type === 'features' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-4">
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                            <h4 className="text-xs font-bold text-white mb-1">Fast Delivery</h4>
                            <p className="text-[11px] text-slate-400">Microservice real-time parcel routing.</p>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                            <h4 className="text-xs font-bold text-white mb-1">Android Suite</h4>
                            <p className="text-[11px] text-slate-400">Play Store certified Data Safety CSV.</p>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                            <h4 className="text-xs font-bold text-white mb-1">RLS Isolation</h4>
                            <p className="text-[11px] text-slate-400">PostgreSQL row security policies.</p>
                          </div>
                        </div>
                      )}

                      {comp.type === 'pricing' && (
                        <div className="py-4 space-y-3">
                          <h3 className="text-sm font-bold text-white text-center">
                            {comp.props.title || 'Pricing Tiers'}
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                              <span className="text-xs font-bold text-indigo-400">Standard Tier</span>
                              <div className="text-xl font-extrabold text-white mt-1">
                                {comp.props.tier1Price || '$29/mo'}
                              </div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 text-center">
                              <span className="text-xs font-bold text-pink-400">Enterprise Pro</span>
                              <div className="text-xl font-extrabold text-white mt-1">
                                {comp.props.tier2Price || '$99/mo'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {comp.type === 'cookie-banner' && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-300 text-[11px]">
                            🍪 Essential cookies active for DPDP India 2023 & EU GDPR compliance.
                          </span>
                          <button className="px-3 py-1 rounded bg-indigo-600 text-white font-semibold text-[10px]">
                            Accept
                          </button>
                        </div>
                      )}

                      {comp.type === 'whatsapp-cta' && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                          <MessageSquare className="w-4 h-4 text-emerald-400" />
                          <span>WhatsApp Concierge: {comp.props.number || '+919876543210'}</span>
                        </div>
                      )}

                      {comp.type === 'account-deletion' && (
                        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs">
                          <div className="flex items-center gap-2 font-bold mb-1">
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                            <span>Google Play Policy Account Deletion (/settings/delete-account)</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Permanent erasure proof endpoint active under Google Play Store policy.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Inspector: Brand Styling & Component Props */}
          <div className="w-80 border-l border-slate-800 bg-slate-900/50 p-4 overflow-y-auto space-y-6">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider">
                <Settings className="w-4 h-4 text-indigo-400" />
                Component Inspector
              </div>

              {selectedComponent ? (
                <div className="mt-4 space-y-4 text-xs">
                  <div>
                    <label className="text-slate-400 font-medium">Component Title</label>
                    <input
                      type="text"
                      value={selectedComponent.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFigCraftProject((prev) => ({
                          ...prev,
                          rootComponents: prev.rootComponents.map((c) =>
                            c.id === selectedComponent.id ? { ...c, name: val } : c
                          ),
                        }));
                      }}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                    />
                  </div>

                  {selectedComponent.type === 'hero' && (
                    <>
                      <div>
                        <label className="text-slate-400 font-medium">Headline</label>
                        <input
                          type="text"
                          value={selectedComponent.props.headline || ''}
                          onChange={(e) => handleUpdateProp('headline', e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-medium">Subheadline</label>
                        <textarea
                          rows={3}
                          value={selectedComponent.props.subheadline || ''}
                          onChange={(e) => handleUpdateProp('subheadline', e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-medium">CTA Button Text</label>
                        <input
                          type="text"
                          value={selectedComponent.props.ctaText || ''}
                          onChange={(e) => handleUpdateProp('ctaText', e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                        />
                      </div>
                    </>
                  )}

                  {selectedComponent.type === 'whatsapp-cta' && (
                    <div>
                      <label className="text-slate-400 font-medium">Phone Number (E.164)</label>
                      <input
                        type="text"
                        value={selectedComponent.props.number || ''}
                        onChange={(e) => handleUpdateProp('number', e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-mono"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-500">Select a component to inspect its properties.</p>
              )}
            </div>

            {/* Global Design Tokens & Settings */}
            <div className="pt-4 border-t border-slate-800 space-y-4 text-xs">
              <span className="font-bold text-white uppercase tracking-wider block">Global Brand Tokens</span>

              <div>
                <label className="text-slate-400 font-medium">Layout Direction</label>
                <div className="mt-1 flex gap-2">
                  <button
                    onClick={() =>
                      setFigCraftProject((p) => ({
                        ...p,
                        tokens: { ...p.tokens, direction: 'ltr' },
                      }))
                    }
                    className={`flex-1 py-1.5 rounded-lg font-semibold border ${
                      figcraftProject.tokens.direction === 'ltr'
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    LTR (English)
                  </button>
                  <button
                    onClick={() =>
                      setFigCraftProject((p) => ({
                        ...p,
                        tokens: { ...p.tokens, direction: 'rtl' },
                      }))
                    }
                    className={`flex-1 py-1.5 rounded-lg font-semibold border ${
                      figcraftProject.tokens.direction === 'rtl'
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    RTL (Arabic)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">GA4 Measurement ID</label>
                <input
                  type="text"
                  value={figcraftProject.metadata.ga4MeasurementId || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFigCraftProject((p) => ({
                      ...p,
                      metadata: { ...p.metadata, ga4MeasurementId: val },
                    }));
                  }}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: REACT DEV CODE */}
      {activeMode === 'code' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Auto-Compiled TypeScript / React Source
                </h3>
                <p className="text-xs text-slate-400">
                  Ready for injection into golden-web-landing and Fastify template renderers.
                </p>
              </div>
              <button
                onClick={copyCode}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied' : 'Copy React Code'}
              </button>
            </div>
            <pre className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[calc(100vh-14rem)]">
              {generatedReactCode}
            </pre>
          </div>
        </div>
      )}

      {/* MODE 3: IMPORT FIGMA / FIGCRAFT TOKENS */}
      {activeMode === 'figma-import' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-pink-400" />
                Import FigCraft Design Tokens (.figcraft.json / Figma JSON)
              </h3>
              <p className="text-xs text-slate-400">
                Paste JSON design tokens or a project schema to populate the visual artboard.
              </p>
            </div>
            <textarea
              value={importedJson}
              onChange={(e) => setImportedJson(e.target.value)}
              rows={12}
              placeholder={JSON.stringify(figcraftProject, null, 2)}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleImportJson}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md"
            >
              Parse & Apply FigCraft Schema
            </button>
          </div>
        </div>
      )}

      {/* MODE 4: FIGCRAFT ARCHITECTURE SVG EMBED */}
      {activeMode === 'figcraft-embed' && (
        <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center">
          <div className="max-w-4xl w-full space-y-4">
            <h3 className="text-sm font-bold text-white">FigCraft Architectural SVG Flow Diagram</h3>
            <div
              className="h-96 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl"
              dangerouslySetInnerHTML={{
                __html: generateFigCraftSvgDiagram('OmniRoute Multi-Tenant Architecture', [
                  { name: 'clients', columns: ['id: uuid', 'company_name: text', 'country_code: char(2)'], isRls: true },
                  { name: 'projects', columns: ['id: uuid', 'name: text', 'monthly_budget_usd: numeric'], isRls: true },
                  { name: 'project_orders', columns: ['id: uuid', 'project_id: uuid', 'payload: jsonb'], isRls: true },
                ]),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
