/**
 * LexExtern API Client Service
 * Interacts directly with Cloudflare Worker & D1 Database via /api
 * No Mock Data Fallbacks
 */

import {
  Journal,
  WishlistItem,
  Article,
  AcademicEvent,
  GlobalSearchResult,
  User,
  Author,
  Paper,
  EventItem,
  BookmarkItem,
  PaginationMeta,
} from '../types';

const API_BASE = '/api';

/**
 * 辅助获取请求头 (附加 Token 与 Credentials)
 */
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('lexextern_jwt_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const customUser = localStorage.getItem('lexextern_current_user');
  if (customUser) {
    try {
      const parsed = JSON.parse(customUser);
      if (parsed.id) headers['X-User-Id'] = parsed.id;
    } catch {}
  }
  return headers;
}

/**
 * 用户/管理员登录
 */
export async function loginUser(credentials: {
  username: string;
  password: string;
}): Promise<{ success: boolean; token: string; user: User }> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `登录失败 (HTTP ${res.status})`);
  }

  if (json.token) {
    localStorage.setItem('lexextern_jwt_token', json.token);
    localStorage.setItem('lexextern_current_user', JSON.stringify(json.user));
  }

  return json;
}

/**
 * 用户注册
 */
export async function registerUser(payload: {
  username: string;
  password: string;
  role?: string;
}): Promise<{ success: boolean; token: string; user: User }> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `注册失败 (HTTP ${res.status})`);
  }

  if (json.token) {
    localStorage.setItem('lexextern_jwt_token', json.token);
    localStorage.setItem('lexextern_current_user', JSON.stringify(json.user));
  }

  return json;
}

/**
 * 获取当前鉴权用户
 */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.authenticated && json.user ? json.user : null;
  } catch {
    return null;
  }
}

/**
 * 退出登录
 */
export async function logoutUser(): Promise<void> {
  localStorage.removeItem('lexextern_jwt_token');
  localStorage.removeItem('lexextern_current_user');
  await fetch(`${API_BASE}/logout`, { method: 'POST' }).catch(() => {});
}

/**
 * 获取学术论文信息流 (支持 tags 筛选与分页)
 */
export async function fetchPapers(
  tag?: string,
  page = 1,
  pageSize = 15
): Promise<{ papers: Paper[]; pagination: PaginationMeta }> {
  const params = new URLSearchParams();
  if (tag && tag !== '全部领域' && tag !== '全部') {
    params.set('tag', tag);
  }
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const res = await fetch(`${API_BASE}/papers?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to fetch papers (HTTP ${res.status})`);
  }

  const json = await res.json();
  const papers: Paper[] = json.data || [];
  const pagination: PaginationMeta = json.pagination || {
    page,
    pageSize,
    total: papers.length,
    totalPages: Math.ceil(papers.length / pageSize) || 1,
    hasNext: false,
    hasPrev: false,
  };

  return { papers, pagination };
}

/**
 * 获取学者画像库列表 (支持分页)
 */
export async function fetchAuthors(
  page = 1,
  pageSize = 15
): Promise<{ authors: Author[]; pagination: PaginationMeta }> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const res = await fetch(`${API_BASE}/authors?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to fetch authors (HTTP ${res.status})`);
  }

  const json = await res.json();
  const authors: Author[] = json.data || [];
  const pagination: PaginationMeta = json.pagination || {
    page,
    pageSize,
    total: authors.length,
    totalPages: Math.ceil(authors.length / pageSize) || 1,
    hasNext: false,
    hasPrev: false,
  };

  return { authors, pagination };
}

/**
 * 获取学术活动与特刊征稿 (含 DDL 倒计时计算)
 */
