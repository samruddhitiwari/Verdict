import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import type { Validation, AIReasoning } from '@/lib/types'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch validation
        const { data: validation } = await supabase
            .from('validations')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (!validation) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 })
        }

        const v = validation as Validation

        if (!v.is_paid || !v.verdict) {
            return NextResponse.json({ error: 'Judgment not issued' }, { status: 400 })
        }

        // Generate PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        })

        const pageWidth = pdf.internal.pageSize.getWidth()
        const margin = 20
        const contentWidth = pageWidth - (margin * 2)
        let y = margin

        // Header
        pdf.setFontSize(24)
        pdf.setFont('helvetica', 'bold')
        pdf.text('VERDICT', margin, y)
        y += 8

        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100)
        pdf.text('CONFIDENTIAL CASE REVIEW', margin, y)
        y += 6

        pdf.setFontSize(8)
        pdf.text('This document represents a formal evaluation of a startup idea.', margin, y)
        y += 12

        // Divider
        pdf.setDrawColor(200)
        pdf.line(margin, y, pageWidth - margin, y)
        y += 10

        // Case metadata
        pdf.setTextColor(100)
        pdf.setFontSize(8)
        pdf.text(`CASE #${v.id.substring(0, 8).toUpperCase()}`, margin, y)
        pdf.text(
            new Date(v.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            pageWidth - margin,
            y,
            { align: 'right' }
        )
        y += 10

        // Idea description
        pdf.setTextColor(0)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        const ideaLines = pdf.splitTextToSize(v.idea_description, contentWidth)
        pdf.text(ideaLines, margin, y)
        y += ideaLines.length * 5 + 10

        // Verdict box
        pdf.setFillColor(245, 245, 245)
        pdf.rect(margin, y, contentWidth, 25, 'F')
        pdf.setDrawColor(150)
        pdf.rect(margin, y, contentWidth, 25, 'S')

        // Verdict text
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100)
        pdf.text('FINAL VERDICT', margin + 5, y + 6)

        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(
            v.verdict === 'SHIP' ? 34 : v.verdict === 'VALIDATE' ? 249 : 239,
            v.verdict === 'SHIP' ? 197 : v.verdict === 'VALIDATE' ? 115 : 68,
            v.verdict === 'SHIP' ? 94 : v.verdict === 'VALIDATE' ? 22 : 68
        )
        pdf.text(v.verdict, margin + 5, y + 18)

        // Score
        pdf.setFontSize(24)
        pdf.setTextColor(150)
        pdf.text(`${v.score}`, pageWidth - margin - 5, y + 18, { align: 'right' })

        y += 35

        // Judge memo
        if (v.ai_reasoning) {
            const reasoning = v.ai_reasoning as AIReasoning

            pdf.setTextColor(100)
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'bold')
            pdf.text('JUDGE MEMO', margin, y)
            y += 6

            pdf.setTextColor(0)
            pdf.setFontSize(10)
            pdf.setFont('helvetica', 'normal')
            const summaryLines = pdf.splitTextToSize(reasoning.summary, contentWidth)
            pdf.text(summaryLines, margin, y)
            y += summaryLines.length * 4 + 8

            // Analysis sections
            const sections = [
                { title: 'MARKET ANALYSIS', content: reasoning.market_analysis },
                { title: 'COMPETITIVE LANDSCAPE', content: reasoning.competitive_landscape },
                { title: 'EXECUTION RISK', content: reasoning.execution_risk },
                { title: 'REVENUE POTENTIAL', content: reasoning.revenue_potential },
            ]

            for (const section of sections) {
                if (y > 260) {
                    pdf.addPage()
                    y = margin
                }

                pdf.setTextColor(100)
                pdf.setFontSize(8)
                pdf.setFont('helvetica', 'bold')
                pdf.text(section.title, margin, y)
                y += 5

                pdf.setTextColor(0)
                pdf.setFontSize(9)
                pdf.setFont('helvetica', 'normal')
                const lines = pdf.splitTextToSize(section.content, contentWidth)
                pdf.text(lines, margin, y)
                y += lines.length * 4 + 6
            }
        }

        // Red flags
        if (v.red_flags && v.red_flags.length > 0) {
            if (y > 240) {
                pdf.addPage()
                y = margin
            }

            pdf.setTextColor(239, 68, 68)
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'bold')
            pdf.text('RED FLAGS', margin, y)
            y += 6

            pdf.setTextColor(0)
            pdf.setFontSize(9)
            pdf.setFont('helvetica', 'normal')

            for (const flag of v.red_flags) {
                const flagLines = pdf.splitTextToSize(`• ${flag}`, contentWidth - 5)
                pdf.text(flagLines, margin, y)
                y += flagLines.length * 4 + 2
            }
            y += 4
        }

        // Recommendations
        if (v.recommendations && v.recommendations.length > 0) {
            if (y > 240) {
                pdf.addPage()
                y = margin
            }

            pdf.setTextColor(100)
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'bold')
            pdf.text('REQUIRED ACTIONS', margin, y)
            y += 6

            pdf.setTextColor(0)
            pdf.setFontSize(9)
            pdf.setFont('helvetica', 'normal')

            for (const rec of v.recommendations) {
                const recLines = pdf.splitTextToSize(`• ${rec}`, contentWidth - 5)
                pdf.text(recLines, margin, y)
                y += recLines.length * 4 + 2
            }
            y += 4
        }

        // Footer
        pdf.setTextColor(150)
        pdf.setFontSize(7)
        pdf.text(
            'This judgment is final and based on the information provided.',
            pageWidth / 2,
            pdf.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        )

        // Generate PDF buffer
        const pdfBuffer = pdf.output('arraybuffer')

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="VERDICT_${v.id.substring(0, 8).toUpperCase()}.pdf"`,
            },
        })
    } catch (error) {
        console.error('PDF export error:', error)
        return NextResponse.json({ error: 'Export failed' }, { status: 500 })
    }
}
