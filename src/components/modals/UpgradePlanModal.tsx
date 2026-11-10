import React from 'react';
import { X, Check, Zap, Shield, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UpgradePlanModal: React.FC = () => {
  const { isUpgradeModalOpen, setIsUpgradeModalOpen } = useApp();

  if (!isUpgradeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Launch Up Subscription Tiers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scalable infrastructure packages for agency teams and enterprise clients.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUpgradeModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pro Plan */}
          <div className="rounded-2xl p-5 border-2 border-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20 flex flex-col justify-between relative">
            <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
              Current Plan
            </span>

            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Pro Studio</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For fast-growing development agencies & high-velocity teams.
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">$79</span>
                <span className="text-xs text-slate-400">/month</span>
              </div>

              <ul className="mt-5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Up to 50 active client projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited zero-downtime CI/CD deploys</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Daily automated git snapshot backups</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Stripe Connect Client Billing</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className="mt-6 w-full py-2 px-3 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900 transition-colors opacity-80 cursor-default"
            >
              Active Workspace Tier
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151C2C] flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Enterprise Sovereign</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Custom VPC, HIPAA / SOC2 compliance, dedicated cluster.
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">$499</span>
                <span className="text-xs text-slate-400">/month</span>
              </div>

              <ul className="mt-5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited clients & projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Custom VPC & Dedicated IP addresses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>99.99% Uptime SLA with financial backing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated Solution Architect & 24/7 pager</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                alert('Enterprise plan inquiry received. A Launch Up architect will contact your primary email within 2 hours.');
                setIsUpgradeModalOpen(false);
              }}
              className="mt-6 w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs shadow-indigo-600/30"
            >
              Upgrade to Enterprise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
