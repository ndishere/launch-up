import {
  pgSchema, uuid, varchar, text, boolean, timestamp, integer, jsonb, numeric, primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const clientsSchema = pgSchema('clients');

// Reference to auth.organizations (cross-schema FK is handled at SQL level)
const orgIdRef = uuid('org_id').notNull();

// ── Clients ───────────────────────────────────────────
export const clients = clientsSchema.table('clients', {
  id:            uuid('id').primaryKey().defaultRandom(),
  orgId:         orgIdRef,
  name:          varchar('name', { length: 255 }).notNull(),
  domain:        varchar('domain', { length: 255 }),
  email:         varchar('email', { length: 255 }).notNull(),
  phone:         varchar('phone', { length: 50 }),
  tier:          varchar('tier', { length: 30 }).notNull().default('Startup B2C'),
  status:        varchar('status', { length: 20 }).notNull().default('Onboarding'),
  monthlyMrr:    integer('monthly_mrr').notNull().default(0),  // cents
  contactInfo:   jsonb('contact_info').notNull().default({}),
  notes:         text('notes'),
  isDeleted:     boolean('is_deleted').notNull().default(false),
  createdAt:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:     timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Client ↔ Project Junction ─────────────────────────
export const clientProjects = clientsSchema.table('client_projects', {
  clientId:          uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  projectId:         uuid('project_id').notNull(),
  isPrimary:         boolean('is_primary').notNull().default(false),
  revenueSharePct:   numeric('revenue_share_pct', { precision: 5, scale: 2 }).default('0'),
  accessPermissions: jsonb('access_permissions').notNull().default({}),
  createdAt:         timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.clientId, table.projectId] }),
]);

// ── Requirement Intakes ───────────────────────────────
export const requirementIntakes = clientsSchema.table('requirement_intakes', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  orgId:                orgIdRef,
  clientId:             uuid('client_id').references(() => clients.id),
  clientName:           varchar('client_name', { length: 255 }).notNull(),
  companyName:          varchar('company_name', { length: 255 }).notNull(),
  contactEmail:         varchar('contact_email', { length: 255 }).notNull(),
  contactPhone:         varchar('contact_phone', { length: 50 }),
  projectTitle:         varchar('project_title', { length: 255 }).notNull(),
  productTypes:         text('product_types').array().notNull().default([]),
  servicesNeeded:       text('services_needed').array().notNull().default([]),
  budgetEstimated:      varchar('budget_estimated', { length: 100 }),
  deadline:             varchar('deadline', { length: 100 }),
  summary:              text('summary').notNull(),
  detailedRequirements: text('detailed_requirements'),
  status:               varchar('status', { length: 30 }).notNull().default('Draft'),
  createdAt:            timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:            timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Relations ─────────────────────────────────────────
export const clientsRelations = relations(clients, ({ many }) => ({
  clientProjects:   many(clientProjects),
}));

export const clientProjectsRelations = relations(clientProjects, ({ one }) => ({
  client: one(clients, { fields: [clientProjects.clientId], references: [clients.id] }),
}));

