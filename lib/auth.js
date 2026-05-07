import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your_secret_key';

/**
 * Standard password hashing using cost factor of 12 for high security
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare plain text password with stored hash securely
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
export const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
/**
 * Sign a new JWT token for custom session management
 */
export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Utility to extract current authenticated user context in Server Actions/API
 */
export const getAuthUser = async () => {
    // 1. Try NextAuth JWT
    const req = {
        cookies: await cookies(),
        headers: {}, 
    };
    
    const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
    });

    if (token) {
        return {
            id: token.id || token.sub,
            role: token.role,
            name: token.name,
            email: token.email
        };
    }

    const cookieStore = await cookies();
    const customToken = cookieStore.get('token')?.value;
    if (customToken) {
        try {
            return jwt.verify(customToken, process.env.JWT_SECRET || 'your_secret_key');
        } catch (e) {
            return null;
        }
    }

    return null;
};


export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: profile.role ?? "STUDENT",
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user || !user.password) return null;
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch (error) {
          return null;
        }
      }
    })
  ],
  session: { strategy: "jwt" },
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
      }
      return session;
    }
  },
  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
