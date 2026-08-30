import React, { useState, useMemo } from 'react';
import { Journal, JurisdictionType } from '../types';
import { Pagination } from './Pagination';
import { 
  Pin, 
  PinOff, 
  ExternalLink, 
  Search, 
  Award, 
  Layers, 
  BookOpenCheck,
  Building,
  CornerDownLeft,
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
  const [localSearch, setLocalSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionType>('All');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

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

  const total = filteredAndSortedJournals.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const validPage = Math.min(page, totalPages);
  const start = (validPage - 1) * pageSize;
  const paginatedJournals = filteredAndSortedJournals.slice(start, start + pageSize);

  const paginationMeta = {
    page: validPage,
    pageSize,
    total,
    totalPages,
    hasNext: validPage < totalPages,
    hasPrev: validPage > 1,
  };

  const handleTriggerSearch = () => {
    setSearchQuery(localSearch.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-[#09090B] border border-zinc-200 shadow-2xs">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200/60 text-[#0F52BA] text-[11px] font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Core Law Reviews · D1 Registry</span>
          </div>
          <h1 className="font-editorial-heading text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            域外法学核心期刊架 (Journal Shelf)
          </h1>
          <p className="text-zinc-600 text-xs sm:text-sm font-sans leading-relaxed">
            汇聚全球 SSCI 法学一区与顶尖综合评论刊物。可将常用期刊一键置顶至个人书架，追踪最新刊期与引证热点。
          </p>
        </div>

        {/* Search & Jurisdiction Filter */}
        <div className="mt-6 pt-6 border-t border-zinc-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTriggerSearch();
              }}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="搜索期刊名称、缩写或主办机构 (按 Enter 搜索)..."
              className="w-full pl-9 pr-20 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F52BA]/20 focus:border-[#0F52BA]"
            />
            <button
              onClick={handleTriggerSearch}
              className="absolute right-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-[#0F52BA] text-white text-xs font-semibold rounded-md flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              <span>搜索</span>
              <CornerDownLeft className="w-3 h-3 opacity-70" />
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto bg-zinc-100 p-1 rounded-lg border border-zinc-200 shrink-0">
            {JURISDICTIONS.map((j) => (
              <button
                key={j.id}
                onClick={() => {
                  setSelectedJurisdiction(j.id as JurisdictionType);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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

      {/* Grid of Journals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedJournals.map((journal) => (
          <div
            key={journal.id}
            className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-sm ${
              journal.isPinned ? 'border-[#0F52BA] ring-2 ring-[#0F52BA]/10' : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <div>
              {/* Card Banner Header */}
              <div className={`p-4 bg-gradient-to-r ${journal.coverColor} text-white flex items-start justify-between`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold tracking-wider px-2 py-0.5 bg-white/20 backdrop-blur-xs rounded">
                      {journal.abbreviation}
                    </span>
                    <span className="text-[11px] opacity-80 font-sans">
                      {journal.country}
                    </span>
                  </div>
                  <h2 className="font-bold text-base font-editorial-heading tracking-tight leading-snug">
                    {journal.nameCn}
                  </h2>
                </div>

                {/* Pin Action Button */}
                <button
                  onClick={() => onTogglePin(journal.id)}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    journal.isPinned
                      ? 'bg-white text-[#0F52BA] shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={journal.isPinned ? '取消置顶' : '置顶到书架顶部'}
                >
                  {journal.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
              </div>

              {/* Journal Info Body */}
              <div className="p-5 space-y-3 font-sans text-xs">
                <div className="text-zinc-500 italic font-serif text-[11px]">
                  {journal.nameOriginal}
                </div>

                <div className="space-y-1.5 text-zinc-600">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{journal.institution}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-semibold text-zinc-800">{journal.impactRank}</span>
                  </div>
                </div>

                <p className="text-zinc-600 text-xs leading-relaxed line-clamp-3 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                  {journal.description}
                </p>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-4 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-zinc-400 font-mono">
                {journal.currentIssue}
              </span>

              <div className="flex items-center gap-2">
                {onFilterByJournal && (
                  <button
                    onClick={() => onFilterByJournal(journal.nameOriginal)}
                    className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <BookOpenCheck className="w-3.5 h-3.5 text-[#0F52BA]" />
                    <span>查看收录</span>
                  </button>
                )}

                <a
                  href={journal.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                  title="访问期刊官方主页"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Bar */}
      <Pagination
        pagination={paginationMeta}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        itemName="本期刊"
      />
    </div>
  );
};