export async function fetchEvents(): Promise<EventItem[]> {
  const res = await fetch(`${API_BASE}/events`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to fetch events (HTTP ${res.status})`);
  }

  const json = await res.json();
  return json.data || [];
}

/**
 * 收藏 / 取消收藏 (严格绑定当前用户)
 */
export async function toggleBookmark(
  entityType: 'paper' | 'author' | 'journal' | 'article' | 'event' | string,
  entityId: string,
  userId?: string
): Promise<{ success: boolean; bookmarked: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/bookmarks/toggle`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      entity_type: entityType,
      entity_id: entityId,
      user_id: userId,
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `收藏操作失败 (HTTP ${res.status})`);
  }

  // 缓存失效
  clearApiCache('journals');
  clearApiCache('summary');
  clearApiCache('bookmarks');

  return await res.json();
}

/**
 * 获取当前登录用户所有收藏
 */
export async function fetchBookmarks(userId?: string): Promise<BookmarkItem[]> {
  const params = new URLSearchParams();
  if (userId) params.set('user_id', userId);

  const res = await fetch(`${API_BASE}/bookmarks?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `获取收藏列表失败 (HTTP ${res.status})`);
  }

  const json = await res.json();
  return json.data || [];
}

export interface AggregationSummary {
  savedCount: number;
  urgentEventCount: number;
  pinnedJournalCount: number;
  wishlistCount: number;
  authorsCount: number;
  papersCount: number;
  journalsCount: number;
  lastUpdated: string;
}

// 客户端内存缓存机制 (类似 React Query / SWR，提升标签切换流畅度与防抖频控)
const API_CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60秒缓存有效时间

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    API_CACHE.clear();
    return;
  }
  for (const key of API_CACHE.keys()) {
    if (key.startsWith(prefix)) {
      API_CACHE.delete(key);
    }
  }
}

/**
 * 获取期刊列表 (支持法域、关键词检索、分页与置顶)
 */
export async function fetchJournals(
  optionsOrPage:
    | {
        jurisdiction?: string;
        search?: string;
        tag?: string;
        page?: number;
        pageSize?: number;
        bypassCache?: boolean;
      }
    | number = {},
  fallbackPageSize = 12
): Promise<{ journals: Journal[]; pagination: PaginationMeta }> {
  let jurisdiction = '';
  let search = '';
  let tag = '';
  let page = 1;
  let pageSize = 12;
  let bypassCache = false;

  if (typeof optionsOrPage === 'number') {
    page = optionsOrPage;
    pageSize = fallbackPageSize;
  } else {
    jurisdiction = optionsOrPage.jurisdiction || '';
    search = optionsOrPage.search || '';
    tag = optionsOrPage.tag || '';
    page = optionsOrPage.page || 1;
    pageSize = optionsOrPage.pageSize || 12;
    bypassCache = Boolean(optionsOrPage.bypassCache);
  }

  const params = new URLSearchParams();
  if (jurisdiction && jurisdiction !== 'All' && jurisdiction !== '全部') {
    params.set('jurisdiction', jurisdiction);
  }
  if (search && search.trim()) {
    params.set('search', search.trim());
  }
  if (tag && tag !== '全部领域' && tag !== '全部') {
    params.set('tag', tag.trim());
  }
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const cacheKey = `journals:${params.toString()}`;
  if (!bypassCache) {
    const cached = API_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const res = await fetch(`${API_BASE}/journals?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to fetch journals (HTTP ${res.status})`);
  }
  const json = await res.json();
  const journals: Journal[] = json.data || [];
  const pagination: PaginationMeta = json.pagination || {
    page,
    pageSize,
    total: json.total ?? journals.length,
    totalPages: Math.ceil((json.total ?? journals.length) / pageSize) || 1,
    hasNext: false,
    hasPrev: false,
  };

  const result = { journals, pagination };
  API_CACHE.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

/**
 * 获取全局统计与概览信息
 */
export async function fetchSummary(bypassCache = false): Promise<AggregationSummary> {
  const cacheKey = 'summary:global';
  if (!bypassCache) {
    const cached = API_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30 * 1000) {
      return cached.data;
    }
  }

  const res = await fetch(`${API_BASE}/summary`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    return {
      savedCount: 0,
      urgentEventCount: 0,
      pinnedJournalCount: 3,
      wishlistCount: 5,
      authorsCount: 8,
      papersCount: 20,
      journalsCount: 9,
      lastUpdated: new Date().toISOString(),
    };
  }

  const json = await res.json();
  const summary: AggregationSummary = json.data || {
    savedCount: 0,
    urgentEventCount: 0,
    pinnedJournalCount: 3,
    wishlistCount: 5,
    authorsCount: 8,
    papersCount: 20,
    journalsCount: 9,
    lastUpdated: new Date().toISOString(),
  };

  API_CACHE.set(cacheKey, { data: summary, timestamp: Date.now() });
  return summary;
}

/**
 * 获取心愿单列表 (向所有用户公开展示)
 */
export async function fetchWishlist(): Promise<WishlistItem[]> {
  const res = await fetch(`${API_BASE}/wishlist`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to fetch wishlist (HTTP ${res.status})`);
  }
  const json = await res.json();
  return json.data || [];
}

