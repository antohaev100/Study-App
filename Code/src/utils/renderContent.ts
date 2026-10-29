import katex from 'katex';
import { marked } from 'marked';

// Configure marked to handle soft line breaks cleanly
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function renderRichContent(text?: string): string {
  if (!text) return '';
  
  try {
    // 1. Process display equations $$ ... $$
    let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, eq) => {
      try {
        return katex.renderToString(eq.trim(), { displayMode: true, throwOnError: false });
      } catch {
        return `<pre class="katex-error">$$${eq}$$</pre>`;
      }
    });

    // 2. Process inline equations $ ... $ (avoiding double dollar matches)
    processed = processed.replace(/\$([^$\n]+?)\$/g, (_, eq) => {
      try {
        return katex.renderToString(eq.trim(), { displayMode: false, throwOnError: false });
      } catch {
        return `<code>$${eq}$</code>`;
      }
    });

    // 3. Render markdown
    const rawHtml = marked.parse(processed);
    return typeof rawHtml === 'string' ? rawHtml : '';
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
  if (sec < 180) return { label: 'Understand', color: 'bg-purple-100 text-purple-800 border-purple-300', desc: 'Review explanations and notes' };
  return { label: 'Next question', color: 'bg-rose-100 text-rose-800 border-rose-300', desc: 'Wrap up and move forward' };
}
