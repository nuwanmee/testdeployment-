import AuthForm from '@/components/auth/AuthForm'

export default function RegisterPage() {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: '400px' }}>
        <h1 className="text-center mb-4">Register</h1>
        <AuthForm isLogin={false} />
      </div>
    </div>
  )
}

