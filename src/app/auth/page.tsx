'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthPage() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        const supabase = createClient()

        if (mode === 'signup') {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) {
                setError(error.message)
            } else {
                setMessage('Check your email to confirm your account.')
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) {
                setError(error.message)
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        }

        setLoading(false)
    }

    const handleGoogleSignIn = async () => {
        setLoading(true)
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <main className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <div className="container-narrow">
                <Link href="/" className="mono text-muted mb-xl block" style={{ fontSize: '0.875rem' }}>
                    ← VERDICT
                </Link>

                <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-xl)' }}>
                    {mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="mb-lg">
                        <label className="label" htmlFor="email">EMAIL</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="mb-lg">
                        <label className="label" htmlFor="password">PASSWORD</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="terminal mb-lg" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="terminal mb-lg" style={{ borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full mb-md"
                        disabled={loading}
                    >
                        {loading ? 'PROCESSING...' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                    </button>
                </form>

                <div className="flex items-center gap-md mb-md" style={{ marginTop: 'var(--space-lg)' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span className="text-dim mono" style={{ fontSize: '0.75rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="btn w-full"
                    disabled={loading}
                >
                    CONTINUE WITH GOOGLE
                </button>

                <div className="mt-xl text-center">
                    <button
                        type="button"
                        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        className="text-muted mono"
                        style={{
                            fontSize: '0.875rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </main>
    )
}
