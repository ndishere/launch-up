-- DatabaseSchemaRoot (Locked)
CREATE TABLE IF NOT EXISTS freight_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  weight_kg NUMERIC(10, 2) NOT NULL,
  quoted_usd NUMERIC(10, 2) NOT NULL
);
ALTER TABLE freight_quotes ENABLE ROW LEVEL SECURITY;
