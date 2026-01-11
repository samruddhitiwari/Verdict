'use client'

import { useState } from 'react'
import Link from 'next/link'
import { VerdictSimulation } from '@/components/VerdictSimulation'

export default function HomePage() {
  const [showSimulation, setShowSimulation] = useState(false)

  return (
    <>
      <main style={{ minHeight: '100vh', padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div style={{ maxWidth: '900px' }}>

          {/* Hero Section - Document Header Style */}
          <section style={{ marginBottom: 'var(--space-4xl)' }}>
            <h1 style={{
              fontSize: 'clamp(4rem, 15vw, 10rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 0.9,
              marginBottom: 'var(--space-xl)'
            }}>
              VERDICT
            </h1>

            <div style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 500,
              lineHeight: 1.2,
              marginBottom: 'var(--space-xl)'
            }}>
              <div>Your startup idea.</div>
              <div>Judged.</div>
            </div>

            <p className="text-muted" style={{
              fontSize: '1.125rem',
              maxWidth: '400px',
              lineHeight: 1.5,
              marginBottom: 'var(--space-2xl)'
            }}>
              Most startup ideas fail quietly.<br />
              VERDICT kills the bad ones early.
            </p>

            {/* Command-style buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <Link
                href="/validate"
                className="btn btn-primary"
                style={{ padding: 'var(--space-md) var(--space-xl)' }}
              >
                GET A VERDICT — $4
              </Link>
              <button
                onClick={() => setShowSimulation(true)}
                className="btn"
                style={{ padding: 'var(--space-md) var(--space-xl)' }}
              >
                SIMULATE A VERDICT
              </button>
            </div>
          </section>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'var(--border)',
            marginBottom: 'var(--space-2xl)'
          }} />

          {/* System Status */}
          <section style={{ marginBottom: 'var(--space-4xl)' }}>
            <h2 className="mono" style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'var(--fg-muted)',
              marginBottom: 'var(--space-lg)'
            }}>
              SYSTEM STATUS
            </h2>
            <div className="mono" style={{
              fontSize: '0.875rem',
              lineHeight: 2
            }}>
              <div>• AI Judge: <span style={{ color: 'var(--accent-green)' }}>ACTIVE</span></div>
              <div>• Evaluation Mode: <span style={{ color: 'var(--accent-amber)' }}>HARSH</span></div>
              <div>• Encouragement: <span style={{ color: 'var(--accent-red)' }}>DISABLED</span></div>
            </div>
          </section>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'var(--border)',
            marginBottom: 'var(--space-2xl)'
          }} />

          {/* Process */}
          <section style={{ marginBottom: 'var(--space-4xl)' }}>
            <h2 className="mono" style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'var(--fg-muted)',
              marginBottom: 'var(--space-lg)'
            }}>
              PROCESS
            </h2>
            <div className="mono" style={{
              fontSize: '0.875rem',
              lineHeight: 2.5
            }}>
              <div>1. You submit a case.</div>
              <div>2. The system interrogates it.</div>
              <div>3. A final judgment is issued.</div>
            </div>
          </section>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'var(--border)',
            marginBottom: 'var(--space-2xl)'
          }} />

          {/* Recent Judgments */}
          <section style={{ marginBottom: 'var(--space-4xl)' }}>
            <h2 className="mono" style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'var(--fg-muted)',
              marginBottom: 'var(--space-lg)'
            }}>
              RECENT JUDGMENTS
            </h2>
            <div className="mono" style={{
              fontSize: '0.875rem',
              lineHeight: 2
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '450px' }}>
                <span>AI Resume Builder</span>
                <span>
                  <span className="text-dim">............</span>{' '}
                  <span className="verdict-kill">KILL</span>{' '}
                  <span className="text-dim">(34)</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '450px' }}>
                <span>Creator CRM</span>
                <span>
                  <span className="text-dim">................</span>{' '}
                  <span className="verdict-validate">VALIDATE</span>{' '}
                  <span className="text-dim">(62)</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '450px' }}>
                <span>Dev Analytics Platform</span>
                <span>
                  <span className="text-dim">.......</span>{' '}
                  <span className="verdict-ship">SHIP</span>{' '}
                  <span className="text-dim">(81)</span>
                </span>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'var(--border)',
            marginBottom: 'var(--space-2xl)'
          }} />

          {/* Pricing */}
          <section style={{ marginBottom: 'var(--space-4xl)' }}>
            <h2 className="mono" style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'var(--fg-muted)',
              marginBottom: 'var(--space-lg)'
            }}>
              FINAL JUDGMENT
            </h2>
            <div style={{ fontSize: '2rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
              $4
            </div>
            <div className="mono text-dim" style={{ fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
              One-time · Permanent · No retries
            </div>
            <div className="mono text-muted" style={{ fontSize: '0.875rem', lineHeight: 2 }}>
              <div>• One irreversible decision (SHIP / VALIDATE / KILL)</div>
              <div>• Internal memo-style reasoning</div>
              <div>• Red flags & required actions</div>
              <div>• Permanent record in dashboard</div>
              <div>• PDF evidence export</div>
            </div>
          </section>

          {/* Footer */}
          <footer style={{ paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--border)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-lg)'
            }}>
              <div className="mono" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                VERDICT
              </div>
              <div className="mono" style={{ fontSize: '0.75rem', display: 'flex', gap: 'var(--space-xl)' }}>
                <Link href="/auth" className="text-muted">SIGN IN</Link>
                <Link href="/dashboard" className="text-muted">DASHBOARD</Link>
              </div>
            </div>
          </footer>

        </div>
      </main>

      {/* Verdict Simulation Modal */}
      <VerdictSimulation
        isOpen={showSimulation}
        onClose={() => setShowSimulation(false)}
      />
    </>
  )
}
