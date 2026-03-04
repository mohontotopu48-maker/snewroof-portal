'use server';

import { db } from '@/lib/db';
import { quotes, projects, invoices, inspections, messages, documentShares, documents, profiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/auth';

export async function getQuotes() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const data = await db.select().from(quotes)
        .where(eq(quotes.userId, session.user.id))
        .orderBy(desc(quotes.createdAt));

    // Convert Date objects to ISO strings for client components
    return data.map(q => ({
        ...q,
        createdAt: q.createdAt?.toISOString() || '',
        updatedAt: q.updatedAt?.toISOString() || '',
    }));
}

export async function getProjects() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const data = await db.select().from(projects)
        .where(eq(projects.userId, session.user.id))
        .orderBy(desc(projects.createdAt));

    return data.map(p => ({
        ...p,
        createdAt: p.createdAt?.toISOString() || '',
        updatedAt: p.updatedAt?.toISOString() || '',
    }));
}

export async function getInvoices() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

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
        .where(eq(invoices.userId, session.user.id))
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
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const data = await db.select().from(inspections)
        .where(eq(inspections.userId, session.user.id))
        .orderBy(desc(inspections.createdAt));

    return data.map(i => ({
        ...i,
        createdAt: i.createdAt?.toISOString() || '',
        updatedAt: i.updatedAt?.toISOString() || '',
    }));
}

export async function getMessages() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // Fetch conversation where user is either sender or receiver
    const { or } = require('drizzle-orm');
    const data = await db.select().from(messages)
        .where(
            or(
                eq(messages.receiverId, session.user.id),
                eq(messages.senderId, session.user.id)
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
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // Find an admin to receive the message (fallback as in original code)
    const adminData = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.role, 'admin')).limit(1);
    const receiverId = adminData[0]?.id || '00000000-0000-0000-0000-000000000000';

    await db.insert(messages).values({
        senderId: session.user.id,
        receiverId,
        content,
        read: false
    });
}

export async function getDocuments() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

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
        .where(eq(documentShares.userId, session.user.id))
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
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ passwordHash: hashedPassword }).where(eq(users.id, session.user.id));
}

export async function getSharedPhotos() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

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
        .where(eq(documentShares.userId, session.user.id));

    // Filter only images (as per original logic)
    return data.filter(d => d.documents.mimeType?.startsWith('image/'));
}

import { put } from '@vercel/blob';

export async function getProfile() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const data = await db.select().from(profiles).where(eq(profiles.id, session.user.id)).limit(1);
    return data[0] || null;
}

export async function updateProfile(updateData: { full_name?: string | null, phone?: string | null, address?: string | null }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    await db.update(profiles)
        .set(updateData)
        .where(eq(profiles.id, session.user.id));
}

export async function uploadAvatar(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided');

    const blob = await put(`avatars/${session.user.id}/${file.name}`, file, {
        access: 'public',
    });

    await db.update(profiles).set({ avatarUrl: blob.url }).where(eq(profiles.id, session.user.id));
    return blob.url;
}

export async function getAdminProfiles() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // In a real app, check if user is admin
    const data = await db.select({
        id: profiles.id,
        full_name: profiles.fullName,
        role: profiles.role
    }).from(profiles);

    return data;
}

export async function getAdminProjects() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const data = await db.select({
        id: projects.id,
        title: projects.title,
        user_id: projects.userId
    }).from(projects);

    return data;
}

export async function uploadAdminDocument(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

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
        uploadedBy: session.user.id
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
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const profile = await getProfile();

    await db.insert(inspections).values({
        userId: session.user.id,
        name: profile?.fullName || 'Unnamed Customer',
        email: session.user.email || '',
        address: data.address,
        propertyType: data.property_type,
        preferredDate: data.preferred_date,
        description: data.description,
        status: 'pending'
    });

    return { success: true };
}

export async function getDashboardStats() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const [p, q, i] = await Promise.all([
        db.select({ status: projects.status }).from(projects).where(eq(projects.userId, session.user.id)),
        db.select({ status: quotes.status }).from(quotes).where(eq(quotes.userId, session.user.id)),
        db.select({ preferredDate: inspections.preferredDate }).from(inspections).where(eq(inspections.userId, session.user.id)).orderBy(inspections.preferredDate)
    ]);

    const stats = {
        activeProjects: p.filter((proj: { status: string | null }) => proj.status === 'active').length,
        completedJobs: p.filter((proj: { status: string | null }) => proj.status === 'completed').length,
        pendingQuotes: q.filter((quote: { status: string | null }) => quote.status === 'pending').length,
        inspections: i.map((ins: { preferredDate: string | Date | null }) => ({ preferred_date: ins.preferredDate ? String(ins.preferredDate) : null }))
    };
    return stats;
}

import bcrypt from 'bcryptjs';
import { users } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';

export async function registerUser(email: string, password: string, name: string) {
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) return { error: 'Email already in use' };

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    try {
        await db.insert(users).values({
            id: userId,
            email,
            passwordHash: hashedPassword,
        });

        await db.insert(profiles).values({
            id: userId,
            fullName: name,
            role: 'customer'
        });

        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
}
