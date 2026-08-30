/**
 * LexExtern API Client Service
 * Interacts directly with Cloudflare Worker & D1 Database via /api
 * No Mock Data Fallbacks
 */

import { Journal, WishlistItem, Article, AcademicEvent, GlobalSearchResult } from '../types';

const API_BASE = '/api';

/**
 * 获取期刊列表
 */
export async function fetchJournals(): Promise<Journal[]> {
  const res = await fetch(`${API_BASE}/journals`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to fetch journals (HTTP ${res.status})`);
  }
  const json = await res.json();
  return json.data || [];
}

/**
 * 获取心愿单列表
 */
export async function fetchWishlist(): Promise<WishlistItem[]> {
  const res = await fetch(`${API_BASE}/wishlist`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to fetch wishlist (HTTP ${res.status})`);
  }
  const json = await res.json();
  return json.data || [];
}

/**
 * 提交新的心愿单项 (必须收到后端 200/201 成功响应)
 */
export async function createWishlistItem(payload: {
  name: string;
  type: string;
  submitter?: string;
  notes?: string;
}): Promise<WishlistItem> {
  const res = await fetch(`${API_BASE}/wishlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  return json.data;
}

/**
 * 心愿单点赞与催更
 */
export async function voteWishlistItem(id: string, delta = 1): Promise<boolean> {
  const res = await fetch(`${API_BASE}/wishlist/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, delta }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to vote (HTTP ${res.status})`);
  }
  return true;
}

/**
 * FTS5 全局跨实体模糊检索与高亮
 */
export async function fetchGlobalSearch(query: string): Promise<GlobalSearchResult[]> {
  if (!query || !query.trim()) return [];
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Search failed (HTTP ${res.status})`);
  }
  const json = await res.json();
  return json.data || [];
}

/**
 * 获取学术文献列表
 */
export async function fetchArticles(tag?: string, jurisdiction?: string): Promise<Article[]> {
  const params = new URLSearchParams();
  if (tag && tag !== '全部领域') params.set('tag', tag);
  if (jurisdiction && jurisdiction !== 'All') params.set('jurisdiction', jurisdiction);

  const res = await fetch(`${API_BASE}/articles?${params.toString()}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to fetch articles (HTTP ${res.status})`);
  }
  const json = await res.json();
  return json.data || [];
}

/**
 * 获取学术研讨会与 CFP 列表
 */
export async function fetchAcademicEvents(): Promise<AcademicEvent[]> {
  const res = await fetch(`${API_BASE}/events`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to fetch events (HTTP ${res.status})`);
  }
  const json = await res.json();
  return json.data || [];
}
