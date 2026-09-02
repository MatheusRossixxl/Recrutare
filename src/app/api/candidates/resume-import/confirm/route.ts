import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";

type Extraction = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  desiredRole?: string | null;
  desiredRoles?: string | null;
  professionalSummary?: string | null;
  summary?: string | null;
  birthDate?: string | null;
  secondaryEmail?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  education?: string | null;
  courses?: string | null;
  experience?: string | null;
  skills?: string[] | null;
  languages?: string[] | null;
  salaryExpectation?: number | null;
  hasDriverLicense?: boolean | null;
  driverLicenseCategory?: string | null;
  gender?: string | null;
  race?: string | null;
  sexualOrientation?: string | null;
  genderIdentity?: string | null;
  address?: string | null;
  country?: string | null;
};

export async function POST(request: Request) {
  try {
    const user = await requireSession();

    const body = await request.json();

    const extraction = body.extraction as Extraction | undefined;
    const fileName =
      typeof body.fileName === "string" ? body.fileName : "curriculo.pdf";

    if (!extraction) {
      return NextResponse.json(
        { error: "Dados do currículo não foram enviados." },
        { status: 400 }
      );
    }

    const name = extraction.name?.trim();
    const email = extraction.email?.trim().toLowerCase();

    if (!name) {
      return NextResponse.json(
        { error: "O nome do candidato é obrigatório." },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "O e-mail do candidato é obrigatório." },
        { status: 400 }
      );
    }

    const existingCandidate = await db.candidate.findFirst({
      where: {
        organizationId: user.organizationId,
        email,
      },
    });

    if (existingCandidate) {
      return NextResponse.json(
        {
          error:
            "Já existe um candidato cadastrado com este e-mail.",
        },
        { status: 409 }
      );
    }

    const candidate = await db.candidate.create({
      data: {
        organizationId: user.organizationId,
        name,
        email,
        phone: extraction.phone || null,
        city: extraction.city || null,
        desiredRole: extraction.desiredRole || null,
        desiredRoles: extraction.desiredRoles || null,
        professionalSummary:
          extraction.professionalSummary ||
          extraction.summary ||
          null,
        birthDate: extraction.birthDate
          ? new Date(`${extraction.birthDate}T00:00:00`)
          : null,
        secondaryEmail: extraction.secondaryEmail || null,
        linkedin: extraction.linkedin || null,
        portfolio: extraction.portfolio || null,
        education: extraction.education || null,
        courses: extraction.courses || null,
        experience: extraction.experience || null,
        skills:
          extraction.skills && extraction.skills.length > 0
            ? extraction.skills.join(", ")
            : null,
        languages:
          extraction.languages && extraction.languages.length > 0
            ? extraction.languages.join(", ")
            : null,
        salaryExpectation:
          extraction.salaryExpectation !== null &&
          extraction.salaryExpectation !== undefined
            ? extraction.salaryExpectation
            : null,
        hasDriverLicense:
          extraction.hasDriverLicense !== null &&
          extraction.hasDriverLicense !== undefined
            ? extraction.hasDriverLicense
            : null,
        driverLicenseCategory:
          extraction.driverLicenseCategory || null,
        gender: extraction.gender || null,
        race: extraction.race || null,
        sexualOrientation:
          extraction.sexualOrientation || null,
        genderIdentity:
          extraction.genderIdentity || null,
        address: extraction.address || null,
        country: extraction.country || "Brasil",
        notes: null,
      },
    });

    const resume = await db.resume.create({
      data: {
        candidateId: candidate.id,
        fileName,
        aiSummary: JSON.stringify(extraction),
      },
    });



    revalidatePath("/candidates");

    return NextResponse.json(
      {
        success: true,
        candidate,
        resume,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao confirmar importação do currículo:", error);

    return NextResponse.json(
      {
        error: "Não foi possível cadastrar o candidato.",
      },
      { status: 500 }
    );
  }
}
