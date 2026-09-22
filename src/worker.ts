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
  name_cn?: string | null;
  openalex_author_id?: string | null;
  orcid?: string | null;
  ssrn_id: string | null;
  profile_url?: string | null;
  institution_id: string | null;
  institution_name?: string | null;
  institution_domain?: string | null;
  institution_country?: string | null;
  institution_type?: string | null;
  tags: string | null;
  tags_cn?: string | null;
}

export interface PaperRow {
  id: string;
  journal_id: string | null;
  paper_type?: string;
  edition?: string;
  category?: string;
  category_cn?: string;
  title: string;
  title_cn?: string | null;
  abstract: string | null;
  abstract_cn?: string | null;
  volume?: string | null;
  issue?: string | null;
  volume_issue?: string | null;
  published_at: string | null;
  url: string | null;
  canonical_url?: string | null;
  pdf_url?: string | null;
  doi?: string | null;
  authors_json?: string | null;
  recommended_citation?: string | null;
  first_page?: string | null;
  last_page?: string | null;
  tags: string | null;
  tags_cn?: string | null;
  reading_time?: number;
  featured?: number;
  citations_count?: number;
  journal_name?: string | null;
  journal_name_cn?: string | null;
  journal_abbr?: string | null;
  journal_tier?: string | null;
  journal_color?: string | null;
}

export interface EventRow {
  id: string;
  feed_guid?: string | null;
  title: string;
  title_cn?: string | null;
  event_category?: 'call_for_papers' | 'academic_job' | string;
  event_type: string;
  deadline: string;
  submission_deadline?: string | null;
  deadline_type?: 'fixed' | 'rolling' | 'tbd';
  deadline_display?: string | null;
  timezone?: string;
  is_extended?: number;
  original_deadline?: string | null;
  notification_date?: string | null;
  event_start_date?: string | null;
  event_end_date?: string | null;
  event_date?: string | null;
  host_id: string | null;
  host_name?: string | null;
  host_country?: string | null;
  host_domain?: string | null;
  journal_id?: string | null;
  location?: string | null;
  academic_year?: string | null;
  hiring_rank?: string | null;
  subject_areas?: string | null;
  contact_info?: string | null;
  tags_cn?: string | null;
  description?: string | null;
  description_cn?: string | null;
  official_url?: string | null;
  submission_url?: string | null;
  fee_info?: string | null;
  is_pinned?: number;
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
  name_cn: string;
  abbreviation: string;
  institution?: string | null;
  country?: string | null;
  jurisdiction?: string | null;
  issn_print?: string | null;
  issn_electronic?: string | null;
  issn: string | null;
  tier: string | null;
  category: string;
  tags: string | null;
  tags_cn?: string | null;
  impact_rank: string;
  current_issue: string;
  frequency: string;
  is_pinned: number;
  cover_color: string;
  description: string;
  official_url: string;
  recent_articles_count: number;
  source_type?: string;
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

export interface WishlistVoteRow {
  id: string;
  user_id: string;
  wishlist_id: string;
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

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode base64url signature safely
    const paddedSig = sigB64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = paddedSig.length % 4;
    const normalizedSig = pad ? paddedSig + '='.repeat(4 - pad) : paddedSig;
    const binarySig = atob(normalizedSig);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(`${headerB64}.${payloadB64}`)
    );

