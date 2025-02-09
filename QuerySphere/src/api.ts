import { SearchResult } from './types';

export async function searchReddit(query: string, limit = 10, after?: string): Promise<{ results: SearchResult[], nextPage: string | null }> {
  const response = await fetch(
    `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${limit}${after ? `&after=${after}` : ''}`
  );
  const data = await response.json();
  
  return {
    results: data.data.children.map((post: any) => ({
      id: post.data.id,
      title: post.data.title,
      description: post.data.selftext.slice(0, 200) + (post.data.selftext.length > 200 ? '...' : ''),
      url: `https://reddit.com${post.data.permalink}`,
      score: post.data.score,
      comments: post.data.num_comments,
      date: new Date(post.data.created_utc * 1000).toLocaleDateString(),
    })),
    nextPage: data.data.after
  };
}

export async function searchGithub(query: string, page = 1): Promise<{ results: SearchResult[], nextPage: number | null }> {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&page=${page}&per_page=10`
  );
  const data = await response.json();
  
  return {
    results: data.items.slice(0, 10).map((repo: any) => ({
      id: repo.id.toString(),
      title: repo.full_name,
      description: repo.description || 'No description available',
      url: repo.html_url,
      score: repo.stargazers_count,
      date: new Date(repo.created_at).toLocaleDateString(),
    })),
    nextPage: data.items.length === 10 ? page + 1 : null
  };
}

export async function searchStackOverflow(query: string, page = 1): Promise<{ results: SearchResult[], nextPage: number | null }> {
  const response = await fetch(
    `https://api.stackexchange.com/2.3/search?order=desc&sort=votes&intitle=${encodeURIComponent(
      query
    )}&site=stackoverflow&page=${page}&pagesize=10`
  );
  const data = await response.json();
  
  return {
    results: data.items.map((item: any) => ({
      id: item.question_id.toString(),
      title: item.title,
      description: item.tags.join(', '),
      url: item.link,
      score: item.score,
      comments: item.answer_count,
      date: new Date(item.creation_date * 1000).toLocaleDateString(),
    })),
    nextPage: !data.has_more ? null : page + 1
  };
}

export async function searchNpm(query: string, offset = 0): Promise<{ results: SearchResult[], nextPage: number | null }> {
  const response = await fetch(
    `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=10&from=${offset}`
  );
  const data = await response.json();
  
  return {
    results: data.objects.map((pkg: any) => ({
      id: pkg.package.name,
      title: pkg.package.name,
      description: pkg.package.description || 'No description available',
      url: `https://www.npmjs.com/package/${pkg.package.name}`,
      score: Math.round(pkg.score.final * 100),
      downloads: pkg.package.downloads,
      date: new Date(pkg.package.date).toLocaleDateString(),
    })),
    nextPage: data.objects.length === 10 ? offset + 10 : null
  };
}