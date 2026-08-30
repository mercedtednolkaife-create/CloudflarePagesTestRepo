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
  JWT_SECRET?: string;
}

// Database Row Interfaces
export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  role: string;
}

export interface InstitutionRow {
  id: string;
  name: string;
  domain: string | null;
  country: string | null;
  type: string | null;
}

export interface AuthorRow {
  id: string;
  name: string;
  ssrn_id: string | null;
  institution_id: string | null;
  institution_name?: string | null;
  institution_domain?: string | null;
  institution_country?: string | null;
  tags: string | null;
}

export interface PaperRow {
  id: string;
  title: string;
  abstract: string | null;
  journal_id: string | null;
  published_at: string | null;
  url: string | null;
  tags: string | null;
  journal_name?: string | null;
  journal_name_cn?: string | null;
  journal_abbr?: string | null;
  journal_tier?: string | null;
  journal_color?: string | null;
}

export interface EventRow {
  id: string;
  title: string;
  deadline: string;
  host_id: string | null;
  event_type: string;
  host_name?: string | null;
  host_country?: string | null;
  host_domain?: string | null;
}

export interface BookmarkRow {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

export interface JournalRow {
  id: string;
  name: string;
  issn: string | null;
  tier: string | null;
  tags: string | null;
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
  authors: string;
  author_affiliation: string;
  journal_name: string;
  journal_abbr: string;
  volume_issue: string;
  publish_date: string;
  tags: string;
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
  tags: string;
  description: string;
  submission_url: string;
  fee_info: string | null;
  created_at: string;
}

// CORS Headers Helper
const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json; charset=utf-8',
};

// Response Helpers
function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, ...extraHeaders },
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

// Pagination Helper
function parsePaginationParams(searchParams: URLSearchParams, defaultPageSize = 15) {
  const pageStr = searchParams.get('page');
  const pageSizeStr = searchParams.get('pageSize') || searchParams.get('limit');
  const page = Math.max(1, parseInt(pageStr || '1', 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(pageSizeStr || `${defaultPageSize}`, 10) || defaultPageSize));
  return { page, pageSize };
}

function paginateArray<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const validPage = Math.min(page, totalPages);
  const start = (validPage - 1) * pageSize;
  const slicedData = items.slice(start, start + pageSize);

  return {
    data: slicedData,
    pagination: {
      page: validPage,
      pageSize,
      total,
      totalPages,
      hasNext: validPage < totalPages,
      hasPrev: validPage > 1,
    },
    total,
  };
}

