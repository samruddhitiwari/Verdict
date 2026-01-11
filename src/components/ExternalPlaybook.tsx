'use client'

import { useState } from 'react'
import type { ExternalValidation, RedditValidation, XValidation, DiscordValidation } from '@/lib/types'

interface ExternalPlaybookProps {
    data: ExternalValidation
}

export function ExternalPlaybook({ data }: ExternalPlaybookProps) {
    const [expanded, setExpanded] = useState<'reddit' | 'x' | 'discord' | null>(null)

    const toggle = (section: 'reddit' | 'x' | 'discord') => {
        setExpanded(expanded === section ? null : section)
    }

    return (
        <div style={{ marginTop: 'var(--space-2xl)' }}>
            {/* Section Header */}
            <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 'var(--space-xl)',
                marginBottom: 'var(--space-lg)'
            }}>
                <h2 className="mono" style={{
                    fontSize: '0.875rem',
                    letterSpacing: '0.05em',
                    marginBottom: 'var(--space-md)'
                }}>
                    NEXT MOVES: EXTERNAL SIGNAL PLAYBOOK
                </h2>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    The system has judged your idea.<br />
                    Here is how to test it against real people.
                </p>
            </div>

            {/* Reddit Section */}
            <CollapsibleSection
                title="REDDIT — PROBLEM-FIRST SIGNALS"
                isExpanded={expanded === 'reddit'}
                onToggle={() => toggle('reddit')}
            >
                <RedditSection data={data.reddit} />
            </CollapsibleSection>

            {/* X/Twitter Section */}
            <CollapsibleSection
                title="X — PUBLIC RESONANCE TEST"
                isExpanded={expanded === 'x'}
                onToggle={() => toggle('x')}
            >
                <XSection data={data.x} />
            </CollapsibleSection>

            {/* Discord Section */}
            <CollapsibleSection
                title="DISCORD — QUALITATIVE VALIDATION"
                isExpanded={expanded === 'discord'}
                onToggle={() => toggle('discord')}
            >
                <DiscordSection data={data.discord} />
            </CollapsibleSection>
        </div>
    )
}

// Collapsible Section Component
function CollapsibleSection({
    title,
    isExpanded,
    onToggle,
    children
}: {
    title: string
    isExpanded: boolean
    onToggle: () => void
    children: React.ReactNode
}) {
    return (
        <div style={{
            border: '1px solid var(--border)',
            marginBottom: 'var(--space-md)'
        }}>
            <button
                onClick={onToggle}
                style={{
                    width: '100%',
                    padding: 'var(--space-lg)',
                    background: isExpanded ? 'var(--bg-elevated)' : 'transparent',
                    border: 'none',
                    color: 'var(--fg)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    letterSpacing: '0.05em',
                    textAlign: 'left'
                }}
            >
                <span>{title}</span>
                <span className="text-dim">{isExpanded ? '−' : '+'}</span>
            </button>
            {isExpanded && (
                <div style={{
                    padding: 'var(--space-lg)',
                    borderTop: '1px solid var(--border-muted)',
                    background: 'var(--bg-elevated)'
                }}>
                    {children}
                </div>
            )}
        </div>
    )
}

