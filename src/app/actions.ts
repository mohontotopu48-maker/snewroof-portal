'use server';

import { db } from '@/lib/db';
import { quotes, projects, invoices, inspections, messages, documentShares, documents, profiles, users } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';

import { eq, desc, or } from 'drizzle-orm';

const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000001';
const DUMMY_USER_EMAIL = 'customer@example.com';

export async function getQuotes() {
    const data = await db.select().from(quotes)
        .where(eq(quotes.userId, DUMMY_USER_ID))
        .orderBy(desc(quotes.createdAt));

    // Convert Date objects to ISO strings for client components
    return data.map(q => ({
        ...q,
        createdAt: q.createdAt?.toISOString() || '',
        updatedAt: q.updatedAt?.toISOString() || '',
    }));
}

export async function getProjects() {
    const data = await db.select().from(projects)
        .where(eq(projects.userId, DUMMY_USER_ID))
        .orderBy(desc(projects.createdAt));

    return data.map(p => ({
        ...p,
        createdAt: p.createdAt?.toISOString() || '',
        updatedAt: p.updatedAt?.toISOString() || '',
    }));
}

export async function getInvoices() {
    const data = await db.select({
        id: invoices.id,
        amount: invoices.amount,
        dueDate: invoices.dueDate,
        paidAt: invoices.paidAt,
        status: invoices.status,
        notes: invoices.notes,
        projectId: invoices.projectId,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
        projects: {
            title: projects.title
        }
    })
        .from(invoices)
        .leftJoin(projects, eq(invoices.projectId, projects.id))
        .where(eq(invoices.userId, DUMMY_USER_ID))
        .orderBy(desc(invoices.createdAt));

    return data.map(i => ({
        ...i,
        amount: Number(i.amount || 0),
        due_date: i.dueDate ? String(i.dueDate) : '',
        paid_at: i.paidAt?.toISOString() || null,
        status: i.status || 'unpaid',
        notes: i.notes || '',
        project_id: i.projectId || '',
        created_at: i.createdAt?.toISOString() || '',
        updated_at: i.updatedAt?.toISOString() || '',
    }));
}

export async function getInspections() {
    const data = await db.select().from(inspections)
        .where(eq(inspections.userId, DUMMY_USER_ID))
        .orderBy(desc(inspections.createdAt));

    return data.map(i => ({
        ...i,
        createdAt: i.createdAt?.toISOString() || '',
        updatedAt: i.updatedAt?.toISOString() || '',
    }));
}

export async function getMessages() {
    // Fetch conversation where user is either sender or receiver
    const data = await db.select().from(messages)
        .where(
            or(
                eq(messages.receiverId, DUMMY_USER_ID),
                eq(messages.senderId, DUMMY_USER_ID)
            )
        )
        // Fetch ordered by time ascending (oldest first for chat UI)
        .orderBy(messages.createdAt);

    return data.map(m => ({
        ...m,
        created_at: m.createdAt?.toISOString() || '',
        sender_id: m.senderId || '',
        receiver_id: m.receiverId || ''
    }));
}

export async function sendMessage(content: string) {
    // Find an admin to receive the message (fallback as in original code)
    const adminData = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.role, 'admin')).limit(1);
    const receiverId = adminData[0]?.id || '00000000-0000-0000-0000-000000000000';

    await db.insert(messages).values({
        senderId: DUMMY_USER_ID,
        receiverId,
        content,
        read: false
    });
}

export async function getDocuments() {
    const data = await db.select({
        id: documentShares.id,
        createdAt: documentShares.createdAt,
        documentId: documentShares.documentId,
        documents: {
            id: documents.id,
            name: documents.name,
            url: documents.url,
            mimeType: documents.mimeType,
            size: documents.size
        },
        projects: {
            title: projects.title
        }
    })
        .from(documentShares)
        .innerJoin(documents, eq(documentShares.documentId, documents.id))
        .leftJoin(projects, eq(documentShares.projectId, projects.id))
        .where(eq(documentShares.userId, DUMMY_USER_ID))
        .orderBy(desc(documentShares.createdAt));

    return data.map(d => ({
        ...d,
        created_at: d.createdAt ? String(d.createdAt) : '',
        document_id: d.documentId || '',
        documents: {
            ...d.documents,
            mime_type: d.documents.mimeType || 'application/octet-stream'
        }
    }));
}

export async function updatePassword(newPassword: string) {
    // No-op or throw error since auth is removed
    console.log("Password update requested for dummy user, ignoring.");
    return;
}

export async function getSharedPhotos() {
    // Drizzle inner join
    const data = await db.select({
        id: documentShares.id,
        documents: {
            id: documents.id,
            name: documents.name,
            url: documents.url,
            mimeType: documents.mimeType
        }
    })
        .from(documentShares)
        .innerJoin(documents, eq(documentShares.documentId, documents.id))
        .where(eq(documentShares.userId, DUMMY_USER_ID));

    // Filter only images (as per original logic)
    return data.filter(d => d.documents.mimeType?.startsWith('image/'));
}

