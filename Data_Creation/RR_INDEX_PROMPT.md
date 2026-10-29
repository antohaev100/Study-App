# AI Prompt: Generate Recommended Readings (RR) Literature Index JSON

> **Usage Instructions**:  
> Provide this prompt to an LLM (Gemini, Claude, GPT, etc.) along with:
> 1. The schema template: `rr_index_template.json`
> 2. The course's supplementary research papers, technical reports, or RFC PDFs (or a list of their tables of contents/sections)

---

## Prompt to Copy & Paste to the AI

```markdown
You are an academic literature cataloger, technical document indexer, and research bibliography specialist.

### Objective
Your task is to index supplementary research papers, literature readings, standards, and technical RFCs for a course, producing a valid **Recommended Readings Index JSON file** (`rr_index.json`) that strictly adheres to the schema provided in `rr_index_template.json`.

---

### Important Rules & Behavior

1. **Courses Without Recommended Literature**:
   - If this course does **NOT** use supplementary research readings or literature (e.g. only relies on lecture slides and textbook chapters), output simply:
     ```json
     {}
     ```
   - The application is designed to gracefully handle an empty object `{}`: it will automatically omit literature badges, hide literature filters, and show a clean notice in the Sources Library.

2. **Courses With Recommended Literature**:
   For each paper or literature PDF provided, generate an entry where the top-level key is the exact PDF filename (e.g. `"RR_SDN_Survey21.pdf"`, `"RFC_7348.pdf"`):

   - **`title`**: Full academic or formal title of the paper or document.
   - **`author`**: Primary authors, research group, or standards body with publication year (e.g., `"Nick Feamster, Jennifer Rexford, Ellen Zegura (2014)"`, `"IETF Working Group (2014)"`).
   - **`description`**: 1–2 sentence concise summary highlighting the key theoretical or practical systems contributed by this paper and why it is relevant to the course.
   - **`pages`**: Total page count of the PDF document.
   - **`pageMap`**: An array mapping physical PDF page numbers (`1` to `N`) to the major section headings located on that page:
     ```json
     {
       "page": 4,
       "headings": [
         "III. Architectural Principles",
         "Section III.B: Match-Action Pipeline"
       ]
     }
     ```
     - If a page has no section headings, set `"headings": []`.
     - This `pageMap` allows the study app's in-app citation viewer to automatically highlight and navigate directly to the cited section when students click a literature citation in an exam question or topic.

---

### Output Format
- Output **ONLY** a valid JSON object matching `rr_index_template.json` (or `{}` if no literature).
- Do not output preamble, markdown explanations outside the JSON block, or conversational text.
- Ensure all keys and strings are properly escaped and valid JSON.
```
