// Database types for VERDICT

export interface Validation {
    id: string
    user_id: string
    created_at: string
    idea_description: string
    target_user: string
    pain_point: string
    frequency: string | null
    current_workaround: string | null
    willingness_to_pay: string | null
    score: number | null
    verdict: 'SHIP' | 'VALIDATE' | 'KILL' | null
    ai_reasoning: AIReasoning | null
    recommendations: string[] | null
    red_flags: string[] | null
    is_paid: boolean
    payment_id: string | null
    judgment_issued_at: string | null
    external_validation: ExternalValidation | null
}

export interface Payment {
    id: string
    user_id: string
    validation_id: string
    amount: number
    currency: string
    status: 'pending' | 'success' | 'failed'
    dodo_payment_id: string | null
    created_at: string
}

export interface AIReasoning {
    summary: string
    market_analysis: string
    competitive_landscape: string
    execution_risk: string
    revenue_potential: string
}

export interface PreliminarySignals {
    market_clarity: 'LOW' | 'MEDIUM' | 'HIGH'
    willingness_to_pay: 'UNCERTAIN' | 'WEAK' | 'STRONG'
    competitive_pressure: 'ABSENT' | 'PRESENT' | 'INTENSE'
}

export interface JudgeOutput {
    score: number
    verdict: 'SHIP' | 'VALIDATE' | 'KILL'
    reasoning: AIReasoning
    red_flags: string[]
    recommendations: string[]
    external_validation: ExternalValidation
}

// External Signal Playbook Types
export interface ExternalValidation {
    reddit: RedditValidation
    x: XValidation
    discord: DiscordValidation
}

export interface RedditValidation {
    recommended_communities: Array<{
        name: string
        reason: string
    }>
    posting_guidance: string[]
    templates: {
        problem_discovery: { title: string; body: string }
        validation_probe: { title: string; body: string }
        kill_confirmation: { title: string; body: string }
    }
}

export interface XValidation {
    goal: string
    templates: string[]
    signal_criteria: string[]
}

export interface DiscordValidation {
    recommended_server_types: string[]
    entry_guidance: string[]
    starter_questions: string[]
}

