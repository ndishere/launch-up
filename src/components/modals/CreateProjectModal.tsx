import React, { useState } from 'react';
import { 
  X, FolderKanban, Server, GitBranch, Database, 
  Users, Check, ArrowRight, ArrowLeft, Rocket, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { ProjectType } from '../../types';

export const CreateProjectModal: React.FC = () => {
  const { 
    isCreateProjectModalOpen, 
    setIsCreateProjectModalOpen, 
    clients, 
    addProject, 
    openProjectWorkspace,
    setCurrentTab 
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('Marketing Website');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [framework, setFramework] = useState('React 19 / Vite / Tailwind');
  const [serverTarget, setServerTarget] = useState<'Vercel' | 'AWS ECS' | 'Cloud Run' | 'DigitalOcean VPS'>('Vercel');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [backupStrategy, setBackupStrategy] = useState('Automated Daily Git Mirror + S3');

  if (!isCreateProjectModalOpen) return null;

  const toggleClient = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const handleFinish = () => {
    if (!name) return;

    const createdProject = addProject({
      name,
      type,
      status: 'In Progress',
      framework,
      serverTarget,
      repoUrl: repoUrl || `https://github.com/launchup/${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      branch,
      clientIds: selectedClientIds.length > 0 ? selectedClientIds : [clients[0]?.id || 'client-1'],
      liveUrl: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.launchup.app`,
    });

    // Launch confetti celebration!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      // safe fallback
    }

    setIsCreateProjectModalOpen(false);
    setCurrentTab('projects');
    openProjectWorkspace(createdProject.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-xl shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Project Creation Wizard (Step {step} of 4)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 1 && 'Define project specifications and archetype.'}
                {step === 2 && 'Link client stakeholders (Many-to-Many).'}
                {step === 3 && 'Configure runtime stack & deployment target.'}
                {step === 4 && 'Setup Git repository and automated backup mirrors.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateProjectModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Client Portal v2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Classification
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Marketing Website">Marketing Website</option>
                  <option value="CRM Platform">CRM Platform</option>
                  <option value="Landing Page">Landing Page</option>
                  <option value="E-commerce Site">E-commerce Site</option>
                  <option value="Mobile App API">Mobile App API</option>
                  <option value="SaaS Platform">SaaS Platform</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-700 dark:text-indigo-300">
                <strong>Many-to-Many Architecture:</strong> You can link this project to multiple clients (e.g. joint venture or multi-stakeholder contract).
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Associated Clients ({selectedClientIds.length} chosen)
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {clients.map((c) => {
                    const isSelected = selectedClientIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => toggleClient(c.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 text-slate-900 dark:text-white'
                            : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                            {c.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-slate-900 dark:text-white">{c.name}</p>
                            <p className="text-[11px] text-slate-400">{c.tier} • {c.domain}</p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Technology Framework
                </label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="React 19 / Vite / Tailwind">React 19 / Vite / Tailwind</option>
                  <option value="Next.js 14 / Server Components">Next.js 14 / Server Components</option>
                  <option value="Node.js / Express / TypeScript">Node.js / Express / TypeScript</option>
                  <option value="Go / TimescaleDB Microservice">Go / TimescaleDB Microservice</option>
                  <option value="Remix / Headless Shopify">Remix / Headless Shopify</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Online Server Deployment Target
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Vercel', label: 'Vercel Edge Global' },
                    { id: 'Cloud Run', label: 'Google Cloud Run' },
                    { id: 'AWS ECS', label: 'AWS ECS Fargate' },
                    { id: 'DigitalOcean VPS', label: 'DigitalOcean VPS' },
                  ].map((target) => (
                    <div
                      key={target.id}
                      onClick={() => setServerTarget(target.id as any)}
                      className={`p-3 rounded-xl border cursor-pointer text-xs font-medium flex items-center justify-between ${
                        serverTarget === target.id
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{target.label}</span>
                      {serverTarget === target.id && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Git Repository URL
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/launchup/my-project"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deployment Branch
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Automated Backup Target
                  </label>
                  <select
                    value={backupStrategy}
                    onChange={(e) => setBackupStrategy(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option>Daily Git Mirror + AWS S3</option>
                    <option>Google Cloud Storage Coldline</option>
                    <option>Encrypted Git Bundle Export</option>
                  </select>
                </div>
              </div>

              <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 text-xs text-emerald-700 dark:text-emerald-300">
                ✔ Ready to scaffold! Clicking Finish will initialize git hooks, provision cloud ingress, and link the chosen client stakeholders.
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as any) : s))}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {step < 4 ? (
            <button
              type="button"
              disabled={step === 1 && !name}
              onClick={() => setStep((s) => (s < 4 ? ((s + 1) as any) : s))}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Scaffold & Launch Project</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
