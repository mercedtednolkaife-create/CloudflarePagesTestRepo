PRAGMA foreign_keys = ON;

-- 清空旧数据
DELETE FROM global_search;
DELETE FROM wishlists;
DELETE FROM journals;
DELETE FROM articles;
DELETE FROM academic_events;

-- 1. 插入 Journals 核心占位测试数据
INSERT INTO journals (id, name, issn, tier, tags, name_cn, abbreviation, institution, country, jurisdiction, category, impact_rank, current_issue, frequency, is_pinned, cover_color, description, official_url, recent_articles_count) VALUES
('j-1', 'Harvard Law Review', '0017-811X', 'SSCI Q1', '["综合法学", "民法", "宪法", "法哲学"]', '哈佛法律评论', 'HLR', '哈佛大学法学院学生编辑部', '美国', 'US', '综合性旗舰法学评论', 'W&L Rank #1 / SSCI Q1', 'Vol. 138, No. 3 (2026)', '每年 8 期 (月刊)', 1, 'from-amber-900 to-red-950', '全球公认引证率最高、学术影响力最大的学生主编法学期刊之一，以法哲学深度、最高法院年度述评著称。', 'https://harvardlawreview.org', 48),
('j-2', 'The Yale Law Journal', '0044-0094', 'SSCI Q1', '["综合法学", "反垄断", "经济法", "法理学"]', '耶鲁法学杂志', 'YLJ', '耶鲁大学法学院', '美国', 'US', '综合性旗舰法学评论', 'W&L Rank #2 / SSCI Q1', 'Vol. 135, No. 7 (2026)', '每年 8 期', 1, 'from-blue-900 to-indigo-950', '注重法学理论创新与跨学科批判，其设立的 "YLJ Forum" 提供即时对热点前沿判决与法案的短篇学术评述。', 'https://yalelawjournal.org', 52),
('j-3', 'Oxford Journal of Legal Studies', '0143-6503', 'SSCI Q1', '["法理学", "比较法", "环境法", "普通法"]', '牛津法律研究杂志', 'OJLS', '牛津大学出版社 / 牛津大学法学院', '英国', 'UK', '法理学与普通法研究', 'SSCI Q1 / 英国顶刊', 'Vol. 46, Issue 2 (2026)', '每年 4 期 (季刊)', 1, 'from-sky-900 to-slate-900', '英国最富盛名的同行评审法学学术刊物，以法理学、公法理论、合同侵权基础理论的高水准论证享誉国际学界。', 'https://academic.oup.com/ojls', 36);

-- 2. 插入 Wishlists 占位测试数据
INSERT INTO wishlists (id, user_id, entity_type, entity_name, status, submitter, notes, votes, response_note) VALUES
('wish-seed-1', 'usr-test-1', '期刊', 'Modern Law Review (现代法律评论)', '已收录', '王博士 (北京大学)', '希望聚合 MLR 最新一期关于数字人格权与侵权法改革的全部专论目录与中文摘要。', 12, '已完成数据源接入，已可在期刊架查阅。'),
('wish-seed-2', 'usr-test-2', '学者', 'Prof. Cass R. Sunstein (卡斯·桑斯坦) 工作论文库', '审核中', '李助理教授 (清华大学)', '追踪 SSRN 最新上传的行为法经济学与算法架构系列论稿。', 8, '已对接数据管道，排期测试中。');

-- 3. 插入 Articles 占位测试数据
INSERT INTO articles (id, title_cn, title_original, authors, author_affiliation, journal_name, journal_abbr, volume_issue, publish_date, tags, abstract_cn, abstract_original, doi, citations_count, saved, reading_time, jurisdiction, featured) VALUES
('art-1', '生成式人工智能时代的注意义务与算法侵权责任重构', 'Standard of Care and Algorithmic Tort Liability in the Era of Generative AI', '["Prof. Jonathan Zittrain", "Dr. Elena Rostova"]', '哈佛大学法学院 Berkman Klein 中心', 'Harvard Law Review', 'HLR', 'Vol. 138, No. 3', '2026-06-15', '["人工智能法", "侵权责任", "民法", "算法治理"]', '本文探讨当基础模型具备自主生成内容与决策辅助能力时，传统过错侵权中的“理性人”标准如何向“算法注意义务”演进。', 'This Article examines the doctrinal evolution of the reasonable person standard toward algorithmic duty of care when foundational models operate autonomously.', '10.1145/hlr.2026.138.3.892', 142, 1, '22 分钟', 'US', 1),
('art-2', '跨国数据主权与域外管辖冲突：以欧盟《数据法案》为中心的宪法反思', 'Transnational Data Sovereignty and Conflicts of Extraterritorial Jurisdiction: A Constitutional Critique of the EU Data Act', '["Prof. Mireille Hildebrandt"]', '布鲁塞尔自由大学 / 鲁汶大学法学院', 'Common Market Law Review', 'CML Rev', 'Vol. 63, Issue 2', '2026-07-20', '["国际法", "宪法", "数据治理", "欧盟法"]', '文章深入分析欧盟《数据法案》(Data Act) 与《AI法案》在全球数据流通中所构建的长臂管辖机制。', 'This paper provides a critical constitutional analysis of extraterritorial reach under the EU Data Act.', '10.54648/cola2026028', 88, 0, '18 分钟', 'EU', 1);

-- 4. 插入 Academic Events 占位测试数据
INSERT INTO academic_events (id, title, host, type, deadline, event_date, location, tags, description, submission_url, fee_info) VALUES
('evt-1', '【特刊征稿】耶鲁法学院：全球人工智能法律规制与技术主权青年学者论坛', '耶鲁法学院信息社会项目 (ISP)', '特刊征稿', '2026-09-02', '2026-11-15', '美国·纽黑文 / 线上双轨', '["人工智能法", "青年学者", "SSCI特刊"]', '征集关于基础大模型治理、算法透明度、跨境算力监管方向的高质量全英文稿件。', 'https://law.yale.edu/isp/cfp-2026-ai', '入选者提供全额差旅补助');

-- 5. 初始化 Global Search 检索索引
INSERT INTO global_search (entity_type, entity_id, title, content)
SELECT 'article', id, title_cn || ' | ' || title_original, abstract_cn || ' ' || authors || ' ' || journal_name || ' ' || tags FROM articles;

INSERT INTO global_search (entity_type, entity_id, title, content)
SELECT 'journal', id, name_cn || ' (' || name || ')', description || ' ' || institution || ' ' || tags FROM journals;

INSERT INTO global_search (entity_type, entity_id, title, content)
SELECT 'wishlist', id, entity_name, notes || ' 提议人: ' || submitter FROM wishlists;
