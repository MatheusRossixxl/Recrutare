import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { aiService } from "@/services/ai-service";
import { logActivity } from "@/lib/actions";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const user = await requireSession();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Apenas arquivos PDF são aceitos." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Arquivo muito grande. O limite é 10MB." },
        { status: 400 }
      );
    }

    // Extrai o texto do PDF em memória (edge-compatible, sem Buffer).
    const { text } = await extractText(new Uint8Array(await file.arrayBuffer()), { mergePages: true });

    const rawText = (Array.isArray(text) ? text.join("\n") : text).trim();

    if (!rawText) {
      return NextResponse.json(
        {
          error:
            "Não foi possível extrair texto deste PDF. Verifique se o currículo não é apenas uma imagem digitalizada.",
        },
        { status: 400 }
      );
    }

    const fileName = file.name;

    const extraction = await aiService.analyzeResume(rawText);

    const name = extraction.name?.trim();
    const email = extraction.email?.trim().toLowerCase();

    if (!name || !email) {
      return NextResponse.json(
        {
          error:
            "Não foi possível identificar nome e email no currículo. Verifique se essas informações estão disponíveis no PDF.",
        },
        { status: 400 }
      );
    }

    const existing = await db.candidate.findFirst({
      where: {
        organizationId: user.organizationId,
        email,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Já existe um candidato cadastrado com este email.",
        },
        { status: 409 }
      );
    }

    // Neste momento NÃO cria o candidato.
    // Apenas devolve os dados extraídos para a tela de confirmação.
    return NextResponse.json(
      {
        success: true,
        extraction,
        fileName,
      },
      { status: 200 }
    );

    return NextResponse.json(
      {
        success: true,
        fileName,
        extraction,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao importar currículo:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao importar currículo.",
      },
      { status: 500 }
    );
  }
}
