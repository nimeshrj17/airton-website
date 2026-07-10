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
                    to: 'service-client@airton-shop.eu',
                    bcc: 'adityajaif2004@gmail.com',
                    subject: 'Confirmation de votre commande Airton',
                    html: `
                        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #faebd7 0%, #e0f7fa 100%); padding: 40px 20px; color: #111; text-align: center;">
                            <!-- Centering Table -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; margin: 0 auto; text-align: center;">
                                            <tr>
                                                <td align="center">
                                
                                <!-- Logo -->
                                <img src="https://airton.shop/cdn/shop/files/Logo_Airton_2025_Noir_2.svg" alt="Airton" style="height: 35px; margin-bottom: 20px;">
                                

                                <!-- Header -->
                                <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Votre commande est en attente de confirmation</h2>
                                <p style="font-size: 14px; color: #555; margin-bottom: 30px; line-height: 1.5;">
                                    Si vous constatez une erreur dans votre commande,<br>
                                    contactez nous à l'adresse : <a href="mailto:service-client@airton.shop" style="color: #016FD0; text-decoration: none;">service-client@airton.shop</a>
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
                                
                                <!-- Action Button -->
                                <a href="mailto:service-client@airton.shop?subject=Demande%20de%20facture%20pour%20la%20commande%20%23${orderDataRes.id}" style="display: inline-block; background-color: #2b8cff; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 30px; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
                                    Télécharger ma facture
                                </a>
                                
                                <!-- Bank Transfer Steps -->
                                <h3 style="font-size: 16px; color: #2b8cff; margin-bottom: 20px; font-weight: bold; text-align: center;">Si vous payez par virement bancaire.</h3>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 8px; padding: 25px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                                    <tr>
                                        <td width="33%" align="center" valign="middle" style="border-right: 2px solid #2b8cff; padding: 0 10px;">
                                            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #222;">Téléchargez<br>notre RIB <a href="https://airton-shop.eu/pages/bank-details?ref=${orderDataRes.id}&amount=${orderDataRes.total_amount}" style="color: #2b8cff; text-decoration: none;">ici</a></p>
                                        </td>
                                        <td width="34%" align="center" valign="middle" style="border-right: 2px solid #2b8cff; padding: 0 10px;">
                                            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #222;">Faire le virement<br>avec la référence <span style="color: #2b8cff;">#${orderDataRes.id}</span></p>
                                        </td>
                                        <td width="33%" align="center" valign="middle" style="padding: 0 10px;">
                                            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #222;">Envoyer le justificatif<br>à <a href="mailto:service-client@airton.shop" style="color: #2b8cff; text-decoration: none;">service-client@airton.shop</a></p>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Footer -->
                                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                                    <p style="margin: 0; font-size: 12px; color: #888;">Pour toute question, contactez notre service client : <a href="mailto:service-client@airton.shop" style="color: #016FD0; text-decoration: none;">service-client@airton.shop</a></p>
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
