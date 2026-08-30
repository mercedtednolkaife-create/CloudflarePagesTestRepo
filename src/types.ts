export type JurisdictionType = 'US' | 'UK' | 'EU' | 'DE' | 'FR' | 'International' | 'All';

export interface Article {
  id: string;
  titleCn: string;
  titleOriginal: string;
  authors: string[];
  authorAffiliation: string;
  journalName: string;
  journalAbbr: string;
  volumeIssue: string;
  publishDate: string;
  tags: string[];
  abstractCn: string;
  abstractOriginal: string;
  doi: string;
  pdfUrl?: string;
  citationsCount: number;
  saved: boolean;
  readingTime: string;
  jurisdiction: JurisdictionType;
  featured?: boolean;
}

export interface AcademicEvent {
  id: string;
  title: string;
  host: string;
  type: '征文启事 (CFP)' | '国际研讨会' | '青年学者论坛' | '特刊征稿';
  deadline: string; // YYYY-MM-DD
  eventDate: string;
  location: string;
  tags: string[];
  description: string;
  submissionUrl: string;
  feeInfo?: string;
}

export interface Journal {
  id: string;
  nameCn: string;
  nameOriginal: string;
  abbreviation: string;
  institution: string;
  country: string;
  jurisdiction: JurisdictionType;
  category: string;
  impactRank: string;
  currentIssue: string;
  frequency: string;
  isPinned: boolean;
  coverColor: string;
  description: string;
  officialUrl: string;
  recentArticlesCount: number;
  issn?: string;
  tier?: string;
  tags?: string[];
}

export type WishlistType = '期刊' | '学者' | '论文' | '数据库/平台';

export type WishlistStatus = '待处理' | '审核中' | '已收录' | '已安排';

export interface WishlistItem {
  id: string;
  name: string;
  type: WishlistType;
  submitter: string;
  submittedAt: string;
  notes: string;
  status: WishlistStatus;
  votes: number;
  userVoted?: boolean;
  responseNote?: string;
  userId?: string;
}

export interface GlobalSearchResult {
  entityType: 'article' | 'journal' | 'wishlist' | string;
  entityId: string;
  titleHighlighted: string;
  contentHighlighted: string;
  rawTitle: string;
  rawContent: string;
}

export type NavTab = 'home' | 'journals' | 'wishlist' | 'events' | 'saved';
