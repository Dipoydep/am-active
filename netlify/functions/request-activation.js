const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.handler = async function(event, context) {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Method Not Allowed' }) 
        };
    }

    try {
        const body = JSON.parse(event.body);
        const email = body.email;

        if (!email || !email.includes('@')) {
            return { 
                statusCode: 400, 
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Format email tidak valid, Bos.' }) 
            };
        }

        const token = crypto.randomBytes(32).toString('hex');
        const siteUrl = event.headers['origin'] || `https://${event.headers.host}`;
        const verifyEndpoint = `${siteUrl}/api/activate-premium?token=${token}&email=${encodeURIComponent(email)}`;
        const alightCreativeLink = `https://alight-creative.firebaseapp.com/__/auth/link?token=${token}&email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(verifyEndpoint)}`;

        // Konfigurasi SMTP Universal (Support Custom Domain, Outlook, Zoho, dll via Environment Variables)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',       // Bisa diisi smtp.mailgun.org, smtp.zoho.com, dll
            port: parseInt(process.env.SMTP_PORT) || 587,          // 465 untuk SSL, 587 untuk TLS
            secure: process.env.SMTP_SECURE === 'true',            // true jika port 465, false jika 587
            auth: {
                user: process.env.SMTP_EMAIL,                      // Email pengirim Anda
                pass: process.env.SMTP_PASSWORD                    // Password / App Password email pengirim
            }
        });

        const mailOptions = {
            from: process.env.SMTP_FROM || '"Alight Creative" <noreply@alight-creative.firebaseapp.com>',
            to: email,
            subject: `Sign in to Alight Creative requested at ${new Date().toUTCString()}`,
            html: `
                <div style="background: #121212; color: #ffffff; padding: 30px; font-family: Arial, sans-serif; border-radius: 8px;">
                    <p>Hello,</p>
                    <p>We received a request to sign in to Alight Creative using this email address. If you want to sign in with your <b>${email}</b> account, click this link:</p>
                    <p style="background: #1e1e1e; padding: 15px; border-radius: 5px; word-break: break-all;">
                        <a href="${alightCreativeLink}" style="color: #00ffcc;">${alightCreativeLink}</a>
                    </p>
                    <p>If you did not request this link, you can safely ignore this email.</p>
                    <p>Thanks,<br>Your Alight Creative team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                status: 'success',
                message: 'Magic link berhasil dikirim ke email target, Bos.',
                alight_creative_link: alightCreativeLink
            })
        };

    } catch (error) {
        return { 
            statusCode: 500, 
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Gagal mengirim email via SMTP', details: error.message }) 
        };
    }
};
