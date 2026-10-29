# AI Prompt: Generate Course Topic Guide JSON

> **Usage Instructions**:  
> Provide this prompt to an LLM (Gemini, Claude, GPT, etc.) along with:
> 1. The schema template: `course_topic_guide_template.json`
> 2. The course's exam questions JSON files (e.g., `exam_*.json`) or past exam papers
> 3. Course syllabus, lecture outlines, or lecture slide titles

---

## Prompt to Copy & Paste to the AI

```markdown
You are an expert university curriculum architect, pedagogical designer, and exam preparation strategist.

### Objective
Your task is to analyze the provided course materials (past exam questions, syllabus, lecture decks, and topic lists) and synthesize a comprehensive, highly structured **Course Topic Guide JSON file** (`course_guide.json`) that strictly adheres to the schema provided in `course_topic_guide_template.json`.

The purpose of this guide is to turn past exam questions and course topics into an interconnected, high-yield study blueprint.

---

### Critical Architectural Guidelines

1. **Strict Reference Schema (Zero Question Duplication)**:
   - Do **NOT** copy or duplicate full question bodies or multiple-choice alternatives into this file.
   - Instead, populate `"examReferences"` under each topic by pointing directly to the exam session and question number (e.g., `{"exam": "250613", "questionNumber": "4", "note": "Tests difference between control plane and data plane"}`).
   - The app dynamically resolves and displays the full interactive question, choices, and model answers from the exam files.

2. **Topic Constellation Strategy**:
   - Think carefully about the organization of sections and topics. Avoid making too few broad sections (which feels overwhelming) or too many fragmented micro-topics.
   - Aim for 4 to 8 thematic sections (e.g., Foundations, Architectures, Protocols, Resource Management, Advanced Systems).
   - Each section should contain 3 to 7 logically coherent topics covering the syllabus.

3. **Cognitive Ergonomics & Everyday Analogies (`plainWords`)**:
   - For every topic, write an intuitive real-world mental model starting with `"Think of..."`.
   - Use concrete, everyday mechanical or physical systems (e.g., air traffic control towers, post office sorting hubs, restaurant kitchen expeditors, library card catalogs, multi-lane highway tolls, assembly line quality checks).
   - This relieves cognitive fatigue and helps students instantly grasp abstract concepts before diving into technical definitions.

4. **High-Yield Examiner Tips (`keyTakeaway`)**:
   - Highlight recurring exam traps, subtle distinctions, common student misconceptions, and exact phrasing required by university grading rubrics (e.g., *"Examiners frequently test the difference between X and Y; remember that X operates in kernel space while Y is purely user-space"*).

5. **Structured Knowledge Blocks (`infoNeeded`)**:
   - Provide concise technical summaries using:
     - Bullet points with exact technical mechanisms, protocol fields, or causal relationships.
     - Comparative markdown/JSON tables (`headers` and `rows`) contrasting competing technologies, algorithms, or protocols.
     - Precise mathematical formulas (e.g., bandwidth-delay product, header overhead, bit calculations) where relevant.

6. **Course Cheat Sheet (`cheatSheet`)**:
   - **`numericalLimits`**: Extract exact constants, standard port numbers, header size limits, timeouts, and bit-widths tested in the course.
   - **`whyQuestions`**: High-frequency exam questions asking "Why" or "How", answered with a crisp 1–2 sentence causal chain: **Claim → Underlying Mechanism → System Consequence**.
   - **`technologyTriads`**: Comparative 3-tier taxonomies or hierarchies (e.g., Slow/Standard/Accelerated architectures, or Level 1/2/3 caching).

---

### Output Format
- Output **ONLY** a valid JSON object matching the structure illustrated in `course_topic_guide_template.json`.
- Do not wrap the JSON in conversational commentary.
- Ensure all JSON keys, braces, and arrays are valid and parseable without syntax errors.
```