// Reddit Section
function RedditSection({ data }: { data: RedditValidation }) {
    const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)

    const copyToClipboard = (text: string, templateName: string) => {
        navigator.clipboard.writeText(text)
        setCopiedTemplate(templateName)
        setTimeout(() => setCopiedTemplate(null), 2000)
    }

    return (
        <div>
            {/* Communities */}
            <div className="mb-xl">
                <span className="label" style={{ color: 'var(--fg-muted)' }}>RECOMMENDED COMMUNITIES</span>
                <div className="mt-md">
                    {data.recommended_communities.map((community, i) => (
                        <div key={i} className="mb-md" style={{
                            padding: 'var(--space-md)',
                            background: 'var(--bg-muted)',
                            border: '1px solid var(--border-muted)'
                        }}>
                            <div className="mono" style={{ fontWeight: 500 }}>{community.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.875rem', marginTop: 'var(--space-xs)' }}>
                                {community.reason}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Posting Guidance */}
            <div className="mb-xl">
                <span className="label" style={{ color: 'var(--fg-muted)' }}>POSTING GUIDANCE</span>
                <ul className="mt-md" style={{ listStyle: 'none', padding: 0 }}>
                    {data.posting_guidance.map((guidance, i) => (
                        <li key={i} className="mb-sm text-muted" style={{ fontSize: '0.875rem' }}>
                            <span className="verdict-kill">•</span> {guidance}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Templates */}
            <div>
                <span className="label" style={{ color: 'var(--fg-muted)' }}>POST TEMPLATES</span>

                <TemplateCard
                    label="PROBLEM DISCOVERY"
                    template={data.templates.problem_discovery}
                    isCopied={copiedTemplate === 'problem_discovery'}
                    onCopy={() => copyToClipboard(
                        `${data.templates.problem_discovery.title}\n\n${data.templates.problem_discovery.body}`,
                        'problem_discovery'
                    )}
                />

                <TemplateCard
                    label="VALIDATION PROBE"
                    template={data.templates.validation_probe}
                    isCopied={copiedTemplate === 'validation_probe'}
                    onCopy={() => copyToClipboard(
                        `${data.templates.validation_probe.title}\n\n${data.templates.validation_probe.body}`,
                        'validation_probe'
                    )}
                />

                <TemplateCard
                    label="KILL CONFIRMATION"
                    template={data.templates.kill_confirmation}
                    isCopied={copiedTemplate === 'kill_confirmation'}
                    onCopy={() => copyToClipboard(
                        `${data.templates.kill_confirmation.title}\n\n${data.templates.kill_confirmation.body}`,
                        'kill_confirmation'
                    )}
                />
            </div>
        </div>
    )
}

// Template Card Component
function TemplateCard({
    label,
    template,
    isCopied,
    onCopy
}: {
    label: string
    template: { title: string; body: string }
    isCopied: boolean
    onCopy: () => void
}) {
    return (
        <div className="mt-md" style={{
            border: '1px solid var(--border-muted)',
            background: 'var(--bg-muted)'
        }}>
            <div style={{
                padding: 'var(--space-md)',
                borderBottom: '1px solid var(--border-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span className="mono text-dim" style={{ fontSize: '0.75rem' }}>{label}</span>
                <button
                    onClick={onCopy}
                    className="mono"
                    style={{
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        background: isCopied ? 'var(--accent-green)' : 'transparent',
                        border: '1px solid var(--border)',
                        color: isCopied ? 'var(--bg)' : 'var(--fg-muted)',
                        cursor: 'pointer'
                    }}
                >
                    {isCopied ? 'COPIED' : 'COPY'}
                </button>
            </div>
            <div style={{ padding: 'var(--space-md)' }}>
                <div className="mono" style={{ fontWeight: 500, marginBottom: 'var(--space-sm)' }}>
                    {template.title}
                </div>
                <div className="text-muted" style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                    {template.body}
                </div>
            </div>
        </div>
    )
}

// X/Twitter Section
function XSection({ data }: { data: XValidation }) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    const copyTweet = (text: string, index: number) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    return (
        <div>
            {/* Goal */}
            <div className="mb-xl">
                <span className="label" style={{ color: 'var(--fg-muted)' }}>GOAL</span>
                <p className="text-muted mt-sm" style={{ fontSize: '0.875rem' }}>{data.goal}</p>
            </div>

            {/* Tweet Templates */}
            <div className="mb-xl">
                <span className="label" style={{ color: 'var(--fg-muted)' }}>TWEET TEMPLATES</span>
                {data.templates.map((tweet, i) => (
                    <div key={i} className="mt-md" style={{
                        padding: 'var(--space-md)',
                        background: 'var(--bg-muted)',
                        border: '1px solid var(--border-muted)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 'var(--space-md)'
                    }}>
                        <div className="text-muted" style={{ fontSize: '0.875rem', flex: 1 }}>
                            {tweet}
                        </div>
                        <button
                            onClick={() => copyTweet(tweet, i)}
                            className="mono"
                            style={{
                                fontSize: '0.75rem',
                                padding: '4px 8px',
                                background: copiedIndex === i ? 'var(--accent-green)' : 'transparent',
                                border: '1px solid var(--border)',
                                color: copiedIndex === i ? 'var(--bg)' : 'var(--fg-muted)',
                                cursor: 'pointer',
                                flexShrink: 0
                            }}
                        >
                            {copiedIndex === i ? 'COPIED' : 'COPY'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Signal Criteria */}
            <div>
                <span className="label" style={{ color: 'var(--fg-muted)' }}>WHAT TO LOOK FOR</span>
                <ul className="mt-md" style={{ listStyle: 'none', padding: 0 }}>
                    {data.signal_criteria.map((signal, i) => (
                        <li key={i} className="mb-sm text-muted" style={{ fontSize: '0.875rem' }}>
                            <span className="verdict-ship">✓</span> {signal}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

// Discord Section
function DiscordSection({ data }: { data: DiscordValidation }) {
    return (
        <div>
            {/* Server Types */}
            <div className="mb-xl">
                <span className="label" style={{ color: 'var(--fg-muted)' }}>SERVERS TO FIND</span>
                <ul className="mt-md" style={{ listStyle: 'none', padding: 0 }}>
                    {data.recommended_server_types.map((type, i) => (
                        <li key={i} className="mb-sm text-muted" style={{ fontSize: '0.875rem' }}>
                            <span className="text-dim">•</span> {type}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Entry Guidance */}
            <div className="mb-xl">
                <span className="label" style={{ color: 'var(--accent-amber)' }}>ENTRY STRATEGY</span>
                <ul className="mt-md" style={{ listStyle: 'none', padding: 0 }}>
                    {data.entry_guidance.map((guidance, i) => (
                        <li key={i} className="mb-sm text-muted" style={{ fontSize: '0.875rem' }}>
                            <span className="evaluation-text">{i + 1}.</span> {guidance}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Starter Questions */}
            <div>
                <span className="label" style={{ color: 'var(--fg-muted)' }}>STARTER QUESTIONS</span>
                {data.starter_questions.map((question, i) => (
                    <div key={i} className="mt-md" style={{
                        padding: 'var(--space-md)',
                        background: 'var(--bg-muted)',
                        border: '1px solid var(--border-muted)',
                        fontStyle: 'italic'
                    }}>
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                            "{question}"
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
