import { createClient } from '@supabase/supabase-js';
const nodemailer = require('nodemailer');

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
            .select('*')
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

        
        // Send email to customer
        if (orderDataRes && orderDataRes.email && process.env.SMTP_HOST) {
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
                    to: orderDataRes.email,
                    subject: 'Votre commande est en attente de confirmation',
                    html: `
                        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #faebd7 0%, #e0f7fa 100%); padding: 40px 20px; color: #111;">
                            <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                                
                                <!-- Logo -->
                                <img src="https://airton.shop/cdn/shop/files/Logo_Airton_2025_Noir_2.svg" alt="Airton" style="height: 35px; margin-bottom: 20px;">
                                
                                <!-- Header -->
                                <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Votre commande est en attente de confirmation</h2>
                                <p style="font-size: 14px; color: #555; margin-bottom: 30px; line-height: 1.5;">
                                    Pour toute question, notre support client est à votre écoute : <br><a href="mailto:service-client@airton-shop.eu" style="color: #016FD0; text-decoration: none;">service-client@airton-shop.eu</a>
                                </p>
                                
                                <h3 style="font-size: 18px; margin-bottom: 5px;">Détail de votre commande.</h3>
                                <p style="font-size: 16px; margin-bottom: 25px; font-weight: bold;">Commande <span style="color: #016FD0;">${orderId}</span>.</p>
                                
                                <!-- Order Items Card -->
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 25px; margin-bottom: 30px; text-align: left; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                                    ${orderDataRes.items ? orderDataRes.items.map(item => `
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
                                        <div style="display: table-cell; vertical-align: middle; font-size: 13px; color: #555;">Montant total :</div>
                                        <div style="display: table-cell; vertical-align: middle; text-align: right; font-size: 20px; font-weight: bold;">
                                            ${Number(orderDataRes.total_amount).toFixed(2).replace('.', ',')}€
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Footer -->
                                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                                    <details style="margin-bottom: 20px; cursor: pointer; text-align: center;">
                                        <summary style="color: #016FD0; text-decoration: underline; font-weight: bold; font-size: 14px; list-style-position: inside;">Cliquez ici pour voir nos coordonnées bancaires</summary>
                                        <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border: 1px solid #eaeaea; border-radius: 4px; text-align: left; font-size: 13px; color: #333; display: inline-block; width: 100%; max-width: 400px; box-sizing: border-box;">
                                            <p style="margin: 0 0 8px 0;"><strong>BÉNÉFICIAIRE :</strong> Yawa Mareva Segbetse</p>
                                            <p style="margin: 0 0 8px 0;"><strong>IBAN :</strong> FR76 3123 3123 4508 2399 9451 181</p>
                                            <p style="margin: 0;"><strong>BIC :</strong> TRBKFRPPXXX</p>
                                        </div>
                                    </details>
                                    <p style="margin: 0; font-size: 12px; color: #888;">Pour toute question, contactez notre service client : <a href="mailto:service-client@airton-shop.eu" style="color: #016FD0; text-decoration: none;">service-client@airton-shop.eu</a></p>
                                </div>
                                 
                             </div>
                         </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log('Confirmation email sent to', orderDataRes.email);
            } catch (emailErr) {
                console.error('Failed to send email:', emailErr);
            }
        }

        res.status(200).json({ success: true, orderId: data[0].id });

    } catch (err) {
        console.error('Update Reference API Error:', err);
        res.status(500).json({ error: err.message });
    }
}
