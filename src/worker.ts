/**
 * Cloudflare Worker Backend API for LexExtern
 * Bound with Cloudflare D1 Database (SQLite)
 */

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  all<T = Record<string, any>>(): Promise<{ results?: T[]; success: boolean; meta?: any }>;
  run(): Promise<{ success: boolean; meta?: any }>;
  first<T = Record<string, any>>(colName?: string): Promise<T | null>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<any[]>;
  exec(query: string): Promise<any>;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export interface Env {
  DB: D1Database;
}

export interface JournalRow {
  id: string;
  name: string;
  issn: string | null;
  tier: string | null;
  tags: string | null; // JSON string
  name_cn: string;
  abbreviation: string;
  institution: string;
  country: string;
  jurisdiction: string;
  category: string;
  impact_rank: string;
  current_issue: string;
  frequency: string;
  is_pinned: number;
  cover_color: string;
  description: string;
  official_url: string;
  recent_articles_count: number;
  created_at: string;
}

export interface WishlistRow {
  id: string;
  user_id: string;
  entity_type: string;
  entity_name: string;
  status: string;
  submitter: string;
  notes: string;
  votes: number;
  response_note: string | null;
  created_at: string;
}

export interface ArticleRow {
  id: string;
  title_cn: string;
  title_original: string;
  authors: string; // JSON string
  author_affiliation: string;
  journal_name: string;
  journal_abbr: string;
  volume_issue: string;
  publish_date: string;
  tags: string; // JSON string
  abstract_cn: string;
  abstract_original: string;
  doi: string;
  pdf_url: string | null;
  citations_count: number;
  saved: number;
  reading_time: string;
  jurisdiction: string;
  featured: number;
  created_at: string;
}

export interface AcademicEventRow {
  id: string;
  title: string;
  host: string;
  type: string;
  deadline: string;
  event_date: string;
  location: string;
  tags: string; // JSON string
  description: string;
  submission_url: string;
  fee_info: string | null;
  created_at: string;
}

// CORS Headers Helper
const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8',
};

// Response Helpers
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

function errorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message, success: false }), {
    status,
    headers: corsHeaders,
  });
}

