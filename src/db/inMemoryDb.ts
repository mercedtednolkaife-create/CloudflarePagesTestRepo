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

export interface AuthorTable {
  id: string;
  name: string;
  ssrn_id: string | null;
  institution_id: string | null;
  tags: string | null;
}

export interface PaperTable {
  id: string;
  title: string;
  abstract: string | null;
  journal_id: string | null;
  published_at: string | null;
  url: string | null;
  tags: string | null;
}

export interface PaperAuthorTable {
  paper_id: string;
  author_id: string;
}

export interface EventTable {
  id: string;
  title: string;
  deadline: string;
  host_id: string | null;
  event_type: string;
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
    { id: 'auth-1', name: 'Prof. Jonathan Zittrain', ssrn_id: 'ssrn-34190', institution_id: 'inst-1', tags: JSON.stringify(['人工智能法', '互联网法律', '数字治理', '侵权法']) },
    { id: 'auth-2', name: 'Prof. Cass R. Sunstein', ssrn_id: 'ssrn-1120', institution_id: 'inst-1', tags: JSON.stringify(['行政法', '行为法经济学', '宪法', '算法规制']) },
    { id: 'auth-3', name: 'Prof. Mireille Hildebrandt', ssrn_id: 'ssrn-45210', institution_id: 'inst-4', tags: JSON.stringify(['智能合约', '法律科技', '数据主权', '欧盟法']) },
    { id: 'auth-4', name: 'Prof. Mark A. Lemley', ssrn_id: 'ssrn-2091', institution_id: 'inst-5', tags: JSON.stringify(['知识产权法', '反垄断法', '生成式AI版权', '专利法']) },
    { id: 'auth-5', name: 'Dr. Elena Rostova', ssrn_id: 'ssrn-89421', institution_id: 'inst-3', tags: JSON.stringify(['算法侵权', '国际私法', '比较民商法']) },
    { id: 'auth-6', name: 'Prof. Timothy Wu', ssrn_id: 'ssrn-12345', institution_id: 'inst-7', tags: JSON.stringify(['反垄断法', '网络中立', '平台治理', '知识产权法']) },
    { id: 'auth-7', name: 'Prof. Paul Craig', ssrn_id: 'ssrn-67890', institution_id: 'inst-3', tags: JSON.stringify(['比较行政法', '欧盟公法', '宪政主义']) },
    { id: 'auth-8', name: 'Prof. Julie E. Cohen', ssrn_id: 'ssrn-54321', institution_id: 'inst-2', tags: JSON.stringify(['信息隐私法', '监控资本主义', '法律空间理论']) },
  ];

  const papers: PaperTable[] = [
    { id: 'paper-1', title: 'Standard of Care and Algorithmic Tort Liability in the Era of Generative AI', abstract: '本文探讨当基础模型具备自主生成内容与决策辅助能力时，传统过错侵权中的“理性人”标准如何向“算法注意义务”演进，并构建多层级算法过失分配模型。', journal_id: 'j-1', published_at: '2026-08-15', url: 'https://harvardlawreview.org/forum/vol/138/algorithmic-tort-liability', tags: JSON.stringify(['人工智能法', '侵权责任', '民法', '算法治理']) },
    { id: 'paper-2', title: 'Governing Generative AI through Copyright Fair Use: A Constitutional and Economic Perspective', abstract: '全面分析基础大模型训练数据吞吐过程中的合理使用判定，探讨市场替代效应与言论自由宪法原则之间的深层张力。', journal_id: 'j-2', published_at: '2026-08-10', url: 'https://yalelawjournal.org/article/generative-ai-fair-use', tags: JSON.stringify(['知识产权法', '反垄断法', '生成式AI版权', '宪法']) },
    { id: 'paper-3', title: 'Transnational Data Sovereignty and Conflicts of Extraterritorial Jurisdiction: A Constitutional Critique of the EU Data Act', abstract: '深入剖析欧盟《数据法案》(Data Act) 构建的长臂管辖效力与“布鲁塞尔效应”，对跨境数据主权与司法协助提出宪法层面的反思框架。', journal_id: 'j-4', published_at: '2026-07-28', url: 'https://kluwerlawonline.com/journal/cola/vol63/transnational-data', tags: JSON.stringify(['国际法', '宪法', '数据治理', '欧盟法']) },
    { id: 'paper-4', title: 'Algorithmic Nudges and the Administrative State: Constitutional Frontiers of Automated Governance', abstract: '探讨行政机关在公共治理中引入算法助推对正当法律程序与非授权原则构成的根本挑战。', journal_id: 'j-1', published_at: '2026-07-15', url: 'https://harvardlawreview.org/vol138/algorithmic-nudges-governance', tags: JSON.stringify(['行政法', '宪法', '算法规制', '人工智能法']) },
    { id: 'paper-5', title: 'Smart Contracts as Incomplete Legal Orders: A Comparative Private Law Perspective', abstract: '从比较民法与契约理论视角论证智能合约代码在履行中不可避免的漏洞填补逻辑与司法介入边界。', journal_id: 'j-3', published_at: '2026-07-02', url: 'https://academic.oup.com/ojls/article/smart-contracts-incomplete-orders', tags: JSON.stringify(['智能合约', '比较法', '民法', '法律科技']) },
    { id: 'paper-6', title: 'Antitrust in the Ecosystem Era: Platform Envelopment and Generative AI Consolidation', abstract: '分析数字平台通过并购大模型初创企业形成的生态壁垒，以及传统反垄断相关市场界定方法在生成式AI时代的失灵与重构。', journal_id: 'j-5', published_at: '2026-06-20', url: 'https://www.stanfordlawreview.org/article/antitrust-ecosystem-ai', tags: JSON.stringify(['反垄断法', '知识产权法', '平台治理']) },
    { id: 'paper-7', title: 'The Administrative Law of Algorithmic Discretion: Due Process in Automated Decisions', abstract: '从比较公法视角考察算法裁量权对行政说明理由义务、听证权利和司法审查标准的影响。', journal_id: 'j-6', published_at: '2026-06-11', url: 'https://www.cambridge.org/core/journals/cambridge-law-journal/article/algorithmic-discretion', tags: JSON.stringify(['行政法', '比较法', '算法规制']) },
    { id: 'paper-8', title: 'Digital Constitutionalism and the Private Governance of Transnational Speech', abstract: '讨论跨国科技平台内容审核体系所催生的“私人准司法宪政”及其对传统国际人权公约的重塑。', journal_id: 'j-7', published_at: '2026-05-25', url: 'https://columbialawreview.org/article/digital-constitutionalism-transnational-speech', tags: JSON.stringify(['宪法', '国际法', '数字治理']) },
    { id: 'paper-9', title: 'Tort Liability for Autonomous Agents in Financial High-Frequency Markets', abstract: '探讨金融高频交易自主智能体诱发闪崩与市场操纵时的侵权归责原则与法定因果关系推定。', journal_id: 'j-1', published_at: '2026-05-14', url: 'https://harvardlawreview.org/article/autonomous-agents-financial-tort', tags: JSON.stringify(['侵权责任', '民法', '人工智能法']) },
    { id: 'paper-10', title: 'AI Training on Copyrighted Works: A Market Failure or Fair Learning?', abstract: '从版权法激励理论和交易成本分析论证大模型“机器阅读”与人类学习的教义学等同性。', journal_id: 'j-2', published_at: '2026-04-30', url: 'https://yalelawjournal.org/article/ai-training-copyright-fair-learning', tags: JSON.stringify(['知识产权法', '生成式AI版权']) },
    { id: 'paper-11', title: 'Extraterritorial Judicial Review under the Brussels Effect', abstract: '研究欧盟法院如何通过 GDPR 与数字市场法案的解释形成全球性事实管辖。', journal_id: 'j-4', published_at: '2026-04-18', url: 'https://kluwerlawonline.com/journal/cola/vol63/extraterritorial-brussels', tags: JSON.stringify(['欧盟法', '国际法', '数据治理']) },
    { id: 'paper-12', title: 'The Rule of Code vs. The Rule of Law in Decentralized Autonomous Organizations (DAOs)', abstract: '分析去中心化自治组织内部治理争端中的代码至上主义与司法救济介入机制。', journal_id: 'j-3', published_at: '2026-04-05', url: 'https://academic.oup.com/ojls/article/daos-rule-of-code', tags: JSON.stringify(['智能合约', '比较法', '法律科技']) },
    { id: 'paper-13', title: 'Revisiting the Reasonable Person Standard in Human-Robot Collaboration Accidents', abstract: '从机器人辅助医疗与自动驾驶事故切入，论证混合决策侵权责任分配。', journal_id: 'j-5', published_at: '2026-03-22', url: 'https://www.stanfordlawreview.org/article/reasonable-person-robotics', tags: JSON.stringify(['侵权责任', '民法', '人工智能法']) },
    { id: 'paper-14', title: 'Monopsony Power in Data Labor Markets and Privacy Asymmetry', abstract: '探讨平台收集用户数据行为中的买方垄断力量与隐私权作为非价格竞争要素的规制策略。', journal_id: 'j-7', published_at: '2026-03-10', url: 'https://columbialawreview.org/article/monopsony-data-labor', tags: JSON.stringify(['反垄断法', '数据治理', '平台治理']) },
    { id: 'paper-15', title: 'Constitutional Proportionality in Algorithmic Predictive Policing', abstract: '探讨算法预测警务在刑事司法中对公民隐私权与人身自由干预的比例原则审查基准。', journal_id: 'j-1', published_at: '2026-02-28', url: 'https://harvardlawreview.org/article/predictive-policing-proportionality', tags: JSON.stringify(['宪法', '算法治理', '行政法']) },
    { id: 'paper-16', title: 'Interoperability as a Remedy in Big Tech Antitrust Enforcement', abstract: '评估强制互操作性与数据可携权在恢复数字生态系统竞争活力中的救济效能。', journal_id: 'j-2', published_at: '2026-02-15', url: 'https://yalelawjournal.org/article/interoperability-antitrust-remedy', tags: JSON.stringify(['反垄断法', '平台治理']) },
    { id: 'paper-17', title: 'Cross-Border Cloud Evidence Transfers: CLOUD Act vs. EU e-Evidence Regulation', abstract: '分析美欧跨境电子取证规则冲突及对跨国企业合规带来的双重拘束困境。', journal_id: 'j-4', published_at: '2026-01-20', url: 'https://kluwerlawonline.com/journal/cola/vol63/cloud-act-e-evidence', tags: JSON.stringify(['国际法', '欧盟法', '数据治理']) },
    { id: 'paper-18', title: 'The Concept of Property in Virtual Assets and Metaverse Real Estate', abstract: '从物权法定与财产法哲学出发，探讨元宇宙虚拟空间资产的排他性权利与救济方式。', journal_id: 'j-3', published_at: '2026-01-08', url: 'https://academic.oup.com/ojls/article/property-virtual-assets', tags: JSON.stringify(['民法', '比较法', '法律科技']) },
    { id: 'paper-19', title: 'Patentability of Artificial Intelligence Inventions: The Person Having Ordinary Skill in the Art', abstract: '论证当 AI 成为通用研发工具时，“本领域普通技术人员”(PHOSITA) 认知水平的法律拟制调整。', journal_id: 'j-5', published_at: '2025-12-15', url: 'https://www.stanfordlawreview.org/article/patentability-ai-inventions', tags: JSON.stringify(['知识产权法', '人工智能法']) },
    { id: 'paper-20', title: 'Emergency Powers and Algorithmic Surveillance during Public Crises', abstract: '反思公共卫生与安全危机期间算法监控常态化对宪法紧急权力边界的侵蚀。', journal_id: 'j-6', published_at: '2025-11-30', url: 'https://www.cambridge.org/core/journals/cambridge-law-journal/article/emergency-powers-surveillance', tags: JSON.stringify(['宪法', '行政法', '算法治理']) },
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
    { paper_id: 'paper-11', author_id: 'auth-3' },
    { paper_id: 'paper-11', author_id: 'auth-7' },
    { paper_id: 'paper-12', author_id: 'auth-3' },
    { paper_id: 'paper-13', author_id: 'auth-5' },
    { paper_id: 'paper-14', author_id: 'auth-6' },
    { paper_id: 'paper-14', author_id: 'auth-8' },
    { paper_id: 'paper-15', author_id: 'auth-2' },
    { paper_id: 'paper-16', author_id: 'auth-6' },
    { paper_id: 'paper-17', author_id: 'auth-3' },
    { paper_id: 'paper-18', author_id: 'auth-5' },
    { paper_id: 'paper-19', author_id: 'auth-4' },
    { paper_id: 'paper-20', author_id: 'auth-2' },
  ];

  const events: EventTable[] = [
    { id: 'evt-1', title: '【特刊征稿】耶鲁法学杂志：全球人工智能规制与技术主权青年学者论坛', deadline: '2026-09-02', host_id: 'inst-2', event_type: '特刊征稿' },
    { id: 'evt-2', title: '2026 牛津比较公法与数字宪政高峰研讨会', deadline: '2026-09-18', host_id: 'inst-3', event_type: '国际学术研讨会' },
    { id: 'evt-3', title: '哈佛 Berkman Klein 中心：生成式模型版权与开源法律治理', deadline: '2026-10-05', host_id: 'inst-1', event_type: '青年学者论坛' },
    { id: 'evt-4', title: '马克斯·普朗克研究所：跨国数据流通与国际私法特刊', deadline: '2026-10-25', host_id: 'inst-4', event_type: '特刊征稿' },
    { id: 'evt-5', title: '剑桥大学私法中心：智能合约与普通法契约教义研讨会', deadline: '2026-11-12', host_id: 'inst-6', event_type: '国际学术研讨会' },
    { id: 'evt-6', title: '哥伦比亚法学院：数字平台反垄断与生态系统竞争前沿论坛', deadline: '2026-12-01', host_id: 'inst-7', event_type: '征文启事' },
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
        content: `${j.description || ''} ${j.institution || ''} ${j.tags || ''}`,
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
        title: p.title,
        content: `${p.abstract || ''} ${p.tags || ''}`,
      });
    }
    for (const a of authors) {
      globalSearch.push({
        entity_type: 'author',
        entity_id: a.id,
        title: a.name,
        content: `${a.ssrn_id || ''} ${a.tags || ''}`,
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
        if (normalized.includes('FROM papers p LEFT JOIN journals j ON p.journal_id = j.id')) {
          const results = papers.map((p) => {
            const j = journals.find((x) => x.id === p.journal_id);
            return {
              id: p.id,
              title: p.title,
              abstract: p.abstract,
              journal_id: p.journal_id,
              published_at: p.published_at,
              url: p.url,
              tags: p.tags,
              journal_name: j?.name || null,
              journal_name_cn: j?.name_cn || null,
              journal_abbr: j?.abbreviation || null,
              journal_tier: j?.tier || null,
              journal_color: j?.cover_color || null,
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
              ssrn_id: a.ssrn_id,
              institution_id: a.institution_id,
              tags: a.tags,
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
        if (normalized.includes('FROM events e LEFT JOIN institutions i ON e.host_id = i.id')) {
          const results = events.map((e) => {
            const inst = institutions.find((x) => x.id === e.host_id);
            return {
              id: e.id,
              title: e.title,
              deadline: e.deadline,
              event_type: e.event_type,
              host_id: e.host_id,
              host_name: inst?.name || null,
              host_country: inst?.country || null,
              host_domain: inst?.domain || null,
            };
          }).sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));
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

        if (normalized.includes('FROM user_bookmarks WHERE user_id = ? ORDER BY created_at DESC')) {
          const bms = bookmarks
            .filter((b) => b.user_id === values[0])
            .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
          return { results: bms as unknown as T[], success: true };
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

        // Update Wishlist Vote
        if (normalized.startsWith('UPDATE wishlists SET votes')) {
          const [delta, id] = values;
          const target = wishlists.find((w) => w.id === id);
          if (target) {
            target.votes = Math.max(0, target.votes + Number(delta));
          }
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
