import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Validation } from '@/lib/types'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    const { data: validations } = await supabase
        .from('validations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const handleSignOut = async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/')
    }

    return (
        <main className="section" style={{ minHeight: '100vh' }}>
            <div className="container">
                <div className="flex justify-between items-center mb-2xl" style={{ flexWrap: 'wrap', gap: 'var(--space-lg)' }}>
                    <div>
                        <Link href="/" className="mono" style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                            VERDICT
                        </Link>
                    </div>
                    <div className="flex gap-lg items-center">
                        <span className="text-dim mono" style={{ fontSize: '0.75rem' }}>
                            {user.email}
                        </span>
                        <form action={handleSignOut}>
                            <button type="submit" className="btn" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                                SIGN OUT
                            </button>
                        </form>
                    </div>
                </div>

                <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-xl)' }}>
                    PAST JUDGMENTS
                </h1>

                {(!validations || validations.length === 0) ? (
                    <div className="panel" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
                        <p className="text-muted mb-xl">No cases submitted yet.</p>
                        <Link href="/validate" className="btn btn-primary">
                            SUBMIT YOUR FIRST CASE
                        </Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>DATE</th>
                                    <th>CASE NAME</th>
                                    <th>SCORE</th>
                                    <th>FINAL VERDICT</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(validations as Validation[]).map((v) => (
                                    <tr key={v.id}>
                                        <td className="text-dim">
                                            {new Date(v.created_at).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>
                                        <td>
                                            {v.idea_description.length > 50
                                                ? v.idea_description.substring(0, 50) + '...'
                                                : v.idea_description}
                                        </td>
                                        <td className="mono">
                                            {v.is_paid && v.score !== null ? v.score : '—'}
                                        </td>
                                        <td>
                                            {v.is_paid && v.verdict ? (
                                                <span className={`verdict-${v.verdict.toLowerCase()}`} style={{ fontWeight: 600 }}>
                                                    {v.verdict}
                                                </span>
                                            ) : (
                                                <span className="text-dim">PENDING</span>
                                            )}
                                        </td>
                                        <td className="text-right">
                                            <Link
                                                href={`/results/${v.id}`}
                                                className="mono text-muted"
                                                style={{ fontSize: '0.75rem' }}
                                            >
                                                VIEW →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-2xl">
                    <Link href="/validate" className="btn btn-primary">
                        SUBMIT NEW CASE
                    </Link>
                </div>
            </div>
        </main>
    )
}
