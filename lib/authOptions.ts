// lib/authOptions.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    role: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, password: true, role: true },
        })
        
        if (!user) {
          throw new Error('Invalid credentials')
        }
        
        const isValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isValid) {
          throw new Error('Invalid credentials')
        }
        
        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role || 'USER',
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: session.user?.email || '',
        role: token.role as string,
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/login',
    error: '/auth/login'
  }
}

export default authOptions;


// // lib/authOptions.ts
// import type { NextAuthOptions } from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import bcrypt from 'bcryptjs';
// import prisma from '@/lib/prisma'; // Ensure this path to your Prisma client is correct

// export const authOptions: NextAuthOptions = {
//   secret: process.env.NEXTAUTH_SECRET,
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//     }),
//     CredentialsProvider({
//       name: 'Credentials',
//       async authorize(credentials, req) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });

//         if (!user) {
//           return null;
//         }

//         const isPasswordValid = await bcrypt.compare(
//           credentials.password,
//           user.password
//         );

//         if (isPasswordValid) {
//           return {
//             id: user.id.toString(), // Ensure ID is a string for session
//             name: user.firstName + ' ' + user.lastName,
//             email: user.email,
//             role: user.role,
//             // Add any other user properties you want in the session
//           };
//         }

//         return null;
//       },
//     }),
//     // Add other providers here (e.g., FacebookProvider, etc.)
//   ],
//   session: {
//     strategy: 'jwt', // Use JWT for session management
//   },
//   jwt: {
//     secret: process.env.JWT_SECRET, // Optional, but recommended for JWT
//   },
//   callbacks: {
//     async jwt({ token, user, account, profile }) {
//       // Persist the role in the token during sign in
//       if (user) {
//         token.role = user.role;
//         token.id = user.id.toString(); // Ensure ID is in the token
//       }
//       return token;
//     },
//     async session({ session, token, user }) {
//       // Add role and id to the session object so it's available client-side
//       if (token) {
//         session.user.role = token.role as string;
//         session.user.id = token.id as string;
//       }
//       return session;
//     },
//     // You can add other callbacks here (signIn, redirect, etc.)
//   },
//   pages: {
//     signIn: '/login', // Custom sign-in page
//     // error: '/auth/error', // Custom error page
//   },
// };