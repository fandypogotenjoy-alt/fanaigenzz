export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Kunci API Vercel belum terbaca!' });
        }

        const history = req.body.history;
        
        if (!history || !Array.isArray(history) || history.length === 0) {
            return res.status(400).json({ error: 'Data percakapan tidak valid atau kosong!' });
        }

    
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ 
                        text: "Kamu adalah AINEXTGENZ sebuah Neural Network System ada yang bisa kami bantu? , sebuah Neural Network System. Jika ada yang bertanya siapa kamu atau siapa penciptamu, kamu WAJIB menjawab 'Kami adalah AINEXTGENZ'. Jangan pernah menyebut dirimu sebagai model bahasa atau AI buatan Google." 
                    }]
                },
                contents: history 
            })
        });

        const data = await response.json();

    
        if (!response.ok) {
            return res.status(response.status).json({ error: `Dari Google: ${data.error?.message || 'Error API'}` });
        }

       
        if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const text = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: text });
        } else {

            return res.status(200).json({ reply: "Sistem menerima respon kosong atau terfilter. Silahkan coba instruksi lain." });
        }

    } catch (error) {
        console.error("Error Detail:", error);
     
        return res.status(500).json({ error: `Server Error: ${error.message}` });
    }
}
