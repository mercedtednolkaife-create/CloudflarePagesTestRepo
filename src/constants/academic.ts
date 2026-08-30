/**
 * Academic Domain Taxonomy & Constants
 * Real Business Domain Configuration
 */

export const TOPIC_TAGS: string[] = [
  '全部领域',
  '人工智能法',
  '宪法',
  '民法',
  '国际法',
  '侵权责任',
  '反垄断法',
  '生成式AI版权',
  '环境法',
  '数据治理',
  '比较法',
  '法理学',
  '仲裁法',
  '行政法',
  '智能合约',
  '法律科技',
];

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
  '特刊征稿',
  '征文启事 (CFP)',
  '国际学术研讨会',
  '青年学者论坛',
  '闭门工作坊',
];

export const WISHLIST_TYPES: string[] = ['期刊', '学者', '论文', '数据库/平台'];
