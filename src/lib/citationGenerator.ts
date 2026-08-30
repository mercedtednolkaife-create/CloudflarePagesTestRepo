import { Article } from '../types';

export function generateBluebook(article: Article): string {
  const authorStr = article.authors.join(' & ');
  return `${authorStr}, ${article.titleOriginal}, ${article.volumeIssue.replace('Vol. ', '').replace('No. ', '').replace('Issue ', '')} ${article.journalAbbr} (2026). DOI: ${article.doi}`;
}

export function generateGBT7714(article: Article): string {
  const authors = article.authors.join(', ');
  return `[1] ${authors}. ${article.titleOriginal} [J]. ${article.journalName}, 2026, ${article.volumeIssue}. DOI: ${article.doi}.`;
}

export function generateBibTeX(article: Article): string {
  const firstAuthor = article.authors[0]?.split(' ').pop() || 'LegalStudy';
  return `@article{${firstAuthor.toLowerCase()}2026,
  author = {${article.authors.join(' and ')}},
  title = {${article.titleOriginal}},
  journal = {${article.journalName}},
  volume = {${article.volumeIssue}},
  year = {2026},
  doi = {${article.doi}}
}`;
}
