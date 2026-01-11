'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormData {
    idea_description: string
    target_user: string
    pain_point: string
    frequency: string
    current_workaround: string
    willingness_to_pay: string
}

const STEPS = [
    {
        title: 'THE IDEA',
        subtitle: 'State your case clearly.',
        fields: ['idea_description'],
    },
    {
        title: 'THE MARKET',
        subtitle: 'Who are you building for?',
        fields: ['target_user', 'pain_point'],
    },
    {
        title: 'THE BUSINESS',
        subtitle: 'Will anyone pay?',
        fields: ['frequency', 'willingness_to_pay', 'current_workaround'],
    },
]

export default function ValidatePage() {
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState<FormData>({
        idea_description: '',
        target_user: '',
        pain_point: '',
        frequency: '',
        current_workaround: '',
        willingness_to_pay: '',
    })

    const router = useRouter()

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const canProceed = () => {
        const currentFields = STEPS[step].fields as (keyof FormData)[]
        // First two steps are required, third step is optional
        if (step < 2) {
            return currentFields.every(field => formData[field].trim().length > 0)
        }
        return true
    }

    const handleNext = async () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1)
        } else {
            await handleSubmit()
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/auth')
            return
        }

        const { data, error: insertError } = await supabase
            .from('validations')
            .insert({
                user_id: user.id,
                idea_description: formData.idea_description,
                target_user: formData.target_user,
                pain_point: formData.pain_point,
                frequency: formData.frequency || null,
                current_workaround: formData.current_workaround || null,
                willingness_to_pay: formData.willingness_to_pay || null,
                is_paid: false,
            })
            .select()
            .single()

        if (insertError) {
            setError(insertError.message)
            setLoading(false)
            return
        }

        router.push(`/results/${data.id}`)
    }

    return (
        <main className="section" style={{ minHeight: '100vh' }}>
            <div className="container-narrow">
                <Link href="/" className="mono text-muted mb-xl block" style={{ fontSize: '0.875rem' }}>
                    ← VERDICT
                </Link>

                {/* Progress Indicator */}
                <div className="flex gap-sm mb-2xl">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                height: '2px',
                                background: i <= step ? 'var(--fg)' : 'var(--border)',
                                transition: 'background 0.3s ease',
                            }}
                        />
                    ))}
                </div>

                <div className="mono text-dim mb-md" style={{ fontSize: '0.75rem' }}>
                    STEP {String(step + 1).padStart(2, '0')} OF {String(STEPS.length).padStart(2, '0')}
                </div>

                <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>
                    {STEPS[step].title}
                </h1>
                <p className="text-muted mb-xl">
                    {STEPS[step].subtitle}
                </p>

                {/* Step 1: The Idea */}
                {step === 0 && (
                    <div>
                        <label className="label" htmlFor="idea_description">
                            DESCRIBE YOUR STARTUP IDEA
                        </label>
                        <textarea
                            id="idea_description"
                            className="textarea"
                            value={formData.idea_description}
                            onChange={(e) => handleChange('idea_description', e.target.value)}
                            placeholder="A platform that..."
                            style={{ minHeight: '200px' }}
                        />
                        <p className="text-dim mt-sm" style={{ fontSize: '0.75rem' }}>
                            Be specific. Vague ideas get vague judgments.
                        </p>
                    </div>
                )}

                {/* Step 2: The Market */}
                {step === 1 && (
                    <div>
                        <div className="mb-xl">
                            <label className="label" htmlFor="target_user">
                                WHO IS YOUR TARGET USER?
                            </label>
                            <textarea
                                id="target_user"
                                className="textarea"
                                value={formData.target_user}
                                onChange={(e) => handleChange('target_user', e.target.value)}
                                placeholder="Describe your ideal customer in detail..."
                                style={{ minHeight: '120px' }}
                            />
                        </div>

                        <div>
                            <label className="label" htmlFor="pain_point">
                                WHAT PAIN POINT ARE YOU SOLVING?
                            </label>
                            <textarea
                                id="pain_point"
                                className="textarea"
                                value={formData.pain_point}
                                onChange={(e) => handleChange('pain_point', e.target.value)}
                                placeholder="The specific problem your users face..."
                                style={{ minHeight: '120px' }}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: The Business */}
                {step === 2 && (
                    <div>
                        <div className="mb-xl">
                            <label className="label" htmlFor="frequency">
                                HOW OFTEN WOULD USERS NEED THIS? (OPTIONAL)
                            </label>
                            <input
                                id="frequency"
                                type="text"
                                className="input"
                                value={formData.frequency}
                                onChange={(e) => handleChange('frequency', e.target.value)}
                                placeholder="Daily, weekly, monthly, one-time..."
                            />
                        </div>

                        <div className="mb-xl">
                            <label className="label" htmlFor="willingness_to_pay">
                                WILL THEY PAY? HOW MUCH? (OPTIONAL)
                            </label>
                            <textarea
                                id="willingness_to_pay"
                                className="textarea"
                                value={formData.willingness_to_pay}
                                onChange={(e) => handleChange('willingness_to_pay', e.target.value)}
                                placeholder="Describe your pricing hypothesis and any evidence of willingness to pay..."
                                style={{ minHeight: '100px' }}
                            />
                        </div>

                        <div>
                            <label className="label" htmlFor="current_workaround">
                                HOW DO THEY SOLVE THIS TODAY? (OPTIONAL)
                            </label>
                            <textarea
                                id="current_workaround"
                                className="textarea"
                                value={formData.current_workaround}
                                onChange={(e) => handleChange('current_workaround', e.target.value)}
                                placeholder="Existing solutions, manual processes, competitors..."
                                style={{ minHeight: '100px' }}
                            />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="terminal mt-xl" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
                        {error}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-2xl">
                    {step > 0 ? (
                        <button
                            type="button"
                            className="btn"
                            onClick={() => setStep(step - 1)}
                            disabled={loading}
                        >
                            ← BACK
                        </button>
                    ) : (
                        <div />
                    )}

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleNext}
                        disabled={!canProceed() || loading}
                    >
                        {loading ? 'SUBMITTING...' : step === STEPS.length - 1 ? 'SUBMIT CASE' : 'CONTINUE →'}
                    </button>
                </div>
            </div>
        </main>
    )
}
