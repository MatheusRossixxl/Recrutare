import { db } from "@/lib/db";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/google/callback";
const GOOGLE_SCOPES = "https://www.googleapis.com/auth/calendar.events";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

interface GoogleInterviewData {
  id: string;
  scheduledAt: Date;
  type: string;
  meetingLink?: string | null;
  notes?: string | null;
  candidate: { name: string; email: string };
  job: { title: string };
}

/**
 * Gera URL OAuth do Google para o usuário conectar seu calendário.
 */
export function getGoogleAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state: userId,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

/**
 * Troca authorization code por access/refresh tokens.
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Falha ao obter tokens do Google");
  }

  return response.json();
}

/**
 * Renova access token usando refresh token.
 */
export async function refreshAccessToken(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.googleRefreshToken) return null;

  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: user.googleRefreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      // Token inválido — desconectar silenciosamente
      await disconnectGoogle(userId);
      return null;
    }

    const data = await response.json();

    await db.user.update({
      where: { id: userId },
      data: { googleAccessToken: data.access_token },
    });

    return data.access_token;
  } catch {
    await disconnectGoogle(userId);
    return null;
  }
}

/**
 * Obtém access token válido (renova se necessário).
 */
async function getValidAccessToken(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.googleAccessToken) return null;

  return user.googleAccessToken;
}

/**
 * Desconecta Google do usuário (limpa tokens).
 */
export async function disconnectGoogle(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: {
      googleAccessToken: null,
      googleRefreshToken: null,
      googleCalendarId: null,
      googleConnectedAt: null,
    },
  });
}

/**
 * Cria evento no Google Calendar.
 */
export async function createCalendarEvent(
  userId: string,
  interview: GoogleInterviewData
): Promise<string | null> {
  const token = await getValidAccessToken(userId);
  if (!token) return null;

  const startTime = new Date(interview.scheduledAt);
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 60); // 1h padrão

  const event = {
    summary: `Entrevista: ${interview.candidate.name} — ${interview.job.title}`,
    description: [
      `Candidato: ${interview.candidate.name}`,
      `Email: ${interview.candidate.email}`,
      `Vaga: ${interview.job.title}`,
      `Tipo: ${interview.type}`,
      interview.meetingLink ? `Link: ${interview.meetingLink}` : "",
      interview.notes ? `Notas: ${interview.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    start: {
      dateTime: startTime.toISOString(),
      timeZone: "America/Sao_Paulo",
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: "America/Sao_Paulo",
    },
    ...(interview.meetingLink
      ? { conferenceData: { createRequest: { requestId: interview.id } } }
      : {}),
  };

  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_URL}?conferenceDataVersion=1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    // 401 = token expirado: tenta renovar e repetir UMA vez.
    if (response.status === 401) {
      const newToken = await refreshAccessToken(userId);
      if (!newToken) return null;

      const retryResponse = await fetch(
        `${GOOGLE_CALENDAR_URL}?conferenceDataVersion=1`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (!retryResponse.ok) {
        const errorBody = await retryResponse.text().catch(() => "sem detalhes");
        console.error("[Google Calendar] Erro no retry:", retryResponse.status, errorBody);
        return null;
      }
      const retryData = await retryResponse.json();
      return retryData.id || null;
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "sem detalhes");
      console.error("[Google Calendar] Erro na API:", response.status, errorBody);
      return null;
    }

    const data = await response.json();
    return data.id || null;
  } catch (error) {
    console.error("[Google Calendar] Erro ao criar evento:",
      error instanceof Error ? error.message : "erro desconhecido");
    return null;
  }
}

/**
 * Atualiza evento no Google Calendar.
 */
export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  interview: GoogleInterviewData
): Promise<boolean> {
  const token = await getValidAccessToken(userId);
  if (!token) return false;

  const startTime = new Date(interview.scheduledAt);
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 60);

  const event = {
    summary: `Entrevista: ${interview.candidate.name} — ${interview.job.title}`,
    description: [
      `Candidato: ${interview.candidate.name}`,
      `Email: ${interview.candidate.email}`,
      `Vaga: ${interview.job.title}`,
      `Tipo: ${interview.type}`,
      interview.meetingLink ? `Link: ${interview.meetingLink}` : "",
      interview.notes ? `Notas: ${interview.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    start: {
      dateTime: startTime.toISOString(),
      timeZone: "America/Sao_Paulo",
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: "America/Sao_Paulo",
    },
  };

  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_URL}/${eventId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (response.status === 401) {
      const newToken = await refreshAccessToken(userId);
      if (!newToken) return false;

      const retryResponse = await fetch(
        `${GOOGLE_CALENDAR_URL}/${eventId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      return retryResponse.ok;
    }

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Deleta evento do Google Calendar.
 */
export async function deleteCalendarEvent(
  userId: string,
  eventId: string
): Promise<boolean> {
  const token = await getValidAccessToken(userId);
  if (!token) return false;

  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_URL}/${eventId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 401) {
      const newToken = await refreshAccessToken(userId);
      if (!newToken) return false;

      const retryResponse = await fetch(
        `${GOOGLE_CALENDAR_URL}/${eventId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${newToken}` },
        }
      );

      return retryResponse.ok || retryResponse.status === 404;
    }

    return response.ok || response.status === 404;
  } catch {
    return false;
  }
}

/**
 * Verifica se o usuário tem Google Calendar conectado.
 */
export async function isGoogleConnected(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { id: userId } });
  const connected = !!(user?.googleAccessToken && user?.googleRefreshToken);
  return connected;
}
