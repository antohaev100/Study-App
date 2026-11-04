# AI Prompt: Generate Course Topic Guide JSON (Enrichment Mode)

> **Usage Instructions**:  
> Provide this prompt to an LLM (Gemini, Claude, GPT, etc.) along with:
> 1. The schema template: `course_topic_guide_template.json` (or `course_topic_guide_template.json.txt`)
> 2. The previously generated **question topics JSON** (`question_topics.json` defining all course sections and topics with their IDs)
> 3. All generated **exam answers JSON files** (each question tagged with its `"topic"` ID, detailed model explanations, and citations)
> 4. (Optional) Course lecture slides or literature PDFs

---

## Prompt to Copy & Paste to the AI

```markdown
You are an expert university curriculum architect, pedagogical designer, and exam preparation strategist.

### Objective
Your task is to take the **already generated course sections and question topics** (from `question_topics.json`) and the **solved exam questions** (from the exam answers JSON files) and generate an enriched **Course Topic Guide JSON file** (`course_guide.json` or `course_topic_guide.json`) that strictly adheres to `course_topic_guide_template.json`.

In this phase, you are NOT inventing new sections or topics, and you are NOT repeating taxonomic metadata:
- **DO NOT duplicate** `title`, `code`, `summary`, `badge`, `number`, or `course` metadata. All of those already exist in `question_topics.json`.
- **Match strictly by `id`**: For each section and topic, provide ONLY the exact matching `id` plus its deep pedagogical study enrichment fields:
  1. Everyday intuitive mental models and physical analogies (`plainWords`)
  2. High-yield examiner tips, grading pitfalls, and conceptual traps (`keyTakeaway`)
  3. Structured technical knowledge blocks, comparative tables, and formulas (`infoNeeded`)

The cheat sheet has been removed; focus entirely on delivering deep, authoritative section-level and topic-level study material.

---

### Universal Markdown & LaTeX Math in JSON (CRITICAL RULES)

**Every single textual field** in this JSON is parsed by a full GitHub-Flavored Markdown engine with KaTeX math rendering. Take full advantage of this across all fields (`plainWords`, `keyTakeaway`, `points`, `table` cells, and `formula`), but you MUST strictly adhere to JSON string escaping rules:

#### 1. Typography & Markdown Formatting
- Use `**bold**` for core architectural principles, protocol names, and invariant rules.
- Use `` `code` `` for protocol commands, header fields, registers, functions, and parameters (e.g. `OFPIT_APPLY_ACTIONS`, `sk_buff`, `min_rtt`).
- Use `- item` or `1. item` for step-by-step mechanisms, causality chains, and state machine transitions.
- Use `> quote` for architectural axioms, standard definitions, or RFC citations.

#### 2. LaTeX Math & Mandatory Double-Escaped Backslashes (`\\`)
- **Math Delimiters**: Use `$math$` for inline math and `$$math$$` for standalone display equations. Avoid `\(...\)` and `\[...\]` in JSON strings because they require escaping parentheses and brackets in JSON.
- **CRITICAL BACKSLASH RULE FOR JSON**: In JSON strings, the backslash `\` is the JSON escape character. Therefore, **every LaTeX command MUST use double backslashes (`\\`)**:
  - Write `$\\alpha = 0.125$`, NEVER `$\alpha = 0.125$` (single `\a` is an invalid JSON escape that crashes the parser).
  - Write `$\\text{ms}$`, NEVER `$\text{ms}$` (single `\t` is parsed as a tab character `\u0009`, corrupting the formula).
  - Write `$$\\frac{BDP}{\\text{MSS}}$$`, NEVER `$$\frac{BDP}{\text{MSS}}$$` (single `\f` is parsed as a form feed character `\u000c`).
  - Write `$\\beta$`, NEVER `$\beta$` (single `\b` is parsed as a backspace character).
  - Always double-escape mathematical operators and symbols: `$\\le$`, `$\\ge$`, `$\\times$`, `$\\cdot$`, `$\\dots$`, `$\\sqrt{...}$`, `$\\approx$`, `$\\rightarrow$`.
  - For line breaks inside math arrays/matrices (`\\`), use quadruple backslashes in JSON: `\\\\`.
- Any unescaped single backslash before a LaTeX command will produce invalid JSON or silently corrupt the formula text.

---

### Critical Enrichment Guidelines

#### 1. Strictly Match IDs (Zero Taxonomy Duplication)
- Every section in your output MUST have the exact `"id"` matching a section in `question_topics.json`.
- Every topic in your output MUST have the exact `"id"` matching a topic in `question_topics.json`.
- Do not add, omit, or rename any `id`. Do not output duplicate fields (`title`, `code`, `summary`, `badge`, `number`).

#### 2. Section-Level Pedagogical Architecture
For every **Section** (matched by its `id`), synthesize:
- **`plainWords` (Overarching Section Analogy)**: Write an intuitive real-world mental model starting with `"Think of..."`. Frame the entire problem space of the section using an everyday mechanical, physical, or organizational system (e.g., city traffic grids vs railway schedules, postal sorting hubs vs telephone exchanges).
- **`keyTakeaway` (Section Synthesis & Examiner Traps)**: Synthesize the overarching themes of the section. Highlight systemic trade-offs, common student blind spots, and recurring exam rubrics spanning multiple topics in this section.
- **`infoNeeded` (Cross-Cutting Knowledge Blocks)**:
  - Provide section-wide invariants and fundamental rules.
  - Include comparative tables (`headers` and `rows`) contrasting overarching paradigms.
  - Include mathematical formulas or scaling laws governing the section.

#### 3. Topic-Level Pedagogical Architecture
For every **Topic** (matched by its `id`), synthesize insights directly from the exam questions and answers tagged with that topic:
- **`plainWords` (Topic Mental Model)**: A crisp, concrete analogy explaining the specific protocol, algorithm, or trade-off (e.g., CoDel's sliding stopwatch, token bucket as a metered valve, BBR as an elevator dispatcher).
- **`keyTakeaway` (Targeted Examiner Tips)**: Direct advice targeting the exact misconceptions tested in the exam answers (e.g., *"Examiners frequently test whether CoDel drops packets on arrival or on dequeue; remember it drops on DEQUEUE to measure experienced sojourn time"*).
- **`infoNeeded` (Structured Knowledge Blocks)**:
  - `points`: Bulleted technical facts, protocol state machine transitions, and causal chains.
  - `table`: Structured comparative tables contrasting competing mechanisms, algorithms, or protocol versions.
  - `formula`: Key equations in LaTeX syntax with double-escaped backslashes (e.g., `"$$t_{\\text{next}} = t_{\\text{now}} + \\frac{\\text{interval}}{\\sqrt{\\text{count}}}$$"`).

---

### Output Format
- Return **ONLY** a valid JSON object matching the streamlined structure illustrated in `course_topic_guide_template.json`:
```json
{
  "sections": [
    {
      "id": "sec-1-arch",
      "plainWords": "Think of...",
      "keyTakeaway": "...",
      "infoNeeded": [
        {
          "title": "Fundamental Architectural Invariants",
          "points": [ ... ],
          "table": {
            "headers": [ ... ],
            "rows": [ [ ... ] ]
          },
          "formula": "$$BDP = RTT \\times BW$$"
        }
      ],
      "topics": [
        {
          "id": "topic-fate-sharing",
          "plainWords": "Think of...",
          "keyTakeaway": "...",
          "infoNeeded": [
            {
              "title": "State Survivability Principles",
              "points": [ ... ],
              "table": { ... },
              "formula": "..."
            }
          ]
        }
      ]
    }
  ]
}
```
- Do **NOT** wrap the JSON in conversational commentary.
- Ensure all JSON keys, braces, and arrays are valid and parseable without syntax errors.
```
