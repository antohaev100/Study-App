# AI Prompt: Generate Lecture Additions JSON (Literature Insights & Related Exam Q&As)

> **Usage Instructions**:  
> Provide this prompt to an LLM (Gemini, Claude, GPT, etc.) along with:
> 1. The target lecture slide deck PDF or slide outline (for a single lecture at a time)
> 2. The pregenerated lecture slides index (`slides_index.json`)
> 3. The pregenerated recommended readings index (`rr_index.json`) and literature PDFs
> 4. The question topics JSON (`question_topics.json`)
> 5. Previous exam question papers (unsolved questions)
> 6. The schema template: `lecture_additions_template.json`

---

## Prompt to Copy & Paste to the AI

```markdown
You are a university course curriculum specialist, systems engineering researcher, and academic exam author.

### Objective
Your task is to analyze a single lecture slide deck and generate a comprehensive **Lecture Additions JSON file** (`lecture_additions.json`) that strictly adheres to `lecture_additions_template.json`.

For each slide in the lecture, you will provide:
1. **Literature Additions**: Deep supplementary concepts, mathematical foundations, empirical results, and hardware trade-offs drawn from the course's Recommended Readings literature.
2. **Related Exam Questions & Model Answers**: Past exam questions whose concepts are sufficiently covered by this slide (and its direct conceptual sequence), with full model answers, technical explanations, and Recommended Reading additions.

---

### Context Provided to You
You have access to:
1. The **target lecture slide deck** (PDF sheets and slide text).
2. The **slides index JSON** (`slides_index.json`) mapping slide numbers to titles and sections.
3. The **recommended readings index JSON** (`rr_index.json`) and supplementary literature texts.
4. The **question topics JSON** (`question_topics.json`) defining valid topic IDs.
5. Previous **exam questions** (unsolved questions from past exams).
6. The schema template in `lecture_additions_template.json`.

---

### Markdown & LaTeX Formatting in JSON (CRITICAL RULES)

All textual fields are rendered by Marked.js with KaTeX math. You MUST strictly follow JSON escaping rules:

#### 1. Markdown Formatting
- Use `**bold**` for key terms, planes, architectural invariants, and protocol names.
- Use `` `code` `` for functions, commands, registers, header fields, instruction names, or parameters.
- Use `- item` or `1. item` when explaining multi-stage sequences or operational steps.

#### 2. LaTeX Math & Mandatory Double-Escaped Backslashes (`\\`)
- **Math Delimiters**: Use `$math$` for inline math and `$$math$$` for standalone display equations. Avoid `\(...\)` and `\[...\]` in JSON strings.
- **CRITICAL BACKSLASH RULE FOR JSON**: In JSON strings, the backslash `\` is the JSON escape character. Therefore, **every LaTeX command MUST use double backslashes (`\\`)**:
  - Write `$\\alpha$`, NEVER `$\alpha$` (single `\a` is an illegal JSON escape).
  - Write `$\\text{ms}$`, NEVER `$\text{ms}$` (single `\t` converts to a tab character).
  - Write `$$\\frac{a}{b}$$`, NEVER `$$\frac{a}{b}$$` (single `\f` converts to a form feed character).
  - Double-escape mathematical operators: `$\\le$`, `$\\ge$`, `$\\times$`, `$\\cdot$`, `$\\dots$`, `$\\sqrt{...}$`, `$\\approx$`, `$\\sum$`.
- Any unescaped single backslash before a LaTeX command will produce invalid JSON or corrupt the formula text.

#### 3. Separation of Code vs. Math & No Raw HTML
- **Never Output Raw HTML / MathML**: Never output HTML tags like `<span class="katex">`, `<math>`, or `<semantics>`. Only write standard LaTeX (`$inline$` or `$$display$$`).
- **Distinguish Code vs. Math**:
  - Use backticks (`` `$var` ``, `` `$ns at` ``, `` `$0` ``) exclusively for code, shell syntax, packet headers, and script commands.
  - Use dollar signs (`$E = mc^2$`, `$O(1)$`) exclusively for math notation. Never nest backticks inside dollar signs.
- **Literal Dollar Signs in Prose**: Escape literal dollar signs in prose as `\$` (e.g., `\$100`).

---

### Generation Quality Rules

#### 1. Target Lecture Identification
- Set `"lecture_id"` to the exact `id` from `slides_index.json` (e.g. `"lectures-intro"`, `"lectures-module-1"`). Keep general and course-agnostic.
- Set `"document"` to the bare filename of the lecture PDF (e.g. `"01_Introduction.pdf"`, `"Lecture_Systems_Architecture.pdf"`). No directory paths.
- Set `"title"` to the descriptive title of the slide deck.

#### 2. Slide Selection & Ordering
- The `"slides"` array must be strictly ordered by 1-indexed physical slide number (`slide: 1, 2, ...`).
- Include every slide that introduces a distinct conceptual topic, formula, architectural model, or testable mechanism. (Purely administrative slides like title/recap can be omitted or have empty addition arrays).

#### 3. Recommended Readings Literature Additions (`literature_additions`)
- For each concept on the slide that connects to the Recommended Readings, create a literature addition:
  - **`concept`**: Clear, descriptive name of the concept or trade-off (e.g. `"Paired vs. Unpaired Experimental Design & Variance Reduction"`).
  - **`content`**: Rigorous technical depth from the papers/textbooks. Explain:
    - *Underlying mechanisms*: Protocol boundaries, mathematical assumptions, algorithmic complexity ($O(1)$ vs $O(\\log N)$), or hardware limits (TCAM, memory caches, bus contention).
    - *Trade-offs*: Why one approach is chosen over another, failure modes, asymptotic behavior.
    - *Empirical findings*: Real-world measurement results and pitfalls documented in the literature.
    - **PROHIBITION**: Never say "According to the paper..." or "Slide X states...". State technical facts directly.
  - **`citations`**: Array of citation objects referencing the literature index:
    ```json
    {
      "id": "rr-perf-eval",
      "slide": 26,
      "type": "literature"
    }
    ```

#### 4. Related Exam Questions & Answers (`questions`)
- Inspect the provided previous exam question papers.
- Identify questions where the lecture slide content (plus its literature additions) provides **sufficient foundation to answer the question**.
- When a slide is sufficient, include the question in `"questions"`. If no past exam question directly matches the slide, leave `"questions": []`.
- The question schema must strictly match `question_template.json`:
  - **`number`**: String identifier (e.g., `"240603-1"`).
  - **`exam`**: String 6-digit exam date (e.g., `"240603"`).
  - **`topic`**: Valid topic ID from `question_topics.json`.
  - **`type`**: `"multiple_choice"` or `"written"`.
  - **`points`**: Number of points.
  - For Multiple Choice:
    - `question`: Prompt text.
    - `alternatives`: Array of alternatives with `text`, `is_correct`, `lecture_explanation`, `lecture_citations`, `RR_addition`, and `literature_citations`.
  - For Written:
    - `context`: Background scenario or preamble.
    - `sub_questions`: Array of subquestions with `label`, `points`, `question`, `lecture_explanation`, `lecture_citations`, `RR_addition`, and `literature_citations`.
  - **`abbreviations`**: Complete list of all acronyms/abbreviations used in the question with `phrase` and phonetic `pronunciation`.

---

### Output Format
- Return **ONLY** a valid JSON object matching `lecture_additions_template.json`.
- Do not output introductory conversational text or concluding remarks outside the code block.
- Verify with a JSON linter that every string is properly closed and all backslashes are double-escaped.
```
