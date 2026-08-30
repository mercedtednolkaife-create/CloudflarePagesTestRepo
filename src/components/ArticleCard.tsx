import React, { useState } from 'react';
import { Article } from '../types';
import { HighlightText } from '../lib/highlight';
import { 
  Bookmark, 
  BookmarkCheck, 
  Quote, 
  Check, 
  Clock, 
  BookOpen,
  Building2,
  ChevronDown,
  ChevronUp,
  ArrowUpRight
} from 'lucide-react';
import { generateBluebook } from '../lib/citationGenerator';

interface ArticleCardProps {
  article: Article;
  searchQuery: string;
  onTagClick: (tag: string) => void;
  onToggleSave: (id: string) => void;
  onOpenDetail: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  searchQuery,
  onTagClick,
  onToggleSave,
  onOpenDetail
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopyCitation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const citation = generateBluebook(article);
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getJurisdictionLabel = (j: string) => {
    switch (j) {
      case 'US': return '美国法 (US)';
      case 'UK': return '普通法 (UK)';
      case 'EU': return '欧盟法 (EU)';
      case 'DE': return '德国法 (DE)';
      case 'FR': return '法国法 (FR)';
      default: return '国际法 (Intl)';
    }
  };

  return (
    <article 
      id={`article-card-${article.id}`}
      className="group bg-white rounded-lg border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all duration-150 p-6 relative flex flex-col justify-between"
    >
      <div>
        {/* Top Pills & Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Journal Name Badge */}
            <span className="px-2.5 py-0.5 bg-zinc-900 text-white text-[11px] font-sans font-bold rounded-md tracking-tight">
              <HighlightText text={article.journalName} query={searchQuery} />
            </span>

            {/* Jurisdiction Pill */}
            <span className="px-2 py-0.5 text-[10px] font-sans font-medium text-zinc-600 bg-zinc-100 rounded-md border border-zinc-200">
              {getJurisdictionLabel(article.jurisdiction)}
            </span>

            {/* Volume */}
            <span className="text-[11px] font-mono text-zinc-500">
              {article.volumeIssue}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Reading Time */}
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              {article.readingTime}
            </span>

            {/* Save/Bookmark Button */}
            <button
              id={`bookmark-btn-${article.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(article.id);
              }}
              className={`p-1.5 rounded-md border transition-colors ${
                article.saved
                  ? 'bg-[#0F52BA] text-white border-[#0F52BA]'
                  : 'text-zinc-400 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              title={article.saved ? '已收藏（点击取消）' : '收藏这篇文献'}
            >
              {article.saved ? (
                <BookmarkCheck className="w-3.5 h-3.5 fill-white text-white" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Chinese Translated Title (Primary Focus) */}
        <h3 
          onClick={() => onOpenDetail(article)}
          className="font-editorial-heading font-bold text-xl sm:text-2xl text-[#09090B] group-hover:text-[#0F52BA] transition-colors leading-snug cursor-pointer mb-1.5 tracking-tight"
        >
          <HighlightText text={article.titleCn} query={searchQuery} />
        </h3>

        {/* Original Foreign Title */}
        <p className="font-serif italic text-sm text-zinc-600 mb-3 leading-relaxed">
          <HighlightText text={article.titleOriginal} query={searchQuery} />
        </p>

        {/* Authors & Institutional Affiliation */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs font-sans text-zinc-500 mb-3.5 pb-3 border-b border-zinc-100">
          <span className="font-semibold text-zinc-800">
            <HighlightText text={article.authors.join(', ')} query={searchQuery} />
          </span>
          <span className="text-zinc-300">•</span>
          <span className="flex items-center gap-1 text-zinc-600">
            <Building2 className="w-3 h-3 text-zinc-400" />
            <HighlightText text={article.authorAffiliation} query={searchQuery} />
          </span>
          <span className="text-zinc-300">•</span>
          <span className="font-mono text-zinc-400">
            {article.publishDate}
          </span>
        </div>

        {/* Abstract / Summary */}
        <div className="mb-4">
          <p className={`text-sm text-zinc-700 leading-relaxed font-sans ${!isExpanded ? 'line-clamp-2' : ''}`}>
            <HighlightText text={article.abstractCn} query={searchQuery} />
          </p>
          {article.abstractCn.length > 80 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-[#0F52BA] hover:text-[#0B3D8A] mt-1.5 inline-flex items-center gap-0.5 focus:outline-hidden"
            >
              {isExpanded ? (
                <>收起摘要 <ChevronUp className="w-3.5 h-3.5" /></>
              ) : (
                <>展开核心论点精要 <ChevronDown className="w-3.5 h-3.5" /></>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Footer: Interactive Tags + Action Toolbar */}
      <div className="pt-3.5 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Interactive Topic Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {article.tags.map((tag) => (
            <button
              key={tag}
              id={`article-tag-${tag}`}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(tag);
              }}
              className="px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200 transition-colors"
              title={`点击筛选“${tag}”相关文献`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto font-sans">
          {/* Quick Citation Copy */}
          <button
            id={`copy-citation-${article.id}`}
            onClick={handleCopyCitation}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center gap-1.5 transition-colors"
            title="一键复制 Bluebook 引用格式"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">已复制</span>
              </>
            ) : (
              <>
                <Quote className="w-3.5 h-3.5 text-zinc-500" />
                <span>引用</span>
              </>
            )}
          </button>

          {/* Quick Read Modal Trigger */}
          <button
            id={`open-modal-btn-${article.id}`}
            onClick={() => onOpenDetail(article)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 hover:bg-[#0F52BA] text-white flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>深度研读</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-400 group-hover:text-white" />
          </button>
        </div>
      </div>
    </article>
  );
};

