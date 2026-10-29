### Your Task
You have been provided with:
1. The exam paper for Exam [EXAM ID]
2. The course lecture slides
3. The Recommended Reading research papers
4. The schema template in question_template.json.

Generate a complete, pristine, production-ready JSON file for ALL questions in Exam [EXAM ID] following the exact schema shown in question_template.json.

---

### Markdown & Formatting Support (Use Actively!)
All textual fields in the JSON are rendered by a full Markdown parser (Marked.js) with KaTeX math support. Take full advantage of Markdown
---

### Quality Rules

#### 1. Technical Explanations (`lecture_explanation`)
- Explain WHY each alternative is True or False using technical principles
- Format key terms with **bolding** and protocol commands/identifiers in `` `code` ``.
- **PROHIBITION**: Do NOT use meta-phrases such as:
  - "In the lectures..."
  - "Slide X states that..."
  - "The slides explain that..."
  - "According to the lecture..."
  State the technical networking facts directly.

#### 2. Lecture Citations (`lecture_citations`)
- For every cited slide, compute the exact PDF page number
  - For example
    - document: "Lectures.pdf"
    - page: <slide_number> (e.g., Slide 93 is page 93)
- Set "slide": <slide_number>, "label": "Slide <slide_number>", "title": "<Slide Title>", and "type": "lecture".

#### 3. Literature Additions (`RR_addition`)
- The literature addition must be a GENUINE ADDITION and must NEVER repeat or paraphrase the lecture explanation.
- Provide deeper systems context from the Recommended Reading papers
- **PROHIBITION**: Do NOT write "According to the paper...", "As explained in RR_...", or mention raw filenames in the text. Citations are handled by the literature_citations array.

#### 4. Literature Citations (`literature_citations`)
- Set "document" to the exact relative path in Recommended_Readings/, Example:
  - "Recommended_Readings/RR_SDN_Feamster14.pdf" (Feamster et al. 2014)
  - "Recommended_Readings/RR_SDN_Nunez23.pdf" (Nuñez et al. 2023)
  - "Recommended_Readings/RR_SDN_Hauser21.pdf" (Hauser et al. 2021)
- Set "page" to the exact 1-indexed page inside that PDF.
- Set "section" (e.g., "Section 1", "Section IV", "Section 3.6") and "label" (e.g., "Feamster et al. (2014) §1 (p. 1)").

#### 5. Output Format
- Return ONLY a valid JSON object matching the root structure:
```json
{
  "exam": "[EXAM ID]",
  "questions": [
    ...
  ]
}