import React, { useState } from 'react';
import {
  PenTool,
  Code2,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  MessageSquare,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';

import { useApp } from '../../context/AppContext';
import {
  FigCraftComponentNode,
  compileFigCraftToReact,
  validateMobileWidthSafety,
  generateFigCraftSvgDiagram,
} from '../../lib/figcraft-adapter';
import { buildLandingWeb, buildMobileApp } from '../../services/api';

interface NoCodeEditorTabProps {
  projectId?: string;
  projectName?: string;
  embedded?: boolean;
}

export const NoCodeEditorTab: React.FC<NoCodeEditorTabProps> = ({
  projectId,
  projectName,
  embedded = false,
}) => {
  const { figcraftProject, setFigCraftProject, activeCanvasProjectId } = useApp();
  const targetProjectId = projectId || activeCanvasProjectId || 'proj-0001-0000-0000-000000000001';
  const displayName = projectName || figcraftProject.projectName;

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

  const selectedComponent = figcraftProject.rootComponents.find(
    (c) => c.id === selectedComponentId
  );

  const widthSafety = validateMobileWidthSafety(figcraftProject.rootComponents);

  const handleUpdateProp = (key: string, value: any) => {
    if (!selectedComponentId) return;
    setFigCraftProject((prev) => ({
      ...prev,
      rootComponents: prev.rootComponents.map((c) =>
        c.id === selectedComponentId ? { ...c, props: { ...c.props, [key]: value } } : c
      ),
    }));
  };

  const moveComponent = (index: number, direction: 'up' | 'down') => {
    const newComponents = [...figcraftProject.rootComponents];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newComponents.length) return;
    const temp = newComponents[index];
    newComponents[index] = newComponents[targetIndex];
    newComponents[targetIndex] = temp;
    setFigCraftProject((prev) => ({ ...prev, rootComponents: newComponents }));
  };

  const deleteComponent = (id: string) => {
    setFigCraftProject((prev) => ({
      ...prev,
      rootComponents: prev.rootComponents.filter((c) => c.id !== id),
    }));
    if (selectedComponentId === id) setSelectedComponentId(null);
  };

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

  const handleCompileAndPush = async () => {
    setIsCompiling(true);
    try {
      const webRes = await buildLandingWeb({
        project_id: targetProjectId,
        brand_kit: { name: displayName, tokens: figcraftProject.tokens },
        routes: ['/'],
        seo_metadata: { title: displayName },
        ga4_measurement_id: figcraftProject.metadata.ga4MeasurementId,
        compliance_flags: figcraftProject.metadata.complianceFlags,
      });

      const mobileRes = await buildMobileApp({
        project_id: targetProjectId,
        app_name: displayName,
        package_id: 'com.launchup.express',
        openapi_spec_url: 'https://api.launchup.internal/openapi.yaml',
        brand_kit: { name: displayName },
      });

      setCompileResult({
        webGitSha: webRes.data.approval_gate_id
          ? webRes.data.approval_gate_id.slice(-8)
          : 'c8f12a9e',
        mobileGitSha: mobileRes.data.approval_gate_id
          ? mobileRes.data.approval_gate_id.slice(-8)
          : 'd4e5f678',
        stagingUrl: webRes.data.staging_url,
        apkUrl: mobileRes.data.signed_apk_url,
      });
    } catch (err: any) {
      alert('Compilation error: ' + err.message);
    } finally {
      setIsCompiling(false);
    }
  };

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
      } else {
        alert('Invalid FigCraft JSON schema: Missing tokens or rootComponents');
      }
    } catch (e: any) {
      alert('Invalid JSON: ' + e.message);
    }
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-[#111318] text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden ${
        embedded ? 'min-h-[640px]' : 'h-[calc(100vh-5.5rem)]'
      }`}
    >
      {/* Clean Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0D1017]">
        <div className="flex items-center gap-2.5">
          <PenTool className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              FigCraft Design Studio
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {displayName} · Design tokens, visual layers & React/Android export
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200/80 dark:border-slate-800">
          {[
            { id: 'canvas', label: 'Canvas' },
            { id: 'code', label: 'React Code' },
            { id: 'figma-import', label: 'Import JSON' },
            { id: 'figcraft-embed', label: 'Schema SVG' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id as any)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeMode === m.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleCompileAndPush}
          disabled={isCompiling}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
          <span>{isCompiling ? 'Compiling...' : 'Push to Staging'}</span>
        </button>
      </div>

      {/* Deployment Confirmation Strip */}
      {compileResult && (
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-200/70 dark:border-emerald-800/60 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              Deployed: Web <code className="font-mono font-semibold">{compileResult.webGitSha}</code> · Android{' '}
              <code className="font-mono font-semibold">{compileResult.mobileGitSha}</code>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={compileResult.stagingUrl}
              target="_blank"
              rel="noreferrer"
              className="underline hover:opacity-80 inline-flex items-center gap-1 font-medium"
            >
              Web Preview <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={compileResult.apkUrl}
              target="_blank"
              rel="noreferrer"
              className="underline hover:opacity-80 inline-flex items-center gap-1 font-medium"
            >
              Signed APK <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* MODE 1: 3-COLUMN CANVAS */}
      {activeMode === 'canvas' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
          {/* Left Panel: Layer Tree */}
          <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#0D1017] p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-slate-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Layers
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {figcraftProject.rootComponents.length}
                </span>
              </div>

              <div className="mt-2.5 space-y-1.5">
                {figcraftProject.rootComponents.map((comp, idx) => (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedComponentId(comp.id)}
                    className={`p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      selectedComponentId === comp.id
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200 font-medium'
                        : 'bg-white dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{comp.name}</span>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveComponent(idx, 'up');
                        }}
                        className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveComponent(idx, 'down');
                        }}
                        className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteComponent(comp.id);
                        }}
                        className="p-0.5 text-slate-400 hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Add Block
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { type: 'hero', label: 'Hero' },
                    { type: 'pricing', label: 'Pricing' },
                    { type: 'whatsapp-cta', label: 'WhatsApp' },
                    { type: 'account-deletion', label: 'Deletion' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => addComponent(item.type as FigCraftComponentNode['type'])}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 text-left text-slate-700 dark:text-slate-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-indigo-500" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-lg bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-[11px]">
              <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200 mb-0.5">
                {widthSafety.isSafe ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span>375px Width Guard</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                {widthSafety.isSafe ? 'Zero horizontal overflow detected.' : widthSafety.violatingComponents[0]}
              </p>
            </div>
          </div>

          {/* Center WYSIWYG Artboard */}
          <div className="lg:col-span-6 bg-slate-50/70 dark:bg-[#090B10] p-5 overflow-y-auto flex justify-center">
            <div
              dir={figcraftProject.tokens.direction}
              className="w-full max-w-2xl bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-5 h-fit"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
                <span>{displayName}</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                  dir={figcraftProject.tokens.direction}
                </span>
              </div>

              <div className="space-y-4">
                {figcraftProject.rootComponents.map((comp) => {
                  const isSelected = selectedComponentId === comp.id;

                  return (
                    <div
                      key={comp.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComponentId(comp.id);
                      }}
                      className={`relative p-3.5 rounded-xl transition-colors cursor-pointer ${
                        isSelected
                          ? 'ring-1 ring-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                      }`}
                    >
                      {comp.type === 'hero' && (
                        <div className="text-center py-6 space-y-3">
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            {comp.props.badgeText || 'Autonomous Platform'}
                          </span>
                          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            {comp.props.headline || 'Your Headline Here'}
                          </h1>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            {comp.props.subheadline || 'Subheadline description for the application.'}
                          </p>
                          <div>
                            <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-xs">
                              {comp.props.ctaText || 'Get Started'}
                            </button>
                          </div>
                        </div>
                      )}

                      {comp.type === 'features' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {[
                            { title: 'Fast Delivery', desc: 'Real-time routing' },
                            { title: 'Android Suite', desc: 'Play Data Safety CSV' },
                            { title: 'RLS Security', desc: 'Tenant DB isolation' },
                          ].map((f) => (
                            <div
                              key={f.title}
                              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800"
                            >
                              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                {f.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {f.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {comp.type === 'pricing' && (
                        <div className="space-y-2.5">
                          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 text-center">
                            {comp.props.title || 'Pricing Tiers'}
                          </h3>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
                              <span className="text-[11px] font-medium text-slate-500">Standard</span>
                              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {comp.props.tier1Price || '$29/mo'}
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800 text-center">
                              <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                                Enterprise
                              </span>
                              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {comp.props.tier2Price || '$99/mo'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {comp.type === 'cookie-banner' && (
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                            DPDP India 2023 & EU GDPR consent active.
                          </span>
                          <button className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-medium text-[10px]">
                            Accept
                          </button>
                        </div>
                      )}

                      {comp.type === 'whatsapp-cta' && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                          <span>WhatsApp: {comp.props.number || '+919876543210'}</span>
                        </div>
                      )}

                      {comp.type === 'account-deletion' && (
                        <div className="p-3 rounded-lg bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-xs">
                          <div className="flex items-center gap-1.5 font-medium">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                            <span>Account Deletion (/settings/delete-account)</span>
                          </div>
                          <p className="text-[10px] opacity-80 mt-0.5">
                            Play Store compliant permanent erasure endpoint.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Inspector */}
          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#0D1017] p-3.5 space-y-5 overflow-y-auto">
            <div>
              <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-200/70 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <Settings className="w-3.5 h-3.5 text-indigo-500" />
                <span>Inspector</span>
              </div>

              {selectedComponent ? (
                <div className="mt-3 space-y-3 text-xs">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 text-[11px]">Title</label>
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
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {selectedComponent.type === 'hero' && (
                    <>
                      <div>
                        <label className="text-slate-500 dark:text-slate-400 text-[11px]">Headline</label>
                        <input
                          type="text"
                          value={selectedComponent.props.headline || ''}
                          onChange={(e) => handleUpdateProp('headline', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 dark:text-slate-400 text-[11px]">Subheadline</label>
                        <textarea
                          rows={2}
                          value={selectedComponent.props.subheadline || ''}
                          onChange={(e) => handleUpdateProp('subheadline', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 dark:text-slate-400 text-[11px]">CTA Text</label>
                        <input
                          type="text"
                          value={selectedComponent.props.ctaText || ''}
                          onChange={(e) => handleUpdateProp('ctaText', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </>
                  )}

                  {selectedComponent.type === 'whatsapp-cta' && (
                    <div>
                      <label className="text-slate-500 dark:text-slate-400 text-[11px]">Phone (E.164)</label>
                      <input
                        type="text"
                        value={selectedComponent.props.number || ''}
                        onChange={(e) => handleUpdateProp('number', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400">Select a layer to inspect.</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-3 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Tokens
              </span>

              <div className="flex gap-1.5">
                {(['ltr', 'rtl'] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() =>
                      setFigCraftProject((p) => ({
                        ...p,
                        tokens: { ...p.tokens, direction: dir },
                      }))
                    }
                    className={`flex-1 py-1 rounded-md text-xs font-medium border transition-colors ${
                      figcraftProject.tokens.direction === dir
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {dir.toUpperCase()}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 text-[11px]">GA4 ID</label>
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
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: REACT CODE */}
      {activeMode === 'code' && (
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Code2 className="w-4 h-4 text-indigo-500" />
                <span>Compiled React Source</span>
              </div>
              <button
                onClick={copyCode}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[480px]">
              {generatedReactCode}
            </pre>
          </div>
        </div>
      )}

      {/* MODE 3: IMPORT JSON */}
      {activeMode === 'figma-import' && (
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>Import FigCraft JSON Tokens</span>
            </div>
            <textarea
              value={importedJson}
              onChange={(e) => setImportedJson(e.target.value)}
              rows={10}
              placeholder={JSON.stringify(figcraftProject, null, 2)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleImportJson}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs"
            >
              Apply Schema
            </button>
          </div>
        </div>
      )}

      {/* MODE 4: ARCHITECTURE SVG */}
      {activeMode === 'figcraft-embed' && (
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Multi-Tenant Schema SVG
            </h3>
            <div
              className="h-96 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-slate-950"
              dangerouslySetInnerHTML={{
                __html: generateFigCraftSvgDiagram(`${displayName} Schema`, [
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
