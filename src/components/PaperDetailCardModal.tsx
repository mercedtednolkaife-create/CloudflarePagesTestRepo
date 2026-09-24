import React, { useState, useEffect } from 'react';
import { Paper } from '../types';
import { copyToClipboard } from '../lib/clipboard';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Star,
  BookOpen,
  Building,
  Quote,
  FileDown,
  Tag,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  Scale,
  Users,
  FileText,
} from 'lucide-react';

interface PaperDetailCardModalProps {
  paper: Paper | null;
  onClose: () => void;
  onToggleBookmark: (paper: Paper) => void;
  onSelectAuthor?: (authorName: string) => void;
  onSelectTag?: (tag: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PaperDetailCardModal: React.FC<PaperDetailCardModalProps> = ({
  paper,
  onClose,
  onToggleBookmark,
  onSelectAuthor,
  onSelectTag,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'bilingual' | 'zh' | 'en'>('bilingual');
  const [activeCitationTab, setActiveCitationTab] = useState<'bluebook' | 'gbt' | 'bibtex'>('bluebook');
  const [copiedCitation, setCopiedCitation] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!paper) return null;

  // Build clean Bluebook citation (Strictly NO DOI as requested)
  const volNum = paper.volume ? paper.volume.replace(/Vol\.?\s*/i, '').trim() : '';
  const pagePart = paper.firstPage ? ` ${paper.firstPage}` : '';
  const year = paper.publicationYear || (paper.publishedAt ? paper.publishedAt.slice(0, 4) : '2026');
  const authorsStr = paper.authors && paper.authors.length > 0 ? paper.authors.join(' & ') : 'Anonymous';

  const bluebookCitation =
    (paper.recommendedCitation
      ? paper.recommendedCitation.replace(/,\s*DOI:.*$/i, '').replace(/https?:\/\/doi\.org\/[^\s)]+/i, '').trim()
      : null) ||
    `${authorsStr}, ${paper.title}, ${volNum ? `${volNum} ` : ''}${paper.journalAbbr || paper.journalName}${pagePart} (${year}).`;

  // Build clean GB/T 7714 citation (Strictly NO DOI)
  const gbtCitation = `${paper.authors.join(', ')}. ${paper.title}[J]. ${paper.journalName}, ${year}${paper.volume ? `, ${paper.volume}` : ''}${paper.issue ? `(${paper.issue})` : ''}${pagePart ? `: ${paper.firstPage}` : ''}.`;

  // Build clean BibTeX (Strictly NO DOI)
  const bibtexKey = `${(paper.authors[0] || 'Author').replace(/\s+/g, '')}${year}${paper.title.slice(0, 10).replace(/[^a-zA-Z]/g, '')}`;
  const bibtexCitation = `@article{${bibtexKey},
  title = {${paper.title}},
  author = {${paper.authors.join(' and ')}},
  journal = {${paper.journalName}},
  year = {${year}}${volNum ? `,\n  volume = {${volNum}}` : ''}${paper.issue ? `,\n  number = {${paper.issue}}` : ''}${paper.firstPage ? `,\n  pages = {${paper.firstPage}}` : ''}
}`;

  const getCitationText = () => {
    switch (activeCitationTab) {
      case 'bluebook':
        return bluebookCitation;
      case 'gbt':
        return gbtCitation;
      case 'bibtex':
        return bibtexCitation;
      default:
        return bluebookCitation;
    }
  };

  const handleCopyCitation = async () => {
    await copyToClipboard(getCitationText());
    setCopiedCitation(true);
    if (onShowToast) onShowToast('已复制规范引注到剪贴板', 'success');
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id={`paper-full-card-${paper.id}`}
        className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl sm:rounded-3xl border border-black/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card Header */}
        <div className="bg-[#FBFBFD] px-6 py-5 border-b border-black/[0.06] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-2 flex-1 min-w-0">
            {/* Badges / Meta row (Strictly NO DOI) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1D1D1F] text-white text-[11px] font-semibold tracking-tight shadow-xs">
                <span>{paper.journalNameCn || paper.journalName}</span>
                {paper.journalAbbr && <span className="opacity-70 text-[10px]">({paper.journalAbbr})</span>}
              </span>

              {(paper.categoryCn || paper.category) && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-[11px] font-medium">
                  {paper.categoryCn || paper.category}
                </span>
              )}

              {(paper.volume || paper.issue || paper.volumeIssue) && (
                <span className="px-2.5 py-0.5 rounded-full bg-black/[0.04] text-[#6E6E73] text-[11px] font-mono font-medium">
                  {paper.volumeIssue || [paper.volume, paper.issue].filter(Boolean).join(', ')}
                </span>
              )}

              {paper.journalTier && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/50 text-[10px] font-bold">
                  {paper.journalTier}
                </span>
              )}

              {paper.edition && (
                <span className="px-2.5 py-0.5 rounded-full bg-black/[0.03] text-[#6E6E73] text-[10px] font-medium border border-black/[0.04]">
                  {paper.edition === 'print' ? '纸本出版' : paper.edition === 'online' ? '在线首发' : paper.edition}
                </span>
              )}

              <span className="text-[11px] text-[#86868B] font-mono flex items-center gap-1 bg-black/[0.03] px-2.5 py-0.5 rounded-full border border-black/[0.04]">
                <Clock className="w-3 h-3 text-[#86868B]" />
                <span>预计研读 {paper.readingTime || `${Math.max(8, Math.ceil(((paper.abstract?.length || 600) + (paper.abstractCn?.length || 400)) / 120))} 分钟`}</span>
              </span>

              {paper.publishedAt && (
                <span className="text-[11px] text-[#86868B] font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#86868B]" />
                  <span>{paper.publishedAt}</span>
                </span>
              )}
            </div>

            {/* Main Titles: Chinese first, original English underneath */}
            <div className="pt-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] font-editorial-heading leading-snug tracking-tight">
                {paper.titleCn || paper.title}
              </h2>
              {paper.titleCn && paper.titleCn !== paper.title && (
                <p className="text-xs sm:text-sm text-[#6E6E73] font-serif italic mt-1 leading-relaxed">
                  {paper.title}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-1">
            <button
              onClick={() => onToggleBookmark(paper)}
              className={`p-2.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                paper.isBookmarked
                  ? 'bg-[#FF9500] text-white border-[#FF9500] shadow-xs hover:bg-[#E68600]'
                  : 'bg-white text-[#86868B] border-black/[0.08] hover:text-[#FF9500] hover:bg-black/[0.04]'
              }`}
              title={paper.isBookmarked ? '已收藏（点击取消）' : '收藏本篇文献'}
            >
              <Star className={`w-4 h-4 ${paper.isBookmarked ? 'fill-white' : ''}`} />
            </button>

            <button
              id="close-paper-modal-btn"
              onClick={onClose}
              className="p-2.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] bg-white hover:bg-black/[0.05] border border-black/[0.08] transition-colors cursor-pointer"
              title="关闭卡片 (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-[#1D1D1F] text-sm">
          {/* Authors and Affiliations Card */}
          <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1D1D1F]">
              <Users className="w-4 h-4 text-[#0071E3]" />
              <span>文献著者与任职机构:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {paper.authorsDetail && paper.authorsDetail.length > 0 ? (
                paper.authorsDetail.map((author, idx) => (
                  <div
                    key={author.id || idx}
                    className="p-2.5 bg-white rounded-xl border border-black/[0.04] flex items-start justify-between gap-2 shadow-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs text-[#1D1D1F]">
                        {author.nameCn ? `${author.nameCn} (${author.name})` : author.name}
                      </div>
                      {author.institution && (
                        <div className="text-[11px] text-[#6E6E73] flex items-center gap-1">
                          <Building className="w-3 h-3 text-[#86868B] shrink-0" />
                          <span>{author.institution}</span>
                        </div>
                      )}
                    </div>
                    {onSelectAuthor && (
                      <button
                        onClick={() => {
                          onSelectAuthor(author.name);
                          onClose();
                        }}
                        className="text-[10px] text-[#0071E3] hover:underline font-semibold shrink-0 cursor-pointer pt-0.5"
                        title="查看该学者全部文献"
                      >
                        学者文献
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#6E6E73] col-span-2">
                  {paper.authors.join(' · ')}
                </div>
              )}
            </div>
          </div>

          {/* Full Abstract Area with Tab Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0071E3]" />
                <h3 className="font-editorial-heading font-bold text-base text-[#1D1D1F]">
                  完整双语摘要与论点详述
                </h3>
              </div>

              <div className="inline-flex p-0.5 rounded-xl bg-[#F5F5F7] border border-black/[0.04] text-xs">
                <button
                  onClick={() => setActiveTab('bilingual')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === 'bilingual'
                      ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                  }`}
                >
                  双语对照
                </button>
                <button
                  onClick={() => setActiveTab('zh')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === 'zh'
                      ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                  }`}
                >
                  中文摘要
                </button>
                <button
                  onClick={() => setActiveTab('en')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === 'en'
                      ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                  }`}
                >
                  英文原文
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Fallback when neither Chinese nor English abstract is present in database */}
              {!paper.abstract && !paper.abstractCn && (
                <div className="p-5 sm:p-6 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] text-center space-y-1.5">
                  <FileText className="w-5 h-5 mx-auto text-[#86868B]/70" />
                  <p className="text-xs font-semibold text-[#1D1D1F]">该文献原文未附独立学术摘要</p>
                  <p className="text-[11px] text-[#86868B] max-w-md mx-auto leading-relaxed">
                    文献可能为特刊按语、书评、评述或判例评析。欢迎点击下方【官方原文】直达查阅全文正文。
                  </p>
                </div>
              )}

              {/* Chinese Abstract */}
              {(activeTab === 'bilingual' || activeTab === 'zh') && (
                paper.abstractCn ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0071E3]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>中文精要要旨与核心研究发现</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#1D1D1F] leading-relaxed font-sans select-text">
                      {paper.abstractCn}
                    </p>
                  </div>
                ) : activeTab === 'zh' && paper.abstract ? (
                  <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] text-xs text-[#86868B] text-center">
                    该文献暂无中文精要，可切换至【英文原文】标签查阅官方原版摘要。
                  </div>
                ) : null
              )}

              {/* English Abstract */}
              {(activeTab === 'bilingual' || activeTab === 'en') && (
                paper.abstract ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-black/[0.06] space-y-2 shadow-xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#6E6E73]">
                      <Layers className="w-3.5 h-3.5 text-[#86868B]" />
                      <span>Original Academic Abstract</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#48484A] leading-relaxed font-serif select-text">
                      {paper.abstract}
                    </p>
                  </div>
                ) : activeTab === 'en' && paper.abstractCn ? (
                  <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] text-xs text-[#86868B] text-center">
                    该文献原文未单独收录英文摘要。
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Citation Generator Widget (Strictly NO DOI) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-[#0071E3]" />
                <h4 className="font-editorial-heading font-bold text-sm text-[#1D1D1F]">
                  学术规范引注 (Citation Generator)
                </h4>
              </div>

              <div className="flex items-center gap-1 bg-[#F5F5F7] p-0.5 rounded-xl border border-black/[0.04]">
                {(['bluebook', 'gbt', 'bibtex'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCitationTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeCitationTab === tab
                        ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                        : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                    }`}
                  >
                    {tab === 'bluebook' ? 'Bluebook' : tab === 'gbt' ? 'GB/T 7714' : 'BibTeX'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1D1D1F] text-zinc-100 font-mono text-xs relative flex items-start justify-between gap-3 shadow-xs">
              <div className="overflow-x-auto whitespace-pre-wrap leading-relaxed select-all pr-8">
                {getCitationText()}
              </div>

              <button
                onClick={handleCopyCitation}
                className="p-2 rounded-xl bg-white/10 hover:bg-[#0071E3] text-white transition-all shrink-0 cursor-pointer"
                title="一键复制引注代码"
              >
                {copiedCitation ? (
                  <Check className="w-4 h-4 text-[#34C759]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Tags */}
          {paper.tags && paper.tags.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-[#86868B] font-medium">
                <Tag className="w-3.5 h-3.5" />
                <span>领域与研读标签</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {paper.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (onSelectTag) {
                        onSelectTag(tag);
                        onClose();
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F] text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>#{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="px-6 py-4 bg-[#FBFBFD] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {paper.pdfUrl && (
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 border border-[#FF3B30]/20 text-[#D70015] text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <FileDown className="w-4 h-4" />
                <span>下载全文 PDF</span>
              </a>
            )}

            {paper.url && (
              <a
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.06] text-[#1D1D1F] text-xs font-semibold transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-[#86868B]" />
                <span>访问官方原文</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.05] transition-colors cursor-pointer"
            >
              关闭卡片
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
