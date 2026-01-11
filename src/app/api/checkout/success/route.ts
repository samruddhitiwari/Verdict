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

    // Trigger AI analysis
    try {
        await analyzeIdea(validationId)
    } catch (error) {
        console.error('AI analysis error:', error)
        // Continue anyway - user can see pending state
    }

    redirect(`/results/${validationId}`)
}