import { put } from '@vercel/blob';

export async function getProfile() {
    const data = await db.select().from(profiles).where(eq(profiles.id, DUMMY_USER_ID)).limit(1);
    return data[0] || null;
}

export async function updateProfile(updateData: { fullName?: string | null, phone?: string | null, address?: string | null }) {
    await db.update(profiles)
        .set(updateData)
        .where(eq(profiles.id, DUMMY_USER_ID));
}

export async function uploadAvatar(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided');

    const blob = await put(`avatars/${DUMMY_USER_ID}/${file.name}`, file, {
        access: 'public',
    });

    await db.update(profiles).set({ avatarUrl: blob.url }).where(eq(profiles.id, DUMMY_USER_ID));
    return blob.url;
}

export async function getAdminProfiles() {
    const data = await db.select({
        id: profiles.id,
        full_name: profiles.fullName,
        role: profiles.role
    }).from(profiles);

    return data;
}

export async function getAdminCustomers() {
    const data = await db.select({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        fullName: profiles.fullName,
        phone: profiles.phone,
        role: profiles.role,
        avatarUrl: profiles.avatarUrl,
    })
        .from(users)
        .leftJoin(profiles, eq(profiles.id, users.id))
        .orderBy(desc(users.createdAt));

    return data.map(u => ({
        ...u,
        createdAt: u.createdAt?.toISOString() || '',
    }));
}

export async function createAdminCustomer(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: string;
}) {

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1);
    if (existing.length > 0) return { error: 'Email already in use' };

    const userId = uuidv4();

    await db.insert(users).values({ id: userId, email: data.email });
    await db.insert(profiles).values({
        id: userId,
        fullName: data.fullName,
        phone: data.phone || null,
        role: data.role || 'customer',
    });

    return { error: null, id: userId };
}

export async function updateCustomerRole(userId: string, role: string) {
    await db.update(profiles).set({ role }).where(eq(profiles.id, userId));
}

export async function deleteCustomer(userId: string) {
    // Cascade deletes profile too (FK ON DELETE CASCADE)
    await db.delete(users).where(eq(users.id, userId));
}

export async function resetCustomerPassword(userId: string, newPassword: string) {
    // No-op
    console.log("Password reset requested for dummy user, ignoring.");
    return;
}


export async function getAdminProjects() {
    const data = await db.select({
        id: projects.id,
        title: projects.title,
        user_id: projects.userId
    }).from(projects);

    return data;
}

export async function uploadAdminDocument(formData: FormData) {
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const projectId = formData.get('projectId') as string;

    if (!file || !userId) throw new Error('Missing file or user selection');

    // 1. Upload to Vercel Blob
    const blob = await put(`documents/${userId}/${file.name}`, file, {
        access: 'public',
    });

    // 2. Create document record
    const [doc] = await db.insert(documents).values({
        name: file.name,
        url: blob.url,
        storageKey: blob.url, // In Vercel Blob, URL can serve as key
        mimeType: file.type,
        size: file.size,
        uploadedBy: DUMMY_USER_ID
    }).returning();

    // 3. Create share record
    await db.insert(documentShares).values({
        documentId: doc.id,
        userId: userId,
        projectId: projectId || null
    });

    return { success: true };
}

export async function bookInspection(data: {
    address: string;
    property_type: string;
    preferred_date: string;
    description: string;
}) {
    const profile = await getProfile();

    await db.insert(inspections).values({
        userId: DUMMY_USER_ID,
        name: profile?.fullName || 'Unnamed Customer',
        email: DUMMY_USER_EMAIL,
        address: data.address,
        propertyType: data.property_type,
        preferredDate: data.preferred_date,
        description: data.description,
        status: 'pending'
    });

    return { success: true };
}

export async function getDashboardStats() {
    const [p, q, i] = await Promise.all([
        db.select({ status: projects.status }).from(projects).where(eq(projects.userId, DUMMY_USER_ID)),
        db.select({ status: quotes.status }).from(quotes).where(eq(quotes.userId, DUMMY_USER_ID)),
        db.select({ preferredDate: inspections.preferredDate }).from(inspections).where(eq(inspections.userId, DUMMY_USER_ID)).orderBy(inspections.preferredDate)
    ]);

    const stats = {
        activeProjects: p.filter((proj: { status: string | null }) => proj.status === 'active').length,
        completedJobs: p.filter((proj: { status: string | null }) => proj.status === 'completed').length,
        pendingQuotes: q.filter((quote: { status: string | null }) => quote.status === 'pending').length,
        inspections: i.map((ins: { preferredDate: string | Date | null }) => ({ preferred_date: ins.preferredDate ? String(ins.preferredDate) : null }))
    };
    return stats;
}



export async function registerUser(email: string, password: string, name: string) {
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) return { error: 'Email already in use' };

    const userId = uuidv4();

    try {
        await db.insert(users).values({
            id: userId,
            email,
        });

        await db.insert(profiles).values({
            id: userId,
            fullName: name,
            role: 'customer'
        });

        return { error: null };
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}
