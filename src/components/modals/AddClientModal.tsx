import React, { useState } from 'react';
import { X, Building, Mail, Globe, Shield, DollarSign, Plus, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClientTier, ClientStatus } from '../../types';

export const AddClientModal: React.FC = () => {
  const { isAddClientModalOpen, setIsAddClientModalOpen, addClient, projects } = useApp();

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('Head of Operations');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState<ClientTier>('Enterprise B2B');
  const [status, setStatus] = useState<ClientStatus>('Active');
  const [monthlySubscription, setMonthlySubscription] = useState<number>(1499);
  const [notes, setNotes] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  if (!isAddClientModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !domain || !email) return;

    addClient({
      name,
      domain,
      email,
      phone,
      tier,
      status,
      monthlySubscription: Number(monthlySubscription),
      primaryContact: {
        name: contactName || name + ' Contact',
        role: contactRole,
        email,
      },
      notes,
      projectIds: selectedProjectIds,
    });

    setIsAddClientModalOpen(false);
  };

  const toggleProjectSelection = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-xl shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                New Client Intake & Onboarding
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Capture client parameters, SLAs, and assign initial projects.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddClientModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client / Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Helix Robotics Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Domain / Website *
              </label>
              <input
                type="text"
                required
                placeholder="helixrobotics.ai"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Contact Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Julian Cole"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Contact Role
              </label>
              <input
                type="text"
                placeholder="e.g. VP Engineering"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Email *
              </label>
              <input
                type="email"
                required
                placeholder="contact@helixrobotics.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Retainer (USD)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={monthlySubscription}
                onChange={(e) => setMonthlySubscription(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Enterprise B2B">Enterprise B2B</option>
                <option value="Growth B2B">Growth B2B</option>
                <option value="Startup B2C">Startup B2C</option>
                <option value="Agency">Agency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Onboarding Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Many-to-Many Project Linkage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Link Existing Projects (Many-to-Many Association)
            </label>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
              {projects.map((p) => {
                const isSelected = selectedProjectIds.includes(p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => toggleProjectSelection(p.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Client Brief & SLA Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Dedicated Postgres instance, 99.9% uptime SLA, daily automated snapshots required."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddClientModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all"
            >
              Save & Onboard Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
