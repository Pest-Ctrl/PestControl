import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { SignJWT, jwtVerify } from "jose";

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
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: "Repository Importer", // Default role for GitHub users
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
        
        const user = DUMMY_USERS.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          return { id: user.email, name: user.name, email: user.email, role: user.role };
        }
        return null;
      }
    })
  ],
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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
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
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
