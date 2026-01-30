export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const ALLOWED_IPS = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];
    const WEBHOOK_URL = process.env.WEBHOOK_URL;

    // Vercel üzerinden gelen kullanıcı IP'si
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // IP Güvenlik Kontrolü (Server-side)
    const isAuthorized = ALLOWED_IPS.some(ip => userIp.includes(ip.trim())) || userIp.includes('192.168');

    if (!isAuthorized) {
        // İzinli değilse sessizce reddet, hata mesajı bile döndürme
        return res.status(403).end();
    }

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: req.body, // İstemciden gelen FormData (dosya + json)
        });

        const data = await response.status;
        return res.status(data).json({ success: response.ok });
    } catch (err) {
        return res.status(500).end();
    }
}
