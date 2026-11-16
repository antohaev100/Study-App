# AI Prompt: Generate Lecture Literature Additions JSON

> **Usage Instructions**:  
> Provide this prompt to an LLM (Gemini, Claude, GPT, etc.) along with:
> 1. The target lecture slide deck PDF or slide outline (for a single lecture at a time)
> 2. The pregenerated lecture slides index (`slides_index.json`)
> 3. The pregenerated recommended readings index (`rr_index.json`) and literature PDFs
> 4. The schema template: `lecture_literature_additions_template.json`

---

## Prompt to Copy & Paste to the AI

```markdown
You are a university course curriculum specialist, systems engineering researcher, and academic literature indexer.

### Objective
Your task is to analyze a single lecture slide deck and generate a comprehensive **Lecture Literature Additions JSON file** that strictly adheres to `lecture_literature_additions_template.json`.

- **File Name**: `<lecture_prefix>_literature.json` (e.g., `L1_literature.json`, `L2_literature.json`, or `01_intro_literature.json`).
- **Placement**: Save directly inside `Code/src/data/lecture_additions/`.
- **Shared Prefix**: Keep the prefix consistent across the lecture's files (e.g. `L1_literature.json`, `L1_exams.json`, `L1_labs.json` all share the `L1_` prefix).

For slides that introduce theoretical models, mathematical formulas, algorithms, or architectural concepts covered in the course's Recommended Readings literature, you will provide deep supplementary engineering knowledge, proofs, trade-offs, and exact literature citations.

---

### Context Provided to You
You have access to:
1. The **target lecture slide deck** (PDF sheets and slide text).
2. The **slides index JSON** (`slides_index.json`) mapping slide numbers to canonical titles and sections.
3. The **recommended readings index JSON** (`rr_index.json`) and supplementary literature texts.
4. The schema template in `lecture_literature_additions_template.json`.

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
  - Use backticks (`` `$var` ``, `` `openssl` ``, `` `$0` ``) exclusively for code, shell syntax, packet headers, and script commands.
  - Use dollar signs (`$E = mc^2$`, `$O(1)$`) exclusively for math notation. Never nest backticks inside dollar signs.
- **Literal Dollar Signs in Prose**: Escape literal dollar signs in prose as `\$` (e.g., `\$100`).

---

### Generation Quality Rules

#### 1. Target Lecture Identification
- Set `"lecture_id"` to the exact `id` from `slides_index.json` (e.g. `"lectures-intro"`, `"l1-crypto-intro"`).
- **DO NOT** repeat the lecture document filename or lecture title at the top level — these are inherited automatically from `slides_index.json`.

#### 2. Slide Selection & Lean Slide Objects
- The `"slides"` array must be strictly ordered by 1-indexed physical slide number (`slide: 1, 2, ...`).
- Only include slides that introduce a distinct conceptual topic, formula, architectural model, or testable mechanism connecting to the Recommended Readings. Slides with no literature connection are omitted.
- **DO NOT include slide `title` or `section`** inside each slide entry. Slide titles and sections are defined centrally in `slides_index.json` and merged automatically. Each slide entry only requires `"slide"` and `"literature_additions"`:
  ```json
  {
    "slide": 14,
    "literature_additions": [ ... ]
  }
  ```

#### 3. Recommended Readings Literature Additions (`literature_additions`)
- For each concept on the slide that connects to the Recommended Readings, create a literature addition:
  - **`concept`**: Clear, descriptive name of the concept or trade-off (e.g. `"Paired vs. Unpaired Experimental Design & Variance Reduction"`, `"Reductionist Security Proofs vs. Real-World Attack Surfaces"`).
  - **`content`**: Rigorous technical depth from the papers/textbooks. Explain:
    - *Underlying mechanisms*: Protocol boundaries, mathematical assumptions, algorithmic complexity ($O(1)$ vs $O(\\log N)$), or hardware limits (TCAM, memory caches, bus contention).
    - *Trade-offs*: Why one approach is chosen over another, failure modes, asymptotic behavior.
    - *Empirical findings*: Real-world measurement results and pitfalls documented in the literature.
    - **PROHIBITION**: Never say "According to the paper..." or "Slide X states...". State technical facts directly.
  - **`citations`**: Array of citation objects referencing the literature index (`rr_index.json`):
    ```json
    {
      "id": "rr-perf-eval",
      "slide": 26,
      "type": "literature"
    }
    ```

---

### Output Format
- Return **ONLY** a valid JSON object matching `lecture_literature_additions_template.json`.
- Do not output introductory conversational text or concluding remarks outside the code block.
- Verify with a JSON linter that every string is properly closed and all backslashes are double-escaped.
```