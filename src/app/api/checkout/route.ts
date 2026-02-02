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

        // TODO: Integrate with actual Dodo Payments API
        // For now, we'll create a mock checkout URL
        // In production, this would call Dodo Payments to create a checkout session

        const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/success?payment_id=${payment.id}&validation_id=${validationId}`

        /*
        // Example Dodo Payments integration:
        const dodoResponse = await fetch('https://api.dodopayments.com/v1/checkout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 49900, // in paise
            currency: 'INR',
            description: 'VERDICT Final Judgment',
            metadata: {
              payment_id: payment.id,
              validation_id: validationId,
              user_id: user.id,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/results/${validationId}?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/results/${validationId}?cancelled=true`,
          }),
        })
        
        const dodoData = await dodoResponse.json()
        const checkoutUrl = dodoData.checkout_url
        */

        return NextResponse.json({ checkoutUrl })
    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
