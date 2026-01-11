import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { analyzeIdea } from '@/lib/ai/analyze'

// Dodo Payments webhook handler
export async function POST(request: Request) {
    try {
        const body = await request.text()
        const signature = request.headers.get('x-dodo-signature')

        // Verify webhook signature
        if (!verifyWebhookSignature(body, signature)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const event = JSON.parse(body)

        // Handle payment success event
        if (event.type === 'payment.success') {
            const { payment_id, validation_id, user_id } = event.metadata

            // Use admin client to bypass RLS
            const supabase = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            )

            // Update payment status
            await supabase
                .from('payments')
                .update({
                    status: 'success',
                    dodo_payment_id: event.dodo_payment_id,
                })
                .eq('id', payment_id)

            // Mark validation as paid
            await supabase
                .from('validations')
                .update({
                    is_paid: true,
                    payment_id: payment_id,
                })
                .eq('id', validation_id)

            // Trigger AI analysis
            try {
                await analyzeIdea(validation_id)
            } catch (error) {
                console.error('AI analysis error:', error)
                // The analysis can be retried later
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}

function verifyWebhookSignature(body: string, signature: string | null): boolean {
    if (!signature || !process.env.DODO_WEBHOOK_SECRET) {
        // In development, allow unsigned webhooks
        return process.env.NODE_ENV === 'development'
    }

    // TODO: Implement actual signature verification
    // This would typically use HMAC-SHA256
    /*
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', process.env.DODO_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
    */

    return true
}
