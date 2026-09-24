-- ========================================================
-- Cloudflare D1 边缘加速数据库 (Edge Replica) Schema
-- 面向中文用户极速访问，支持单表直出免 JOIN，保护行读配额
-- 包含用户系统、心愿单、收藏夹、学术活动及全局三元组全文检索
-- ========================================================

-- 0. 清理废弃过渡兼容表 (若存在)
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS academic_events;

-- 1. 边缘机构表 (institutions)
CREATE TABLE IF NOT EXISTS institutions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_cn TEXT,
    domain TEXT,
    country TEXT DEFAULT 'US',
    type TEXT DEFAULT 'University',
    type_cn TEXT DEFAULT '高等院校'
);

-- 2. 边缘期刊表 (journals)
CREATE TABLE IF NOT EXISTS journals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    abbreviation TEXT,
    issn_print TEXT,
    issn_electronic TEXT,
    institution TEXT,
    country TEXT DEFAULT 'US',
    jurisdiction TEXT DEFAULT 'US',
    tier TEXT,
    category TEXT,
    tags_cn TEXT,
    impact_rank TEXT,
    frequency TEXT,
    is_pinned INTEGER NOT NULL DEFAULT 0,
    cover_color TEXT DEFAULT '#1e3a8a',
    official_url TEXT,
    resolved_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    source_type TEXT NOT NULL DEFAULT 'curated'
);

CREATE INDEX IF NOT EXISTS idx_d1_journals_pinned ON journals(is_pinned);
CREATE INDEX IF NOT EXISTS idx_d1_journals_status ON journals(status);
CREATE INDEX IF NOT EXISTS idx_d1_journals_source_type ON journals(source_type);

-- 3. 边缘学者表 (authors)
CREATE TABLE IF NOT EXISTS authors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_cn TEXT,
    openalex_author_id TEXT,
    orcid TEXT,
    ssrn_id TEXT,
    current_institution_id TEXT,
    tags_cn TEXT,
    profile_url TEXT,
    status TEXT NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_d1_authors_name ON authors(name);
CREATE INDEX IF NOT EXISTS idx_d1_authors_institution ON authors(current_institution_id);

-- 4. 边缘核心论文宽表 (papers) - 预聚合作者与期刊中文名，消除线上 5 表关联
CREATE TABLE IF NOT EXISTS papers (
    id TEXT PRIMARY KEY,
    journal_id TEXT,
    paper_type TEXT NOT NULL DEFAULT 'journal_article',
    edition TEXT NOT NULL DEFAULT 'print',
    category TEXT NOT NULL DEFAULT 'article',
    category_cn TEXT NOT NULL DEFAULT '学术论文',
    title TEXT NOT NULL,
    title_cn TEXT,
    abstract TEXT,
    abstract_cn TEXT,
    volume TEXT,
    issue TEXT,
    volume_issue TEXT,
    published_at TEXT,
    canonical_url TEXT NOT NULL,
    pdf_url TEXT,
    doi TEXT,
    
    -- 边缘单表直出冗余快照 (避免多表关联)
    authors_json TEXT,                                       -- 预序列化作者数组: [{"name":"..","name_cn":"..","affiliation":".."}]
    journal_name_cn TEXT,                                    -- 期刊中文名称
    
    -- Bluebook 推荐引用与页码 (CRITICAL-1: 与本地 Master Schema 对齐)
    recommended_citation TEXT,                               -- 官方或合成的标准 Bluebook 推荐引用
    first_page TEXT,                                         -- 起始页码
    last_page TEXT,                                          -- 终止页码

    -- 中文增值字段
    tags TEXT,                                               -- 原文英文标签 JSON
    tags_cn TEXT,                                            -- 中文学科标签 JSON
    reading_time INTEGER DEFAULT 5,
    featured INTEGER NOT NULL DEFAULT 0,
    citations_count INTEGER NOT NULL DEFAULT 0,
    
    updated_at TEXT NOT NULL
);

