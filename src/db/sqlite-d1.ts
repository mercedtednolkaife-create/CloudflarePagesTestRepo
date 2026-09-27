import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { D1Database, D1PreparedStatement } from '../worker';

function sanitizeParam(v: any): any {
  if (v === undefined || v === null) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  return v;
}

export function createSqliteD1(dbPath = ':memory:'): D1Database {
  const db = new DatabaseSync(dbPath);

  // 1. Initialize schema from schema.sql
  const schemaPath = path.resolve(process.cwd(), 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  // 2. Check if users are seeded
  const userCountRow = db.prepare('SELECT count(*) as count FROM users').get() as any;
  if (!userCountRow || userCountRow.count === 0) {
    seedInitialData(db);
  }

  const createStatement = (sql: string, values: any[] = []): D1PreparedStatement => {
    return {
      bind(...newVals: any[]) {
        return createStatement(sql, newVals.map(sanitizeParam));
      },
      async all<T = Record<string, any>>() {
        const stmt = db.prepare(sql);
        const isMutation = /^\s*(INSERT|UPDATE|DELETE|REPLACE|CREATE|DROP|ALTER)\b/i.test(sql);
        if (isMutation) {
          const meta = stmt.run(...values);
          return { results: [] as T[], success: true, meta };
        } else {
          const results = stmt.all(...values) as T[];
          return { results, success: true };
        }
      },
      async run() {
        const stmt = db.prepare(sql);
        const meta = stmt.run(...values);
        return { success: true, meta };
      },
      async first<T = Record<string, any>>(colName?: string) {
        const stmt = db.prepare(sql);
        const row = stmt.get(...values) as any;
        if (!row) return null;
        if (colName) return (row[colName] !== undefined ? row[colName] : null) as T;
        return row as T;
      },
    };
  };

  return {
    prepare(query: string): D1PreparedStatement {
      return createStatement(query);
    },
    async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<any[]> {
      const results = [];
      for (const stmt of statements) {
        results.push(await stmt.all());
      }
      return results;
    },
    async exec(query: string): Promise<any> {
      return db.exec(query);
    },
  };
}

function seedInitialData(db: DatabaseSync) {
  // Seed Users
  // admin / admin123
  // scholar / user123
  // demo_user / user123
  const insertUser = db.prepare(
    'INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)'
  );
  insertUser.run('usr-admin-1', 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin');
  insertUser.run('usr-scholar-1', 'scholar', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', 'scholar');
  insertUser.run('usr-demo-1', 'demo_user', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', 'user');

  // Seed Institutions
  const insertInst = db.prepare(
    'INSERT OR REPLACE INTO institutions (id, name, name_cn, domain, country, type, type_cn) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  insertInst.run('inst-harvard', 'Harvard Law School', '哈佛大学法学院', 'law.harvard.edu', 'US', 'University', '高等院校');
  insertInst.run('inst-yale', 'Yale Law School', '耶鲁大学法学院', 'law.yale.edu', 'US', 'University', '高等院校');
  insertInst.run('inst-stanford', 'Stanford Law School', '斯坦福大学法学院', 'law.stanford.edu', 'US', 'University', '高等院校');
  insertInst.run('inst-columbia', 'Columbia Law School', '哥伦比亚大学法学院', 'law.columbia.edu', 'US', 'University', '高等院校');
  insertInst.run('inst-chicago', 'University of Chicago Law School', '芝加哥大学法学院', 'law.uchicago.edu', 'US', 'University', '高等院校');
  insertInst.run('inst-nyu', 'New York University School of Law', '纽约大学法学院', 'law.nyu.edu', 'US', 'University', '高等院校');
  insertInst.run('inst-oxford', 'University of Oxford Faculty of Law', '牛津大学法学院', 'law.ox.ac.uk', 'UK', 'University', '高等院校');
  insertInst.run('inst-cambridge', 'University of Cambridge Faculty of Law', '剑桥大学法学院', 'law.cam.ac.uk', 'UK', 'University', '高等院校');

  // Seed Journals
  const insertJournal = db.prepare(
    `INSERT OR REPLACE INTO journals (
      id, name, name_cn, abbreviation, issn_print, issn_electronic, institution, country, jurisdiction,
      tier, category, tags_cn, impact_rank, frequency, is_pinned, cover_color, official_url, resolved_type, status, source_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const journalsData = [
    {
      id: 'harvard-law-rev',
      name: 'Harvard Law Review',
      name_cn: '哈佛法律评论',
      abbreviation: 'Harv. L. Rev.',
      issn_print: '0017-811X',
      issn_electronic: '2161-976X',
      institution: 'Harvard Law School',
      country: 'US',
      jurisdiction: 'US',
      tier: 'T14',
      category: '综合法学',
      tags_cn: JSON.stringify(['综合法学', '核心法评', '宪法与公法', 'T14']),
      impact_rank: 'T14 顶刊 #1',
      frequency: 'Monthly (Nov-June)',
      is_pinned: 1,
      cover_color: '#7C1425',
      official_url: 'https://harvardlawreview.org',
      resolved_type: 'journal',
      status: 'active',
      source_type: 'curated',
    },
    {
      id: 'yale-law-j',
      name: 'Yale Law Journal',
      name_cn: '耶鲁法学杂志',
      abbreviation: 'Yale L.J.',
      issn_print: '0044-0094',
      issn_electronic: '1939-8646',
      institution: 'Yale Law School',
      country: 'US',
      jurisdiction: 'US',
      tier: 'T14',
      category: '综合法学',
      tags_cn: JSON.stringify(['综合法学', '法理学与法史', '宪法与公法', 'T14']),
      impact_rank: 'T14 顶刊 #2',
      frequency: '8 issues/year',
      is_pinned: 1,
      cover_color: '#072B54',
      official_url: 'https://www.yalelawjournal.org',
      resolved_type: 'journal',
      status: 'active',
      source_type: 'curated',
    },
    {
      id: 'stanford-law-rev',
      name: 'Stanford Law Review',
      name_cn: '斯坦福法律评论',
      abbreviation: 'Stan. L. Rev.',
      issn_print: '0038-9765',
      issn_electronic: '1939-8581',
      institution: 'Stanford Law School',
      country: 'US',
      jurisdiction: 'US',
      tier: 'T14',
      category: '综合法学',
      tags_cn: JSON.stringify(['综合法学', '数据与科技法', '知识产权法', 'T14']),
      impact_rank: 'T14 顶刊 #3',
      frequency: '6 issues/year',
      is_pinned: 1,
      cover_color: '#8C1515',
      official_url: 'https://www.stanfordlawreview.org',
      resolved_type: 'journal',
      status: 'active',
      source_type: 'curated',
    },
    {
      id: 'columbia-law-rev',
      name: 'Columbia Law Review',
      name_cn: '哥伦比亚法律评论',
      abbreviation: 'Colum. L. Rev.',
      issn_print: '0010-1958',
      issn_electronic: '1945-2268',
      institution: 'Columbia Law School',
      country: 'US',
      jurisdiction: 'US',
      tier: 'T14',
      category: '综合法学',
      tags_cn: JSON.stringify(['综合法学', '民商法学', '法律与经济学', 'T14']),
      impact_rank: 'T14 顶刊 #4',
      frequency: '8 issues/year',
      is_pinned: 1,
      cover_color: '#132C4F',
      official_url: 'https://columbialawreview.org',
      resolved_type: 'journal',
      status: 'active',
      source_type: 'curated',
    },
    {
      id: 'uclrev',
      name: 'University of Chicago Law Review',
      name_cn: '芝加哥大学法律评论',
      abbreviation: 'U. Chi. L. Rev.',
      issn_print: '0041-9494',
      issn_electronic: '1939-859X',
      institution: 'University of Chicago Law School',
      country: 'US',
      jurisdiction: 'US',
      tier: 'T14',
      category: '法律与经济学',
      tags_cn: JSON.stringify(['法律与经济学', '民商法学', '诉讼法与司法制度', 'T14']),
      impact_rank: 'T14 顶刊 #5',
      frequency: 'Quarterly',
      is_pinned: 1,
      cover_color: '#800000',
      official_url: 'https://lawreview.uchicago.edu',
      resolved_type: 'journal',
      status: 'active',
      source_type: 'curated',
    },
    {
      id: 'nyu-law-rev',
      name: 'New York University Law Review',
      name_cn: '纽约大学法律评论',
      abbreviation: 'N.Y.U. L. Rev.',
      issn_print: '0028-7881',
      issn_electronic: '1939-8603',
      institution: 'New York University School of Law',
      country: 'US',
      jurisdiction: 'US',
      tier: 'T14',
      category: '综合法学',
      tags_cn: JSON.stringify(['综合法学', '国际法与全球治理', '刑法与刑事司法', 'T14']),
      impact_rank: 'T14 顶刊 #6',
      frequency: '6 issues/year',
      is_pinned: 0,
      cover_color: '#57068C',
      official_url: 'https://www.nyulawreview.org',
      resolved_type: 'journal',
      status: 'active',
      source_type: 'curated',
    },
    {
      id: 'penn-law-rev',
      name: 'University of Pennsylvania Law Review',
      name_cn: '宾夕法尼亚大学法律评论',
      abbreviation: 'U. Pa. L. Rev.',
      issn_print: '0041-9907',
      issn_electronic: '1939-8611',
      institution: 'University of Pennsylvania Carey Law School',
      country: 'US',
      jurisdiction: 'US',
      tier: 'T14',
      category: '综合法学',
      tags_cn: JSON.stringify(['综合法学', '民商法学', '宪法与公法', 'T14']),
      impact_rank: 'T14 顶刊 #7',
      frequency: '7 issues/year',
      is_pinned: 0,
      cover_color: '#011847',
      official_url: 'https://www.pennlawreview.com',
      resolved_type: 'journal',
      status: 'active',
      source_type: 'curated',
    },
    {
      id: 'virginia-law-rev',
      name: 'Virginia Law Review',
      name_cn: '弗吉尼亚法律评论',
      abbreviation: 'Va. L. Rev.',
      issn_print: '0042-6601',
      issn_electronic: '1939-862X',
      institution: 'University of Virginia School of Law',
      country: 'US',
      jurisdiction: 'US',
      tier: 'T14',
      category: '综合法学',
      tags_cn: JSON.stringify(['综合法学', '宪法与公法', '法理学与法史', 'T14']),
      impact_rank: 'T14 顶刊 #8',
      frequency: '8 issues/year',
      is_pinned: 0,
      cover_color: '#233B63',
      official_url: 'https://virginialawreview.org',
      resolved_type: 'journal',
      status: 'active',
      source_type: 'curated',
    },
    {
      id: 'california-law-rev',
      name: 'California Law Review',
      name_cn: '加州法律评论',
      abbreviation: 'Calif. L. Rev.',
      issn_print: '0008-1221',
      issn_electronic: '1942-6542',
      institution: 'UC Berkeley School of Law',
      country: 'US',
      jurisdiction: 'US',
      tier: 'T14',
      category: '综合法学',
      tags_cn: JSON.stringify(['综合法学', '数据与科技法', '环境与能源法', 'T14']),
      impact_rank: 'T14 顶刊 #9',
      frequency: 'Bi-monthly',
      is_pinned: 0,
      cover_color: '#003262',
      official_url: 'https://www.californialawreview.org',
      resolved_type: 'journal',
      status: 'active',
      source_type: 'curated',
    },
    {
      id: 'duke-law-j',
      name: 'Duke Law Journal',
      name_cn: '杜克法律杂志',
      abbreviation: 'Duke L.J.',
      issn_print: '0012-7086',
      issn_electronic: '1939-9111',
      institution: 'Duke University School of Law',
      country: 'US',
      jurisdiction: 'US',
      tier: 'T14',
      category: '宪法与公法',
      tags_cn: JSON.stringify(['宪法与公法', '行政法', '诉讼法与司法制度', 'T14']),
      impact_rank: 'T14 顶刊 #10',
      frequency: '8 issues/year',
      is_pinned: 0,
      cover_color: '#012169',
      official_url: 'https://scholarship.law.duke.edu/dlj',
      resolved_type: 'journal',
      status: 'active',
      source_type: 'curated',
    },
    {
      id: 'oxford-j-legal-stud',
      name: 'Oxford Journal of Legal Studies',
      name_cn: '牛津法学研究杂志',
      abbreviation: 'Oxf. J. Leg. Stud.',
      issn_print: '0143-6503',
      issn_electronic: '1464-3820',
      institution: 'Oxford University Faculty of Law',
      country: 'UK',
      jurisdiction: 'UK',
      tier: 'UK顶刊',
      category: '法理学与法史',
      tags_cn: JSON.stringify(['法理学与法史', '普通法系', '综合法学', 'UK顶刊']),
      impact_rank: '英国旗舰法评 #1',
      frequency: 'Quarterly',
      is_pinned: 1,
      cover_color: '#002147',
      official_url: 'https://academic.oup.com/ojls',
      resolved_type: 'journal',
      status: 'active',
      source_type: 'curated',
    },
    {
      id: 'cambridge-law-j',
      name: 'Cambridge Law Journal',
      name_cn: '剑桥法律杂志',
      abbreviation: 'Camb. L.J.',
      issn_print: '0008-1973',
      issn_electronic: '1469-2139',
      institution: 'University of Cambridge Faculty of Law',
      country: 'UK',
      jurisdiction: 'UK',
      tier: 'UK顶刊',
      category: '综合法学',
      tags_cn: JSON.stringify(['综合法学', '民商法学', '侵权与合同法', 'UK顶刊']),
      impact_rank: '英国旗舰法评 #2',
      frequency: '3 issues/year',
      is_pinned: 0,
      cover_color: '#A3C1AD',
      official_url: 'https://www.cambridge.org/core/journals/cambridge-law-journal',
      resolved_type: 'journal',
      status: 'active',
      source_type: 'curated',
    },
    {
      id: 'lqr',
      name: 'Law Quarterly Review',
      name_cn: '法律季刊',
      abbreviation: 'L.Q.R.',
      issn_print: '0023-933X',
      issn_electronic: '0023-933X',
      institution: 'Sweet & Maxwell / UK Academic Community',
      country: 'UK',
      jurisdiction: 'UK',
      tier: 'UK旗舰',
      category: '民商法学',
      tags_cn: JSON.stringify(['普通法系', '衡平法与信托', '财产法', 'UK旗舰']),
      impact_rank: '英联邦普通法历史旗舰',
      frequency: 'Quarterly',
      is_pinned: 0,
      cover_color: '#4B0082',
      official_url: 'https://www.sweetandmaxwell.co.uk',
      resolved_type: 'journal',
      status: 'active',
      source_type: 'curated',
    },
  ];

  for (const j of journalsData) {
    insertJournal.run(
      j.id, j.name, j.name_cn, j.abbreviation, j.issn_print, j.issn_electronic,
      j.institution, j.country, j.jurisdiction, j.tier, j.category, j.tags_cn,
      j.impact_rank, j.frequency, j.is_pinned, j.cover_color, j.official_url,
      j.resolved_type, j.status, j.source_type
    );
  }

  // Seed Authors
  const insertAuthor = db.prepare(
    `INSERT OR REPLACE INTO authors (
      id, name, name_cn, openalex_author_id, orcid, ssrn_id, current_institution_id, tags_cn, profile_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const authorsData = [
    {
      id: 'auth-sunstein',
      name: 'Cass R. Sunstein',
      name_cn: '凯斯·桑斯坦',
      openalex_author_id: 'A5008298912',
      orcid: '0000-0002-4521-9876',
      ssrn_id: '243',
      current_institution_id: 'inst-harvard',
      tags_cn: JSON.stringify(['宪法与公法', '行政法', '法律与经济学', '行为法学']),
      profile_url: 'https://hls.harvard.edu/faculty/cass-r-sunstein/',
      status: 'active',
    },
    {
      id: 'auth-posner',
      name: 'Richard A. Posner',
      name_cn: '理查德·波斯纳',
      openalex_author_id: 'A5012398124',
      orcid: null,
      ssrn_id: '19',
      current_institution_id: 'inst-chicago',
      tags_cn: JSON.stringify(['法律与经济学', '法理学与法史', '司法制度', '反垄断法']),
      profile_url: 'https://www.law.uchicago.edu/faculty/posner-r',
      status: 'active',
    },
    {
      id: 'auth-amar',
      name: 'Akhil Reed Amar',
      name_cn: '阿基尔·阿马尔',
      openalex_author_id: 'A5023910293',
      orcid: null,
      ssrn_id: '154',
      current_institution_id: 'inst-yale',
      tags_cn: JSON.stringify(['宪法与公法', '美国宪法史', '刑事诉讼与司法', '权利法案']),
      profile_url: 'https://law.yale.edu/akhil-reed-amar',
      status: 'active',
    },
    {
      id: 'auth-lessig',
      name: 'Lawrence Lessig',
      name_cn: '劳伦斯·莱斯格',
      openalex_author_id: 'A5078129381',
      orcid: '0000-0003-2412-4011',
      ssrn_id: '92',
      current_institution_id: 'inst-harvard',
      tags_cn: JSON.stringify(['数据与科技法', '知识产权法', '宪法与公法', '网络法']),
      profile_url: 'https://hls.harvard.edu/faculty/lawrence-lessig/',
      status: 'active',
    },
    {
      id: 'auth-balkin',
      name: 'Jack M. Balkin',
      name_cn: '杰克·鲍尔金',
      openalex_author_id: 'A5019827391',
      orcid: null,
      ssrn_id: '118',
      current_institution_id: 'inst-yale',
      tags_cn: JSON.stringify(['宪法与公法', '法理学与法史', '数据与科技法', '言论自由']),
      profile_url: 'https://law.yale.edu/jack-m-balkin',
      status: 'active',
    },
    {
      id: 'auth-vermeule',
      name: 'Adrian Vermeule',
      name_cn: '阿德里安·维缪勒',
      openalex_author_id: 'A5049182390',
      orcid: null,
      ssrn_id: '320',
      current_institution_id: 'inst-harvard',
      tags_cn: JSON.stringify(['宪法与公法', '公法学', '行政国家理论', '法理学与法史']),
      profile_url: 'https://hls.harvard.edu/faculty/adrian-vermeule/',
      status: 'active',
    },
    {
      id: 'auth-wu',
      name: 'Tim Wu',
      name_cn: '吴修铭',
      openalex_author_id: 'A5081928301',
      orcid: null,
      ssrn_id: '289',
      current_institution_id: 'inst-columbia',
      tags_cn: JSON.stringify(['法律与经济学', '反垄断法', '数据与科技法', '网络中立性']),
      profile_url: 'https://www.law.columbia.edu/faculty/tim-wu',
      status: 'active',
    },
  ];

  for (const a of authorsData) {
    insertAuthor.run(
      a.id, a.name, a.name_cn, a.openalex_author_id, a.orcid, a.ssrn_id,
      a.current_institution_id, a.tags_cn, a.profile_url, a.status
    );
  }

  // Seed Papers
  const insertPaper = db.prepare(
    `INSERT OR REPLACE INTO papers (
      id, journal_id, paper_type, edition, category, category_cn, title, title_cn,
      abstract, abstract_cn, volume, issue, volume_issue, published_at, canonical_url,
      pdf_url, doi, authors_json, journal_name_cn, recommended_citation, first_page, last_page,
      tags, tags_cn, reading_time, featured, citations_count, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const papersData = [
    {
      id: 'paper-sunstein-ai-admin-2025',
      journal_id: 'harvard-law-rev',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '学术论文',
      title: 'Algorithmic Statecraft: Generative AI and Administrative Procedure',
      title_cn: '算法国家建构：生成式人工智能与行政程序再造',
      abstract: 'This article explores how agency adoption of foundation models challenges traditional notice-and-comment requirements, algorithmic due process, and the nondelegation doctrine. We propose a framework of technocratic reason-giving to preserve public accountability without stifling technological modernization.',
      abstract_cn: '本文深入探讨了联邦监管行政机关在引入基础大语言模型时对传统通告-评论程序、算法正当程序以及禁止转授权原则的深刻冲击。本文建构了一套针对算法自动裁量的技术理性说明义务框架，旨在确保公共信赖与问责制的前提下稳妥推进行政现代化的制度创新。',
      volume: '138',
      issue: '4',
      volume_issue: 'Vol. 138, No. 4',
      published_at: '2025-02-15',
      canonical_url: 'https://harvardlawreview.org/print/vol-138/algorithmic-statecraft/',
      pdf_url: 'https://harvardlawreview.org/wp-content/uploads/2025/02/138-Harv-L-Rev-892.pdf',
      doi: '10.1111/hlr.2025.138.4.892',
      authors_json: JSON.stringify([
        { name: 'Cass R. Sunstein', name_cn: '凯斯·桑斯坦', affiliation: '哈佛大学法学院' },
      ]),
      journal_name_cn: '哈佛法律评论',
      recommended_citation: 'Cass R. Sunstein, Algorithmic Statecraft: Generative AI and Administrative Procedure, 138 Harv. L. Rev. 892 (2025).',
      first_page: '892',
      last_page: '954',
      tags: JSON.stringify(['Generative AI', 'Administrative Law', 'Due Process', 'Constitutional Law']),
      tags_cn: JSON.stringify(['数据与科技法', '宪法与公法', '行政法', '人工智能法']),
      reading_time: 25,
      featured: 1,
      citations_count: 48,
      updated_at: '2025-02-15 00:00:00',
    },
    {
      id: 'paper-balkin-speech-platforms-2025',
      journal_id: 'yale-law-j',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '学术论文',
      title: 'Free Speech in the Algorithmic Society: Private Governance and the Public Sphere',
      title_cn: '算法社会中的言论自由：私权力治理与公共领域的新宪制',
      abstract: 'Private platform curation now constitutes the primary architectural gatekeeper of contemporary civic discourse. Analyzing recent Supreme Court rulings on NetChoice, this article develops a relational model of the First Amendment suited for digital networks.',
      abstract_cn: '大型数字平台的算法内容推荐已构成当今公民言论公共领域的核心守门人机制。结合美国联邦最高法院对 NetChoice 系列判决的法理演进，本文提炼出一套适应多边网络中介特征的关系性第一修正案理论模型，重新校准言论自由与私权力规制之间的平衡。',
      volume: '134',
      issue: '2',
      volume_issue: 'Vol. 134, No. 2',
      published_at: '2025-01-20',
      canonical_url: 'https://www.yalelawjournal.org/article/free-speech-algorithmic-society',
      pdf_url: 'https://www.yalelawjournal.org/pdf/134.2.Balkin_718.pdf',
      doi: '10.1201/ylj.2025.134.2.718',
      authors_json: JSON.stringify([
        { name: 'Jack M. Balkin', name_cn: '杰克·鲍尔金', affiliation: '耶鲁大学法学院' },
      ]),
      journal_name_cn: '耶鲁法学杂志',
      recommended_citation: 'Jack M. Balkin, Free Speech in the Algorithmic Society: Private Governance and the Public Sphere, 134 Yale L.J. 718 (2025).',
      first_page: '718',
      last_page: '785',
      tags: JSON.stringify(['First Amendment', 'Platform Governance', 'Digital Constitutionalism']),
      tags_cn: JSON.stringify(['宪法与公法', '数据与科技法', '法理学与法史', '言论自由']),
      reading_time: 30,
      featured: 1,
      citations_count: 62,
      updated_at: '2025-01-20 00:00:00',
    },
    {
      id: 'paper-lessig-copyright-frontier-2024',
      journal_id: 'stanford-law-rev',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '学术论文',
      title: 'Fair Use in the Age of Generative Training: A Reconstructive Defense of Cultural Commons',
      title_cn: '大模型生成式训练中的合理使用：文化公地理论的重构与辩护',
      abstract: 'Does ingesting billions of copyrighted works to train diffusion models and LLMs constitute transformative fair use? Evaluating Section 107 in light of machine learning economics, this work charts a statutory safe harbor coupled with collective licensing models.',
      abstract_cn: '将海量受著作权保护的作品用于大语言模型和多模态生成式模型的预训练是否属于转换性合理使用？本文立足机器学习技术规律与知识产权激励体系，评析了美国《版权法》第107条的司法适用困境，并提出了兼顾创作者权益与创新自由的法定安全港与集体许可混合框架。',
      volume: '77',
      issue: '1',
      volume_issue: 'Vol. 77, No. 1',
      published_at: '2024-12-10',
      canonical_url: 'https://www.stanfordlawreview.org/print/article/fair-use-generative-training/',
      pdf_url: 'https://www.stanfordlawreview.org/wp-content/uploads/sites/3/2024/12/77-Stan-L-Rev-112.pdf',
      doi: '10.1145/slr.2024.77.1.112',
      authors_json: JSON.stringify([
        { name: 'Lawrence Lessig', name_cn: '劳伦斯·莱斯格', affiliation: '哈佛大学法学院' },
      ]),
      journal_name_cn: '斯坦福法律评论',
      recommended_citation: 'Lawrence Lessig, Fair Use in the Age of Generative Training: A Reconstructive Defense of Cultural Commons, 77 Stan. L. Rev. 112 (2024).',
      first_page: '112',
      last_page: '178',
      tags: JSON.stringify(['Copyright', 'Fair Use', 'Generative AI', 'Intellectual Property']),
      tags_cn: JSON.stringify(['知识产权法', '数据与科技法', '民商法学', '专利与著作权']),
      reading_time: 22,
      featured: 1,
      citations_count: 53,
      updated_at: '2024-12-10 00:00:00',
    },
    {
      id: 'paper-wu-antitrust-ecosystems-2025',
      journal_id: 'columbia-law-rev',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '学术论文',
      title: 'Ecosystem Monopoly: Beyond Price Theory in Digital Platform Antitrust',
      title_cn: '生态系统垄断：超越数字平台反垄断传统价格理论的范式转向',
      abstract: 'Traditional consumer welfare metrics fail to capture harms generated by multi-product digital ecosystems locking in users through defaults and interoperability barriers. We advance an infrastructural approach to Sherman Act Section 2 enforcement.',
      abstract_cn: '传统的消费者福利标准难以准确度量跨市场生态平台通过系统默认捆绑与互操作性壁垒所实施的封闭式垄断损害。本文基于谢尔曼法第二条的执法前沿，提出了数字时代基于基础设施属性的平台反垄断新范式。',
      volume: '125',
      issue: '1',
      volume_issue: 'Vol. 125, No. 1',
      published_at: '2025-01-05',
      canonical_url: 'https://columbialawreview.org/content/ecosystem-monopoly/',
      pdf_url: null,
      doi: '10.2139/ssrn.4718291',
      authors_json: JSON.stringify([
        { name: 'Tim Wu', name_cn: '吴修铭', affiliation: '哥伦比亚大学法学院' },
      ]),
      journal_name_cn: '哥伦比亚法律评论',
      recommended_citation: 'Tim Wu, Ecosystem Monopoly: Beyond Price Theory in Digital Platform Antitrust, 125 Colum. L. Rev. 45 (2025).',
      first_page: '45',
      last_page: '98',
      tags: JSON.stringify(['Antitrust', 'Sherman Act', 'Digital Platforms', 'Competition Law']),
      tags_cn: JSON.stringify(['法律与经济学', '反垄断法', '民商法学', '竞争法']),
      reading_time: 18,
      featured: 0,
      citations_count: 34,
      updated_at: '2025-01-05 00:00:00',
    },
    {
      id: 'paper-vermeule-common-good-2024',
      journal_id: 'uclrev',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '学术论文',
      title: 'Substantive Due Process and the Common Good: Classical Jurisprudence in Contemporary Public Law',
      title_cn: '实质性正当程序与共同善：当代公法中的古典法理学复兴',
      abstract: 'Examining the tensions between originalism and classical legal tradition, this article reconstructs constitutional interpretation around substantive principles of human dignity, justice, and community order.',
      abstract_cn: '本文反思了原旨主义与古典自然法传统之间的张力，尝试以实质性人类尊严、普遍正义与公共共同善为支点，对宪法实质性正当程序条款与当代公法解释原则展开系统重构。',
      volume: '91',
      issue: '6',
      volume_issue: 'Vol. 91, Iss. 6',
      published_at: '2024-11-18',
      canonical_url: 'https://lawreview.uchicago.edu/substantive-due-process-common-good',
      pdf_url: null,
      doi: '10.1086/728190',
      authors_json: JSON.stringify([
        { name: 'Adrian Vermeule', name_cn: '阿德里安·维缪勒', affiliation: '哈佛大学法学院' },
      ]),
      journal_name_cn: '芝加哥大学法律评论',
      recommended_citation: 'Adrian Vermeule, Substantive Due Process and the Common Good, 91 U. Chi. L. Rev. 1421 (2024).',
      first_page: '1421',
      last_page: '1478',
      tags: JSON.stringify(['Constitutional Law', 'Jurisprudence', 'Common Good', 'Public Law']),
      tags_cn: JSON.stringify(['宪法与公法', '法理学与法史', '司法制度']),
      reading_time: 20,
      featured: 0,
      citations_count: 29,
      updated_at: '2024-11-18 00:00:00',
    },
    {
      id: 'paper-amar-presidential-immunity-2024',
      journal_id: 'oxford-j-legal-stud',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '学术论文',
      title: 'Executive Accountability Under the Anglo-American Rule of Law: A Comparative Reassessment',
      title_cn: '英美法治传统下的行政首长问责机制：比较法视阈下的历史重审',
      abstract: 'Tracing the doctrine of official immunity from Coke and Blackstone to modern American and British constitutional confrontations, this article demonstrates the systemic constitutional perils of expansive criminal immunity for executive heads.',
      abstract_cn: '从爱德华·柯克爵士与布莱克斯通普通法传统发端，本文梳理了英美公法中针对国家元首与行政首长豁免权的规范渊源与现代宪制对抗，揭示了绝对免责主张对分权制衡与法治原则的破坏风险。',
      volume: '44',
      issue: '4',
      volume_issue: 'Vol. 44, Iss. 4',
      published_at: '2024-12-01',
      canonical_url: 'https://academic.oup.com/ojls/article/44/4/812/7891234',
      pdf_url: null,
      doi: '10.1093/ojls/gqae032',
      authors_json: JSON.stringify([
        { name: 'Akhil Reed Amar', name_cn: '阿基尔·阿马尔', affiliation: '耶鲁大学法学院' },
      ]),
      journal_name_cn: '牛津法学研究杂志',
      recommended_citation: 'Akhil Reed Amar, Executive Accountability Under the Anglo-American Rule of Law, 44 Oxf. J. Leg. Stud. 812 (2024).',
      first_page: '812',
      last_page: '856',
      tags: JSON.stringify(['Rule of Law', 'Executive Power', 'Comparative Law', 'Constitutional Law']),
      tags_cn: JSON.stringify(['宪法与公法', '国际法与全球治理', '法理学与法史', '普通法系']),
      reading_time: 24,
      featured: 1,
      citations_count: 41,
      updated_at: '2024-12-01 00:00:00',
    },
  ];

  for (const p of papersData) {
    insertPaper.run(
      p.id, p.journal_id, p.paper_type, p.edition, p.category, p.category_cn,
      p.title, p.title_cn, p.abstract, p.abstract_cn, p.volume, p.issue,
      p.volume_issue, p.published_at, p.canonical_url, p.pdf_url, p.doi,
      p.authors_json, p.journal_name_cn, p.recommended_citation, p.first_page,
      p.last_page, p.tags, p.tags_cn, p.reading_time, p.featured, p.citations_count,
      p.updated_at
    );
  }

  // Seed Academic Events & CFPs
  // Include upcoming urgent events within 7 days for summary metrics
  const now = new Date();
  const formatIsoDate = (d: Date) => d.toISOString().split('T')[0];

  const in3Days = new Date(now.getTime() + 3 * 86400000);
  const in6Days = new Date(now.getTime() + 6 * 86400000);
  const in25Days = new Date(now.getTime() + 25 * 86400000);
  const in45Days = new Date(now.getTime() + 45 * 86400000);

  const insertEvent = db.prepare(
    `INSERT OR REPLACE INTO events (
      id, feed_guid, title, title_cn, event_category, event_type,
      submission_deadline, deadline_type, deadline_display, deadline, timezone,
      is_extended, original_deadline, notification_date, event_start_date, event_end_date,
      event_date, host_id, host_name, journal_id, location, academic_year, hiring_rank,
      subject_areas, contact_info, tags_cn, description, description_cn, official_url,
      submission_url, fee_info, is_pinned, is_deleted, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const eventsData = [
    {
      id: 'event-hls-cfp-ai-2026',
      feed_guid: 'guid-hls-cfp-ai-2026',
      title: 'Call for Papers: Harvard Law Review Special Symposium on Constitutional Governance & Frontier AI',
      title_cn: '【截稿在即】《哈佛法律评论》特刊征文：宪制治理与前沿人工智能法律挑战研讨会',
      event_category: 'call_for_papers',
      event_type: '特刊征稿',
      submission_deadline: formatIsoDate(in3Days),
      deadline_type: 'fixed',
      deadline_display: `${formatIsoDate(in3Days)} (截稿倒计时 3 天)`,
      deadline: formatIsoDate(in3Days),
      timezone: 'America/New_York',
      is_extended: 0,
      original_deadline: null,
      notification_date: formatIsoDate(in25Days),
      event_start_date: formatIsoDate(in45Days),
      event_end_date: formatIsoDate(new Date(in45Days.getTime() + 2 * 86400000)),
      event_date: formatIsoDate(in45Days),
      host_id: 'inst-harvard',
      host_name: 'Harvard Law School / Harvard Law Review',
      journal_id: 'harvard-law-rev',
      location: 'Cambridge, MA, USA / Hybrid',
      academic_year: '2025-2026',
      hiring_rank: null,
      subject_areas: '宪法学、行政法学、数据与科技法、人工智能伦理与监管',
      contact_info: 'hlr-symposium@law.harvard.edu',
      tags_cn: JSON.stringify(['特刊征稿', '数据与科技法', '宪法与公法', '哈佛法律评论']),
      description: 'The Harvard Law Review invites submissions for its 2026 Annual Symposium focusing on constitutional and administrative dimensions of frontier artificial intelligence systems.',
      description_cn: '《哈佛法律评论》编委会正式启动2026年度学术特刊征稿，诚邀全球公法学者、科技法学者就大语言模型对司法审判、行政规制及正当程序的影响提交原创论文，入选文章将全文刊载于评论特刊。',
      official_url: 'https://harvardlawreview.org/symposia/ai-governance',
      submission_url: 'https://harvardlawreview.org/submissions',
      fee_info: '入选学者获全额交通与食宿资助',
      is_pinned: 1,
      is_deleted: 0,
      status: 'active',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'event-yale-job-climenko-2026',
      feed_guid: 'guid-yale-job-climenko-2026',
      title: 'Yale Information Society Project: Postdoctoral Fellowship in Digital Rights & Law',
      title_cn: '【紧急遴选】耶鲁大学法学院 ISP 项目：数字人权与科技法博士后研究员/教职遴选',
      event_category: 'academic_job',
      event_type: '博士后/研究员',
      submission_deadline: formatIsoDate(in6Days),
      deadline_type: 'fixed',
      deadline_display: `${formatIsoDate(in6Days)} (申请倒计时 6 天)`,
      deadline: formatIsoDate(in6Days),
      timezone: 'America/New_York',
      is_extended: 1,
      original_deadline: formatIsoDate(now),
      notification_date: formatIsoDate(in25Days),
      event_start_date: '2026-09-01',
      event_end_date: '2028-06-30',
      event_date: '2026-09-01',
      host_id: 'inst-yale',
      host_name: 'Yale Law School / Information Society Project',
      journal_id: 'yale-law-j',
      location: 'New Haven, CT, USA',
      academic_year: '2026-2027',
      hiring_rank: 'Postdoctoral Fellow / Resident Scholar',
      subject_areas: '网络法、科技与社会、言论自由、反垄断',
      contact_info: 'isp.fellowship@yale.edu',
      tags_cn: JSON.stringify(['法学教职', '博士后/研究员', '数据与科技法', '耶鲁法学院']),
      description: 'The Information Society Project (ISP) at Yale Law School is accepting applications for its 2026-2028 Postdoctoral Fellowships.',
      description_cn: '耶鲁大学信息社会项目（ISP）面向全球招募数字法学研究员与博士后学者。年薪8.5万美元并提供全额科研与国际学术研讨基金。',
      official_url: 'https://law.yale.edu/isp/fellowships',
      submission_url: 'https://law.yale.edu/isp/apply',
      fee_info: '提供有竞争力的学术年薪及全额健康保险',
      is_pinned: 1,
      is_deleted: 0,
      status: 'active',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'event-oxford-symposium-2026',
      feed_guid: 'guid-oxford-symposium-2026',
      title: 'Oxford Colloquium on Anglo-American Private Law & Equity Jurisprudence',
      title_cn: '牛津大学英美私法与衡平法学前沿国际学术研讨会征文启事',
      event_category: 'call_for_papers',
      event_type: '国际学术研讨会',
      submission_deadline: formatIsoDate(in25Days),
      deadline_type: 'fixed',
      deadline_display: `${formatIsoDate(in25Days)}`,
      deadline: formatIsoDate(in25Days),
      timezone: 'Europe/London',
      is_extended: 0,
      original_deadline: null,
      notification_date: formatIsoDate(in45Days),
      event_start_date: '2026-07-15',
      event_end_date: '2026-07-17',
      event_date: '2026-07-15',
      host_id: 'inst-oxford',
      host_name: 'Oxford University Faculty of Law',
      journal_id: 'oxford-j-legal-stud',
      location: 'St John’s College, Oxford, UK',
      academic_year: '2025-2026',
      hiring_rank: null,
      subject_areas: '民商法学、合同法理论、不当得利、衡平法与信托',
      contact_info: 'privatelaw@law.ox.ac.uk',
      tags_cn: JSON.stringify(['国际学术研讨会', '民商法学', '法理学与法史', '牛津大学']),
      description: 'An international conference gathering scholars from the UK, Commonwealth, and the US to debate modern developments in contract, tort, and restitution.',
      description_cn: '汇聚英国、英联邦与美国私法学界顶尖学者，深入探讨合同法当代演进、侵权责任限度与衡平法传统在现代市场经济中的适用。',
      official_url: 'https://www.law.ox.ac.uk/events/private-law-colloquium-2026',
      submission_url: 'https://www.law.ox.ac.uk/events/submit',
      fee_info: '青年学者与博士生免除注册费',
      is_pinned: 0,
      is_deleted: 0,
      status: 'active',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  for (const e of eventsData) {
    insertEvent.run(
      e.id, e.feed_guid, e.title, e.title_cn, e.event_category, e.event_type,
      e.submission_deadline, e.deadline_type, e.deadline_display, e.deadline,
      e.timezone, e.is_extended, e.original_deadline, e.notification_date,
      e.event_start_date, e.event_end_date, e.event_date, e.host_id, e.host_name,
      e.journal_id, e.location, e.academic_year, e.hiring_rank, e.subject_areas,
      e.contact_info, e.tags_cn, e.description, e.description_cn, e.official_url,
      e.submission_url, e.fee_info, e.is_pinned, e.is_deleted, e.status,
      e.created_at, e.updated_at
    );
  }

  // Seed Wishlists
  const insertWishlist = db.prepare(
    `INSERT OR REPLACE INTO wishlists (
      id, user_id, entity_type, entity_name, status, submitter, notes, votes, response_note, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const wishlistData = [
    {
      id: 'wl-westlaw-sync',
      user_id: 'usr-scholar-1',
      entity_type: '数据库/平台',
      entity_name: 'Westlaw / LexisNexis 判例法深度引证图谱连通',
      status: '已排期',
      submitter: '驻站学者 (Dr. Chen)',
      notes: '建议支持直接关联 Shepard’s 和 KeyCite 裁判引证标记，方便追溯经典判例在法评中的历时引用网络。',
      votes: 38,
      response_note: '已纳入 2026 Q3 法学文献引证图谱二期路线图。',
      created_at: '2025-01-12 10:00:00',
      updated_at: '2025-01-15 14:00:00',
    },
    {
      id: 'wl-german-journals',
      user_id: 'usr-demo-1',
      entity_type: '期刊',
      entity_name: 'JZ (JuristenZeitung) 与 AöR 德国公法旗舰期刊收录',
      status: '待处理',
      submitter: '比较法学研究者',
      notes: '希望能增加欧陆法特别是德国公私法经典刊物的目录流与中文摘要情报，丰富大陆法系文献视角。',
      votes: 27,
      response_note: '正在与欧陆法学文献源联络开放目录数据接入。',
      created_at: '2025-02-01 09:30:00',
      updated_at: '2025-02-01 09:30:00',
    },
    {
      id: 'wl-author-dworkin',
      user_id: 'usr-admin-1',
      entity_type: '学者',
      entity_name: 'Ronald Dworkin (罗纳德·德沃金) 传世法理学全集引文库',
      status: '处理中',
      submitter: '系统编辑部',
      notes: '梳理德沃金在《纽约书评》与主要法评中的论战文献，建立结构化命题引用档案。',
      votes: 45,
      response_note: '已完成 85% 历史文献数字化对齐，即将正式上线学者主页。',
      created_at: '2025-01-20 16:00:00',
      updated_at: '2025-02-10 11:20:00',
    },
  ];

  for (const w of wishlistData) {
    insertWishlist.run(
      w.id, w.user_id, w.entity_type, w.entity_name, w.status,
      w.submitter, w.notes, w.votes, w.response_note, w.created_at, w.updated_at
    );
  }
}
