export type JurisdictionType = 'US' | 'UK' | 'EU' | 'DE' | 'FR' | 'International' | 'All';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  total?: number;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'scholar' | 'user';
}

export interface Institution {
  id: string;
  name: string;
  domain: string | null;
  country: string | null;
  type: string | null;
}

export interface Author {
  id: string;
  name: string;
  ssrnId: string | null;
  ssrnUrl?: string | null;
  institutionId: string | null;
  institution: Institution | null;
  tags: string[];
  papersCount?: number;
  papers?: { id: string; title: string; publishedAt: string; url: string }[];
  isBookmarked?: boolean;
}

export interface PaperAuthorDetail {
  id: string;
  name: string;
  ssrnId: string | null;
  institution: string | null;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  journalId: string | null;
  journalName: string;
  journalNameCn?: string;
  journalAbbr: string;
  journalTier?: string;
  journalColor?: string;
  volume?: string;
  issue?: string;
  volumeIssue?: string;
  publishedAt: string;
  url: string;
  tags: string[];
  authors: string[];
  authorsDetail?: PaperAuthorDetail[];
  isBookmarked?: boolean;
}

export interface BookmarkItem {
  id: string;
  user_id: string;
  entity_type: 'paper' | 'author' | 'journal' | 'article' | 'event';
  entity_id: string;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  eventType: string;
  hostId: string | null;
  hostName: string;
  hostCountry: string;
  hostDomain: string;
  daysRemaining: number;
  isUrgent: boolean;
  isExpired: boolean;
  statusText: string;
}

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
  type: '征文启事 (CFP)' | '国际研讨会' | '青年学者论坛' | '特刊征稿' | string;
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
  entityType: 'article' | 'paper' | 'author' | 'journal' | 'wishlist' | string;
  entityId: string;
  titleHighlighted: string;
  contentHighlighted: string;
  rawTitle: string;
  rawContent: string;
}

export type NavTab = 'papers' | 'home' | 'journals' | 'authors' | 'events' | 'bookmarks' | 'saved' | 'wishlist' | 'login';
