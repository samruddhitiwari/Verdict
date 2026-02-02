import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Dodo Payments checkout creation
// Note: Replace with actual Dodo Payments SDK when available
export async function POST(request: Request) {
    try {
        const { validationId } = await request.json()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify the validation belongs to the user
        const { data: validation } = await supabase
            .from('validations')
            .select('id, is_paid')
            .eq('id', validationId)
            .eq('user_id', user.id)
            .single()

        if (!validation) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 })
        }

        if (validation.is_paid) {
            return NextResponse.json({ error: 'Already paid' }, { status: 400 })
        }

        // Create payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                user_id: user.id,
                validation_id: validationId,
                amount: 7,
                currency: 'USD',
                status: 'pending',
            })
            .select()
            .single()

        if (paymentError) {
            console.error('Payment insert error:', paymentError)
            return NextResponse.json({ error: `Failed to create payment: ${paymentError.message}` }, { status: 500 })
        }

        // Dodo Payments checkout URL with metadata for tracking
        const successUrl = encodeURIComponent(
            `${process.env.NEXT_PUBLIC_APP_URL}/results/${validationId}?success=true&payment_id=${payment.id}`
        )
        const checkoutUrl = `https://checkout.dodopayments.com/buy/pdt_0NXcI1vgswE8tiw65y91Z?quantity=1&redirect_url=${successUrl}`

        return NextResponse.json({ checkoutUrl })
    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
