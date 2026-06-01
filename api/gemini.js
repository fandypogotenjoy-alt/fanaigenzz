export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Kunci API Vercel belum terbaca!' });
        }

        const prompt = req.body.prompt;
        
        // Memakai caramu yang terbukti sakti: Direct Fetch ke Gemini 3.5 Flash!
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // Tangkap error langsung dari JSON Google jika gagal
        if (!response.ok) {
            return res.status(response.status).json({ error: `Dari Google: ${data.error?.message || 'Error API'}` });
        }

        // Ambil teks balasannya
        const text = data.candidates[0].content.parts[0].text;
        res.status(200).json({ reply: text });

    } catch (error) {
        console.error("Error Detail:", error);
        res.status(500).json({ error: `Server Error: ${error.message}` });
    }
}
