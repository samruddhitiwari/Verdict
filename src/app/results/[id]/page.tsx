import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Validation, PreliminarySignals, AIReasoning, ExternalValidation } from '@/lib/types'
import { generatePreliminarySignals } from '@/lib/prompts/judge'
import { UnlockButton } from './UnlockButton'
import { ExportButton } from './ExportButton'
import { ExternalPlaybook } from '@/components/ExternalPlaybook'
import { analyzeIdea } from '@/lib/ai/analyze'
import { AutoRefresh } from './AutoRefresh'

interface PageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{ success?: string; payment_id?: string }>
}

export default async function ResultsPage({ params, searchParams }: PageProps) {
    const { id } = await params
    const { success, payment_id } = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    // Handle payment success callback from Dodo
    if (success === 'true' && payment_id) {
        // Update payment status
        await supabase
            .from('payments')
            .update({ status: 'success' })
            .eq('id', payment_id)

        // Mark validation as paid
        await supabase
            .from('validations')
            .update({
                is_paid: true,
                payment_id: payment_id
            })
            .eq('id', id)

        // Trigger AI analysis in background (don't await)
        analyzeIdea(id).catch(error => {
            console.error('AI analysis error (background):', error)
        })

        // Redirect to clean URL to prevent re-processing on refresh
        redirect(`/results/${id}`)
    }

    const { data: validation } = await supabase
        .from('validations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!validation) {
        notFound()
    }

    const v = validation as Validation
    const isPaid = v.is_paid
    const hasVerdict = isPaid && v.verdict !== null

    // Generate preliminary signals for unpaid cases
    const signals: PreliminarySignals | null = !isPaid ? generatePreliminarySignals({
        idea_description: v.idea_description,
        target_user: v.target_user,
        pain_point: v.pain_point,
        willingness_to_pay: v.willingness_to_pay,
    }) : null

    const getSignalClass = (value: string) => {
        if (value === 'LOW' || value === 'UNCERTAIN' || value === 'ABSENT') return 'signal-low'
        if (value === 'MEDIUM' || value === 'WEAK' || value === 'PRESENT') return 'signal-medium'
        return 'signal-high'
    }

    return (
        <main className="section" style={{ minHeight: '100vh' }}>
            <div className="container-narrow">
                <Link href="/dashboard" className="mono text-muted mb-xl block" style={{ fontSize: '0.875rem' }}>
                    ← PAST JUDGMENTS
                </Link>

                {/* Case Header */}
                <div className="flex justify-between items-center mb-lg" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                    <span className="mono text-dim" style={{ fontSize: '0.75rem' }}>
                        CASE #{v.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span className="mono text-dim" style={{ fontSize: '0.75rem' }}>
                        {new Date(v.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </span>
                </div>

                <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-lg)', lineHeight: 1.4 }}>
                    {v.idea_description}
                </h1>

                {/* Case Details */}
                <div className="panel mb-xl">
                    <div className="mb-lg">
                        <span className="label">TARGET USER</span>
                        <p className="text-muted">{v.target_user}</p>
                    </div>
                    <div className="mb-lg">
                        <span className="label">PAIN POINT</span>
                        <p className="text-muted">{v.pain_point}</p>
                    </div>
                    {v.willingness_to_pay && (
                        <div>
                            <span className="label">WILLINGNESS TO PAY</span>
                            <p className="text-muted">{v.willingness_to_pay}</p>
                        </div>
                    )}
                </div>

                {/* Locked State - Before Payment */}
                {!isPaid && signals && (
                    <>
                        <div className="panel mb-xl" style={{ borderColor: 'var(--accent-orange)' }}>
                            <h3 className="mono mb-lg" style={{ fontSize: '0.875rem', color: 'var(--accent-orange)' }}>
                                PRELIMINARY SIGNALS DETECTED
                            </h3>

                            <div className="signal-item">
                                <span className="text-muted">Market clarity</span>
                                <span className={`signal-value ${getSignalClass(signals.market_clarity)}`}>
                                    {signals.market_clarity}
                                </span>
                            </div>
                            <div className="signal-item">
                                <span className="text-muted">Willingness to pay</span>
                                <span className={`signal-value ${getSignalClass(signals.willingness_to_pay)}`}>
                                    {signals.willingness_to_pay}
                                </span>
                            </div>
                            <div className="signal-item" style={{ borderBottom: 'none' }}>
                                <span className="text-muted">Competitive pressure</span>
                                <span className={`signal-value ${getSignalClass(signals.competitive_pressure)}`}>
                                    {signals.competitive_pressure}
                                </span>
                            </div>

                            <p className="text-dim mt-lg mono" style={{ fontSize: '0.75rem' }}>
                                FINAL JUDGMENT REQUIRES FULL REVIEW.
                            </p>
                        </div>

                        <UnlockButton validationId={v.id} />
                    </>
                )}

                {/* Unlocked State - After Payment */}
                {hasVerdict && (
                    <>
                        {/* Verdict Display */}
                        <div className="panel mb-xl" style={{
                            borderColor: v.verdict === 'SHIP' ? 'var(--accent-green)'
                                : v.verdict === 'VALIDATE' ? 'var(--accent-orange)'
                                    : 'var(--accent-red)'
                        }}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="label">FINAL VERDICT</span>
                                    <div
                                        className={`verdict-${v.verdict?.toLowerCase()}`}
                                        style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}
                                    >
                                        {v.verdict}
                                    </div>
                                </div>
                                <div className="score-display text-dim">
                                    {v.score}
                                </div>
                            </div>

                            {v.judgment_issued_at && (
                                <p className="text-dim mt-lg mono" style={{ fontSize: '0.75rem' }}>
                                    Judgment issued: {new Date(v.judgment_issued_at).toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>

                        {/* AI Reasoning */}
                        {v.ai_reasoning && (
                            <div className="terminal mb-xl">
                                <div className="mono text-dim mb-md" style={{ fontSize: '0.75rem' }}>
                                    JUDGE MEMO:
                                </div>
                                <p style={{ marginBottom: 'var(--space-lg)' }}>
                                    {(v.ai_reasoning as AIReasoning).summary}
                                </p>

                                <div className="mt-lg border-top" style={{ paddingTop: 'var(--space-lg)' }}>
                                    <div className="mb-lg">
                                        <span className="text-dim mono" style={{ fontSize: '0.75rem' }}>MARKET ANALYSIS:</span>
                                        <p className="mt-sm">{(v.ai_reasoning as AIReasoning).market_analysis}</p>
                                    </div>
                                    <div className="mb-lg">
                                        <span className="text-dim mono" style={{ fontSize: '0.75rem' }}>COMPETITIVE LANDSCAPE:</span>
                                        <p className="mt-sm">{(v.ai_reasoning as AIReasoning).competitive_landscape}</p>
                                    </div>
                                    <div className="mb-lg">
                                        <span className="text-dim mono" style={{ fontSize: '0.75rem' }}>EXECUTION RISK:</span>
                                        <p className="mt-sm">{(v.ai_reasoning as AIReasoning).execution_risk}</p>
                                    </div>
                                    <div>
                                        <span className="text-dim mono" style={{ fontSize: '0.75rem' }}>REVENUE POTENTIAL:</span>
                                        <p className="mt-sm">{(v.ai_reasoning as AIReasoning).revenue_potential}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Red Flags */}
                        {v.red_flags && v.red_flags.length > 0 && (
                            <div className="panel mb-xl" style={{ borderColor: 'var(--accent-red)' }}>
                                <span className="label" style={{ color: 'var(--accent-red)' }}>RED FLAGS</span>
                                <ul style={{ listStyle: 'none', padding: 0 }} className="mt-md">
                                    {v.red_flags.map((flag, i) => (
                                        <li key={i} className="mb-sm text-muted">
                                            <span className="verdict-kill">•</span> {flag}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Recommendations */}
                        {v.recommendations && v.recommendations.length > 0 && (
                            <div className="panel mb-xl">
                                <span className="label">REQUIRED ACTIONS</span>
                                <ul style={{ listStyle: 'none', padding: 0 }} className="mt-md">
                                    {v.recommendations.map((rec, i) => (
                                        <li key={i} className="mb-sm text-muted">
                                            <span className="text-dim">•</span> {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* External Signal Playbook */}
                        {v.external_validation && (
                            <ExternalPlaybook data={v.external_validation as ExternalValidation} />
                        )}

                        {/* Export & Footer */}
                        <div className="flex justify-between items-center mb-xl" style={{ flexWrap: 'wrap', gap: 'var(--space-lg)' }}>
                            <ExportButton validationId={v.id} />
                            <Link href="/validate" className="btn">
                                SUBMIT NEW CASE
                            </Link>
                        </div>

                        <p className="text-dim text-center mono" style={{ fontSize: '0.75rem' }}>
                            This judgment is final and based on the information provided.
                        </p>
                    </>
                )}

                {/* Pending State - Paid but no verdict yet */}
                {isPaid && !hasVerdict && (
                    <>
                        <AutoRefresh intervalMs={3000} />
                        <div className="panel text-center" style={{ padding: 'var(--space-3xl)' }}>
                            <div className="animate-pulse mb-lg">
                                <span className="mono text-dim" style={{ fontSize: '0.875rem' }}>
                                    ISSUING JUDGMENT...
                                </span>
                            </div>
                            <p className="text-muted">
                                Your case is being reviewed. This page will update automatically.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </main>
    )
}
