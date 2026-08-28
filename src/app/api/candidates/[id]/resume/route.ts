import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { aiService } from "@/services/ai-service";
import { logActivity } from "@/lib/actions";

// pdf-parse depende de APIs do Node (fs/Buffer), então esta rota
// precisa rodar no runtime Node.js, não no Edge.
export const runtime = "nodejs";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireSession();

    const candidate = await db.candidate.findFirst({
      where: { id: params.id, organizationId: user.organizationId },
    });
    if (!candidate) {
      return NextResponse.json({ error: "Candidato não encontrado" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ error: "Apenas arquivos PDF são aceitos" }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Arquivo muito grande (máximo 10MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Salva o arquivo em disco, dentro de /public, para poder ser
    // servido diretamente por URL (ex: /uploads/resumes/<id>/<arquivo>.pdf).
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${randomUUID()}-${safeFileName}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes", candidate.id);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, uniqueName), buffer);
    const fileUrl = `/uploads/resumes/${candidate.id}/${uniqueName}`;

    // Extrai o texto do PDF. Se a extração falhar (PDF escaneado sem
    // texto, arquivo corrompido etc.), ainda assim salvamos o currículo
    // — só não teremos rawText/análise de IA para ele.
    let rawText: string | null = null;
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const parsed = await pdfParse(buffer);
      rawText = parsed.text?.trim() || null;
    } catch (err) {
      console.error("Falha ao extrair texto do PDF:", err);
    }

    let aiSummary: string | null = null;
    if (rawText) {
      try {
        const extraction = await aiService.analyzeResume(rawText);
        aiSummary = JSON.stringify(extraction);
      } catch (err) {
        console.error("Falha ao analisar currículo com IA:", err);
      }
    }

    const resume = await db.resume.create({
      data: {
        candidateId: candidate.id,
        fileName: file.name,
        fileUrl,
        rawText,
        aiSummary,
      },
    });

    await logActivity(
      user.organizationId,
      user.id,
      "RESUME_UPLOADED",
      `Currículo "${file.name}" enviado para ${candidate.name}.`,
      candidate.id
    );

    return NextResponse.json({ resume }, { status: 201 });
  } catch (err) {
    console.error("Erro no upload de currículo:", err);
    const message = err instanceof Error ? err.message : "Erro inesperado ao enviar currículo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