    if (!isValid) return null;
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
      // 2. POST /api/register - 注册新用户 (测试阶段关闭自主注册)
      // -------------------------------------------------------------
      if (pathname === '/api/register' && request.method === 'POST') {
        return errorResponse('当前测试阶段暂未开放自主注册，请联系系统管理员获取分配的学者通行证', 403);
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
      // -------------------------------------------------------------
      // 5. GET /api/papers - 获取学术论文信息流 (支持 tags、journal、volume、issue、search 筛选与服务端真分页)
      // -------------------------------------------------------------
      if (pathname === '/api/papers' && request.method === 'GET') {
        const tag = searchParams.get('tag') || searchParams.get('tags');
        const journalFilter = searchParams.get('journal');
        const volumeFilter = searchParams.get('volume');
        const issueFilter = searchParams.get('issue');
        const keyword = searchParams.get('q') || searchParams.get('search') || searchParams.get('query');
        const authUser = await getAuthUser(request, env);
        const currentUserId = authUser?.id || searchParams.get('user_id');
        const { page, pageSize } = parsePaginationParams(searchParams, 15);
        const offset = (page - 1) * pageSize;
        const bookmarkedOnly = searchParams.get('bookmarked') === 'true' || searchParams.get('saved') === 'true';

        const whereClauses: string[] = [];
        const params: any[] = [];

        if (bookmarkedOnly) {
          if (currentUserId) {
            whereClauses.push(`p.id IN (SELECT entity_id FROM user_bookmarks WHERE user_id = ? AND entity_type = 'paper')`);
            params.push(currentUserId);
          } else {
            whereClauses.push('1 = 0');
          }
        }

        if (tag && tag !== '全部领域' && tag !== '全部') {
          whereClauses.push(`(p.tags LIKE ? OR p.tags_cn LIKE ?)`);
          params.push(`%${tag}%`, `%${tag}%`);
        }

        if (journalFilter && journalFilter !== 'all' && journalFilter !== '全部期刊') {
          whereClauses.push(`(
            LOWER(j.name) = LOWER(?) OR 
            LOWER(COALESCE(j.name_cn, '')) = LOWER(?) OR 
            LOWER(COALESCE(j.abbreviation, '')) = LOWER(?) OR 
            LOWER(COALESCE(p.journal_name_cn, '')) = LOWER(?)
          )`);
          params.push(journalFilter, journalFilter, journalFilter, journalFilter);
        }

        if (volumeFilter && volumeFilter !== 'all' && volumeFilter !== '全部卷') {
          whereClauses.push(`(LOWER(COALESCE(p.volume, '')) = LOWER(?) OR LOWER(COALESCE(p.volume_issue, '')) LIKE ?)`);
          params.push(volumeFilter, `%${volumeFilter.toLowerCase()}%`);
        }

        if (issueFilter && issueFilter !== 'all' && issueFilter !== '全部期') {
          whereClauses.push(`(LOWER(COALESCE(p.issue, '')) = LOWER(?) OR LOWER(COALESCE(p.volume_issue, '')) LIKE ?)`);
          params.push(issueFilter, `%${issueFilter.toLowerCase()}%`);
        }

        if (keyword && keyword.trim()) {
          const kw = `%${keyword.trim().toLowerCase()}%`;
          whereClauses.push(`(
            LOWER(p.title) LIKE ? OR 
            LOWER(COALESCE(p.title_cn, '')) LIKE ? OR 
            LOWER(COALESCE(p.abstract, '')) LIKE ? OR 
            LOWER(COALESCE(p.abstract_cn, '')) LIKE ? OR 
            LOWER(COALESCE(p.authors_json, '')) LIKE ? OR 
            LOWER(COALESCE(p.journal_name_cn, '')) LIKE ? OR 
            LOWER(COALESCE(j.name, '')) LIKE ? OR 
            LOWER(COALESCE(j.name_cn, '')) LIKE ?
          )`);
          params.push(kw, kw, kw, kw, kw, kw, kw, kw);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // 利用 D1 batch 单次往返同时拉取总数与当前页 15 条切片
        const countQuery = `SELECT count(*) as total FROM papers p LEFT JOIN journals j ON p.journal_id = j.id ${whereSql}`;
        const dataQuery = `
          SELECT 
            p.id,
            p.journal_id,
            p.paper_type,
            p.edition,
            p.category,
            p.category_cn,
            p.title,
            p.title_cn,
            p.abstract,
            p.abstract_cn,
            p.volume,
            p.issue,
            p.volume_issue,
            p.published_at,
            p.canonical_url AS url,
            p.canonical_url,
            p.pdf_url,
            p.doi,
            p.authors_json,
            p.journal_name_cn,
            p.recommended_citation,
            p.first_page,
            p.last_page,
            p.tags,
            p.tags_cn,
            p.reading_time,
            p.featured,
            p.citations_count,
            j.name AS journal_name,
            j.name_cn AS j_name_cn,
            j.abbreviation AS journal_abbr,
            j.tier AS journal_tier,
            j.cover_color AS journal_color
          FROM papers p
          LEFT JOIN journals j ON p.journal_id = j.id
          ${whereSql}
          ORDER BY p.published_at DESC
          LIMIT ? OFFSET ?
        `;

        const countStmt = env.DB.prepare(countQuery).bind(...params);
        const dataStmt = env.DB.prepare(dataQuery).bind(...params, pageSize, offset);

        const [countRes, dataRes] = await env.DB.batch<any>([countStmt, dataStmt]);
        const total = (countRes?.results?.[0] as any)?.total || 0;
        const rawPapers = (dataRes?.results as (PaperRow & { j_name_cn?: string | null })[]) || [];

        // 仅对当前页的 15 篇论文针对当前登录用户查一次收藏状态
        let bookmarkedPaperIds = new Set<string>();
        if (currentUserId && rawPapers.length > 0) {
          const placeholders = rawPapers.map(() => '?').join(',');
          const bmQuery = `
            SELECT entity_id FROM user_bookmarks 
            WHERE user_id = ? AND entity_type = 'paper' AND entity_id IN (${placeholders})
          `;
          const { results: bookmarkResults } = await env.DB.prepare(bmQuery)
            .bind(currentUserId, ...rawPapers.map((p) => p.id))
            .all<{ entity_id: string }>();
          bookmarkedPaperIds = new Set((bookmarkResults || []).map((b) => b.entity_id));
        }

        const papers = rawPapers.map((row) => {
          const tags = parseJsonField<string[]>(row.tags, []);
          const tagsCn = parseJsonField<string[]>(row.tags_cn, []);
          const parsedAuthorsJson = parseJsonField<any[]>(row.authors_json, []);
          const journalNameCn = row.journal_name_cn || row.j_name_cn || row.journal_name || '';

          return {
            id: row.id,
            title: row.title,
            titleCn: row.title_cn || null,
            abstract: row.abstract || '',
            abstractCn: row.abstract_cn || null,
            paperType: row.paper_type || 'journal_article',
            edition: row.edition || 'print',
            category: row.category || 'article',
            categoryCn: row.category_cn || '学术论文',
            journalId: row.journal_id,
            journalName: row.journal_name || '综合法学期刊',
            journalNameCn,
            journalAbbr: row.journal_abbr || '',
            journalTier: row.journal_tier || 'SSCI Q1',
            journalColor: row.journal_color || 'from-blue-900 to-indigo-950',
            volume: row.volume || '',
            issue: row.issue || '',
            volumeIssue: row.volume_issue || (row.volume && row.issue ? `${row.volume}, ${row.issue}` : row.volume || row.issue || ''),
            publishedAt: row.published_at || '',
            url: row.url || '',
            canonicalUrl: row.canonical_url || row.url || '',
            pdfUrl: row.pdf_url || null,
            doi: row.doi || null,
            doiUrl: row.doi ? (row.doi.startsWith('http') ? row.doi : `https://doi.org/${row.doi}`) : null,
            recommendedCitation: row.recommended_citation || null,
            tags,
            tagsCn,
            readingTime: row.reading_time || 15,
            featured: Boolean(row.featured),
            citationsCount: row.citations_count || 0,
            authors: parsedAuthorsJson.map((a: any) => typeof a === 'string' ? a : (a?.name || a?.name_cn || '法学学者')),
            authorsDetail: parsedAuthorsJson,
            isBookmarked: bookmarkedPaperIds.has(row.id),
          };
        });

        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const pagination = {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        };

        const extraHeaders: Record<string, string> = {};
        if (!currentUserId && !bookmarkedOnly) {
          extraHeaders['Cache-Control'] = 'public, max-age=30, s-maxage=300, stale-while-revalidate=600';
        } else {
          extraHeaders['Cache-Control'] = 'private, no-cache, no-store, must-revalidate';
          extraHeaders['Vary'] = 'Authorization, Cookie';
        }

        return jsonResponse({
          success: true,
          data: papers,
          pagination,
          total,
          filterTag: tag || null,
        }, 200, extraHeaders);
      }

      // -------------------------------------------------------------
      // -------------------------------------------------------------
      // 6. GET /api/authors - 获取学者画像库 (支持检索、标签与服务端分页)
      // -------------------------------------------------------------
      if (pathname === '/api/authors' && request.method === 'GET') {
        const authUser = await getAuthUser(request, env);
        const currentUserId = authUser?.id || searchParams.get('user_id');
        const q = (searchParams.get('q') || searchParams.get('search') || '').trim();
        const tag = (searchParams.get('tag') || searchParams.get('tags') || '').trim();
        const bookmarkedOnly = searchParams.get('bookmarked') === 'true' || searchParams.get('saved') === 'true';
        const { page, pageSize } = parsePaginationParams(searchParams, 15);
        const offset = (page - 1) * pageSize;

        const whereClauses: string[] = [`(a.status = 'active' OR a.status IS NULL)`];
        const params: any[] = [];

        if (bookmarkedOnly) {
          if (currentUserId) {
            whereClauses.push(`a.id IN (SELECT entity_id FROM user_bookmarks WHERE user_id = ? AND entity_type = 'author')`);
            params.push(currentUserId);
          } else {
            whereClauses.push('1 = 0');
          }
        }

        if (tag && tag !== '全部' && tag !== '全部领域') {
          whereClauses.push(`a.tags_cn LIKE ?`);
          params.push(`%${tag}%`);
        }

        if (q) {
          const kw = `%${q.toLowerCase()}%`;
          whereClauses.push(`(
            LOWER(a.name) LIKE ? OR 
            LOWER(COALESCE(a.name_cn, '')) LIKE ? OR 
            LOWER(COALESCE(a.tags_cn, '')) LIKE ? OR 
            LOWER(COALESCE(i.name, '')) LIKE ? OR 
            LOWER(COALESCE(a.orcid, '')) LIKE ? OR 
            LOWER(COALESCE(a.ssrn_id, '')) LIKE ?
          )`);
          params.push(kw, kw, kw, kw, kw, kw);
        }

        const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
        const countQuery = `
          SELECT count(*) as total 
          FROM authors a
          LEFT JOIN institutions i ON a.current_institution_id = i.id
          ${whereSql}
        `;
        const dataQuery = `
          SELECT 
            a.id,
            a.name,
            a.name_cn,
            a.openalex_author_id,
            a.orcid,
            a.ssrn_id,
            a.profile_url,
            a.current_institution_id AS institution_id,
            a.tags_cn,
            i.name AS institution_name,
            i.domain AS institution_domain,
            i.country AS institution_country,
            i.type AS institution_type
          FROM authors a
          LEFT JOIN institutions i ON a.current_institution_id = i.id
          ${whereSql}
          ORDER BY a.name ASC
          LIMIT ? OFFSET ?
        `;

        const [countRes, dataRes] = await env.DB.batch<any>([
          env.DB.prepare(countQuery).bind(...params),
          env.DB.prepare(dataQuery).bind(...params, pageSize, offset),
        ]);

        const total = (countRes?.results?.[0] as any)?.total || 0;
        const results = (dataRes?.results as (AuthorRow & { institution_type?: string | null })[]) || [];

        // 仅对当前页的 15 位学者针对当前用户查询收藏状态
        let bookmarkedAuthorIds = new Set<string>();
        if (currentUserId && results.length > 0) {
          const placeholders = results.map(() => '?').join(',');
          const bookmarksQuery = `
            SELECT entity_id FROM user_bookmarks 
            WHERE user_id = ? AND entity_type = 'author' AND entity_id IN (${placeholders})
          `;
          const { results: bookmarkResults } = await env.DB.prepare(bookmarksQuery)
            .bind(currentUserId, ...results.map((a) => a.id))
            .all<{ entity_id: string }>();
          bookmarkedAuthorIds = new Set((bookmarkResults || []).map((b) => b.entity_id));
        }

        const authors = results.map((row) => {
          const tagsCn = parseJsonField<string[]>(row.tags_cn, []);
          return {
            id: row.id,
            name: row.name,
            nameCn: row.name_cn || null,
            openalexAuthorId: row.openalex_author_id || null,
            orcid: row.orcid || null,
            orcidUrl: row.orcid ? (row.orcid.startsWith('http') ? row.orcid : `https://orcid.org/${row.orcid}`) : null,
            ssrnId: row.ssrn_id,
            ssrnUrl: row.ssrn_id ? `https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=${row.ssrn_id.replace('ssrn-', '')}` : null,
            profileUrl: row.profile_url || null,
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
            tags: tagsCn,
            tagsCn: tagsCn,
            papersCount: 0,
            papers: [],
            isBookmarked: bookmarkedAuthorIds.has(row.id),
          };
        });

        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const pagination = {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        };

        const extraHeaders: Record<string, string> = {};
        if (!currentUserId && !bookmarkedOnly) {
          extraHeaders['Cache-Control'] = 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800';
        } else {
          extraHeaders['Cache-Control'] = 'private, no-cache, no-store, must-revalidate';
          extraHeaders['Vary'] = 'Authorization, Cookie';
        }

        return jsonResponse({
          success: true,
          data: authors,
          pagination,
          total,
        }, 200, extraHeaders);
      }

      // -------------------------------------------------------------
      // 7. GET /api/events - 获取学术活动与特刊征稿 (支持分类、DDL 倒计时与置顶)
      // -------------------------------------------------------------
      if (pathname === '/api/events' && request.method === 'GET') {
        const categoryFilter = searchParams.get('category') || searchParams.get('event_category');
        const query = `
          SELECT 
            e.id,
            e.feed_guid,
            e.title,
            e.title_cn,
            e.event_category,
            e.event_type,
            e.deadline,
            e.submission_deadline,
            e.deadline_type,
            e.deadline_display,
            e.timezone,
            e.is_extended,
            e.original_deadline,
            e.notification_date,
            e.event_start_date,
            e.event_end_date,
            e.event_date,
            e.host_id,
            e.host_name,
            e.journal_id,
            e.location,
            e.academic_year,
            e.hiring_rank,
            e.subject_areas,
            e.contact_info,
            e.tags_cn,
            e.description,
            e.description_cn,
            e.official_url,
            e.submission_url,
            e.fee_info,
            e.is_pinned,
            i.name AS inst_host_name,
            i.country AS host_country,
            i.domain AS host_domain
          FROM events e
          LEFT JOIN institutions i ON e.host_id = i.id
          WHERE (e.is_deleted = 0 OR e.is_deleted IS NULL)
          ORDER BY e.is_pinned DESC, e.deadline ASC
        `;
        const { results } = await env.DB.prepare(query).all<EventRow & {
          inst_host_name?: string | null;
        }>();

        let formatted = (results || []).map((row) => {
          const deadlineDate = row.submission_deadline || row.deadline;
          const now = new Date();
          const target = deadlineDate ? new Date(`${deadlineDate.split(' ')[0]}T23:59:59`) : null;
          const diffMs = target ? target.getTime() - now.getTime() : 0;
          const diffDays = target ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 999;
          const isUrgent = diffDays >= 0 && diffDays <= 7;
          const isExpired = diffDays < 0;

          return {
            id: row.id,
            feedGuid: row.feed_guid || null,
            title: row.title,
            titleCn: row.title_cn || null,
            eventCategory: row.event_category || 'call_for_papers',
            eventType: row.event_type,
            deadline: row.deadline,
            submissionDeadline: row.submission_deadline || row.deadline,
            deadlineType: row.deadline_type || 'fixed',
            deadlineDisplay: row.deadline_display || null,
            timezone: row.timezone || 'UTC',
            isExtended: Boolean(row.is_extended),
            originalDeadline: row.original_deadline || null,
            notificationDate: row.notification_date || null,
            eventStartDate: row.event_start_date || null,
            eventEndDate: row.event_end_date || null,
            eventDate: row.event_date || null,
            hostId: row.host_id,
            hostName: row.host_name || row.inst_host_name || '国际法学院联合会',
            hostCountry: row.host_country || '全球',
            hostDomain: row.host_domain || '',
            journalId: row.journal_id || null,
            location: row.location || null,
            academicYear: row.academic_year || null,
            hiringRank: row.hiring_rank || null,
            subjectAreas: row.subject_areas || null,
            contactInfo: row.contact_info || null,
            tagsCn: parseJsonField<string[]>(row.tags_cn, []),
            description: row.description || null,
            descriptionCn: row.description_cn || null,
            officialUrl: row.official_url || null,
            submissionUrl: row.submission_url || null,
            feeInfo: row.fee_info || null,
            isPinned: Boolean(row.is_pinned),
            daysRemaining: diffDays,
            isUrgent,
            isExpired,
            statusText: isExpired ? '已截止' : diffDays === 0 ? '今日截止' : `剩余 ${diffDays} 天`,
          };
        });

        if (categoryFilter && categoryFilter !== 'all' && categoryFilter !== '全部') {
          formatted = formatted.filter((e) => e.eventCategory === categoryFilter);
        }

        return jsonResponse({
          success: true,
          data: formatted,
          total: formatted.length,
        }, 200, {
          'Cache-Control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=3600',
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

        const rawType = (body.entity_type || body.entityType || '').trim().toLowerCase();
        const entityType = rawType === 'article' ? 'paper' : rawType;
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
      // 9. GET /api/bookmarks - 获取当前登录用户的全部收藏 (利用复合覆盖索引高效排序与分页)
      // -------------------------------------------------------------
      if (pathname === '/api/bookmarks' && request.method === 'GET') {
        const authUser = await getAuthUser(request, env);
        const userId = authUser?.id || searchParams.get('user_id');

        if (!userId) {
          return jsonResponse({ success: true, data: [], total: 0 });
        }

        const rawType = searchParams.get('entity_type') || searchParams.get('type');
        const entityType = rawType === 'article' ? 'paper' : (rawType || '').trim().toLowerCase();
        const pageParam = searchParams.get('page');

        let query = `SELECT * FROM user_bookmarks WHERE user_id = ?`;
        const params: any[] = [userId];

        if (entityType && entityType !== 'all') {
          query += ` AND entity_type = ?`;
          params.push(entityType);
        }

        // 依靠 idx_d1_ub_user_type_created 与 idx_d1_ub_user_created 索引实现零内存排序
        query += ` ORDER BY created_at DESC`;

        const { results } = await env.DB.prepare(query).bind(...params).all<BookmarkRow>();
        const allItems = results || [];

        if (pageParam) {
          const { page, pageSize } = parsePaginationParams(searchParams, 15);
          const paginated = paginateArray(allItems, page, pageSize);
          return jsonResponse({
            success: true,
            data: paginated.data,
            pagination: paginated.pagination,
            total: paginated.total,
          });
        }

        return jsonResponse({
          success: true,
          data: allItems,
          total: allItems.length,
        });
      }

      // -------------------------------------------------------------
      // 10. GET /api/journals - 获取期刊列表 (支持分页、法域筛选、检索与置顶)
      // -------------------------------------------------------------
      if (pathname === '/api/journals' && request.method === 'GET') {
        const authUser = await getAuthUser(request, env);
        const userId = authUser?.id || searchParams.get('user_id');
        const jurisdiction = searchParams.get('jurisdiction');
        const search = (searchParams.get('search') || searchParams.get('q') || '').trim().toLowerCase();
        const tag = searchParams.get('tag');
        const { page, pageSize } = parsePaginationParams(searchParams, 12);

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
          if (bmResults && bmResults.length > 0) {
            bookmarkedJournalIds = new Set(bmResults.map((b) => b.entity_id));
          }
        }

        let formatted = (results || []).map((row: JournalRow) => {
          // 登录用户以自身收藏记录为准（全部取消置顶即为 0 项置顶）；未登录访客以系统初始 is_pinned 为准
          const isPinned = userId
            ? bookmarkedJournalIds.has(row.id)
            : Boolean(row.is_pinned);

          return {
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
            isPinned,
            coverColor: row.cover_color || 'from-blue-900 to-indigo-950',
            description: row.description || '',
            officialUrl: row.official_url || '',
            recentArticlesCount: row.recent_articles_count || 0,
          };
        });

        // 法域筛选
        if (jurisdiction && jurisdiction !== 'All' && jurisdiction !== '全部') {
          formatted = formatted.filter((j) => j.jurisdiction === jurisdiction);
        }

        // 领域标签筛选
        if (tag && tag !== '全部领域' && tag !== '全部') {
          formatted = formatted.filter((j) => j.tags.includes(tag) || j.category.includes(tag));
        }

        // 关键词检索
        if (search) {
          formatted = formatted.filter(
            (j) =>
              j.nameCn.toLowerCase().includes(search) ||
              j.nameOriginal.toLowerCase().includes(search) ||
              j.abbreviation.toLowerCase().includes(search) ||
              j.institution.toLowerCase().includes(search) ||
              j.description.toLowerCase().includes(search) ||
              j.category.toLowerCase().includes(search)
          );
        }

        const pinnedOnly = searchParams.get('pinned') === 'true' || searchParams.get('bookmarked') === 'true';
        if (pinnedOnly) {
          formatted = formatted.filter((j) => j.isPinned);
        }

        // 置顶排序优先，随后按中文名称排序
        formatted.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return a.nameCn.localeCompare(b.nameCn, 'zh-CN');
        });

        const paginated = paginateArray(formatted, page, pageSize);

        const extraHeaders: Record<string, string> = {};
        if (!userId && !pinnedOnly) {
          extraHeaders['Cache-Control'] = 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400';
        } else {
          extraHeaders['Cache-Control'] = 'private, no-cache, no-store, must-revalidate';
          extraHeaders['Vary'] = 'Authorization, Cookie';
        }

        return jsonResponse({
          success: true,
          data: paginated.data,
          pagination: paginated.pagination,
          total: paginated.total,
        }, 200, extraHeaders);
      }

      // -------------------------------------------------------------
      // 10.5 GET /api/summary - 轻量级全局聚合状态 (用于顶栏红点与即时概览)
      // -------------------------------------------------------------
      if (pathname === '/api/summary' && request.method === 'GET') {
        const authUser = await getAuthUser(request, env);
        const userId = authUser?.id || searchParams.get('user_id');

        // 单次 D1 batch 往返聚合所有统计指标
        const stmtSaved = userId
          ? env.DB.prepare(`SELECT count(*) as cnt FROM user_bookmarks WHERE user_id = ?`).bind(userId)
          : env.DB.prepare(`SELECT 0 as cnt`);

        const stmtUrgent = env.DB.prepare(`
          SELECT count(*) as cnt FROM events 
          WHERE (is_deleted = 0 OR is_deleted IS NULL) 
            AND (submission_deadline IS NOT NULL OR deadline IS NOT NULL)
            AND date(COALESCE(submission_deadline, deadline)) >= date('now') 
            AND date(COALESCE(submission_deadline, deadline)) <= date('now', '+7 days')
        `);

        const stmtPinnedJ = userId
          ? env.DB.prepare(`SELECT count(*) as cnt FROM user_bookmarks WHERE user_id = ? AND entity_type = 'journal'`).bind(userId)
          : env.DB.prepare(`SELECT count(*) as cnt FROM journals WHERE is_pinned = 1`);

        const stmtJournals = env.DB.prepare(`SELECT count(*) as cnt FROM journals WHERE (status = 'active' OR status IS NULL)`);
        const stmtWishlist = env.DB.prepare(`SELECT count(*) as cnt FROM wishlists`);
        const stmtAuthors = env.DB.prepare(`SELECT count(*) as cnt FROM authors WHERE (status = 'active' OR status IS NULL)`);
        const stmtPapers = env.DB.prepare(`SELECT count(*) as cnt FROM papers`);

        const [savedRes, urgentRes, pinnedJRes, journalsRes, wishlistRes, authorsRes, papersRes] = await env.DB.batch<any>([
          stmtSaved,
          stmtUrgent,
          stmtPinnedJ,
          stmtJournals,
          stmtWishlist,
          stmtAuthors,
          stmtPapers,
        ]);

        const savedCount = (savedRes?.results?.[0] as any)?.cnt || 0;
        const urgentEventCount = (urgentRes?.results?.[0] as any)?.cnt || 0;
        const pinnedJournalCount = (pinnedJRes?.results?.[0] as any)?.cnt || 0;
        const journalsCount = (journalsRes?.results?.[0] as any)?.cnt || 0;
        const wishlistCount = (wishlistRes?.results?.[0] as any)?.cnt || 0;
        const authorsCount = (authorsRes?.results?.[0] as any)?.cnt || 0;
        const papersCount = (papersRes?.results?.[0] as any)?.cnt || 0;

        return jsonResponse({
          success: true,
          data: {
            savedCount,
            urgentEventCount,
            pinnedJournalCount,
            wishlistCount,
            authorsCount,
            papersCount,
            journalsCount,
            lastUpdated: new Date().toISOString(),
          },
        });
      }

      // -------------------------------------------------------------
      // 11. GET & POST /api/wishlist - 心愿单 (向所有用户公开展示，支持用户投票状态查询)
      // -------------------------------------------------------------
      if ((pathname === '/api/wishlist' || pathname === '/api/wishlists') && request.method === 'GET') {
        const authUser = await getAuthUser(request, env);
        const userId = authUser?.id || searchParams.get('user_id');

        let userVotedIds = new Set<string>();
        if (userId) {
          const { results: voteResults } = await env.DB.prepare(
            `SELECT wishlist_id FROM wishlist_votes WHERE user_id = ?`
          ).bind(userId).all<{ wishlist_id: string }>();
          userVotedIds = new Set((voteResults || []).map((v) => v.wishlist_id));
        }

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
          userVoted: userVotedIds.has(row.id),
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

        // 初始写入 wishlists 表 (votes 默认为 0)
        await env.DB.prepare(`
          INSERT INTO wishlists (id, user_id, entity_type, entity_name, status, submitter, notes, votes)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        `).bind(id, userId, entityType, entityName, status, submitter, notes).run();

        // 自动为提议学者插入 wishlist_votes 初始赞成票流水
        // D1 触发器 trg_d1_wv_ai 将自动原子将 wishlists.votes 递增为 1
        const initialVoteId = `wv-${crypto.randomUUID()}`;
        await env.DB.prepare(`
          INSERT INTO wishlist_votes (id, user_id, wishlist_id) VALUES (?, ?, ?)
        `).bind(initialVoteId, userId, id).run();

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
          userVoted: true,
          submittedAt: new Date().toISOString().split('T')[0],
        };

        return jsonResponse({
          success: true,
          message: '心愿单已成功写入 Cloudflare D1 数据库',
          data: createdItem,
        }, 201);
      }

      if (pathname === '/api/wishlist/vote' && request.method === 'POST') {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return errorResponse('Invalid JSON payload in request body', 400);
        }

        const { id } = body;
        if (!id) return errorResponse('Wishlist ID required', 400);

        const authUser = await getAuthUser(request, env);
        const userId = authUser?.id || body.user_id || 'usr-demo';

        // 检查流水表 wishlist_votes 中是否存在该用户的投票记录
        const existingVote = await env.DB.prepare(
          `SELECT id FROM wishlist_votes WHERE user_id = ? AND wishlist_id = ?`
        ).bind(userId, id).first<{ id: string }>();

        let userVoted = false;
        if (existingVote) {
          // 已投票 -> 撤销点赞 (由 D1 触发器 trg_d1_wv_ad 自动原子执行 votes = MAX(0, votes - 1))
          await env.DB.prepare(
            `DELETE FROM wishlist_votes WHERE user_id = ? AND wishlist_id = ?`
          ).bind(userId, id).run();
          userVoted = false;
        } else {
          // 未投票 -> 插入点赞流水 (由 D1 触发器 trg_d1_wv_ai 自动原子执行 votes = votes + 1)
          const voteId = `wv-${crypto.randomUUID()}`;
          await env.DB.prepare(
            `INSERT INTO wishlist_votes (id, user_id, wishlist_id) VALUES (?, ?, ?)`
          ).bind(voteId, userId, id).run();
          userVoted = true;
        }

        // 读取由 D1 触发器原子维护后的最新 votes
        const updatedWishlist = await env.DB.prepare(
          `SELECT votes FROM wishlists WHERE id = ?`
        ).bind(id).first<{ votes: number }>();

        return jsonResponse({
          success: true,
          message: userVoted ? '点赞投票已记录并由 D1 触发器原子累加' : '已取消点赞并由 D1 触发器原子扣减',
          userVoted,
          votes: updatedWishlist?.votes ?? 0,
        });
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
      // 13. GET /api/articles - 兼容文献流接口 (统一查询 papers 主表与 journals)
      // -------------------------------------------------------------
      if (pathname === '/api/articles' && request.method === 'GET') {
        const tag = searchParams.get('tag');
        const jurisdiction = searchParams.get('jurisdiction');
        const authUser = await getAuthUser(request, env);
        const userId = authUser?.id || searchParams.get('user_id');
        const { page, pageSize } = parsePaginationParams(searchParams, 15);
        const offset = (page - 1) * pageSize;

        const whereClauses: string[] = ['1=1'];
        const params: any[] = [];
        if (tag && tag !== '全部领域' && tag !== '全部') {
          whereClauses.push('(p.tags LIKE ? OR p.tags_cn LIKE ?)');
          params.push(`%${tag}%`, `%${tag}%`);
        }

        const countQuery = `SELECT count(*) as total FROM papers p LEFT JOIN journals j ON p.journal_id = j.id WHERE ${whereClauses.join(' AND ')}`;
        const dataQuery = `
          SELECT 
            p.id,
            p.journal_id,
            p.paper_type,
            p.category,
            p.category_cn,
            p.title,
            p.title_cn,
            p.abstract,
            p.abstract_cn,
            p.volume,
            p.issue,
            p.volume_issue,
            p.published_at,
            p.canonical_url AS url,
            p.pdf_url,
            p.doi,
            p.authors_json,
            p.journal_name_cn,
            p.recommended_citation,
            p.first_page,
            p.last_page,
            p.tags,
            p.tags_cn,
            p.reading_time,
            p.featured,
            p.citations_count,
            j.name AS journal_name,
            j.name_cn AS j_name_cn,
            j.abbreviation AS journal_abbr,
            'All' AS jurisdiction
          FROM papers p
          LEFT JOIN journals j ON p.journal_id = j.id
          WHERE ${whereClauses.join(' AND ')}
          ORDER BY p.published_at DESC
          LIMIT ? OFFSET ?
        `;

        const [countRes, dataRes] = await env.DB.batch<any>([
          env.DB.prepare(countQuery).bind(...params),
          env.DB.prepare(dataQuery).bind(...params, pageSize, offset),
        ]);

        const total = (countRes?.results?.[0] as any)?.total || 0;
        const results = (dataRes?.results as (PaperRow & { journal_name?: string; j_name_cn?: string; journal_abbr?: string; jurisdiction?: string })[]) || [];

        // 联合查询收藏 (旧 article 收藏记录已全部归并为 paper 类型)
        let savedIds = new Set<string>();
        if (userId && results.length > 0) {
          const placeholders = results.map(() => '?').join(',');
          const bmQuery = `SELECT entity_id FROM user_bookmarks WHERE user_id = ? AND entity_type = 'paper' AND entity_id IN (${placeholders})`;
          const { results: bmResults } = await env.DB.prepare(bmQuery).bind(userId, ...results.map(r => r.id)).all<{ entity_id: string }>();
          savedIds = new Set((bmResults || []).map((b) => b.entity_id));
        }

        const filtered = results.map((row) => {
          const parsedAuthorsJson = parseJsonField<any[]>(row.authors_json, []);
          const authorNames: string[] = parsedAuthorsJson.length > 0
            ? parsedAuthorsJson.map((a: any) => (typeof a === 'string' ? a : (a?.name || a?.name_cn || '法学学者')))
            : ['法学学者'];
          const firstAffiliation = parsedAuthorsJson.find((a: any) => a && typeof a === 'object' && a.affiliation)?.affiliation;

          return {
            id: row.id,
            titleCn: row.title_cn || row.title,
            titleOriginal: row.title,
            authors: authorNames,
            authorAffiliation: firstAffiliation || row.journal_name_cn || row.journal_name || '',
            journalName: row.journal_name || '权威法学期刊',
            journalAbbr: row.journal_abbr || '',
            volumeIssue: row.volume_issue || (row.volume ? `Vol. ${row.volume}` : ''),
            publishDate: row.published_at || '',
            tags: parseJsonField<string[]>(row.tags_cn || row.tags, []),
            abstractCn: row.abstract_cn || row.abstract || '',
            abstractOriginal: row.abstract || '',
            doi: row.doi || '',
            pdfUrl: row.pdf_url || undefined,
            citationsCount: row.citations_count || 0,
            saved: Boolean(savedIds.has(row.id)),
            readingTime: row.reading_time ? `${row.reading_time} 分钟` : '15 分钟',
            jurisdiction: (row.jurisdiction || 'All') as any,
            featured: Boolean(row.featured),
          };
        });

        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const pagination = {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        };

        const extraHeaders: Record<string, string> = {};
        if (!userId) {
          extraHeaders['Cache-Control'] = 'public, max-age=30, s-maxage=300, stale-while-revalidate=600';
        } else {
          extraHeaders['Cache-Control'] = 'private, no-cache, no-store, must-revalidate';
          extraHeaders['Vary'] = 'Authorization, Cookie';
        }

        return jsonResponse({
          success: true,
          data: filtered,
          pagination,
          total,
        }, 200, extraHeaders);
      }

      // 404 Not Found
      return jsonResponse({ error: 'Endpoint Not Found', pathname, method: request.method }, 404);
    } catch (err: any) {
      console.error('Worker error:', err);
      return errorResponse(err?.message || 'Internal Server Error', 500);
    }
  },
};
