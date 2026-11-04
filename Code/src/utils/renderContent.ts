import katex from 'katex';
import { marked } from 'marked';

// Configure marked to handle soft line breaks and tables cleanly
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Universal Rich Content Renderer:
 * Supports GitHub-Flavored Markdown (GFM) and KaTeX LaTeX math:
 * - Display math: $$ ... $$ or \[ ... \]
 * - Inline math: $ ... $ or \( ... \)
 * Supported everywhere across all question prompts, explanations, citations,
 * section/topic summaries, analogies (plainWords), tips (keyTakeaway), and info blocks.
 */
export function renderRichContent(text?: string): string {
  if (!text) return '';
  
  try {
    const codeTokens: string[] = [];
    const mathTokens: string[] = [];

    // 1. Protect fenced code blocks and inline code spans from LaTeX regex matching
    let processed = text.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
      const idx = codeTokens.length;
      codeTokens.push(match);
      return `@@@CODE_TOKEN_${idx}@@@`;
    });

    // 2. Protect escaped literal dollar signs (\$100)
    processed = processed.replace(/\\(\$)/g, '@@@ESCAPED_DOLLAR@@@');

    // 3. Process display equations $$ ... $$ or \[ ... \]
    processed = processed.replace(/(\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\])/g, (_, doubleDollar, math1, math2) => {
      const eq = (math1 !== undefined ? math1 : math2) || '';
      const idx = mathTokens.length;
      try {
        const rendered = katex.renderToString(eq.trim(), { displayMode: true, throwOnError: false });
        mathTokens.push(rendered);
      } catch {
        mathTokens.push(`<pre class="katex-error">$$${eq}$$</pre>`);
      }
      return `@@@MATH_TOKEN_${idx}@@@`;
    });

    // 4. Process inline equations $ ... $ or \( ... \)
    // Rule: opening $ must not be immediately followed by whitespace, closing $ must not be preceded by whitespace
    processed = processed.replace(/(\$(?!\s)([^$\n]+?)(?<!\s)\$|\\\(([^\n]+?)\\\))/g, (_, singleDollar, math1, math2) => {
      const eq = (math1 !== undefined ? math1 : math2) || '';
      const idx = mathTokens.length;
      try {
        const rendered = katex.renderToString(eq.trim(), { displayMode: false, throwOnError: false });
        mathTokens.push(rendered);
      } catch {
        mathTokens.push(`<code>$${eq}$</code>`);
      }
      return `@@@MATH_TOKEN_${idx}@@@`;
    });

    // 5. Restore escaped dollar signs as literal $
    processed = processed.replace(/@@@ESCAPED_DOLLAR@@@/g, '$');

    // 6. Restore code tokens before markdown parsing so code blocks/spans format properly
    processed = processed.replace(/@@@CODE_TOKEN_(\d+)@@@/g, (_, idx) => {
      return codeTokens[Number(idx)];
    });

    // 7. Render markdown with Marked
    let rawHtml = marked.parse(processed);
    if (typeof rawHtml !== 'string') rawHtml = '';

    // 8. Restore KaTeX HTML tokens without being escaped by Marked
    rawHtml = rawHtml.replace(/@@@MATH_TOKEN_(\d+)@@@/g, (_, idx) => {
      return mathTokens[Number(idx)] || '';
    });

    return rawHtml;
  } catch (err) {
    console.error('Failed to parse rich content:', err);
    return text;
  }
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function getStage(sec: number): { label: string; color: string; desc: string } {
  if (sec < 15) return { label: 'Rest', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'Relax and transition' };
  if (sec < 45) return { label: 'Read', color: 'bg-blue-100 text-blue-800 border-blue-300', desc: 'Read question and scenario' };
  if (sec < 105) return { label: 'Answer', color: 'bg-amber-100 text-amber-800 border-amber-300', desc: 'Formulate your answer' };
  return { label: 'Review', color: 'bg-purple-100 text-purple-800 border-purple-300', desc: 'Review and verify' };
}
