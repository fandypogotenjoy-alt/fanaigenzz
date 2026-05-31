import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        // Cek apakah Vercel sudah benar-benar membaca kuncinya
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Kunci API Vercel kosong atau belum terbaca!' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 
        
        // Kita pakai versi 1.5 flash yang paling standar dulu untuk testing
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = req.body.prompt;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error("Error Detail:", error);
        // MATRA SAKTI: Error dari Google akan langsung dicetak di layar depan web kamu!
        res.status(500).json({ error: `Dari Google: ${error.message}` });
    }
}
