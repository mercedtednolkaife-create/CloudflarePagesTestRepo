/**
 * Academic Domain Taxonomy & Constants
 * Real Business Domain Configuration
 */

// 10 大代表性一级法学核心学科领域 (权威规整，对应数据库高频学科标签)
export const CANONICAL_LEGAL_TAGS: string[] = [
  '全部领域',
  '宪法与公法',
  '民商法学',
  '刑法与刑事司法',
  '诉讼法与司法制度',
  '法理学与法史',
  '法律与经济学',
  '知识产权法',
  '数据与科技法',
  '国际法与全球治理',
];

// 向后兼容保留 TOPIC_TAGS
export const TOPIC_TAGS: string[] = CANONICAL_LEGAL_TAGS;

// 学科标签向子标签与同义词的智能检索扩展映射表 (用于前端与 Worker SQL 联运检索)
export const TAG_SEARCH_EXPANSIONS: Record<string, string[]> = {
  '宪法与公法': ['宪法学', '宪法', '美国宪法', '行政法', '行政法学', '司法审查', '公法', '选举法与民主理论'],
  '民商法学': ['民商法学', '民事与侵权法', '侵权法', '合同法', '财产法', '公司法', '公司与证券法', '商法', '民权法', '家庭与婚姻法', '劳动法'],
  '刑法与刑事司法': ['刑法学', '刑法', '刑事诉讼法', '刑事诉讼与司法', '刑事司法', '刑事诉讼法学'],
  '诉讼法与司法制度': ['民事诉讼法', '刑事诉讼法', '诉讼法', '司法制度', '证据法', '证据法学', '司法审查'],
  '法理学与法史': ['法理学', '综合法学', '法律史', '比较法学', '法律哲学', '法律职业伦理'],
  '法律与经济学': ['法律与经济学', '反垄断法', '竞争法', '税法'],
  '知识产权法': ['知识产权法', '专利法', '著作权法', '商标法'],
  '数据与科技法': ['科技法学', '数据与科技法', '人工智能法', '数据与隐私法', '网络法'],
  '国际法与全球治理': ['国际法', '国际经济法', '人权法', '英美法系'],
};

export interface JurisdictionOption {
  id: string;
  label: string;
  shortLabel?: string;
  region: string;
}

export const JURISDICTIONS: JurisdictionOption[] = [
  { id: 'All', label: '全球全域 (All)', shortLabel: '全域', region: 'Global' },
  { id: 'US', label: '美国法圈 (US)', shortLabel: '美国', region: 'United States' },
  { id: 'UK', label: '英联邦 (UK)', shortLabel: '英国', region: 'United Kingdom' },
  { id: 'EU', label: '欧盟法 (EU)', shortLabel: '欧盟', region: 'European Union' },
  { id: 'DE', label: '德国公法 (DE)', shortLabel: '德国', region: 'Germany' },
  { id: 'FR', label: '法国私法 (FR)', shortLabel: '法国', region: 'France' },
  { id: 'International', label: '国际法庭 (Intl)', shortLabel: '国际', region: 'International Courts' },
];

export const EVENT_TYPES: string[] = [
  '全部类型',
  '征文启事 (CFP)',
  '法学教职招聘',
  '国际学术研讨会',
  '青年学者论坛',
  '闭门工作坊',
];

export const WISHLIST_TYPES: string[] = ['期刊', '学者', '论文', '数据库/平台'];
