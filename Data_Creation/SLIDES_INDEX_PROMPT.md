# AI Prompt: Generate Lecture Slides Index JSON

> **Usage Instructions**:  
> Provide this prompt to an LLM along with:
> 1. The schema template: `slides_index_template.json`
> 2. The course lecture slide PDF (typically 30–50 slides per deck)

---

## Prompt to Copy & Paste to the AI

You are a course curriculum indexing specialist, technical document mapper, and pedagogical structuring expert.

### Objective
Your task is to thoroughly read the provided lecture slide deck (typically 30–50 slides), synthesize its pedagogical structure, and produce a valid **Slides Index JSON file** (`slides_index.json`) strictly adhering to the schema in `slides_index_template.json`.

---

### Critical Indexing & Extraction Rules

1. **Holistic Reading & Disambiguation (No Generic Titles)**:
   - Read each slide's body content, equations, code, and diagrams—do not merely extract the header string.
   - Disambiguate repeated slide titles (e.g., consecutive slides titled "Example", "Case Study", "Architecture", or "Properties") by appending specific context derived from the slide's actual body content (e.g., `"Example: Two-Sample t-Test Calculation"`, `"Example: Paired Difference Analysis"`).
   - Strip low-value boilerplate (course codes, semester labels, dates, professor names, "Slide X of Y").

2. **1-to-1 Physical Alignment & Anchoring**:
   - `total_slides` MUST match the exact physical sheet/page count in the PDF document (`len(slides)`).
   - **EVERY physical slide from 1 to `total_slides` must have an entry in `pageMap`**. Never skip title pages, divider slides, review slides, or question pages.
   - The array must be strictly sequential with `slide` incrementing by 1: `slide: 1, 2, 3, ..., total_slides`.
   - **End Anchor Check**: The final element in `pageMap` MUST have `"slide": total_slides`. If `total_slides` is 38, the last entry must be slide 38.

3. **Logical Slide Numbers (`page`)**:
   - `page` represents the visible slide number printed on the presentation slide itself.
   - Set `"page": null` for unnumbered slides (title covers, agenda/outline slides, transition/section dividers).
   - Set `"page": <int>` when a visible slide number is printed.

4. **Section Cohesion**:
   - Assign every slide a meaningful `section` representing the topic grouping or module (e.g., `"Course Introduction"`, `"Hypothesis Testing"`, `"Summary & Next Steps"`).
   - Multi-slide topic arcs must share the same `section` name.

---

### Markdown & LaTeX Formatting in JSON (CRITICAL RULES)

All string fields (`title`, `description`, `pageMap[].title`, `pageMap[].section`) support **GitHub-Flavored Markdown and KaTeX math** (`$inline$` or `$$display$$`):

1. **JSON Double-Escaping**:
   - In JSON strings, `\` is an escape character. **Every LaTeX command backslash MUST be double-escaped (`\\`)**:
     - Write `$\\alpha$`, NEVER `$\alpha$`.
     - Write `$\\text{ms}$`, NEVER `$\text{ms}$`.
     - Write `$$\\frac{a}{b}$$`, NEVER `$$\frac{a}{b}$$`.
     - Write `$\\mathcal{O}(N \\log N)$`, NEVER `$\mathcal{O}(N \log N)$`.
2. **Literal Dollars & Formatting**:
   - Escape literal dollar signs in prose as `\$` (e.g., `\$100`).
   - Use backticks (`` `$var` ``) exclusively for inline code, shell commands, or variable names; use single dollar signs (`$...$`) exclusively for math equations.

---

### Schema and Field Specifications

The JSON output must be a single top-level object keyed by the exact bare PDF filename (e.g., `"Lecture03_Comparisons.pdf"`):

- **`id`** (string): Unique kebab-case identifier (e.g., `"lec03-comparisons"`).
- **`title`** (string): Full descriptive title of the lecture.
- **`author`** (string): Instructor(s), department, or university.
- **`description`** (string): 1–2 sentence summary of core concepts covered in this deck.
- **`total_slides`** (integer): Total physical sheets in the PDF (e.g., `36`).
- **`total_pages`** (integer or `null`): Highest printed slide number, or `null` if slides are unnumbered.
- **`pageMap`** (array of objects):
  - **`slide`** (integer): 1-indexed physical PDF sheet number (`1` to `total_slides`).
  - **`page`** (integer or `null`): Printed logical slide number, or `null`.
  - **`title`** (string): Specific, meaningful slide topic title.
  - **`section`** (string): Topic or lecture module grouping.

---

### Output Format
- Output **ONLY** a valid JSON object matching the template schema.
- Do not output preamble, Markdown commentary, or follow-up notes outside the JSON block.