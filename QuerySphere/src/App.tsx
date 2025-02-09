import React, { useState } from 'react';
import { Search, Edit as Reddit, Github, FileStackIcon as StackIcon, Package, Loader2, Globe, ArrowRight } from 'lucide-react';
import SearchResults from './components/SearchResults';
import { Platform, SearchResult, PaginationState } from './types';
import { searchReddit, searchGithub, searchStackOverflow, searchNpm } from './api';

function App() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Record<Platform, SearchResult[]>>({
    reddit: [],
    github: [],
    stackoverflow: [],
    npm: [],
  });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Record<Platform, PaginationState>>({
    reddit: { nextPage: null, loading: false },
    github: { nextPage: null, loading: false },
    stackoverflow: { nextPage: null, loading: false },
    npm: { nextPage: null, loading: false },
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const [reddit, github, stackoverflow, npm] = await Promise.all([
        searchReddit(query),
        searchGithub(query),
        searchStackOverflow(query),
        searchNpm(query),
      ]);

      setResults({
        reddit: reddit.results,
        github: github.results,
        stackoverflow: stackoverflow.results,
        npm: npm.results,
      });

      setPagination({
        reddit: { nextPage: reddit.nextPage, loading: false },
        github: { nextPage: github.nextPage, loading: false },
        stackoverflow: { nextPage: stackoverflow.nextPage, loading: false },
        npm: { nextPage: npm.nextPage, loading: false },
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async (platform: Platform) => {
    const currentPagination = pagination[platform];
    if (!currentPagination.nextPage || currentPagination.loading) return;

    setPagination(prev => ({
      ...prev,
      [platform]: { ...prev[platform], loading: true }
    }));

    try {
      let response;
      switch (platform) {
        case 'reddit':
          response = await searchReddit(query, 10, currentPagination.nextPage as string);
          break;
        case 'github':
          response = await searchGithub(query, currentPagination.nextPage as number);
          break;
        case 'stackoverflow':
          response = await searchStackOverflow(query, currentPagination.nextPage as number);
          break;
        case 'npm':
          response = await searchNpm(query, currentPagination.nextPage as number);
          break;
      }

      if (response) {
        setResults(prev => ({
          ...prev,
          [platform]: [...prev[platform], ...response.results]
        }));

        setPagination(prev => ({
          ...prev,
          [platform]: { nextPage: response.nextPage, loading: false }
        }));
      }
    } catch (error) {
      console.error(`Failed to load more ${platform} results:`, error);
    } finally {
      setPagination(prev => ({
        ...prev,
        [platform]: { ...prev[platform], loading: false }
      }));
    }
  };

  const platforms = [
    { id: 'reddit' as Platform, name: 'Reddit', icon: Reddit },
    { id: 'github' as Platform, name: 'GitHub', icon: Github },
    { id: 'stackoverflow' as Platform, name: 'Stack Overflow', icon: StackIcon },
    { id: 'npm' as Platform, name: 'NPM', icon: Package },
  ];

  if (!hasSearched) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col">
        <header className="py-4 sm:py-6 px-4 sm:px-8 border-b border-black">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-lg sm:text-xl font-light tracking-tight">QuerySphere</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-3xl mx-auto text-center px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light mb-6 sm:mb-8 tracking-tight">
              QuerySphere
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              One search, infinite possibilities. Explore content across Reddit, GitHub, Stack Overflow, and NPM in real-time.
            </p>
            
            <form onSubmit={handleSearch} className="mb-8 sm:mb-12">
              <div className="relative max-w-2xl mx-auto px-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What would you like to explore?"
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-black rounded-none text-black placeholder-gray-500 focus:outline-none text-base sm:text-lg"
                />
                <button
                  type="submit"
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-black hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-2xl mx-auto px-4">
              {platforms.map((platform) => (
                <div key={platform.id} className="flex items-center gap-2">
                  <platform.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
          <p className="mb-2">Discover knowledge across the digital sphere</p>
          <p>Built with <span className="text-red-500">❤️</span> by <a href="https://x.com/RishiY_K" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Rishi YK</a></p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <header className="py-4 sm:py-6 px-4 sm:px-8 border-b border-black mb-6 sm:mb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setHasSearched(false)}>
            <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-lg sm:text-xl font-light tracking-tight">QuerySphere</span>
          </div>
          
          <form onSubmit={handleSearch} className="w-full sm:max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across all platforms..."
                className="w-full px-3 sm:px-4 py-2 bg-white border-2 border-black rounded-none text-black placeholder-gray-500 focus:outline-none text-sm sm:text-base"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 text-black hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {platforms.map((platform) => (
              <div key={platform.id} className="flex-1">
                <div className="flex items-center gap-2 mb-4 border-b border-black pb-2">
                  <platform.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <h2 className="text-base sm:text-lg font-medium tracking-wide">{platform.name}</h2>
                </div>
                <SearchResults 
                  results={results[platform.id]} 
                  platform={platform.id}
                  compact={true}
                  onLoadMore={() => loadMore(platform.id)}
                  hasMore={!!pagination[platform.id].nextPage}
                  loading={pagination[platform.id].loading}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8 border-t border-gray-200">
        <p>Built with <span className="text-red-500">❤️</span> by <a href="https://x.com/RishiY_K" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Rishi YK</a></p>
      </footer>
    </div>
  );
}

export default App;