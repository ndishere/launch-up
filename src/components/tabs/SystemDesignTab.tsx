import React, { useState } from 'react';
import { 
  Database, GitBranch, Shield, Server, Layers, Cpu, 
  CheckCircle2, Copy, Check, FileText, Lock, RefreshCw, 
  ArrowRight, Key, Zap, HardDrive, Terminal, ExternalLink
} from 'lucide-react';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';

export const SystemDesignTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'schema' | 'sdlc' | 'tech-stack' | 'security' | 'backups'>('schema');
  const [copiedCode, setCopiedCode] = useState(false);

  const postgresDDL = `-- ====================================================================
-- LAUNCH UP: PRODUCTION-GRADE MULTI-TENANT DATABASE SCHEMA (PostgreSQL 16+)
-- Optimized for high-throughput, ACID compliance, and Many-to-Many entity relations
-- ====================================================================

-- 1. EXTENSIONS & SCHEMAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS launchup_core;
SET search_path TO launchup_core, public;

-- 2. CLIENTS TABLE (B2B Enterprise & B2C Tenants)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    tier VARCHAR(50) NOT NULL CHECK (tier IN ('Enterprise B2B', 'Growth B2B', 'Startup B2C', 'Agency')),
    status VARCHAR(50) NOT NULL DEFAULT 'Onboarding' CHECK (status IN ('Active', 'Onboarding', 'Pending', 'Inactive')),
    primary_email VARCHAR(255) NOT NULL,
    billing_mrr_cents BIGINT NOT NULL DEFAULT 0,
    encrypted_credentials_vault BYTEA, -- AES-256-GCM encrypted API keys
    vault_iv BYTEA,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROJECTS TABLE
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Live', 'In Progress', 'Pending', 'On Hold')),
    framework VARCHAR(100) NOT NULL,
    git_repo_url TEXT NOT NULL,
    git_default_branch VARCHAR(100) DEFAULT 'main',
    server_target VARCHAR(100) NOT NULL CHECK (server_target IN ('Vercel', 'AWS ECS', 'Cloud Run', 'DigitalOcean VPS')),
    production_url TEXT,
    health_score NUMERIC(5,2) DEFAULT 100.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CLIENT_PROJECTS (MANY-TO-MANY JUNCTION TABLE WITH RBAC & OWNERSHIP METRICS)
CREATE TABLE client_projects (
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_role VARCHAR(50) NOT NULL DEFAULT 'Owner' CHECK (client_role IN ('Owner', 'Stakeholder', 'Sponsor', 'Auditor')),
    access_permissions JSONB DEFAULT '{"deploy": true, "billing": true, "logs": true}'::jsonb,
    revenue_share_percent NUMERIC(5,2) DEFAULT 100.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (client_id, project_id)
);

-- 5. DEPLOYMENT_PIPELINES TABLE
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    commit_hash VARCHAR(40) NOT NULL,
    commit_message TEXT NOT NULL,
    environment VARCHAR(50) NOT NULL DEFAULT 'Production' CHECK (environment IN ('Production', 'Staging', 'Preview')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('Queued', 'In Progress', 'Success', 'Failed')),
    duration_seconds INT DEFAULT 0,
    build_logs JSONB DEFAULT '[]'::jsonb,
    docker_image_digest TEXT,
    triggered_by UUID,
    deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. GIT & DATABASE SNAPSHOT BACKUPS TABLE
CREATE TABLE backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    backup_type VARCHAR(50) NOT NULL CHECK (backup_type IN ('Automated Daily', 'Manual Snapshot', 'Pre-Deploy Git Tag')),
    storage_target VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    sha256_checksum VARCHAR(64) NOT NULL,
    retention_days INT DEFAULT 30,
    status VARCHAR(50) NOT NULL DEFAULT 'Completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX idx_client_projects_pid ON client_projects(project_id);
CREATE INDEX idx_client_projects_cid ON client_projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_deployments_pid_env ON deployments(project_id, environment, deployed_at DESC);
CREATE INDEX idx_clients_tier_status ON clients(tier, status);
CREATE INDEX idx_backups_pid_created ON backups(project_id, created_at DESC);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(postgresDDL);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Sub-tab Navigation Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-0.5">
        <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-full w-fit">
          Production Standard
        </span>

        {/* Sub-tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-white dark:bg-[#111318] rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full">
            {[
              { id: 'schema', label: 'Database Schema & ERD', icon: Database },
              { id: 'tech-stack', label: 'Tech Stack & Topics', icon: Cpu },
              { id: 'sdlc', label: 'SDLC Roadmap', icon: Layers },
              { id: 'security', label: 'Security & Vault', icon: Shield },
              { id: 'backups', label: 'Git & Backup Tech', icon: HardDrive },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeSubTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Standalone HTML Documentation Suite Quick Links */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mr-1">HTML Docs:</span>
            <a
              href="/tech-stack.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <span>Tech Stack</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="/requirements.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <span>Requirements</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="/system-design.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <span>System Design</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="/wireframes.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <span>Wireframes</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Unified 5-Cell Horizontal Summary Bar */}
      <SummaryMetricGrid>
        <SummaryMetricCard
          title="Database Engine"
          primaryValue="PostgreSQL 16"
          subtitle="M:N Multi-Tenant RLS"
          status="good"
        />
        <SummaryMetricCard
          title="Active Blueprint"
          primaryValue={activeSubTab.toUpperCase()}
          subtitle="5 SDLC Spec Views"
          status="live"
        />
        <SummaryMetricCard
          title="Secrets Cipher"
          primaryValue="AES-256-GCM"
          subtitle="Hardware Vault Ready"
          status="good"
        />
        <SummaryMetricCard
          title="Core Tables"
          primaryValue="5 Schemas"
          subtitle="Clients, Projects & Audit"
          status="neutral"
        />
        <SummaryMetricCard
          title="Backup Integrity"
          primaryValue="SHA-256"
          subtitle="30-Day Git + Snapshots"
          status="good"
        />
      </SummaryMetricGrid>

      {/* Subtab Content: 1. Schema & ERD */}
      {activeSubTab === 'schema' && (
        <div className="space-y-6">
          {/* Visual Entity Relationship Diagram Card */}
          <div className="bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Entity Relationship Diagram (Many-to-Many Architecture)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Our core architecture enforces a normalized Many-to-Many link between Clients and Projects via the <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">client_projects</code> junction entity.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Clients Entity Box */}
              <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl p-4 border border-indigo-200 dark:border-indigo-900/50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                    Table: clients
                  </span>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                    Tenant Root
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 pt-3 font-mono text-slate-700 dark:text-slate-300">
                  <li className="text-amber-600 dark:text-amber-400 font-semibold">🔑 id: UUID (PK)</li>
                  <li>• name: VARCHAR(255)</li>
                  <li>• domain: VARCHAR(255) UNIQUE</li>
                  <li>• tier: ENUM (B2B/B2C)</li>
                  <li>• status: VARCHAR(50)</li>
                  <li>• primary_email: VARCHAR(255)</li>
                  <li>• billing_mrr_cents: BIGINT</li>
                  <li>• encrypted_vault: BYTEA</li>
                  <li>• created_at: TIMESTAMPTZ</li>
                </ul>
              </div>

              {/* Many-to-Many Junction Box */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl p-4 border-2 border-dashed border-indigo-400 dark:border-indigo-600 relative">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-200 dark:border-indigo-800">
                  <span className="font-bold text-sm text-indigo-700 dark:text-indigo-300 font-mono">
                    Junction: client_projects
                  </span>
                  <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-bold">
                    M : N Link
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 pt-3 font-mono text-slate-800 dark:text-slate-200">
                  <li className="text-amber-600 dark:text-amber-400 font-semibold">🔑 client_id: UUID (FK ➔ clients)</li>
                  <li className="text-amber-600 dark:text-amber-400 font-semibold">🔑 project_id: UUID (FK ➔ projects)</li>
                  <li>• client_role: VARCHAR(50)</li>
                  <li>• access_permissions: JSONB</li>
                  <li>• revenue_share_percent: NUMERIC</li>
                  <li>• created_at: TIMESTAMPTZ</li>
                </ul>
                <div className="mt-3 pt-2 border-t border-indigo-200 dark:border-indigo-800/80 text-[11px] text-indigo-600 dark:text-indigo-400">
                  ✔ Enables 1 project to have multiple client stakeholders, and 1 client to have multiple projects!
                </div>
              </div>

              {/* Projects Entity Box */}
              <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl p-4 border border-indigo-200 dark:border-indigo-900/50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                    Table: projects
                  </span>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                    Work Item
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 pt-3 font-mono text-slate-700 dark:text-slate-300">
                  <li className="text-amber-600 dark:text-amber-400 font-semibold">🔑 id: UUID (PK)</li>
                  <li>• name: VARCHAR(255)</li>
                  <li>• slug: VARCHAR(255) UNIQUE</li>
                  <li>• status: ENUM (Live/Progress)</li>
                  <li>• framework: VARCHAR(100)</li>
                  <li>• git_repo_url: TEXT</li>
                  <li>• git_default_branch: VARCHAR</li>
                  <li>• server_target: ENUM (Vercel/AWS)</li>
                  <li>• health_score: NUMERIC(5,2)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* DDL Code Viewer */}
          <div className="bg-[#0D111A] text-slate-200 rounded-xl p-5 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold font-mono text-white">
                  schema.sql (Production PostgreSQL 16 DDL)
                </span>
              </div>
              <button
                onClick={copyToClipboard}
                className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy DDL'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono overflow-x-auto text-indigo-200/90 leading-relaxed max-h-96">
              {postgresDDL}
            </pre>
          </div>
        </div>
      )}

      {/* Subtab Content: Tech Stack & Topics Mapping */}
      {activeSubTab === 'tech-stack' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Technology Stack & Engineering Curriculum
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Complete technical inventory showing each library, runtime, and framework utilized in Launch Up, mapped to its exact concepts and topics.
                </p>
              </div>
              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <span className="text-[11px] font-mono px-3 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60 font-semibold">
                  TECH_STACK.md · Synced
                </span>
                <a
                  href="/tech-stack.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                  title="Open standalone HTML tech document in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View HTML Document
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              {/* 1. React 18+ */}
              <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Frontend Core
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      React 18+
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Component Hierarchy & Reactive State
                  </h3>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Topics & Concepts:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {['Custom Context API', 'useState & useEffect', 'useMemo Fuzzy Filter', 'useRef DOM Focus', 'Event Capturing Phase', 'Controlled Form Modals'].map((topic, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="pt-2 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      <strong>Implementation:</strong> Centralized multi-tenant state via <code className="text-indigo-600 dark:text-indigo-400 font-mono">AppContext.tsx</code>, dynamic spotlight search via <code className="text-indigo-600 dark:text-indigo-400 font-mono">CommandPalette.tsx</code>, and responsive tab routing.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. TypeScript 5 */}
              <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      Type Safety
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      TypeScript 5.x
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Strict Domain Modeling & Interfaces
                  </h3>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Topics & Concepts:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {['Domain Entity Interfaces', 'Discriminated Unions', 'String Literal Enums', 'Generic Prop Types', 'Strict Null Checks', 'Narrowing Guards'].map((topic, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="pt-2 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      <strong>Implementation:</strong> Strongly typed multi-tier clients (<code className="text-purple-600 dark:text-purple-400 font-mono">Client</code>), deployment telemetry logs (<code className="text-purple-600 dark:text-purple-400 font-mono">DeploymentLog</code>), and RBAC access roles.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Tailwind CSS v4 */}
              <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                      Design System
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                      Tailwind CSS v4
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Responsive Tokens & Dual-Theme UI
                  </h3>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Topics & Concepts:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {['CSS Grid & Bento Layouts', 'Dark Mode Class Strategy', 'High-Contrast Neutral Palettes', 'Tabular Figures (tabular-nums)', 'Micro-Interactions & Transitions', 'Zero-Slop Anti-Patterns'].map((topic, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="pt-2 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      <strong>Implementation:</strong> Mathematical layout ratios, responsive 12-column bento grids, and dark theme support using deep obsidian slate (<code className="text-cyan-600 dark:text-cyan-400 font-mono">#111622</code>).
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. PostgreSQL 16 & Systems Architecture */}
              <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Database Architecture
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      PostgreSQL 16+
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Multi-Tenant Relational Modeling
                  </h3>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Topics & Concepts:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {['Many-to-Many Junction (client_projects)', 'UUID Primary Keys (gen_random_uuid)', 'JSONB Semi-Structured Data', 'Foreign Key Cascades', 'B-Tree & Composite Indexing', 'ACID Compliance'].map((topic, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="pt-2 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      <strong>Implementation:</strong> Production-ready SQL schema with client vault envelope encryption, composite indexing for sub-millisecond query execution, and junction RBAC.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. DevOps & CI/CD */}
              <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Cloud & Infrastructure
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      DevOps & CI/CD
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Multi-Cloud Deployment & Git Mirroring
                  </h3>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Topics & Concepts:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {['Multi-Cloud Targets (ECS, Run, Vercel)', 'Live Streamed Build Logs', 'Zero-Downtime Rollback Mechanism', 'Git Remote S3 Mirroring', 'WAL Point-in-Time Database Backups', 'Automated Health Probes'].map((topic, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="pt-2 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      <strong>Implementation:</strong> Interactive deployment orchestration, 1-click rollbacks with historical commit checkpoints, and continuous dual-layer backups.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Security & Cryptography */}
              <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      Cybersecurity
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      Security & Vault
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Envelope Encryption & Zero-Trust
                  </h3>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Topics & Concepts:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {['AES-256-GCM Envelope Encryption', '96-bit Unique IV per Tenant', 'Zero Client-Side Key Exposure', 'HMAC-SHA256 Webhook Signatures', 'TLS 1.3 in Transit', 'Role-Based Access Control (RBAC)'].map((topic, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="pt-2 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      <strong>Implementation:</strong> Client credentials vault isolating Stripe, Cloud, and database secrets with client-role authorization tiers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab Content: 2. SDLC Roadmap */}
      {activeSubTab === 'sdlc' && (
        <div className="bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Software Development Life Cycle (SDLC) Blueprint
          </h2>

          <div className="space-y-4">
            {[
              {
                step: '01',
                title: 'Client Intake & Requirements Engineering',
                desc: 'Capture requirements, project goals, B2B SLA guarantees, and budget parameters through the structured Intake Wizard. Automated schema contract generation.',
                status: 'Completed',
              },
              {
                step: '02',
                title: 'System Architecture & Database Modeling',
                desc: 'Establish normalized relational schemas, Many-to-Many junction mapping, AES-256 encrypted credential vaults, and connection pooling.',
                status: 'Completed',
              },
              {
                step: '03',
                title: 'Core Development & Modular Scaffolding',
                desc: 'Instant 1-click project generation with certified templates (React 19, Next.js, Go/Express microservices, Tailwind).',
                status: 'In Progress',
              },
              {
                step: '04',
                title: 'Continuous Integration & Cloud Deployment',
                desc: 'Container build pipelines, zero-downtime routing on Cloud Run / Vercel / AWS ECS, and SSL certificate auto-issuance.',
                status: 'Active',
              },
              {
                step: '05',
                title: 'Automated Git Mirroring & Disaster Recovery',
                desc: 'Daily cryptographic backups to AWS S3 & Google Cloud Storage with SHA-256 integrity verification.',
                status: 'Active',
              },
              {
                step: '06',
                title: 'Growth Marketing & Attribution Analytics',
                desc: 'Real-time traffic ingestion, OpenGraph meta generation, bounce rate tracking, and automated client subscription billing.',
                status: 'Active',
              },
            ].map((sdlc, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {sdlc.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {sdlc.title}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {sdlc.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {sdlc.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab Content: 3. Security */}
      {activeSubTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Client Vault & Secret Management
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every client's confidential credentials (database passwords, Stripe private keys, cloud tokens) are isolated and encrypted at rest using envelope encryption:
            </p>
            <ul className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>AES-256-GCM</strong> with 96-bit unique IV per tenant.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero key exposure to client-side browser bundle.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>HMAC SHA-256 signature verification for incoming webhooks.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Strict TLS 1.3 encryption in transit for all endpoints.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Role-Based Access Control (RBAC)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Granular permission matrix enforced at the database and gateway layer:
            </p>
            <div className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="py-2 flex justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">Super Admin</span>
                <span className="text-emerald-600">Full System + Billing + Vault</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">DevOps Engineer</span>
                <span className="text-indigo-500">Deploy, Rollback, Git Backups</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">Client Portal User</span>
                <span className="text-slate-400">View Associated Projects & Invoices</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab Content: 4. Backups */}
      {activeSubTab === 'backups' && (
        <div className="bg-white dark:bg-[#111318] rounded-xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Git Mirroring & Database Snapshot Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Protecting client assets through dual-layer redundant backups:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-indigo-500" />
                Git Remote Mirroring
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Every commit is pushed to an encrypted bare git repository mirrored on an isolated S3 bucket, preventing vendor lock-in or source loss.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-500" />
                Daily Point-in-Time Database Snapshots
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated WAL archiving and pg_dump snapshots with 30-day retention policies and instant 1-click sandbox restoration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
