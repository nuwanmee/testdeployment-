'use client'

import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'

export default function AuthForm({ isLogin }: { isLogin: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        })

        if (result?.error) {
          setError(result.error)
        } else {
          // No need to specify redirect URL here, let the server handle it
          // based on the user's role in the login/page.tsx file
          router.refresh() // Refresh to update session state
        }
      } else {
        // First validate passwords on client side
        if (password !== password2) {
          setError('Passwords do not match')
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, password2 }),
        })

        const data = await response.json()

        if (response.ok) {
          // Auto sign in after successful registration
          const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
          })

          if (result?.error) {
            setError(result.error)
          } else {
            // Use router.refresh() to get the updated session and let the server handle redirection
            router.refresh()
          }
        } else {
          setError(data.error || 'Registration failed')
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {!isLogin && (
        <div className="mb-3">
          <label htmlFor="password2" className="form-label">
            Confirm Password
          </label>
          <input
            id="password2"
            name="password2"
            type="password"
            required
            className="form-control"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            disabled={isLoading}
          />
        </div>
      )}

      <button 
        type="submit" 
        className="btn btn-primary w-100"
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
      </button>

      <div className="text-center mt-3">
        {isLogin ? (
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-decoration-none">
              Register
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-decoration-none">
              Login
            </Link>
          </p>
        )}
      </div>
    </form>
  )
}