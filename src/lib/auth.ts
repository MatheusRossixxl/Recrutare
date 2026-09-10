import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
            include: { organization: true },
          });
          if (!user) return null;
          if (!user.active) return null;

          const valid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            organizationName: user.organization.name,
          };
        } catch {
          // DB fora do ar (ex.: Worker sem conexão): falha vira
          // CredentialsSignin, nunca 500 com HTML.
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.organizationName = user.organizationName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        // Base: claims do JWT (sempre disponíveis, sem DB).
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "";
        session.user.organizationId = (token.organizationId as string) ?? "";
        session.user.organizationName = (token.organizationName as string) ?? "";

        try {
          const currentUser = await db.user.findUnique({
            where: { id: token.id as string },
            include: { organization: true },
          });

          // Usuário removido/desativado: limpa a sessão.
          if (!currentUser || !currentUser.active) {
            session.user.id = "";
            session.user.name = "";
            session.user.email = "";
            session.user.role = "";
            session.user.organizationId = "";
            session.user.organizationName = "";
            return session;
          }

          session.user.id = currentUser.id;
          session.user.name = currentUser.name;
          session.user.email = currentUser.email;
          session.user.role = currentUser.role;
          session.user.organizationId = currentUser.organizationId;
          session.user.organizationName = currentUser.organization.name;
        } catch {
          // DB fora do ar: mantém claims do JWT em vez de estourar 500.
        }
      }

      return session;
    },
  },
};

/** Helper para pegar a sessão atual em Server Components / Route Handlers */
export function getSession() {
  return getServerSession(authOptions);
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string;
};

/**
 * Uso em Server Components / Server Actions (páginas).
 * Sem sessão válida → redirect("/login"), nunca estoura erro na tela.
 */
export async function requireSession(): Promise<SessionUser> {
  const { redirect } = await import("next/navigation");
  const user = (await getSession())?.user;
  if (!user?.id || !user.organizationId) {
    redirect("/login");
  }
  return user as SessionUser;
}

/**
 * Uso em Route Handlers (API).
 * Sem sessão válida → throw, rota captura e responde 401 JSON.
 * Nunca usar em páginas: throw em Server Component vira error.tsx/500.
 */
export async function requireApiSession(): Promise<SessionUser> {
  const user = (await getSession())?.user;
  if (!user?.id || !user.organizationId) {
    throw new Error("UNAUTHORIZED");
  }
  return user as SessionUser;
}
