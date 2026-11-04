### Your Task
You have been provided with:
1. The exam paper for Exam 231030
2. The question topics JSON (defining all course sections and available topics with their unique `id` values)
3. The course lecture slides
4. The Recommended Reading research papers (if applicable)
5. The schema template in question_template.json.

Generate a complete, pristine, production-ready JSON file for ALL questions in Exam 231030 following the exact schema shown in question_template.json.

---

### Markdown & LaTeX Formatting in JSON (CRITICAL RULES)

All textual fields in the JSON are rendered by a full Markdown parser (Marked.js) with KaTeX math support. Take full advantage of formatting, but you MUST strictly follow JSON escaping rules:

#### 1. Markdown Formatting
- Use `**bold**` for key terms, planes, architectural invariants, and protocol names.
- Use `` `code` `` for functions, commands, registers, header fields, instruction names, or parameters.
- Use `- item` or `1. item` when explaining multi-stage sequences or operational steps.

#### 2. LaTeX Math & Mandatory Double-Escaped Backslashes (`\\`)
- **Math Delimiters**: Use `$math$` for inline math and `$$math$$` for standalone display equations. Avoid `\(...\)` and `\[...\]` in JSON strings to prevent delimiter escape errors.
- **CRITICAL BACKSLASH RULE FOR JSON**: In JSON strings, the backslash `\` is the JSON escape character. Therefore, **every LaTeX command MUST use double backslashes (`\\`)**:
  - Write `$\\alpha$`, NEVER `$\alpha$` (single `\a` is an illegal JSON escape and crashes the JSON parser).
  - Write `$\\text{ms}$`, NEVER `$\text{ms}$` (single `\t` is parsed as a literal tab character, corrupting the LaTeX command).
  - Write `$$\\frac{a}{b}$$`, NEVER `$$\frac{a}{b}$$` (single `\f` is parsed as a form feed character, corrupting the formula).
  - Write `$\\beta$`, NEVER `$\beta$` (single `\b` is parsed as a backspace character).
  - Write `$\\newline$`, NEVER `$\newline$` (single `\n` is parsed as a newline character).
  - Always double-escape mathematical operators: `$\\le$`, `$\\ge$`, `$\\times$`, `$\\cdot$`, `$\\dots$`, `$\\sqrt{...}$`, `$\\approx$`, `$\\sum$`.
  - For line breaks inside math arrays/matrices (`\\`), use quadruple backslashes in JSON: `\\\\`.
- Any unescaped single backslash before a LaTeX command will produce invalid JSON or silently corrupt the formula text.

---

### Quality Rules

#### 1. Question Topic Assignment (`topic`)
- Every question MUST have a `"topic"` property specifying the exact topic it belongs to.
- Use the provided **question topics JSON** to see all available topics and their IDs (e.g. `"topic-1-1"`, `"topic-fate-sharing"`, `"topic-codel"`).
- Analyze the core concept, mechanism, or scenario tested in the question, look up the best-fitting topic from the question topics JSON, and set `"topic"` to that topic's exact `id`.
- **PROHIBITION**: Do NOT invent new topic IDs. Only use topic IDs present in the provided question topics JSON.

#### 2. Technical Explanations (`lecture_explanation`)
- Explain WHY each alternative is True or False using technical principles.
- Format key terms with **bolding** and protocol commands/identifiers in `` `code` ``.
- **PROHIBITION**: Do NOT use meta-phrases such as:
  - "In the lectures..."
  - "Slide X states that..."
  - "The slides explain that..."
  - "According to the lecture..."
  State the technical networking facts directly.

#### 3. Lecture Citations (`lecture_citations`)
- For every cited slide, compute the exact PDF page number:
  - For example:
    - document: "Lectures.pdf"
    - page: <slide_number> (e.g., Slide 93 is page 93)
- Set "slide": <slide_number>, "label": "Slide <slide_number>", "title": "<Slide Title>", and "type": "lecture".

#### 4. Literature Additions (`RR_addition`)
- The literature addition must be a GENUINE ADDITION and must NEVER repeat or paraphrase the lecture explanation.
- Provide deeper systems context from the Recommended Reading papers.
- **PROHIBITION**: Do NOT write "According to the paper...", "As explained in RR_...", or mention raw filenames in the text. Citations are handled by the literature_citations array.

#### 5. Literature Citations (`literature_citations`)
- Set "document" to the exact relative path in Recommended_Readings/, Example:
  - "Recommended_Readings/RR_SDN_Feamster14.pdf" (Feamster et al. 2014)
  - "Recommended_Readings/RR_SDN_Nunez23.pdf" (Nuñez et al. 2023)
  - "Recommended_Readings/RR_SDN_Hauser21.pdf" (Hauser et al. 2021)
- Set "page" to the exact 1-indexed page inside that PDF.
- Set "section" (e.g., "Section 1", "Section IV", "Section 3.6") and "label" (e.g., "Feamster et al. (2014) §1 (p. 1)").

---

### Output Format
- Return ONLY a valid JSON object matching the root structure:
```json
{
  "exam": "231030",
  "questions": [
    {
      "number": "1",
      "topic": "[MATCHING_TOPIC_ID]",
      "type": "multiple_choice",
      "points": 3,
      "question": "...",
      "alternatives": [
        ...
      ],
      "abbreviations": [
        ...
      ]
    }
  ]
}
```
