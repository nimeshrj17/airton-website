import { createClient } from '@supabase/supabase-js';
const nodemailer = require('nodemailer');

const supabaseUrl = process.env.SUPABASE_URL || 'https://alvwqkqsokaiarrmweht.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    const orderDataToSave = {
        email: "adityajaif2004@gmail.com", // Send to user's email so they can check it
        first_name: "Test",
        last_name: "User",
        total_amount: 500.0,
        status: "paid",
        order_data: {
            payment_method: 'card',
            email: "adityajaif2004@gmail.com",
            firstName: "Test",
            lastName: "User",
            address: "123 Rue de la Paix",
            city: "Paris",
            zipcode: "75000",
            country: "FR",
            phone: "0123456789"
        },
        items: [
            {
                title: "Climatiseur",
                price: 500.0,
                quantity: 1
            }
        ]
    };

    // 1. Insert into Supabase
    const { data, error } = await supabase
        .from('orders')
        .insert([orderDataToSave])
        .select();

    if (error) return res.status(500).json({ error });

    const orderData = data[0];

    // 2. Send Email
    if (process.env.SMTP_HOST) {
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
                            
                            <div style="background: #ffffff; border-radius: 12px; padding: 40px 30px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.04);">
                                <h3 style="margin-top: 0; font-size: 18px; font-weight: 600; margin-bottom: 5px;">Détail de votre commande.</h3>
                                <p style="font-size: 15px; margin-bottom: 30px; color: #666;">Commande <span style="color: #016FD0; font-weight: bold;">#${orderData.id}</span>.</p>
                                
                                <div style="background: #fdfdfd; border: 1px solid #eee; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
                                    ${orderData.items && orderData.items.length > 0 ? orderData.items.map(item => `
                                    <div style="display: table; width: 100%; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                                        <div style="display: table-cell; vertical-align: middle; width: 60px;">
                                            ${(item.image_url || item.image) ? `<img src="${item.image_url || item.image}" width="50" height="50" style="border-radius: 4px; object-fit: cover; border: 1px solid #eaeaea;" />` : `<div style="width: 50px; height: 50px; background: #f8f9fa; border: 1px solid #eaeaea; border-radius: 4px;"></div>`}
                                        </div>
                                        <div style="display: table-cell; vertical-align: middle; text-align: left; font-size: 13px; color: #555; padding-left: 10px;">
                                            ${item.title || item.name}
                                        </div>
                                        <div style="display: table-cell; vertical-align: middle; text-align: center; font-size: 13px; color: #888; width: 40px;">
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
                            </div>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Email error:', err);
        }
    }

    res.status(200).json({ success: true, orderId: orderData.id });
}
