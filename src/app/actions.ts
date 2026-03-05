/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { insforge } from '@/lib/insforge';
import { v4 as uuidv4 } from 'uuid';
import { getUserId } from '@/lib/auth-actions';

export async function getQuotes() {
    const userId = await getUserId();
    if (!userId) return [];

    const { data, error } = await insforge.database
        .from('quotes')
        .select()
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((q: any) => ({
        ...q,
        createdAt: q.created_at || '',
        updatedAt: q.updated_at || '',
    }));
}

export async function getProjects() {
    const userId = await getUserId();
    if (!userId) return [];

    const { data, error } = await insforge.database
        .from('projects')
        .select()
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((p: any) => ({
        ...p,
        createdAt: p.created_at || '',
        updatedAt: p.updated_at || '',
    }));
}

export async function getInvoices() {
    const userId = await getUserId();
    if (!userId) return [];

    // InsForge supports JOINs using table syntax
    const { data, error } = await insforge.database
        .from('invoices')
        .select('*, projects(title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((i: any) => ({
        ...i,
        amount: Number(i.amount || 0),
        due_date: i.due_date ? String(i.due_date) : '',
        paid_at: i.paid_at || null,
        status: i.status || 'unpaid',
        notes: i.notes || '',
        project_id: i.project_id || '',
        created_at: i.created_at || '',
        updated_at: i.updated_at || '',
        projects: { title: Array.isArray(i.projects) ? i.projects[0]?.title : i.projects?.title || '' }
    }));
}

export async function getInspections() {
    const userId = await getUserId();
    if (!userId) return [];

    const { data, error } = await insforge.database
        .from('inspections')
        .select()
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((i: any) => ({
        ...i,
        createdAt: i.created_at || '',
        updatedAt: i.updated_at || '',
    }));
}

export async function getMessages() {
    const userId = await getUserId();
    if (!userId) return [];

    const { data, error } = await insforge.database
        .from('messages')
        .select()
        .or(`receiver_id.eq.${userId},sender_id.eq.${userId}`)
        .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((m: any) => ({
        ...m,
        created_at: m.created_at || '',
        sender_id: m.sender_id || '',
        receiver_id: m.receiver_id || ''
    }));
}

export async function sendMessage(content: string) {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const { data: adminData } = await insforge.database
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

    const receiverId = adminData && adminData.length > 0 ? adminData[0].id : '00000000-0000-0000-0000-000000000000';

    await insforge.database.from('messages').insert({
        sender_id: userId,
        receiver_id: receiverId,
        content,
        read: false
    });
}

export async function getDocuments() {
    const userId = await getUserId();
    if (!userId) return [];

    const { data, error } = await insforge.database
        .from('document_shares')
        .select('*, documents(*), projects(title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((d: any) => {
        const doc = Array.isArray(d.documents) ? d.documents[0] : d.documents;
        return {
            ...d,
            created_at: d.created_at || '',
            document_id: d.document_id || '',
            documents: {
                id: doc?.id,
                name: doc?.name,
                url: doc?.url,
                mime_type: doc?.mime_type || 'application/octet-stream',
                size: doc?.size
            },
            projects: {
                title: Array.isArray(d.projects) ? d.projects[0]?.title : d.projects?.title || ''
            }
        };
    });
}

export async function updatePassword(newPassword: string) {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const { error } = await (insforge.auth as any).updateUser({ password: newPassword });
    if (error) throw error;
}

export async function getSharedPhotos() {
    const userId = await getUserId();
    if (!userId) return [];

    const { data, error } = await insforge.database
        .from('document_shares')
        .select('*, documents(*)')
        .eq('user_id', userId);

    if (error) throw error;

    const formattedData = (data || []).map((d: any) => {
        const doc = Array.isArray(d.documents) ? d.documents[0] : d.documents;
        return {
            id: d.id,
            documents: {
                id: doc?.id,
                name: doc?.name,
                url: doc?.url,
                mimeType: doc?.mime_type,
            }
        };
    });

    return formattedData.filter(d => d.documents.mimeType?.startsWith('image/'));
}

export async function getProfile() {
    const userId = await getUserId();
    if (!userId) return null;

    const { data, error } = await insforge.database
        .from('profiles')
        .select()
        .eq('id', userId)
        .maybeSingle(); // maybeSingle instead of single so it returns null if missing

    if (error) throw error;

    return data ? { ...data, fullName: data.full_name, avatarUrl: data.avatar_url } : null;
}

export async function updateProfile(updateData: { fullName?: string | null, phone?: string | null, address?: string | null }) {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    await insforge.database
        .from('profiles')
        .update({
            full_name: updateData.fullName,
            phone: updateData.phone,
            address: updateData.address
        })
        .eq('id', userId);
}

