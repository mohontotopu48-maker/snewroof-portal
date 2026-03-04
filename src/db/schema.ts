import {
    pgTable,
    uuid,
    text,
    timestamp,
    date,
    integer,
    boolean,
    numeric
} from 'drizzle-orm/pg-core';

// Auth Users Table (Custom for NextAuth/Credentials)
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash'),
    vercelUserId: text('vercel_user_id').unique(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    fullName: text('full_name'),
    phone: text('phone'),
    address: text('address'),
    avatarUrl: text('avatar_url'),
    role: text('role').notNull().default('customer'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

export const inspections = pgTable('inspections', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    address: text('address').notNull(),
    phone: text('phone'),
    email: text('email'),
    propertyType: text('property_type').default('residential'),
    preferredDate: date('preferred_date'),
    description: text('description'),
    imageUrls: text('image_urls').array(),
    status: text('status').default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

export const quotes = pgTable('quotes', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
    inspectionId: uuid('inspection_id').references(() => inspections.id, { onDelete: 'set null' }),
    title: text('title'),
    total: numeric('total', { precision: 10, scale: 2 }),
    validUntil: date('valid_until'),
    status: text('status').default('pending'),
    signatureUrl: text('signature_url'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

export const quoteItems = pgTable('quote_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    quantity: numeric('quantity', { precision: 10, scale: 2 }).default('1'),
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow()
});

export const projects = pgTable('projects', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
    quoteId: uuid('quote_id').references(() => quotes.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    currentStep: integer('current_step').default(0),
    status: text('status').default('active'),
    startDate: date('start_date'),
    endDate: date('end_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

export const invoices = pgTable('invoices', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    amount: numeric('amount', { precision: 10, scale: 2 }),
    dueDate: date('due_date'),
    paidAt: timestamp('paid_at'),
    status: text('status').default('unpaid'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

export const messages = pgTable('messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    senderId: uuid('sender_id').references(() => profiles.id, { onDelete: 'set null' }),
    receiverId: uuid('receiver_id').references(() => profiles.id, { onDelete: 'set null' }),
    content: text('content'),
    attachmentUrl: text('attachment_url'),
    read: boolean('read').default(false),
    createdAt: timestamp('created_at').defaultNow()
});

export const documents = pgTable('documents', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    url: text('url').notNull(),
    storageKey: text('storage_key').notNull(),
    mimeType: text('mime_type'),
    size: integer('size'),
    uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow()
});

export const documentShares = pgTable('document_shares', {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow()
});

export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    link: text('link'),
    read: boolean('read').default(false),
    createdAt: timestamp('created_at').defaultNow()
});