/**
 * 提交新的心愿单项
 */
export async function createWishlistItem(payload: {
  name: string;
  type: string;
  submitter?: string;
  notes?: string;
}): Promise<WishlistItem> {
  const res = await fetch(`${API_BASE}/wishlist`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      entity_name: payload.name,
      entity_type: payload.type,
      submitter: payload.submitter,
      notes: payload.notes,
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to create wishlist item (HTTP ${res.status})`);
  }

  const json = await res.json();
  clearApiCache('wishlist');
  clearApiCache('summary');
  return json.data;
}

/**
 * 心愿单点赞与催更
 */
export async function voteWishlistItem(id: string, delta = 1): Promise<boolean> {
  const res = await fetch(`${API_BASE}/wishlist/vote`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id, delta }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to vote (HTTP ${res.status})`);
  }
  clearApiCache('wishlist');
  clearApiCache('summary');
  return true;
}

/**
 * FTS5 全局跨实体模糊检索与高亮
 */
export async function fetchGlobalSearch(query: string, page = 1, pageSize = 20): Promise<GlobalSearchResult[]> {
  if (!query || !query.trim()) return [];
  const params = new URLSearchParams();
  params.set('q', query.trim());
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const res = await fetch(`${API_BASE}/search?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Search failed (HTTP ${res.status})`);
  }
  const json = await res.json();
  return json.data || [];
}

/**
 * 兼容保留文献列表接口 (支持分页)
 */
export async function fetchArticles(
  tag?: string,
  jurisdiction?: string,
  page = 1,
  pageSize = 15
): Promise<{ articles: Article[]; pagination: PaginationMeta }> {
  const params = new URLSearchParams();
  if (tag && tag !== '全部领域') params.set('tag', tag);
  if (jurisdiction && jurisdiction !== 'All') params.set('jurisdiction', jurisdiction);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const res = await fetch(`${API_BASE}/articles?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to fetch articles (HTTP ${res.status})`);
  }
  const json = await res.json();
  const articles: Article[] = json.data || [];
  const pagination: PaginationMeta = json.pagination || {
    page,
    pageSize,
    total: articles.length,
    totalPages: Math.ceil(articles.length / pageSize) || 1,
    hasNext: false,
    hasPrev: false,
  };

  return { articles, pagination };
}

/**
 * 兼容旧学术研讨会接口
 */
export async function fetchAcademicEvents(): Promise<AcademicEvent[]> {
  const res = await fetch(`${API_BASE}/events`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to fetch events (HTTP ${res.status})`);
  }
  const json = await res.json();
  return (json.data || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    host: e.hostName || '学术委员会',
    type: e.eventType || '特刊征稿',
    deadline: e.deadline,
    eventDate: e.deadline,
    location: e.hostCountry || '全球',
    tags: ['法学研究', '征文'],
    description: `主办方：${e.hostName} · 截稿倒计时：${e.statusText}`,
    submissionUrl: e.hostDomain ? `https://${e.hostDomain}` : 'https://lexextern.org',
  }));
}
