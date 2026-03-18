import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Rocket, ExternalLink, Activity, Globe, GitBranch, Clock } from 'lucide-react'
import { getProjects, getDeployments, getAllDeployments, getDeploymentStatus } from '../vercel'
import { timeAgo } from '../github'

const s = {
  panel: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  toolbar: {
    padding: '16px 20px', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
  },
  iconBtn: {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 6, padding: 7, display: 'flex', alignItems: 'center',
    color: 'var(--muted)',
  },
  list: { flex: 1, overflowY: 'auto', padding: '12px 16px' },
  projectCard: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 10, marginBottom: 10, overflow: 'hidden',
    animation: 'fadeIn 0.2s ease',
  },
  projectHeader: {
    padding: '12px 16px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', cursor: 'pointer',
    transition: 'background 0.15s',
  },
  projectName: { fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  deployList: { borderTop: '1px solid var(--border)' },
  deployItem: {
    padding: '10px 16px', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: 12,
    transition: 'background 0.15s', fontSize: 13,
  },
  badge: {
    fontSize: 10, padding: '3px 7px', borderRadius: 4,
    fontFamily: 'var(--font-mono)', fontWeight: 500,
  },
  deployBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
    borderRadius: 6, background: 'var(--accent)', color: '#fff',
    fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)',
    transition: 'opacity 0.15s',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: 200, color: 'var(--muted)',
    gap: 10, fontSize: 14,
  },
  tabRow: { display: 'flex', gap: 4 },
  tab: {
    padding: '5px 12px', borderRadius: 6, fontSize: 12,
    background: 'none', border: '1px solid transparent', fontFamily: 'var(--font-sans)',
  },
}

function ProjectRow({ project, token }) {
  const [expanded, setExpanded] = useState(false)
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (expanded && deployments.length === 0) {
      setLoading(true)
      getDeployments(token, project.id)
        .then(setDeployments)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [expanded])

  const latestDeploy = project.latestDeployments?.[0]
  const status = latestDeploy ? getDeploymentStatus(latestDeploy.readyState || latestDeploy.state) : null

  const handleDeploy = async (e) => {
    e.stopPropagation()
    setDeploying(true); setMsg('')
    try {
      // Vercel deploy thường cần git push - ta sẽ redirect đến dashboard
      window.open(`https://vercel.com/${project.accountId || ''}/${project.name}/deployments`, '_blank')
      setMsg('Mở Vercel dashboard để redeploy')
    } catch (e) {
      setMsg(`Lỗi: ${e.message}`)
    } finally {
      setDeploying(false)
    }
  }

  const openSite = (e) => {
    e.stopPropagation()
    const url = project.alias?.[0]?.domain
      ? `https://${project.alias[0].domain}`
      : `https://${project.name}.vercel.app`
    window.open(url, '_blank')
  }

  return (
    <div style={s.projectCard}>
      <div style={s.projectHeader} onClick={() => setExpanded(!expanded)}>
        <div style={s.projectName}>
          {status && <span style={{ ...s.statusDot, background: status.color,
            ...(status.label === 'Building' ? { animation: 'pulse 1s infinite' } : {}) }} />}
          {project.name}
          {status && (
            <span style={{ ...s.badge,
              background: status.color + '22', color: status.color }}>
              {status.label}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{ ...s.iconBtn, padding: '5px', cursor: 'pointer' }}
            onClick={openSite} title="Mở website">
            <Globe size={13} />
          </button>
          <button style={{ ...s.deployBtn, cursor: 'pointer' }}
            onClick={handleDeploy} disabled={deploying}>
            <Rocket size={11} />
            {deploying ? '...' : 'Deploy'}
          </button>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '6px 16px', fontSize: 12, color: 'var(--muted)',
          background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
          {msg}
        </div>
      )}

      {expanded && (
        <div style={s.deployList}>
          {loading ? (
            <div style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: 12 }}>
              Đang tải deployments...
            </div>
          ) : deployments.length === 0 ? (
            <div style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: 12 }}>
              Chưa có deployment
            </div>
          ) : deployments.map(d => {
            const st = getDeploymentStatus(d.readyState || d.state)
            return (
              <div key={d.uid} style={s.deployItem}>
                <span style={{ ...s.statusDot, background: st.color,
                  ...(st.label === 'Building' ? { animation: 'pulse 1s infinite' } : {}) }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.meta?.githubCommitMessage || d.name || d.uid.slice(0, 12)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 10, marginTop: 2 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <GitBranch size={10} /> {d.meta?.githubCommitRef || 'main'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={10} /> {timeAgo(d.createdAt)}
                    </span>
                  </div>
                </div>
                <span style={{ ...s.badge, background: st.color + '22', color: st.color }}>
                  {st.label}
                </span>
                {d.url && (
                  <a href={`https://${d.url}`} target="_blank" rel="noreferrer"
                    style={{ color: 'var(--muted)', display: 'flex' }}>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function VercelPanel({ token }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState('projects')

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true); setError('')
    try {
      const data = await getProjects(token)
      setProjects(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  if (!token) return (
    <div style={{ ...s.emptyState, height: '100%' }}>
      <Rocket size={32} color="var(--muted)" />
      <div>Nhập Vercel Token để xem projects</div>
    </div>
  )

  return (
    <div style={s.panel}>
      <div style={s.toolbar}>
        <Activity size={15} color="var(--accent)" />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>Vercel Projects</span>
        <button style={{ ...s.iconBtn, cursor: 'pointer' }} onClick={load} title="Refresh">
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
        </button>
      </div>

      {error && (
        <div style={{ margin: '12px 16px', padding: '10px 12px', background: 'rgba(247,90,90,0.1)',
          border: '1px solid rgba(247,90,90,0.3)', borderRadius: 6, fontSize: 12, color: '#f75a5a' }}>
          {error}
        </div>
      )}

      <div style={s.list}>
        {loading && projects.length === 0 ? (
          <div style={s.emptyState}>
            <RefreshCw size={24} color="var(--muted)" style={{ animation: 'spin 1s linear infinite' }} />
            <div>Đang tải projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div style={s.emptyState}>
            <Rocket size={24} color="var(--muted)" />
            <div>Không có project nào</div>
          </div>
        ) : projects.map(p => (
          <ProjectRow key={p.id} project={p} token={token} />
        ))}
      </div>

      <div style={{ padding: '8px 20px', borderTop: '1px solid var(--border)',
        fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
        {projects.length} projects
      </div>
    </div>
  )
}
