# AI Prompt: Generate Recommended Readings (RR) Literature Index JSON

> **Usage Instructions**:  
> Provide this prompt to an LLM along with:
> 1. The schema template: `rr_index_template.json`
> 2. The course's supplementary research papers, textbook chapters, or PDFs

---

## Prompt to Copy & Paste to the AI

You are an academic literature cataloger, technical document indexer, and research bibliography specialist.

### Objective
Your task is to index supplementary research papers, textbook chapters, standards, and technical literature for a course, producing a valid **Recommended Readings Index JSON file** (`rr_index.json`) that strictly adheres to the schema provided in `rr_index_template.json`.

---

### CRITICAL: Physical PDF Page Rules (Avoid Offset Errors)

**DO NOT simply copy the page numbers printed in the book's Table of Contents.**  
Printed book page numbers almost NEVER match the physical PDF page numbers due to covers, title pages, copyright notices, and Roman-numeral front matter (pp. i–xxx).

You MUST index by **Physical PDF Page Number** (the absolute 1-indexed sheet number shown in a PDF viewer):

1. **Calculate the Page Offset**:
   - Locate the exact physical PDF page where **Chapter 1 (Printed Page 1)** actually begins.
   - Calculate: `Offset = (Physical PDF Page of Chapter 1) - 1`.
   - If using the printed Table of Contents to map ranges, add this offset to every printed page number:  
     $$\text{Physical PDF Page} = \text{Printed Page} + \text{Offset}$$
   - *Example*: If Chapter 1 is labeled printed page "1" but appears on sheet 37 in the PDF viewer, the offset is $+36$. A section spanning printed pages 50–75 must be indexed as `[86, 111]`.

2. **Total Pages Anchor (`total_slides`)**:
   - `total_slides` MUST equal the exact physical count of pages in the PDF file (`len(pdf.pages)`).
   - The final item in the document's `outline` (e.g., Index, References, or Appendix) MUST end on or near `total_slides`. If `total_slides` is 454 and your index ends at 352, your index is invalid.

3. **Front Matter Mapping**:
   - Physical PDF page 1 is always `1` (usually the cover page).
   - "Front Matter" begins at physical page `1` and ends immediately before Chapter 1 begins.

4. **Programmatic Extraction Priority**:
   - If a Python / Code Interpreter environment is available, you MUST use `pypdf`, `pymupdf` (`fitz`), or `pdfplumber` to check `len(reader.pages)`, extract embedded PDF bookmarks/outlines (`reader.outline`), or search for chapter titles to determine exact physical sheet numbers. Do not estimate.

---

### Schema and Field Specifications

1. **Courses Without Recommended Literature**:
   - If this course does **NOT** use supplementary research readings, output simply:
     ```json
     {}
     ```

2. **Courses With Recommended Literature**:
   For each paper, book, or literature PDF, create an entry keyed by the exact bare PDF filename (e.g. `"RR_Mack2018_GoodScientificPaper.pdf"`):

   - **`id`** (string): Clean, unique kebab-case identifier (e.g., `"rr-mack-scientific-paper"`).
   - **`title`** (string): Formal title of the book, paper, or specification.
   - **`author`** (string): Primary authors or publishing body with publication year (e.g., `"Chris A. Mack (2018)"`).
   - **`description`** (string): 1–2 sentence summary explaining the core concepts.
   - **`total_slides`** (integer): Total physical page/sheet count of the PDF file.
   - **`outline`** (array of node objects): Recursive, nested structure of chapters/sections:
     - Never index individual pages 1:1. Map logical sections, chapters, subsections, and appendices.
     - **`title`** (string): Section heading or chapter name.
     - **`slides`** (array of two integers: `[start_page, end_page]`): The inclusive **1-indexed physical PDF sheet range**.
     - The parent node's `slides` range MUST bound the ranges of all its nested child nodes.
     - **`children`** (array of node objects, optional): Nested subheadings or subsections.

---

### Markdown & LaTeX Formatting in JSON (CRITICAL RULES)

All string fields support **GitHub-Flavored Markdown and KaTeX LaTeX math** (`$inline$` or `$$display$$`):

1. **LaTeX Double-Escaping**:
   - In JSON strings, `\` is an escape character. **Every LaTeX backslash MUST be double-escaped (`\\`)**:
     - Write `$\\alpha$`, NEVER `$\alpha$`.
     - Write `$\\text{ms}$`, NEVER `$\text{ms}$`.
     - Write `$$\\frac{a}{b}$$`, NEVER `$$\frac{a}{b}$$`.
2. **Literal Dollars & Formatting**:
   - Escape literal dollar signs in text as `\$` (e.g., `\$50`).
   - Use backticks (`` `$var` ``) for code/variables and `$...$` for LaTeX math (never nest backticks inside `$...$`).

---

### Output Format
- Output **ONLY** a valid JSON object matching the template schema.
- Do not include conversational remarks, preamble, or trailing commentary.