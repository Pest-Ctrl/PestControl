import NextAuth, { type Session } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { prisma } from "@/lib/db";
import { toSchemaRole } from "@/lib/roles";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: { params: { scope: "read:user user:email repo" } },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email || (profile.login ? `${profile.login}@users.noreply.github.com` : null),
          image: profile.avatar_url,
          role: "Developer", // Default role, will be overridden by DB
        };
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        try {
          const dbUser = await prisma.users.findUnique({ where: { Email: email } });
          if (!dbUser) return null;

          const passHash = dbUser.PassHash || dbUser.passHash;
          if (!passHash || typeof passHash !== "string") return null;

          const bcrypt = await import("bcryptjs");
          const isValid = await bcrypt.compare(password, passHash);
          if (!isValid) return null;

          return {
            id: dbUser.UserID || dbUser.UserId || dbUser.id,
            name: dbUser.Username || dbUser.username || email.split("@")[0],
            email: dbUser.Email || dbUser.email || email,
            role: toSchemaRole(dbUser.Role || dbUser.role),
          };
        } catch (err) {
          console.error("Database authentication error:", err);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  jwt: {
    async encode({ secret, token }) {
      if (!token) return "";
      return await new SignJWT(token as JWTPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(new TextEncoder().encode(secret as string));
    },
    async decode({ secret, token }) {
      if (!token) return null;
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret as string));
        return payload;
      } catch {
        return null;
      }
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github') {
        if (!user.email) {
          console.error("GitHub sign-in failed: missing email address");
          return false;
        }

        const email = user.email.trim().toLowerCase();
        const username = (user.name || email.split('@')[0]).trim();

        try {
          let dbUser = await prisma.users.findUnique({ where: { Email: email } });
          if (!dbUser) {
            dbUser = await prisma.users.create({
              data: {
                Email: email,
                Username: username,
                Role: 'Developer',
                GHOAuth: account.access_token || null,
              }
            });
            if (!dbUser) {
              dbUser = await prisma.users.findUnique({ where: { Email: email } });
            }
          } else if (account.access_token) {
            // Always update GHOAuth to keep the access token fresh
            const updated = await prisma.users.update({
              where: { UserID: dbUser.UserID || dbUser.UserId || dbUser.id },
              data: { GHOAuth: account.access_token }
            });
            if (updated) dbUser = updated;
          }

          if (!dbUser) {
            console.error("Failed to create or sync GitHub user with DB:", email);
            return false;
          }

          user.id = String(dbUser.UserID || dbUser.UserId || dbUser.id);
          user.role = toSchemaRole(dbUser.Role || dbUser.role);
          user.name = dbUser.Username || dbUser.username || username;
        } catch (err) {
          console.error("Could not sync OAuth user with DB:", err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && account.provider === 'github') {
        token.githubToken = account.access_token;
      }

      if (user) {
        token.sub = user.id || token.sub;
        token.role = toSchemaRole(user.role || 'Developer');
        if (user.name) {
          token.name = user.name;
        }
      } else if (token.sub) {
        try {
          const dbUser = await prisma.users.findUnique({ where: { UserID: token.sub } });
          if (dbUser?.Role) {
            token.role = toSchemaRole(dbUser.Role);
          }
        } catch {
          // Keep existing token.role if lookup fails
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.role) {
        session.user.role = toSchemaRole(token.role as string);
      }
      if (typeof token.githubToken === 'string') {
        (session as Session & { githubToken?: string }).githubToken = token.githubToken;
      }
      return session;
    },
  }
});

