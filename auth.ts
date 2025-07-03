// src/auth.ts
import type { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './lib/prisma'
import { verifyPassword } from '@/lib/auth-utils'
import bcrypt from 'bcrypt'

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
    } & DefaultSession['user']
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email', 
          placeholder: 'email@example.com' 
        },
        password: { 
          label: 'Password', 
          type: 'password' 
        }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required')
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              role: true // Include if you have roles
            }
          })

          if (!user) {
            throw new Error('No user found with this email')
          }

          if (!user.password) {
            throw new Error('User has no password set')
          }

          const isValid = await verifyPassword(
            credentials.password,
            user.password
          )

          if (!isValid) {
            throw new Error('Incorrect password')
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role // Include if you have roles
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role // Include if you have roles
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
      }
      if (token?.role) {
        session.user.role = token.role // Include if you have roles
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // 24 hours
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
export const auth = () => NextAuth(authOptions)


// import { auth } from '@/auth';
// import { NextApiRequest, NextApiResponse } from 'next';
// import NextAuth from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import { PrismaAdapter } from '@next-auth/prisma-adapter';
// import {prisma} from './lib/prisma';
// import { verifyPassword } from './auth-utils';

// export const authOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         if (!credentials) return null;

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });

//         if (!user) return null;

//         const isValid = await verifyPassword(
//           credentials.password,
//           user.password
//         );

//         if (!isValid) return null;

//         return {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.sub;
//       }
//       return session;
//     },
//   },
//   session: {
//     strategy: 'jwt',
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// export default NextAuth(authOptions);

// export async function getCurrentUser() {
//   const session = await auth();
//   return session?.user;
// }