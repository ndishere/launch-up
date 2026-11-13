import React, { useState } from 'react';
import { DollarSign, CreditCard, Download, CheckCircle2, Clock, AlertCircle, Shield, Zap, Receipt } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';

export const BillingTab: React.FC = () => {
  const { invoices, clients, setIsUpgradeModalOpen } = useApp();
  const pendingCount = invoices.filter((inv) => inv.status === 'Pending' || inv.status === 'Overdue').length;
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'All') return true;
    return inv.status === filterStatus;
  });

  const totalMRR = clients.reduce((acc, c) => acc + c.monthlySubscription, 0);

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-150">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-3 pb-0.5">
        <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-md">
          Stripe Active
        </span>

        <button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors ml-auto"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Plans</span>
        </button>
      </div>

      {/* Unified 5-Cell Horizontal Summary Bar */}
      <SummaryMetricGrid>
        <SummaryMetricCard
          title="Monthly Recurring"
          primaryValue={`$${totalMRR.toLocaleString()}`}
          subtitle="+22% MTD"
          status="good"
        />
        <SummaryMetricCard
          title="Collected MTD"
          primaryValue="$24,560"
          subtitle="On-time settlement"
          status="good"
        />
        <SummaryMetricCard
          title="Active Retainers"
          primaryValue={clients.length}
          subtitle="0% churn"
          status="live"
        />
        <SummaryMetricCard
          title="Open Invoices"
          primaryValue={pendingCount}
          subtitle={pendingCount > 0 ? 'Awaiting settlement' : 'All settled'}
          status={pendingCount > 0 ? 'warn' : 'good'}
        />
        <SummaryMetricCard
          title="Compliance"
          primaryValue="PCI Level 1"
          subtitle="Encrypted tokens"
          status="neutral"
        />
      </SummaryMetricGrid>

      {/* Invoices List */}
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            Invoices
          </h2>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Invoices</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                <th className="py-2.5 px-4">Invoice</th>
                <th className="py-2.5 px-4">Client</th>
                <th className="py-2.5 px-4">Plan</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Due Date</th>
                <th className="py-2.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    {inv.clientName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{inv.planName}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          : inv.status === 'Pending'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                          : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {inv.status === 'Paid' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      {inv.status === 'Pending' && <Clock className="w-3 h-3 text-indigo-500" />}
                      {inv.status === 'Overdue' && <AlertCircle className="w-3 h-3 text-rose-500" />}
                      <span>{inv.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{inv.dueDate}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Downloading receipt ${inv.invoiceNumber} for ${inv.clientName}...`)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
