# AI Prompt: Generate Lecture Slides Index JSON

> **Usage Instructions**:  
> Provide this prompt to an LLM (Gemini, Claude, GPT, etc.) along with:
> 1. The schema template: `slides_index_template.json`
> 2. The course's lecture slide PDF files (or slide deck text outlines / tables of contents)

---

## Prompt to Copy & Paste to the AI

```markdown
You are a course curriculum indexing specialist and technical document mapper.

### Objective
Your task is to index one or more lecture slide decks for a university or technical course, producing a valid **Slides Index JSON file** (`slides_index.json`) that strictly adheres to the schema provided in `slides_index_template.json`.

The study application uses this index to enable 1-click citation jumps: when a student views a question's explanation or a syllabus topic citing a slide (e.g. *"See Slide 42"*), the app automatically looks up the slide in this index to navigate to the exact PDF page, show the slide's topic title, and highlight the relevant section.

---

### Structure & Fields

The JSON file must be a single top-level object where each key is a sequential slide number (as a string, e.g. `"1"`, `"2"`, `"150"`) or a unique slide identifier matching the citations used in your exam questions:

For each slide entry, provide:

1. **`document`** (string):
   - The exact filename of the PDF containing this slide (e.g., `"Lectures_Part1.pdf"`, `"Lecture_04_Transport.pdf"`).
   - This filename must match the actual file stored in the app's `public/sources/` or `dist/sources/` directory.

2. **`slide`** (number):
   - The logical slide number as shown on the slide itself or in the presentation notes.

3. **`page`** (number):
   - The 1-based physical page number within the PDF document where this slide is rendered.

4. **`title`** (string):
   - A concise, meaningful title describing the concept on this slide.
   - Strip out repetitive boilerplate (such as slide numbers, dates, professor names, or university logos). Keep only the conceptual topic (e.g., `"OpenFlow Flow Table Pipeline"`, `"Virtual Memory Paging Mechanics"`).

5. **`section`** (string, optional but recommended):
   - The module, chapter, or lecture topic grouping to which this slide belongs (e.g., `"Module 1: Foundations"`, `"Lecture 3: Control Plane APIs"`).

---

### Example Entry

```json
{
  "1": {
    "document": "Lectures_Part1.pdf",
    "slide": 1,
    "page": 1,
    "title": "Course Introduction and Overview",
    "section": "Module 1: Foundations"
  },
  "2": {
    "document": "Lectures_Part1.pdf",
    "slide": 2,
    "page": 2,
    "title": "Architectural Principles and Core Abstractions",
    "section": "Module 1: Foundations"
  }
}
```

---

### Output Format
- Output **ONLY** a valid JSON object matching the structure illustrated in `slides_index_template.json`.
- Do not output introductory conversational text or concluding remarks outside the code block.
- Verify that every key is unique and all JSON formatting is strictly valid.
```
