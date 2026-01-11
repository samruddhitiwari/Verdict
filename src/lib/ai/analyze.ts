import { createClient as createAdminClient } from '@supabase/supabase-js'
import { JUDGE_SYSTEM_PROMPT, buildJudgePrompt } from '@/lib/prompts/judge'
import type { JudgeOutput, Validation } from '@/lib/types'

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// Analyze a startup idea using OpenRouter API
export async function analyzeIdea(validationId: string): Promise<void> {
    const supabase = getAdminClient()

    // Fetch validation input
    const { data: validation, error: fetchError } = await supabase
        .from('validations')
        .select('*')
        .eq('id', validationId)
        .single()

    if (fetchError || !validation) {
        throw new Error('Validation not found')
    }

    const v = validation as Validation

    // Build the prompt
    const userPrompt = buildJudgePrompt({
        idea_description: v.idea_description,
        target_user: v.target_user,
        pain_point: v.pain_point,
        frequency: v.frequency,
        current_workaround: v.current_workaround,
        willingness_to_pay: v.willingness_to_pay,
    })

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'VERDICT',
        },
        body: JSON.stringify({
            model: 'anthropic/claude-3-haiku',
            messages: [
                { role: 'system', content: JUDGE_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 2000,
        }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenRouter error:', errorText)

        // Fallback to GPT-4o-mini if Haiku fails
        const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-Title': 'VERDICT',
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    { role: 'system', content: JUDGE_SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.3,
                max_tokens: 2000,
            }),
        })

        if (!fallbackResponse.ok) {
            throw new Error('AI analysis failed')
        }

        const fallbackData = await fallbackResponse.json()
        await saveJudgment(validationId, fallbackData)
        return
    }

    const data = await response.json()
    await saveJudgment(validationId, data)
}

async function saveJudgment(
    validationId: string,
    data: { choices: { message: { content: string } }[] }
): Promise<void> {
    const content = data.choices[0]?.message?.content

    if (!content) {
        throw new Error('No response from AI')
    }

    // Parse JSON from response
    let judgeOutput: JudgeOutput
    try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error('No JSON found in response')
        }
        judgeOutput = JSON.parse(jsonMatch[0])
    } catch {
        console.error('Failed to parse AI response:', content)
        throw new Error('Failed to parse AI response')
    }

    // Validate and clamp score
    const score = Math.max(0, Math.min(100, judgeOutput.score))

    // Determine verdict based on score
    let verdict: 'SHIP' | 'VALIDATE' | 'KILL'
    if (score >= 70) {
        verdict = 'SHIP'
    } else if (score >= 40) {
        verdict = 'VALIDATE'
    } else {
        verdict = 'KILL'
    }

    // Update validation with results
    const supabase = getAdminClient()
    const { error: updateError } = await supabase
        .from('validations')
        .update({
            score,
            verdict,
            ai_reasoning: judgeOutput.reasoning,
            red_flags: judgeOutput.red_flags || [],
            recommendations: judgeOutput.recommendations || [],
            external_validation: judgeOutput.external_validation || null,
            judgment_issued_at: new Date().toISOString(),
        })
        .eq('id', validationId)

    if (updateError) {
        console.error('Failed to update validation:', updateError)
        throw new Error('Failed to save judgment')
    }
}
