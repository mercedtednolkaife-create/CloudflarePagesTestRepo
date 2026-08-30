import React from 'react';

interface HighlightProps {
  text: string;
  query: string;
  className?: string;
}

export const HighlightText: React.FC<HighlightProps> = ({
  text,
  query,
  className = 'bg-[#0F52BA]/15 text-[#0F52BA] font-semibold px-1 py-0.5 rounded-xs'
}) => {
  if (!query || !query.trim() || !text) {
    return <span>{text}</span>;
  }

  const trimmedQuery = query.trim();
  // Escape special regex characters
  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className={className}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};
