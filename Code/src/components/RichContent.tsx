import React, { useMemo } from 'react';
import { renderRichContent } from '../utils/renderContent';

interface RichContentProps {
  content?: string;
  className?: string;
}

export const RichContent: React.FC<RichContentProps> = ({ content = '', className = '' }) => {
  const html = useMemo(() => renderRichContent(content), [content]);

  return (
    <div
      className={`rich-text text-[0.935rem] leading-relaxed text-[#2c3e50] ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
