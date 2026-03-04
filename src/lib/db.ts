// Database schema SQL for reference - run these via InsForge SQL editor
// Tables: profiles, inspections, quotes, quote_items, projects, project_steps,
//         invoices, invoice_items, messages, notifications

export const DB_SCHEMA = `
-- Profiles (extends auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inspections (booking requests)
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  property_type TEXT DEFAULT 'residential',
  preferred_date DATE,
  description TEXT,
  image_urls TEXT[],
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  inspection_id UUID REFERENCES inspections(id),
  title TEXT,
  total NUMERIC(10,2),
  valid_until DATE,
  status TEXT DEFAULT 'pending',
  signature_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quote line items
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id),
  description TEXT,
  quantity INT,
  unit_price NUMERIC(10,2),
  total NUMERIC(10,2)
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  quote_id UUID REFERENCES quotes(id),
  title TEXT,
  current_step INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id),
  amount NUMERIC(10,2),
  due_date DATE,
  status TEXT DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  content TEXT,
  attachment_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
`;

export type ProjectStep = {
    label: string;
    description: string;
};

export const PROJECT_STEPS: ProjectStep[] = [
    { label: 'Inspection Completed', description: 'Initial roof inspection done' },
    { label: 'Quote Sent', description: 'Detailed quote sent to customer' },
    { label: 'Materials Ordered', description: 'Roofing materials procured' },
    { label: 'Work Started', description: 'Roofing work has begun' },
    { label: 'Work Completed', description: 'All roofing work finished' },
    { label: 'Final Inspection', description: 'Quality check completed' },
];
