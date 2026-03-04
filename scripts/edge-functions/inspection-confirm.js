// InsForge Edge Function: inspection-confirm
// Fires when a new inspection is submitted — validates and confirms

module.exports = async function (request) {
    try {
        const { user_id, address, preferred_date, inspection_id } = await request.json();

        if (!user_id || !address) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing user_id or address' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // The DB trigger handles notification insertion automatically.
        // This function returns a confirmation payload.
        const payload = {
            success: true,
            message: 'Inspection request confirmed. Customer notification triggered.',
            inspection_id: inspection_id || null,
            user_id,
            address,
            preferred_date: preferred_date || null,
            estimated_response: '1-2 business days',
            timestamp: new Date().toISOString(),
        };

        console.log('[inspection-confirm]', JSON.stringify(payload));

        return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        const err = e as Error;
        console.error('[inspection-confirm] Error:', err.message);
        return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
