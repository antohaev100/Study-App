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

The structure matches the Recommended Readings index schema exactly. The study application uses this index to power 1-click citation jumps: when a student views a question's explanation citing a slide (e.g. `{ "id": "lectures-dvad27", "slide": 106, "type": "lecture" }`), the app automatically looks up this index to resolve the slide title, section module, and navigate directly to that PDF sheet.

---

### Structure & Fields

The JSON file must be a single top-level object where each key is the exact bare PDF filename of a lecture slide deck (e.g. `"DVAD27_Lectures.pdf"`, `"Lectures_Part1.pdf"`):

For each lecture PDF entry, provide:

1. **`id`** (string):
   - A clean, unique kebab-case identifier for this slide deck (e.g. `"lectures-dvad27"`, `"lectures-part1"`). Exam questions will cite slides from this deck using this `id`.

2. **`title`** (string):
   - Full descriptive title of the slide deck or lecture series (e.g., `"DVAD27 Systems Modeling and Simulation: Core Lecture Slides"`).

3. **`author`** (string):
   - Primary instructor(s), university department, or organization (e.g., `"Department of Computer Science"`).

4. **`description`** (string):
   - 1–2 sentence summary of what major topics and concepts this slide deck covers.

5. **`pages`** (integer):
   - Total physical slide count (number of pages/sheets) in the PDF document.

6. **`pageMap`** (array):
   - An array strictly ordered by physical slide number (`slide: 1, 2, ...`):
     - **`slide`** (integer): The 1-indexed physical slide/sheet number inside the PDF (slide 1 is the first slide).
     - **`page`** (integer or `null`): The logical slide number as shown on the slide itself (or `null` for unnumbered/title/blank slides; often equal to `slide` in presentations).
     - **`title`** (string): Concise, meaningful topic title of the slide. Strip repetitive boilerplate (university logos, dates, professor names, slide numbers).
     - **`section`** (string): The module, chapter, or lecture topic grouping to which this slide belongs (e.g., `"Comparisons and ANOVA"`, `"Module 2: Advanced Concepts"`).

---

### Example Entry

```json
{
  "DVAD27_Lectures.pdf": {
    "id": "lectures-dvad27",
    "title": "Systems Modeling and Simulation: Core Lecture Slides",
    "author": "Department of Computer Science",
    "description": "Core lecture slide deck covering performance comparison, statistical ANOVA, Monte Carlo and discrete-event simulation architecture, and NS-2 network simulation scripting.",
    "pages": 450,
    "pageMap": [
      {
        "slide": 1,
        "page": null,
        "title": "Comparisons and ANOVA: Title and Overview",
        "section": "Course Introduction"
      },
      {
        "slide": 2,
        "page": 1,
        "title": "Comparing Two Alternatives: Motivation and Cases",
        "section": "Comparisons and ANOVA"
      },
      {
        "slide": 3,
        "page": 2,
        "title": "Non-Corresponding Measurements: Assumptions",
        "section": "Comparisons and ANOVA"
      },
      {
        "slide": 106,
        "page": 105,
        "title": "Discrete-Event Simulation (DES) Architecture",
        "section": "Simulation Modeling"
      }
    ]
  }
}
```

---

### Output Format
- Output **ONLY** a valid JSON object matching the structure illustrated in `slides_index_template.json`.
- Do not output introductory conversational text or concluding remarks outside the code block.
- Verify that every document key and slide number is unique and valid JSON.
```