export async function uploadAvatar(formData: FormData) {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided');

    const { data, error } = await insforge.storage
        .from('avatars')
        .upload(`${userId}/${file.name}`, file);

    if (error) throw error;
    if (!data) throw new Error('Upload failed');

    await insforge.database
        .from('profiles')
        .update({ avatar_url: data.url })
        .eq('id', userId);

    return data.url;
}

export async function getAdminProfiles() {
    const { data, error } = await insforge.database
        .from('profiles')
        .select('id, full_name, role');

    if (error) throw error;
    return (data || []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        role: p.role
    }));
}

export async function getAdminCustomers() {
    const { data, error } = await insforge.database
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((p: any) => ({
        id: p.id,
        email: p.email || 'customer@example.com',
        createdAt: p.created_at || '',
        fullName: p.full_name,
        phone: p.phone,
        role: p.role,
        avatarUrl: p.avatar_url
    }));
}

export async function createAdminCustomer(param: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: string;
}) {
    // Note: Creating an auth user typically requires service_role admin API.
    // We mock inserting a profile, but the auth identity won't be fully set.
    const userId = uuidv4();
    const { error } = await insforge.database
        .from('profiles')
        .insert({
            id: userId,
            full_name: param.fullName,
            phone: param.phone || null,
            role: param.role || 'customer'
        });

    if (error) return { error: error.message };
    return { error: null, id: userId };
}

export async function updateCustomerRole(userId: string, role: string) {
    await insforge.database
        .from('profiles')
        .update({ role })
        .eq('id', userId);
}

export async function deleteCustomer(userId: string) {
    await insforge.database
        .from('profiles')
        .delete()
        .eq('id', userId);
}

export async function resetCustomerPassword(targetUserId: string, newPassword: string) {
    const adminId = await getUserId();
    if (!adminId) throw new Error('Not authenticated');

    // To reset another user's password, InsForge requires the service_role key.
    // For now we just return since updating `profiles.password` is legacy.
    console.warn('resetCustomerPassword requires Admin API via service_role key.');
    return;
}

export async function getAdminProjects() {
    const { data, error } = await insforge.database
        .from('projects')
        .select('id, title, user_id');

    if (error) throw error;

    return (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        user_id: p.user_id,
    }));
}

export async function uploadAdminDocument(formData: FormData) {
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const projectId = formData.get('projectId') as string;

    if (!file || !userId) throw new Error('Missing file or user selection');

    const { data: blob, error: uploadError } = await insforge.storage
        .from('documents')
        .upload(`${userId}/${file.name}`, file);

    if (uploadError) throw uploadError;
    if (!blob) throw new Error('Upload failed');

    const currentUserId = await getUserId();
    if (!currentUserId) throw new Error('Not authenticated');

    const { data: docs, error: dbError } = await insforge.database
        .from('documents')
        .insert({
            name: file.name,
            url: blob.url,
            storage_key: blob.key,
            mime_type: file.type,
            size: file.size,
            uploaded_by: currentUserId
        })
        .select();

    if (dbError) throw dbError;
    const doc = (docs as any[])[0];

    await insforge.database
        .from('document_shares')
        .insert({
            document_id: doc.id,
            user_id: userId,
            project_id: projectId || null
        });

    return { success: true };
}

export async function bookInspection(param: {
    address: string;
    property_type: string;
    preferred_date: string;
    description: string;
}) {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const profile = await getProfile();

    await insforge.database.from('inspections').insert({
        user_id: userId,
        name: profile?.fullName || 'Unnamed Customer',
        email: profile?.email || 'customer@example.com',
        address: param.address,
        property_type: param.property_type,
        preferred_date: param.preferred_date,
        description: param.description,
        status: 'pending'
    });

    return { success: true };
}

export async function getDashboardStats() {
    const userId = await getUserId();
    if (!userId) return { activeProjects: 0, completedJobs: 0, pendingQuotes: 0, inspections: [] };

    const { data: p } = await insforge.database.from('projects').select('status').eq('user_id', userId);
    const { data: q } = await insforge.database.from('quotes').select('status').eq('user_id', userId);
    const { data: i } = await insforge.database.from('inspections').select('preferred_date').eq('user_id', userId).order('preferred_date');

    const stats = {
        activeProjects: (p || []).filter((proj: any) => proj.status === 'active').length,
        completedJobs: (p || []).filter((proj: any) => proj.status === 'completed').length,
        pendingQuotes: (q || []).filter((quote: any) => quote.status === 'pending').length,
        inspections: (i || []).map((ins: any) => ({ preferred_date: ins.preferred_date ? String(ins.preferred_date) : null }))
    };
    return stats;
}