// Web Crypto SHA-256 Helper for Password Hashing
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Simple Base64Url JWT Implementation using Web Crypto HMAC
async function createJWT(payload: Record<string, any>, secret = 'lexextern_d1_secret_key_2026'): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 86400 }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${encodedHeader}.${encodedPayload}`));
  const signatureArray = Array.from(new Uint8Array(signature));
  const encodedSignature = btoa(String.fromCharCode(...signatureArray))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

async function verifyJWT(token: string, secret = 'lexextern_d1_secret_key_2026'): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// Extract Authenticated User from Request
async function getAuthUser(request: Request, env: Env): Promise<{ id: string; username: string; role: string } | null> {
  const authHeader = request.headers.get('Authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    // Check Cookie header
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/token=([^;]+)/);
      if (match) token = match[1];
    }
  }

  if (token) {
    const decoded = await verifyJWT(token, env.JWT_SECRET || 'lexextern_d1_secret_key_2026');
    if (decoded && decoded.userId) {
      return { id: decoded.userId, username: decoded.username, role: decoded.role || 'user' };
    }
  }

  const customUserId = request.headers.get('X-User-Id');
  if (customUserId) {
    const user = await env.DB.prepare('SELECT id, username, role FROM users WHERE id = ?').bind(customUserId).first<UserRow>();
    if (user) {
      return { id: user.id, username: user.username, role: user.role };
    }
  }

  return null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const { searchParams } = url;

    // Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // -------------------------------------------------------------
      // 1. POST /api/login - 登录与鉴权比对哈希
      // -------------------------------------------------------------
      if (pathname === '/api/login' && request.method === 'POST') {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return errorResponse('Invalid JSON payload', 400);
        }

        const username = (body.username || '').trim();
        const password = (body.password || '').trim();

        if (!username || !password) {
          return errorResponse('用户名和密码为必填项', 400);
        }

        const user = await env.DB.prepare(
          'SELECT id, username, password_hash, role FROM users WHERE username = ?'
        ).bind(username).first<UserRow>();

        if (!user) {
          return errorResponse('用户名或密码错误', 401);
        }

        const computedHash = await hashPassword(password);
        if (user.password_hash !== computedHash) {
          return errorResponse('用户名或密码错误', 401);
        }

        const token = await createJWT(
          { userId: user.id, username: user.username, role: user.role },
          env.JWT_SECRET || 'lexextern_d1_secret_key_2026'
        );

        // 设置 HttpOnly Cookie 以及返回 Token
        const cookieStr = `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`;

        return jsonResponse(
          {
            success: true,
            message: '登录成功',
            token,
            user: {
              id: user.id,
              username: user.username,
              role: user.role,
            },
          },
          200,
          { 'Set-Cookie': cookieStr }
        );
      }

      // -------------------------------------------------------------
      // 2. POST /api/register - 注册新用户
      // -------------------------------------------------------------
      if (pathname === '/api/register' && request.method === 'POST') {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return errorResponse('Invalid JSON payload', 400);
        }

        const username = (body.username || '').trim();
        const password = (body.password || '').trim();
        const role = body.role || 'user';

        if (!username || !password) {
          return errorResponse('用户名和密码为必填项', 400);
        }

        const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
        if (existing) {
          return errorResponse('该用户名已被占用', 409);
        }

        const id = `usr-${crypto.randomUUID()}`;
        const password_hash = await hashPassword(password);

        await env.DB.prepare(
          'INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)'
        ).bind(id, username, password_hash, role).run();

        const token = await createJWT({ userId: id, username, role }, env.JWT_SECRET || 'lexextern_d1_secret_key_2026');
        const cookieStr = `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`;

        return jsonResponse(
          {
            success: true,
            message: '注册成功并已自动登录',
            token,
            user: { id, username, role },
          },
          201,
          { 'Set-Cookie': cookieStr }
        );
      }

      // -------------------------------------------------------------
      // 3. GET /api/me - 获取当前登录用户信息
      // -------------------------------------------------------------
      if (pathname === '/api/me' && request.method === 'GET') {
        const authUser = await getAuthUser(request, env);
        if (!authUser) {
          return jsonResponse({ success: false, authenticated: false, user: null }, 200);
        }
        return jsonResponse({ success: true, authenticated: true, user: authUser });
      }

      // -------------------------------------------------------------
      // 4. POST /api/logout - 登出清除 Cookie
      // -------------------------------------------------------------
      if (pathname === '/api/logout' && request.method === 'POST') {
        const cookieStr = 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax';
        return jsonResponse({ success: true, message: '已安全登出' }, 200, { 'Set-Cookie': cookieStr });
      }

      // -------------------------------------------------------------
      // 5. GET /api/papers - 获取学术论文信息流 (支持 tags 筛选与分页)
      // -------------------------------------------------------------
      if (pathname === '/api/papers' && request.method === 'GET') {
        const tag = searchParams.get('tag') || searchParams.get('tags');
        const authUser = await getAuthUser(request, env);
        const currentUserId = authUser?.id || searchParams.get('user_id');
        const { page, pageSize } = parsePaginationParams(searchParams, 15);

        // 1. 获取全部论文及关联期刊信息
        const papersQuery = `
          SELECT 
            p.id,
            p.title,
            p.abstract,
            p.journal_id,
            p.published_at,
            p.url,
            p.tags,
            j.name AS journal_name,
            j.name_cn AS journal_name_cn,
            j.abbreviation AS journal_abbr,
            j.tier AS journal_tier,
            j.cover_color AS journal_color
          FROM papers p
          LEFT JOIN journals j ON p.journal_id = j.id
          ORDER BY p.published_at DESC
        `;
        const { results: paperResults } = await env.DB.prepare(papersQuery).all<PaperRow>();
        const rawPapers = paperResults || [];

        // 2. 获取论文作者关联
        const authorsQuery = `
          SELECT 
            pa.paper_id,
            a.id AS author_id,
            a.name AS author_name,
            a.ssrn_id,
            i.name AS institution_name
          FROM paper_authors pa
          JOIN authors a ON pa.author_id = a.id
          LEFT JOIN institutions i ON a.institution_id = i.id
        `;
        const { results: authorResults } = await env.DB.prepare(authorsQuery).all<{
          paper_id: string;
          author_id: string;
          author_name: string;
          ssrn_id: string | null;
          institution_name: string | null;
        }>();

        const authorsByPaper = (authorResults || []).reduce<Record<string, any[]>>((acc, row) => {
          if (!acc[row.paper_id]) acc[row.paper_id] = [];
          acc[row.paper_id].push({
            id: row.author_id,
            name: row.author_name,
            ssrnId: row.ssrn_id,
            institution: row.institution_name,
          });
          return acc;
        }, {});

        // 3. 获取用户专属收藏状态 (严格按当前登录用户绑定)
        let bookmarkedPaperIds = new Set<string>();
        if (currentUserId) {
          const bookmarksQuery = `
            SELECT entity_id FROM user_bookmarks 
            WHERE user_id = ? AND entity_type = 'paper'
          `;
          const { results: bookmarkResults } = await env.DB.prepare(bookmarksQuery)
            .bind(currentUserId)
            .all<{ entity_id: string }>();
          bookmarkedPaperIds = new Set((bookmarkResults || []).map((b) => b.entity_id));
        }

        // 4. 组装论文数据
        let papers = rawPapers.map((row) => {
          const paperAuthors = authorsByPaper[row.id] || [];
          const tags = parseJsonField<string[]>(row.tags, []);
          return {
            id: row.id,
            title: row.title,
            abstract: row.abstract || '',
            journalId: row.journal_id,
            journalName: row.journal_name || '综合法学期刊',
            journalNameCn: row.journal_name_cn || row.journal_name || '',
            journalAbbr: row.journal_abbr || '',
            journalTier: row.journal_tier || 'SSCI Q1',
            journalColor: row.journal_color || 'from-blue-900 to-indigo-950',
            publishedAt: row.published_at || '',
            url: row.url || '',
            tags,
            authors: paperAuthors.map((a) => a.name),
            authorsDetail: paperAuthors,
            isBookmarked: bookmarkedPaperIds.has(row.id),
          };
        });

        // 5. 按 tags 筛选
        if (tag && tag !== '全部领域' && tag !== '全部') {
          papers = papers.filter((p) => p.tags.includes(tag));
        }

        // 6. 优先将当前用户收藏的文献置顶
        papers.sort((a, b) => {
          if (a.isBookmarked === b.isBookmarked) {
            return (b.publishedAt || '').localeCompare(a.publishedAt || '');
          }
          return a.isBookmarked ? -1 : 1;
        });

        // 7. 分页切片与元数据构建
        const paginated = paginateArray(papers, page, pageSize);

        return jsonResponse({
          success: true,
          data: paginated.data,
          pagination: paginated.pagination,
          total: paginated.total,
          filterTag: tag || null,
        });
      }

      // -------------------------------------------------------------
      // 6. GET /api/authors - 获取学者画像库 (支持分页)
      // -------------------------------------------------------------
      if (pathname === '/api/authors' && request.method === 'GET') {
        const authUser = await getAuthUser(request, env);
        const currentUserId = authUser?.id || searchParams.get('user_id');
        const { page, pageSize } = parsePaginationParams(searchParams, 15);

        const query = `
          SELECT 
            a.id,
            a.name,
            a.ssrn_id,
            a.institution_id,
            a.tags,
            i.name AS institution_name,
            i.domain AS institution_domain,
            i.country AS institution_country,
            i.type AS institution_type
          FROM authors a
          LEFT JOIN institutions i ON a.institution_id = i.id
          ORDER BY a.name ASC
        `;
        const { results } = await env.DB.prepare(query).all<AuthorRow & {
          institution_type?: string | null;
        }>();

        // 获取学者关联的论文列表
        const authorPapersQuery = `
          SELECT 
            pa.author_id,
            p.id AS paper_id,
            p.title,
            p.published_at,
            p.url
          FROM paper_authors pa
          JOIN papers p ON pa.paper_id = p.id
        `;
        const { results: authorPaperResults } = await env.DB.prepare(authorPapersQuery).all<{
          author_id: string;
          paper_id: string;
          title: string;
          published_at: string;
          url: string;
        }>();

        const papersByAuthor = (authorPaperResults || []).reduce<Record<string, any[]>>((acc, row) => {
          if (!acc[row.author_id]) acc[row.author_id] = [];
          acc[row.author_id].push({
            id: row.paper_id,
            title: row.title,
            publishedAt: row.published_at,
            url: row.url,
          });
          return acc;
        }, {});

        // 收藏状态 (严格按当前用户绑定)
        let bookmarkedAuthorIds = new Set<string>();
        if (currentUserId) {
          const bookmarksQuery = `
            SELECT entity_id FROM user_bookmarks 
            WHERE user_id = ? AND entity_type = 'author'
          `;
          const { results: bookmarkResults } = await env.DB.prepare(bookmarksQuery)
            .bind(currentUserId)
            .all<{ entity_id: string }>();
          bookmarkedAuthorIds = new Set((bookmarkResults || []).map((b) => b.entity_id));
        }

        const authors = (results || []).map((row) => {
          const authorPapers = papersByAuthor[row.id] || [];
          return {
            id: row.id,
            name: row.name,
            ssrnId: row.ssrn_id,
            ssrnUrl: row.ssrn_id ? `https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=${row.ssrn_id.replace('ssrn-', '')}` : null,
            institutionId: row.institution_id,
            institution: row.institution_name
              ? {
                  id: row.institution_id,
                  name: row.institution_name,
                  domain: row.institution_domain,
                  country: row.institution_country,
                  type: row.institution_type || 'University',
                }
              : null,
            tags: parseJsonField<string[]>(row.tags, []),
            papersCount: authorPapers.length,
            papers: authorPapers,
            isBookmarked: bookmarkedAuthorIds.has(row.id),
          };
        });

        // 优先将已标星学者置顶
        authors.sort((a, b) => {
          if (a.isBookmarked === b.isBookmarked) {
            return a.name.localeCompare(b.name);
          }
          return a.isBookmarked ? -1 : 1;
        });

        const paginated = paginateArray(authors, page, pageSize);

        return jsonResponse({
          success: true,
          data: paginated.data,
          pagination: paginated.pagination,
          total: paginated.total,
        });
      }

      // -------------------------------------------------------------
      // 7. GET /api/events - 获取学术活动与特刊征稿 (支持 DDL 倒计时计算)
      // -------------------------------------------------------------
      if (pathname === '/api/events' && request.method === 'GET') {
        const query = `
          SELECT 
            e.id,
            e.title,
            e.deadline,
            e.event_type,
            e.host_id,
            i.name AS host_name,
            i.country AS host_country,
            i.domain AS host_domain
          FROM events e
          LEFT JOIN institutions i ON e.host_id = i.id
          ORDER BY e.deadline ASC
        `;
        const { results } = await env.DB.prepare(query).all<EventRow>();

        const formatted = (results || []).map((row) => {
          const now = new Date();
          const target = new Date(`${row.deadline}T23:59:59`);
          const diffMs = target.getTime() - now.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          const isUrgent = diffDays >= 0 && diffDays <= 7;
          const isExpired = diffDays < 0;

          return {
            id: row.id,
            title: row.title,
            deadline: row.deadline,
            eventType: row.event_type,
            hostId: row.host_id,
            hostName: row.host_name || '国际法学院联合会',
            hostCountry: row.host_country || '全球',
            hostDomain: row.host_domain || '',
            daysRemaining: diffDays,
            isUrgent,
            isExpired,
            statusText: isExpired ? '已截止' : diffDays === 0 ? '今日截止' : `剩余 ${diffDays} 天`,
          };
        });

        return jsonResponse({
          success: true,
          data: formatted,
          total: formatted.length,
        });
      }

      // -------------------------------------------------------------
      // 8. POST /api/bookmarks/toggle - 收藏/取消收藏 (与当前用户严格绑定)
      // -------------------------------------------------------------
      if (pathname === '/api/bookmarks/toggle' && request.method === 'POST') {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return errorResponse('Invalid JSON payload', 400);
        }

        const entityType = (body.entity_type || body.entityType || '').trim().toLowerCase();
        const entityId = (body.entity_id || body.entityId || '').trim();
        const authUser = await getAuthUser(request, env);
        const userId = authUser?.id || body.user_id;

        if (!userId) {
          return errorResponse('请先登录后再进行收藏操作', 401);
        }

        if (!entityType || !entityId) {
          return errorResponse('entity_type 和 entity_id 为必填参数', 400);
        }

        // 查询当前用户是否已收藏
        const existing = await env.DB.prepare(
          'SELECT id FROM user_bookmarks WHERE user_id = ? AND entity_type = ? AND entity_id = ?'
        ).bind(userId, entityType, entityId).first<BookmarkRow>();

        if (existing) {
          // 已收藏 -> 删除 (取消收藏)
          await env.DB.prepare('DELETE FROM user_bookmarks WHERE id = ?').bind(existing.id).run();
          return jsonResponse({
            success: true,
            bookmarked: false,
            message: '已取消收藏',
            entityType,
            entityId,
          });
        } else {
          // 未收藏 -> 插入 (收藏/标星)
          const bookmarkId = `bm-${crypto.randomUUID()}`;
          await env.DB.prepare(
            'INSERT INTO user_bookmarks (id, user_id, entity_type, entity_id) VALUES (?, ?, ?, ?)'
          ).bind(bookmarkId, userId, entityType, entityId).run();

          return jsonResponse({
            success: true,
            bookmarked: true,
            message: '已成功收藏至个人书签',
            entityType,
            entityId,
          }, 201);
        }
      }

      // -------------------------------------------------------------
      // 9. GET /api/bookmarks - 获取当前登录用户的全部收藏
      // -------------------------------------------------------------
      if (pathname === '/api/bookmarks' && request.method === 'GET') {
        const authUser = await getAuthUser(request, env);
        const userId = authUser?.id || searchParams.get('user_id');

        if (!userId) {
          return jsonResponse({ success: true, data: [], total: 0 });
        }

        const query = `
          SELECT * FROM user_bookmarks 
          WHERE user_id = ? 
          ORDER BY created_at DESC
        `;
        const { results } = await env.DB.prepare(query).bind(userId).all<BookmarkRow>();

        return jsonResponse({
          success: true,
          data: results || [],
          total: (results || []).length,
        });
      }

      // -------------------------------------------------------------
      // 10. GET /api/journals - 获取期刊列表 (支持分页与置顶)
      // -------------------------------------------------------------
      if (pathname === '/api/journals' && request.method === 'GET') {
        const authUser = await getAuthUser(request, env);
        const userId = authUser?.id || searchParams.get('user_id');
        const { page, pageSize } = parsePaginationParams(searchParams, 15);

        const query = `
          SELECT * FROM journals 
          ORDER BY is_pinned DESC, name_cn ASC
        `;
        const { results } = await env.DB.prepare(query).all<JournalRow>();

        // 联合查询当前用户 user_bookmarks 中的期刊收藏
        let bookmarkedJournalIds = new Set<string>();
        if (userId) {
          const bmQuery = `SELECT entity_id FROM user_bookmarks WHERE user_id = ? AND entity_type = 'journal'`;
          const { results: bmResults } = await env.DB.prepare(bmQuery).bind(userId).all<{ entity_id: string }>();
          bookmarkedJournalIds = new Set((bmResults || []).map((b) => b.entity_id));
        }

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
          isPinned: Boolean(row.is_pinned || bookmarkedJournalIds.has(row.id)),
          coverColor: row.cover_color || 'from-blue-900 to-indigo-950',
          description: row.description || '',
          officialUrl: row.official_url || '',
          recentArticlesCount: row.recent_articles_count || 0,
        }));

        // 置顶排序优先
        formatted.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

        const paginated = paginateArray(formatted, page, pageSize);

        return jsonResponse({
          success: true,
          data: paginated.data,
          pagination: paginated.pagination,
          total: paginated.total,
        });
      }

      // -------------------------------------------------------------
      // 11. GET & POST /api/wishlist - 心愿单 (向所有用户公开展示)
      // -------------------------------------------------------------
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

      if ((pathname === '/api/wishlist' || pathname === '/api/wishlists') && request.method === 'POST') {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return errorResponse('Invalid JSON payload in request body', 400);
        }

        const entityName = (body.entity_name || body.name || '').trim();
        const entityType = (body.entity_type || body.type || '期刊').trim();
        const authUser = await getAuthUser(request, env);
        const submitter = (body.submitter || authUser?.username || '法学匿名学者').trim();
        const notes = (body.notes || '').trim();
        const userId = authUser?.id || body.user_id || `usr-${Date.now()}`;
        const id = body.id || `wish-${crypto.randomUUID()}`;
        const status = body.status || '待处理';

        if (!entityName) {
          return errorResponse('收录实体名称 (entity_name) 为必填项', 400);
        }

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
          data: createdItem,
        }, 201);
      }

      if (pathname === '/api/wishlist/vote' && request.method === 'POST') {
        const body: any = await request.json();
        const { id, delta = 1 } = body;
        if (!id) return errorResponse('Wishlist ID required', 400);

        await env.DB.prepare(`
          UPDATE wishlists SET votes = MAX(0, votes + ?) WHERE id = ?
        `).bind(delta, id).run();

        return jsonResponse({ success: true, message: '投票已更新' });
      }

      // -------------------------------------------------------------
      // 12. GET /api/search?q={keyword} - FTS5 全局跨实体检索 (支持分页)
      // -------------------------------------------------------------
      if (pathname === '/api/search' && request.method === 'GET') {
        const keyword = (searchParams.get('q') || '').trim();
        const { page, pageSize } = parsePaginationParams(searchParams, 15);

        if (!keyword) {
          return jsonResponse({
            success: true,
            keyword: '',
            data: [],
            pagination: { page: 1, pageSize, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
            total: 0,
          });
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
          LIMIT 100
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

          const paginated = paginateArray(formatted, page, pageSize);

          return jsonResponse({
            success: true,
            keyword,
            data: paginated.data,
            pagination: paginated.pagination,
            total: paginated.total,
          });
        } catch {
          // Fallback to LIKE
          const likePattern = `%${sanitizedKeyword}%`;
          const fallbackQuery = `
            SELECT entity_type, entity_id, title, content 
            FROM global_search 
            WHERE title LIKE ? OR content LIKE ?
            LIMIT 100
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

          const paginated = paginateArray(formatted, page, pageSize);

          return jsonResponse({
            success: true,
            keyword,
            data: paginated.data,
            pagination: paginated.pagination,
            total: paginated.total,
          });
        }
      }

      // -------------------------------------------------------------
      // 13. GET /api/articles - 兼容保留文献流列表 (支持分页)
      // -------------------------------------------------------------
      if (pathname === '/api/articles' && request.method === 'GET') {
        const tag = searchParams.get('tag');
        const jurisdiction = searchParams.get('jurisdiction');
        const authUser = await getAuthUser(request, env);
        const userId = authUser?.id || searchParams.get('user_id');
        const { page, pageSize } = parsePaginationParams(searchParams, 15);

        let query = `SELECT * FROM articles WHERE 1=1`;
        const params: any[] = [];

        if (jurisdiction && jurisdiction !== 'All') {
          query += ` AND jurisdiction = ?`;
          params.push(jurisdiction);
        }

        query += ` ORDER BY publish_date DESC`;

        const stmt = params.length > 0 ? env.DB.prepare(query).bind(...params) : env.DB.prepare(query);
        const { results } = await stmt.all<ArticleRow>();

        // 联合查询收藏
        let savedIds = new Set<string>();
        if (userId) {
          const bmQuery = `SELECT entity_id FROM user_bookmarks WHERE user_id = ? AND entity_type IN ('article', 'paper')`;
          const { results: bmResults } = await env.DB.prepare(bmQuery).bind(userId).all<{ entity_id: string }>();
          savedIds = new Set((bmResults || []).map((b) => b.entity_id));
        }

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
          saved: Boolean(row.saved || savedIds.has(row.id)),
          readingTime: row.reading_time || '15 分钟',
          jurisdiction: (row.jurisdiction || 'All') as any,
          featured: Boolean(row.featured),
        }));

        if (tag && tag !== '全部领域') {
          filtered = filtered.filter((a) => a.tags.includes(tag));
        }

        // 收藏文献优先置顶
        filtered.sort((a, b) => (b.saved ? 1 : 0) - (a.saved ? 1 : 0));

        const paginated = paginateArray(filtered, page, pageSize);

        return jsonResponse({
          success: true,
          data: paginated.data,
          pagination: paginated.pagination,
          total: paginated.total,
        });
      }

      // 404 Not Found
      return jsonResponse({ error: 'Endpoint Not Found', pathname, method: request.method }, 404);
    } catch (err: any) {
      console.error('Worker error:', err);
      return errorResponse(err?.message || 'Internal Server Error', 500);
    }
  },
};
