-- =============================================================
-- SNEWROOF CUSTOMER PORTAL — COMPLETE DATABASE SCHEMA
-- Generated: 2026-03-04
-- =============================================================
-- Run this script on a fresh InsForge / PostgreSQL database
-- to recreate the entire Snewroof portal schema.
-- =============================================================


-- =============================================================
-- EXTENSIONS
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================
-- HELPER FUNCTIONS
-- =============================================================

-- Returns the currently authenticated user's UUID from JWT
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
    SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
$$ LANGUAGE sql STABLE;

-- Returns the current user's role from the profiles table
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Auto-stamps updated_at on any UPDATE
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================
-- TABLE: profiles
-- Linked 1:1 with auth.users. Stores name, role, contact info.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY,                          -- Same as auth.users.id
    full_name   TEXT,
    phone       TEXT,
    address     TEXT,
    avatar_url  TEXT,
    role        TEXT NOT NULL DEFAULT 'customer',          -- 'customer' | 'team' | 'admin'
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);


-- =============================================================
-- TABLE: inspections
-- Customer roof inspection booking requests.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.inspections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    address         TEXT NOT NULL,
    phone           TEXT,
    email           TEXT,
    property_type   TEXT DEFAULT 'residential',            -- residential | commercial
    preferred_date  DATE,
    description     TEXT,
    image_urls      TEXT[],                                -- Array of uploaded photo URLs
    status          TEXT DEFAULT 'pending',                -- pending | scheduled | completed | cancelled
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inspections_user_id      ON public.inspections (user_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status       ON public.inspections (status);
CREATE INDEX IF NOT EXISTS idx_inspections_preferred_date ON public.inspections (preferred_date);


-- =============================================================
-- TABLE: quotes
-- Project estimates sent to customers.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.quotes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    inspection_id   UUID REFERENCES public.inspections(id) ON DELETE SET NULL,
    title           TEXT,
    total           NUMERIC(10, 2),
    valid_until     DATE,
    status          TEXT DEFAULT 'pending',                -- pending | approved | rejected | expired
    signature_url   TEXT,                                  -- Customer's digital signature
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_user_id       ON public.quotes (user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status        ON public.quotes (status);
CREATE INDEX IF NOT EXISTS idx_quotes_inspection_id ON public.quotes (inspection_id);


-- =============================================================
-- TABLE: quote_items
-- Line items within a quote (materials, labor, etc.)
-- =============================================================
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


-- =============================================================
-- TABLE: projects
-- Active roofing projects linked to customers.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    quote_id     UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    title        TEXT NOT NULL,
    current_step INTEGER DEFAULT 0,                        -- 0-5 stages of completion
    status       TEXT DEFAULT 'active',                    -- active | on_hold | completed | cancelled
    start_date   DATE,
    end_date     DATE,
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status  ON public.projects (status);


-- =============================================================
-- TABLE: invoices
-- Billing and payment tracking per project.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    project_id  UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    amount      NUMERIC(10, 2),
    due_date    DATE,
    paid_at     TIMESTAMPTZ,
    status      TEXT DEFAULT 'unpaid',                     -- unpaid | paid | overdue | cancelled
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id    ON public.invoices (user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status     ON public.invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON public.invoices (project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date   ON public.invoices (due_date);


-- =============================================================
-- TABLE: messages
-- Two-way chat between customers and team.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    receiver_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content         TEXT,
    attachment_url  TEXT,                                  -- Optional file attachment
    read            BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id   ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages (receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_read        ON public.messages (read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at  ON public.messages (created_at DESC);


-- =============================================================
-- TABLE: documents
-- Files uploaded by admins (PDFs, site photos, reports).
-- =============================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    url         TEXT NOT NULL,                             -- Public CDN URL
    storage_key TEXT NOT NULL,                             -- InsForge storage bucket key
    mime_type   TEXT,
    size        INTEGER,                                   -- Bytes
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at  ON public.documents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_mime_type   ON public.documents (mime_type);


-- =============================================================
-- TABLE: document_shares
-- Links documents to specific customers (and optionally projects).
-- =============================================================
CREATE TABLE IF NOT EXISTS public.document_shares (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id  UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_shares_document_id ON public.document_shares (document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_user_id     ON public.document_shares (user_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_project_id  ON public.document_shares (project_id);


-- =============================================================
-- TABLE: notifications
-- In-app alerts delivered to customers.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,                             -- 'document_shared' | 'inspection_confirmed' | 'invoice_due' | 'project_update'
    title       TEXT NOT NULL,
    body        TEXT,
    link        TEXT,                                      -- Dashboard route to navigate to
    read        BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read    ON public.notifications (read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications (created_at DESC);


-- =============================================================
-- TRIGGERS
-- Drop existing triggers first to make this script idempotent
-- (safe to re-run on an existing database)
-- =============================================================

-- 1. Auto-update updated_at on row change
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

-- 2. Notify customer when inspection is booked
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

-- 3. Notify customer when a document is shared
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

-- 4. Notify customer on invoice status change
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

-- 5. Notify customer on project stage/status update
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


-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles: view own"     ON public.profiles FOR SELECT USING (id = auth.uid() OR public.get_my_role() IN ('admin','team'));
CREATE POLICY "profiles: update own"   ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles: admin insert" ON public.profiles FOR INSERT WITH CHECK (public.get_my_role() = 'admin' OR id = auth.uid());

-- notifications
CREATE POLICY "notifications: view own"   ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications: mark read"  ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications: system insert" ON public.notifications FOR INSERT WITH CHECK (public.get_my_role() IN ('admin','team') OR user_id = auth.uid());

-- inspections
CREATE POLICY "inspections: view own"   ON public.inspections FOR SELECT USING (user_id = auth.uid() OR public.get_my_role() IN ('admin','team'));
CREATE POLICY "inspections: insert own" ON public.inspections FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "inspections: admin mgmt" ON public.inspections FOR UPDATE USING (public.get_my_role() IN ('admin','team'));

-- quotes
CREATE POLICY "quotes: view own"    ON public.quotes FOR SELECT USING (user_id = auth.uid() OR public.get_my_role() IN ('admin','team'));
CREATE POLICY "quotes: admin manage" ON public.quotes FOR ALL USING (public.get_my_role() IN ('admin','team'));

-- quote_items
CREATE POLICY "quote_items: view via quote" ON public.quote_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quotes q WHERE q.id = quote_items.quote_id AND (q.user_id = auth.uid() OR public.get_my_role() IN ('admin','team')))
);
CREATE POLICY "quote_items: admin manage" ON public.quote_items FOR ALL USING (public.get_my_role() IN ('admin','team'));

-- projects
CREATE POLICY "projects: view own"     ON public.projects FOR SELECT USING (user_id = auth.uid() OR public.get_my_role() IN ('admin','team'));
CREATE POLICY "projects: admin manage" ON public.projects FOR ALL USING (public.get_my_role() IN ('admin','team'));

-- invoices
CREATE POLICY "invoices: view own"     ON public.invoices FOR SELECT USING (user_id = auth.uid() OR public.get_my_role() IN ('admin','team'));
CREATE POLICY "invoices: admin manage" ON public.invoices FOR ALL USING (public.get_my_role() IN ('admin','team'));

-- messages
CREATE POLICY "messages: view conversation" ON public.messages FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid() OR public.get_my_role() IN ('admin','team'));
CREATE POLICY "messages: send"              ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "messages: mark read"         ON public.messages FOR UPDATE USING (receiver_id = auth.uid() OR public.get_my_role() IN ('admin','team'));

-- documents
CREATE POLICY "documents: admin full"     ON public.documents FOR ALL USING (public.get_my_role() IN ('admin','team'));
CREATE POLICY "documents: customer shared" ON public.documents FOR SELECT USING (
    public.get_my_role() = 'customer' AND
    EXISTS (SELECT 1 FROM public.document_shares ds WHERE ds.document_id = documents.id AND ds.user_id = auth.uid())
);

-- document_shares
CREATE POLICY "document_shares: view own"    ON public.document_shares FOR SELECT USING (user_id = auth.uid() OR public.get_my_role() IN ('admin','team'));
CREATE POLICY "document_shares: admin insert" ON public.document_shares FOR INSERT WITH CHECK (public.get_my_role() IN ('admin','team'));
CREATE POLICY "document_shares: admin delete" ON public.document_shares FOR DELETE USING (public.get_my_role() IN ('admin','team'));


-- =============================================================
-- END OF SCHEMA
-- =============================================================