function parseJsonField<T>(value: string | null | undefined, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    // Normalize pathname: remove trailing slashes for resilient matching
    let pathname = url.pathname.replace(/\/+$/, '') || '/';
    const { searchParams } = url;

    // Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // 1. GET /api/journals - 获取期刊列表
      if (pathname === '/api/journals' && request.method === 'GET') {
        const query = `
          SELECT * FROM journals 
          ORDER BY is_pinned DESC, name_cn ASC
        `;
        const { results } = await env.DB.prepare(query).all<JournalRow>();

        const formatted = (results || []).map((row: JournalRow) => ({
          id: row.id,
          name: row.name,
          issn: row.issn,
          tier: row.tier,
          tags: parseJsonField<string[]>(row.tags, []),
          nameCn: row.name_cn || row.name,
          nameOriginal: row.name,
          abbreviation: row.abbreviation || '',
          institution: row.institution || '',
          country: row.country || '',
          jurisdiction: row.jurisdiction || 'All',
          category: row.category || '',
          impactRank: row.impact_rank || '',
          currentIssue: row.current_issue || '',
          frequency: row.frequency || '',
          isPinned: Boolean(row.is_pinned),
          coverColor: row.cover_color || 'from-blue-900 to-indigo-950',
          description: row.description || '',
          officialUrl: row.official_url || '',
          recentArticlesCount: row.recent_articles_count || 0,
        }));

        return jsonResponse({ success: true, data: formatted, total: formatted.length });
      }

      // 2. GET /api/wishlist or /api/wishlists - 获取心愿单列表
      if ((pathname === '/api/wishlist' || pathname === '/api/wishlists') && request.method === 'GET') {
        const query = `
          SELECT * FROM wishlists 
          ORDER BY votes DESC, created_at DESC
        `;
        const { results } = await env.DB.prepare(query).all<WishlistRow>();

        const formatted = (results || []).map((row: WishlistRow) => ({
          id: row.id,
          userId: row.user_id,
          entityType: row.entity_type,
          entityName: row.entity_name,
          name: row.entity_name,
          type: row.entity_type,
          status: row.status,
          submitter: row.submitter || '匿名学者',
          notes: row.notes || '',
          votes: row.votes || 0,
          responseNote: row.response_note || undefined,
          submittedAt: row.created_at ? row.created_at.split(' ')[0] : new Date().toISOString().split('T')[0],
        }));

        return jsonResponse({ success: true, data: formatted, total: formatted.length });
      }

      // 3. POST /api/wishlist - 提交新心愿单
      if ((pathname === '/api/wishlist' || pathname === '/api/wishlists') && request.method === 'POST') {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return errorResponse('Invalid JSON payload in request body', 400);
        }

        const entityName = (body.entity_name || body.name || '').trim();
        const entityType = (body.entity_type || body.type || '期刊').trim();
        const submitter = (body.submitter || '法学匿名学者').trim();
        const notes = (body.notes || '').trim();
        const userId = body.user_id || `usr-${Date.now()}`;
        // 使用 Web Crypto 生成标准 UUID 作为主键 ID
        const id = body.id || `wish-${crypto.randomUUID()}`;
        const status = body.status || '待处理';

        if (!entityName) {
          return errorResponse('收录实体名称 (entity_name) 为必填项', 400);
        }

        // 插入 D1 数据库 wishlists 表
        await env.DB.prepare(`
          INSERT INTO wishlists (id, user_id, entity_type, entity_name, status, submitter, notes, votes)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `).bind(id, userId, entityType, entityName, status, submitter, notes).run();

        // 自动同步至 FTS5 全局检索虚拟表
        const searchContent = `${notes} 提议人: ${submitter} 类型: ${entityType}`;
        await env.DB.prepare(`
          INSERT INTO global_search (entity_type, entity_id, title, content)
          VALUES (?, ?, ?, ?)
        `).bind('wishlist', id, entityName, searchContent).run();

        const createdItem = {
          id,
          userId,
          entityType,
          entityName,
          name: entityName,
          type: entityType,
          status,
          submitter,
          notes,
          votes: 1,
          submittedAt: new Date().toISOString().split('T')[0],
        };

        return jsonResponse({
          success: true,
          message: '心愿单已成功写入 Cloudflare D1 数据库',
          data: createdItem
        }, 201);
      }

      // 4. POST /api/wishlist/vote - 心愿单点赞/催更
      if (pathname === '/api/wishlist/vote' && request.method === 'POST') {
        const body: any = await request.json();
        const { id, delta = 1 } = body;
        if (!id) return errorResponse('Wishlist ID required', 400);

        await env.DB.prepare(`
          UPDATE wishlists SET votes = MAX(0, votes + ?) WHERE id = ?
        `).bind(delta, id).run();

        return jsonResponse({ success: true, message: '投票已更新' });
      }

      // 5. GET /api/search?q={keyword} - FTS5 全局跨实体检索
      if (pathname === '/api/search' && request.method === 'GET') {
        const keyword = (searchParams.get('q') || '').trim();

        if (!keyword) {
          return jsonResponse({ success: true, keyword: '', data: [], total: 0 });
        }

        const sanitizedKeyword = keyword.replace(/"/g, '""');
        const matchPattern = `"${sanitizedKeyword}"`;

        const query = `
          SELECT 
            entity_type,
            entity_id,
            highlight(global_search, 2, '<mark class="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">', '</mark>') AS title_highlighted,
            highlight(global_search, 3, '<mark class="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">', '</mark>') AS content_highlighted,
            title,
            content
          FROM global_search
          WHERE global_search MATCH ?
          LIMIT 30
        `;

        try {
          const { results } = await env.DB.prepare(query).bind(matchPattern).all<{
            entity_type: string;
            entity_id: string;
            title_highlighted: string;
            content_highlighted: string;
            title: string;
            content: string;
          }>();

          const formatted = (results || []).map((row) => ({
            entityType: row.entity_type,
            entityId: row.entity_id,
            titleHighlighted: row.title_highlighted,
            contentHighlighted: row.content_highlighted,
            rawTitle: row.title,
            rawContent: row.content,
          }));

          return jsonResponse({
            success: true,
            keyword,
            data: formatted,
            total: formatted.length,
          });
        } catch {
          // Fallback to LIKE
          const likePattern = `%${sanitizedKeyword}%`;
          const fallbackQuery = `
            SELECT entity_type, entity_id, title, content 
            FROM global_search 
            WHERE title LIKE ? OR content LIKE ?
            LIMIT 30
          `;
          const { results } = await env.DB.prepare(fallbackQuery).bind(likePattern, likePattern).all<{
            entity_type: string;
            entity_id: string;
            title: string;
            content: string;
          }>();

          const formatted = (results || []).map((row) => ({
            entityType: row.entity_type,
            entityId: row.entity_id,
            titleHighlighted: row.title,
            contentHighlighted: row.content,
            rawTitle: row.title,
            rawContent: row.content,
          }));

          return jsonResponse({
            success: true,
            keyword,
            data: formatted,
            total: formatted.length,
          });
        }
      }

      // 6. GET /api/articles - 文献流列表
      if (pathname === '/api/articles' && request.method === 'GET') {
        const tag = searchParams.get('tag');
        const jurisdiction = searchParams.get('jurisdiction');

        let query = `SELECT * FROM articles WHERE 1=1`;
        const params: any[] = [];

        if (jurisdiction && jurisdiction !== 'All') {
          query += ` AND jurisdiction = ?`;
          params.push(jurisdiction);
        }

        query += ` ORDER BY publish_date DESC`;

        const stmt = params.length > 0 
          ? env.DB.prepare(query).bind(...params) 
          : env.DB.prepare(query);

        const { results } = await stmt.all<ArticleRow>();

        let filtered = (results || []).map((row: ArticleRow) => ({
          id: row.id,
          titleCn: row.title_cn,
          titleOriginal: row.title_original,
          authors: parseJsonField<string[]>(row.authors, []),
          authorAffiliation: row.author_affiliation || '',
          journalName: row.journal_name,
          journalAbbr: row.journal_abbr || '',
          volumeIssue: row.volume_issue || '',
          publishDate: row.publish_date || '',
          tags: parseJsonField<string[]>(row.tags, []),
          abstractCn: row.abstract_cn || '',
          abstractOriginal: row.abstract_original || '',
          doi: row.doi || '',
          pdfUrl: row.pdf_url || undefined,
          citationsCount: row.citations_count || 0,
          saved: Boolean(row.saved),
          readingTime: row.reading_time || '15 分钟',
          jurisdiction: (row.jurisdiction || 'All') as any,
          featured: Boolean(row.featured),
        }));

        if (tag && tag !== '全部领域') {
          filtered = filtered.filter((a) => a.tags.includes(tag));
        }

        return jsonResponse({ success: true, data: filtered, total: filtered.length });
      }

      // 7. GET /api/events - 学术活动与特刊列表
      if (pathname === '/api/events' && request.method === 'GET') {
        const query = `SELECT * FROM academic_events ORDER BY deadline ASC`;
        const { results } = await env.DB.prepare(query).all<AcademicEventRow>();

        const formatted = (results || []).map((row: AcademicEventRow) => ({
          id: row.id,
          title: row.title,
          host: row.host,
          type: row.type as any,
          deadline: row.deadline,
          eventDate: row.event_date || '',
          location: row.location || '',
          tags: parseJsonField<string[]>(row.tags, []),
          description: row.description || '',
          submissionUrl: row.submission_url || '',
          feeInfo: row.fee_info || undefined,
        }));

        return jsonResponse({ success: true, data: formatted, total: formatted.length });
      }

      // 404 Not Found
      return jsonResponse({ error: 'Endpoint Not Found', pathname, method: request.method }, 404);
    } catch (err: any) {
      console.error('Worker error:', err);
      return errorResponse(err?.message || 'Internal Server Error', 500);
    }
  },
};
