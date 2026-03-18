import { useState, useEffect, useCallback } from 'react'
import { Search, Star, GitFork, RefreshCw, Code2, ExternalLink, GitBranch, Clock, Rocket } from 'lucide-react'
import { getRepos, getCommits, createTriggerCommit, timeAgo, langColor } from '../github'

const s = {
  panel: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  toolbar: {
    padding: '16px 20px', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
  },
  searchWrap: {
    flex: 1, position: 'relative', display: 'flex', alignItems: 'center',
  },
  searchIcon: { position: 'absolute', left: 10, color: 'var(--muted)' },
  searchInput: {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 6, padding: '7px 12px 7px 32px', color: 'var(--text)',
    fontSize: 13, outline: 'none', fontFamily: 'var(--font-sans)',
  },
  iconBtn: {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 6, padding: 7, display: 'flex', alignItems: 'center',
    color: 'var(--muted)', transition: 'color 0.15s',
  },
  list: { flex: 1, overflowY: 'auto', padding: '12px 16px' },
  card: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '14px 16px', marginBottom: 8,
    cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
    animation: 'fadeIn 0.2s ease',
  },
  cardActive: { borderColor: 'var(--accent)', background: 'var(--bg3)' },
  repoName: { fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 },
  desc: { fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 },
  meta: {
    display: 'flex', gap: 14, marginTop: 10,
    fontSize: 11, color: 'var(--muted)', alignItems: 'center', flexWrap: 'wrap',
  },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4 },
  langDot: { width: 10, height: 10, borderRadius: '50%' },
  private: {
    fontSize: 10, background: 'var(--bg4)', color: 'var(--muted)',
    border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px',
  },
  detail: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 340,
    background: 'var(--bg2)', borderLeft: '1px solid var(--border)',
    overflowY: 'auto', padding: 20, zIndex: 10,
  },
  commitItem: {
    borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 10,
  },
  deployBtn: {
    width: '100%', padding: '10px 0', borderRadius: 8, background: 'var(--accent)',
    color: '#fff', fontWeight: 600, fontSize: 14, display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16,
    fontFamily: 'var(--font-sans)',
  },
  vscodeBtn: {
    width: '100%', padding: '9px 0', borderRadius: 8, background: 'var(--bg3)',
    color: 'var(--text)', fontWeight: 500, fontSize: 13, display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8,
    border: '1px solid var(--border2)', fontFamily: 'var(--font-sans)',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: 200, color: 'var(--muted)',
    gap: 10, fontSize: 14,
  },
}

function RepoDetail({ repo, token, onDeploy, onClose }) {
  const [commits, setCommits] = useState([])
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState(false)
  const [deployMsg, setDeployMsg] = useState('')

  useEffect(() => {
    getCommits(token, repo.owner.login, repo.name)
      .then(setCommits)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [repo.id])

  const handleDeploy = async () => {
    setDeploying(true)
    setDeployMsg('')
    try {
      const branch = repo.default_branch || 'main'
      await createTriggerCommit(token, repo.owner.login, repo.name, branch)
      setDeployMsg('✅ Commit tạo thành công! Vercel sẽ tự deploy.')
      onDeploy && onDeploy(repo)
    } catch (e) {
      setDeployMsg(`❌ ${e.message}`)
    } finally {
      setDeploying(false)
    }
  }

  const openVSCode = () => {
    window.location.href = `vscode://vscode.git/clone?url=${encodeURIComponent(repo.clone_url)}`
  }

  const openVSCodeFolder = () => {
    // Opens vscode with the repo URL - works if already cloned
    window.location.href = `vscode://file/${repo.name}`
  }

  return (
    <div style={s.detail}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{repo.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{repo.owner.login}</div>
        </div>
        <button style={{ background: 'none', color: 'var(--muted)', fontSize: 18, lineHeight: 1 }} onClick={onClose}>×</button>
      </div>

      {repo.description && (
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>{repo.description}</p>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <a href={repo.html_url} target="_blank" rel="noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '7px 0', background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 6, fontSize: 12, color: 'var(--text)' }}>
          <ExternalLink size={12} /> GitHub
        </a>
        <button onClick={openVSCode}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '7px 0', background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 6, fontSize: 12, color: 'var(--text)', cursor: 'pointer',
            fontFamily: 'var(--font-sans)' }}>
          <Code2 size={12} color="#007acc" /> VSCode Clone
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 8, letterSpacing: '0.08em' }}>
          RECENT COMMITS
        </div>
        {loading ? (
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>Loading...</div>
        ) : commits.map(c => (
          <div key={c.sha} style={s.commitItem}>
            <div style={{ fontSize: 12, lineHeight: 1.4, marginBottom: 3 }}>
              {c.commit.message.split('\n')[0].slice(0, 60)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 10 }}>
              <span className="mono">{c.sha.slice(0, 7)}</span>
              <span>{c.commit.author.name}</span>
              <span>{timeAgo(c.commit.author.date)}</span>
            </div>
          </div>
        ))}
        {!loading && commits.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>No commits found</div>
        )}
      </div>

      {deployMsg && (
        <div style={{ fontSize: 13, padding: '8px 12px', background: 'var(--bg)', borderRadius: 6, marginBottom: 10, lineHeight: 1.5 }}>
          {deployMsg}
        </div>
      )}

      <button style={s.deployBtn} onClick={handleDeploy} disabled={deploying}>
        <Rocket size={14} />
        {deploying ? 'Đang tạo trigger...' : '🚀 Push & Deploy'}
      </button>
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 6, lineHeight: 1.5 }}>
        Tạo commit trigger → Vercel auto-deploy
      </div>
    </div>
  )
}

