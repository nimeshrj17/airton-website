const { createClient } = require('@supabase/supabase-js');
let stripe;
try {
    if (process.env.STRIPE_SECRET_KEY) {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    }
} catch (e) {
    console.error('Failed to initialize Stripe:', e);
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://alvwqkqsokaiarrmweht.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdndxa3Fzb2thaWFycm13ZWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzOTcyNjQsImV4cCI6MjA5ODk3MzI2NH0.fR2O_DvLGcDxUC3Ld4DrRafKJH4kEJhCUScswKaUKfA';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    // Enable CORS if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { items } = req.body; // Array of { id, quantity }

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        if (!process.env.STRIPE_SECRET_KEY || !stripe) {
            return res.status(500).json({ error: 'La configuration Stripe est manquante sur le serveur. Veuillez ajouter STRIPE_SECRET_KEY dans les variables d\'environnement Vercel.' });
        }

        const lineItems = [];

        // Verify prices with Supabase
        for (const item of items) {
            // Fetch product from DB by ID or slug
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', item.id)
                .single();

            if (error || !product) {
                console.error(`Product ${item.id} not found in DB`);
                continue;
            }

            // Use the discounted price if available, otherwise regular price
            const activePrice = product.discount_price || product.price;

            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: product.name,
                        images: [product.image_url],
                    },
                    unit_amount: Math.round(activePrice * 100), // Stripe expects amounts in cents
                },
                quantity: item.quantity,
            });
        }

        if (lineItems.length === 0) {
            return res.status(400).json({ error: 'No valid items found' });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            // Hardcoding URLs relative to the request for success/cancel
            success_url: `https://${req.headers.host || 'airton.shop'}/airton.shop/checkout-success.html`,
            cancel_url: `https://${req.headers.host || 'airton.shop'}/airton.shop/cart.html`,
            shipping_address_collection: {
                allowed_countries: ['FR', 'BE', 'CH', 'ES', 'IT'],
            }
        });

        res.status(200).json({ url: session.url });
    } catch (err) {
        console.error('Stripe error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
