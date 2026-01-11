// AI Judge Prompt Template

export const JUDGE_SYSTEM_PROMPT = `You are a startup judge, not a coach.
Your job is to eliminate weak ideas early.
Be direct. Be unsentimental.

You evaluate startup ideas based on:
1. Market clarity - Is the problem real and well-defined?
2. Willingness to pay - Will people actually pay for this?
3. Competitive landscape - Is there defensibility?
4. Execution risk - Can a small team build this?
5. Revenue potential - Is there a path to meaningful revenue?

You provide scores from 0-100:
- Below 40: KILL - The idea has fundamental flaws
- 40-69: VALIDATE - The idea needs more proof before building
- 70+: SHIP - The idea is worth building

Be harsh. Most ideas should be killed. A SHIP verdict is rare and reserved for ideas with clear market demand, obvious willingness to pay, and executable scope.`

export function buildJudgePrompt(input: {
    idea_description: string
    target_user: string
    pain_point: string
    frequency?: string | null
    current_workaround?: string | null
    willingness_to_pay?: string | null
}): string {
    return `
## STARTUP IDEA UNDER REVIEW

**The Idea:**
${input.idea_description}

**Target User:**
${input.target_user}

**Pain Point Being Solved:**
${input.pain_point}

${input.frequency ? `**Usage Frequency:** ${input.frequency}` : ''}
${input.current_workaround ? `**Current Workaround:** ${input.current_workaround}` : ''}
${input.willingness_to_pay ? `**Willingness to Pay:** ${input.willingness_to_pay}` : ''}

---

Issue your judgment. After the verdict, generate an External Signal Playbook.

Your goal is to help the founder test this idea against real people.
Do NOT suggest APIs, scraping, or automation.
Provide practical, specific guidance for manual validation.

Return a JSON object with this exact structure:

{
  "score": <number 0-100>,
  "verdict": "<SHIP | VALIDATE | KILL>",
  "reasoning": {
    "summary": "<2-3 sentence harsh summary>",
    "market_analysis": "<assessment of market clarity and size>",
    "competitive_landscape": "<who else is doing this, defensibility>",
    "execution_risk": "<can a small team build this>",
    "revenue_potential": "<path to meaningful revenue>"
  },
  "red_flags": ["<list of deal-breakers or serious concerns>"],
  "recommendations": ["<list of required actions before proceeding>"],
  "external_validation": {
    "reddit": {
      "recommended_communities": [
        { "name": "r/example", "reason": "Why this community is relevant" }
      ],
      "posting_guidance": [
        "Do not pitch your product",
        "Frame as a problem, not a solution",
        "Ask about existing behavior"
      ],
      "templates": {
        "problem_discovery": {
          "title": "<Title for discovering if problem exists>",
          "body": "<Post body that asks about the problem without mentioning your solution>"
        },
        "validation_probe": {
          "title": "<Title for testing solution appetite>",
          "body": "<Post body that tests if people want a solution>"
        },
        "kill_confirmation": {
          "title": "<Title for confirming the idea should be killed>",
          "body": "<Post body that tests the red flags directly>"
        }
      }
    },
    "x": {
      "goal": "<What you're trying to learn from X/Twitter>",
      "templates": [
        "<Tweet 1: Hot-take or frustration about the problem>",
        "<Tweet 2: Question to gauge resonance>",
        "<Tweet 3: Personal anecdote format>"
      ],
      "signal_criteria": [
        "Replies > likes indicates real engagement",
        "People sharing similar pain",
        "DMs asking follow-up questions"
      ]
    },
    "discord": {
      "recommended_server_types": [
        "<Type of Discord servers to find>"
      ],
      "entry_guidance": [
        "Lurk before posting",
        "Respond to others first",
        "Ask questions in context"
      ],
      "starter_questions": [
        "<Question to ask in Discord that feels natural>"
      ]
    }
  }
}

Return ONLY the JSON object. No other text.`
}

export function generatePreliminarySignals(input: {
    idea_description: string
    target_user: string
    pain_point: string
    willingness_to_pay?: string | null
}): {
    market_clarity: 'LOW' | 'MEDIUM' | 'HIGH'
    willingness_to_pay: 'UNCERTAIN' | 'WEAK' | 'STRONG'
    competitive_pressure: 'ABSENT' | 'PRESENT' | 'INTENSE'
} {
    // Generate vague preliminary signals without revealing the actual verdict
    // This is intentionally opaque to encourage payment

    const ideaLength = input.idea_description.length
    const hasSpecificUser = input.target_user.length > 20
    const hasPainPoint = input.pain_point.length > 30
    const hasWTP = input.willingness_to_pay && input.willingness_to_pay.length > 10

    // Deliberately vague signal generation
    const market_clarity = hasPainPoint && hasSpecificUser ? 'MEDIUM' : 'LOW'
    const willingness = hasWTP ? 'WEAK' : 'UNCERTAIN'
    const competition = ideaLength > 100 ? 'PRESENT' : 'ABSENT'

    return {
        market_clarity,
        willingness_to_pay: willingness,
        competitive_pressure: competition
    }
}
