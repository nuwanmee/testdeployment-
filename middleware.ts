import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log(`[${request.method}] ${request.nextUrl.pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};

// import { NextResponse } from 'next/server'
// import { withAuth } from 'next-auth/middleware'
// import { roles } from '@/lib/constants'

// export default withAuth({
//   callbacks: {
//     authorized: ({ token, req }) => {
//       const pathname = new URL(req.url).pathname

//       // Public routes
//       if (['/auth/login', '/auth/register', '/'].includes(pathname)) {
//         return true
//       }

//       // Admin routes
//       if (pathname.startsWith('/admin')) {
//         return token?.role === roles.admin
//       }

//       // User routes
//       if (pathname.startsWith('/user')) {
//         return !!token
//       }

//       // Default allow for other routes (adjust as needed)
//       return true
//     },
//   },
//   pages: {
//     signIn: '/auth/login',
//     error: '/auth/login'
//   }
// })

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)'
//   ]
// }

// // src/middleware.ts
// // import NextAuth from 'next-auth';
// // import { authConfig } from './auth';

// // export default NextAuth(authConfig).auth;

// // export const config = {
// //   matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
// // };