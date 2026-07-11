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
                        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #faebd7 0%, #e0f7fa 100%); padding: 40px 20px; color: #111;">
                            <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                                
                                <!-- Logo -->
                                <img src="https://airton.shop/cdn/shop/files/Logo_Airton_2025_Noir_2.svg" alt="Airton" style="height: 35px; margin-bottom: 20px;">
                                
                                <!-- Header -->
                                <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Votre commande est confirmée !</h2>
                                <p style="font-size: 13px; color: #555; margin-bottom: 30px; line-height: 1.5;">
                                    Si vous constatez une erreur dans votre commande,<br>
                                    contactez nous à l'adresse : <a href="mailto:service-client@airton-shop.eu" style="color: #016FD0; text-decoration: none;">service-client@airton-shop.eu</a>
                                </p>
                                
                                <h3 style="font-size: 18px; margin-bottom: 5px;">Détail de votre commande.</h3>
                                <p style="font-size: 16px; margin-bottom: 25px; font-weight: bold;">Commande <span style="color: #016FD0;">#${orderData.id}</span>.</p>
                                
                                <!-- Order Items Card -->
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 25px; margin-bottom: 30px; text-align: left; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                                    ${orderData.items ? orderData.items.map(item => `
                                    <div style="display: table; width: 100%; margin-bottom: 15px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px;">
                                        <div style="display: table-cell; vertical-align: middle; width: 60px;">
                                            ${(item.image_url || item.image) ? `<img src="${item.image_url || item.image}" width="50" height="50" style="border-radius: 4px; object-fit: cover; border: 1px solid #eaeaea;" />` : `<div style="width: 50px; height: 50px; background: #f8f9fa; border: 1px solid #eaeaea; border-radius: 4px;"></div>`}
                                        </div>
                                        <div style="display: table-cell; vertical-align: middle; padding-left: 15px; font-size: 13px;">
                                            ${item.title || item.name}
                                        </div>
                                        <div style="display: table-cell; vertical-align: middle; text-align: right; font-size: 13px; color: #777; width: 40px;">
                                            x${item.quantity}
                                        </div>
                                        <div style="display: table-cell; vertical-align: middle; text-align: right; font-size: 13px; font-weight: 500; width: 80px;">
                                            ${Number(item.price).toFixed(2).replace('.', ',')}€
                                        </div>
                                    </div>
                                    `).join('') : '<p>Articles non disponibles</p>'}
                                    
                                    <div style="display: table; width: 100%; padding-top: 10px;">
                                        <div style="display: table-cell; vertical-align: middle; font-size: 13px; color: #555;">Code promo :</div>
                                        <div style="display: table-cell; vertical-align: middle; text-align: right; font-size: 20px; font-weight: bold;">
                                            ${Number(orderData.total_amount).toFixed(2).replace('.', ',')}€
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Action Button -->
                                <a href="mailto:service-client@airton-shop.eu?subject=Demande%20de%20facture%20pour%20la%20commande%20%23${orderData.id}" style="display: inline-block; background-color: #2b8cff; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 30px; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
                                    Demander ma facture
                                </a>
                                
                                <!-- Dashed separator -->
                                <div style="height: 30px; border-left: 1px dashed #999; width: 1px; margin: 0 auto 20px auto;"></div>
                                
                                <!-- Addresses -->
                                <div style="display: table; width: 100%; margin-bottom: 30px;">
                                    <div style="display: table-cell; width: 48%; background: #ffffff; border-radius: 8px; padding: 20px; text-align: left; vertical-align: top; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                                        <h4 style="margin: 0 0 10px 0; font-size: 14px;">Adresse de facturation</h4>
                                        <p style="margin: 0; font-size: 12px; color: #555; line-height: 1.5;">
                                            ${orderData.first_name || ''} ${orderData.last_name || ''}<br>
                                            ${orderData.order_data?.phone || ''}<br>
                                            <a href="mailto:${orderData.email}" style="color: #016FD0; text-decoration: none;">${orderData.email}</a><br>
                                            ${orderData.order_data?.city || ''}, ${orderData.order_data?.country || ''}<br>
                                            ${orderData.order_data?.zipcode || ''}, ${orderData.order_data?.city || ''}
                                        </p>
                                    </div>
                                    <div style="display: table-cell; width: 4%;"></div>
                                    <div style="display: table-cell; width: 48%; background: #ffffff; border-radius: 8px; padding: 20px; text-align: left; vertical-align: top; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                                        <h4 style="margin: 0 0 10px 0; font-size: 14px;">Adresse de livraison</h4>
                                        <p style="margin: 0; font-size: 12px; color: #555; line-height: 1.5;">
                                            ${orderData.first_name || ''} ${orderData.last_name || ''}<br>
                                            ${orderData.order_data?.phone || ''}<br>
                                            <a href="mailto:${orderData.email}" style="color: #016FD0; text-decoration: none;">${orderData.email}</a><br>
                                            ${orderData.order_data?.city || ''}, ${orderData.order_data?.country || ''}<br>
                                            ${orderData.order_data?.zipcode || ''}, ${orderData.order_data?.city || ''}
                                        </p>
                                    </div>
                                </div>
                                
                                
                                ${orderData.order_data?.payment_method === 'card' ? `
                                <!-- Card Payment Steps -->
                                <h3 style="font-size: 16px; color: #28a745; margin-bottom: 20px;">Paiement par carte bancaire validé.</h3>
                                <div style="background: #ffffff; border-radius: 8px; display: table; width: 100%; padding: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                                    <div style="display: table-cell; text-align: center; vertical-align: middle; padding: 0 10px;">
                                        <p style="margin: 0; font-size: 13px; font-weight: bold; color: #555;">Votre commande a été réglée avec succès par carte bancaire.</p>
                                    </div>
                                </div>
                                ` : ''}
