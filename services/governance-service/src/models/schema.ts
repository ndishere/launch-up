import {
  pgSchema, uuid, varchar, text, boolean, timestamp, integer, jsonb, numeric, unique
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const authSchema = pgSchema('auth');

// ── Principals ────────────────────────────────────────
export const principals = authSchema.table('principals', {
  id:            uuid('id').primaryKey().defaultRandom(),
  principalType: varchar('principal_type', { length: 20 }).notNull().$type<'HUMAN' | 'AI_AGENT'>(),
  identifier:    varchar('identifier', { length: 255 }).notNull().unique(),
  displayName:   varchar('display_name', { length: 255 }).notNull(),
  isSuperAdmin:  boolean('is_super_admin').notNull().default(false),
  userId:        uuid('user_id'),        // FK → auth.users (managed at SQL level)
  orgId:         uuid('org_id').notNull(), // FK → auth.organizations (managed at SQL level)
  metadata:      jsonb('metadata').notNull().default({}),
  createdAt:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Client ↔ Project Links ───────────────────────────
export const clientProjectLinks = authSchema.table('client_project_links', {
  id:                uuid('id').primaryKey().defaultRandom(),
  clientId:          uuid('client_id').notNull(),  // FK → clients (managed at SQL level)
  projectId:         uuid('project_id').notNull(),  // FK → projects (managed at SQL level)
  relationshipType:  varchar('relationship_type', { length: 30 }).notNull()
    .$type<'PRIMARY_OWNER' | 'CO_OWNER' | 'AGENCY_PARTNER' | 'VENDOR'>(),
  billingSharePercent: numeric('billing_share_percent', { precision: 5, scale: 2 }).notNull().default('0'),
  orgId:             uuid('org_id').notNull(),
  createdAt:         timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique().on(table.clientId, table.projectId),
]);

// ── Project Memberships ──────────────────────────────
export const projectMemberships = authSchema.table('project_memberships', {
  id:              uuid('id').primaryKey().defaultRandom(),
  principalId:     uuid('principal_id').notNull().references(() => principals.id, { onDelete: 'cascade' }),
  clientId:        uuid('client_id'),     // FK → clients (managed at SQL level, nullable)
  projectId:       uuid('project_id'),    // FK → projects (managed at SQL level, nullable)
  roleId:          uuid('role_id').notNull(), // FK → auth.roles (managed at SQL level)
  canApproveGates: boolean('can_approve_gates').notNull().default(false),
  orgId:           uuid('org_id').notNull(),
  createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique().on(table.principalId, table.clientId, table.projectId, table.roleId),
]);

// ── Approval Gates ───────────────────────────────────
export const approvalGates = authSchema.table('approval_gates', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  projectId:          uuid('project_id').notNull(),
  langgraphThreadId:  varchar('langgraph_thread_id', { length: 255 }),
  gateStage:          varchar('gate_stage', { length: 50 }).notNull()
    .$type<'OUTREACH_PITCH' | 'REQUIREMENTS_PRD' | 'PRODUCTION_DEPLOY' | 'MARKETING_PUBLISH' | 'HOTFIX_MERGE'>(),
  artifactSummary:    text('artifact_summary'),
  artifactPayload:    jsonb('artifact_payload').notNull().default({}),
  status:             varchar('status', { length: 30 }).notNull().default('PENDING')
    .$type<'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'>(),
  decidedBy:          uuid('decided_by').references(() => principals.id),
  feedbackNotes:      text('feedback_notes'),
  decidedAt:          timestamp('decided_at', { withTimezone: true }),
  orgId:              uuid('org_id').notNull(),
  version:            integer('version').notNull().default(1),
  createdAt:          timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Relations ─────────────────────────────────────────
export const principalsRelations = relations(principals, ({ many }) => ({
  projectMemberships: many(projectMemberships),
  gateDecisions:      many(approvalGates),
}));

export const clientProjectLinksRelations = relations(clientProjectLinks, () => ({
  // Cross-service FKs — no Drizzle-level references
}));

export const projectMembershipsRelations = relations(projectMemberships, ({ one }) => ({
  principal: one(principals, { fields: [projectMemberships.principalId], references: [principals.id] }),
}));

export const approvalGatesRelations = relations(approvalGates, ({ one }) => ({
  decidedByPrincipal: one(principals, { fields: [approvalGates.decidedBy], references: [principals.id] }),
}));
