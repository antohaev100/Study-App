# AI Prompt: Generate Hands-on Labs Index JSON (`labs_index.json`)

> **Usage Instructions**:  
> Provide this prompt to an LLM (Gemini, Claude, GPT, etc.) along with:
> 1. The course's hands-on lab manuals, assignment instructions, or task sheets (PDFs)
> 2. The schema template: `labs_index_template.json`

---

## Prompt to Copy & Paste to the AI

You are a university laboratory curriculum coordinator and computer systems educator.

### Objective
Your task is to index the course's practical hands-on lab assignments and manuals, producing a valid **Labs Index JSON file** (`labs_index.json`) that strictly adheres to the schema provided in `labs_index_template.json`.

The study application uses this index to power lab manual lookups in the Sources Library, resolve clickable citations, and connect lecture slides to hands-on exercises.

---

### Important Rules & Behavior

1. **Courses Without Practical Labs**:
   - If this course does **NOT** feature hands-on labs or assignments, output simply:
     ```json
     {}
     ```

2. **Courses With Practical Labs**:
   For each lab manual PDF, create an entry where the top-level key is the exact bare PDF filename (e.g. `"Lab1_Crypto_PKI.pdf"`, `"Lab2_Network_Security.pdf"`):

   - **`id`** (string): Clean, unique kebab-case identifier (e.g., `"lab-1-crypto"`, `"lab-2-netsec"`).
   - **`lab_number`** (string or integer): Lab number or code (e.g., `"1"`, `"2"`, `"Lab 1"`).
   - **`title`** (string): Formal title of the lab assignment.
   - **`description`** (string): 1–2 sentence summary explaining the core practical concepts and systems evaluated.
   - **`tools`** (array of strings, optional): Primary software tools, utilities, or command-line frameworks used (e.g. `["OpenSSL", "Wireshark", "GnuPG", "Python"]`).
   - **`total_pages`** (integer): Total physical sheets/pages in the lab PDF.
   - **`tasks`** (array of task objects): Mapping of individual exercises, parts, or milestones:
     - **`task_id`** (string): Clean, unique kebab-case identifier for this specific task (e.g., `"task-1-1"`, `"task-1-2"`, `"task-ecb-modes"`). Essential for linking lecture slides to distinct exercises when multiple tasks share the same page.
     - **`task`** (string): Human-readable task identifier (e.g., `"Task 1"`, `"Part A"`, `"Step 1.2"`).
     - **`title`** (string): Concise descriptive title of the specific exercise.
     - **`pages`** (array of two integers: `[start_page, end_page]`): 1-indexed inclusive physical PDF page bounds.

---

### Markdown & LaTeX Formatting in JSON (CRITICAL RULES)

All string fields (`title`, `description`, `tasks[].title`) support **GitHub-Flavored Markdown and KaTeX LaTeX math** (`$inline$` or `$$display$$`). You MUST strictly follow JSON escaping rules:

1. **Markdown Formatting**:
   - Use `**bold**`, `*italics*`, and inline `` `code` `` for command-line tools, parameters, and flags.
2. **LaTeX Math & Mandatory Double-Escaped Backslashes (`\\`)**:
   - Use `$math$` for inline math and `$$math$$` for standalone display math.
   - **CRITICAL**: Every LaTeX backslash in JSON MUST be double-escaped (`\\`):
     - Write `$\\alpha$`, NEVER `$\alpha$`.
     - Write `$\\text{ms}$`, NEVER `$\text{ms}$`.
3. **Separation of Code vs. Math & No Raw HTML**:
   - Never output raw HTML or MathML tags (e.g. `<span class="katex">`, `<math>`).
   - Use backticks (`` `$var` ``, `` `openssl` ``) exclusively for code/variables and `$...$` exclusively for math.
   - Escape literal dollar signs in prose as `\$`.

---

### Output Format
- Output **ONLY** a valid JSON object matching `labs_index_template.json` (or `{}` if no labs).
- Do not output conversational preamble or concluding remarks outside the code block.
- Ensure all page bounds strictly adhere to 1-indexed PDF physical page positions.
