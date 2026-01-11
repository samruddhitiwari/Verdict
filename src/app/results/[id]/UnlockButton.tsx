'use client'

import { useState } from 'react'

interface UnlockButtonProps {
    validationId: string
}

export function UnlockButton({ validationId }: UnlockButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleUnlock = async () => {
        setLoading(true)

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ validationId }),
            })

            const data = await response.json()

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl
            } else {
                console.error('No checkout URL received')
                setLoading(false)
            }
        } catch (error) {
            console.error('Checkout error:', error)
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleUnlock}
            disabled={loading}
            className="btn btn-accent w-full"
            style={{
                padding: 'var(--space-lg) var(--space-xl)',
                fontSize: '1rem',
            }}
        >
            {loading ? (
                'PROCESSING...'
            ) : (
                <>
                    UNLOCK FINAL JUDGMENT — $4
                    <br />
                    <span className="text-dim" style={{ fontSize: '0.75rem', fontWeight: 400 }}>
                        One-time · Permanent · No retries
                    </span>
                </>
            )}
        </button>
    )
}
