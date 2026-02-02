'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type SimulationStep =
    | 'intro'
    | 'payment'
    | 'evaluation'
    | 'aggregating'
    | 'verdict'
    | 'breakdown'
    | 'exit'

interface VerdictSimulationProps {
    isOpen: boolean
    onClose: () => void
}

const EVALUATION_LINES = [
    { text: 'Evaluating pain severity...', delay: 800 },
    { text: '→ Score: 14 / 25', isResult: true, delay: 600 },
    { text: '', delay: 400 },
    { text: 'Analyzing market frequency...', delay: 800 },
    { text: '→ Score: 11 / 25', isResult: true, delay: 600 },
    { text: '', delay: 400 },
    { text: 'Assessing existing alternatives...', delay: 800 },
    { text: '→ Multiple strong substitutes detected', isResult: true, delay: 600 },
    { text: '', delay: 400 },
    { text: 'Evaluating willingness to pay...', delay: 800 },
    { text: '→ Weak signal', isResult: true, delay: 600 },
]

export function VerdictSimulation({ isOpen, onClose }: VerdictSimulationProps) {
    const [step, setStep] = useState<SimulationStep>('intro')
    const [evaluationLines, setEvaluationLines] = useState<string[]>([])
    const [currentLineIndex, setCurrentLineIndex] = useState(0)
    const [showCursor, setShowCursor] = useState(false)
    const [flashClass, setFlashClass] = useState('')

    // Reset when closed
    useEffect(() => {
        if (!isOpen) {
            setStep('intro')
            setEvaluationLines([])
            setCurrentLineIndex(0)
            setShowCursor(false)
            setFlashClass('')
        }
    }, [isOpen])

    // Handle evaluation animation
    useEffect(() => {
        if (step !== 'evaluation') return
        if (currentLineIndex >= EVALUATION_LINES.length) {
            // Move to aggregating
            setTimeout(() => setStep('aggregating'), 500)
            return
        }

        const line = EVALUATION_LINES[currentLineIndex]
        const timer = setTimeout(() => {
            if (line.text) {
                setEvaluationLines(prev => [...prev, line.text])
            } else {
                setEvaluationLines(prev => [...prev, ''])
            }
            setCurrentLineIndex(prev => prev + 1)
        }, line.delay)

        return () => clearTimeout(timer)
    }, [step, currentLineIndex])

    // Handle aggregating pause
    useEffect(() => {
        if (step !== 'aggregating') return
        setShowCursor(true)
        const timer = setTimeout(() => {
            setShowCursor(false)
            setFlashClass('verdict-flash-kill')
            setStep('verdict')
        }, 1500)
        return () => clearTimeout(timer)
    }, [step])

    // Handle verdict to breakdown transition
    useEffect(() => {
        if (step !== 'verdict') return
        const timer = setTimeout(() => {
            setFlashClass('')
            setStep('breakdown')
        }, 2000)
        return () => clearTimeout(timer)
    }, [step])

    const startSimulation = useCallback(() => {
        setStep('payment')
    }, [])

    const startEvaluation = useCallback(() => {
        setStep('evaluation')
        setEvaluationLines([])
        setCurrentLineIndex(0)
    }, [])

    const goToExit = useCallback(() => {
        setStep('exit')
    }, [])

    if (!isOpen) return null

    return (
        <div className={`simulation-overlay ${flashClass}`}>
            <div className="simulation-content" style={{ textAlign: 'center', maxWidth: '600px' }}>

                {/* Step 1: Intro */}
                {step === 'intro' && (
                    <>
                        <h1 className="mono" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--fg-muted)', marginBottom: 'var(--space-xl)' }}>
                            VERDICT SIMULATION
                        </h1>
                        <p style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>
                            This is a real judgment flow.
                        </p>
                        <p className="text-muted" style={{ marginBottom: 'var(--space-2xl)' }}>
                            No encouragement. No retries.
                        </p>
                        <button onClick={startSimulation} className="btn btn-primary">
                            BEGIN SIMULATION
                        </button>
                        <button
                            onClick={onClose}
                            className="btn mt-lg"
                            style={{ background: 'transparent', border: 'none' }}
                        >
                            CANCEL
                        </button>
                    </>
                )}

                {/* Step 2: Fake Payment */}
                {step === 'payment' && (
                    <>
                        <div className="mono" style={{
                            fontSize: '0.75rem',
                            letterSpacing: '0.1em',
                            color: 'var(--accent-green)',
                            marginBottom: 'var(--space-lg)'
                        }}>
                            PAYMENT RECEIVED
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
                            $7 — FINAL JUDGMENT
                        </div>
                        <p className="text-dim mono" style={{ fontSize: '0.75rem', marginBottom: 'var(--space-2xl)' }}>
                            Simulation only. No charge.
                        </p>
                        <button onClick={startEvaluation} className="btn btn-primary">
                            CONTINUE
                        </button>
                    </>
                )}

                {/* Step 3: Evaluation Animation */}
                {step === 'evaluation' && (
                    <div style={{ textAlign: 'left', width: '100%' }}>
                        <div className="mono" style={{
                            fontSize: '0.75rem',
                            letterSpacing: '0.1em',
                            color: 'var(--fg-muted)',
                            marginBottom: 'var(--space-lg)'
                        }}>
                            EXECUTING JUDGMENT
                        </div>
                        <div className="terminal" style={{ minHeight: '300px' }}>
                            {evaluationLines.map((line, i) => (
                                <div
                                    key={i}
                                    className={line.startsWith('→') ? 'evaluation-text' : ''}
                                    style={{ minHeight: '1.5em' }}
                                >
                                    {line}
                                </div>
                            ))}
                            <span className="cursor-blink" />
                        </div>
                    </div>
                )}

                {/* Step 4: Aggregating */}
                {step === 'aggregating' && (
                    <>
                        <div className="mono evaluation-text" style={{ fontSize: '1rem', letterSpacing: '0.1em' }}>
                            AGGREGATING SIGNALS
                            {showCursor && <span className="cursor-blink" />}
                        </div>
                    </>
                )}

                {/* Step 5: Verdict Reveal */}
                {step === 'verdict' && (
                    <>
                        <div className="mono" style={{
                            fontSize: '0.75rem',
                            letterSpacing: '0.1em',
                            color: 'var(--fg-muted)',
                            marginBottom: 'var(--space-lg)'
                        }}>
                            FINAL VERDICT
                        </div>
                        <div className="verdict-kill" style={{
                            fontSize: 'clamp(3rem, 10vw, 6rem)',
                            fontWeight: 700,
                            lineHeight: 1,
                            marginBottom: 'var(--space-md)'
                        }}>
                            KILL
                        </div>
                        <div className="mono text-dim" style={{ fontSize: '2rem' }}>
                            34 / 100
                        </div>
                    </>
                )}

                {/* Step 6: Breakdown */}
                {step === 'breakdown' && (
                    <div style={{ textAlign: 'left', width: '100%' }}>
                        {/* Score Breakdown */}
                        <div className="mono" style={{
                            fontSize: '0.75rem',
                            letterSpacing: '0.1em',
                            color: 'var(--fg-muted)',
                            marginBottom: 'var(--space-md)'
                        }}>
                            SCORE BREAKDOWN
                        </div>
                        <div className="terminal" style={{ marginBottom: 'var(--space-xl)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Pain Severity</span>
                                <span className="text-dim">.......... 14 / 25</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Market Frequency</span>
                                <span className="text-dim">...... 11 / 25</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Solution Gap</span>
                                <span className="text-dim">.......... 5 / 25</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Payment Likelihood</span>
                                <span className="text-dim">.... 4 / 25</span>
                            </div>
                        </div>

                        {/* Red Flags */}
                        <div className="mono" style={{
                            fontSize: '0.75rem',
                            letterSpacing: '0.1em',
                            color: 'var(--accent-red)',
                            marginBottom: 'var(--space-md)'
                        }}>
                            RED FLAGS
                        </div>
                        <div className="terminal" style={{
                            marginBottom: 'var(--space-xl)',
                            borderColor: 'var(--accent-red)'
                        }}>
                            <div className="verdict-kill">⚠ Users tolerate the problem</div>
                            <div className="verdict-kill">⚠ Existing tools already solve this cheaply</div>
                            <div className="verdict-kill">⚠ Weak willingness to pay</div>
                        </div>

                        {/* Required Actions */}
                        <div className="mono" style={{
                            fontSize: '0.75rem',
                            letterSpacing: '0.1em',
                            color: 'var(--fg-muted)',
                            marginBottom: 'var(--space-md)'
                        }}>
                            REQUIRED ACTIONS
                        </div>
                        <div className="terminal" style={{ marginBottom: 'var(--space-2xl)' }}>
                            <div>• Do not build an MVP yet</div>
                            <div>• Interview 15 target users</div>
                            <div>• Test pricing before writing code</div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button onClick={goToExit} className="btn btn-primary">
                                CONTINUE
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 7: Exit / Conversion */}
                {step === 'exit' && (
                    <>
                        <div className="mono" style={{
                            fontSize: '0.75rem',
                            letterSpacing: '0.1em',
                            color: 'var(--fg-muted)',
                            marginBottom: 'var(--space-xl)'
                        }}>
                            THIS WAS A SIMULATION.
                        </div>
                        <p style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2xl)', maxWidth: '400px' }}>
                            Your idea will receive<br />
                            a real, irreversible judgment.
                        </p>
                        <Link href="/validate" className="btn btn-accent" style={{ marginBottom: 'var(--space-lg)' }}>
                            GET A REAL VERDICT — $4
                        </Link>
                        <button
                            onClick={onClose}
                            className="btn"
                            style={{ background: 'transparent', border: 'none' }}
                        >
                            RETURN TO LANDING
                        </button>
                    </>
                )}

            </div>
        </div>
    )
}
