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

    let orderId = null;
    let isPaid = false;

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
        const session = event.data.object;
        if (session.payment_status === 'paid') {
            orderId = session.client_reference_id;
            isPaid = true;
        }
    } else if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        orderId = paymentIntent.metadata ? paymentIntent.metadata.orderId : null;
        isPaid = true;
    }

    if (isPaid && orderId) {
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
                                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                                    <!-- Header -->
                                    <div style="background-color: #016FD0; padding: 30px; text-align: center;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">MERCI POUR VOTRE COMMANDE !</h1>
                                    </div>
                                    
                                    <!-- Body -->
                                    <div style="padding: 40px 30px; color: #333333;">
                                        <h2 style="font-size: 20px; color: #016FD0; margin-top: 0;">Bonjour ${orderData.first_name || 'Client'},</h2>
                                        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                                            Nous sommes ravis de vous confirmer que votre paiement a été validé avec succès. Notre équipe prépare actuellement votre commande pour l'expédition avec le plus grand soin.
                                        </p>
                                        
                                        <!-- Order Details Box -->
                                        <div style="background-color: #f8f9fa; border-left: 4px solid #016FD0; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                                            <h3 style="margin-top: 0; font-size: 16px; color: #333333;">Détails de la commande (#${orderData.id})</h3>
                                            <table style="width: 100%; border-collapse: collapse;">
                                                <tr>
                                                    <td style="padding: 8px 0; color: #555555; border-bottom: 1px solid #eeeeee;"><strong>Date :</strong></td>
                                                    <td style="padding: 8px 0; text-align: right; color: #333333; border-bottom: 1px solid #eeeeee;">${new Date(orderData.created_at).toLocaleDateString('fr-FR')}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0; color: #555555;"><strong>Montant Total :</strong></td>
                                                    <td style="padding: 8px 0; text-align: right; font-size: 18px; font-weight: bold; color: #016FD0;">${Number(orderData.total_amount).toFixed(2).replace('.', ',')} €</td>
                                                </tr>
                                            </table>
                                        </div>
                                        
                                        <p style="font-size: 16px; line-height: 1.5;">
                                            Vous recevrez un nouvel e-mail avec les informations de suivi dès que votre colis quittera notre entrepôt.
                                        </p>
                                    </div>
                                    
                                    <!-- Footer -->
                                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #888888; font-size: 14px;">
                                        <p style="margin: 0 0 10px 0;">Besoin d'aide ? N'hésitez pas à nous contacter.</p>
                                        <a href="mailto:service-client@airton-shop.eu" style="color: #016FD0; text-decoration: none; font-weight: bold;">service-client@airton-shop.eu</a>
                                        <p style="margin: 15px 0 0 0; font-size: 12px;">© ${new Date().getFullYear()} Airton. Tous droits réservés.</p>
                                    </div>
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
