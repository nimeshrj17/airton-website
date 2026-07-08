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
        let subtotal = 0;

        // Use the prices directly from the cart (required for dynamically configured products)
        for (const item of items) {
            subtotal += (item.price * item.quantity);
            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.name,
                        images: item.image_url ? [item.image_url] : [],
                    },
                    unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
                },
                quantity: item.quantity,
            });
        }

        const taxAmount = subtotal * 0.166;
        lineItems.push({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: 'Taxes (16.6%)',
                },
                unit_amount: Math.round(taxAmount * 100),
            },
            quantity: 1,
        });

        if (lineItems.length <= 1) { // Only tax item means no valid products
            return res.status(400).json({ error: 'No valid items found' });
        }

        // A customer is REQUIRED by Stripe when using customer_balance (Bank Transfers)
        const customer = await stripe.customers.create();

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            line_items: lineItems,
            mode: 'payment',
            // Hardcoding URLs relative to the request for success/cancel
            success_url: `https://${req.headers.host || 'airton.shop'}/airton.shop/checkout-success.html`,
            cancel_url: `https://${req.headers.host || 'airton.shop'}/airton.shop/cart.html`,
            shipping_address_collection: {
                allowed_countries: ['FR', 'MC', 'BE', 'LU', 'CH'],
            }
        });

        res.status(200).json({ url: session.url });
    } catch (err) {
        console.error('Stripe error:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
};
