PRAGMA foreign_keys = ON;

-- 1. Users Table (用户与鉴权表)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' -- 'admin' | 'user' | 'scholar'
);

-- 2. Institutions Table (机构/高校/研究院所表)
CREATE TABLE IF NOT EXISTS institutions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    country TEXT,
    type TEXT -- 'University' | 'Research Institute' | 'Court' | 'Publisher'
);

-- 3. Journals Table (期刊核心表)
CREATE TABLE IF NOT EXISTS journals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    issn TEXT,
    tier TEXT,
    tags TEXT, -- JSON Array: ["民法", "国际法", "人工智能法"]
    name_cn TEXT,
    abbreviation TEXT,
    institution TEXT,
    country TEXT,
    jurisdiction TEXT DEFAULT 'All',
    category TEXT,
    impact_rank TEXT,
    current_issue TEXT,
    frequency TEXT,
    is_pinned INTEGER DEFAULT 0,
    cover_color TEXT,
    description TEXT,
    official_url TEXT,
    recent_articles_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Authors Table (学者画像核心表)
CREATE TABLE IF NOT EXISTS authors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ssrn_id TEXT,
    institution_id TEXT,
    tags TEXT, -- JSON Array: ["人工智能法", "侵权责任"]
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL
);

-- 5. Papers Table (学术论文标准表)
CREATE TABLE IF NOT EXISTS papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    abstract TEXT,
    journal_id TEXT,
    published_at TEXT,
    url TEXT,
    tags TEXT, -- JSON Array
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE SET NULL
);

-- 6. Paper Authors Relation Table (论文-学者多对多复合主键关联表)
CREATE TABLE IF NOT EXISTS paper_authors (
    paper_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    PRIMARY KEY (paper_id, author_id),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

-- 7. Events Table (学术活动表)
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    deadline TEXT NOT NULL,
    host_id TEXT,
    event_type TEXT NOT NULL, -- '特刊征稿' | '国际学术研讨会' | '青年学者论坛' | '征文启事'
    FOREIGN KEY (host_id) REFERENCES institutions(id) ON DELETE SET NULL
);

-- 8. User Bookmarks Table (用户收藏/标星记录表)
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'paper' | 'author' | 'journal' | 'article' | 'event'
    entity_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, entity_type, entity_id)
);

-- 9. Wishlists Table (收录心愿单表 - 兼容保留)
CREATE TABLE IF NOT EXISTS wishlists (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'anonymous',
    entity_type TEXT NOT NULL, -- '期刊' | '学者' | '论文' | '数据库/平台'
    entity_name TEXT NOT NULL,
    status TEXT DEFAULT '待处理', -- '待处理' | '审核中' | '已收录' | '已安排'
    submitter TEXT,
    notes TEXT,
    votes INTEGER DEFAULT 1,
    response_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Articles Table (文献信息表 - 兼容保留)
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title_cn TEXT NOT NULL,
    title_original TEXT NOT NULL,
    authors TEXT, -- JSON Array
    author_affiliation TEXT,
    journal_name TEXT,
    journal_abbr TEXT,
    volume_issue TEXT,
    publish_date TEXT,
    tags TEXT, -- JSON Array
    abstract_cn TEXT,
    abstract_original TEXT,
    doi TEXT,
    pdf_url TEXT,
    citations_count INTEGER DEFAULT 0,
    saved INTEGER DEFAULT 0,
    reading_time TEXT,
    jurisdiction TEXT DEFAULT 'All',
    featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Academic Events Table (学术会议表 - 兼容保留)
CREATE TABLE IF NOT EXISTS academic_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    host TEXT NOT NULL,
    type TEXT NOT NULL,
    deadline TEXT NOT NULL,
    event_date TEXT,
    location TEXT,
    tags TEXT, -- JSON Array
    description TEXT,
    submission_url TEXT,
    fee_info TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Global Search FTS5 Virtual Table (全局检索虚拟表，配置 trigram 三元组分词)
CREATE VIRTUAL TABLE IF NOT EXISTS global_search USING fts5(
    entity_type UNINDEXED,
    entity_id UNINDEXED,
    title,
    content,
    tokenize = "trigram"
);

-- 13. FTS5 Automatic Triggers for Papers
CREATE TRIGGER IF NOT EXISTS trg_papers_ai AFTER INSERT ON papers
BEGIN
    INSERT INTO global_search (entity_type, entity_id, title, content)
    VALUES ('paper', NEW.id, NEW.title, COALESCE(NEW.abstract, '') || ' ' || COALESCE(NEW.tags, ''));
END;

CREATE TRIGGER IF NOT EXISTS trg_papers_au AFTER UPDATE ON papers
BEGIN
    DELETE FROM global_search WHERE entity_type = 'paper' AND entity_id = OLD.id;
    INSERT INTO global_search (entity_type, entity_id, title, content)
    VALUES ('paper', NEW.id, NEW.title, COALESCE(NEW.abstract, '') || ' ' || COALESCE(NEW.tags, ''));
END;

CREATE TRIGGER IF NOT EXISTS trg_papers_ad AFTER DELETE ON papers
BEGIN
    DELETE FROM global_search WHERE entity_type = 'paper' AND entity_id = OLD.id;
END;

-- 14. FTS5 Automatic Triggers for Authors
CREATE TRIGGER IF NOT EXISTS trg_authors_ai AFTER INSERT ON authors
BEGIN
    INSERT INTO global_search (entity_type, entity_id, title, content)
    VALUES ('author', NEW.id, NEW.name, COALESCE(NEW.ssrn_id, '') || ' ' || COALESCE(NEW.tags, ''));
END;

CREATE TRIGGER IF NOT EXISTS trg_authors_au AFTER UPDATE ON authors
BEGIN
    DELETE FROM global_search WHERE entity_type = 'author' AND entity_id = OLD.id;
    INSERT INTO global_search (entity_type, entity_id, title, content)
    VALUES ('author', NEW.id, NEW.name, COALESCE(NEW.ssrn_id, '') || ' ' || COALESCE(NEW.tags, ''));
END;

CREATE TRIGGER IF NOT EXISTS trg_authors_ad AFTER DELETE ON authors
BEGIN
    DELETE FROM global_search WHERE entity_type = 'author' AND entity_id = OLD.id;
END;
