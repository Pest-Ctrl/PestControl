import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db";

const DUMMY_USERS = [
  { email: 'test01@gmail.com', password: 'password@1', name: 'Test User 01', role: 'Developer' },
  { email: 'test02@gmail.com', password: 'password@2', name: 'Test User 02', role: 'QA Engineer' },
  { email: 'admin@gmail.com',  password: 'admin@123',  name: 'Admin User',   role: 'Project Manager' },
  { email: 'importer@gmail.com', password: 'password@3', name: 'Importer User', role: 'Repository Importer' }
];

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
          email: profile.email,
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
        
        const dummyUser = DUMMY_USERS.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (dummyUser) {
          let dbUser = await prisma.users.findUnique({ where: { Email: dummyUser.email } });
          if (!dbUser) {
            dbUser = await prisma.users.create({
              data: {
                Email: dummyUser.email,
                Username: dummyUser.name,
                Role: dummyUser.role,
                PassHash: "dummy"
              }
            });
          }
          return { id: dbUser.UserID, name: dbUser.Username, email: dbUser.Email, role: dbUser.Role };
        }
        return null;
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
      return await new SignJWT(token as any)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(new TextEncoder().encode(secret as string));
    },
    async decode({ secret, token }) {
      if (!token) return null;
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret as string));
        return payload as any;
      } catch (e) {
        return null;
      }
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && account.provider === 'github') {
        token.githubToken = account.access_token;
      }
      
      if (user && user.email) {
        let dbUser = await prisma.users.findUnique({ where: { Email: user.email } });
        if (!dbUser) {
          dbUser = await prisma.users.create({
            data: {
              Email: user.email,
              Username: user.name || user.email.split('@')[0],
              Role: account?.provider === 'github' ? 'Developer' : (user.role || 'Developer'),
              GHOAuth: account?.provider === 'github' ? account.providerAccountId : null
            }
          });
        }
        token.sub = dbUser.UserID;
        token.role = dbUser.Role;
      } else if (token.sub) {
        // Fetch fresh role from DB to instantly reflect role changes
        const dbUser = await prisma.users.findUnique({ where: { UserID: token.sub } });
        if (dbUser) {
          token.role = dbUser.Role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.role) {
        session.user.role = token.role as string;
      }
      if (token.githubToken) {
        (session as any).githubToken = token.githubToken;
      }
      return session;
    },
  }
});
