import {
  pgSchema, uuid, varchar, text, boolean, timestamp, integer, jsonb, inet, citext, primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const authSchema = pgSchema('auth');

// ── Organizations ─────────────────────────────────────
export const organizations = authSchema.table('organizations', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      varchar('name', { length: 255 }).notNull(),
  slug:      varchar('slug', { length: 255 }).notNull().unique(),
  planTier:  varchar('plan_tier', { length: 50 }).notNull().default('free'),
  settings:  jsonb('settings').notNull().default({}),
  isActive:  boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Users ─────────────────────────────────────────────
export const users = authSchema.table('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  orgId:        uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  email:        varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName:     varchar('full_name', { length: 255 }).notNull(),
  avatarUrl:    text('avatar_url'),
  mfaSecret:    varchar('mfa_secret', { length: 255 }),
  mfaEnabled:   boolean('mfa_enabled').notNull().default(false),
  status:       varchar('status', { length: 20 }).notNull().default('active'),
  lastLoginAt:  timestamp('last_login_at', { withTimezone: true }),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Roles ─────────────────────────────────────────────
export const roles = authSchema.table('roles', {
  id:           uuid('id').primaryKey().defaultRandom(),
  name:         varchar('name', { length: 100 }).notNull().unique(),
  displayName:  varchar('display_name', { length: 255 }).notNull(),
  description:  text('description'),
  isSystemRole: boolean('is_system_role').notNull().default(false),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Permissions ───────────────────────────────────────
export const permissions = authSchema.table('permissions', {
  id:          uuid('id').primaryKey().defaultRandom(),
  resource:    varchar('resource', { length: 100 }).notNull(),
  action:      varchar('action', { length: 50 }).notNull(),
  scope:       varchar('scope', { length: 50 }).notNull().default('org'),
  description: text('description'),
});

// ── Role Permissions (junction) ───────────────────────
export const rolePermissions = authSchema.table('role_permissions', {
  roleId:       uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.roleId, table.permissionId] }),
]);

// ── User Roles (junction) ─────────────────────────────
export const userRoles = authSchema.table('user_roles', {
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId:    uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  orgId:     uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
  grantedBy: uuid('granted_by').references(() => users.id),
}, (table) => [
  primaryKey({ columns: [table.userId, table.roleId, table.orgId] }),
]);

// ── Refresh Tokens ────────────────────────────────────
export const refreshTokens = authSchema.table('refresh_tokens', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revoked:   boolean('revoked').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),
});

// ── Relations ─────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, { fields: [users.orgId], references: [organizations.id] }),
  userRoles:    many(userRoles),
  refreshTokens: many(refreshTokens),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userRoles:       many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role:       one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] }),
}));

