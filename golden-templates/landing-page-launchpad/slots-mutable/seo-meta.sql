CREATE TABLE IF NOT EXISTS leads_capture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  utm_source TEXT DEFAULT 'direct',
  created_at TIMESTAMPTZ DEFAULT now()
);
