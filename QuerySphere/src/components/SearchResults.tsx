import React from 'react';
import { ExternalLink, ThumbsUp, MessageCircle, Download, Loader2 } from 'lucide-react';
import { Platform, SearchResult } from '../types';

interface SearchResultsProps {
  results: SearchResult[];
  platform: Platform;
  compact?: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

function SearchResults({ results, platform, compact = false, onLoadMore, hasMore, loading }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4 sm:py-6 text-xs sm:text-sm">
        No results from {platform}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {results.map((result) => (
        <div
          key={result.id}
          className="group border-l-2 border-transparent hover:border-black pl-3 sm:pl-4 transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-medium text-black hover:underline flex items-center gap-1.5 sm:gap-2 group-hover:gap-2 sm:group-hover:gap-3 transition-all"
              >
                {result.title}
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              {!compact && (
                <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm">{result.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 mt-2 text-gray-500 text-[10px] sm:text-xs">
            {result.score !== undefined && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {result.score}
              </span>
            )}
            {result.comments !== undefined && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {result.comments}
              </span>
            )}
            {result.downloads !== undefined && (
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {result.downloads.toLocaleString()}
              </span>
            )}
            <span>{result.date}</span>
          </div>
        </div>
      ))}
      
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="w-full py-2 sm:py-3 border border-black text-xs sm:text-sm font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Load More'
          )}
        </button>
      )}
    </div>
  );
}

export default SearchResults;