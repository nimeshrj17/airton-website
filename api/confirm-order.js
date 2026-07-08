const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const supabaseUrl = process.env.SUPABASE_URL || 'https://alvwqkqsokaiarrmweht.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ error: 'Order ID required' });
    }

    try {
        // 1. Update order status in Supabase
        const { error } = await supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', orderId);

        if (error) {
            console.error('Failed to update order:', error);
            return res.status(500).json({ error: 'Failed to update order in database' });
        }

        // 2. Fetch order details for the email
        const { data: orderData } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        let emailSent = false;

        // 3. Send email if SMTP is configured
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
                emailSent = true;
                console.log('Manual confirmation email sent to', orderData.email);
            } catch (emailErr) {
                console.error('Failed to send email:', emailErr);
                return res.status(500).json({ error: 'Order updated, but failed to send email. Check SMTP settings.' });
            }
        }

        return res.status(200).json({ success: true, emailSent });
    } catch (err) {
        console.error('Confirmation error:', err);
        return res.status(500).json({ error: err.message });
    }
};
