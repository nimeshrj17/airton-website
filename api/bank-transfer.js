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

    const { items, orderData } = body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    try {
        let subtotal = 0;
        for (const item of items) {
            subtotal += item.price * item.quantity;
        }

        const totalAmount = subtotal;

        // Update existing order or create new
        let data, error;
        
        const orderDataToSave = {
            email: orderData.email,
            first_name: orderData.firstName,
            last_name: orderData.lastName,
            total_amount: totalAmount,
            status: 'pending',
            order_data: orderData,
            items: items
        };

        if (body.orderId) {
            const res = await supabase
                .from('orders')
                .update(orderDataToSave)
                .eq('id', body.orderId)
                .select();
            data = res.data;
            error = res.error;
        } else {
            const res = await supabase
                .from('orders')
                .insert([orderDataToSave])
                .select();
            data = res.data;
            error = res.error;
        }
            
        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: 'Erreur lors de la création de la commande' });
        }

        res.status(200).json({ success: true, orderId: data[0].id });
    } catch (err) {
        console.error('Bank Transfer API Error:', err);
        res.status(500).json({ error: err.message });
    }
}
