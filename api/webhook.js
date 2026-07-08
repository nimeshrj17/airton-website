const { createClient } = require('@supabase/supabase-js');
const { buffer } = require('micro');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const supabaseUrl = process.env.SUPABASE_URL || 'https://alvwqkqsokaiarrmweht.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY; // or service_role key if RLS blocks updates
const supabase = createClient(supabaseUrl, supabaseKey);

// Vercel config to not parse body automatically (needed for Stripe webhook validation)
export const config = {
    api: {
        bodyParser: false,
    },
};

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        const reqBuffer = await buffer(req);
        event = stripe.webhooks.constructEvent(reqBuffer, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
        const session = event.data.object;
        
        // For bank transfers, checkout.session.completed means the customer agreed to pay, but funds are unpaid.
        // We only want to send the email and update status when payment_status is 'paid'
        if (session.payment_status === 'paid') {
            const orderId = session.client_reference_id;
            
            if (orderId) {
                // Update order status in Supabase
                const { error } = await supabase
                    .from('orders')
                    .update({ status: 'paid' })
                    .eq('id', orderId);

                if (error) {
                    console.error('Failed to update Supabase order:', error);
                }

                // Fetch order details for the email
                const { data: orderData } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (orderData && process.env.SMTP_HOST) {
                    try {
                        const transporter = nodemailer.createTransport({
                            host: process.env.SMTP_HOST,
                            port: process.env.SMTP_PORT || 587,
                            secure: process.env.SMTP_SECURE === 'true',
                            auth: {
                                user: process.env.SMTP_USER,
                                pass: process.env.SMTP_PASS,
                            },
                        });

                        const mailOptions = {
                            from: '"Airton Shop" <service-client@airton-shop.eu>',
                            to: orderData.email,
                            subject: 'Confirmation de votre commande Airton',
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h2>Merci pour votre commande, ${orderData.first_name || 'Client'}!</h2>
                                    <p>Votre paiement a été validé avec succès. Nous préparons votre commande pour l'expédition.</p>
                                    <p><strong>Montant total:</strong> ${Number(orderData.total_amount).toFixed(2).replace('.', ',')} €</p>
                                    <hr />
                                    <p>Pour toute question, contactez-nous à <a href="mailto:service-client@airton-shop.eu">service-client@airton-shop.eu</a>.</p>
                                </div>
                            `
                        };

                        await transporter.sendMail(mailOptions);
                        console.log('Confirmation email sent to', orderData.email);
                    } catch (emailErr) {
                        console.error('Failed to send email:', emailErr);
                    }
                }
            }
        }
    }

    res.json({ received: true });
};
