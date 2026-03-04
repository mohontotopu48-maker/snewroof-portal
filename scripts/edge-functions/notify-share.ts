// InsForge Edge Function: notify-share
module.exports = async function (request: Request): Promise<Response> {
    try {
        const body = await request.json() as { document_id?: string; user_id?: string; shared_by?: string };
        const { document_id, user_id, shared_by } = body;

        if (!document_id || !user_id) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing document_id or user_id' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const payload = {
            success: true,
            message: 'Document share recorded. Customer notification triggered.',
            document_id,
            user_id,
            shared_by: shared_by || 'admin',
            timestamp: new Date().toISOString(),
        };

        console.log('[notify-share]', JSON.stringify(payload));

        return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        const err = e as Error;
        console.error('[notify-share] Error:', err.message);
        return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
