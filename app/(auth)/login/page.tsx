import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';

export default async function LoginPage() {
  let session;
  
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('Error fetching session:', error);
    session = null;
  }
  
  // If user is already authenticated, redirect based on role
  if (session?.user) {
    const role = session.user?.role ?? 'CLIENT';
    redirect(role === 'ADMIN' ? '/admin/users' : '/browse');
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Login
          </h1>
          <AuthForm isLogin />
        </div>
      </div>
    </div>
  );
}

// import { getServerSession } from 'next-auth';
// import { authOptions } from '../../api/auth/[...nextauth]/route';
// import { redirect } from 'next/navigation';
// import AuthForm from '@/components/auth/AuthForm';

// export default async function LoginPage() {
//   let session;

//   try {
//     session = await getServerSession(authOptions);
//   } catch (error) {
//     console.error('Error fetching session:', error);
//     session = null;
//   }

//   // Loading state - Display a loading spinner while the session is being fetched
//   if (session === undefined) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="loader mb-4"></div> {/* Replace with an actual spinner */}
//           <p>Loading...</p>
//         </div>
//       </div>
//     );
//   }


//   if (session?.user) {
//     const role = session.user?.role ?? 'CLIENT'; // Ensure role is defined
//     redirect(role === 'ADMIN' ? '/admin/users' : '/browse');
//   }

//   return (
//     <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
//       <div className="card p-4 shadow" style={{ width: '400px' }}>
//         <h1 className="text-center mb-4">Login</h1>
//         <AuthForm isLogin />
//       </div>
//     </div>
//   );
// }