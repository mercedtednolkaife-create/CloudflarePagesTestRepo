import React, { useState } from 'react';
import { Article } from '../types';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  Building, 
  Scale, 
  Sparkles, 
  Quote, 
  FileText
} from 'lucide-react';
import { 
  generateBluebook, 
  generateGBT7714, 
  generateBibTeX 
} from '../lib/citationGenerator';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onToggleSave: (id: string) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onToggleSave
}) => {
  const [activeCitationTab, setActiveCitationTab] = useState<'bluebook' | 'gbt' | 'bibtex'>('bluebook');
  const [copied, setCopied] = useState(false);

  if (!article) return null;

  const getCitationText = () => {
    switch (activeCitationTab) {
      case 'bluebook':
        return generateBluebook(article);
      case 'gbt':
        return generateGBT7714(article);
      case 'bibtex':
        return generateBibTeX(article);
      default:
        return '';
    }
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(getCitationText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-2xs font-sans">
      <div 
        id="article-detail-modal"
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-zinc-50 text-[#09090B] p-5 sm:p-6 border-b border-zinc-200 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-sans font-bold bg-zinc-900 text-white tracking-tight">
                {article.journalName}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {article.volumeIssue}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                · DOI: {article.doi}
              </span>
            </div>

            <h2 className="font-editorial-heading font-bold text-xl sm:text-2xl text-[#09090B] leading-snug tracking-tight">
              {article.titleCn}
            </h2>
            <p className="font-serif italic text-sm text-zinc-600">
              {article.titleOriginal}
            </p>
          </div>

          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#09090B] text-sm">
          {/* Author & Meta Bar */}
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-900 font-bold">
                <span className="text-zinc-400 uppercase tracking-wider text-[10px]">著者:</span>
                <span>{article.authors.join(' 与 ')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-600">
                <Building className="w-3.5 h-3.5 text-zinc-400" />
                <span>{article.authorAffiliation}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleSave(article.id)}
                className={`px-3 py-1.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  article.saved
                    ? 'bg-[#0F52BA] border-[#0F52BA] text-white shadow-2xs'
                    : 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-100'
                }`}
              >
                {article.saved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 fill-white text-white" />
                    <span>已收藏至学者书签</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-zinc-400" />
                    <span>收藏本篇文献</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bilingual Abstract Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Chinese Academic Abstract */}
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#0F52BA]" />
                <span>中文精要要旨 (Chinese Summary)</span>
              </div>
              <p className="text-zinc-700 leading-relaxed font-sans text-xs sm:text-sm">
                {article.abstractCn}
              </p>
            </div>

            {/* Original Abstract */}
            <div className="p-4 rounded-lg bg-white border border-zinc-200 space-y-2">
              <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-xs">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>英文原文摘要 (Original Abstract)</span>
              </div>
              <p className="text-zinc-600 italic font-serif leading-relaxed text-xs sm:text-sm">
                {article.abstractOriginal}
              </p>
            </div>
          </div>

          {/* Key Jurisprudential Insights */}
          <div className="space-y-2.5">
            <h4 className="font-editorial-heading font-bold text-base text-zinc-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#0F52BA]" />
              <span>核心学理贡献与评注建议</span>
            </h4>
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-700 space-y-2 leading-relaxed font-sans">
              <p>
                • <strong>理论突破：</strong>本研究对域外判例法的最新演进作出了实质性归纳，为比较法学者提供了兼具学理纵深与判例实证的分析框架。
              </p>
              <p>
                • <strong>中国法借鉴：</strong>在民法典司法适用及前沿立法探索中，该文探讨的法理逻辑可作为立法论与解释论的重要比较法参照。
              </p>
            </div>
          </div>

          {/* Citation Generator Widget */}
          <div className="space-y-3 pt-3 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <h4 className="font-editorial-heading font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                <Quote className="w-4 h-4 text-[#0F52BA]" />
                <span>文献引证一键生成 (Citation Generator)</span>
              </h4>

              <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-md border border-zinc-200">
                {(['bluebook', 'gbt', 'bibtex'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCitationTab(tab)}
                    className={`px-2.5 py-1 rounded text-[11px] font-sans font-semibold transition-colors ${
                      activeCitationTab === tab
                        ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {tab === 'bluebook' ? 'Bluebook' : tab === 'gbt' ? 'GB/T 7714' : 'BibTeX'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#09090B] text-zinc-100 font-mono text-xs relative group flex items-start justify-between gap-3 border border-zinc-800">
              <div className="overflow-x-auto whitespace-pre-wrap leading-relaxed pr-8 select-all">
                {getCitationText()}
              </div>

              <button
                onClick={handleCopyCitation}
                className="p-1.5 rounded-md bg-zinc-800 hover:bg-[#0F52BA] text-white transition-colors shrink-0"
                title="复制引文"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between font-sans">
          <div className="flex items-center gap-1.5">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-white text-zinc-600 border border-zinc-200"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"
            >
              关闭
            </button>
            <a
              href={`https://doi.org/${article.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 hover:bg-[#0F52BA] text-white transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span>访问原刊出版源 (DOI)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

