CREATE TABLE IF NOT EXISTS tenant_work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  budget_usd NUMERIC(12, 2) DEFAULT 0
);
ALTER TABLE tenant_work_orders ENABLE ROW LEVEL SECURITY;