-- 核心查询索引 (优化分页信息流与期刊信息流)
CREATE INDEX IF NOT EXISTS idx_d1_papers_published ON papers(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_d1_papers_journal_feed ON papers(journal_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_d1_papers_featured ON papers(featured, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_d1_papers_edition ON papers(edition);
CREATE INDEX IF NOT EXISTS idx_d1_papers_category ON papers(category);
CREATE INDEX IF NOT EXISTS idx_d1_papers_j_v_i_e ON papers(journal_id, volume, issue, edition, category);

-- 5. 用户与鉴权表 (users)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'scholar')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. 用户收藏/标星记录表 (user_bookmarks)
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('paper', 'author', 'journal', 'article', 'event')),
    entity_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_d1_ub_user_created ON user_bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_d1_ub_user_type_created ON user_bookmarks(user_id, entity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_d1_ub_entity ON user_bookmarks(entity_type, entity_id);

-- 7. 收录心愿单表 (wishlists)
CREATE TABLE IF NOT EXISTS wishlists (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'anonymous',
    entity_type TEXT NOT NULL,                               -- '期刊' | '学者' | '论文' | '数据库/平台'
    entity_name TEXT NOT NULL,
    status TEXT DEFAULT '待处理',
    submitter TEXT,
    notes TEXT,
    votes INTEGER DEFAULT 1,
    response_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_d1_wishlists_status ON wishlists(status);

-- 7.1. 心愿单用户投票流水表 (wishlist_votes)
CREATE TABLE IF NOT EXISTS wishlist_votes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    wishlist_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    UNIQUE(user_id, wishlist_id)
);

CREATE INDEX IF NOT EXISTS idx_d1_wv_user ON wishlist_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_d1_wv_wishlist ON wishlist_votes(wishlist_id);

-- 触发器：D1 自动原子维护心愿单票数 (免前端多次往返与行读消耗)
CREATE TRIGGER IF NOT EXISTS trg_d1_wv_ai AFTER INSERT ON wishlist_votes
BEGIN
    UPDATE wishlists SET votes = votes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.wishlist_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_d1_wv_ad AFTER DELETE ON wishlist_votes
BEGIN
    UPDATE wishlists SET votes = MAX(0, votes - 1), updated_at = CURRENT_TIMESTAMP WHERE id = OLD.wishlist_id;
END;

-- 8. 学术活动与征文招聘表 (events) [v5 升级]
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    feed_guid TEXT,
    title TEXT NOT NULL,
    title_cn TEXT,
    event_category TEXT NOT NULL DEFAULT 'call_for_papers',   -- 'call_for_papers' | 'academic_job'
    event_type TEXT NOT NULL,                                -- '特刊征稿' | '国际学术研讨会' | '青年学者论坛' | '征文比赛' | '法学教职' | '博士后/研究员' | '访问学者'
    submission_deadline TEXT,                                -- 投稿/申请截止日期 (允许 NULL)
    deadline_type TEXT NOT NULL DEFAULT 'fixed',             -- 'fixed' | 'rolling' | 'tbd'
    deadline_display TEXT,
    deadline TEXT,                                           -- 兼容前端旧字段
    timezone TEXT NOT NULL DEFAULT 'America/New_York',       -- 官方公布时区
    is_extended INTEGER NOT NULL DEFAULT 0,                  -- 1=延期收稿, 0=正常
    original_deadline TEXT,                                  -- 延期前的原截止日
    notification_date TEXT,                                  -- 录用/初筛结果通知日
    event_start_date TEXT,                                   -- 活动开始日期 / 期望入职日期
    event_end_date TEXT,                                     -- 活动结束日期
    event_date TEXT,
    host_id TEXT,
    host_name TEXT,
    journal_id TEXT,                                         -- 关联 journals.id (特刊征稿直接打通核心法评)
    location TEXT,
    academic_year TEXT,                                      -- 招聘学年
    hiring_rank TEXT,                                        -- 招聘专有职级
    subject_areas TEXT,                                      -- 细分学科方向
    contact_info TEXT,
    tags_cn TEXT,
    description TEXT,
    description_cn TEXT,
    official_url TEXT,
    submission_url TEXT,
    source_channel TEXT,                                     -- 采集信源渠道
    sources_json TEXT,                                       -- 跨源归并链 JSON
    fee_info TEXT,
    is_pinned INTEGER NOT NULL DEFAULT 0,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',                   -- 'active' | 'expired' | 'archived'

    -- 审计时间戳 (CRITICAL-1: 与本地 Master Schema 对齐)
    created_at TEXT,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_d1_events_feed_guid ON events(feed_guid);
CREATE INDEX IF NOT EXISTS idx_d1_events_sub_deadline ON events(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_d1_events_deadline ON events(deadline);
CREATE INDEX IF NOT EXISTS idx_d1_events_category ON events(event_category, status, submission_deadline);
CREATE INDEX IF NOT EXISTS idx_d1_events_pinned ON events(is_pinned, submission_deadline);
CREATE INDEX IF NOT EXISTS idx_d1_events_journal ON events(journal_id);

-- 9. 全局检索虚拟表 (global_search FTS5, 配置 trigram 三元组分词)
CREATE VIRTUAL TABLE IF NOT EXISTS global_search USING fts5(
    entity_type UNINDEXED,
    entity_id UNINDEXED,
    title,
    content,
    tokenize = "trigram"
);

-- 10. 论文 FTS5 触发器
CREATE TRIGGER IF NOT EXISTS trg_d1_papers_ai AFTER INSERT ON papers
BEGIN
    INSERT INTO global_search (entity_type, entity_id, title, content)
    VALUES ('paper', NEW.id, NEW.title || ' ' || COALESCE(NEW.title_cn, ''), COALESCE(NEW.abstract, '') || ' ' || COALESCE(NEW.abstract_cn, '') || ' ' || COALESCE(NEW.tags, '') || ' ' || COALESCE(NEW.tags_cn, ''));
END;

CREATE TRIGGER IF NOT EXISTS trg_d1_papers_au AFTER UPDATE ON papers
BEGIN
    DELETE FROM global_search WHERE entity_type = 'paper' AND entity_id = OLD.id;
    INSERT INTO global_search (entity_type, entity_id, title, content)
    VALUES ('paper', NEW.id, NEW.title || ' ' || COALESCE(NEW.title_cn, ''), COALESCE(NEW.abstract, '') || ' ' || COALESCE(NEW.abstract_cn, '') || ' ' || COALESCE(NEW.tags, '') || ' ' || COALESCE(NEW.tags_cn, ''));
END;

CREATE TRIGGER IF NOT EXISTS trg_d1_papers_ad AFTER DELETE ON papers
BEGIN
    DELETE FROM global_search WHERE entity_type = 'paper' AND entity_id = OLD.id;
END;

-- 11. 学者 FTS5 触发器
CREATE TRIGGER IF NOT EXISTS trg_d1_authors_ai AFTER INSERT ON authors
BEGIN
    INSERT INTO global_search (entity_type, entity_id, title, content)
    VALUES ('author', NEW.id, NEW.name || ' ' || COALESCE(NEW.name_cn, ''), COALESCE(NEW.openalex_author_id, '') || ' ' || COALESCE(NEW.orcid, '') || ' ' || COALESCE(NEW.tags_cn, ''));
END;

CREATE TRIGGER IF NOT EXISTS trg_d1_authors_au AFTER UPDATE ON authors
BEGIN
    DELETE FROM global_search WHERE entity_type = 'author' AND entity_id = OLD.id;
    INSERT INTO global_search (entity_type, entity_id, title, content)
    VALUES ('author', NEW.id, NEW.name || ' ' || COALESCE(NEW.name_cn, ''), COALESCE(NEW.openalex_author_id, '') || ' ' || COALESCE(NEW.orcid, '') || ' ' || COALESCE(NEW.tags_cn, ''));
END;

CREATE TRIGGER IF NOT EXISTS trg_d1_authors_ad AFTER DELETE ON authors
BEGIN
    DELETE FROM global_search WHERE entity_type = 'author' AND entity_id = OLD.id;
END;

-- 12. 学术活动与征文招聘 FTS5 触发器
CREATE TRIGGER IF NOT EXISTS trg_d1_events_ai AFTER INSERT ON events
BEGIN
    INSERT INTO global_search (entity_type, entity_id, title, content)
    SELECT 'event', NEW.id, NEW.title || ' ' || COALESCE(NEW.title_cn, ''), 
           COALESCE(NEW.host_name, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.description_cn, '') || ' ' || COALESCE(NEW.tags_cn, '') || ' ' || COALESCE(NEW.subject_areas, '')
    WHERE NEW.is_deleted = 0;
END;

CREATE TRIGGER IF NOT EXISTS trg_d1_events_au AFTER UPDATE ON events
BEGIN
    DELETE FROM global_search WHERE entity_type = 'event' AND entity_id = OLD.id;
    INSERT INTO global_search (entity_type, entity_id, title, content)
    SELECT 'event', NEW.id, NEW.title || ' ' || COALESCE(NEW.title_cn, ''), 
           COALESCE(NEW.host_name, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.description_cn, '') || ' ' || COALESCE(NEW.tags_cn, '') || ' ' || COALESCE(NEW.subject_areas, '')
    WHERE NEW.is_deleted = 0;
END;

CREATE TRIGGER IF NOT EXISTS trg_d1_events_ad AFTER DELETE ON events
BEGIN
    DELETE FROM global_search WHERE entity_type = 'event' AND entity_id = OLD.id;
END;

-- 13. 学术征稿与招聘信源配置表 (event_sources) [Phase 3]
CREATE TABLE IF NOT EXISTS event_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'rss',
    feed_url TEXT NOT NULL UNIQUE,
    site_url TEXT,
    event_category TEXT NOT NULL DEFAULT 'call_for_papers',
    subject_tags TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    health_status TEXT NOT NULL DEFAULT 'healthy',
    last_checked_at TEXT,
    last_item_at TEXT,
    items_count INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    discovery_metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE INDEX IF NOT EXISTS idx_d1_event_sources_status ON event_sources(status, health_status);
CREATE INDEX IF NOT EXISTS idx_d1_event_sources_category ON event_sources(event_category, status);

