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
        const currentUser = await db.user.findUnique({
          where: { id: token.id as string },
          include: { organization: true },
        });

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
      }

      return session;
    },
  },
};

/** Helper para pegar a sessão atual em Server Components / Route Handlers */
export function getSession() {
  return getServerSession(authOptions);
}

/**
 * Garante que existe uma sessão autenticada e retorna os dados do usuário
 * já com organizationId — usar em toda página/rota protegida para
 * garantir o isolamento multi-tenant.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session?.user?.organizationId) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user as {
    id: string;
    name: string;
    email: string;
    role: string;
    organizationId: string;
    organizationName: string;
  };
}
