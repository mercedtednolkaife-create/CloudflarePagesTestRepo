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
  nameCn?: string;
  openalexAuthorId?: string | null;
  orcid?: string | null;
  ssrnId: string | null;
  ssrnUrl?: string | null;
  profileUrl?: string | null;
  institutionId: string | null;
  institution: Institution | null;
  tags: string[];
  tagsCn?: string[];
  papersCount?: number;
  papers?: { id: string; title: string; publishedAt: string; url: string }[];
  isBookmarked?: boolean;
}

export interface PaperAuthorDetail {
  id: string;
  name: string;
  nameCn?: string;
  ssrnId: string | null;
  institution: string | null;
}

export interface Paper {
  id: string;
  title: string;
  titleCn?: string;
  abstract: string;
  abstractCn?: string;
  journalId: string | null;
  journalName: string;
  journalNameCn?: string;
  journalAbbr: string;
  journalTier?: string;
  journalColor?: string;
  paperType?: string;
  edition?: 'print' | 'online' | string;
  category?: string;
  categoryCn?: string;
  volume?: string;
  issue?: string;
  volumeIssue?: string;
  publicationYear?: string;
  publishedAt: string;
  url: string;
  canonicalUrl?: string;
  pdfUrl?: string | null;
  doi?: string | null;
  recommendedCitation?: string;
  firstPage?: string;
  lastPage?: string;
  tags: string[];
  tagsCn?: string[];
  readingTime?: number;
  featured?: boolean | number;
  citationsCount?: number;
  authors: string[];
  authorsDetail?: PaperAuthorDetail[];
  authorsJson?: { name: string; name_cn?: string; affiliation?: string }[];
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
  titleCn?: string;
  feedGuid?: string;
  eventCategory: 'call_for_papers' | 'academic_job' | string;
  eventType: string;
  deadline: string; // YYYY-MM-DD or display
  deadlineType?: 'fixed' | 'rolling' | 'tbd';
  deadlineDisplay?: string;
  timezone?: string;
  isExtended?: boolean | number;
  originalDeadline?: string;
  notificationDate?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventDate?: string;
  hostId: string | null;
  hostName: string;
  hostCountry: string;
  hostDomain: string;
  journalId?: string | null;
  location?: string;
  academicYear?: string;
  hiringRank?: string;
  subjectAreas?: string;
  contactInfo?: string;
  tagsCn?: string[];
  description?: string;
  descriptionCn?: string;
  officialUrl?: string;
  submissionUrl?: string;
  feeInfo?: string | null;
  isPinned?: boolean | number;
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
  firstPage?: string;
  lastPage?: string;
  citationsCount: number;
  saved: boolean;
  readingTime: string;
  jurisdiction: JurisdictionType;
  featured?: boolean;
}

export interface AcademicEvent {
  id: string;
  title: string;
  titleCn?: string;
  host: string;
  eventCategory?: 'call_for_papers' | 'academic_job' | string;
  type: '征文启事 (CFP)' | '国际研讨会' | '青年学者论坛' | '特刊征稿' | '法学教职' | '博士后/研究员' | '访问学者' | string;
  deadline: string; // YYYY-MM-DD
  deadlineType?: 'fixed' | 'rolling' | 'tbd';
  deadlineDisplay?: string;
  isExtended?: boolean | number;
  originalDeadline?: string;
  notificationDate?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventDate?: string;
  academicYear?: string;
  hiringRank?: string;
  subjectAreas?: string;
  journalId?: string | null;
  location: string;
  tags: string[];
  tagsCn?: string[];
  description: string;
  descriptionCn?: string;
  submissionUrl: string;
  officialUrl?: string;
  feeInfo?: string;
  daysRemaining?: number;
  isUrgent?: boolean;
  isExpired?: boolean;
  statusText?: string;
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
  issnPrint?: string;
  issnElectronic?: string;
  tier?: string;
  tags?: string[];
  tagsCn?: string[];
  sourceType?: string;
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
