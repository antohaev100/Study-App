# AI Prompt: Generate Recommended Readings (RR) Literature Index JSON

> **Usage Instructions**:  
> Provide this prompt to an LLM (Gemini, Claude, GPT, etc.) along with:
> 1. The schema template: `rr_index_template.json`
> 2. The course's supplementary research papers, technical reports, textbook chapters, or RFC PDFs (or their tables of contents/outlines)

---

## Prompt to Copy & Paste to the AI

You are an academic literature cataloger, technical document indexer, and research bibliography specialist.

### Objective
Your task is to index supplementary research papers, textbook chapters, standards, and technical literature for a course, producing a valid **Recommended Readings Index JSON file** (`rr_index.json`) that strictly adheres to the schema provided in `rr_index_template.json`.

The study application uses this hierarchical index to power source citation lookups, in-app literature navigation, search, and deep-dive insights.

---

### Important Rules & Behavior

1. **Courses Without Recommended Literature**:
   - If this course does **NOT** use supplementary research readings or literature, output simply:
     ```json
     {}
     ```

2. **Courses With Recommended Literature**:
   For each paper, book, or literature PDF, create an entry where the top-level key is the exact bare PDF filename (e.g. `"RR_measuring-computer-performance-a-practitioners-guide.pdf"`, `"RR_SDN_Survey21.pdf"`):

   - **`id`** (string): Clean, unique kebab-case identifier (e.g., `"rr-lilja-perf"`).
   - **`title`** (string): Formal title of the book, paper, or specification.
   - **`author`** (string): Primary authors or publishing body with publication year.
   - **`description`** (string): 1–2 sentence summary explaining the core concepts.
   - **`total_slides`** (integer): Total physical slide/sheet count in the PDF.
   - **`outline`** (array of node objects): A recursive, nested table of contents reflecting the actual document structure.
     - Never index individual pages 1:1. Map logical sections, chapters, subsections, and appendices.
     - Each node supports arbitrary recursive nesting via optional `children`.
     - **`title`** (string): Formal heading, chapter name, or section title.
     - **`slides`** (array of two integers: `[start_slide, end_slide]`): The 1-indexed inclusive physical PDF sheet range covered by this topic/section.
     - The `slides` range of a parent node must bound the ranges of all its nested child nodes.
     - **`children`** (array of node objects, optional): Nested subheadings, subsections, or sub-topics (`title`, `slides`, and further optional `children`).

---

### Markdown & LaTeX Formatting in JSON (CRITICAL RULES)

All string fields (`title`, `author`, `description`, `outline[].title`) support **GitHub-Flavored Markdown and KaTeX LaTeX math** (`$inline$` or `$$display$$`). You MUST strictly follow JSON escaping rules:

1. **Markdown Formatting**:
   - Use `**bold**`, `*italics*`, and inline `` `code` `` where appropriate for technical terms, protocol names, or identifiers.
2. **LaTeX Math & Mandatory Double-Escaped Backslashes (`\\`)**:
   - Use `$math$` for inline math and `$$math$$` for standalone display math. Avoid `\(...\)` and `\[...\]` in JSON strings.
   - **CRITICAL BACKSLASH RULE FOR JSON**: In JSON strings, `\` is the JSON escape character. **Every LaTeX command MUST use double backslashes (`\\`)**:
     - Write `$\\alpha$`, NEVER `$\alpha$` (illegal JSON escape).
     - Write `$\\text{ms}$`, NEVER `$\text{ms}$` (`\t` becomes a tab).
     - Write `$$\\frac{a}{b}$$`, NEVER `$$\frac{a}{b}$$` (`\f` becomes a form feed).
3. **Separation of Code vs. Math & No Raw HTML**:
   - Never output raw HTML or MathML tags (e.g. `<span class="katex">`, `<math>`).
   - Use backticks (`` `$var` ``) exclusively for code/variables and `$...$` exclusively for LaTeX math (never nest backticks inside `$...$`).
   - Escape literal dollar signs in prose as `\$` (e.g., `\$100`).

---

### Output Format
- Output **ONLY** a valid JSON object matching `rr_index_template.json` (or `{}` if no literature).
- Do not output introductory text, markdown formatting blocks outside the JSON, or conversational remarks.
- Ensure all ranges strictly adhere to 1-indexed PDF physical sheet positions.