// InsForge Edge Function: notify-share
// Fires when a document is shared — validates and returns confirmation

module.exports = async function (request) {
    try {
        const { document_id, user_id, shared_by } = await request.json();

        if (!document_id || !user_id) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing document_id or user_id' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // The DB trigger handles notification insertion automatically.
        // This function logs the event and returns a success response.
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
