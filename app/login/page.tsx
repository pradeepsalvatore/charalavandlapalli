'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setLoading(true)
    setError('')

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)

      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin/members')
    router.refresh()
  }

  return (
    <main className="login-page">

      <section className="login-hero">
        <div className="container">

          <span className="section-label">
            CHARALAVANDLAPALLI COMMUNITY
          </span>

          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to access your community account.
          </p>

        </div>
      </section>

      <section className="section">

        <div className="container">

          <div className="login-wrapper">

            <div className="login-card">

              <div className="login-heading">

                <span className="section-label">
                  MEMBER LOGIN
                </span>

                <h2>
                  Sign in
                </h2>

                <p>
                  Administrators can access the village
                  administration area after signing in.
                </p>

              </div>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="login-form"
              >

                <div className="form-field">

                  <label htmlFor="email">
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />

                </div>

                <div className="form-field">

                  <label htmlFor="password">
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />

                </div>

                <button
                  type="submit"
                  className="btn primary login-submit"
                  disabled={loading}
                >
                  {loading
                    ? 'Signing in...'
                    : 'Sign In →'}
                </button>

              </form>

              <div className="login-footer">

                <p>
                  Not registered yet?
                </p>

                <Link href="/register">
                  Join the community →
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  )
}