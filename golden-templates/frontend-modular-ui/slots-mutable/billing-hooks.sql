CREATE TABLE IF NOT EXISTS portal_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  widget_key TEXT NOT NULL,
  position INTEGER DEFAULT 0
);