${(orderData.order_data?.payment_method === 'bank_transfer' || orderData.order_data?.payment_method === 'bank') ? `
                                <!-- Bank Transfer Steps -->
                                <h3 style="font-size: 16px; color: #016FD0; margin-bottom: 20px;">Si vous payez par virement bancaire.</h3>
                                <div style="background: #ffffff; border-radius: 8px; display: table; width: 100%; padding: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                                    
                                    <div style="display: table-cell; width: 50%; text-align: center; border-right: 1px solid #e0e0e0; vertical-align: middle; padding: 0 10px;">
                                        <p style="margin: 0; font-size: 11px; font-weight: bold;">Faire le virement<br>avec la référence <span style="color: #016FD0;">${orderData.order_data?.bank_reference || orderData.id}</span></p>
                                    </div>
                                    <div style="display: table-cell; width: 50%; text-align: center; vertical-align: middle; padding: 0 10px;">
                                        <p style="margin: 0; font-size: 11px; font-weight: bold;">Envoyer le justificatif<br>à <a href="mailto:service-client@airton-shop.eu" style="color: #016FD0; text-decoration: none;">service-client@airton-shop.eu</a></p>
                                    </div>
                                </div>
                                ` : ''}
                                
                            </div>
                        </div>
                    `
                        };

                        await transporter.sendMail(mailOptions);
                        console.log('Confirmation email sent to', orderData.email);
                        
                        try {
                            const itemsList = orderData.items ? orderData.items.map(i => `${i.quantity}x ${i.name || i.title}`).join('\\n') : 'Articles non spécifiés';
                            const adminMailOptions = {
                                from: '"Airton Shop" <service-client@airton-shop.eu>',
                                to: 'service-client@airton-shop.eu',
                                subject: 'Nouvelle Commande (Carte) - #' + orderData.id,
                                text: \`Nouvelle commande passée par \${orderData.first_name} \${orderData.last_name} (\${orderData.email}).

Montant total: \${orderData.total_amount} €
Méthode: Carte Bancaire (Stripe)

Produits:
\${itemsList}

Détails de livraison:
Adresse: \${orderData.order_data?.address}
Ville: \${orderData.order_data?.city}
Code Postal: \${orderData.order_data?.zipcode}
Pays: \${orderData.order_data?.country}
Tel: \${orderData.order_data?.phone}

Connectez-vous à l'administration pour voir les détails complets.\`
                            };
                            await transporter.sendMail(adminMailOptions);
                        } catch (errAdmin) {
                            console.error('Error sending admin email:', errAdmin);
                        }
                    } catch (emailErr) {
                        console.error('Failed to send email:', emailErr);
                    }
                }
            }
        }
    }

    res.json({ received: true });
};
