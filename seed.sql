PRAGMA foreign_keys = ON;

-- 清空旧数据
DELETE FROM global_search;
DELETE FROM user_bookmarks;
DELETE FROM paper_authors;
DELETE FROM papers;
DELETE FROM authors;
DELETE FROM events;
DELETE FROM institutions;
DELETE FROM wishlist_votes;
DELETE FROM wishlists;
DELETE FROM journals;
DELETE FROM users;

-- 1. Users (预置测试账号)
-- 密码明文: 'admin123' -> SHA-256: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- 密码明文: 'user123'  -> SHA-256: 6025cba6302b1f86f7b32262ab02c1f01c9ab14c62c9cc7e411b439c09bf8724
INSERT INTO users (id, username, password_hash, role) VALUES
('usr-admin', 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin'),
('usr-scholar', 'scholar', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', 'scholar'),
('usr-demo', 'demo_user', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', 'user');

-- 2. Institutions (学术机构表)
INSERT INTO institutions (id, name, domain, country, type) VALUES
('inst-1', 'Harvard Law School', 'law.harvard.edu', 'United States', 'University'),
('inst-2', 'Yale Law School', 'law.yale.edu', 'United States', 'University'),
('inst-3', 'Oxford Faculty of Law', 'law.ox.ac.uk', 'United Kingdom', 'University'),
('inst-4', 'Max Planck Institute for Comparative Public Law', 'mpil.de', 'Germany', 'Research Institute'),
('inst-5', 'Stanford Law School', 'law.stanford.edu', 'United States', 'University'),
('inst-6', 'Cambridge Faculty of Law', 'law.cam.ac.uk', 'United Kingdom', 'University'),
('inst-7', 'Columbia Law School', 'law.columbia.edu', 'United States', 'University'),
('inst-8', 'Peking University Law School', 'law.pku.edu.cn', 'China', 'University');

-- 3. Journals (期刊核心表)
INSERT INTO journals (id, name, issn, tier, tags, name_cn, abbreviation, institution, country, jurisdiction, category, impact_rank, current_issue, frequency, is_pinned, cover_color, description, official_url, recent_articles_count) VALUES
('j-1', 'Harvard Law Review', '0017-811X', 'SSCI Q1', '["综合法学", "民法", "宪法", "法哲学"]', '哈佛法律评论', 'HLR', '哈佛大学法学院学生编辑部', '美国', 'US', '综合性旗舰法学评论', 'W&L Rank #1 / SSCI Q1', 'Vol. 138, No. 3 (2026)', '每年 8 期 (月刊)', 1, 'from-amber-900 to-red-950', '全球公认引证率最高、学术影响力最大的学生主编法学期刊之一，以法哲学深度、最高法院年度述评著称。', 'https://harvardlawreview.org', 48),
('j-2', 'The Yale Law Journal', '0044-0094', 'SSCI Q1', '["综合法学", "反垄断", "经济法", "法理学"]', '耶鲁法学杂志', 'YLJ', '耶鲁大学法学院', '美国', 'US', '综合性旗舰法学评论', 'W&L Rank #2 / SSCI Q1', 'Vol. 135, No. 7 (2026)', '每年 8 期', 1, 'from-blue-900 to-indigo-950', '注重法学理论创新与跨学科批判，其设立的 "YLJ Forum" 提供即时对热点前沿判决与法案的短篇学术评述。', 'https://yalelawjournal.org', 52),
('j-3', 'Oxford Journal of Legal Studies', '0143-6503', 'SSCI Q1', '["法理学", "比较法", "环境法", "普通法"]', '牛津法律研究杂志', 'OJLS', '牛津大学出版社 / 牛津大学法学院', '英国', 'UK', '法理学与普通法研究', 'SSCI Q1 / 英国顶刊', 'Vol. 46, Issue 2 (2026)', '每年 4 期 (季刊)', 1, 'from-sky-900 to-slate-900', '英国最富盛名的同行评审法学学术刊物，以法理学、公法理论、合同侵权基础理论的高水准论证享誉国际学界。', 'https://academic.oup.com/ojls', 36),
('j-4', 'Common Market Law Review', '0165-0750', 'SSCI Q1', '["欧盟法", "国际法", "竞争法", "数据主权"]', '共同市场法律评论', 'CML Rev', 'Kluwer Law International', '荷兰', 'EU', '欧洲法旗舰刊物', 'SSCI Q1 / 欧洲权威', 'Vol. 63, Issue 2 (2026)', '每年 6 期 (双月刊)', 0, 'from-emerald-900 to-teal-950', '欧洲联盟法领域历史最悠久、权威度最高的同行评审刊物。', 'https://kluwerlawonline.com/journal/cola', 30),
('j-5', 'Stanford Law Review', '0038-9765', 'SSCI Q1', '["科技法", "知识产权", "宪法", "司法制度"]', '斯坦福法律评论', 'SLR', '斯坦福大学法学院', '美国', 'US', '综合性旗舰法学评论', 'W&L Rank #3 / SSCI Q1', 'Vol. 78, Issue 4 (2026)', '每年 6 期', 0, 'from-red-900 to-rose-950', '在科技法、知识产权与法经济学交叉领域处于全球前沿。', 'https://www.stanfordlawreview.org', 42),
('j-6', 'Cambridge Law Journal', '0008-1973', 'SSCI Q1', '["普通法", "私法", "法律史", "比较法"]', '剑桥法律杂志', 'CLJ', '剑桥大学出版社', '英国', 'UK', '普通法权威刊物', 'SSCI Q1 / 剑桥顶刊', 'Vol. 85, Issue 1 (2026)', '每年 3 期', 0, 'from-indigo-900 to-purple-950', '英国历史悠久的综合性法学刊物，聚焦判例评析与私法教义学。', 'https://www.cambridge.org/core/journals/cambridge-law-journal', 35),
('j-7', 'Columbia Law Review', '0010-1958', 'SSCI Q1', '["商法", "公司法", "证券法", "行政法"]', '哥伦比亚法律评论', 'CLR', '哥伦比亚大学法学院', '美国', 'US', '综合性旗舰法学评论', 'W&L Rank #4 / SSCI Q1', 'Vol. 126, No. 5 (2026)', '每年 8 期', 0, 'from-cyan-900 to-blue-950', '在商业组织法、资本市场监管与行政法领域拥有极高学术声誉。', 'https://columbialawreview.org', 45);

-- 4. Authors (学者画像核心表)
INSERT INTO authors (id, name, ssrn_id, institution_id, tags) VALUES
('auth-1', 'Prof. Jonathan Zittrain', 'ssrn-34190', 'inst-1', '["人工智能法", "互联网法律", "数字治理", "侵权法"]'),
('auth-2', 'Prof. Cass R. Sunstein', 'ssrn-1120', 'inst-1', '["行政法", "行为法经济学", "宪法", "算法规制"]'),
('auth-3', 'Prof. Mireille Hildebrandt', 'ssrn-45210', 'inst-4', '["智能合约", "法律科技", "数据主权", "欧盟法"]'),
('auth-4', 'Prof. Mark A. Lemley', 'ssrn-2091', 'inst-5', '["知识产权法", "反垄断法", "生成式AI版权", "专利法"]'),
('auth-5', 'Dr. Elena Rostova', 'ssrn-89421', 'inst-3', '["算法侵权", "国际私法", "比较民商法"]'),
('auth-6', 'Prof. Timothy Wu', 'ssrn-12345', 'inst-7', '["反垄断法", "网络中立", "平台治理", "知识产权法"]'),
('auth-7', 'Prof. Paul Craig', 'ssrn-67890', 'inst-3', '["比较行政法", "欧盟公法", "宪政主义"]'),
('auth-8', 'Prof. Julie E. Cohen', 'ssrn-54321', 'inst-2', '["信息隐私法", "监控资本主义", "法律空间理论"]');

-- 5. Papers (学术论文表 - 20篇高质量前沿法学文献)
INSERT INTO papers (id, title, abstract, journal_id, published_at, url, tags) VALUES
('paper-1', 'Standard of Care and Algorithmic Tort Liability in the Era of Generative AI', '本文探讨当基础模型具备自主生成内容与决策辅助能力时，传统过错侵权中的“理性人”标准如何向“算法注意义务”演进，并构建多层级算法过失分配模型。', 'j-1', '2026-08-15', 'https://harvardlawreview.org/forum/vol/138/algorithmic-tort-liability', '["人工智能法", "侵权责任", "民法", "算法治理"]'),
('paper-2', 'Governing Generative AI through Copyright Fair Use: A Constitutional and Economic Perspective', '全面分析基础大模型训练数据吞吐过程中的合理使用判定，探讨市场替代效应与言论自由宪法原则之间的深层张力。', 'j-2', '2026-08-10', 'https://yalelawjournal.org/article/generative-ai-fair-use', '["知识产权法", "反垄断法", "生成式AI版权", "宪法"]'),
('paper-3', 'Transnational Data Sovereignty and Conflicts of Extraterritorial Jurisdiction: A Constitutional Critique of the EU Data Act', '深入剖析欧盟《数据法案》(Data Act) 构建的长臂管辖效力与“布鲁塞尔效应”，对跨境数据主权与司法协助提出宪法层面的反思框架。', 'j-4', '2026-07-28', 'https://kluwerlawonline.com/journal/cola/vol63/transnational-data', '["国际法", "宪法", "数据治理", "欧盟法"]'),
('paper-4', 'Algorithmic Nudges and the Administrative State: Constitutional Frontiers of Automated Governance', '探讨行政机关在公共治理中引入算法助推对正当法律程序与非授权原则构成的根本挑战。', 'j-1', '2026-07-15', 'https://harvardlawreview.org/vol138/algorithmic-nudges-governance', '["行政法", "宪法", "算法规制", "人工智能法"]'),
('paper-5', 'Smart Contracts as Incomplete Legal Orders: A Comparative Private Law Perspective', '从比较民法与契约理论视角论证智能合约代码在履行中不可避免的漏洞填补逻辑与司法介入边界。', 'j-3', '2026-07-02', 'https://academic.oup.com/ojls/article/smart-contracts-incomplete-orders', '["智能合约", "比较法", "民法", "法律科技"]'),
('paper-6', 'Antitrust in the Ecosystem Era: Platform Envelopment and Generative AI Consolidation', '分析数字平台通过并购大模型初创企业形成的生态壁垒，以及传统反垄断相关市场界定方法在生成式AI时代的失灵与重构。', 'j-5', '2026-06-20', 'https://www.stanfordlawreview.org/article/antitrust-ecosystem-ai', '["反垄断法", "知识产权法", "平台治理"]'),
('paper-7', 'The Administrative Law of Algorithmic Discretion: Due Process in Automated Decisions', '从比较公法视角考察算法裁量权对行政说明理由义务、听证权利和司法审查标准的影响。', 'j-6', '2026-06-11', 'https://www.cambridge.org/core/journals/cambridge-law-journal/article/algorithmic-discretion', '["行政法", "比较法", "算法规制"]'),
('paper-8', 'Digital Constitutionalism and the Private Governance of Transnational Speech', '讨论跨国科技平台内容审核体系所催生的“私人准司法宪政”及其对传统国际人权公约的重塑。', 'j-7', '2026-05-25', 'https://columbialawreview.org/article/digital-constitutionalism-transnational-speech', '["宪法", "国际法", "数字治理"]'),
('paper-9', 'Tort Liability for Autonomous Agents in Financial High-Frequency Markets', '探讨金融高频交易自主智能体诱发闪崩与市场操纵时的侵权归责原则与法定因果关系推定。', 'j-1', '2026-05-14', 'https://harvardlawreview.org/article/autonomous-agents-financial-tort', '["侵权责任", "民法", "人工智能法"]'),
('paper-10', 'AI Training on Copyrighted Works: A Market Failure or Fair Learning?', '从版权法激励理论和交易成本分析论证大模型“机器阅读”与人类学习的教义学等同性。', 'j-2', '2026-04-30', 'https://yalelawjournal.org/article/ai-training-copyright-fair-learning', '["知识产权法", "生成式AI版权"]'),
('paper-11', 'Extraterritorial Judicial Review under the Brussels Effect', '研究欧盟法院如何通过 GDPR 与数字市场法案的解释形成全球性事实管辖。', 'j-4', '2026-04-18', 'https://kluwerlawonline.com/journal/cola/vol63/extraterritorial-brussels', '["欧盟法", "国际法", "数据治理"]'),
('paper-12', 'The Rule of Code vs. The Rule of Law in Decentralized Autonomous Organizations (DAOs)', '分析去中心化自治组织内部治理争端中的代码至上主义与司法救济介入机制。', 'j-3', '2026-04-05', 'https://academic.oup.com/ojls/article/daos-rule-of-code', '["智能合约", "比较法", "法律科技"]'),
('paper-13', 'Revisiting the Reasonable Person Standard in Human-Robot Collaboration Accidents', '从机器人辅助医疗与自动驾驶事故切入，论证混合决策侵权责任分配。', 'j-5', '2026-03-22', 'https://www.stanfordlawreview.org/article/reasonable-person-robotics', '["侵权责任", "民法", "人工智能法"]'),
('paper-14', 'Monopsony Power in Data Labor Markets and Privacy Asymmetry', '探讨平台收集用户数据行为中的买方垄断力量与隐私权作为非价格竞争要素的规制策略。', 'j-7', '2026-03-10', 'https://columbialawreview.org/article/monopsony-data-labor', '["反垄断法", "数据治理", "平台治理"]'),
('paper-15', 'Constitutional Proportionality in Algorithmic Predictive Policing', '探讨算法预测警务在刑事司法中对公民隐私权与人身自由干预的比例原则审查基准。', 'j-1', '2026-02-28', 'https://harvardlawreview.org/article/predictive-policing-proportionality', '["宪法", "算法治理", "行政法"]'),
('paper-16', 'Interoperability as a Remedy in Big Tech Antitrust Enforcement', '评估强制互操作性与数据可携权在恢复数字生态系统竞争活力中的救济效能。', 'j-2', '2026-02-15', 'https://yalelawjournal.org/article/interoperability-antitrust-remedy', '["反垄断法", "平台治理"]'),
('paper-17', 'Cross-Border Cloud Evidence Transfers: CLOUD Act vs. EU e-Evidence Regulation', '分析美欧跨境电子取证规则冲突及对跨国企业合规带来的双重拘束困境。', 'j-4', '2026-01-20', 'https://kluwerlawonline.com/journal/cola/vol63/cloud-act-e-evidence', '["国际法", "欧盟法", "数据治理"]'),
('paper-18', 'The Concept of Property in Virtual Assets and Metaverse Real Estate', '从物权法定与财产法哲学出发，探讨元宇宙虚拟空间资产的排他性权利与救济方式。', 'j-3', '2026-01-08', 'https://academic.oup.com/ojls/article/property-virtual-assets', '["民法", "比较法", "法律科技"]'),
('paper-19', 'Patentability of Artificial Intelligence Inventions: The Person Having Ordinary Skill in the Art', '论证当 AI 成为通用研发工具时，“本领域普通技术人员”(PHOSITA) 认知水平的法律拟制调整。', 'j-5', '2025-12-15', 'https://www.stanfordlawreview.org/article/patentability-ai-inventions', '["知识产权法", "人工智能法"]'),
('paper-20', 'Emergency Powers and Algorithmic Surveillance during Public Crises', '反思公共卫生与安全危机期间算法监控常态化对宪法紧急权力边界的侵蚀。', 'j-6', '2025-11-30', 'https://www.cambridge.org/core/journals/cambridge-law-journal/article/emergency-powers-surveillance', '["宪法", "行政法", "算法治理"]');

-- 6. Paper Authors (论文-学者关联)
INSERT INTO paper_authors (paper_id, author_id) VALUES
('paper-1', 'auth-1'),
('paper-1', 'auth-5'),
('paper-2', 'auth-4'),
('paper-3', 'auth-3'),
('paper-4', 'auth-2'),
('paper-5', 'auth-3'),
('paper-6', 'auth-4'),
('paper-6', 'auth-6'),
('paper-7', 'auth-7'),
('paper-8', 'auth-8'),
('paper-9', 'auth-1'),
('paper-10', 'auth-4'),
('paper-11', 'auth-3'),
('paper-11', 'auth-7'),
('paper-12', 'auth-3'),
('paper-13', 'auth-5'),
('paper-14', 'auth-6'),
('paper-14', 'auth-8'),
('paper-15', 'auth-2'),
('paper-16', 'auth-6'),
('paper-17', 'auth-3'),
('paper-18', 'auth-5'),
('paper-19', 'auth-4'),
('paper-20', 'auth-2');

-- 7. Events (学术活动表)
INSERT INTO events (id, title, deadline, host_id, event_type) VALUES
('evt-1', '【特刊征稿】耶鲁法学杂志：全球人工智能规制与技术主权青年学者论坛', '2026-09-02', 'inst-2', '特刊征稿'),
('evt-2', '2026 牛津比较公法与数字宪政高峰研讨会', '2026-09-18', 'inst-3', '国际学术研讨会'),
('evt-3', '哈佛 Berkman Klein 中心：生成式模型版权与开源法律治理', '2026-10-05', 'inst-1', '青年学者论坛'),
('evt-4', '马克斯·普朗克研究所：跨国数据流通与国际私法特刊', '2026-10-25', 'inst-4', '特刊征稿'),
('evt-5', '剑桥大学私法中心：智能合约与普通法契约教义研讨会', '2026-11-12', 'inst-6', '国际学术研讨会'),
('evt-6', '哥伦比亚法学院：数字平台反垄断与生态系统竞争前沿论坛', '2026-12-01', 'inst-7', '征文启事');

-- 8. User Bookmarks (多用户个性化书签数据)
INSERT INTO user_bookmarks (id, user_id, entity_type, entity_id) VALUES
('bm-1', 'usr-admin', 'paper', 'paper-1'),
('bm-2', 'usr-admin', 'author', 'auth-1'),
('bm-3', 'usr-admin', 'journal', 'j-1'),
('bm-4', 'usr-admin', 'paper', 'paper-4'),
('bm-5', 'usr-scholar', 'paper', 'paper-2'),
('bm-6', 'usr-scholar', 'paper', 'paper-3'),
('bm-7', 'usr-scholar', 'author', 'auth-4'),
('bm-8', 'usr-scholar', 'journal', 'j-2'),
('bm-9', 'usr-demo', 'paper', 'paper-5'),
('bm-10', 'usr-demo', 'author', 'auth-3');

-- 9. Wishlists (公开展示的心愿单数据 - 向所有用户公开)
INSERT INTO wishlists (id, user_id, entity_type, entity_name, status, submitter, notes, votes, response_note) VALUES
('wish-seed-1', 'usr-demo', '期刊', 'Modern Law Review (现代法律评论)', '已收录', '王博士 (北京大学)', '希望聚合 MLR 最新一期关于数字人格权与侵权法改革的全部专论目录与中文摘要。', 16, '已完成数据源接入，已可在期刊架查阅。'),
('wish-seed-2', 'usr-scholar', '学者', 'Prof. Cass R. Sunstein (卡斯·桑斯坦) 工作论文库', '审核中', '李助理教授 (清华大学)', '追踪 SSRN 最新上传的行为法经济学与算法架构系列论稿。', 12, '已对接数据管道，排期测试中。'),
('wish-seed-3', 'usr-admin', '论文', 'EU AI Act Enforcement Guidelines 2026 全文深度评注', '已安排', '陈研究员 (社科院)', '建议上线欧盟人工智能法案执法实施细则的逐条教义学解析。', 24, '专家团队已启动撰写，预计下月刊发。'),
('wish-seed-4', 'usr-demo', '数据库/平台', 'Curia 欧盟法院判例数据库检索插件', '待处理', '赵博士后 (中国政法大学)', '支持一键直达 CJEU 前沿判例全文并自动生成 GB/T 7714 题录。', 9, '评估技术接口可行性中。');

-- 10. Wishlist Votes (心愿单投票记录)
INSERT INTO wishlist_votes (id, user_id, wishlist_id) VALUES
('wv-1', 'usr-admin', 'wish-seed-1'),
('wv-2', 'usr-scholar', 'wish-seed-1'),
('wv-3', 'usr-demo', 'wish-seed-1'),
('wv-4', 'usr-scholar', 'wish-seed-2'),
('wv-5', 'usr-admin', 'wish-seed-3'),
('wv-6', 'usr-demo', 'wish-seed-3');

-- 11. Global Search 索引初始化
INSERT INTO global_search (entity_type, entity_id, title, content)
SELECT 'journal', id, name_cn || ' (' || name || ')', description || ' ' || institution || ' ' || tags FROM journals;

INSERT INTO global_search (entity_type, entity_id, title, content)
SELECT 'wishlist', id, entity_name, notes || ' 提议人: ' || submitter FROM wishlists;

INSERT INTO global_search (entity_type, entity_id, title, content)
SELECT 'paper', id, title, abstract || ' ' || tags FROM papers;

INSERT INTO global_search (entity_type, entity_id, title, content)
SELECT 'author', id, name, ssrn_id || ' ' || tags FROM authors;
