import re

path = '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/api/update-reference.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add nodemailer import if not present
if 'nodemailer' not in content:
    content = content.replace("import { createClient } from '@supabase/supabase-js';", "import { createClient } from '@supabase/supabase-js';\nconst nodemailer = require('nodemailer');")

# Find where res.status(200) is and replace it with email sending logic
email_logic = """
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
                                    Nous avons bien reçu la référence de votre virement bancaire. Votre commande sera traitée dès réception de votre paiement sur notre compte.<br><br>
                                    Pour toute question, notre support client est à votre écoute : <br><a href="mailto:service-client@airton-shop.eu" style="color: #016FD0; text-decoration: none;">service-client@airton-shop.eu</a>
                                </p>
                                
                                <h3 style="font-size: 18px; margin-bottom: 5px;">Détail de votre commande.</h3>
                                <p style="font-size: 16px; margin-bottom: 25px; font-weight: bold;">Commande <span style="color: #016FD0;">#${orderId}</span>.</p>
                                
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
                                
                                <h3 style="font-size: 16px; color: #016FD0; margin-bottom: 20px;">Rappel : vos informations de virement</h3>
                                <div style="background: #ffffff; border-radius: 8px; display: table; width: 100%; padding: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                                    <div style="display: table-cell; width: 33%; text-align: center; border-right: 1px solid #e0e0e0; vertical-align: middle; padding: 0 10px;">
                                        <p style="margin: 0; font-size: 11px; font-weight: bold;">Téléchargez<br>notre RIB <a href="mailto:service-client@airton-shop.eu?subject=Demande%20de%20RIB" style="color: #016FD0; text-decoration: none;">ici</a></p>
                                    </div>
                                    <div style="display: table-cell; width: 33%; text-align: center; border-right: 1px solid #e0e0e0; vertical-align: middle; padding: 0 10px;">
                                        <p style="margin: 0; font-size: 11px; font-weight: bold;">Faire le virement<br>avec la référence <span style="color: #016FD0;">${reference || '#' + orderId}</span></p>
                                    </div>
                                    <div style="display: table-cell; width: 33%; text-align: center; vertical-align: middle; padding: 0 10px;">
                                        <p style="margin: 0; font-size: 11px; font-weight: bold;">Envoyer le justificatif<br>à <a href="mailto:service-client@airton-shop.eu" style="color: #016FD0; text-decoration: none;">service-client@airton-shop.eu</a></p>
                                    </div>
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
"""

# Note: In api/update-reference.js we only selected 'order_data'. We need to select '*', or at least 'email', 'items', 'total_amount'.
content = content.replace(".select('order_data')", ".select('*')")

content = content.replace("res.status(200).json({ success: true, orderId: data[0].id });", email_logic)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Email logic added to api/update-reference.js")
