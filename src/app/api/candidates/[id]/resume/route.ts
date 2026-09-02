import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { aiService } from "@/services/ai-service";
import { logActivity } from "@/lib/actions";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireSession();

    const candidate = await db.candidate.findFirst({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidato não encontrado" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Apenas arquivos PDF são aceitos" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Arquivo muito grande (máximo 10MB)" },
        { status: 400 }
      );
    }

    // 1. Lê o PDF diretamente em memória.
    // Nada é salvo no disco.
    const buffer = Buffer.from(await file.arrayBuffer());

    // 2. Extrai o texto do PDF.
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);

    const rawText = parsed.text?.trim();

    if (!rawText) {
      return NextResponse.json(
        {
          error:
            "Não foi possível extrair texto deste PDF. Verifique se o currículo não é apenas uma imagem digitalizada.",
        },
        { status: 400 }
      );
    }

    // 3. Analisa o currículo.
    const extraction = await aiService.analyzeResume(rawText);

    // 4. Converte os dados extraídos para os campos do Candidate.
    const candidateData = {
      name: extraction.name || candidate.name,
      email: extraction.email || candidate.email,
      phone: extraction.phone || candidate.phone,
      city: extraction.city || candidate.city,
      desiredRole: extraction.desiredRole || candidate.desiredRole,
      desiredRoles: extraction.desiredRoles || candidate.desiredRoles,
      professionalSummary:
        extraction.professionalSummary || candidate.professionalSummary,
      birthDate: extraction.birthDate
        ? new Date(`${extraction.birthDate}T00:00:00`)
        : candidate.birthDate,
      secondaryEmail:
        extraction.secondaryEmail || candidate.secondaryEmail,
      linkedin: extraction.linkedin || candidate.linkedin,
      portfolio: extraction.portfolio || candidate.portfolio,
      education: extraction.education || candidate.education,
      courses: extraction.courses || candidate.courses,
      experience: extraction.experience || candidate.experience,
      skills:
        extraction.skills && extraction.skills.length > 0
          ? extraction.skills.join(", ")
          : candidate.skills,
      languages:
        extraction.languages && extraction.languages.length > 0
          ? extraction.languages.join(", ")
          : candidate.languages,
      salaryExpectation:
        extraction.salaryExpectation !== null &&
        extraction.salaryExpectation !== undefined
          ? extraction.salaryExpectation
          : candidate.salaryExpectation,
      hasDriverLicense:
        extraction.hasDriverLicense !== null &&
        extraction.hasDriverLicense !== undefined
          ? extraction.hasDriverLicense
          : candidate.hasDriverLicense,
      driverLicenseCategory:
        extraction.driverLicenseCategory ||
        candidate.driverLicenseCategory,
      gender: extraction.gender || candidate.gender,
      race: extraction.race || candidate.race,
      sexualOrientation:
        extraction.sexualOrientation || candidate.sexualOrientation,
      genderIdentity:
        extraction.genderIdentity || candidate.genderIdentity,
      address: extraction.address || candidate.address,
      country: extraction.country || candidate.country,
    };

    // 5. Atualiza automaticamente o candidato.
    const updatedCandidate = await db.candidate.update({
      where: {
        id: candidate.id,
      },
      data: candidateData,
    });

    // 6. Salva somente a análise extraída.
    // O PDF e o texto bruto NÃO são armazenados.
    const resume = await db.resume.create({
      data: {
        candidateId: candidate.id,
        fileName: file.name,
        aiSummary: JSON.stringify(extraction),
      },
    });

    await logActivity(
      user.organizationId,
      user.id,
      "RESUME_UPLOADED",
      `Currículo "${file.name}" processado automaticamente para ${updatedCandidate.name}.`,
      candidate.id
    );

    return NextResponse.json(
      {
        success: true,
        candidate: updatedCandidate,
        resume,
        extraction,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erro ao processar currículo:", err);

    const message =
      err instanceof Error
        ? err.message
        : "Erro inesperado ao processar currículo";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
