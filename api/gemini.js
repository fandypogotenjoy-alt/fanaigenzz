export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Kunci API Vercel belum terbaca!' });
        }

        // 1. Tangkap 'history' dari frontend, sesuai struktur aplikasimu
        const history = req.body.history;
        
        if (!history || !Array.isArray(history) || history.length === 0) {
            return res.status(400).json({ error: 'Data percakapan tidak valid atau kosong!' });
        }

        // 2. Direct Fetch ke Gemini (Balik pakai gemini-3.5-flash sesuai setingan lu)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: history // Oper seluruh array history langsung
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
