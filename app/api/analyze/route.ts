import { NextRequest, NextResponse } from 'next/server';

interface AnalyzeRequest {
  monthlyAmount: number;
  totalInvested: number;
  finalValue: number;
  gain: number;
  returnPct: number;
  xirr: number;
  periodLabel: string;
  startDate: string;
  endDate: string;
  crises: string[];
}

function formatRp(n: number): string {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} miliar`;
  if (n >= 1_000_000) return `Rp ${Math.round(n / 1_000_000)} juta`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const body = (await req.json()) as AnalyzeRequest;

  const crisisText =
    body.crises.length > 0
      ? `Selama periode ini terjadi krisis: ${body.crises.join(', ')}.`
      : 'Periode ini relatif tidak ada krisis besar.';

  const isProfit = body.gain >= 0;

  const prompt = `Kamu adalah asisten finansial yang menjelaskan hasil simulasi investasi DCA (Dollar Cost Averaging) di IHSG kepada investor dengan bahasa Indonesia yang hangat, mudah dipahami, dan menarik.

Berikut data simulasi:
- Investasi rutin: ${formatRp(body.monthlyAmount)} per bulan
- Periode: ${body.startDate} hingga ${body.endDate} (${body.periodLabel})
- Total yang disetorkan: ${formatRp(body.totalInvested)}
- Nilai portofolio akhir: ${formatRp(body.finalValue)}
- ${isProfit ? 'Keuntungan' : 'Kerugian'}: ${formatRp(Math.abs(body.gain))} (${body.returnPct.toFixed(1)}%)
- XIRR (imbal hasil tahunan): ${body.xirr.toFixed(1)}% per tahun
- ${crisisText}

Tulis narasi singkat (3 paragraf, total 120–160 kata) dalam Bahasa Indonesia yang:
1. Paragraf 1: Ceritakan perjalanan investasi — kapan mulai, bagaimana awalnya, dan krisis apa yang dilalui
2. Paragraf 2: Jelaskan dampak krisis terhadap portofolio dan bagaimana DCA membantu melewatinya
3. Paragraf 3: Simpulkan hasil akhir dengan nada positif dan edukatif

Gunakan bahasa bercerita yang mengalir, bukan bullet points. Jangan ulangi angka terlalu banyak.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
      }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Gemini API error' }, { status: 502 });
  }

  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return NextResponse.json({ narrative: text });
}
