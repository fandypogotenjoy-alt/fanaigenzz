import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Pastikan hanya menerima metode POST dari frontend
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        // Mengambil kunci rahasia dari Environment Variables Vercel
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 
        
        // Memilih model AI yang akan dipakai (Di sinilah kamu atur ke Gemini 3.1)
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash" });

        // Mengambil teks yang diketik pengguna
        const prompt = req.body.prompt;
        
        // Menyuruh Gemini menjawab
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Mengirim jawaban kembali ke index.html
        res.status(200).json({ reply: text });
    } catch (error) {
        console.error("Error dari Gemini API:", error);
        res.status(500).json({ error: 'Gagal memproses data di server.' });
    }
}
