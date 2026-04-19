import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Auth: Missing credentials");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            console.error(`Auth: User not found - ${credentials.email}`);
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log(`Auth: Password check for ${credentials.email} -> ${isValid}`);

          if (!isValid) {
            console.error(`Auth: Invalid password for - ${credentials.email}`);
            return null;
          }

          console.log(`Auth: Successful login - ${credentials.email} (${user.role})`);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("AUTH ERROR:", error);
          return null;
        }
      }
    })
  ],

  session: {
    strategy: "jwt"
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        console.log("Auth: Session created for", session.user.email);
      }
      return session;
    }
  },

  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors back to login with query param
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
