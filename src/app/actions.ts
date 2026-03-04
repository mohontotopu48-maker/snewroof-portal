'use server';

import { insforge } from '@/lib/insforge';
import { v4 as uuidv4 } from 'uuid';

const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000001';
const DUMMY_USER_EMAIL = 'customer@example.com';

export async function getQuotes() {
    const { data, error } = await insforge.database
        .from('quotes')
        .select()
        .eq('user_id', DUMMY_USER_ID)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((q: any) => ({
        ...q,
        createdAt: q.created_at || '',
        updatedAt: q.updated_at || '',
    }));
}

export async function getProjects() {
    const { data, error } = await insforge.database
        .from('projects')
        .select()
        .eq('user_id', DUMMY_USER_ID)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((p: any) => ({
        ...p,
        createdAt: p.created_at || '',
        updatedAt: p.updated_at || '',
    }));
}

export async function getInvoices() {
    // InsForge supports JOINs using table syntax
    const { data, error } = await insforge.database
        .from('invoices')
        .select('*, projects(title)')
        .eq('user_id', DUMMY_USER_ID)
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
    const { data, error } = await insforge.database
        .from('inspections')
        .select()
        .eq('user_id', DUMMY_USER_ID)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((i: any) => ({
        ...i,
        createdAt: i.created_at || '',
        updatedAt: i.updated_at || '',
    }));
}

export async function getMessages() {
    const { data, error } = await insforge.database
        .from('messages')
        .select()
        .or(`receiver_id.eq.${DUMMY_USER_ID},sender_id.eq.${DUMMY_USER_ID}`)
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
    const { data: adminData } = await insforge.database
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

    const receiverId = adminData && adminData.length > 0 ? adminData[0].id : '00000000-0000-0000-0000-000000000000';

    await insforge.database.from('messages').insert({
        sender_id: DUMMY_USER_ID,
        receiver_id: receiverId,
        content,
        read: false
    });
}

export async function getDocuments() {
    const { data, error } = await insforge.database
        .from('document_shares')
        .select('*, documents(*), projects(title)')
        .eq('user_id', DUMMY_USER_ID)
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

export async function updatePassword(_newPassword: string) {
    console.log("Password update requested for dummy user, ignoring.");
    return;
}

export async function getSharedPhotos() {
    const { data, error } = await insforge.database
        .from('document_shares')
        .select('*, documents(*)')
        .eq('user_id', DUMMY_USER_ID);

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
    const { data, error } = await insforge.database
        .from('profiles')
        .select()
        .eq('id', DUMMY_USER_ID)
        .maybeSingle(); // maybeSingle instead of single so it returns null if missing

    if (error) throw error;

    return data ? { ...data, fullName: data.full_name, avatarUrl: data.avatar_url } : null;
}

export async function updateProfile(updateData: { fullName?: string | null, phone?: string | null, address?: string | null }) {
    await insforge.database
        .from('profiles')
        .update({
            full_name: updateData.fullName,
            phone: updateData.phone,
            address: updateData.address
        })
        .eq('id', DUMMY_USER_ID);
}

export async function uploadAvatar(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided');

    const { data, error } = await insforge.storage
        .from('avatars')
        .upload(`${DUMMY_USER_ID}/${file.name}`, file);

    if (error) throw error;
    if (!data) throw new Error('Upload failed');

    await insforge.database
        .from('profiles')
        .update({ avatar_url: data.url })
        .eq('id', DUMMY_USER_ID);

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
        email: 'customer@example.com',
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

export async function resetCustomerPassword(_userId: string, _newPassword: string) {
    console.log("Password reset requested for dummy user, ignoring.");
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

    const { data: docs, error: dbError } = await insforge.database
        .from('documents')
        .insert({
            name: file.name,
            url: blob.url,
            storage_key: blob.key,
            mime_type: file.type,
            size: file.size,
            uploaded_by: DUMMY_USER_ID
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
    const profile = await getProfile();

    await insforge.database.from('inspections').insert({
        user_id: DUMMY_USER_ID,
        name: profile?.fullName || 'Unnamed Customer',
        email: DUMMY_USER_EMAIL,
        address: param.address,
        property_type: param.property_type,
        preferred_date: param.preferred_date,
        description: param.description,
        status: 'pending'
    });

    return { success: true };
}

export async function getDashboardStats() {
    const { data: p } = await insforge.database.from('projects').select('status').eq('user_id', DUMMY_USER_ID);
    const { data: q } = await insforge.database.from('quotes').select('status').eq('user_id', DUMMY_USER_ID);
    const { data: i } = await insforge.database.from('inspections').select('preferred_date').eq('user_id', DUMMY_USER_ID).order('preferred_date');

    const stats = {
        activeProjects: (p || []).filter((proj: any) => proj.status === 'active').length,
        completedJobs: (p || []).filter((proj: any) => proj.status === 'completed').length,
        pendingQuotes: (q || []).filter((quote: any) => quote.status === 'pending').length,
        inspections: (i || []).map((ins: any) => ({ preferred_date: ins.preferred_date ? String(ins.preferred_date) : null }))
    };
    return stats;
}

export async function registerUser(email: string, password: string, name: string) {
    const userId = uuidv4();
    try {
        const { error } = await insforge.database.from('profiles').insert({
            id: userId,
            full_name: name,
            role: 'customer'
        });
        if (error) return { error: error.message };
        return { error: null };
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}
