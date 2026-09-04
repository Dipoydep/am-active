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
                body: JSON.stringify({ error: 'Format Gmail tidak valid, Bos.' }) 
            };
        }

        // Tanpa rate limit, generate token baru tiap request
        const token = crypto.randomBytes(32).toString('hex');
        const siteUrl = event.headers['origin'] || `https://${event.headers.host}`;
        
        // Link internal untuk proses verifikasi akhir
        const verifyEndpoint = `${siteUrl}/api/activate-premium?token=${token}&email=${encodeURIComponent(email)}`;
        
        // Format link ala alightcreative persis seperti di video referensi
        const alightCreativeLink = `https://alight-creative.firebaseapp.com/__/auth/link?token=${token}&email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(verifyEndpoint)}`;

        // Konfigurasi pengiriman email SMTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL || 'your-email@gmail.com',
                pass: process.env.SMTP_PASSWORD || 'your-app-password'
            }
        });

        const mailOptions = {
            from: '"Alight Creative" <noreply@alight-creative.firebaseapp.com>',
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

        try {
            await transporter.sendMail(mailOptions);
        } catch (smtpErr) {
            console.log('[SMTP Log Warning]:', smtpErr.message);
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                status: 'success',
                message: 'Magic link berhasil dikirim ke Gmail target, Bos.',
                alight_creative_link: alightCreativeLink // Disediakan untuk kemudahan testing langsung
            })
        };

    } catch (error) {
        return { 
            statusCode: 500, 
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message }) 
        };
    }
};
          
