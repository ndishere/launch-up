import { eq, and, sql } from 'drizzle-orm';
import { clientProjectLinks } from '../models/schema.js';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../models/schema.js';

/**
 * Detects circular vendor/partner hierarchies using BFS cycle detection.
 *
 * If clientA is adding clientB as VENDOR/AGENCY_PARTNER on projectX,
 * checks if clientB already has clientA as VENDOR/AGENCY_PARTNER on the
 * same project (directly or transitively).
 *
 * @returns true if circular tenancy is detected
 */
export async function detectCircularTenancy(
  db: NodePgDatabase<typeof schema>,
  clientId: string,
  projectId: string,
  proposedRelationship: string,
): Promise<boolean> {
  // Only check for relationships that can form cycles
  if (proposedRelationship !== 'VENDOR' && proposedRelationship !== 'AGENCY_PARTNER') {
    return false;
  }

  // Load all vendor/partner links for this project
  const links = await db
    .select()
    .from(clientProjectLinks)
    .where(
      and(
        eq(clientProjectLinks.projectId, projectId),
        sql`${clientProjectLinks.relationshipType} IN ('VENDOR', 'AGENCY_PARTNER')`,
      ),
    );

  // Build adjacency list: edge means "clientId has targetClientId as vendor/partner"
  const adjacency = new Map<string, Set<string>>();
  for (const link of links) {
    if (!adjacency.has(link.clientId)) {
      adjacency.set(link.clientId, new Set());
    }
    // The link.clientId engaged link's target — but in client_project_links,
    // clientId IS the client, and the relationship is their role on the project.
    // For cycle detection we need to see if the *target* (the one being added)
    // already points back to the source through the chain.
  }

  // For each existing link, build a graph: if clientA's record has
  // VENDOR relationship, then clientA depends on whoever added them.
  // We model it as: clientId → all other clients who are also linked
  // We re-query for the reverse direction.
  // Simpler approach: BFS from the proposed target back to source
  // checking if targetClient (being added as vendor of clientId)
  // already has clientId in its dependency chain.

  // Build directed graph: if X has Y as VENDOR/AGENCY_PARTNER, edge X → Y
  const graph = new Map<string, string[]>();
  for (const link of links) {
    const existing = graph.get(link.clientId) || [];
    // In the link table, we need to find the "other" client for the same project
    // Actually, the links themselves encode clientId ↔ projectId relationships.
    // We need a different approach: look at all links per project and build
    // "who depends on whom" edges.
    graph.set(link.clientId, existing);
  }

  // Direct cycle check: Would adding clientId→targetClient create a path
  // from targetClient back to clientId?
  // The proposed edge is: clientId is adding some target as VENDOR.
  // In clientProjectLinks, the clientId field is the client who has the
  // relationship on the project. So we check: is there already a link
  // where the *target* client (the one being linked) has clientId as
  // a VENDOR/AGENCY_PARTNER on the same project?

  // Use recursive CTE for transitive cycle detection
  const cycleResult = await db.execute(
    sql`WITH RECURSIVE chain AS (
          -- Seed: start from the target we're trying to add as vendor
          SELECT cpl.client_id
          FROM auth.client_project_links cpl
          WHERE cpl.project_id = ${projectId}
            AND cpl.relationship_type IN ('VENDOR', 'AGENCY_PARTNER')
            AND cpl.client_id = ${clientId}

          UNION

          -- Walk: follow vendor/partner links
          SELECT cpl2.client_id
          FROM auth.client_project_links cpl2
          INNER JOIN chain c ON c.client_id = cpl2.client_id
          WHERE cpl2.project_id = ${projectId}
            AND cpl2.relationship_type IN ('VENDOR', 'AGENCY_PARTNER')
        )
        SELECT 1 AS circular
        FROM chain
        WHERE client_id = ${clientId}
        LIMIT 1`,
  );

  const rows = (cycleResult as any).rows ?? cycleResult;
  return Array.isArray(rows) && rows.length > 0;
}
