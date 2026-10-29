# Course Study & Exam Practice App

A universal, course-neutral, JSON-driven web application for mastering academic courses, technical curricula, and university exams. The app runs as a single-page React + TypeScript application that can also be compiled into a standalone, single-file HTML bundle (`dist/index.html`) that works directly in any browser without needing a web server.

---

## Dual Views & Study Modes

The application features two interconnected study interfaces that share the same underlying question models and citations:

### 1. Course Topic Guide View
Organized syllabus and concept roadmap designed for structured curriculum learning:
- **Hierarchical Sections & Topics**: Groups course content into thematic sections (e.g., Foundations, Architectures, Protocols, Advanced Systems).
- **Topic Deep Dives**: Each topic contains an executive summary, key concepts, core exam questions, and related practice questions.
- **Progress Tracking**: Interactive "Mark as Reviewed" toggles per topic with instant visual completion bars and persistent local storage saving.
- **1-Click Exam Jump**: Directly launches Exam Practice Mode focused on the exact question referenced by the topic.
- **Lecture Slide & Literature References**: Direct citations to specific slides and research papers for every topic.

### 2. Interactive Exam Practice Mode
Comprehensive question-by-question practice interface supporting multiple-choice and scenario-based written questions:
- **Browse Mode**: Systematically navigate through exam questions sequentially by exam date and question number.
- **Study Mode**: Shuffles questions randomly, provides structured cognitive stage badges (`Rest` → `Read` → `Answer` → `Understand` → `Next Question`), and tracks active study session time with Pomodoro-friendly break reminders.
- **Interactive Knowledge Verification**:
  - Click alternatives to reveal True/False verdicts, detailed lecture explanations, and supplementary literature additions.
  - Abbreviation lists with full terms, pronunciations, and plain-English definitions (toggleable per question).
  - KaTeX mathematical expression rendering ($...$ inline and $$...$$ block formulas).
  - Built-in Sources Library & Citation Viewer with PDF page jumping.
- **Questions Navigation Drawer**: Filter and instant full-text search across all questions, alternatives, explanations, and abbreviations.
- **Persistent Personal Notes**: Markdown-enabled note-taking saved to local storage for every question.

---

## Course-Neutral Design & Configuration

The application source code is completely course-neutral with zero hardcoded course codes or subject-specific assumptions. You can adapt the app to any course by updating the JSON files in `src/data/`:

| JSON File | Purpose | Template Available |
| :--- | :--- | :--- |
| `src/data/course_guide.json` | Drives the Course Topic Guide view (sections, topics, descriptions, exam question mappings). | `course_topic_guide_template.json` |
| `src/data/exams/*.json` | Questions, options, model answers, explanations, citations, and abbreviations. | `question_template.json` |
| `src/data/slides_index.json` | Index of lecture slide decks, mapping slide numbers to PDF files, page numbers, and slide titles. | `slides_index_template.json` |
| `src/data/rr_index.json` | Index of supplementary literature / Recommended Readings with page maps. | `rr_index_template.json` |

> **Note on Data vs. Code Separation**: All TypeScript code has been cleanly separated into `src/utils/` (`loadExams.ts`, `topicStructure.ts`). The entire `src/data/` folder is dedicated strictly to data JSON files and is gitignored, allowing you to freely add, update, or regenerate course data without modifying git-tracked source code.

---

## AI Prompts for Generating Course Data

To adapt this app to any new course, three dedicated AI prompt files are provided in the repository root. Provide each prompt to an LLM (such as Gemini, Claude, or GPT) together with your course materials and the matching template:

1. **`COURSE_TOPIC_GUIDE_PROMPT.md`**  
   *Pairs with*: `course_topic_guide_template.json`  
   *Purpose*: Instructs the AI to analyze your exam questions, syllabus, and lecture outlines to produce a pedagogical `course_guide.json` with intuitive analogies (`plainWords`), examiner tips, and mapped exam references.

2. **`SLIDES_INDEX_PROMPT.md`**  
   *Pairs with*: `slides_index_template.json`  
   *Purpose*: Instructs the AI to index slide deck PDFs into `slides_index.json` with physical page numbers, slide titles, and lecture sections for 1-click in-app citation jumps.

3. **`RR_INDEX_PROMPT.md`**  
   *Pairs with*: `rr_index_template.json`  
   *Purpose*: Instructs the AI to index supplementary research papers and RFCs with page heading maps into `rr_index.json` (or outputs `{}` if the course does not use supplementary literature).

---

## JSON Data Templates

Comprehensive reference templates with self-documenting comments and examples are provided in both the project root and `src/data/`:

### 1. `question_template.json`
Specifies the format for exam question files (e.g. `src/data/exams/exam_YYYYMMDD.json` or `src/data/exams/YYYYMMDD.json`):
- **Universal Question Schema**: Supports both multiple-choice questions (with `alternatives` array) and open-ended written questions (with `sub_questions` array).
- **Points & Scoring**: Optional `points` field per question or sub-question (the app handles courses with or without point schemes).
- **Model Answers & Explanations**: Rich explanations with slide references (`slide: 42`, `page: 42`).
- **Literature Additions**: Optional `RR_addition` and `literature_citations` fields.
- **Abbreviations List**: Per-question abbreviations list with `abbreviation`, `phrase_words`, and `pronunciation`.

### 2. `course_topic_guide_template.json`
Specifies the syllabus structure for the Course Topic Guide:
- Course metadata: `code`, `title`, `description`, `academic_level`, `total_credits`.
- Sections array: Each section contains an `id`, `title`, `description`, and an array of `topics`.
- Topic definitions: Includes `core_exam_questions` (linking `exam_date` and `question_number`), `related_exam_questions`, `lecture_slide_ranges`, and `literature_citations`.

### 3. `slides_index_template.json`
Maps slide numbers to slide deck PDFs:
- Keys are sequential numbers or slide IDs (e.g. `"1"`, `"2"`, `"150"`).
- Specifies `document` (relative PDF filename), `slide` (slide number), `page` (PDF page), and `title`.

### 4. `rr_index_template.json`
Maps supplementary reading PDFs to page counts and section headings for precise in-app citation jumps.

---

## Using the App Without Recommended Readings (RR)

Some university courses or certifications do not use supplementary research literature or recommended readings. The application is designed to handle this seamlessly:

1. **Set `src/data/rr_index.json` to `{}`** (empty object).
2. **Omit `RR_addition` and `literature_citations`** in your `exam_*.json` files.
3. **App Behavior**:
   - The Sources Library will automatically display a clean notice stating that no supplementary literature is required.
   - Question cards will omit literature addition pills and focus exclusively on core lecture explanations.
   - The Course Topic Guide will highlight lecture slide ranges without empty literature blocks.

---

## Standalone Single-File Build (`dist/index.html`)

The application uses `vite-plugin-singlefile` to bundle all JavaScript, CSS, and SVG assets into a single self-contained HTML file.

### Building the Single-File Bundle
Run the build script:
```bash
npm run build
```
This produces `dist/index.html`. You can distribute this single file or run it directly off a USB drive or local disk via `file:///` without running a web server.

### Local Development
To run the live development server with hot reloading:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## Tech Stack
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite 6 with `vite-plugin-singlefile`
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Typography & Math**: KaTeX for formulas, Marked for Markdown parsing
