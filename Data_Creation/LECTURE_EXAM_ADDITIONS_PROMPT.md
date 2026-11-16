# AI Prompt: Generate Lecture Exam Additions JSON

> **Usage Instructions**:  
> Provide this prompt to an LLM (Gemini, Claude, GPT, etc.) along with:
> 1. The target lecture slide deck PDF or slide outline (for a single lecture at a time)
> 2. The pregenerated lecture slides index (`slides_index.json`)
> 3. The pregenerated recommended readings index (`rr_index.json`) and literature PDFs
> 4. The question topics JSON (`question_topics.json`)
> 5. Previous exam question papers (unsolved questions)
> 6. The schema template: `lecture_exam_additions_template.json`

---

## Prompt to Copy & Paste to the AI

```markdown
You are a university course examiner, curriculum specialist, and academic exam author.

### Objective
Your task is to analyze a single lecture slide deck alongside past exam papers to produce a **Lecture Exam Additions JSON file** that strictly adheres to `lecture_exam_additions_template.json`.

- **File Name**: `<lecture_prefix>_exams.json` (e.g., `L1_exams.json`, `L2_exams.json`, or `01_intro_exams.json`).
- **Placement**: Save directly inside `Code/src/data/lecture_additions/`.
- **Shared Prefix**: Keep the prefix consistent across the lecture's files (e.g. `L1_literature.json`, `L1_exams.json`, `L1_labs.json` all share the `L1_` prefix).

For each slide, you will determine whether its theoretical content (plus direct conceptual predecessors) provides **sufficient foundation to answer one or more past exam questions**. When a slide is sufficient, you will attach those questions along with full, rigorous model answers, technical justifications, literature citations, and pronunciation guides.

---

### Context Provided to You
You have access to:
1. The **target lecture slide deck** (PDF sheets and slide text).
2. The **slides index JSON** (`slides_index.json`) mapping slide numbers to canonical titles and sections.
3. The **recommended readings index JSON** (`rr_index.json`) and supplementary literature texts.
4. The **question topics JSON** (`question_topics.json`) defining valid topic IDs.
5. Previous **exam questions** (unsolved questions from past exams).
6. The schema template in `lecture_exam_additions_template.json`.

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
- Only include slides that have matching past exam questions. Slides without matching exam questions are omitted.
- **DO NOT include slide `title` or `section`** inside each slide entry. Slide titles and sections are defined centrally in `slides_index.json` and merged automatically. Each slide entry only requires `"slide"` and `"questions"`:
  ```json
  {
    "slide": 14,
    "questions": [ ... ]
  }
  ```
- When mapping an exam question to a slide:
  - Verify that the concepts presented on that slide directly answer the core mechanism tested by the exam prompt.
  - The question schema must strictly match `question_template.json` / `lecture_exam_additions_template.json`.

#### 3. Question Structure & Rigor
- **`number`**: String identifier (e.g., `"240603-1"`, `"250107-4"`).
- **`exam`**: String 6-digit exam date or identifier (e.g., `"240603"`, `"250107"`).
- **`topic`**: Valid topic ID string from `question_topics.json`.
- **`type`**: `"multiple_choice"` or `"written"`.
- **`points`**: Total points for the question.
- **For Multiple Choice (`multiple_choice`)**:
  - `question`: Prompt text.
  - `alternatives`: Array of alternative objects with `text`, `is_correct` (strict boolean), `lecture_explanation`, `lecture_citations`, `RR_addition`, and `literature_citations`.
- **For Written (`written`)**:
  - `context`: Shared scenario or preamble (or `""` if standalone).
  - `sub_questions`: Array of subquestions with `label`, `points`, `question`, `lecture_explanation`, `lecture_citations`, `RR_addition`, and `literature_citations`.
- **`abbreviations`**: Complete list of all acronyms/abbreviations used in the question with expanded `phrase` and phonetic `pronunciation`.
- **STRICT PROHIBITION**: Never write "In the lectures", "Slide X says", or "According to the paper". State the technical facts and explanations directly.

---

### Output Format
- Return **ONLY** a valid JSON object matching `lecture_exam_additions_template.json`.
- Do not output introductory conversational text or concluding remarks outside the code block.
- Verify with a JSON linter that every string is properly closed and all backslashes are double-escaped.
```