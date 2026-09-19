import { Article } from '../types';

export function generateBluebook(article: Article): string {
  const authorStr = article.authors.join(' & ');
  const volPart = article.volumeIssue.replace('Vol. ', '').replace('No. ', '').replace('Issue ', '');
  const pagePart = article.firstPage ? ` ${article.firstPage}` : '';
  const year = article.publishDate ? article.publishDate.slice(0, 4) : '2026';
  return `${authorStr}, ${article.titleOriginal}, ${volPart} ${article.journalAbbr}${pagePart} (${year}). DOI: ${article.doi}`;
}

export function generateGBT7714(article: Article): string {
  const authors = article.authors.join(', ');
  const year = article.publishDate ? article.publishDate.slice(0, 4) : '2026';
  const pagePart = article.firstPage
    ? article.lastPage
      ? `: ${article.firstPage}-${article.lastPage}`
      : `: ${article.firstPage}`
    : '';
  return `[1] ${authors}. ${article.titleOriginal} [J]. ${article.journalName}, ${year}, ${article.volumeIssue}${pagePart}. DOI: ${article.doi}.`;
}

export function generateBibTeX(article: Article): string {
  const firstAuthor = article.authors[0]?.split(' ').pop() || 'LegalStudy';
  const year = article.publishDate ? article.publishDate.slice(0, 4) : '2026';
  const pagesPart = article.firstPage
    ? article.lastPage
      ? `\n  pages = {${article.firstPage}--${article.lastPage}},`
      : `\n  pages = {${article.firstPage}},`
    : '';
  return `@article{${firstAuthor.toLowerCase()}${year},
  author = {${article.authors.join(' and ')}},
  title = {${article.titleOriginal}},
  journal = {${article.journalName}},
  volume = {${article.volumeIssue}},${pagesPart}
  year = {${year}},
  doi = {${article.doi}}
}`;
}
