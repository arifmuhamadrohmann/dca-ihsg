import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import type { ComparisonResult, AIAnalysis } from '@/lib/types';

const SYSTEM_PROMPT = `Kamu adalah asisten analisis investasi yang menganalisis hasil simulasi perbandingan strategi DCA dan lump sum di IHSG dan deposito BI Rate untuk periode historis Indonesia.

Tugasmu:
1. Bandingkan strategi yang dipilih user berdasarkan data simulasi yang diberikan
2. Identifikasi pemenang dan selisihnya dengan angka exact dari data
3. Jelaskan kapan strategi tertentu unggul vs underperform (saat krisis vs bull market)
4. Berikan nuansa, bukan rekomendasi (gunakan "secara historis", "dalam simulasi ini")
5. Selalu sertakan disclaimer: bukan rekomendasi investasi, past performance bukan jaminan masa depan
6. Output dalam Bahasa Indonesia
7. WAJIB output JSON valid dengan struktur tepat:
{
  "summary": "Ringkasan 2-3 kalimat",
  "winnerExplanation": "Pemenang & selisih 2-3 kalimat",
  "contextAnalysis": "Analisis konteks krisis/bull market 2-3 kalimat",
  "importantNotes": "Catatan & disclaimer 1-2 kalimat"
}

JANGAN tambahkan teks di luar JSON. JANGAN gunakan markdown fence.`;

function formatRp(n: number): string {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} miliar`;
  if (n >= 1_000_000) return `Rp ${Math.round(n / 1_000_000)} juta`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key tidak dikonfigurasi' }, { status: 500 });
  }

  let body: ComparisonResult;
  try {
    body = (await req.json()) as ComparisonResult;
  } catch {
    return NextResponse.json({ error: 'Request tidak valid' }, { status: 400 });
  }

  const groq = new Groq({ apiKey });

  const strategyLines = body.strategies
    .map(
      (s) =>
        `- ${s.label}: setor ${formatRp(s.totalInvested)}, nilai akhir ${formatRp(s.finalValue)}, return ${s.returnPct.toFixed(1)}%, XIRR ${s.xirr.toFixed(1)}%`
    )
    .join('\n');

  const startLabel =
    body.input.startDate instanceof Date
      ? body.input.startDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      : String(body.input.startDate);

  const endLabel =
    body.input.endDate instanceof Date
      ? body.input.endDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      : String(body.input.endDate);

  const winnerLabel = body.strategies.find((s) => s.strategy === body.winner)?.label ?? body.winner;
  const loserLabel = body.strategies.find((s) => s.strategy === body.loser)?.label ?? body.loser;

  const userMessage = `Hasil simulasi ${formatRp(body.input.monthlyAmount)}/bulan, periode ${startLabel} sampai ${endLabel}:

${strategyLines}

Pemenang: ${winnerLabel}
Terendah: ${loserLabel}

Output JSON analisis sesuai instruksi.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from Groq');

    const parsed = JSON.parse(content) as {
      summary?: string;
      winnerExplanation?: string;
      contextAnalysis?: string;
      importantNotes?: string;
    };

    const analysis: AIAnalysis = {
      summary: parsed.summary ?? '',
      winnerExplanation: parsed.winnerExplanation ?? '',
      contextAnalysis: parsed.contextAnalysis ?? '',
      importantNotes: parsed.importantNotes ?? '',
      generatedAt: new Date().toISOString(),
      fromCache: false,
    };

    return NextResponse.json(analysis);
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 429) {
      return NextResponse.json({ error: 'Quota AI tercapai. Coba 1 menit lagi.' }, { status: 429 });
    }
    console.error('Groq compare-analyze error:', err);
    return NextResponse.json(
      { error: 'Analisis tidak tersedia. Coba lagi nanti.' },
      { status: 500 }
    );
  }
}
