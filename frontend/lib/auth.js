import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession } from "next-auth";
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
/**
 * Sign a new JWT token for custom session management
 */
export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Utility to extract current authenticated user context in Server Actions/API
 */
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
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user || !user.password) return null;
          
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;
          
          /*
          if (!user.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }
          */
          
          // Check role mismatch
          const requestedRole = credentials.role;
          if (requestedRole === 'writer' && user.role === 'STUDENT') {
            throw new Error("ROLE_MISMATCH_STUDENT");
          }
          if (requestedRole === 'client' && user.role === 'FREELANCER') {
            throw new Error("ROLE_MISMATCH_WRITER");
          }
          
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch (error) {
          if (error.message === "EMAIL_NOT_VERIFIED" || error.message.startsWith("ROLE_MISMATCH")) {
            throw error;
          }
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

export const getAuthUser = async (req) => {
    // 1. Try NextAuth JWT
    console.log("getAuthUser: Checking token with req...");
    const token = await getToken({ 
        req, 
        secret: JWT_SECRET 
    });
    console.log("getAuthUser: Token found:", token ? "YES" : "NO");
    
    if (token) {
        console.log("getAuthUser: Returning token user:", token.email);
        return {
            id: token.id || token.sub,
            role: token.role,
            name: token.name,
            email: token.email
        };
    }

    // 2. Fallback to custom token in cookies (if any)
    const cookieStore = await cookies();
    const customToken = cookieStore.get('token')?.value;
    console.log("getAuthUser: Custom token found:", customToken ? "YES" : "NO");
    
    if (customToken) {
        try {
            const decoded = jwt.verify(customToken, JWT_SECRET);
            console.log("getAuthUser: Returning decoded custom token for:", decoded.email);
            return decoded;
        } catch (e) {
            console.log("getAuthUser: Custom token verification failed:", e.message);
            return null;
        }
    }

    console.log("getAuthUser: No auth found");
    return null;
};
