export interface ExaHighlights {
  numSentences?: number;
  highlightsPerUrl?: number;
  query?: string;
}

export interface ExaSummary {
  query?: string;
}

export interface ExaExtras {
  links?: number;
  imageLinks?: number;
}

export interface ExaContents {
  text?: boolean;
  highlights?: ExaHighlights;
  summary?: ExaSummary;
  livecrawl?: 'always' | 'fallback' | 'never';
  livecrawlTimeout?: number;
  subpages?: number;
  subpageTarget?: 'sources' | 'links';
  extras?: ExaExtras;
}

export interface ExaSearchParameters {
  query: string;
  useAutoprompt?: boolean;
  type?: 'auto' | 'keyword' | 'neural' | 'magic';
  category?: string;
  numResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  startCrawlDate?: string;
  endCrawlDate?: string;
  startPublishedDate?: string;
  endPublishedDate?: string;
  includeText?: string[];
  excludeText?: string[];
  contents?: ExaContents;
}

// API response interfaces
export interface ExaResultText {
  content: string;
  highlights?: string[];
}

export interface ExaResultExtras {
  links?: string[];
  imageLinks?: string[];
}

export interface ExaSearchResult {
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  text?: ExaResultText;
  summary?: string;
  extras?: ExaResultExtras;
}

export interface ExaSearchResponse {
  results: ExaSearchResult[];
  autoprompt?: string;
  count: number;
}