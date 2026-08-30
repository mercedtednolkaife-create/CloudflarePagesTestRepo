import React, { useState, useMemo } from 'react';
import { Journal, JurisdictionType } from '../types';
import { 
  Pin, 
  PinOff, 
  ExternalLink, 
  Search, 
  Award, 
  Layers, 
  BookOpenCheck,
  Building
} from 'lucide-react';
import { JURISDICTIONS } from '../data/mockData';

interface JournalShelfProps {
  journals: Journal[];
  onTogglePin: (id: string) => void;
  onFilterByJournal?: (journalName: string) => void;
}

export const JournalShelf: React.FC<JournalShelfProps> = ({
  journals,
  onTogglePin,
  onFilterByJournal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionType>('All');

  // Sorted list: Pinned items ALWAYS placed at the top!
  const filteredAndSortedJournals = useMemo(() => {
    return journals
      .filter((j) => {
        const matchesQuery =
          searchQuery.trim() === '' ||
          j.nameCn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.nameOriginal.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesJurisdiction =
          selectedJurisdiction === 'All' || j.jurisdiction === selectedJurisdiction;

        return matchesQuery && matchesJurisdiction;
      })
      .sort((a, b) => {
        // Pinned first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
  }, [journals, searchQuery, selectedJurisdiction]);

  const pinnedCount = journals.filter((j) => j.isPinned).length;

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="bg-white rounded-xl p-6 sm:p-8 text-[#09090B] border border-zinc-200 shadow-2xs">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700 text-[11px] font-sans font-semibold">
            <span>核心法学评论期刊架</span>
          </div>
          <h2 className="font-editorial-heading font-bold text-2xl sm:text-3xl text-[#09090B] tracking-tight">
            全球核心法学期刊学术书架
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed font-sans">
            汇聚哈佛法评、耶鲁法学杂志、牛津法学研究、马普所评论等全球法学刊物。点击“置顶关注”可优先在学者书架前排陈列。
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="mt-6 pt-5 border-t border-zinc-100 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center font-sans">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="journal-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="检索期刊名称、缩写 (如: HLR, Yale, Oxford)..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-md text-[#09090B] placeholder-zinc-400 focus:outline-hidden focus:border-[#0F52BA] focus:bg-white"
            />
          </div>

          {/* Jurisdiction Filters */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md border border-zinc-200 overflow-x-auto">
            {JURISDICTIONS.map((j) => (
              <button
                key={j.id}
                onClick={() => setSelectedJurisdiction(j.id as JurisdictionType)}
                className={`px-2.5 py-1 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedJurisdiction === j.id
                    ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pinned Count Stats Bar */}
      <div className="flex items-center justify-between px-1 text-xs font-sans text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-800 text-[11px]">THE SHELF</span>
          <span className="text-zinc-300">/</span>
          <span>已置顶关注: <strong className="text-[#0F52BA] font-mono">{pinnedCount}</strong> 本</span>
          <span className="text-zinc-300">/</span>
          <span>当前显示: <strong className="text-zinc-800 font-mono">{filteredAndSortedJournals.length}</strong> 本</span>
        </div>
      </div>

      {/* Journal Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAndSortedJournals.map((journal) => (
          <div
            key={journal.id}
            id={`journal-card-${journal.id}`}
            className={`group rounded-lg border transition-all duration-150 relative flex flex-col justify-between overflow-hidden ${
              journal.isPinned
                ? 'bg-white border-[#0F52BA]/60 ring-1 ring-[#0F52BA]/20 shadow-xs'
                : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-2xs'
            }`}
          >
            {/* Pinned Ribbon at top if pinned */}
            {journal.isPinned && (
              <div className="bg-[#0F52BA] text-white text-[10px] font-sans font-bold uppercase tracking-wider px-3 py-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Pin className="w-3 h-3 fill-white" />
                  已置顶关注 (PINNED)
                </span>
                <span className="font-mono text-[9px] opacity-90">TOP PRIORITY</span>
              </div>
            )}

            <div className="p-5 sm:p-6 space-y-4">
              {/* Card Header: Abbreviation Pill + Pin Button */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-serif font-black text-base shadow-2xs">
                    {journal.abbreviation}
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {journal.category}
                    </span>
                    <p className="text-[11px] font-sans text-zinc-400 mt-0.5">{journal.country}</p>
                  </div>
                </div>

                {/* Pin / Star Toggle Button */}
                <button
                  id={`pin-btn-${journal.id}`}
                  onClick={() => onTogglePin(journal.id)}
                  className={`p-1.5 rounded-md border transition-all ${
                    journal.isPinned
                      ? 'bg-[#0F52BA] text-white border-[#0F52BA] shadow-2xs'
                      : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                  title={journal.isPinned ? '取消置顶关注' : '关注并置顶本期刊'}
                >
                  {journal.isPinned ? (
                    <Pin className="w-3.5 h-3.5 fill-white" />
                  ) : (
                    <PinOff className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Journal Names */}
              <div>
                <h3 className="font-editorial-heading font-bold text-lg text-zinc-900 group-hover:text-[#0F52BA] transition-colors leading-tight">
                  {journal.nameCn}
                </h3>
                <p className="font-serif italic text-sm text-zinc-600 mt-0.5">
                  {journal.nameOriginal}
                </p>
              </div>

              {/* Meta: Institution & Impact Rank */}
              <div className="space-y-1.5 text-xs text-zinc-600 bg-zinc-50 p-3 rounded-md border border-zinc-200/80">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="font-medium text-zinc-800 font-sans">{journal.institution}</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-200/60 text-[11px] font-sans">
                  <div className="flex items-center gap-1 text-[#0F52BA] font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    <span>{journal.impactRank}</span>
                  </div>
                  <span className="text-zinc-400 font-mono">{journal.frequency}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed font-sans">
                {journal.description}
              </p>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs font-sans">
              <div className="text-zinc-500 text-[11px] font-mono">
                最新: <span className="font-semibold text-zinc-900">{journal.currentIssue}</span>
              </div>

              <div className="flex items-center gap-2">
                {onFilterByJournal && (
                  <button
                    onClick={() => onFilterByJournal(journal.nameOriginal)}
                    className="text-xs font-semibold text-zinc-700 hover:text-[#0F52BA] flex items-center gap-1"
                  >
                    <BookOpenCheck className="w-3.5 h-3.5" />
                    <span>查看收录</span>
                  </button>
                )}
                <a
                  href={journal.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60"
                  title="访问官方主页与最新投审目录"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedJournals.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <Layers className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <h4 className="font-editorial-heading font-bold text-lg text-zinc-900">
            暂无匹配的法学评论期刊
          </h4>
          <p className="text-xs text-zinc-500 mt-1 font-sans">
            请尝试更换检索关键词或法域筛选条件
          </p>
        </div>
      )}
    </div>
  );
};

