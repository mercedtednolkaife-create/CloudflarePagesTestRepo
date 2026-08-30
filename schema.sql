PRAGMA foreign_keys = ON;

-- 1. Journals Table (期刊核心表)
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

-- 2. Wishlists Table (收录心愿单表)
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

-- 3. Articles Table (文献表，用于支持全局文献流展示与检索)
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title_cn TEXT NOT NULL,
    title_original TEXT NOT NULL,
    authors TEXT, -- JSON Array: ["Prof. Jonathan Zittrain", "Dr. Elena Rostova"]
    author_affiliation TEXT,
    journal_name TEXT,
    journal_abbr TEXT,
    volume_issue TEXT,
    publish_date TEXT,
    tags TEXT, -- JSON Array: ["人工智能法", "侵权责任"]
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

-- 4. Academic Events Table (学术会议与特刊征稿表)
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

-- 5. Global Search FTS5 Virtual Table (全局检索虚拟表，配置 trigram 三元组分词)
CREATE VIRTUAL TABLE IF NOT EXISTS global_search USING fts5(
    entity_type UNINDEXED,
    entity_id UNINDEXED,
    title,
    content,
    tokenize = "trigram"
);
