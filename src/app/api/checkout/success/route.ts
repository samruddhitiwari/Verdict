import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { analyzeIdea } from '@/lib/ai/analyze'

// Mock success endpoint for development
// In production, this would be handled by the webhook
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')
    const validationId = searchParams.get('validation_id')

    if (!paymentId || !validationId) {
        redirect('/')
    }

    const supabase = await createClient()

    try {
        // Update payment status
        await supabase
            .from('payments')
            .update({ status: 'success' })
            .eq('id', paymentId)

        // Mark validation as paid
        await supabase
            .from('validations')
            .update({
                is_paid: true,
                payment_id: paymentId
            })
            .eq('id', validationId)
    } catch (error) {
        console.error('Database update error:', error)
        // Continue to redirect even if DB update fails
    }

    // Trigger AI analysis in background (don't await - let it run async)
    // Using Promise.race with a timeout to not block the redirect
    const aiPromise = analyzeIdea(validationId).catch(error => {
        console.error('AI analysis error (background):', error)
    })

    // Give AI a small head start but don't wait for it to complete
    await Promise.race([
        aiPromise,
        new Promise(resolve => setTimeout(resolve, 500)) // 500ms max wait
    ])

    redirect(`/results/${validationId}`)
}