export default function GithubPanel({ token }) {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true); setError('')
    try {
      const data = await getRepos(token)
      setRepos(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  const filtered = repos.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(search.toLowerCase())
    if (filter === 'public') return matchSearch && !r.private
    if (filter === 'private') return matchSearch && r.private
    return matchSearch
  })

  if (!token) return (
    <div style={{ ...s.emptyState, height: '100%' }}>
      <Code2 size={32} color="var(--muted)" />
      <div>Nhập GitHub Token để xem repos</div>
    </div>
  )

  return (
    <div style={{ ...s.panel, position: 'relative' }}>
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <Search size={14} style={s.searchIcon} />
          <input
            style={s.searchInput}
            placeholder="Tìm repo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
            padding: '7px 10px', color: 'var(--text)', fontSize: 12, outline: 'none',
            fontFamily: 'var(--font-sans)' }}>
          <option value="all">All</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <button style={s.iconBtn} onClick={load} title="Refresh">
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
        </button>
      </div>

      {error && (
        <div style={{ margin: '12px 16px', padding: '10px 12px', background: 'rgba(247,90,90,0.1)',
          border: '1px solid rgba(247,90,90,0.3)', borderRadius: 6, fontSize: 12, color: '#f75a5a' }}>
          {error}
        </div>
      )}

      <div style={{ ...s.list, paddingRight: selected ? 356 : 16 }}>
        {loading && repos.length === 0 ? (
          <div style={s.emptyState}>
            <RefreshCw size={24} color="var(--muted)" style={{ animation: 'spin 1s linear infinite' }} />
            <div>Đang tải repos...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyState}>
            <Search size={24} color="var(--muted)" />
            <div>Không tìm thấy repo</div>
          </div>
        ) : filtered.map(repo => (
          <div
            key={repo.id}
            style={{ ...s.card, ...(selected?.id === repo.id ? s.cardActive : {}) }}
            onClick={() => setSelected(selected?.id === repo.id ? null : repo)}
          >
            <div style={s.repoName}>
              {repo.name}
              {repo.private && <span style={s.private}>private</span>}
              {repo.fork && <GitFork size={12} color="var(--muted)" />}
            </div>
            {repo.description && <div style={s.desc}>{repo.description}</div>}
            <div style={s.meta}>
              {repo.language && (
                <span style={s.metaItem}>
                  <span style={{ ...s.langDot, background: langColor[repo.language] || '#888' }} />
                  {repo.language}
                </span>
              )}
              <span style={s.metaItem}><Star size={11} /> {repo.stargazers_count}</span>
              <span style={s.metaItem}><GitFork size={11} /> {repo.forks_count}</span>
              <span style={s.metaItem}><GitBranch size={11} /> {repo.default_branch}</span>
              <span style={s.metaItem}><Clock size={11} /> {timeAgo(repo.updated_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <RepoDetail
          repo={selected}
          token={token}
          onClose={() => setSelected(null)}
        />
      )}

      <div style={{ padding: '8px 20px', borderTop: '1px solid var(--border)',
        fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
        {filtered.length} / {repos.length} repos
      </div>
    </div>
  )
}