export async function registerUser(email: string, password: string, name: string) {
    try {
        const { data, error } = await insforge.auth.signUp({
            email,
            password,
        });
        if (error) return { error: error.message };

        if (data?.user) {
            await insforge.database.from('profiles').insert({
                id: data.user.id,
                full_name: name,
                role: 'customer'
            });
        }
        return { error: null };
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}

export async function getResources() {
    const userId = await getUserId();
    if (!userId) return [];

    const { data: resources } = await insforge.database
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

    return resources || [];
}

export async function createResource(formData: FormData) {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const profile = await getProfile();
    if (profile?.role !== 'admin') throw new Error('Not authorized');

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const driveLink = formData.get('driveLink') as string;

    if (!title) throw new Error('Title is required');

    const { error } = await insforge.database
        .from('resources')
        .insert({
            title,
            description,
            drive_link: driveLink
        });

    if (error) throw error;
    return { success: true };
}

export async function deleteResource(id: string) {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const profile = await getProfile();
    if (profile?.role !== 'admin') throw new Error('Not authorized');

    const { error } = await insforge.database
        .from('resources')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return { success: true };
}

// -------------------------------------------------------------
// NEW ADMIN CRUD FUNCTIONS
// -------------------------------------------------------------

export async function getAdminMessages() {
    const { data, error } = await insforge.database
        .from('messages')
        .select('*, sender:profiles!sender_id(full_name, avatar_url), receiver:profiles!receiver_id(full_name, avatar_url)')
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
}

export async function sendAdminMessage(receiverId: string, content: string) {
    const adminId = await getUserId();
    if (!adminId) throw new Error('Not authenticated');

    // Check if receiverId is a valid UUID, otherwise find a valid admin or user
    // In our live test we explicitly want admins to answer.
    await insforge.database.from('messages').insert({ sender_id: adminId, receiver_id: receiverId, content, read: false });
}

export async function getAdminProjectsAll() {
    const { data, error } = await insforge.database.from('projects').select('*, profiles!user_id(full_name)').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}
export async function createAdminProject(data: any) { await insforge.database.from('projects').insert(data); }
export async function updateAdminProject(id: string, data: any) { await insforge.database.from('projects').update(data).eq('id', id); }
export async function deleteAdminProject(id: string) { await insforge.database.from('projects').delete().eq('id', id); }

export async function getAdminQuotes() {
    const { data, error } = await insforge.database.from('quotes').select('*, profiles!user_id(full_name)').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}
export async function createAdminQuote(data: any) { await insforge.database.from('quotes').insert(data); }
export async function updateAdminQuote(id: string, data: any) { await insforge.database.from('quotes').update(data).eq('id', id); }
export async function deleteAdminQuote(id: string) { await insforge.database.from('quotes').delete().eq('id', id); }

export async function getAdminInvoices() {
    const { data, error } = await insforge.database.from('invoices').select('*, profiles!user_id(full_name), projects(title)').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}
export async function createAdminInvoice(data: any) { await insforge.database.from('invoices').insert(data); }
export async function updateAdminInvoice(id: string, data: any) { await insforge.database.from('invoices').update(data).eq('id', id); }
export async function deleteAdminInvoice(id: string) { await insforge.database.from('invoices').delete().eq('id', id); }

export async function getAdminInspectionsAll() {
    const { data, error } = await insforge.database.from('inspections').select('*, profiles!user_id(full_name)').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}
export async function deleteAdminInspection(id: string) { await insforge.database.from('inspections').delete().eq('id', id); }
export async function updateAdminInspection(id: string, data: any) { await insforge.database.from('inspections').update(data).eq('id', id); }

export async function getGlobalSettings() {
    const { data, error } = await insforge.database.from('portal_settings').select('*').eq('id', 'global').single();
    if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned". If error is something else, throw it.
        throw error;
    }
    return data || { ghl_script: '', analytics_script: '', custom_css: '' };
}

export async function updateGlobalSettings(data: { ghl_script?: string, analytics_script?: string, custom_css?: string }) {
    const adminId = await getUserId();
    if (!adminId) throw new Error('Not authenticated');

    const profile = await getProfile();
    if (profile?.role !== 'admin') throw new Error('Not authorized to update global settings');

    const { error } = await insforge.database
        .from('portal_settings')
        .upsert({ id: 'global', ...data, updated_at: new Date().toISOString() });

    if (error) throw error;
    return { success: true };
}

