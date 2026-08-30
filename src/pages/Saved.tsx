import React from 'react';
import { Article } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Bookmark } from 'lucide-react';

interface SavedProps {
  articles: Article[];
  onTagClick: (tag: string) => void;
  onToggleSave: (id: string) => void;
  onOpenDetail: (article: Article) => void;
  onDiscover: () => void;
}

export const Saved: React.FC<SavedProps> = ({
  articles,
  onTagClick,
  onToggleSave,
  onOpenDetail,
  onDiscover,
}) => {
  const savedArticles = articles.filter((a) => a.saved);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 sm:p-8 text-[#09090B] border border-zinc-200 shadow-2xs">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700 text-[11px] font-sans font-semibold">
            <Bookmark className="w-3.5 h-3.5 text-[#0F52BA]" />
            <span>Scholar Bookmark Archive</span>
          </div>
          <h2 className="font-editorial-heading font-bold text-2xl sm:text-3xl text-[#09090B] tracking-tight">
            学者个人书签文献 ({savedArticles.length})
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed font-sans">
            集中管理您在研究中所收藏的文献与评注，支持在详情页一键生成并复制 Bluebook / GB-T 7714 引证。
          </p>
        </div>
      </div>

      {savedArticles.length > 0 ? (
        <div className="space-y-3.5">
          {savedArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              searchQuery=""
              onTagClick={onTagClick}
              onToggleSave={onToggleSave}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200 space-y-3">
          <Bookmark className="w-10 h-10 text-zinc-300 mx-auto" />
          <h3 className="font-editorial-heading font-bold text-base text-zinc-900">
            暂无收藏的文献
          </h3>
          <p className="text-xs text-zinc-500">
            在“文献流”中点击卡片上的书签按钮即可快速收藏。
          </p>
          <button
            onClick={onDiscover}
            className="px-3.5 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-md hover:bg-[#0F52BA] transition-colors"
          >
            前往发现文献
          </button>
        </div>
      )}
    </div>
  );
};
