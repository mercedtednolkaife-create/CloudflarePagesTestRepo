import { D1Database, D1PreparedStatement } from '../worker';

export interface UserTable {
  id: string;
  username: string;
  password_hash: string;
  role: string;
}

export interface InstitutionTable {
  id: string;
  name: string;
  domain: string | null;
  country: string | null;
  type: string | null;
}

export interface JournalTable {
  id: string;
  name: string;
  name_cn: string;
  abbreviation: string;
  issn_print?: string | null;
  issn_electronic?: string | null;
  issn?: string | null;
  institution: string;
  country: string;
  jurisdiction: string;
  tier: string | null;
  category: string;
  tags_cn?: string | null;
  tags?: string | null;
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

export interface AuthorTable {
  id: string;
  name: string;
  name_cn?: string | null;
  openalex_author_id?: string | null;
  orcid?: string | null;
  ssrn_id: string | null;
  institution_id: string | null;
  profile_url?: string | null;
  tags?: string | null;
  tags_cn?: string | null;
}

export interface PaperTable {
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
  volume: string | null;
  issue: string | null;
  volume_issue: string | null;
  published_at: string | null;
  url: string | null;
  canonical_url?: string | null;
  pdf_url?: string | null;
  doi?: string | null;
  authors_json?: string | null;
  journal_name_cn?: string | null;
  recommended_citation?: string | null;
  first_page?: string | null;
  last_page?: string | null;
  tags: string | null;
  tags_cn?: string | null;
  reading_time?: number;
  featured?: number;
  citations_count?: number;
  updated_at?: string;
}

export interface PaperAuthorTable {
  paper_id: string;
  author_id: string;
}

export interface EventTable {
  id: string;
  feed_guid?: string | null;
  title: string;
  title_cn?: string | null;
  event_category: 'call_for_papers' | 'academic_job' | string;
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

export interface BookmarkTable {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

export interface WishlistTable {
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

export interface WishlistVoteTable {
  id: string;
  user_id: string;
  wishlist_id: string;
  created_at: string;
}

export interface ArticleTable {
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

export interface GlobalSearchTable {
  entity_type: string;
  entity_id: string;
  title: string;
  content: string;
}

export function createInMemoryD1(): D1Database {
  // Initial seed data
  const users: UserTable[] = [
    {
      id: 'usr-admin',
      username: 'admin',
      password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123
      role: 'admin',
    },
    {
      id: 'usr-scholar',
      username: 'scholar',
      password_hash: 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', // user123
      role: 'scholar',
    },
    {
      id: 'usr-demo',
      username: 'demo_user',
      password_hash: 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', // user123
      role: 'user',
    },
  ];

  const institutions: InstitutionTable[] = [
    { id: 'inst-1', name: 'Harvard Law School', domain: 'law.harvard.edu', country: 'United States', type: 'University' },
    { id: 'inst-2', name: 'Yale Law School', domain: 'law.yale.edu', country: 'United States', type: 'University' },
    { id: 'inst-3', name: 'Oxford Faculty of Law', domain: 'law.ox.ac.uk', country: 'United Kingdom', type: 'University' },
    { id: 'inst-4', name: 'Max Planck Institute for Comparative Public Law', domain: 'mpil.de', country: 'Germany', type: 'Research Institute' },
    { id: 'inst-5', name: 'Stanford Law School', domain: 'law.stanford.edu', country: 'United States', type: 'University' },
    { id: 'inst-6', name: 'Cambridge Faculty of Law', domain: 'law.cam.ac.uk', country: 'United Kingdom', type: 'University' },
    { id: 'inst-7', name: 'Columbia Law School', domain: 'law.columbia.edu', country: 'United States', type: 'University' },
    { id: 'inst-8', name: 'Peking University Law School', domain: 'law.pku.edu.cn', country: 'China', type: 'University' },
  ];

  const journals: JournalTable[] = [
    {
      id: 'j-1',
      name: 'Harvard Law Review',
      issn: '0017-811X',
      tier: 'SSCI Q1',
      tags: JSON.stringify(['综合法学', '民法', '宪法', '法哲学']),
      name_cn: '哈佛法律评论',
      abbreviation: 'HLR',
      institution: '哈佛大学法学院学生编辑部',
      country: '美国',
      jurisdiction: 'US',
      category: '综合性旗舰法学评论',
      impact_rank: 'W&L Rank #1 / SSCI Q1',
      current_issue: 'Vol. 138, No. 3 (2026)',
      frequency: '每年 8 期 (月刊)',
      is_pinned: 1,
      cover_color: 'from-amber-900 to-red-950',
      description: '全球公认引证率最高、学术影响力最大的学生主编法学期刊之一，以法哲学深度、最高法院年度述评著称。',
      official_url: 'https://harvardlawreview.org',
      recent_articles_count: 48,
      created_at: new Date().toISOString(),
    },
    {
      id: 'j-2',
      name: 'The Yale Law Journal',
      issn: '0044-0094',
      tier: 'SSCI Q1',
      tags: JSON.stringify(['综合法学', '反垄断', '经济法', '法理学']),
      name_cn: '耶鲁法学杂志',
      abbreviation: 'YLJ',
      institution: '耶鲁大学法学院',
      country: '美国',
      jurisdiction: 'US',
      category: '综合性旗舰法学评论',
      impact_rank: 'W&L Rank #2 / SSCI Q1',
      current_issue: 'Vol. 135, No. 7 (2026)',
      frequency: '每年 8 期',
      is_pinned: 1,
      cover_color: 'from-blue-900 to-indigo-950',
      description: '注重法学理论创新与跨学科批判，其设立的 "YLJ Forum" 提供即时对热点前沿判决与法案的短篇学术评述。',
      official_url: 'https://yalelawjournal.org',
      recent_articles_count: 52,
      created_at: new Date().toISOString(),
    },
    {
      id: 'j-3',
      name: 'Oxford Journal of Legal Studies',
      issn: '0143-6503',
      tier: 'SSCI Q1',
      tags: JSON.stringify(['法理学', '比较法', '环境法', '普通法']),
      name_cn: '牛津法律研究杂志',
      abbreviation: 'OJLS',
      institution: '牛津大学出版社 / 牛津大学法学院',
      country: '英国',
      jurisdiction: 'UK',
      category: '法理学与普通法研究',
      impact_rank: 'SSCI Q1 / 英国顶刊',
      current_issue: 'Vol. 46, Issue 2 (2026)',
      frequency: '每年 4 期 (季刊)',
      is_pinned: 1,
      cover_color: 'from-sky-900 to-slate-900',
      description: '英国最富盛名的同行评审法学学术刊物，以法理学、公法理论、合同侵权基础理论的高水准论证享誉国际学界。',
      official_url: 'https://academic.oup.com/ojls',
      recent_articles_count: 36,
      created_at: new Date().toISOString(),
    },
    {
      id: 'j-4',
      name: 'Common Market Law Review',
      issn: '0165-0750',
      tier: 'SSCI Q1',
      tags: JSON.stringify(['欧盟法', '国际法', '竞争法', '数据主权']),
      name_cn: '共同市场法律评论',
      abbreviation: 'CML Rev',
      institution: 'Kluwer Law International',
      country: '荷兰',
      jurisdiction: 'EU',
      category: '欧洲法旗舰刊物',
      impact_rank: 'SSCI Q1 / 欧洲权威',
      current_issue: 'Vol. 63, Issue 2 (2026)',
      frequency: '每年 6 期 (双月刊)',
      is_pinned: 0,
      cover_color: 'from-emerald-900 to-teal-950',
      description: '欧洲联盟法领域历史最悠久、权威度最高的同行评审刊物。',
      official_url: 'https://kluwerlawonline.com/journal/cola',
      recent_articles_count: 30,
      created_at: new Date().toISOString(),
    },
    {
      id: 'j-5',
      name: 'Stanford Law Review',
      issn: '0038-9765',
      tier: 'SSCI Q1',
      tags: JSON.stringify(['科技法', '知识产权', '宪法', '司法制度']),
      name_cn: '斯坦福法律评论',
      abbreviation: 'SLR',
      institution: '斯坦福大学法学院',
      country: '美国',
      jurisdiction: 'US',
      category: '综合性旗舰法学评论',
      impact_rank: 'W&L Rank #3 / SSCI Q1',
      current_issue: 'Vol. 78, Issue 4 (2026)',
      frequency: '每年 6 期',
      is_pinned: 0,
      cover_color: 'from-red-900 to-rose-950',
      description: '在科技法、知识产权与法经济学交叉领域处于全球前沿。',
      official_url: 'https://www.stanfordlawreview.org',
      recent_articles_count: 42,
      created_at: new Date().toISOString(),
    },
    {
      id: 'j-6',
      name: 'Cambridge Law Journal',
      issn: '0008-1973',
      tier: 'SSCI Q1',
      tags: JSON.stringify(['普通法', '私法', '法律史', '比较法']),
      name_cn: '剑桥法律杂志',
      abbreviation: 'CLJ',
      institution: '剑桥大学出版社',
      country: '英国',
      jurisdiction: 'UK',
      category: '普通法权威刊物',
      impact_rank: 'SSCI Q1 / 剑桥顶刊',
      current_issue: 'Vol. 85, Issue 1 (2026)',
      frequency: '每年 3 期',
      is_pinned: 0,
      cover_color: 'from-indigo-900 to-purple-950',
      description: '英国历史悠久的综合性法学刊物，聚焦判例评析与私法教义学。',
      official_url: 'https://www.cambridge.org/core/journals/cambridge-law-journal',
      recent_articles_count: 35,
      created_at: new Date().toISOString(),
    },
    {
      id: 'j-7',
      name: 'Columbia Law Review',
      issn: '0010-1958',
      tier: 'SSCI Q1',
      tags: JSON.stringify(['商法', '公司法', '证券法', '行政法']),
      name_cn: '哥伦比亚法律评论',
      abbreviation: 'CLR',
      institution: '哥伦比亚大学法学院',
      country: '美国',
      jurisdiction: 'US',
      category: '综合性旗舰法学评论',
      impact_rank: 'W&L Rank #4 / SSCI Q1',
      current_issue: 'Vol. 126, No. 5 (2026)',
      frequency: '每年 8 期',
      is_pinned: 0,
      cover_color: 'from-cyan-900 to-blue-950',
      description: '在商业组织法、资本市场监管与行政法领域拥有极高学术声誉。',
      official_url: 'https://columbialawreview.org',
      recent_articles_count: 45,
      created_at: new Date().toISOString(),
    },
  ];

  const authors: AuthorTable[] = [
    {
      id: 'auth-1',
      name: 'Prof. Jonathan Zittrain',
      name_cn: '乔纳森·齐特林',
      openalex_author_id: 'A5012345678',
      orcid: '0000-0002-1825-0097',
      ssrn_id: 'ssrn-34190',
      profile_url: 'https://hls.harvard.edu/faculty/jonathan-zittrain/',
      institution_id: 'inst-1',
      tags: JSON.stringify(['人工智能法', '互联网法律', '数字治理', '侵权法']),
      tags_cn: JSON.stringify(['人工智能法', '网络中立', '数字宪政', '算法侵权']),
    },
    {
      id: 'auth-2',
      name: 'Prof. Cass R. Sunstein',
      name_cn: '卡斯·桑斯坦',
      openalex_author_id: 'A5087654321',
      orcid: '0000-0001-9243-7622',
      ssrn_id: 'ssrn-1120',
      profile_url: 'https://hls.harvard.edu/faculty/cass-r-sunstein/',
      institution_id: 'inst-1',
      tags: JSON.stringify(['行政法', '行为法经济学', '宪法', '算法规制']),
      tags_cn: JSON.stringify(['行政法', '行为法经济学', '宪法学', '助推理论']),
    },
    {
      id: 'auth-3',
      name: 'Prof. Mireille Hildebrandt',
      name_cn: '米雷耶·希尔德布兰特',
      openalex_author_id: 'A5034567890',
      orcid: '0000-0002-4521-0899',
      ssrn_id: 'ssrn-45210',
      profile_url: 'https://www.mpil.de/en/pub/research/person.cfm?id=hildebrandt',
      institution_id: 'inst-4',
      tags: JSON.stringify(['智能合约', '法律科技', '数据主权', '欧盟法']),
      tags_cn: JSON.stringify(['智能合约', '计算法学', '数据主权', '欧盟AI法案']),
    },
    {
      id: 'auth-4',
      name: 'Prof. Mark A. Lemley',
      name_cn: '马克·莱姆利',
      openalex_author_id: 'A5098765432',
      orcid: '0000-0003-2091-8841',
      ssrn_id: 'ssrn-2091',
      profile_url: 'https://law.stanford.edu/directory/mark-a-lemley/',
      institution_id: 'inst-5',
      tags: JSON.stringify(['知识产权法', '反垄断法', '生成式AI版权', '专利法']),
      tags_cn: JSON.stringify(['知识产权法', '反垄断法', 'AI训练合理使用', '专利竞争']),
    },
    {
      id: 'auth-5',
      name: 'Dr. Elena Rostova',
      name_cn: '埃琳娜·罗斯托娃',
      openalex_author_id: 'A5056781234',
      orcid: '0000-0002-8942-1100',
      ssrn_id: 'ssrn-89421',
      profile_url: 'https://www.law.ox.ac.uk/people/elena-rostova',
      institution_id: 'inst-3',
      tags: JSON.stringify(['算法侵权', '国际私法', '比较民商法']),
      tags_cn: JSON.stringify(['算法侵权', '比较侵权法', '国际私法']),
    },
    {
      id: 'auth-6',
      name: 'Prof. Timothy Wu',
      name_cn: '吴修铭 (Tim Wu)',
      openalex_author_id: 'A5067894321',
      orcid: '0000-0002-1234-5678',
      ssrn_id: 'ssrn-12345',
      profile_url: 'https://www.law.columbia.edu/faculty/timothy-wu',
      institution_id: 'inst-7',
      tags: JSON.stringify(['反垄断法', '网络中立', '平台治理', '知识产权法']),
      tags_cn: JSON.stringify(['反垄断法', '网络中立', '巨头拆分', '平台治理']),
    },
    {
      id: 'auth-7',
      name: 'Prof. Paul Craig',
      name_cn: '保罗·克雷格',
      openalex_author_id: 'A5078901234',
      orcid: '0000-0001-6789-0123',
      ssrn_id: 'ssrn-67890',
      profile_url: 'https://www.law.ox.ac.uk/people/paul-craig',
      institution_id: 'inst-3',
      tags: JSON.stringify(['比较行政法', '欧盟公法', '宪政主义']),
      tags_cn: JSON.stringify(['比较行政法', '欧盟法', '公法正当程序']),
    },
    {
      id: 'auth-8',
      name: 'Prof. Julie E. Cohen',
      name_cn: '朱莉·科恩',
      openalex_author_id: 'A5089012345',
      orcid: '0000-0003-5432-1987',
      ssrn_id: 'ssrn-54321',
      profile_url: 'https://law.yale.edu/julie-e-cohen',
      institution_id: 'inst-2',
      tags: JSON.stringify(['信息隐私法', '监控资本主义', '法律空间理论']),
      tags_cn: JSON.stringify(['信息隐私法', '数字资本主义', '平台空间理论']),
    },
  ];

  const papers: PaperTable[] = [
    {
      id: 'paper-1',
      journal_id: 'j-1',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '旗舰长篇论文',
      title: 'Standard of Care and Algorithmic Tort Liability in the Era of Generative AI',
      title_cn: '生成式AI时代的注意义务与算法侵权责任体系重构',
      abstract: 'When foundation models demonstrate autonomous content generation and advisory capabilities, traditional fault liability reasonable-person standards must evolve toward a multi-tier algorithmic duty of care model, reallocating negligence risks between model developers, deployers, and end-users.',
      abstract_cn: '当大语言模型与多模态基础模型具备高度自主的内容生成及辅助决策能力时，传统过错侵权体系中以“理性人”为基准的注意义务面临根本性适用危机。本文论证并构建了区分基础模型研发方、下游行业微调部署方以及终端使用者的三阶算法过失责任分配模型，提出动态算法信义义务与可解释性举证责任倒置标准。',
      volume: 'Vol. 138',
      issue: 'Issue 3',
      volume_issue: 'Vol. 138, Issue 3',
      published_at: '2026-08-15',
      url: 'https://harvardlawreview.org/forum/vol/138/algorithmic-tort-liability',
      canonical_url: 'https://harvardlawreview.org/forum/vol/138/algorithmic-tort-liability',
      pdf_url: 'https://harvardlawreview.org/wp-content/uploads/2026/08/algorithmic-tort-liability.pdf',
      doi: '10.1145/hlr.2026.138.3.892',
      authors_json: JSON.stringify([
        { id: 'auth-1', name: 'Prof. Jonathan Zittrain', name_cn: '乔纳森·齐特林', affiliation: '哈佛大学法学院' },
        { id: 'auth-5', name: 'Dr. Elena Rostova', name_cn: '埃琳娜·罗斯托娃', affiliation: '牛津大学法学院' },
      ]),
      journal_name_cn: '哈佛法律评论',
      recommended_citation: 'Jonathan Zittrain & Elena Rostova, Standard of Care and Algorithmic Tort Liability in the Era of Generative AI, 138 Harv. L. Rev. 892 (2026).',
      first_page: '892',
      last_page: '948',
      tags: JSON.stringify(['人工智能法', '侵权责任', '民法', '算法治理']),
      tags_cn: JSON.stringify(['人工智能法', '侵权责任', '算法过失', '注意义务']),
      reading_time: 24,
      featured: 1,
      citations_count: 86,
    },
    {
      id: 'paper-2',
      journal_id: 'j-2',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '学术长文',
      title: 'Governing Generative AI through Copyright Fair Use: A Constitutional and Economic Perspective',
      title_cn: '通过版权合理使用规制生成式人工智能：宪法学与法经济学考察',
      abstract: 'A comprehensive constitutional and economic inquiry into mass training ingestion by frontier LLMs, analyzing the boundary between market transformation and copyright exploitation under First Amendment values.',
      abstract_cn: '全面审视前沿大模型在预训练语料大规模吞吐过程中的合理使用司法判定标准。本文结合宪法第一修正案的言论与知识传播价值，以及版权法激励创新的经济学逻辑，论证非表达性“机器阅读”与市场实质性替代之间的动态边界，并主张建立法定公开数据训练补偿金制度。',
      volume: 'Vol. 135',
      issue: 'Issue 2',
      volume_issue: 'Vol. 135, Issue 2',
      published_at: '2026-08-10',
      url: 'https://yalelawjournal.org/article/generative-ai-fair-use',
      canonical_url: 'https://yalelawjournal.org/article/generative-ai-fair-use',
      pdf_url: 'https://yalelawjournal.org/pdf/vol135/generative-ai-fair-use.pdf',
      doi: '10.1086/ylj.2026.135.2.410',
      authors_json: JSON.stringify([
        { id: 'auth-4', name: 'Prof. Mark A. Lemley', name_cn: '马克·莱姆利', affiliation: '斯坦福大学法学院' },
      ]),
      journal_name_cn: '耶鲁法学杂志',
      recommended_citation: 'Mark A. Lemley, Governing Generative AI through Copyright Fair Use: A Constitutional and Economic Perspective, 135 Yale L.J. 410 (2026).',
      first_page: '410',
      last_page: '476',
      tags: JSON.stringify(['知识产权法', '反垄断法', '生成式AI版权', '宪法']),
      tags_cn: JSON.stringify(['知识产权法', '合理使用', 'AI版权', '第一修正案']),
      reading_time: 21,
      featured: 1,
      citations_count: 64,
    },
    {
      id: 'paper-3',
      journal_id: 'j-4',
      paper_type: 'journal_article',
      edition: 'online_first',
      category: 'article',
      category_cn: '欧洲法专论',
      title: 'Transnational Data Sovereignty and Conflicts of Extraterritorial Jurisdiction: A Constitutional Critique of the EU Data Act',
      title_cn: '跨国数据主权与域外管辖冲突：对欧盟《数据法案》的宪法性反思',
      abstract: 'An in-depth critique of extraterritorial reach and the Brussels Effect embodied in the EU Data Act, analyzing cross-border conflict-of-laws and judicial assistance dilemmas.',
      abstract_cn: '深入剖析欧盟《数据法案》(Data Act) 构建的长臂管辖机制与“布鲁塞尔效应”。本文针对工业设备物联网数据跨境共享、外国司法搜查令与欧盟合规义务之间的深层冲突，提出了基于多边对等管辖的跨国数据主权协调新框架。',
      volume: 'Vol. 63',
      issue: 'Issue 2',
      volume_issue: 'Vol. 63, Issue 2',
      published_at: '2026-07-28',
      url: 'https://kluwerlawonline.com/journal/cola/vol63/transnational-data',
      canonical_url: 'https://kluwerlawonline.com/journal/cola/vol63/transnational-data',
      pdf_url: 'https://kluwerlawonline.com/pdf/cmlrev-2026-transnational-data.pdf',
      doi: '10.54648/cola2026024',
      authors_json: JSON.stringify([
        { id: 'auth-3', name: 'Prof. Mireille Hildebrandt', name_cn: '米雷耶·希尔德布兰特', affiliation: '马克斯·普朗克研究所' },
      ]),
      journal_name_cn: '共同市场法律评论',
      recommended_citation: 'Mireille Hildebrandt, Transnational Data Sovereignty and Conflicts of Extraterritorial Jurisdiction, 63 C.M.L. Rev. 355 (2026).',
      first_page: '355',
      last_page: '398',
      tags: JSON.stringify(['国际法', '宪法', '数据治理', '欧盟法']),
      tags_cn: JSON.stringify(['数据主权', '欧盟法案', '长臂管辖', '冲突法']),
      reading_time: 19,
      featured: 1,
      citations_count: 52,
    },
    {
      id: 'paper-4',
      journal_id: 'j-1',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '公法长篇专论',
      title: 'Algorithmic Nudges and the Administrative State: Constitutional Frontiers of Automated Governance',
      title_cn: '算法助推与行政国家：自动化公共治理的宪法前沿',
      abstract: 'Investigating how predictive algorithmic nudging deployed in administrative agencies disrupts the non-delegation doctrine and constitutional procedural due process protections.',
      abstract_cn: '探讨行政机关在公共治理、社会福利审批与执法监督中广泛引入算法助推对正当法律程序与非授权原则构成的根本挑战。文章提出“自动化行政裁量说明理由标准”，强调算法可审计性构成现代法治国原则的实质要素。',
      volume: 'Vol. 138',
      issue: 'Issue 2',
      volume_issue: 'Vol. 138, Issue 2',
      published_at: '2026-07-15',
      url: 'https://harvardlawreview.org/vol138/algorithmic-nudges-governance',
      canonical_url: 'https://harvardlawreview.org/vol138/algorithmic-nudges-governance',
      pdf_url: 'https://harvardlawreview.org/wp-content/uploads/2026/07/algorithmic-nudges.pdf',
      doi: '10.1145/hlr.2026.138.2.550',
      authors_json: JSON.stringify([
        { id: 'auth-2', name: 'Prof. Cass R. Sunstein', name_cn: '卡斯·桑斯坦', affiliation: '哈佛大学法学院' },
      ]),
      journal_name_cn: '哈佛法律评论',
      recommended_citation: 'Cass R. Sunstein, Algorithmic Nudges and the Administrative State: Constitutional Frontiers of Automated Governance, 138 Harv. L. Rev. 550 (2026).',
      first_page: '550',
      last_page: '602',
      tags: JSON.stringify(['行政法', '宪法', '算法规制', '人工智能法']),
      tags_cn: JSON.stringify(['行政法', '正当程序', '助推理论', '自动化行政']),
      reading_time: 17,
      featured: 0,
      citations_count: 48,
    },
    {
      id: 'paper-5',
      journal_id: 'j-3',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '法理学专论',
      title: 'Smart Contracts as Incomplete Legal Orders: A Comparative Private Law Perspective',
      title_cn: '不完备法律秩序下的智能合约：比较私法学视角',
      abstract: 'Analyzing the inherent contractual incompleteness in algorithmic code execution and delineating appropriate boundaries for judicial intervention in decentralised protocols.',
      abstract_cn: '从比较民法与契约理论视角论证智能合约代码在履行中不可避免的漏洞填补逻辑与司法介入边界。指出“代码即法律”的教条无法消解情势变更原则与诚实信用义务的强制性效力。',
      volume: 'Vol. 46',
      issue: 'Issue 2',
      volume_issue: 'Vol. 46, Issue 2',
      published_at: '2026-07-02',
      url: 'https://academic.oup.com/ojls/article/smart-contracts-incomplete-orders',
      canonical_url: 'https://academic.oup.com/ojls/article/smart-contracts-incomplete-orders',
      pdf_url: 'https://academic.oup.com/ojls/article-pdf/46/2/230/smart-contracts.pdf',
      doi: '10.1093/ojls/gqae018',
      authors_json: JSON.stringify([
        { id: 'auth-3', name: 'Prof. Mireille Hildebrandt', name_cn: '米雷耶·希尔德布兰特', affiliation: '马克斯·普朗克研究所' },
      ]),
      journal_name_cn: '牛津法律研究杂志',
      recommended_citation: 'Mireille Hildebrandt, Smart Contracts as Incomplete Legal Orders, 46 Oxford J. Legal Stud. 230 (2026).',
      first_page: '230',
      last_page: '268',
      tags: JSON.stringify(['智能合约', '比较法', '民法', '法律科技']),
      tags_cn: JSON.stringify(['智能合约', '合同法', '情势变更', '比较私法']),
      reading_time: 16,
      featured: 0,
      citations_count: 39,
    },
    {
      id: 'paper-6',
      journal_id: 'j-5',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '竞争法前沿',
      title: 'Antitrust in the Ecosystem Era: Platform Envelopment and Generative AI Consolidation',
      title_cn: '生态系统时代的反垄断法：平台包络策略与生成式AI产业集中',
      abstract: 'Examining anti-competitive platform envelopment through tech conglomerate investments in leading generative AI developers, proposing modernized market definition standards.',
      abstract_cn: '分析数字巨头通过对核心大模型独角兽进行战略投资与云算力捆绑所形成的隐蔽生态壁垒。传统反垄断相关市场界定与营业额申报标准在资本嵌套时代出现失灵，亟需转向算力与数据飞轮的双重控制力标准。',
      volume: 'Vol. 78',
      issue: 'Issue 4',
      volume_issue: 'Vol. 78, Issue 4',
      published_at: '2026-06-20',
      url: 'https://www.stanfordlawreview.org/article/antitrust-ecosystem-ai',
      canonical_url: 'https://www.stanfordlawreview.org/article/antitrust-ecosystem-ai',
      pdf_url: 'https://www.stanfordlawreview.org/pdf/slr-vol78-antitrust-ecosystem-ai.pdf',
      doi: '10.2139/ssrn.4812345',
      authors_json: JSON.stringify([
        { id: 'auth-4', name: 'Prof. Mark A. Lemley', name_cn: '马克·莱姆利', affiliation: '斯坦福大学法学院' },
        { id: 'auth-6', name: 'Prof. Timothy Wu', name_cn: '吴修铭 (Tim Wu)', affiliation: '哥伦比亚大学法学院' },
      ]),
      journal_name_cn: '斯坦福法律评论',
      recommended_citation: 'Mark A. Lemley & Tim Wu, Antitrust in the Ecosystem Era: Platform Envelopment and Generative AI Consolidation, 78 Stan. L. Rev. 881 (2026).',
      first_page: '881',
      last_page: '935',
      tags: JSON.stringify(['反垄断法', '知识产权法', '平台治理']),
      tags_cn: JSON.stringify(['反垄断法', '生态竞争', '平台包络', '算力垄断']),
      reading_time: 22,
      featured: 0,
      citations_count: 57,
    },
    {
      id: 'paper-7',
      journal_id: 'j-6',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '公法评析',
      title: 'The Administrative Law of Algorithmic Discretion: Due Process in Automated Decisions',
      title_cn: '算法自由裁量权的行政法制约：自动化决策中的正当程序重构',
      abstract: 'A critical comparative study of administrative procedural standards when algorithm-assisted decision systems are adopted by common-law government departments.',
      abstract_cn: '从比较公法视角考察算法自由裁量权对行政说明理由义务、听证权利和司法审查强度的深刻重塑，提出普通法司法审查应构建涵盖数据偏见防御与算法黑箱解构的全新程序性正义框架。',
      volume: 'Vol. 85',
      issue: 'Issue 1',
      volume_issue: 'Vol. 85, Issue 1',
      published_at: '2026-06-11',
      url: 'https://www.cambridge.org/core/journals/cambridge-law-journal/article/algorithmic-discretion',
      canonical_url: 'https://www.cambridge.org/core/journals/cambridge-law-journal/article/algorithmic-discretion',
      pdf_url: 'https://www.cambridge.org/core/services/aop-cambridge-core/content/view/CLJ2026_01.pdf',
      doi: '10.1017/S000819732600012X',
      authors_json: JSON.stringify([
        { id: 'auth-7', name: 'Prof. Paul Craig', name_cn: '保罗·克雷格', affiliation: '牛津大学法学院' },
      ]),
      journal_name_cn: '剑桥法律杂志',
      recommended_citation: 'Paul Craig, The Administrative Law of Algorithmic Discretion, 85 Cambridge L.J. 92 (2026).',
      first_page: '92',
      last_page: '134',
      tags: JSON.stringify(['行政法', '比较法', '算法规制']),
      tags_cn: JSON.stringify(['行政法', '正当程序', '自由裁量', '公法审查']),
      reading_time: 18,
      featured: 0,
      citations_count: 42,
    },
    {
      id: 'paper-8',
      journal_id: 'j-7',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '宪法学专论',
      title: 'Digital Constitutionalism and the Private Governance of Transnational Speech',
      title_cn: '数字宪政主义与跨国言论的私人平台治理',
      abstract: 'Analyzing the quasi-judicial content governance systems created by global technology corporations and their interaction with universal human rights jurisprudence.',
      abstract_cn: '讨论跨国科技平台内容审核体系所催生的“私人准司法宪政”机制，探讨其对传统国际人权公约与民族国家主权言论管辖的解构与重组。',
      volume: 'Vol. 126',
      issue: 'No. 5',
      volume_issue: 'Vol. 126, No. 5',
      published_at: '2026-05-25',
      url: 'https://columbialawreview.org/article/digital-constitutionalism-transnational-speech',
      canonical_url: 'https://columbialawreview.org/article/digital-constitutionalism-transnational-speech',
      pdf_url: 'https://columbialawreview.org/wp-content/uploads/2026/05/cohen-digital-constitutionalism.pdf',
      doi: '10.52214/clr.v126i5.1092',
      authors_json: JSON.stringify([
        { id: 'auth-8', name: 'Prof. Julie E. Cohen', name_cn: '朱莉·科恩', affiliation: '耶鲁大学法学院' },
      ]),
      journal_name_cn: '哥伦比亚法律评论',
      recommended_citation: 'Julie E. Cohen, Digital Constitutionalism and the Private Governance of Transnational Speech, 126 Colum. L. Rev. 1180 (2026).',
      first_page: '1180',
      last_page: '1245',
      tags: JSON.stringify(['宪法', '国际法', '数字治理']),
      tags_cn: JSON.stringify(['数字宪政', '平台治理', '言论自由', '私人治理']),
      reading_time: 20,
      featured: 0,
      citations_count: 36,
    },
    {
      id: 'paper-9',
      journal_id: 'j-1',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '金融法专论',
      title: 'Tort Liability for Autonomous Agents in Financial High-Frequency Markets',
      title_cn: '金融高频交易市场自主智能体的侵权归责体系',
      abstract: 'Investigating causation and liability rules when autonomous algorithms trigger flash crashes or market manipulations in algorithmic trading.',
      abstract_cn: '探讨金融高频交易自主智能体诱发闪崩与系统性市场操纵时的侵权归责原则与法定因果关系推定，提出建立算法审计追踪与无过错互保补偿金机制。',
      volume: 'Vol. 138',
      issue: 'Issue 1',
      volume_issue: 'Vol. 138, Issue 1',
      published_at: '2026-05-14',
      url: 'https://harvardlawreview.org/article/autonomous-agents-financial-tort',
      canonical_url: 'https://harvardlawreview.org/article/autonomous-agents-financial-tort',
      pdf_url: 'https://harvardlawreview.org/wp-content/uploads/2026/05/financial-agents-tort.pdf',
      doi: '10.1145/hlr.2026.138.1.180',
      authors_json: JSON.stringify([
        { id: 'auth-1', name: 'Prof. Jonathan Zittrain', name_cn: '乔纳森·齐特林', affiliation: '哈佛大学法学院' },
      ]),
      journal_name_cn: '哈佛法律评论',
      recommended_citation: 'Jonathan Zittrain, Tort Liability for Autonomous Agents in Financial High-Frequency Markets, 138 Harv. L. Rev. 180 (2026).',
      first_page: '180',
      last_page: '228',
      tags: JSON.stringify(['侵权责任', '民法', '人工智能法']),
      tags_cn: JSON.stringify(['高频交易', '金融智能体', '算法侵权', '市场操纵']),
      reading_time: 15,
      featured: 0,
      citations_count: 31,
    },
    {
      id: 'paper-10',
      journal_id: 'j-2',
      paper_type: 'journal_article',
      edition: 'print',
      category: 'article',
      category_cn: '法学评论',
      title: 'AI Training on Copyrighted Works: A Market Failure or Fair Learning?',
      title_cn: '版权作品上的AI模型训练：市场失灵还是合法人性化学习？',
      abstract: 'Analyzing the transaction cost barriers in collective copyright licensing for training data and comparing machine ingestion with human cognitive acquisition.',
      abstract_cn: '从版权法激励理论和交易成本分析论证大模型“机器阅读”与人类学习的教义学等同性，否定过度延伸的许可索赔要求对基础科技研发的阻碍。',
      volume: 'Vol. 135',
      issue: 'Issue 1',
      volume_issue: 'Vol. 135, Issue 1',
      published_at: '2026-04-30',
      url: 'https://yalelawjournal.org/article/ai-training-copyright-fair-learning',
      canonical_url: 'https://yalelawjournal.org/article/ai-training-copyright-fair-learning',
      pdf_url: 'https://yalelawjournal.org/pdf/vol135/ai-training-copyright.pdf',
      doi: '10.1086/ylj.2026.135.1.95',
      authors_json: JSON.stringify([
        { id: 'auth-4', name: 'Prof. Mark A. Lemley', name_cn: '马克·莱姆利', affiliation: '斯坦福大学法学院' },
      ]),
      journal_name_cn: '耶鲁法学杂志',
      recommended_citation: 'Mark A. Lemley, AI Training on Copyrighted Works: A Market Failure or Fair Learning?, 135 Yale L.J. 95 (2026).',
      first_page: '95',
      last_page: '142',
      tags: JSON.stringify(['知识产权法', '生成式AI版权']),
      tags_cn: JSON.stringify(['版权法', '合理学习', '机器阅读', '交易成本']),
      reading_time: 17,
      featured: 0,
      citations_count: 45,
    },
  ];

  const paperAuthors: PaperAuthorTable[] = [
    { paper_id: 'paper-1', author_id: 'auth-1' },
    { paper_id: 'paper-1', author_id: 'auth-5' },
    { paper_id: 'paper-2', author_id: 'auth-4' },
    { paper_id: 'paper-3', author_id: 'auth-3' },
    { paper_id: 'paper-4', author_id: 'auth-2' },
    { paper_id: 'paper-5', author_id: 'auth-3' },
    { paper_id: 'paper-6', author_id: 'auth-4' },
    { paper_id: 'paper-6', author_id: 'auth-6' },
    { paper_id: 'paper-7', author_id: 'auth-7' },
    { paper_id: 'paper-8', author_id: 'auth-8' },
    { paper_id: 'paper-9', author_id: 'auth-1' },
    { paper_id: 'paper-10', author_id: 'auth-4' },
  ];

  const events: EventTable[] = [
    {
      id: 'evt-1',
      feed_guid: 'guid-evt-1-ylj-2026',
      title: 'Call for Papers: Yale Law Journal Symposium on Foundation Models & Tech Sovereignty',
      title_cn: '耶鲁法学杂志2026年度特刊征稿：基础模型治理与国家技术主权',
      event_category: 'call_for_papers',
      event_type: '特刊征稿 (CFP)',
      deadline: '2026-09-02',
      submission_deadline: '2026-09-02',
      deadline_type: 'fixed',
      deadline_display: '2026年9月2日 23:59 EST',
      timezone: 'America/New_York',
      is_extended: 1,
      original_deadline: '2026-08-15',
      notification_date: '2026-09-25',
      event_start_date: '2026-11-14',
      event_end_date: '2026-11-15',
      event_date: '2026-11-14 至 2026-11-15',
      host_id: 'inst-2',
      host_name: '耶鲁大学法学院《耶鲁法学杂志》编辑部',
      journal_id: 'j-2',
      location: '美国康涅狄格州纽黑文 (提供线上混合参会)',
      subject_areas: '人工智能法、数字主权、反垄断与竞争规制、宪法学',
      contact_info: 'ylj.symposium@yale.edu',
      tags_cn: JSON.stringify(['特刊征稿', '人工智能法', '技术主权', '同行评审']),
      description: 'The Yale Law Journal invites submissions for its 2026 Autumn Symposium, focusing on legal structures governing foundation AI models, extraterritorial data pipelines, and cross-border regulatory competition.',
      description_cn: '《耶鲁法学杂志》(Yale Law Journal) 正式启动2026年度学术特刊征稿。本次特刊聚焦于基础大模型规制、算力基础设施主权、跨境数据管道合规及反垄断前沿。入选论文将于特刊正刊刊发，并由编辑部资助参加纽黑文线下学术研讨会。',
      official_url: 'https://yalelawjournal.org/symposium-2026',
      submission_url: 'https://yalelawjournal.org/submissions/cfp-ai-2026',
      fee_info: '免费投递；入选学者由主办方全额报销往返国际差旅与纽黑文食宿',
      is_pinned: 1,
    },
    {
      id: 'evt-2',
      feed_guid: 'guid-evt-2-ox-tenure-2026',
      title: 'Tenure-Track Associate Professor in Law and Emerging Technologies',
      title_cn: '牛津大学法学院诚聘：法学与新兴技术方向终身教轨副教授',
      event_category: 'academic_job',
      event_type: '法学教职招聘',
      deadline: '2026-09-18',
      submission_deadline: '2026-09-18',
      deadline_type: 'fixed',
      deadline_display: '2026年9月18日 12:00 GMT',
      timezone: 'Europe/London',
      is_extended: 0,
      notification_date: '2026-10-15',
      event_start_date: '2027-01-01',
      academic_year: '2026-2027 学年',
      hiring_rank: 'Associate Professor (终身教轨副教授 / 讲座教职候选)',
      subject_areas: '人工智能法、数字财产权、比较知识产权法、普通法理论',
      host_id: 'inst-3',
      host_name: '牛津大学法学院 (Faculty of Law, University of Oxford)',
      location: '英国牛津 (St Cross Building)',
      contact_info: 'recruitment@law.ox.ac.uk',
      tags_cn: JSON.stringify(['法学教职', '终身教轨', '牛津大学', '新兴科技法']),
      description: 'The Faculty of Law, University of Oxford invites applications for an Associate Professorship in Law and Emerging Technologies in association with a College Fellowship.',
      description_cn: '牛津大学法学院携手学院 Fellow 机制全球公开招募法学与新兴技术方向终身教轨副教授。岗位要求具备优秀的法理学与私法教义学根底，并在智能系统规制、数据财产化等领域产出过顶级同行评审学术成果。提供丰厚科研启动经费与 Oxford College 配套津贴。',
      official_url: 'https://www.law.ox.ac.uk/vacancies/associate-professorship-law-technology',
      submission_url: 'https://my.corehr.com/pls/oxrecruit/erq_jobspec_version_4.display_form?p_recruitment_id=173420',
      fee_info: '年薪 £58,000 - £78,000 + 学院津贴与住房补贴',
      is_pinned: 1,
    },
    {
      id: 'evt-3',
      feed_guid: 'guid-evt-3-harvard-cfp-2026',
      title: 'Harvard Berkman Klein Center: Generative AI & Open Source Governance Workshop',
      title_cn: '哈佛大学 Berkman Klein 中心：生成式模型开源与法律治理青年学者工作坊',
      event_category: 'call_for_papers',
      event_type: '青年学者论坛',
      deadline: '2026-10-05',
      submission_deadline: '2026-10-05',
      deadline_type: 'fixed',
      deadline_display: '2026年10月5日',
      timezone: 'America/New_York',
      is_extended: 0,
      notification_date: '2026-10-20',
      event_start_date: '2026-11-28',
      event_end_date: '2026-11-29',
      event_date: '2026-11-28 至 2026-11-29',
      host_id: 'inst-1',
      host_name: '哈佛大学法学院 Berkman Klein 互联网与社会中心',
      location: '美国马萨诸塞州剑桥 (哈佛法学院 Lewis Hall)',
      subject_areas: '开源许可证、模型权重公开、反垄断与标准必要专利、开源安全责任',
      contact_info: 'bkcenter_cfp@cyber.harvard.edu',
      tags_cn: JSON.stringify(['青年学者论坛', '开源治理', '权重公开', '哈佛法学院']),
      description: 'Workshop convening early-career researchers and doctoral fellows to explore open-weights models and liability boundaries.',
      description_cn: '哈佛大学 Berkman Klein 中心面向全球博士后、青年学者开放提交工作论文草稿。研讨聚焦于开源模型权重释出后的下游侵权追索、非歧视性访问许可及国家安全审查标准。',
      official_url: 'https://cyber.harvard.edu/events/2026/open-ai-governance',
      submission_url: 'https://cyber.harvard.edu/cfp/submit',
      fee_info: '免注册费，为青年学者提供差旅资助奖学金',
      is_pinned: 0,
    },
    {
      id: 'evt-4',
      feed_guid: 'guid-evt-4-mpil-postdoc-2026',
      title: 'Max Planck Postdoctoral Research Fellowship in Transnational Data Law',
      title_cn: '马克斯·普朗克研究所：跨国数据法与比较公法博士后研究员招聘',
      event_category: 'academic_job',
      event_type: '博士后/研究员',
      deadline: '2026-10-25',
      submission_deadline: '2026-10-25',
      deadline_type: 'rolling',
      deadline_display: '2026年10月25日 (滚动评审，额满即止)',
      timezone: 'Europe/Berlin',
      is_extended: 0,
      notification_date: '2026-11-15',
      event_start_date: '2027-02-01',
      academic_year: '2026-2027 年度',
      hiring_rank: 'Postdoctoral Research Fellow (2-3 年期博士后研究员)',
      subject_areas: '跨国数据治理、比较行政法、欧盟公法体系、数字主权',
      host_id: 'inst-4',
      host_name: '马克斯·普朗克比较公法与国际法研究所 (海德堡)',
      location: '德国海德堡 (Heidelberg, Germany)',
      contact_info: 'bewerbungen@mpil.de',
      tags_cn: JSON.stringify(['博士后招聘', '马普所', '德国', '跨国数据法']),
      description: 'The Max Planck Institute for Comparative Public Law and International Law offers 2-year postdoctoral fellowships in transnational digital regulation.',
      description_cn: '德国海德堡马克斯·普朗克研究所现公开招募从事跨国数据法律秩序与自动化行政公法控制方向的博士后研究员。研究所提供浓郁国际化学术网络与充足研究经费支持，实行 TVöD Bund 标准薪资待遇。',
      official_url: 'https://www.mpil.de/en/pub/careers/postdoctoral-fellowships-2026.cfm',
      submission_url: 'https://www.mpil.de/career-portal',
      fee_info: '德国联邦公职人员 TVöD E13 薪酬标准',
      is_pinned: 0,
    },
    {
      id: 'evt-5',
      feed_guid: 'guid-evt-5-cam-cfp-2026',
      title: 'Cambridge Law Journal Annual Conference: Private Law in the Algorithmic Age',
      title_cn: '剑桥法律杂志2026年会征文：算法时代的私法教义学演进',
      event_category: 'call_for_papers',
      event_type: '国际学术研讨会',
      deadline: '2026-11-12',
      submission_deadline: '2026-11-12',
      deadline_type: 'fixed',
      deadline_display: '2026年11月12日 17:00 GMT',
      timezone: 'Europe/London',
      is_extended: 0,
      notification_date: '2026-11-30',
      event_start_date: '2027-01-15',
      event_end_date: '2027-01-16',
      event_date: '2027-01-15 至 2027-01-16',
      host_id: 'inst-6',
      host_name: '剑桥大学法学院私法中心',
      journal_id: 'j-6',
      location: '英国剑桥 (Faculty of Law, 10 West Road)',
      subject_areas: '普通法侵权教义学、不当得利、信托法、智能合约救济',
      contact_info: 'clj.conference@law.cam.ac.uk',
      tags_cn: JSON.stringify(['国际研讨会', '普通法', '私法教义', '剑桥大学']),
      description: 'Annual conference focusing on foundational private law concepts under technological pressure.',
      description_cn: '剑桥大学法学院与《剑桥法律杂志》联合主办，邀请全球私法学者共同检视因果关系、代理制度与财产返还请求权在算法交互环境下的规范适用。',
      official_url: 'https://www.cambridge.org/core/journals/cambridge-law-journal/events',
      submission_url: 'https://www.law.cam.ac.uk/events/clj-conference-submit',
      fee_info: '常规注册费 £120 / 在读博士生免费',
      is_pinned: 0,
    },
    {
      id: 'evt-6',
      feed_guid: 'guid-evt-6-columbia-job-2026',
      title: 'Columbia Law School: Open Rank Clinical & Academic Faculty in Antitrust & IP',
      title_cn: '哥伦比亚大学法学院教席招聘：反垄断法与科技知识产权方向教职',
      event_category: 'academic_job',
      event_type: '法学教职招聘',
      deadline: '2026-12-01',
      submission_deadline: '2026-12-01',
      deadline_type: 'fixed',
      deadline_display: '2026年12月1日',
      timezone: 'America/New_York',
      is_extended: 0,
      notification_date: '2026-12-20',
      event_start_date: '2027-07-01',
      academic_year: '2027-2028 学年',
      hiring_rank: 'Assistant / Associate / Full Professor (开放级别终身职)',
      subject_areas: '反垄断与竞争法、知识产权法、数字市场规制',
      host_id: 'inst-7',
      host_name: '哥伦比亚大学法学院',
      location: '美国纽约市曼哈顿 (Jerome Greene Hall)',
      contact_info: 'facultyappointments@law.columbia.edu',
      tags_cn: JSON.stringify(['法学教职', '反垄断法', '哥伦比亚法学院', '终身教职']),
      description: 'Columbia Law School invites lateral and entry-level faculty candidates in antitrust, digital platforms, and IP.',
      description_cn: '哥伦比亚大学法学院面向全球招聘反垄断法、数字平台反不正当竞争以及前沿知识产权交叉学科教职。欢迎具有法学博士学位及顶级学术论文发表记录的资深与青年学者申请。',
      official_url: 'https://www.law.columbia.edu/about/faculty-recruitment',
      submission_url: 'https://apply.interfolio.com/columbia-law-2026',
      fee_info: '具有国际竞争力的常春藤盟校薪酬包及纽约住房津贴',
      is_pinned: 0,
    },
  ];

  const bookmarks: BookmarkTable[] = [
    { id: 'bm-1', user_id: 'usr-admin', entity_type: 'paper', entity_id: 'paper-1', created_at: new Date().toISOString() },
    { id: 'bm-2', user_id: 'usr-admin', entity_type: 'author', entity_id: 'auth-1', created_at: new Date().toISOString() },
    { id: 'bm-3', user_id: 'usr-admin', entity_type: 'journal', entity_id: 'j-1', created_at: new Date().toISOString() },
    { id: 'bm-4', user_id: 'usr-admin', entity_type: 'paper', entity_id: 'paper-4', created_at: new Date().toISOString() },
    { id: 'bm-5', user_id: 'usr-scholar', entity_type: 'paper', entity_id: 'paper-2', created_at: new Date().toISOString() },
    { id: 'bm-6', user_id: 'usr-scholar', entity_type: 'paper', entity_id: 'paper-3', created_at: new Date().toISOString() },
    { id: 'bm-7', user_id: 'usr-scholar', entity_type: 'author', entity_id: 'auth-4', created_at: new Date().toISOString() },
    { id: 'bm-8', user_id: 'usr-scholar', entity_type: 'journal', entity_id: 'j-2', created_at: new Date().toISOString() },
    { id: 'bm-9', user_id: 'usr-demo', entity_type: 'paper', entity_id: 'paper-5', created_at: new Date().toISOString() },
    { id: 'bm-10', user_id: 'usr-demo', entity_type: 'author', entity_id: 'auth-3', created_at: new Date().toISOString() },
  ];

  const wishlists: WishlistTable[] = [
    {
      id: 'wish-seed-1',
      user_id: 'usr-demo',
      entity_type: '期刊',
      entity_name: 'Modern Law Review (现代法律评论)',
      status: '已收录',
      submitter: '王博士 (北京大学)',
      notes: '希望聚合 MLR 最新一期关于数字人格权与侵权法改革的全部专论目录与中文摘要。',
      votes: 16,
      response_note: '已完成数据源接入，已可在期刊架查阅。',
      created_at: '2026-08-20',
    },
    {
      id: 'wish-seed-2',
      user_id: 'usr-scholar',
      entity_type: '学者',
      entity_name: 'Prof. Cass R. Sunstein (卡斯·桑斯坦) 工作论文库',
      status: '审核中',
      submitter: '李助理教授 (清华大学)',
      notes: '追踪 SSRN 最新上传的行为法经济学与算法架构系列论稿。',
      votes: 12,
      response_note: '已对接数据管道，排期测试中。',
      created_at: '2026-08-24',
    },
    {
      id: 'wish-seed-3',
      user_id: 'usr-admin',
      entity_type: '论文',
      entity_name: 'EU AI Act Enforcement Guidelines 2026 全文深度评注',
      status: '已安排',
      submitter: '陈研究员 (社科院)',
      notes: '建议上线欧盟人工智能法案执法实施细则的逐条教义学解析。',
      votes: 24,
      response_note: '专家团队已启动撰写，预计下月刊发。',
      created_at: '2026-08-26',
    },
    {
      id: 'wish-seed-4',
      user_id: 'usr-demo',
      entity_type: '数据库/平台',
      entity_name: 'Curia 欧盟法院判例数据库检索插件',
      status: '待处理',
      submitter: '赵博士后 (中国政法大学)',
      notes: '支持一键直达 CJEU 前沿判例全文并自动生成 GB/T 7714 题录。',
      votes: 9,
      response_note: '评估技术接口可行性中。',
      created_at: '2026-08-27',
    },
  ];

  const wishlistVotes: WishlistVoteTable[] = [
    { id: 'wv-1', user_id: 'usr-admin', wishlist_id: 'wish-seed-1', created_at: new Date().toISOString() },
    { id: 'wv-2', user_id: 'usr-scholar', wishlist_id: 'wish-seed-1', created_at: new Date().toISOString() },
    { id: 'wv-3', user_id: 'usr-demo', wishlist_id: 'wish-seed-1', created_at: new Date().toISOString() },
    { id: 'wv-4', user_id: 'usr-scholar', wishlist_id: 'wish-seed-2', created_at: new Date().toISOString() },
    { id: 'wv-5', user_id: 'usr-admin', wishlist_id: 'wish-seed-3', created_at: new Date().toISOString() },
    { id: 'wv-6', user_id: 'usr-demo', wishlist_id: 'wish-seed-3', created_at: new Date().toISOString() },
  ];

  const articles: ArticleTable[] = [
    {
      id: 'art-1',
      title_cn: '生成式人工智能时代的注意义务与算法侵权责任重构',
      title_original: 'Standard of Care and Algorithmic Tort Liability in the Era of Generative AI',
      authors: JSON.stringify(['Prof. Jonathan Zittrain', 'Dr. Elena Rostova']),
      author_affiliation: '哈佛大学法学院 Berkman Klein 中心',
      journal_name: 'Harvard Law Review',
      journal_abbr: 'HLR',
      volume_issue: 'Vol. 138, No. 3',
      publish_date: '2026-06-15',
      tags: JSON.stringify(['人工智能法', '侵权责任', '民法', '算法治理']),
      abstract_cn: '本文探讨当基础模型具备自主生成内容与决策辅助能力时，传统过错侵权中的“理性人”标准如何向“算法注意义务”演进。作者提出双层过错推定框架，以平衡受害者救济与技术创新激励。',
      abstract_original: 'This Article examines the doctrinal evolution of the reasonable person standard toward algorithmic duty of care when foundational models operate with autonomous content generation and decision-support capabilities.',
      doi: '10.1145/hlr.2026.138.3.892',
      pdf_url: null,
      citations_count: 142,
      saved: 1,
      reading_time: '22 分钟',
      jurisdiction: 'US',
      featured: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'art-2',
      title_cn: '跨国数据主权与域外管辖冲突：以欧盟《数据法案》为中心的宪法反思',
      title_original: 'Transnational Data Sovereignty and Conflicts of Extraterritorial Jurisdiction: A Constitutional Critique of the EU Data Act',
      authors: JSON.stringify(['Prof. Mireille Hildebrandt']),
      author_affiliation: '布鲁塞尔自由大学 / 鲁汶大学法学院',
      journal_name: 'Common Market Law Review',
      journal_abbr: 'CML Rev',
      volume_issue: 'Vol. 63, Issue 2',
      publish_date: '2026-07-20',
      tags: JSON.stringify(['国际法', '宪法', '数据治理', '欧盟法']),
      abstract_cn: '文章深入分析欧盟《数据法案》(Data Act) 与《AI法案》在全球数据流通中所构建的长臂管辖机制。指出数据本地化立法趋势对传统威斯特伐利亚主权体系带来的解构与重塑压力。',
      abstract_original: 'This paper provides a critical constitutional analysis of extraterritorial reach under the EU Data Act, addressing the tension between cloud sovereignty and global multilateral data governance.',
      doi: '10.54648/cola2026028',
      pdf_url: null,
      citations_count: 88,
      saved: 0,
      reading_time: '18 分钟',
      jurisdiction: 'EU',
      featured: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'art-3',
      title_cn: '气候诉讼中的代际正义：比较宪法与国际人权法的新范式',
      title_original: 'Intergenerational Justice in Climate Litigation: New Paradigms in Comparative Constitutional and Human Rights Law',
      authors: JSON.stringify(['Prof. Lavanya Rajamani', 'Catherine Redgwell']),
      author_affiliation: '牛津大学法学院',
      journal_name: 'Oxford Journal of Legal Studies',
      journal_abbr: 'OJLS',
      volume_issue: 'Vol. 46, Issue 2',
      publish_date: '2026-05-10',
      tags: JSON.stringify(['环境法', '宪法', '人权法', '比较法']),
      abstract_cn: '梳理德国联邦宪法法院《气候裁决》、欧洲人权法院克利马老年妇女案及国际法院最新咨询意见，论证未出生世代作为宪法基本权利主体的法理基础与诉讼资格构造。',
      abstract_original: 'Tracing the seismic jurisprudence from the German Federal Constitutional Court and ECtHR, the authors conceptualize legal standing for future generations in transnational climate remedies.',
      doi: '10.1093/ojls/gqae014',
      pdf_url: null,
      citations_count: 210,
      saved: 1,
      reading_time: '26 分钟',
      jurisdiction: 'UK',
      featured: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: 'art-4',
      title_cn: '反垄断中的生态系统竞争与超级平台封锁行为规制',
      title_original: 'Ecosystem Competition and Foreclosure Strategies of Superplatforms in Modern Antitrust',
      authors: JSON.stringify(['Prof. Herbert Hovenkamp', 'Fiona Scott Morton']),
      author_affiliation: '宾夕法尼亚大学凯里法学院 / 耶鲁管理学院',
      journal_name: 'Yale Law Journal',
      journal_abbr: 'YLJ',
      volume_issue: 'Vol. 135, No. 7',
      publish_date: '2026-04-18',
      tags: JSON.stringify(['经济法', '反垄断', '竞争法', '数字经济']),
      abstract_cn: '数字超级平台不再依赖单一产品价格操纵，而是通过闭环应用生态与API封锁实施自我优待。本文重构传统反垄断相关市场界定方法，建立多边市场锁定效应的量化检验模型。',
      abstract_original: 'Digital mega-platforms exercise market power not through simple price gouging, but through architectural ecosystem foreclosure and API self-preferencing.',
      doi: '10.2307/ylj.2026.135.7.1984',
      pdf_url: null,
      citations_count: 165,
      saved: 0,
      reading_time: '30 分钟',
      jurisdiction: 'US',
      featured: 0,
      created_at: new Date().toISOString(),
    },
  ];

  const globalSearch: GlobalSearchTable[] = [];

  // Populate search index
  const rebuildSearch = () => {
    globalSearch.length = 0;
    for (const j of journals) {
      globalSearch.push({
        entity_type: 'journal',
        entity_id: j.id,
        title: `${j.name_cn} (${j.name})`,
        content: `${j.description || ''} ${j.institution || ''} ${j.tags || ''} ${j.tags_cn || ''}`,
      });
    }
    for (const w of wishlists) {
      globalSearch.push({
        entity_type: 'wishlist',
        entity_id: w.id,
        title: w.entity_name,
        content: `${w.notes || ''} 提议人: ${w.submitter || ''} 类型: ${w.entity_type}`,
      });
    }
    for (const p of papers) {
      globalSearch.push({
        entity_type: 'paper',
        entity_id: p.id,
        title: `${p.title} ${p.title_cn || ''}`.trim(),
        content: `${p.abstract || ''} ${p.abstract_cn || ''} ${p.tags || ''} ${p.tags_cn || ''} ${p.recommended_citation || ''}`,
      });
    }
    for (const a of authors) {
      globalSearch.push({
        entity_type: 'author',
        entity_id: a.id,
        title: `${a.name} ${a.name_cn || ''}`.trim(),
        content: `${a.ssrn_id || ''} ${a.orcid || ''} ${a.tags || ''} ${a.tags_cn || ''}`,
      });
    }
    for (const e of events) {
      globalSearch.push({
        entity_type: 'event',
        entity_id: e.id,
        title: `${e.title} ${e.title_cn || ''}`.trim(),
        content: `${e.description || ''} ${e.description_cn || ''} ${e.host_name || ''} ${e.subject_areas || ''} ${e.tags_cn || ''}`,
      });
    }
  };

  rebuildSearch();

  function createStatement(query: string, values: any[] = []): D1PreparedStatement {
    return {
      bind(...newVals: any[]) {
        return createStatement(query, newVals);
      },
      async all<T = Record<string, any>>(): Promise<{ results?: T[]; success: boolean; meta?: any }> {
        const normalized = query.trim().replace(/\s+/g, ' ');

        // 1. Users by username
        if (normalized.startsWith('SELECT id, username, password_hash, role FROM users WHERE username = ?')) {
          const u = users.find((x) => x.username === values[0]);
          return { results: (u ? [u] : []) as unknown as T[], success: true };
        }
        if (normalized.startsWith('SELECT id FROM users WHERE username = ?')) {
          const u = users.find((x) => x.username === values[0]);
          return { results: (u ? [{ id: u.id }] : []) as unknown as T[], success: true };
        }
        if (normalized.startsWith('SELECT id, username, role FROM users WHERE id = ?')) {
          const u = users.find((x) => x.id === values[0]);
          return { results: (u ? [u] : []) as unknown as T[], success: true };
        }

        // 2. Papers list
        if (normalized.includes('FROM papers p LEFT JOIN journals j ON p.journal_id = j.id') || normalized.includes('FROM papers p')) {
          const results = papers.map((p) => {
            const j = journals.find((x) => x.id === p.journal_id);
            return {
              id: p.id,
              journal_id: p.journal_id,
              paper_type: p.paper_type || 'journal_article',
              edition: p.edition || 'print',
              category: p.category || 'article',
              category_cn: p.category_cn || '学术论文',
              title: p.title,
              title_cn: p.title_cn || null,
              abstract: p.abstract,
              abstract_cn: p.abstract_cn || null,
              volume: p.volume,
              issue: p.issue,
              volume_issue: p.volume_issue,
              published_at: p.published_at,
              url: p.url,
              canonical_url: p.canonical_url || p.url,
              pdf_url: p.pdf_url || null,
              doi: p.doi || null,
              authors_json: p.authors_json || null,
              journal_name: j?.name || null,
              journal_name_cn: p.journal_name_cn || j?.name_cn || null,
              journal_name_cn_resolved: p.journal_name_cn || j?.name_cn || null,
              journal_abbr: j?.abbreviation || null,
              journal_tier: j?.tier || null,
              journal_color: j?.cover_color || null,
              recommended_citation: p.recommended_citation || null,
              first_page: p.first_page || null,
              last_page: p.last_page || null,
              tags: p.tags,
              tags_cn: p.tags_cn || null,
              reading_time: p.reading_time || 15,
              featured: p.featured || 0,
              citations_count: p.citations_count || 0,
            };
          }).sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''));
          return { results: results as unknown as T[], success: true };
        }

        // 3. Paper authors
        if (normalized.includes('FROM paper_authors pa JOIN authors a ON pa.author_id = a.id')) {
          const results = paperAuthors.map((pa) => {
            const a = authors.find((x) => x.id === pa.author_id);
            const inst = institutions.find((x) => x.id === a?.institution_id);
            return {
              paper_id: pa.paper_id,
              author_id: a?.id || '',
              author_name: a?.name || '',
              name_cn: a?.name_cn || null,
              ssrn_id: a?.ssrn_id || null,
              institution_name: inst?.name || null,
            };
          });
          return { results: results as unknown as T[], success: true };
        }

        // 4. Authors list
        if (normalized.includes('FROM authors a LEFT JOIN institutions i ON a.institution_id = i.id')) {
          const results = authors.map((a) => {
            const inst = institutions.find((x) => x.id === a.institution_id);
            return {
              id: a.id,
              name: a.name,
              name_cn: a.name_cn || null,
              openalex_author_id: a.openalex_author_id || null,
              orcid: a.orcid || null,
              ssrn_id: a.ssrn_id,
              profile_url: a.profile_url || null,
              institution_id: a.institution_id,
              tags: a.tags,
              tags_cn: a.tags_cn || null,
              institution_name: inst?.name || null,
              institution_domain: inst?.domain || null,
              institution_country: inst?.country || null,
              institution_type: inst?.type || null,
            };
          }).sort((a, b) => a.name.localeCompare(b.name));
          return { results: results as unknown as T[], success: true };
        }

        // 5. Author papers
        if (normalized.includes('FROM paper_authors pa JOIN papers p ON pa.paper_id = p.id')) {
          const results = paperAuthors.map((pa) => {
            const p = papers.find((x) => x.id === pa.paper_id);
            return {
              author_id: pa.author_id,
              paper_id: p?.id || '',
              title: p?.title || '',
              published_at: p?.published_at || '',
              url: p?.url || '',
            };
          });
          return { results: results as unknown as T[], success: true };
        }

        // 6. Events list
        if (normalized.includes('FROM events e LEFT JOIN institutions i ON e.host_id = i.id') || normalized.includes('FROM events e')) {
          const results = events.map((e) => {
            const inst = institutions.find((x) => x.id === e.host_id);
            return {
              id: e.id,
              feed_guid: e.feed_guid || null,
              title: e.title,
              title_cn: e.title_cn || null,
              event_category: e.event_category || 'call_for_papers',
              event_type: e.event_type,
              deadline: e.deadline,
              submission_deadline: e.submission_deadline || e.deadline,
              deadline_type: e.deadline_type || 'fixed',
              deadline_display: e.deadline_display || null,
              timezone: e.timezone || 'UTC',
              is_extended: e.is_extended || 0,
              original_deadline: e.original_deadline || null,
              notification_date: e.notification_date || null,
              event_start_date: e.event_start_date || null,
              event_end_date: e.event_end_date || null,
              event_date: e.event_date || null,
              host_id: e.host_id,
              host_name: e.host_name || inst?.name || null,
              host_country: inst?.country || null,
              host_domain: inst?.domain || null,
              journal_id: e.journal_id || null,
              location: e.location || null,
              academic_year: e.academic_year || null,
              hiring_rank: e.hiring_rank || null,
              subject_areas: e.subject_areas || null,
              contact_info: e.contact_info || null,
              tags_cn: e.tags_cn || null,
              description: e.description || null,
              description_cn: e.description_cn || null,
              official_url: e.official_url || null,
              submission_url: e.submission_url || null,
              fee_info: e.fee_info || null,
              is_pinned: e.is_pinned || 0,
            };
          }).sort((a, b) => {
            if (b.is_pinned !== a.is_pinned) return (b.is_pinned || 0) - (a.is_pinned || 0);
            return (a.deadline || '').localeCompare(b.deadline || '');
          });
          return { results: results as unknown as T[], success: true };
        }

        // 7. Bookmarks queries
        if (normalized.includes('FROM user_bookmarks WHERE user_id = ? AND entity_type = ? AND entity_id = ?')) {
          const bm = bookmarks.find(
            (b) => b.user_id === values[0] && b.entity_type === values[1] && b.entity_id === values[2]
          );
          return { results: (bm ? [bm] : []) as unknown as T[], success: true };
        }

        if (normalized.includes("FROM user_bookmarks WHERE user_id = ? AND entity_type = 'paper'")) {
          const bms = bookmarks.filter((b) => b.user_id === values[0] && b.entity_type === 'paper');
          return { results: bms.map((b) => ({ entity_id: b.entity_id })) as unknown as T[], success: true };
        }

        if (normalized.includes("FROM user_bookmarks WHERE user_id = ? AND entity_type = 'author'")) {
          const bms = bookmarks.filter((b) => b.user_id === values[0] && b.entity_type === 'author');
          return { results: bms.map((b) => ({ entity_id: b.entity_id })) as unknown as T[], success: true };
        }

        if (normalized.includes("FROM user_bookmarks WHERE user_id = ? AND entity_type = 'journal'")) {
          const bms = bookmarks.filter((b) => b.user_id === values[0] && b.entity_type === 'journal');
          return { results: bms.map((b) => ({ entity_id: b.entity_id })) as unknown as T[], success: true };
        }

        if (normalized.includes("FROM user_bookmarks WHERE user_id = ? AND entity_type IN ('article', 'paper')")) {
          const bms = bookmarks.filter(
            (b) => b.user_id === values[0] && (b.entity_type === 'article' || b.entity_type === 'paper')
          );
          return { results: bms.map((b) => ({ entity_id: b.entity_id })) as unknown as T[], success: true };
        }

        if (normalized.includes('FROM user_bookmarks WHERE user_id = ? AND entity_type = ? ORDER BY created_at DESC')) {
          const bms = bookmarks
            .filter((b) => b.user_id === values[0] && b.entity_type === values[1])
            .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
          return { results: bms as unknown as T[], success: true };
        }

        if (normalized.includes('FROM user_bookmarks WHERE user_id = ? ORDER BY created_at DESC')) {
          const bms = bookmarks
            .filter((b) => b.user_id === values[0])
            .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
          return { results: bms as unknown as T[], success: true };
        }

        // 7.5 Wishlist Votes queries
        if (normalized.includes('FROM wishlist_votes WHERE user_id = ? AND wishlist_id = ?')) {
          const v = wishlistVotes.find((wv) => wv.user_id === values[0] && wv.wishlist_id === values[1]);
          return { results: (v ? [v] : []) as unknown as T[], success: true };
        }

        if (normalized.includes('FROM wishlist_votes WHERE user_id = ?')) {
          const v = wishlistVotes.filter((wv) => wv.user_id === values[0]);
          return { results: v as unknown as T[], success: true };
        }

        if (normalized.includes('SELECT votes FROM wishlists WHERE id = ?') || normalized.includes('FROM wishlists WHERE id = ?')) {
          const w = wishlists.find((item) => item.id === values[0]);
          return { results: (w ? [{ votes: w.votes }] : []) as unknown as T[], success: true };
        }

        // 8. Journals list
        if (normalized.includes('FROM journals')) {
          const res = [...journals].sort((a, b) => {
            if (b.is_pinned !== a.is_pinned) return b.is_pinned - a.is_pinned;
            return a.name_cn.localeCompare(b.name_cn);
          });
          return { results: res as unknown as T[], success: true };
        }

        // 9. Wishlists list
        if (normalized.includes('FROM wishlists')) {
          const res = [...wishlists].sort((a, b) => {
            if (b.votes !== a.votes) return b.votes - a.votes;
            return (b.created_at || '').localeCompare(a.created_at || '');
          });
          return { results: res as unknown as T[], success: true };
        }

        // 10. Global Search (FTS5 / MATCH / LIKE)
        if (normalized.includes('FROM global_search')) {
          let keyword = '';
          if (values[0]) {
            keyword = String(values[0]).replace(/["%]/g, '').trim().toLowerCase();
          }

          const matched = globalSearch.filter((item) => {
            if (!keyword) return true;
            return item.title.toLowerCase().includes(keyword) || item.content.toLowerCase().includes(keyword);
          });

          const results = matched.map((m) => {
            let titleHighlighted = m.title;
            let contentHighlighted = m.content;
            if (keyword) {
              const reg = new RegExp(`(${keyword})`, 'gi');
              titleHighlighted = m.title.replace(
                reg,
                '<mark class="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">$1</mark>'
              );
              contentHighlighted = m.content.replace(
                reg,
                '<mark class="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">$1</mark>'
              );
            }
            return {
              entity_type: m.entity_type,
              entity_id: m.entity_id,
              title_highlighted: titleHighlighted,
              content_highlighted: contentHighlighted,
              title: m.title,
              content: m.content,
            };
          });

          return { results: results as unknown as T[], success: true };
        }

        // 11. Articles list
        if (normalized.includes('FROM articles')) {
          let list = [...articles];
          if (normalized.includes('jurisdiction = ?') && values[0] && values[0] !== 'All') {
            list = list.filter((a) => a.jurisdiction === values[0]);
          }
          list.sort((a, b) => (b.publish_date || '').localeCompare(a.publish_date || ''));
          return { results: list as unknown as T[], success: true };
        }

        return { results: [] as unknown as T[], success: true };
      },
      async first<T = Record<string, any>>(colName?: string): Promise<T | null> {
        const { results } = await this.all();
        if (!results || results.length === 0) return null;
        if (colName) {
          return ((results[0] as any)[colName] as T) ?? null;
        }
        return results[0] as T;
      },
      async run(): Promise<{ success: boolean; meta?: any }> {
        const normalized = query.trim().replace(/\s+/g, ' ');

        // Insert User
        if (normalized.startsWith('INSERT INTO users')) {
          const [id, username, password_hash, role] = values;
          users.push({ id, username, password_hash, role });
          return { success: true };
        }

        // Insert Bookmark
        if (normalized.startsWith('INSERT INTO user_bookmarks')) {
          const [id, user_id, entity_type, entity_id] = values;
          bookmarks.push({
            id,
            user_id,
            entity_type,
            entity_id,
            created_at: new Date().toISOString(),
          });
          return { success: true };
        }

        // Delete Bookmark
        if (normalized.startsWith('DELETE FROM user_bookmarks WHERE id = ?')) {
          const id = values[0];
          const idx = bookmarks.findIndex((b) => b.id === id);
          if (idx !== -1) bookmarks.splice(idx, 1);
          return { success: true };
        }

        // Insert Wishlist
        if (normalized.startsWith('INSERT INTO wishlists')) {
          const [id, user_id, entity_type, entity_name, status, submitter, notes] = values;
          wishlists.push({
            id,
            user_id,
            entity_type,
            entity_name,
            status,
            submitter,
            notes,
            votes: 1,
            response_note: null,
            created_at: new Date().toISOString(),
          });
          rebuildSearch();
          return { success: true };
        }

        // Insert Wishlist Vote (Simulating D1 trigger trg_d1_wv_ai)
        if (normalized.startsWith('INSERT INTO wishlist_votes')) {
          const [id, user_id, wishlist_id] = values;
          const exists = wishlistVotes.find((wv) => wv.user_id === user_id && wv.wishlist_id === wishlist_id);
          if (!exists) {
            wishlistVotes.push({
              id,
              user_id,
              wishlist_id,
              created_at: new Date().toISOString(),
            });
            // D1 Trigger: wishlists.votes = votes + 1
            const target = wishlists.find((w) => w.id === wishlist_id);
            if (target) {
              target.votes = (target.votes || 0) + 1;
            }
          }
          return { success: true };
        }

        // Delete Wishlist Vote (Simulating D1 trigger trg_d1_wv_ad)
        if (normalized.startsWith('DELETE FROM wishlist_votes')) {
          const [user_id, wishlist_id] = values;
          const idx = wishlistVotes.findIndex((wv) => wv.user_id === user_id && wv.wishlist_id === wishlist_id);
          if (idx !== -1) {
            wishlistVotes.splice(idx, 1);
            // D1 Trigger: wishlists.votes = MAX(0, votes - 1)
            const target = wishlists.find((w) => w.id === wishlist_id);
            if (target) {
              target.votes = Math.max(0, (target.votes || 0) - 1);
            }
          }
          return { success: true };
        }

        // Update Wishlist Vote
        if (normalized.startsWith('UPDATE wishlists SET votes')) {
          const [delta, id] = values;
          const target = wishlists.find((w) => w.id === id);
          if (target) {
            target.votes = Math.max(0, target.votes + Number(delta));
          }
          return { success: true };
        }

        // Migrate bookmarks: article -> paper
        if (normalized.includes("SET entity_type = 'paper' WHERE entity_type = 'article'")) {
          bookmarks.forEach((b) => {
            if (b.entity_type === 'article') b.entity_type = 'paper';
          });
          return { success: true };
        }

        // Drop table support
        if (normalized.startsWith('DROP TABLE')) {
          return { success: true };
        }

        // Insert Global Search
        if (normalized.startsWith('INSERT INTO global_search')) {
          const [entity_type, entity_id, title, content] = values;
          globalSearch.push({ entity_type, entity_id, title, content });
          return { success: true };
        }

        return { success: true };
      },
    };
  }

  return {
    prepare(query: string) {
      return createStatement(query);
    },
    async batch(statements: D1PreparedStatement[]) {
      const res = [];
      for (const s of statements) {
        res.push(await s.run());
      }
      return res;
    },
    async exec(query: string) {
      return { success: true };
    },
  };
}
