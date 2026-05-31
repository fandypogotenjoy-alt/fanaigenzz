// Anda perlu menginstal google-auth-library jika menggunakan modul Node secara lokal,
// namun Vercel akan otomatis mengurus dependensi jika dicantumkan di package.json.
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const client = new OAuth2Client(CLIENT_ID);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, token } = req.body;

    if (!prompt || !token) {
        return res.status(400).json({ error: 'Prompt dan Token wajib diisi' });
    }

    try {
        // 1. Validasi Token Google (Cek apakah user benar-benar login resmi)
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userEmail = payload.email; // ID Unik pengguna berdasarkan Gmail

        // 2. Panggil Gemini API Resmi Google
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const geminiData = await geminiResponse.json();
        const aiReply = geminiData.candidates[0].content.parts[0].text;

        // 3. DI SINI TEMPAT MENYIMPAN RIWAYAT (DATABASE)
        // Kamu bisa mengintegrasikannya dengan Supabase, Firebase, atau MongoDB.
        // Contoh konsep logika penyimpanan:
        // await saveToDatabase({ email: userEmail, prompt: prompt, reply: aiReply, timestamp: new Date() });
        console.log(`Menyimpan riwayat untuk ${userEmail}`); 

        // Kirim balik respon ke frontend
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada sistem internal.' });
    }
}