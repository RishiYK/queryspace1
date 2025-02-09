export type Platform = 'reddit' | 'github' | 'stackoverflow' | 'npm';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  score?: number;
  comments?: number;
  date: string;
  downloads?: number;
}

export interface PaginationState {
  nextPage: string | number | null;
  loading: boolean;
}