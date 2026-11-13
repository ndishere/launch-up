import React, { useState } from 'react';
import { 
  Megaphone, TrendingUp, DollarSign, Target, Sparkles, 
  RefreshCw, CheckCircle2, Play, Users, BarChart3, Plus, 
  ExternalLink, Layers, ArrowUpRight, MessageSquare, Send, Calendar, ShieldCheck,
  Check, Eye, Share2, AlertCircle, Sparkle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MarketingCampaign } from '../../types';
import { generateMarketingCalendar, sendWhatsAppMessage } from '../../services/api';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';
import { ExpandableRightDetailPanel, ExpandableDetailToggleButton } from '../common/ExpandableRightDetailPanel';

export const MarketingEngineTab: React.FC = () => {
  const { campaigns, rebalanceCampaign, createCampaign, clients, projects } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [businessName, setBusinessName] = useState(clients[0]?.name || 'Acme Co.');
  const [channel, setChannel] = useState<any>('LinkedIn B2B');
  const [budgetMonthly, setBudgetMonthly] = useState(3000);
  const [targetRoas, setTargetRoas] = useState(5.0);

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [selectedCalendarPost, setSelectedCalendarPost] = useState<any>(null);
  const [approvedGateIds, setApprovedGateIds] = useState<Set<string>>(new Set());

  // MOD-07 Canva Marketing State
  const [campaignTheme, setCampaignTheme] = useState('Festive Growth & High-Speed Fulfillment');
  const [calendarDays, setCalendarDays] = useState(30);
  const [generatingCalendar, setGeneratingCalendar] = useState(false);
  const [calendarResult, setCalendarResult] = useState<any>(null);

  // MOD-08 WhatsApp RAG State
  const [whatsappPhone, setWhatsappPhone] = useState('+919876543210');
  const [whatsappText, setWhatsappText] = useState('What are your express delivery rates for bulk shipments?');
  const [whatsappEventType, setWhatsappEventType] = useState<'INBOUND_CUSTOMER_MSG' | 'OUTBOUND_CAMPAIGN_BROADCAST'>('INBOUND_CUSTOMER_MSG');
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [whatsappResult, setWhatsappResult] = useState<any>(null);

  const handleGenerateCalendar = async () => {
    setGeneratingCalendar(true);
    setCalendarResult(null);
    try {
      const res = await generateMarketingCalendar({
        project_id: projects[0]?.id || 'proj-0007-0000-0000-000000000001',
        brand_kit: {
          primary_color_hex: '#0F172A',
          company_name: businessName,
        },
        campaign_theme: campaignTheme,
        days_count: calendarDays,
        canva_brand_template_ids: ['DAG_social_01', 'DAG_carousel_02'],
      });
      setCalendarResult(res);
      if (res.data?.calendar_items?.[0]) {
        setSelectedCalendarPost(res.data.calendar_items[0]);
      }
    } catch (err: any) {
      setCalendarResult({ error: err.message });
    } finally {
      setGeneratingCalendar(false);
    }
  };

  const handleSendWhatsApp = async () => {
    setSendingWhatsApp(true);
    setWhatsappResult(null);
    try {
      const res = await sendWhatsAppMessage({
        project_id: projects[0]?.id || 'proj-0008-0000-0000-000000000001',
        event_type: whatsappEventType,
        recipient_phone_e164: whatsappPhone,
        opt_in_proof_id: whatsappEventType === 'OUTBOUND_CAMPAIGN_BROADCAST' ? 'proof-optin-uuid-12345' : null,
        message_payload: { text_or_template: whatsappText },
      });
      setWhatsappResult(res);
    } catch (err: any) {
      setWhatsappResult({ error: err.message });
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const totalMonthlySpend = campaigns.reduce((acc, c) => acc + c.budgetMonthly, 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + c.leadsGenerated, 0);
  const avgRoas = (campaigns.reduce((acc, c) => acc + c.roas, 0) / (campaigns.length || 1)).toFixed(1);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    createCampaign({
      title,
      businessName,
      channel,
      status: 'Running',
      budgetMonthly,
      roas: targetRoas,
      conversionRate: 10.4,
      aiAgentManager: 'Vortex Growth',
      creativeAssetCount: 16,
      generatedHeadlines: [
        `Transform Your ${businessName} Operations with Full Automation`,
        `The Autonomous Advantage: How Fast Teams Outpace Competitors`,
        `Zero-Manual Bottlenecks: Realtime FDE & Edge Intelligence`,
      ],
    });

    setShowCreateModal(false);
    setTitle('');
  };

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-4 pb-0.5">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Autonomous Marketing & Growth</span>
        </span>

        <div className="flex items-center gap-2.5 ml-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Launch Campaign</span>
          </button>

          <ExpandableDetailToggleButton
            isOpen={isSidePanelOpen}
            onToggle={() => setIsSidePanelOpen((prev) => !prev)}
          />
        </div>
      </div>

      {/* Row 1: Unified 5-Cell Horizontal Summary Bar */}
      <SummaryMetricGrid>
        <SummaryMetricCard
          title="Average ROAS"
          primaryValue={`${avgRoas}x`}
          subtitle="Autonomous Bid Rebalance"
          status="good"
        />
        <SummaryMetricCard
          title="Managed Budget"
          primaryValue={`$${totalMonthlySpend.toLocaleString()}`}
          subtitle={`${campaigns.length} Active Channels`}
          status="live"
        />
        <SummaryMetricCard
          title="Inbound Leads"
          primaryValue={totalLeads.toLocaleString()}
          subtitle="Synced Directly to CRM"
          status="good"
        />
        <SummaryMetricCard
          title="Creative Sets"
          primaryValue={`${campaigns.reduce((acc, c) => acc + (c.creativeAssetCount || 0), 0)} Hooks`}
          subtitle="Dynamic A/B Evaluation"
          status="good"
        />
        <SummaryMetricCard
          title="Active Campaigns"
          primaryValue={`${campaigns.filter((c) => c.status === 'Running').length} / ${campaigns.length}`}
          subtitle="Canva + WhatsApp Ready"
          status="good"
        />
      </SummaryMetricGrid>

      {/* Row 2: 2-Column Section (Column 1: Main Content, Column 2: Details Panel) */}
      <div className="flex flex-col lg:flex-row items-start gap-5 w-full min-w-0">
        {/* Column 1: Main Content Area */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {/* MOD-07 & MOD-08 Interactive Engines */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* MOD-07: Canva Pro Digital Marketing Engine */}
            <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/70 text-pink-600 dark:text-pink-400">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Canva Marketing Engine (MOD-07)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      30-day calendar with EU AI Act Art. 50 disclosure &amp; Gate 4 sign-off.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/70 text-pink-600 dark:text-pink-300">
                  Canva Active
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Campaign Theme:
                  </label>
                  <input
                    type="text"
                    value={campaignTheme}
                    onChange={(e) => setCampaignTheme(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32">
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Days Count:
                    </label>
                    <select
                      value={calendarDays}
                      onChange={(e) => setCalendarDays(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value={7}>7 Days Sprint</option>
                      <option value={14}>14 Days</option>
                      <option value={30}>30 Days (Full Month)</option>
                    </select>
                  </div>

                  <div className="flex-1 flex items-end">
                    <button
                      onClick={handleGenerateCalendar}
                      disabled={generatingCalendar}
                      className="w-full py-1.5 px-3 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {generatingCalendar ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Generate Calendar (Gate 4)</span>
                    </button>
                  </div>
                </div>
              </div>

              {calendarResult && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Generated ({calendarResult.data?.calendar_items?.length} Days)</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${calendarResult.isLive ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {calendarResult.isLive ? '● Live Fastify 8011' : '● In-Memory'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Gate ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{calendarResult.data?.approval_gate_id}</strong>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {calendarResult.data?.calendar_items?.slice(0, 4).map((item: any, idx: number) => {
                      const isPostSelected = selectedCalendarPost?.day === item.day;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedCalendarPost(item);
                            setIsSidePanelOpen(true);
                          }}
                          className={`p-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
                            isPostSelected
                              ? 'ring-2 ring-pink-500 border-pink-500 bg-pink-50/40 dark:bg-pink-950/30'
                              : 'bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700 hover:border-pink-300'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-pink-600 dark:text-pink-400">
                            <span>Day {item.day} · {item.platform}</span>
                            <span className="text-[10px] text-emerald-500">EU AI Act Art. 50 ✓</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 truncate mt-0.5">{item.caption}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* MOD-08: WhatsApp Marketing & CRM RAG Engine */}
            <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      WhatsApp CRM Engine (MOD-08)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Meta 24h window compliance, RAG knowledge answers, and live escalations.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300">
                  WhatsApp CRM Active
                </span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Recipient Phone (E.164):
                    </label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Event Type:
                    </label>
                    <select
                      value={whatsappEventType}
                      onChange={(e) => setWhatsappEventType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="INBOUND_CUSTOMER_MSG">Inbound Customer Message</option>
                      <option value="OUTBOUND_CAMPAIGN_BROADCAST">Outbound Campaign Broadcast</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={whatsappText}
                    onChange={(e) => setWhatsappText(e.target.value)}
                    placeholder="Enter customer message or campaign copy..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                  <button
                    onClick={handleSendWhatsApp}
                    disabled={sendingWhatsApp}
                    className="py-1.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {sendingWhatsApp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Message</span>
                  </button>
                </div>
              </div>

              {whatsappResult && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Message Dispatched</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${whatsappResult.isLive ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {whatsappResult.isLive ? '● Live Fastify 8012' : '● In-Memory'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">24h Window</span>
                      <span className="font-bold text-emerald-600">Active ✓</span>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">RAG Score</span>
                      <span className="font-bold text-indigo-600">{whatsappResult.data?.rag_confidence_score}</span>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Escalate</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {whatsappResult.data?.escalated_to_human_chatwoot ? 'Yes (Chatwoot)' : 'No (Automated)'}
                      </span>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Footer Opt-Out</span>
                      <span className="font-bold text-emerald-600">Attached ✓</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Campaigns Grid */}
          <div className="space-y-3.5">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Active Autonomous Growth Campaigns
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {campaigns.map((camp) => {
                const isSelected = selectedCampaign?.id === camp.id;
                return (
                  <div
                    key={camp.id}
                    onClick={() => {
                      setSelectedCampaignId(camp.id);
                      setSelectedCalendarPost(null);
                      setIsSidePanelOpen(true);
                    }}
                    className={`rounded-xl p-4 border flex flex-col justify-between space-y-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-indigo-500/80 border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                        : 'bg-white dark:bg-[#111318] border-slate-200/80 dark:border-slate-800/80 hover:border-pink-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {camp.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 truncate">{camp.businessName}</p>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {camp.status}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Target Channel:</span>
                          <span className="font-bold text-pink-600 dark:text-pink-400">{camp.channel}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Monthly Budget:</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">${camp.budgetMonthly.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Current ROAS:</span>
                          <span className="font-bold text-emerald-500 font-mono text-sm">{camp.roas}x</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Leads Generated:</span>
                          <span className="font-bold text-purple-400 font-mono">{camp.leadsGenerated}</span>
                        </div>
                      </div>

                      {/* Generated Copy Hooks */}
                      <div className="mt-3 space-y-1">
                        <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                          Top Converting Hook:
                        </span>
                        <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 line-clamp-2">
                          &ldquo;{camp.generatedHeadlines[0] || 'Autonomous growth unlocked'}&rdquo;
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {camp.aiAgentManager}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          rebalanceCampaign(camp.id);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Rebalance</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Expandable Right Detail Panel */}
        <ExpandableRightDetailPanel
          isOpen={isSidePanelOpen}
          onToggle={() => setIsSidePanelOpen((prev) => !prev)}
          title={selectedCalendarPost ? `Day ${selectedCalendarPost.day} Creative` : (selectedCampaign?.title || 'Campaign Details')}
          subtitle={selectedCalendarPost ? selectedCalendarPost.platform : (selectedCampaign?.channel || 'Select an item')}
        >
          {selectedCalendarPost ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                  {selectedCalendarPost.platform}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>EU AI Act Art. 50 Verified</span>
                </span>
              </div>

              {/* Visual Preview Box */}
              <div className="p-3 rounded-xl border border-pink-200/80 dark:border-pink-800/80 bg-pink-50/30 dark:bg-pink-950/30 space-y-2">
                <span className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400 block">
                  Generated Social Post Copy
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {selectedCalendarPost.caption}
                </p>
                <div className="pt-2 border-t border-pink-200/60 dark:border-pink-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Day {selectedCalendarPost.day} of 30</span>
                  <span className="text-indigo-600 font-medium">Watermark Disclosed ✓</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setApprovedGateIds((prev) => new Set(prev).add(`cal-${selectedCalendarPost.day}`))}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer ${
                    approvedGateIds.has(`cal-${selectedCalendarPost.day}`)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-pink-600 hover:bg-pink-700 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {approvedGateIds.has(`cal-${selectedCalendarPost.day}`)
                      ? 'Campaign Approved (Gate 4)'
                      : 'Approve Campaign (Gate 4)'}
                  </span>
                </button>

                <a
                  href="https://canva.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-pink-500" />
                  <span>Open in Canva Pro</span>
                </a>
              </div>
            </div>
          ) : selectedCampaign ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {selectedCampaign.status}
                </span>
                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                  ROAS: {selectedCampaign.roas}x
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {selectedCampaign.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Client: <strong className="text-slate-700 dark:text-slate-300">{selectedCampaign.businessName}</strong>
                </p>
              </div>

              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Channel</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCampaign.channel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Monthly Budget</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">${selectedCampaign.budgetMonthly.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Leads Generated</span>
                  <span className="font-bold text-purple-600">{selectedCampaign.leadsGenerated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Manager</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedCampaign.aiAgentManager}</span>
                </div>
              </div>

              {/* Headlines */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Top Converting Hooks
                </span>
                <div className="space-y-1">
                  {selectedCampaign.generatedHeadlines.map((h, i) => (
                    <p key={i} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                      &ldquo;{h}&rdquo;
                    </p>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovedGateIds((prev) => new Set(prev).add(selectedCampaign.id))}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer ${
                    approvedGateIds.has(selectedCampaign.id)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {approvedGateIds.has(selectedCampaign.id)
                      ? 'Campaign Approved (Gate 4)'
                      : 'Approve Campaign (Gate 4)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => rebalanceCampaign(selectedCampaign.id)}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-pink-500" />
                  <span>Rebalance Bids & Creatives</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a campaign or calendar post to inspect.
            </div>
          )}
        </ExpandableRightDetailPanel>
      </div>

      {/* Launch Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111318] rounded-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-pink-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Launch Autonomous Marketing Campaign
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Growth Sprint"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Client Account
                  </label>
                  <select
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="LinkedIn B2B">LinkedIn B2B</option>
                    <option value="Instagram Meta">Instagram Meta</option>
                    <option value="Google Search Intent">Google Search Intent</option>
                    <option value="WhatsApp Direct">WhatsApp Direct</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Budget ($)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={budgetMonthly}
                    onChange={(e) => setBudgetMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target ROAS
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    value={targetRoas}
                    onChange={(e) => setTargetRoas(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
