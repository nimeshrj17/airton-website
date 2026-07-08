import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://alvwqkqsokaiarrmweht.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const { orderId, reference } = body;

    if (!orderId || !reference) {
        return res.status(400).json({ error: 'Missing orderId or reference' });
    }

    try {
        // Fetch current order to get order_data
        const { data: orderDataRes, error: fetchError } = await supabase
            .from('orders')
            .select('order_data')
            .eq('id', orderId)
            .single();
            
        if (fetchError) throw fetchError;
        
        let orderData = orderDataRes.order_data || {};
        orderData.bank_reference = reference;

        const { data, error } = await supabase
            .from('orders')
            .update({ order_data: orderData })
            .eq('id', orderId)
            .select();
            
        if (error) throw error;

        res.status(200).json({ success: true, orderId: data[0].id });
    } catch (err) {
        console.error('Update Reference API Error:', err);
        res.status(500).json({ error: err.message });
    }
}
