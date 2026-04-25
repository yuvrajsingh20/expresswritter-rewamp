import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
 * Utility to extract current authenticated user context in Server Actions/API
 */
export const getAuthUser = async () => {
    // 1. Try NextAuth JWT
    const req = {
        cookies: await cookies(),
        headers: {}, 
    };
    
    // getToken needs a 'headers' object but it works with cookies() on the server
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

    // 2. Fallback to custom 'token' cookie (if any)
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
