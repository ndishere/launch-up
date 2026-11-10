import React from 'react';
import { UserCheck, Plus, Mail, Shield, ShieldCheck, FolderKanban } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenAnalyticsHeader } from '../common/ScreenAnalyticsHeader';

export const TeamTab: React.FC = () => {
  const { teamMembers, projects } = useApp();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Combined Analytics Section with Live Success/Error Rates */}
      <ScreenAnalyticsHeader
        title="Team & Role-Based Access Control (RBAC)"
        badge="Enterprise RBAC Active"
        description="Manage organization members, assign fine-grained project permissions, and enable parallel multi-project workflows across team members with distributed sync."
        metrics={[
          {
            label: 'Total Members',
            value: teamMembers.length,
            subValue: '100% Active Logins',
            status: 'good',
          },
          {
            label: 'RBAC Security Level',
            value: 'Enterprise',
            subValue: 'Token Vault Enforced',
            status: 'good',
          },
          {
            label: 'Parallel Build Mesh',
            value: 'Enabled',
            subValue: 'Multi-member concurrent',
            status: 'live',
          },
          {
            label: 'Assigned Roles',
            value: '5 Tiers',
            subValue: 'Super Admin down to Client Success',
            status: 'good',
          },
        ]}
        actions={
          <button
            onClick={() => alert('Invite member flow: opens invitation link generator.')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        }
      />

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-[#111622] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-base flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    {member.avatarInitials}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-400">{member.email}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                  {member.status}
                </span>
              </div>

              <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    Security Role:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {member.role}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-purple-500" />
                    Projects Assigned:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {member.projectsAssigned} Projects
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                onClick={() => alert(`Configuring permissions for ${member.name}`)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Edit Permissions
              </button>
              <span className="text-[10px] text-slate-400 font-mono">2FA Enforced</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
