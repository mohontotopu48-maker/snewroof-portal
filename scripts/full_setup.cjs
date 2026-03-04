// Direct migration using neon's tagged template literals
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const sql = neon(process.env.DATABASE_URL);

async function run(label, query) {
    try {
        await query();
        process.stdout.write(`✅ ${label}\n`);
    } catch (e) {
        if (e.message && (e.message.includes('already exists') || e.message.includes('does not exist') && e.message.includes('trigger'))) {
            process.stdout.write(`~ ${label} (already exists)\n`);
        } else {
            console.error(`❌ ${label}: ${e.message}`);
        }
    }
}

async function main() {
    // Extensions
    await run('pgcrypto', () => sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await run('uuid-ossp', () => sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Users table
    await run('users table', () => sql`
    CREATE TABLE IF NOT EXISTS users (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email        TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at   TIMESTAMPTZ DEFAULT now(),
      updated_at   TIMESTAMPTZ DEFAULT now()
    )
  `);

    // Profiles
    await run('profiles table', () => sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      full_name  TEXT,
      phone      TEXT,
      address    TEXT,
      avatar_url TEXT,
      role       TEXT NOT NULL DEFAULT 'customer',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `);

    // Inspections
    await run('inspections table', () => sql`
    CREATE TABLE IF NOT EXISTS inspections (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
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
    )
  `);

    // Quotes
    await run('quotes table', () => sql`
    CREATE TABLE IF NOT EXISTS quotes (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
      inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
      title         TEXT,
      total         NUMERIC(10, 2),
      valid_until   DATE,
      status        TEXT DEFAULT 'pending',
      signature_url TEXT,
      notes         TEXT,
      created_at    TIMESTAMPTZ DEFAULT now(),
      updated_at    TIMESTAMPTZ DEFAULT now()
    )
  `);

    // Projects
    await run('projects table', () => sql`
    CREATE TABLE IF NOT EXISTS projects (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
      quote_id     UUID REFERENCES quotes(id) ON DELETE SET NULL,
      title        TEXT NOT NULL,
      current_step INTEGER DEFAULT 0,
      status       TEXT DEFAULT 'active',
      start_date   DATE,
      end_date     DATE,
      created_at   TIMESTAMPTZ DEFAULT now(),
      updated_at   TIMESTAMPTZ DEFAULT now()
    )
  `);

    // Invoices
    await run('invoices table', () => sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
      project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
      amount     NUMERIC(10, 2),
      due_date   DATE,
      paid_at    TIMESTAMPTZ,
      status     TEXT DEFAULT 'unpaid',
      notes      TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `);

    // Messages
    await run('messages table', () => sql`
    CREATE TABLE IF NOT EXISTS messages (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
      receiver_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
      content        TEXT,
      attachment_url TEXT,
      read           BOOLEAN DEFAULT false,
      created_at     TIMESTAMPTZ DEFAULT now()
    )
  `);

    // Documents
    await run('documents table', () => sql`
    CREATE TABLE IF NOT EXISTS documents (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        TEXT NOT NULL,
      url         TEXT NOT NULL,
      storage_key TEXT NOT NULL,
      mime_type   TEXT,
      size        INTEGER,
      uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at  TIMESTAMPTZ DEFAULT now()
    )
  `);

    // Document Shares
    await run('document_shares table', () => sql`
    CREATE TABLE IF NOT EXISTS document_shares (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
      created_at  TIMESTAMPTZ DEFAULT now()
    )
  `);

    // Notifications
    await run('notifications table', () => sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
      type       TEXT NOT NULL,
      title      TEXT NOT NULL,
      body       TEXT,
      link       TEXT,
      read       BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);

    // Now create/reset the admin user
    const EMAIL = 'mohontotopu48@gmail.com';
    const PASSWORD = 'SNR#26$Customer';
    const hash = await bcrypt.hash(PASSWORD, 12);

    const existing = await sql`SELECT id FROM users WHERE email = ${EMAIL} LIMIT 1`;
    let userId;

    if (existing.length > 0) {
        userId = existing[0].id;
        await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${userId}`;
        console.log(`✅ Password reset for ${EMAIL} (id: ${userId})`);
    } else {
        userId = crypto.randomUUID();
        await sql`INSERT INTO users (id, email, password_hash) VALUES (${userId}, ${EMAIL}, ${hash})`;
        console.log(`✅ Admin user created: ${EMAIL}`);
    }

    // Ensure profile
    const profile = await sql`SELECT id FROM profiles WHERE id = ${userId} LIMIT 1`;
    if (!profile.length) {
        await sql`INSERT INTO profiles (id, full_name, role) VALUES (${userId}, 'Portal Admin', 'admin')`;
        console.log(`✅ Admin profile created`);
    } else {
        await sql`UPDATE profiles SET role = 'admin' WHERE id = ${userId}`;
        console.log(`✅ Profile role confirmed: admin`);
    }

    // Verify
    const verify = await bcrypt.compare(PASSWORD, hash);
    console.log(`✅ bcrypt verify: ${verify}`);

    const check = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`;
    console.log('\n📋 Tables in DB:', check.map(t => t.table_name).join(', '));
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
