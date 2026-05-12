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
    return NextResponse.json({ error: 'API key tidak dikonfigurasi' }, { status: 500 });
  }

  let body: AnalyzeRequest;
  try {
    body = (await req.json()) as AnalyzeRequest;
  } catch {
    return NextResponse.json({ error: 'Request tidak valid' }, { status: 400 });
  }

  const crisisText =
    body.crises.length > 0
      ? `Periode ini melewati krisis: ${body.crises.join(', ')}.`
      : 'Periode ini relatif stabil tanpa krisis besar.';

  const isProfit = body.gain >= 0;

  const prompt = `Kamu adalah analis investasi yang memberikan analisis singkat hasil simulasi DCA (Dollar Cost Averaging) di IHSG kepada investor pemula. Gunakan bahasa Indonesia yang jelas dan mudah dipahami.

Data simulasi:
- Investasi rutin: ${formatRp(body.monthlyAmount)} per bulan
- Periode: ${body.startDate} hingga ${body.endDate} (${body.periodLabel})
- Total disetorkan: ${formatRp(body.totalInvested)}
- Nilai akhir portofolio: ${formatRp(body.finalValue)}
- ${isProfit ? 'Keuntungan' : 'Kerugian'}: ${formatRp(Math.abs(body.gain))} (${body.returnPct.toFixed(1)}%)
- XIRR (return tahunan): ${body.xirr.toFixed(1)}% per tahun
- ${crisisText}

Berikan analisis dalam format berikut (gunakan markdown sederhana):

**Ringkasan Hasil**
[1-2 kalimat ringkasan performa portofolio]

**Dampak DCA**
[1-2 kalimat bagaimana strategi DCA membantu menghadapi volatilitas]

**Apa artinya ini?**
[1-2 kalimat konteks dibanding inflasi/deposito/instrumen lain]

**Catatan Penting**
[1 kalimat disclaimer singkat]

Gunakan angka dari data di atas. Total sekitar 80-100 kata.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini API error:', res.status, errText);
      return NextResponse.json(
        { error: `Gemini API error: ${res.status}` },
        { status: 502 }
      );
    }

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };

    if (json.error) {
      console.error('Gemini response error:', json.error);
      return NextResponse.json({ error: json.error.message ?? 'Gemini error' }, { status: 502 });
    }

    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return NextResponse.json({ narrative: text });
  } catch (err) {
    console.error('Fetch error:', err);
    return NextResponse.json({ error: 'Gagal menghubungi Gemini API' }, { status: 502 });
  }
}
