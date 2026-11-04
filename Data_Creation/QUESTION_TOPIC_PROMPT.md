# AI Prompt: Generate Syllabus Sections & Question Topics from Exam Papers

> **Usage Instructions**:  
> Provide this prompt to an LLM (Gemini, Claude, GPT, etc.) along with:
> 1. The schema template: `question_topic_template.json` (or `question_topic_template.json.txt`)
> 2. All available exam questions / papers for the course (e.g., from `src/data/exam_answers/*.json` or past exam PDFs)
> 3. (Optional) Course syllabus, lecture outlines, or lecture slide titles

---

## Prompt to Copy & Paste to the AI

```markdown
You are an expert university curriculum architect, exam analyst, and pedagogical designer.

### Objective
Your task is to analyze all provided past exam papers/questions for this course, discover common patterns, recurring themes, and conceptual relationships, and synthesize a structured master topic taxonomy:
1. **Thematic Sections** (high-level course modules/units, typically 4 to 8 sections)
2. **Question Topics** (specific, focused topics under each section, **strictly 2 to 4 topics per section**)

This output defines the master category structure (`question_topics.json`). Individual exam questions will subsequently reference these topics by their `id`.

Output a pristine, production-ready JSON file following the exact schema shown in `question_topic_template.json`.

---

### Step-by-Step Methodology

#### Step 1: Scan & Identify Recurring Patterns in the Exam Bank
- Review every question and subquestion across all provided exam sessions (e.g., sessions `231102`, `240104`, `250611`, `260611`, etc.).
- Identify recurring questions, repeated mechanisms, shared scenario types, and key theoretical concepts tested by the examiner across multiple exam dates.

#### Step 2: Formulate 4 to 8 Thematic Sections
- Cluster related concepts into natural, cohesive course modules (e.g., *Section 1: Internet Architecture & Design Principles*, *Section 2: Active Queue Management*, *Section 3: Congestion Control Evolution*, *Section 4: Web Protocol Evolution*, etc.).
- For each section, provide:
  - `id`: Unique URL-safe identifier (e.g. `"sec-1-arch"`, `"sec-2-aqm"`, `"sec-3-cc"`)
  - `number`: Section number string (e.g. `"1"`, `"2"`, `"Module I"`)
  - `title`: Descriptive chapter title
  - `subtitle`: 1-line conceptual summary of this section's focus
  - `summary`: 1–2 sentence overview of the problems and architectures addressed in this section
  - `badge`: High-level category badge (e.g. `"Foundations"`, `"Core Architecture"`, `"High Frequency"`, `"Advanced Systems"`)

#### Step 3: Define Strictly 2 to 4 Question Topics per Section
- Under each Section, formulate **between 2 and 4 Question Topics** that capture the distinct questions students will face:
  - **MINIMUM**: 2 topics per section.
  - **MAXIMUM**: 4 topics per section.
- **Architectural Rules**:
  - **Avoid over-fragmentation**: Do NOT create 5 to 10 tiny micro-topics. Group closely related question variants into unified, cohesive topics.
  - **Avoid giant catch-alls**: Do NOT dump all questions into a single vague topic.
  - **Distinct Conceptual Boundaries**: Every topic within a section should represent a clear sub-domain or mechanism (e.g., in an AQM section: Topic 2.1 Bufferbloat Principles, Topic 2.2 CoDel Target/Interval, Topic 2.3 FQ-CoDel Flow Isolation).
- For each topic, provide:
  - `id`: Unique slug that will be used to tag questions (e.g. `"topic-1-1"`, `"topic-fate-sharing"`, `"topic-codel"`)
  - `code`: Hierarchical academic numbering (e.g. `"1.1"`, `"1.2"`, `"2.1"`)
  - `title`: Clear, specific topic title
  - `summary`: Crisp 1–2 sentence definition of the technical concepts, tradeoffs, or protocols assessed under this topic
  - `badge`: Optional badge indicating topic priority or style (e.g. `"Exam Core"`, `"Recurring Conceptual"`, `"Systems Architecture"`, `"Analytical / Calculation"`)

---

### Formatting & JSON Escaping
If titles or summaries contain formatting or mathematical expressions:
- Standard Markdown (`**bold**`, `` `code` ``) is supported.
- If LaTeX math is used, use `$math$` and remember that all LaTeX backslashes in JSON strings MUST be double-escaped as `\\` (e.g. `"$O(1)$"`, `"$\\alpha$"`). Single backslashes like `\t` or `\f` will corrupt text or cause invalid JSON.

---

### Output Format
- Return **ONLY** a valid JSON object matching the root structure of `question_topic_template.json`:
```json
{
  "course": {
    "code": "...",
    "title": "...",
    "subtitle": "...",
    "description": "..."
  },
  "sections": [
    ...
  ]
}
```
- Do **NOT** include exam references or question text in this file; topics are pure category definitions.
- Do **NOT** wrap the JSON in conversational commentary or introductory/conclusion text.
- Ensure all JSON keys, braces, commas, and arrays are valid and parseable without syntax errors.
```
