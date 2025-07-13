import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add other providers here
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  session: {
    strategy: 'database',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Export authOptions for use in other files
// Note: This creates a separate module export that other files can import
export { authOptions };


// // app/api/auth/[...nextauth]/route.ts
// import NextAuth, { NextAuthOptions } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import bcrypt from 'bcryptjs';
// import prisma from '@/lib/db';

// // Enhanced type declarations
// declare module 'next-auth' {
//   interface User {
//     id: string;
//     email: string;
//     role: string;
//   }
  
//   interface Session {
//     user: {
//       id: string;
//       email: string;
//       role: string;
//       name?: string;
//     } & DefaultSession['user'];
//   }
// }

// declare module 'next-auth/jwt' {
//   interface JWT {
//     id: string;
//     email: string;
//     role: string;
//   }
// }

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: "Email", type: "email", placeholder: "email@example.com" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         try {
//           if (!credentials?.email || !credentials?.password) {
//             throw new Error('Email and password are required');
//           }

//           const user = await prisma.user.findUnique({
//             where: { email: credentials.email },
//             select: { 
//               id: true, 
//               email: true, 
//               password: true, 
//               role: true,
//               name: true 
//             },
//           });

//           if (!user) {
//             throw new Error('No user found with this email');
//           }

//           if (!user.password) {
//             throw new Error('This account has no password set');
//           }

//           const isValid = await bcrypt.compare(credentials.password, user.password);

//           if (!isValid) {
//             throw new Error('Incorrect password');
//           }

//           return {
//             id: user.id,
//             email: user.email,
//             name: user.name || null,
//             role: user.role || 'USER',
//           };
//         } catch (error) {
//           console.error('Authorization error:', error);
//           throw new Error('Authentication failed');
//         }
//       }
//     })
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         token.role = user.role;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id;
//         session.user.email = token.email;
//         session.user.role = token.role;
//       }
//       return session;
//     }
//   },
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   debug: process.env.NODE_ENV === 'development',
//   pages: {
//     signIn: '/auth/login',
//     error: '/auth/login',
//     signOut: '/auth/logout'
//   },
//   events: {
//     async signIn({ user }) {
//       console.log(`User ${user.email} signed in`);
//     },
//     async signOut({ token }) {
//       console.log(`User ${token.email} signed out`);
//     }
//   }
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };




// // app/api/auth/[...nextauth]/route.ts
// // import NextAuth from 'next-auth';
// // import { authOptions } from '@/lib/authOptions'; // Import the authOptions from the separate file

// // const handler = NextAuth(authOptions);

// // export { handler as GET, handler as POST };




// import NextAuth, { NextAuthOptions } from 'next-auth'

// import CredentialsProvider from 'next-auth/providers/credentials'
// import bcrypt from 'bcryptjs'
// import prisma from '@/lib/db'

// declare module 'next-auth' {
//   interface User {
//     id: string
//     email: string
//     role: string
//   }
  
//   interface Session {
//     user: {
//       id: string
//       email: string
//       role: string
//     }
//   }
// }

// declare module 'next-auth/jwt' {
//   interface JWT {
//     id: string
//     role: string
//   }
// }

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error('Email and password are required')
//         }

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//           select: { id: true, email: true, password: true, role: true },
//         })

//         if (!user) {
//           throw new Error('Invalid credentials')
//         }

//         const isValid = await bcrypt.compare(credentials.password, user.password)

//         if (!isValid) {
//           throw new Error('Invalid credentials')
//         }

//         return {
//           id: user.id.toString(),
//           email: user.email,
//           role: user.role || 'USER',
//         }
//       }
//     })
//   ],

//   // pages/api/auth/[...nextauth].ts
// callbacks: {
//   async session({ session, token }) {
//     if (token.role) {
//       session.user.role = token.role;
//     }
//     return session;
//   },
//   async jwt({ token, user }) {
//     if (user?.role) {
//       token.role = user.role;
//     }
//     return token;
//   }
// },

//   // callbacks: {
//   //   async jwt({ token, user }) {
//   //     if (user) {
//   //       token.id = user.id
//   //       token.role = user.role
//   //     }
//   //     return token
//   //   },
//   //   async session({ session, token }) {
//   //     session.user = {
//   //       id: token.id as string,
//   //       email: session.user?.email || '',
//   //       role: token.role as string,
//   //     }
//   //     return session
//   //   }
//   // },
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: '/auth/login',
//     error: '/auth/login'
//   }
// }

// const handler = NextAuth(authOptions)
// export { handler as GET, handler as POST }