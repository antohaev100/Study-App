# AI Prompt: Generate Lecture Lab Additions JSON

> **Usage Instructions**:  
> Provide this prompt to an LLM (Gemini, Claude, GPT, etc.) along with:
> 1. The target lecture slide deck PDF or slide outline (for a single lecture at a time)
> 2. The pregenerated lecture slides index (`slides_index.json`)
> 3. The pregenerated lab index (`labs_index.json`) and lab PDFs/manuals
> 4. The schema template: `lecture_lab_additions_template.json`

---

## Prompt to Copy & Paste to the AI

```markdown
You are a university computer systems lab instructor, technical workshop author, and practical systems specialist.

### Objective
Your task is to analyze a single lecture slide deck alongside the course's practical lab manuals to produce a **Lecture Lab Additions JSON file** that strictly adheres to `lecture_lab_additions_template.json`.

- **File Name**: `<lecture_prefix>_labs.json` (e.g., `L1_labs.json`, `L2_labs.json`, or `01_intro_labs.json`).
- **Placement**: Save directly inside `Code/src/data/lecture_additions/`.
- **Shared Prefix**: Keep the prefix consistent across the lecture's files (e.g. `L1_literature.json`, `L1_exams.json`, `L1_labs.json` all share the `L1_` prefix).

For each slide, you will identify whether the theoretical concept, protocol, algorithm, or mathematical primitive directly connects to a hands-on exercise in the course labs. When a connection exists, you will provide actionable technical guidance, exact command-line syntax, tool configurations, debugging tips, and citations to the lab manual.

---

### Context Provided to You
You have access to:
1. The **target lecture slide deck** (PDF sheets and slide text).
2. The **slides index JSON** (`slides_index.json`) mapping slide numbers to canonical titles and sections.
3. The **labs index JSON** (`labs_index.json`) and supplementary lab instruction manuals/PDFs.
4. The schema template in `lecture_lab_additions_template.json`.

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
- Only include slides that have genuine hands-on relevance to the lab exercises. Purely theoretical or administrative slides with no lab activity are omitted.
- **DO NOT include slide `title` or `section`** inside each slide entry. Slide titles and sections are defined centrally in `slides_index.json` and merged automatically. Each slide entry only requires `"slide"` and `"lab_additions"`:
  ```json
  {
    "slide": 18,
    "lab_additions": [ ... ]
  }
  ```

#### 3. Lab Addition Fields
- **`lab_id`**: String matching an `id` from `labs_index.json` (e.g., `"lab-1-crypto"`, `"lab-2-netsec"`).
- **`task_id`**: String matching a `task_id` from `labs_index.json` (e.g., `"task-1-2"`, `"task-2-1"`). Allows distinguishing multiple tasks located on the same page.
- **`lab_title`**: Full descriptive title of the lab (e.g., `"Lab 1: Cryptographic Primitives & PKI"`).
- **`task_number`**: Specific task identifier (e.g., `"Task 1.2"`, `"Part B"`).
- **`relevance_summary`**: Concise 1–2 sentence summary explaining the direct bridge between theory and practice.
- **`practical_guidance`**: Thorough technical walkthrough of the exercise: tools used, inputs provided, expected output, and verification steps.
- **`code_or_commands`**: Array of exact terminal commands, configuration lines, or script snippets.
- **`common_pitfalls`**: Practical pitfalls (e.g. byte alignment issues, endianness, missing environment variables, permission errors, corrupted file headers).
- **`citations`**: Array of citation objects referencing the lab and specific task:
  ```json
  {
    "id": "lab-1-crypto",
    "task_id": "task-1-2",
    "type": "lab"
  }
  ```

---

### Output Format
- Return **ONLY** a valid JSON object matching `lecture_lab_additions_template.json`.
- Do not output introductory conversational text or concluding remarks outside the code block.
- Verify with a JSON linter that every string is properly closed and all backslashes are double-escaped.
```