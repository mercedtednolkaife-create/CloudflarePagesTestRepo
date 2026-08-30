import React from 'react';
import { Article, AcademicEvent, Journal } from '../types';
import { TOPIC_TAGS } from '../constants/academic';
import { ArticleCard } from '../components/ArticleCard';
import { EventSidebar } from '../components/EventSidebar';
import { Filter, BookOpen, Library, ArrowRight, Scale } from 'lucide-react';

interface HomeProps {
  articles: Article[];
  events: AcademicEvent[];
  journals: Journal[];
  searchQuery: string;
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  onToggleSave: (id: string) => void;
  onOpenDetail: (article: Article) => void;
  onNavigateToJournals: () => void;
  onNavigateToEvents: () => void;
  onFilterByJournal: (journalName: string) => void;
  onResetFilters: () => void;
}

export const Home: React.FC<HomeProps> = ({
  articles,
  events,
  journals,
  searchQuery,
  selectedTag,
  onTagSelect,
  onToggleSave,
  onOpenDetail,
  onNavigateToJournals,
  onNavigateToEvents,
  onFilterByJournal,
  onResetFilters,
}) => {
  const pinnedJournals = journals.filter((j) => j.isPinned);

  return (
    <div className="space-y-6">
      {/* Quick Tag Pills Filter */}
      <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
          <span className="font-semibold text-zinc-500 text-[11px] whitespace-nowrap flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#0F52BA]" />
            学科分类:
          </span>
          {TOPIC_TAGS.map((tag) => (
            <button
              key={tag}
              id={`topic-tag-btn-${tag}`}
              onClick={() => onTagSelect(tag)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 border border-zinc-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Literature Feed + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Literature Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-zinc-900 text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-editorial-heading font-bold text-lg text-zinc-900 tracking-tight">
                  最新域外法学文献流
                </h2>
                <p className="text-xs text-zinc-500">
                  核心期刊论文、双语论点要旨及判例评述
                </p>
              </div>
            </div>

            {selectedTag !== '全部领域' && (
              <div className="flex items-center gap-1.5 text-xs bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-md border border-zinc-200">
                <span>学科: <strong>#{selectedTag}</strong></span>
                <button
                  onClick={() => onTagSelect('全部领域')}
                  className="text-zinc-400 hover:text-zinc-900 font-bold"
                  title="取消学科筛选"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Articles List */}
          <div className="space-y-3.5">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                searchQuery={searchQuery}
                onTagClick={onTagSelect}
                onToggleSave={onToggleSave}
                onOpenDetail={onOpenDetail}
              />
            ))}

            {articles.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-zinc-200 space-y-3">
                <Scale className="w-10 h-10 text-zinc-300 mx-auto" />
                <h3 className="font-editorial-heading font-bold text-base text-zinc-900">
                  未检索到匹配的法学文献
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  建议尝试减少筛选条件，或前往“心愿单”提交该篇文献的收录建议。
                </p>
                <button
                  onClick={onResetFilters}
                  className="mt-2 px-3.5 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-md hover:bg-[#0F52BA] transition-colors"
                >
                  清除所有筛选条件
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Events and Quick Journal Shelf */}
        <div className="lg:col-span-4 space-y-5">
          <EventSidebar
            events={events}
            onViewAllEvents={onNavigateToEvents}
          />

          {/* Quick Journal Shelf Mini-Widget */}
          <div className="bg-white text-zinc-900 rounded-xl p-5 shadow-2xs space-y-3 border border-zinc-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-zinc-100 border border-zinc-200">
                  <Library className="w-3.5 h-3.5 text-[#0F52BA]" />
                </div>
                <h3 className="font-editorial-heading font-bold text-sm text-zinc-900">
                  置顶关注期刊
                </h3>
              </div>
              <button
                onClick={onNavigateToJournals}
                className="text-xs text-[#0F52BA] hover:underline flex items-center gap-0.5 font-semibold text-[11px]"
              >
                <span>进入书架</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              已置顶 {pinnedJournals.length} 本核心法律评论，点击可快速检索对应期刊文献。
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {pinnedJournals.map((j) => (
                <button
                  key={j.id}
                  onClick={() => onFilterByJournal(j.nameOriginal)}
                  className="px-2 py-0.5 rounded-md bg-zinc-50 hover:bg-[#0F52BA] hover:text-white text-zinc-700 text-xs font-mono border border-zinc-200 transition-colors"
                  title="查看该期刊文献"
                >
                  ★ {j.abbreviation}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
