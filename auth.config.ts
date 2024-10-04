import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

import { User } from './app/lib/definitions';


async function getUserByEmail(email: string) {
   try {
    const user = await sql<User>`
        SELECT * FROM users WHERE email = ${email}
    `;
    return user.rows[0];
   } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
   }
}

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized: ({ auth, request: { nextUrl } }) => {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redireciona usuários não autenticados para a página de login
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        jwt: async ({ token, user }) => {
            if (user) {
                token.userId = user.id;
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (token?.userId) {
                session.user = { ...session.user, id: token.userId as string };
            }
            return session;
        },
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                .object({email: z.string().email(),password: z.string().min(6),})
                .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUserByEmail(email);
                    if (!user) return null;
                    const passwordMatch = await bcrypt.compare(password, user.password);
                    if (passwordMatch) return user;
                }   
                console.log('Invalid email or password');
                return null;
            }      
        })
],
} satisfies NextAuthConfig;
