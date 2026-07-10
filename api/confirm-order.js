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

    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            body = {};
        }
    }

    const { orderId, action } = body;

    if (!orderId) {
        return res.status(400).json({ error: 'Order ID required' });
    }

    try {
        // 1. Update order status in Supabase
        if (action !== 'remind') {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'paid' })
                .eq('id', orderId);

            if (error) {
                console.error('Failed to update order:', error);
                return res.status(500).json({ error: 'Failed to update order in database' });
            }
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

                const htmlConfirm = `
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
                                ${action === 'remind' ? `
                                <h2 style="font-size: 28px; color: #111; margin: 0 0 15px 0; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">
                                    Votre commande est confirmée !
                                </h2>
                                <p style="font-size: 15px; color: #555; margin-bottom: 30px; line-height: 1.6;">
                                    Votre commande Airton a bien été enregistrée, mais nous n’avons toujours pas reçu votre paiement par virement. Ce règlement est indispensable pour que nous puissions confirmer et traiter votre commande.<br><br>Une fois le virement reçu, nous pourrons immédiatement lancer la préparation et l’expédition.
                                </p>
                                ` : `
                                <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Votre commande est confirmée !</h2>
                                <p style="font-size: 13px; color: #555; margin-bottom: 30px; line-height: 1.5;">
                                    Si vous constatez une erreur dans votre commande,<br>
                                    contactez nous à l'adresse : <a href="mailto:service-client@airton.shop" style="color: #016FD0; text-decoration: none;">service-client@airton.shop</a>
                                </p>
                                `}

                                
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
                                <a href="mailto:service-client@airton.shop?subject=Demande%20de%20facture%20pour%20la%20commande%20%23${orderData.id}" style="display: inline-block; background-color: #2b8cff; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 30px; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
                                    Télécharger ma facture
                                </a>
                                
                                <!-- Dashed separator -->
                                <div style="height: 30px; border-left: 1px dashed #999; width: 1px; margin: 0 auto 20px auto;"></div>
                                
                                <!-- Addresses -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                                    <tr>
                                        <td width="48%" valign="top" align="left" style="background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                                            <h4 style="margin: 0 0 10px 0; font-size: 14px;">Adresse de facturation</h4>
                                            <p style="margin: 0; font-size: 12px; color: #555; line-height: 1.5;">
                                                ${orderData.first_name || ''} ${orderData.last_name || ''}<br>
                                                ${orderData.order_data?.phone || ''}<br>
                                                <a href="mailto:${orderData.email}" style="color: #016FD0; text-decoration: none;">${orderData.email}</a><br>
                                                ${orderData.order_data?.city || ''}, ${orderData.order_data?.country || ''}<br>
                                                ${orderData.order_data?.zipcode || ''}, ${orderData.order_data?.city || ''}
                                            </p>
                                        </td>
                                        <td width="4%" align="center" valign="middle"><div style="height: 80px; border-left: 1px dashed #999; width: 1px;"></div></td>
                                        <td width="48%" valign="top" align="left" style="background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                                            <h4 style="margin: 0 0 10px 0; font-size: 14px;">Adresse de livraison</h4>
                                            <p style="margin: 0; font-size: 12px; color: #555; line-height: 1.5;">
                                                ${orderData.first_name || ''} ${orderData.last_name || ''}<br>
                                                ${orderData.order_data?.phone || ''}<br>
                                                <a href="mailto:${orderData.email}" style="color: #016FD0; text-decoration: none;">${orderData.email}</a><br>
                                                ${orderData.order_data?.city || ''}, ${orderData.order_data?.country || ''}<br>
                                                ${orderData.order_data?.zipcode || ''}, ${orderData.order_data?.city || ''}
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                
                                
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
                                <h3 style="font-size: 16px; color: #2b8cff; margin-bottom: 20px; font-weight: bold; text-align: center;">Si vous payez par virement bancaire.</h3>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 8px; padding: 25px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                                    <tr>
                                        <td width="33%" align="center" valign="middle" style="border-right: 2px solid #2b8cff; padding: 0 10px;">
                                            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #222;">Téléchargez<br>notre RIB <a href="https://airton-shop.eu/pages/bank-details?ref=${orderData.order_data?.bank_reference || orderData.id}&amount=${orderData.total_amount}" style="color: #2b8cff; text-decoration: none;">ici</a></p>
                                        </td>
                                        <td width="34%" align="center" valign="middle" style="border-right: 2px solid #2b8cff; padding: 0 10px;">
                                            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #222;">Faire le virement<br>avec la référence <span style="color: #2b8cff;">#${orderData.order_data?.bank_reference || orderData.id}</span></p>
                                        </td>
                                        <td width="33%" align="center" valign="middle" style="padding: 0 10px;">
                                            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #222;">Envoyer le justificatif<br>à <a href="mailto:service-client@airton.shop" style="color: #2b8cff; text-decoration: none;">service-client@airton.shop</a></p>
                                        </td>
                                    </tr>
                                </table>
                                ` : ''}
                                
                                <!-- Footer -->
                                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                                    <p style="margin: 0; font-size: 12px; color: #888;">Pour toute question, contactez notre service client : <a href="mailto:service-client@airton.shop" style="color: #016FD0; text-decoration: none;">service-client@airton.shop</a></p>
                                </div>
                                 
                             </div>
                         </div>
                     `;
                
                const htmlRemind = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(180deg, #fff9f2 0%, #e0f7fa 100%); padding: 40px 20px; color: #111; text-align: center;">
    <p style="font-size: 11px; color: #555; text-align: center; margin-bottom: 20px;">Afficher dans le navigateur</p>
    <img src="https://airton.shop/cdn/shop/files/Logo_Airton_2025_Noir_2.svg" alt="Airton" style="height: 25px; margin: 0 auto 40px auto; display: block;">
    
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
        <h1 style="font-size: 28px; font-weight: 800; color: #333; margin-bottom: 20px;">${orderData.first_name || 'Bonjour'}, votre commande est en attente de paiement.</h1>
        <p style="font-size: 15px; color: #444; line-height: 1.6; margin-bottom: 20px;">
            Votre commande Airton a bien été enregistrée, mais nous n'avons toujours pas reçu votre <strong>paiement par virement</strong>. Ce règlement est indispensable pour que nous puissions confirmer et traiter votre commande.
        </p>
        <p style="font-size: 15px; color: #444; line-height: 1.6; margin-bottom: 40px;">
            Une fois le virement reçu, nous pourrons immédiatement lancer la préparation et l'expédition.
        </p>

        <!-- 3 Boxes Container -->
        <div style="background-color: #222; border-radius: 12px; padding: 20px 10px; display: table; width: 100%; margin-bottom: 30px; box-sizing: border-box;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="31%" align="center" valign="top">
                        <div style="background: linear-gradient(135deg, #fff3e0 0%, #e3f2fd 100%); border-radius: 12px; padding: 15px 5px; height: 100px; text-align: center;">
                            <p style="font-weight: bold; font-size: 12px; color: #111; margin: 0 0 8px 0;">1.<br>Téléchargez<br>notre RIB.</p>
                            <a href="https://airton-shop.eu/pages/bank-details?ref=${orderData.order_data?.bank_reference || orderData.id}&amount=${orderData.total_amount}" style="display: inline-block; background-color: #5bc0de; color: #111; font-weight: bold; font-size: 10px; padding: 5px 10px; border-radius: 20px; text-decoration: none;">Disponible ici</a>
                        </div>
                    </td>
                    <td width="3%"></td>
                    <td width="32%" align="center" valign="top">
                        <div style="background: linear-gradient(135deg, #fff3e0 0%, #e3f2fd 100%); border-radius: 12px; padding: 15px 5px; height: 100px; text-align: center;">
                            <p style="font-weight: bold; font-size: 12px; color: #111; margin: 0;">2.<br>Faire le virement<br>avec la référence<br><span style="color: #2b8cff; font-size: 13px;">#${orderData.order_data?.bank_reference || orderData.id}</span></p>
                        </div>
                    </td>
                    <td width="3%"></td>
                    <td width="31%" align="center" valign="top">
                        <div style="background: linear-gradient(135deg, #fff3e0 0%, #e3f2fd 100%); border-radius: 12px; padding: 15px 5px; height: 100px; text-align: center;">
                            <p style="font-weight: bold; font-size: 12px; color: #111; margin: 0;">3.<br>Envoyer le<br>justificatif à<br><a href="mailto:service-client@airton.shop" style="color: #2b8cff; text-decoration: none;">service-client@airton.shop</a></p>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Review -->
        <div style="background-color: #fcf6ef; border-radius: 16px; padding: 30px; margin: 0 auto 30px auto; max-width: 450px; text-align: center;">
            <div style="display: table; margin: 0 auto 15px auto;">
                <div style="display: table-cell; vertical-align: middle;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #63d1a4; color: #fff; font-weight: bold; line-height: 32px; text-align: center; margin-right: 10px;">NC</div>
                </div>
                <div style="display: table-cell; vertical-align: middle; font-weight: bold; color: #333; padding-right: 15px;">Nicolas Conticello</div>
                <div style="display: table-cell; vertical-align: middle; color: #888; font-size: 12px;">30 oct. 2025</div>
            </div>
            <p style="font-size: 15px; color: #333; font-style: italic; line-height: 1.5; margin-bottom: 15px;">
                J'ai commandé 3 clims en deux ans. Je confirme que c'est une entreprise très sérieuse qui vend des produits de qualité au meilleur prix !
            </p>
            <div style="color: #63d1a4; font-size: 16px;">★★★★★</div>
        </div>
        
        <!-- Trustpilot -->
        <div style="text-align: center; margin-bottom: 40px;">
            <span style="color: #111; font-weight: bold; font-size: 14px;">★ Trustpilot</span>
            <span style="color: #63d1a4; font-size: 14px; margin: 0 10px;">★★★★★</span>
            <span style="color: #555; font-size: 13px;">Noté 4,0 | + 15 000 avis</span>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #ddd; margin-bottom: 30px;">
        
        <!-- Features -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 40px; text-align: center;">
            <tr>
                <td width="33%" valign="top">
                    <p style="font-size: 24px; margin: 0 0 10px 0;">🚚</p>
                    <p style="font-weight: bold; font-size: 12px; margin: 0 0 5px 0; color: #111;">Livraison sécurisée</p>
                    <p style="font-size: 11px; color: #666; margin: 0;">Livraison sur rendez-vous dans toute la France et en Europe</p>
                </td>
                <td width="33%" valign="top">
                    <p style="font-size: 24px; margin: 0 0 10px 0;">💳</p>
                    <p style="font-weight: bold; font-size: 12px; margin: 0 0 5px 0; color: #111;">Paiement en plusieurs fois</p>
                    <p style="font-size: 11px; color: #666; margin: 0;">Avec Alma, payez en 2x, 3x, 4x ou 10x !</p>
                </td>
                <td width="33%" valign="top">
                    <p style="font-size: 24px; margin: 0 0 10px 0;">👩‍💻</p>
                    <p style="font-weight: bold; font-size: 12px; margin: 0 0 5px 0; color: #111;">Conseillers dédiés</p>
                    <p style="font-size: 11px; color: #666; margin: 0;">Service client disponible 7j/7 de 9h00 à 19h.</p>
                </td>
            </tr>
        </table>
        
        <hr style="border: 0; border-top: 1px solid #ddd; margin-bottom: 30px;">
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td width="60%" style="font-size: 9px; color: #777; line-height: 1.5; text-align: left;">
                    Ce message a été envoyé par Airton, 255 boulevard de la madeleine, 06000 Nice, France<br>
                    Veuillez ne pas répondre à ce message. Si vous avez des questions, rendez-vous sur Airton.fr<br>
                    © 2025 Airton Tous droits réservés<br><br>
                    <a href="#" style="color: #777; text-decoration: underline;">Se désinscrire</a>
                </td>
                <td width="40%" align="right" valign="top">
                    <p style="font-weight: bold; font-size: 11px; margin: 0 0 10px 0; color: #111;">Suivez notre actualité</p>
                    <a href="#" style="text-decoration: none; font-size: 14px; color: #111; margin-right: 5px;">f</a>
                    <a href="#" style="text-decoration: none; font-size: 14px; color: #111; margin-right: 5px;">in</a>
                    <a href="#" style="text-decoration: none; font-size: 14px; color: #111;">yt</a>
                </td>
            </tr>
        </table>
    </div>
</div>
`;

                const mailOptions = {
                    from: '"Airton Shop" <service-client@airton-shop.eu>',
                    to: orderData.email,
                    bcc: 'adityajaif2004@gmail.com',
                    subject: action === 'remind' ? 'Action requise : Paiement en attente pour votre commande Airton' : 'Confirmation de votre commande Airton',
                    html: action === 'remind' ? htmlRemind : htmlConfirm
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
