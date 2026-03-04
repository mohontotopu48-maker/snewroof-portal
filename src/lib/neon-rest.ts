/**
 * Neon PostgREST API Client
 *
 * Uses the Neon REST API endpoint for simple table queries.
 * The base URL is: https://ep-spring-mountain-aivzoc24.apirest.c-4.us-east-1.aws.neon.tech/neondb/rest/v1
 *
 * PostgREST API reference: https://postgrest.org/en/stable/references/api/tables_views.html
 *
 * Authentication: the DB password is sent as the Bearer token.
 */

const NEON_REST_URL = process.env.NEON_REST_URL;
const PGPASSWORD = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD;

if (!NEON_REST_URL) {
    console.warn('[neon-rest] NEON_REST_URL env var is not set.');
}

type RequestOptions = {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    /** PostgREST query params e.g. { select: 'id,email', order: 'created_at.desc' } */
    params?: Record<string, string>;
};

/**
 * Low-level fetch wrapper for the Neon REST (PostgREST) API.
 */
export async function neonRestFetch<T = unknown>(
    table: string,
    options: RequestOptions = {}
): Promise<T> {
    if (!NEON_REST_URL) throw new Error('NEON_REST_URL is not configured.');

    const { method = 'GET', headers = {}, body, params = {} } = options;

    const url = new URL(`${NEON_REST_URL}/${table}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString(), {
        method,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            // PostgREST on Neon uses Basic auth: user=neondb_owner, pass=PGPASSWORD
            Authorization: `Basic ${Buffer.from(`neondb_owner:${PGPASSWORD}`).toString('base64')}`,
            // Return a single object when selecting (Prefer: return=representation)
            Prefer: 'return=representation',
            ...headers,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Neon REST ${method} /${table} failed (${res.status}): ${text}`);
    }

    // DELETE with no body returns 204
    if (res.status === 204) return [] as unknown as T;
    return res.json() as Promise<T>;
}

/**
 * SELECT rows from a table.
 * @example neonRestSelect('profiles', { select: 'id,full_name,role', 'role': 'eq.admin' })
 */
export async function neonRestSelect<T = Record<string, unknown>>(
    table: string,
    params?: Record<string, string>
): Promise<T[]> {
    return neonRestFetch<T[]>(table, { params });
}

/**
 * INSERT a row. Returns the inserted row(s).
 */
export async function neonRestInsert<T = Record<string, unknown>>(
    table: string,
    data: Record<string, unknown> | Record<string, unknown>[]
): Promise<T[]> {
    return neonRestFetch<T[]>(table, { method: 'POST', body: data });
}

/**
 * UPDATE rows matching filter params.
 * @example neonRestUpdate('profiles', { 'id': `eq.${userId}` }, { role: 'admin' })
 */
export async function neonRestUpdate<T = Record<string, unknown>>(
    table: string,
    filter: Record<string, string>,
    data: Record<string, unknown>
): Promise<T[]> {
    return neonRestFetch<T[]>(table, { method: 'PATCH', params: filter, body: data });
}

/**
 * DELETE rows matching filter params.
 * @example neonRestDelete('messages', { 'id': `eq.${msgId}` })
 */
export async function neonRestDelete(
    table: string,
    filter: Record<string, string>
): Promise<void> {
    await neonRestFetch(table, { method: 'DELETE', params: filter });
}
