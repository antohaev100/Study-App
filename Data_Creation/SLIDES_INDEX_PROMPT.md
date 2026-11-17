# AI Prompt: Generate Lecture Slides Index JSON

> **Usage Instructions**:  
> Provide this prompt to an LLM along with:
> 1. The schema template: `slides_index_template.json`
> 2. The course lecture slide PDF (typically 30–50 slides per deck)

---

## Prompt to Copy & Paste to the AI

You are a course curriculum indexing specialist, technical document mapper, and pedagogical structuring expert.

### Objective
Your task is to thoroughly analyze the provided lecture slide deck (typically 30–50 slides), synthesize its pedagogical structure, and produce a valid **Slides Index JSON file** strictly adhering to the schema in `slides_index_template.json`.

- **File Name**: `<lecture_prefix>_slide_index.json` (e.g., `L1_slide_index.json` or `L2_slide_index.json`).
- **Placement**: Save directly inside `Code/src/data/lecture_additions/` alongside the lecture's other files (`L1_literature.json`, `L1_exams.json`, `L1_labs.json`), or as `slides_index.json` in `Code/src/data/`.
- **Unified Loading**: The app automatically detects, loads, and merges all slide indexes across lectures into a single unified data source.

- **File Name**: `<lecture_prefix>_slide_index.json` (e.g., `L1_slide_index.json`, `L2_slide_index.json`, or `01_intro_slide_index.json`).
- **Placement**: Save directly inside `Code/src/data/lecture_additions/` alongside the lecture's other files (`L1_literature.json`, `L1_exams.json`, `L1_labs.json`), or as `slides_index.json` in `Code/src/data/`.
- **Unified Loading**: The app automatically detects, loads, and merges all slide indexes across lectures into a single unified data source.

---

### Critical Indexing & Extraction Rules

1. **Beamer Overlays & Multi-Step Reveals (CRITICAL)**:
   - In academic slide decks (e.g., LaTeX Beamer), bullet points, math equations, or diagrams frequently appear incrementally across multiple physical PDF sheets.
   - **DO NOT collapse or merge progressive reveal slides into a single entry.** Every single physical PDF sheet must have its own distinct entry in `pageMap`.
   - When consecutive physical slides share the same printed slide number and title, identify the newly revealed element on each sheet and reflect it in the `title` (e.g., `"Three Algorithms: 1. Key Generation ($KGen$)"`, `"Three Algorithms: 2. Public Encryption ($Enc$)"`, `"Three Algorithms: 3. Decryption ($Dec$)"`).

2. **No Synthetic Padding or Trailing Hallucinations**:
   - Every entry in `pageMap` must map to actual, visible content in the PDF document.
   - **NEVER invent placeholders** (such as `"Bonus Slide"`, `"Appendix"`, or duplicate generic concluding entries) at the end of `pageMap` to force the length to match `total_slides`. If your slide count falls short of `total_slides`, you collapsed or skipped progressive overlay slides earlier in the deck.

3. **1-to-1 Physical Alignment & Anchoring**:
   - `total_slides` MUST match the exact physical sheet count in the PDF (`len(pdf.pages)`).
   - `pageMap` MUST be strictly ordered with `slide` incrementing by 1: `slide: 1, 2, 3, ..., total_slides`.
   - **End Anchor Check**: The final element in `pageMap` MUST have `"slide": total_slides`.

4. **Logical Slide Numbers (`page`)**:
   - `page` represents the visible slide number printed on the presentation slide itself.
   - When multiple consecutive physical slides are progressive overlays of the same slide, they will all share the **same** integer value for `page`.
   - Set `"page": null` for unnumbered slides (title covers, agenda/outline slides, transition/section dividers).

5. **Disambiguation & Section Cohesion**:
   - Disambiguate generic headers (e.g., "Example", "Properties", "Analysis") using specific body content from that slide.
   - Assign every slide a meaningful `section` representing the topic grouping or module (e.g., `"Course Introduction"`, `"RSA Cryptosystem"`, `"Summary & Discussion"`).

6. **Lecture Index & Title Separation**:
   - Extract the sequential lecture number or index into the dedicated `lecture_index` field (e.g., `1`, `2`, `3`, or `"L1"`).
   - **Do NOT duplicate the lecture index in the `title`** (e.g., write `"Public-key Crypto I"` or `"Hashes, MACs, and Passwords"`, NOT `"Lecture 3: Public-key Crypto I"`). The application automatically formats and displays the lecture index prefix across the lecture selector, outline, citations, and library.

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

The JSON output must be a single top-level object keyed by the exact bare PDF filename (e.g., `"L3_Public-key Crypto I.pdf"`):

- **`id`** (string): Unique kebab-case identifier (e.g., `"lec03-public-key-crypto-1"`).
- **`lecture_index`** (integer, string, or `null`): The sequential lecture number or index (e.g., `3`, `"3"`, `"L3"`, or `null`).
  - **Rule**: Keep `title` clean and focused on the topic (e.g., `"Public-key Crypto I"`). Do not prefix `title` with `"Lecture 3: "` when `lecture_index` is provided.
- **`title`** (string): Full descriptive topic title of the lecture (without duplicate "Lecture X:" prefixes).
- **`author`** (string): Instructor(s), department, or university.
- **`description`** (string): 1–2 sentence summary of core concepts covered in this deck.
- **`total_slides`** (integer): Total physical sheets in the PDF.
- **`total_pages`** (integer or `null`): Highest printed slide number, or `null` if slides are unnumbered.
- **`pageMap`** (array of objects):
  - **`slide`** (integer): 1-indexed physical PDF sheet number (`1` to `total_slides`).
  - **`page`** (integer or `null`): Printed logical slide number, or `null`.
  - **`title`** (string): Specific, disambiguated slide topic title.
  - **`section`** (string): Thematic lecture module grouping.

---

### Output Format
- Output **ONLY** a valid JSON object matching the template schema.
- Do not output preamble, Markdown commentary, or follow-up notes outside the JSON block.