-- Immutable PostgreSQL 16 Multi-Tenant RLS Core
CREATE POLICY tenant_isolation_policy ON tenant_work_orders
  USING (client_id = current_setting('app.current_client_id')::uuid);
