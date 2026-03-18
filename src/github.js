const GH = 'https://api.github.com'

export const ghFetch = async (path, token, options = {}) => {
  const res = await fetch(`${GH}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `GitHub API error ${res.status}`)
  }
  return res.json()
}

export const getUser = (token) => ghFetch('/user', token)

export const getRepos = async (token) => {
  const allRepos = []
  let page = 1
  while (true) {
    const repos = await ghFetch(`/user/repos?per_page=100&page=${page}&sort=updated`, token)
    allRepos.push(...repos)
    if (repos.length < 100) break
    page++
  }
  return allRepos
}

export const getRepo = (token, owner, repo) =>
  ghFetch(`/repos/${owner}/${repo}`, token)

export const getCommits = (token, owner, repo) =>
  ghFetch(`/repos/${owner}/${repo}/commits?per_page=10`, token)

export const getBranches = (token, owner, repo) =>
  ghFetch(`/repos/${owner}/${repo}/branches`, token)

export const createTriggerCommit = async (token, owner, repo, branch = 'main') => {
  // Get current SHA of branch
  const branchData = await ghFetch(`/repos/${owner}/${repo}/branches/${branch}`, token)
  const treeSha = branchData.commit.commit.tree.sha

  // Create a new tree with a timestamp file
  const tree = await ghFetch(`/repos/${owner}/${repo}/git/trees`, token, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: treeSha,
      tree: [{
        path: '.devhub-deploy',
        mode: '100644',
        type: 'blob',
        content: `Deployed via DevHub at ${new Date().toISOString()}\n`,
      }],
    }),
  })

  // Create commit
  const commit = await ghFetch(`/repos/${owner}/${repo}/git/commits`, token, {
    method: 'POST',
    body: JSON.stringify({
      message: '🚀 Deploy trigger via DevHub',
      tree: tree.sha,
      parents: [branchData.commit.sha],
    }),
  })

  // Update branch ref
  await ghFetch(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  })

  return commit
}

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return `${Math.floor(d / 30)}mo ago`
}

export const langColor = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Shell: '#89e051',
  C: '#555555',
  'C++': '#f34b7d',
  Kotlin: '#F18E33',
  Swift: '#ffac45',
}
