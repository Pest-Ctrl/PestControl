export interface SyncedCommitInput {
  CommitID: string;
  RepoID: string;
  Message: string;
  AuthorName: string;
  AuthorEmail: string;
  CommittedAt: string;
  URL: string;
}

/**
 * Fetches GitHub API endpoint, falling back to unauthenticated request on 401
 * if a stored token has expired for a public repository.
 */
async function fetchGitHubWithFallback(url: string, token?: string | null): Promise<Response> {
  const baseHeaders: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (token) {
    const authRes = await fetch(url, {
      headers: { ...baseHeaders, Authorization: `Bearer ${token}` },
    });
    if (authRes.status !== 401) {
      return authRes;
    }
  }

  return fetch(url, { headers: baseHeaders });
}

/**
 * Fetches all commits across all branches of a GitHub repository, deduplicated by SHA.
 */
export async function fetchAllRepoCommits(
  owner: string,
  name: string,
  repoId: string,
  token?: string | null,
  defaultBranch: string = 'main'
): Promise<{ commits: SyncedCommitInput[]; error?: string; status?: number }> {
  // 1. Fetch repository branches so feature/bugfix commits are included
  let branchNames: string[] = [defaultBranch || 'main'];
  try {
    const branchesRes = await fetchGitHubWithFallback(
      `https://api.github.com/repos/${owner}/${name}/branches?per_page=100`,
      token
    );
    if (branchesRes.ok) {
      const branchesData = await branchesRes.json();
      if (Array.isArray(branchesData) && branchesData.length > 0) {
        branchNames = branchesData.map((b: any) => b.name).filter(Boolean);
      }
    }
  } catch {
    // Fall back to defaultBranch
  }

  // Ensure default branch is processed first
  const orderedBranches = Array.from(new Set([defaultBranch || 'main', ...branchNames]));
  const commitMap = new Map<string, SyncedCommitInput>();

  for (const branch of orderedBranches) {
    let page = 1;
    while (page <= 10) {
      const url = `https://api.github.com/repos/${owner}/${name}/commits?sha=${encodeURIComponent(
        branch
      )}&per_page=100&page=${page}`;
      const ghRes = await fetchGitHubWithFallback(url, token);

      if (!ghRes.ok) {
        if (branch === orderedBranches[0] && page === 1) {
          const errData = await ghRes.json().catch(() => ({}));
          return {
            commits: [],
            error: errData.message || `Failed to fetch commits from GitHub (${ghRes.status})`,
            status: ghRes.status,
          };
        }
        break;
      }

      const batch: any[] = await ghRes.json();
      if (!Array.isArray(batch) || batch.length === 0) break;

      for (const c of batch) {
        if (!c?.sha || commitMap.has(c.sha)) continue;
        const rawDate = c.commit?.author?.date || c.commit?.committer?.date;
        const isoDate = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();

        commitMap.set(c.sha, {
          CommitID: c.sha,
          RepoID: repoId,
          Message: c.commit?.message || 'No commit message',
          AuthorName: c.commit?.author?.name || c.author?.login || 'Unknown',
          AuthorEmail: c.commit?.author?.email || 'noreply@github.com',
          CommittedAt: isoDate,
          URL: c.html_url || `https://github.com/${owner}/${name}/commit/${c.sha}`,
        });
      }

      if (batch.length < 100) break;
      page++;
    }
  }

  return { commits: Array.from(commitMap.values()) };
}

