'use client'

import { useState } from 'react'

interface ExportButtonProps {
    validationId: string
}

export function ExportButton({ validationId }: ExportButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        setLoading(true)

        try {
            const response = await fetch(`/api/export/${validationId}`)

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `VERDICT_${validationId.substring(0, 8).toUpperCase()}.pdf`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else {
                console.error('Export failed')
            }
        } catch (error) {
            console.error('Export error:', error)
        }

        setLoading(false)
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="btn"
        >
            {loading ? 'GENERATING...' : 'DOWNLOAD PDF'}
        </button>
    )
}
