exports.handler = async function(event, context) {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: ''
        };
    }

    try {
        const params = event.queryStringParameters || {};
        const email = params.email || 'Target Akun';
        const token = params.token;

        // Render halaman sukses inject premium (respons visual mirip di video)
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' },
            body: `
                <!DOCTYPE html>
                <html lang="id">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Inject Success - Alight Motion</title>
                    <style>
                        body { background: #121212; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                        .card { background: #1e1e1e; padding: 35px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); text-align: center; max-width: 400px; width: 90%; }
                        h2 { color: #00ffcc; margin-bottom: 15px; }
                        p { color: #ccc; font-size: 14px; line-height: 1.5; }
                        .badge { background: #00e5ff; color: #000; padding: 5px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; display: inline-block; margin-bottom: 15px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="badge">PREMIUM 1 TAHUN</div>
                        <h2>Inject Success!</h2>
                        <p>Akun <b>${email}</b> berhasil ditingkatkan ke versi Premium secara permanen selama 1 tahun.</p>
                        <p style="margin-top: 20px; font-size: 12px; color: #777;">Silakan cek aplikasi Alight Motion Anda sekarang, Bos.</p>
                    </div>
                </body>
                </html>
            `
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: 'Terjadi kesalahan sistem saat injeksi premium.'
        };
    }
};
