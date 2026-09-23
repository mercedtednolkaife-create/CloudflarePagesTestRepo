import React, { useState, useEffect } from 'react';
import { WishlistItem, WishlistType, WishlistStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  HeartHandshake, 
  Send, 
  ThumbsUp, 
  Search, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Filter,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface WishlistSectionProps {
  wishlist: WishlistItem[];
  onAddWishlistItem: (item: Omit<WishlistItem, 'id' | 'submittedAt' | 'votes' | 'status'>) => Promise<boolean>;
  onVoteWishlistItem: (id: string) => void;
  onRefreshWishlist?: () => void;
  isLoading?: boolean;
}

export const WishlistSection: React.FC<WishlistSectionProps> = ({
  wishlist,
  onAddWishlistItem,
  onVoteWishlistItem,
  onRefreshWishlist,
  isLoading = false,
}) => {
  const { user } = useAuth();

  // Form State - default to logged in user's name
  const [name, setName] = useState('');
  const [type, setType] = useState<WishlistType>('期刊');
  const [submitter, setSubmitter] = useState(user?.username || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Sync default submitter when user profile loads or changes
  useEffect(() => {
    if (user?.username && !submitter) {
      setSubmitter(user.username);
    }
  }, [user?.username]);

  // Filter & Search State for Wishlist Table
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [searchTableQuery, setSearchTableQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('请输入想要收录或追踪的实体名称、期刊名或学者文献链接');
      return;
    }

    setFormError('');
    setFormSuccess(false);
    setIsSubmitting(true);

    try {
      const finalSubmitter = submitter.trim() || user?.username || '法学匿名学者';
      const ok = await onAddWishlistItem({
        name: name.trim(),
        type,
        submitter: finalSubmitter,
        notes: notes.trim() || '学者通过前台心愿单提交收录申请。'
      });

      if (ok) {
        setName('');
        setNotes('');
        // Retain current user name for convenient repeated submissions
        setSubmitter(user?.username || '');
        setFormSuccess(true);
        setTimeout(() => setFormSuccess(false), 5000);
      }
    } catch (err: any) {
      setFormError(err?.message || '提交失败，请确保后端服务正常运行');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: WishlistStatus) => {
    switch (status) {
      case '已收录':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
          dot: 'bg-emerald-600'
        };
      case '审核中':
        return {
          bg: 'bg-zinc-100 text-zinc-700 border-zinc-200',
          icon: Clock,
          dot: 'bg-zinc-500'
        };
      case '已安排':
        return {
          bg: 'bg-blue-50 text-[#0F52BA] border-blue-200',
          icon: Sparkles,
          dot: 'bg-[#0F52BA]'
        };
      default:
        return {
          bg: 'bg-zinc-50 text-zinc-600 border-zinc-200',
          icon: Clock,
          dot: 'bg-zinc-400'
        };
    }
  };

  const filteredList = wishlist.filter((item) => {
    const matchesFilter = tableFilter === 'all' || item.status === tableFilter;
    const matchesSearch =
      searchTableQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
      item.submitter.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchTableQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 sm:p-8 text-[#09090B] border border-zinc-200 shadow-xs">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700 text-[11px] font-sans font-semibold">
            <HeartHandshake className="w-3.5 h-3.5 text-[#0F52BA]" />
            <span>收录提议与文献催更</span>
          </div>
          <h2 className="font-editorial-heading font-bold text-2xl sm:text-3xl text-[#09090B] tracking-tight">
            收录心愿单与文献数据需求反馈
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed font-sans">
            若您关注的域外法学期刊、学者论文库、国际法庭最新判例或特定法域数据库尚未在本站聚合，欢迎提交收录申请，我们将审核并排期接入。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        {/* Left Column: Submission Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-6 sticky top-20">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-zinc-100">
              <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-editorial-heading font-bold text-base text-zinc-900">
                  提交新的收录心愿
                </h3>
                <p className="text-xs text-zinc-500">提交至学术智库收录评估</p>
              </div>
            </div>

            {formSuccess && (
              <div className="mb-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>提交成功！</strong> 已收录至心愿单，系统将尽快评估并推进数据采编。
                </span>
              </div>
            )}

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Type Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  收录对象类型 <span className="text-rose-500">*</span>
                </label>
                <select
                  id="wishlist-type-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as WishlistType)}
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-900 focus:bg-white focus:outline-hidden focus:border-[#0F52BA] transition-colors font-sans text-xs"
                >
                  <option value="期刊">核心期刊 (Law Review / Journal)</option>
                  <option value="学者">法学学者 (SSRN / Scholar Profile)</option>
                  <option value="论文">重磅单篇文献 (Landmark Article / DOI)</option>
                  <option value="数据库/平台">法学数据库 / 法律科技平台 (Database)</option>
                </select>
              </div>

              {/* Entity Name or Link Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  实体名称 / 官方链接 / DOI <span className="text-rose-500">*</span>
                </label>
                <input
                  id="wishlist-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：Modern Law Review 或 SSRN 教授主页链接"
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-900 focus:bg-white focus:outline-hidden focus:border-[#0F52BA] transition-colors font-sans text-xs"
                />
              </div>

              {/* Submitter Name / Affiliation */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  提交学者 / 机构 (选填)
                </label>
                <input
                  id="wishlist-submitter-input"
                  type="text"
                  value={submitter}
                  onChange={(e) => setSubmitter(e.target.value)}
                  placeholder="例如：陈老师 (中国政法大学)"
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-900 focus:bg-white focus:outline-hidden focus:border-[#0F52BA] transition-colors font-sans text-xs"
                />
              </div>

              {/* Notes / Reason */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  收录诉求与理由说明 (选填)
                </label>
                <textarea
                  id="wishlist-notes-textarea"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="说明该期刊/学者的学术价值、最新专栏或迫切需求背景..."
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-900 focus:bg-white focus:outline-hidden focus:border-[#0F52BA] transition-colors font-sans text-xs"
                />
              </div>

              {/* Submit Button */}
              <button
                id="submit-wishlist-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-md font-semibold text-xs bg-zinc-900 hover:bg-[#0F52BA] disabled:bg-zinc-400 text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>正在提交心愿单...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>立即提交心愿单</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Wishlist Records Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-6 space-y-4">
            {/* Table Header & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-editorial-heading font-bold text-base text-zinc-900">
                  心愿单收录追踪队列
                </h3>
                <p className="text-xs text-zinc-500">汇聚学者关注度最高的研究领域与学术期刊</p>
              </div>

              {/* Search & Refresh in table */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTableQuery}
                    onChange={(e) => setSearchTableQuery(e.target.value)}
                    placeholder="搜索心愿..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md text-zinc-900 focus:outline-hidden focus:border-[#0F52BA] focus:bg-white"
                  />
                </div>
                {onRefreshWishlist && (
                  <button
                    type="button"
                    onClick={onRefreshWishlist}
                    disabled={isLoading}
                    className="p-1.5 rounded-md border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50"
                    title="刷新心愿单队列"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0F52BA]' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-zinc-500 font-semibold text-[11px] whitespace-nowrap flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" />
                状态:
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: '全部状态' },
                  { id: '待处理', label: '待处理' },
                  { id: '审核中', label: '审核中' },
                  { id: '已安排', label: '已安排' },
                  { id: '已收录', label: '已收录' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setTableFilter(st.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                      tableFilter === st.id
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70 border border-zinc-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading state or Responsive Table */}
            {isLoading ? (
              <div className="py-12 text-center text-xs text-zinc-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#0F52BA]" />
                <span>正在加载心愿单列表...</span>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-zinc-200">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-zinc-50 text-zinc-700 font-semibold text-[11px] border-b border-zinc-200">
                    <tr>
                      <th className="py-3 px-3.5">收录对象 & 类型</th>
                      <th className="py-3 px-3">提议人 / 时间</th>
                      <th className="py-3 px-3.5">状态</th>
                      <th className="py-3 px-3 text-center">催更点赞</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredList.map((item) => {
                      const badge = getStatusBadge(item.status);
                      const StatusIcon = badge.icon;

                      return (
                        <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                          {/* Name & Notes */}
                          <td className="py-3.5 px-3.5 max-w-xs">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                {item.type}
                              </span>
                              <span className="font-semibold text-zinc-900 truncate">
                                {item.name}
                              </span>
                            </div>
                            <p className="text-zinc-600 line-clamp-2 leading-relaxed text-[11px]">
                              {item.notes}
                            </p>
                            {item.responseNote && (
                              <div className="mt-1.5 p-1.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800">
                                <strong>官方进度:</strong> {item.responseNote}
                              </div>
                            )}
                          </td>

                          {/* Submitter & Date */}
                          <td className="py-3.5 px-3 text-zinc-500 whitespace-nowrap">
                            <div className="font-medium text-zinc-900">{item.submitter}</div>
                            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              {item.submittedAt}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                              <StatusIcon className="w-3 h-3" />
                              {item.status}
                            </span>
                          </td>

                          {/* Votes Action */}
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <button
                              id={`vote-btn-${item.id}`}
                              onClick={() => onVoteWishlistItem(item.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border transition-all ${
                                item.userVoted
                                  ? 'bg-[#0F52BA] border-[#0F52BA] text-white font-semibold'
                                  : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                              }`}
                              title="为该收录心愿点赞催更"
                            >
                              <ThumbsUp
                                className={`w-3 h-3 ${item.userVoted ? 'fill-white' : ''}`}
                              />
                              <span className="font-mono text-xs">{item.votes}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredList.length === 0 && (
                  <div className="text-center py-10 text-zinc-400 font-sans">
                    暂无匹配的心愿单记录
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};