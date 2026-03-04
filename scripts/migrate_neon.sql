-- ===============================================================
-- SNEWROOF PORTAL — NEON DB MIGRATION (NextAuth + Drizzle)
-- No Supabase auth schema, no RLS. Auth is handled by NextAuth.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE).
-- ===============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------
-- Auth Users (credentials stored here, used by NextAuth)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email        TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------
-- Profiles (1:1 with users)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id         UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    full_name  TEXT,
    phone      TEXT,
    address    TEXT,
    avatar_url TEXT,
    role       TEXT NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- ---------------------------------------------------------------
-- Inspections
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inspections (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name           TEXT NOT NULL,
    address        TEXT NOT NULL,
    phone          TEXT,
    email          TEXT,
    property_type  TEXT DEFAULT 'residential',
    preferred_date DATE,
    description    TEXT,
    image_urls     TEXT[],
    status         TEXT DEFAULT 'pending',
    created_at     TIMESTAMPTZ DEFAULT now(),
    updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inspections_user_id ON public.inspections (user_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status  ON public.inspections (status);

-- ---------------------------------------------------------------
-- Quotes
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    inspection_id UUID REFERENCES public.inspections(id) ON DELETE SET NULL,
    title         TEXT,
    total         NUMERIC(10, 2),
    valid_until   DATE,
    status        TEXT DEFAULT 'pending',
    signature_url TEXT,
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes (user_id);

-- ---------------------------------------------------------------
-- Quote Items
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quote_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id    UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity    NUMERIC(10, 2) DEFAULT 1,
    unit_price  NUMERIC(10, 2) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------
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

-- ---------------------------------------------------------------
-- Invoices
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    amount     NUMERIC(10, 2),
    due_date   DATE,
    paid_at    TIMESTAMPTZ,
    status     TEXT DEFAULT 'unpaid',
    notes      TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices (user_id);

-- ---------------------------------------------------------------
-- Messages
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    receiver_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content        TEXT,
    attachment_url TEXT,
    read           BOOLEAN DEFAULT false,
    created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id   ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages (receiver_id);

-- ---------------------------------------------------------------
-- Documents
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    url         TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    mime_type   TEXT,
    size        INTEGER,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents (uploaded_by);

-- ---------------------------------------------------------------
-- Document Shares
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_shares (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id  UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_shares_user_id ON public.document_shares (user_id);

-- ---------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type       TEXT NOT NULL,
    title      TEXT NOT NULL,
    body       TEXT,
    link       TEXT,
    read       BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);

-- ---------------------------------------------------------------
-- Auto-update updated_at trigger
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_quotes_updated_at ON public.quotes;
CREATE TRIGGER trg_quotes_updated_at BEFORE UPDATE ON public.quotes
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_invoices_updated_at ON public.invoices;
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_inspections_updated_at ON public.inspections;
CREATE TRIGGER trg_inspections_updated_at BEFORE UPDATE ON public.inspections
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===============================================================
-- END
-- ===============================================================
