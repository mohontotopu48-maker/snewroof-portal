-- =============================================================
-- SNEWROOF CUSTOMER PORTAL — COMPLETE DATABASE SCHEMA
-- =============================================================
-- Adjusted for Neon DB without Supabase Auth headers.
-- All Row Level Security and auth.* dependencies removed.
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auto-stamps updated_at on any UPDATE
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TABLE: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name   TEXT,
    phone       TEXT,
    address     TEXT,
    avatar_url  TEXT,
    role        TEXT NOT NULL DEFAULT 'customer',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- TABLE: inspections
CREATE TABLE IF NOT EXISTS public.inspections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    address         TEXT NOT NULL,
    phone           TEXT,
    email           TEXT,
    property_type   TEXT DEFAULT 'residential',
    preferred_date  DATE,
    description     TEXT,
    image_urls      TEXT[],
    status          TEXT DEFAULT 'pending',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inspections_user_id ON public.inspections (user_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status  ON public.inspections (status);

-- TABLE: quotes
CREATE TABLE IF NOT EXISTS public.quotes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    inspection_id   UUID REFERENCES public.inspections(id) ON DELETE SET NULL,
    title           TEXT,
    total           NUMERIC(10, 2),
    valid_until     DATE,
    status          TEXT DEFAULT 'pending',
    signature_url   TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes (user_id);

-- TABLE: quote_items
CREATE TABLE IF NOT EXISTS public.quote_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id    UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity    NUMERIC(10, 2) DEFAULT 1,
    unit_price  NUMERIC(10, 2) NOT NULL,
    total       NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON public.quote_items (quote_id);

-- TABLE: projects
CREATE TABLE IF NOT EXISTS public.projects (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    quote_id     UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    title        TEXT NOT NULL,
    current_step INTEGER DEFAULT 0,
    status       TEXT DEFAULT 'active',
    start_date   DATE,
    end_date     DATE,
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects (user_id);

-- TABLE: invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    project_id  UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    amount      NUMERIC(10, 2),
    due_date    DATE,
    paid_at     TIMESTAMPTZ,
    status      TEXT DEFAULT 'unpaid',
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices (user_id);

-- TABLE: messages
CREATE TABLE IF NOT EXISTS public.messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    receiver_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content         TEXT,
    attachment_url  TEXT,
    read            BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);

-- TABLE: documents (auth.users dependency removed)
CREATE TABLE IF NOT EXISTS public.documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    url         TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    mime_type   TEXT,
    size        INTEGER,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- TABLE: document_shares
CREATE TABLE IF NOT EXISTS public.document_shares (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id  UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- TABLE: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,
    title       TEXT NOT NULL,
    body        TEXT,
    link        TEXT,
    read        BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- TRIGGERS
DROP TRIGGER IF EXISTS trg_updated_at ON public.profiles;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at ON public.projects;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at ON public.quotes;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.quotes
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at ON public.invoices;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at ON public.inspections;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.inspections
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.notify_on_inspection()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (NEW.user_id, 'inspection_confirmed',
            'Inspection Request Received',
            'Your inspection request for ' || NEW.address || ' is being reviewed.',
            '/dashboard/book-inspection');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_inspection ON public.inspections;
CREATE TRIGGER trg_new_inspection AFTER INSERT ON public.inspections
    FOR EACH ROW EXECUTE FUNCTION public.notify_on_inspection();

CREATE OR REPLACE FUNCTION public.notify_on_document_share()
RETURNS TRIGGER AS $$
DECLARE v_doc_name TEXT;
BEGIN
    SELECT name INTO v_doc_name FROM public.documents WHERE id = NEW.document_id;
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (NEW.user_id, 'document_shared',
            'New Document Shared',
            'A file has been shared with you: ' || COALESCE(v_doc_name, 'Untitled'),
            '/dashboard/documents');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_document_shared ON public.document_shares;
CREATE TRIGGER trg_document_shared AFTER INSERT ON public.document_shares
    FOR EACH ROW EXECUTE FUNCTION public.notify_on_document_share();

CREATE OR REPLACE FUNCTION public.notify_on_invoice_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.notifications (user_id, type, title, body, link)
        VALUES (NEW.user_id, 'invoice_status',
                CASE WHEN NEW.status = 'paid' THEN 'Invoice Paid'
                     WHEN NEW.status = 'overdue' THEN 'Invoice Overdue'
                     ELSE 'Invoice Updated' END,
                'Invoice status: ' || upper(NEW.status) || ' — $' || NEW.amount::TEXT,
                '/dashboard/invoices');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_invoice_update ON public.invoices;
CREATE TRIGGER trg_invoice_update AFTER UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.notify_on_invoice_update();

CREATE OR REPLACE FUNCTION public.notify_on_project_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.current_step IS DISTINCT FROM NEW.current_step
    OR OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.notifications (user_id, type, title, body, link)
        VALUES (NEW.user_id, 'project_update',
                'Project Update: ' || COALESCE(NEW.title, 'Your Project'),
                CASE WHEN NEW.status = 'completed' THEN 'Your project is complete!'
                     ELSE 'Project moved to stage ' || NEW.current_step::TEXT END,
                '/dashboard/projects');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_project_update ON public.projects;
CREATE TRIGGER trg_project_update AFTER UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.notify_on_project_update();

-- TABLE: portal_settings
CREATE TABLE IF NOT EXISTS public.portal_settings (
    id                  TEXT PRIMARY KEY DEFAULT 'global',
    ghl_script          TEXT,
    analytics_script    TEXT,
    custom_css          TEXT,
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- END OF MIGRATION
