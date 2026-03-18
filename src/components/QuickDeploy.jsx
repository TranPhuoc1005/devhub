import { useState, useEffect } from 'react'
import { Zap, Link2, Check, ExternalLink, Code2 } from 'lucide-react'
import { getRepos, createTriggerCommit, timeAgo } from '../github'
import { getProjects, getDeploymentStatus } from '../vercel'

const s = {
  wrap: { padding: 20, overflowY: 'auto', height: '100%' },
  heading: { fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-mono)',
    letterSpacing: '0.08em', marginBottom: 16 },
  card: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 12, padding: 16, marginBottom: 10,
    animation: 'fadeIn 0.2s ease',
  },
  row: { display: 'flex', alignItems: 'center', gap: 12 },
  repoName: { fontWeight: 600, fontSize: 14, flex: 1 },
  link2: { color: 'var(--muted)' },
  vercelName: { fontSize: 13, color: 'var(--accent2)' },
  oneClick: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 8, background: 'var(--accent)',
    color: '#fff', fontWeight: 600, fontSize: 13,
    fontFamily: 'var(--font-sans)', cursor: 'pointer',
    transition: 'opacity 0.15s', whiteSpace: 'nowrap',
  },
  success: { background: 'var(--green)' },
  msg: { fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 },
  vscode: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 6, background: 'var(--bg3)',
    border: '1px solid var(--border2)', color: 'var(--text)',
    fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)',
  },
  infoBox: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: 16, marginBottom: 20,
    fontSize: 13, color: 'var(--muted)', lineHeight: 1.7,
  },
  howItem: { display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  stepNum: {
    width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)',
    color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
}

function DeployCard({ repo, vercelProject, ghToken, vcToken }) {
  const [status, setStatus] = useState('idle') // idle | deploying | done | error
  const [msg, setMsg] = useState('')

  const deploy = async () => {
    setStatus('deploying'); setMsg('')
    try {
      const branch = repo.default_branch || 'main'
      await createTriggerCommit(ghToken, repo.owner.login, repo.name, branch)
      setStatus('done')
      setMsg(`✅ Commit trigger tạo thành công trên branch "${branch}". Vercel sẽ bắt đầu deploy!`)
      setTimeout(() => setStatus('idle'), 5000)
    } catch (e) {
      setStatus('error')
      setMsg(`❌ ${e.message}`)
    }
  }

  const openVSCode = () => {
    window.location.href = `vscode://vscode.git/clone?url=${encodeURIComponent(repo.clone_url)}`
  }

  const latestStatus = vercelProject?.latestDeployments?.[0]?.readyState
  const vcStatus = latestStatus ? getDeploymentStatus(latestStatus) : null

  return (
    <div style={s.card}>
      <div style={s.row}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.row}>
            <span style={s.repoName}>{repo.name}</span>
            {vercelProject && (
              <>
                <Link2 size={13} style={s.link2} />
                <span style={s.vercelName}>{vercelProject.name}</span>
                {vcStatus && (
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4,
                    background: vcStatus.color + '22', color: vcStatus.color,
                    fontFamily: 'var(--font-mono)' }}>
                    {vcStatus.label}
                  </span>
                )}
              </>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3,
            fontFamily: 'var(--font-mono)' }}>
            {repo.owner.login} · {repo.default_branch} · {timeAgo(repo.updated_at)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button style={s.vscode} onClick={openVSCode} title="Mở trong VSCode">
            <Code2 size={12} color="#007acc" /> VSCode
          </button>
          {ghToken && (
            <button
              style={{ ...s.oneClick, ...(status === 'done' ? s.success : {}),
                opacity: status === 'deploying' ? 0.7 : 1 }}
              onClick={deploy}
              disabled={status === 'deploying'}>
              {status === 'done' ? <Check size={13} /> : <Zap size={13} />}
              {status === 'deploying' ? 'Đang push...' : status === 'done' ? 'Done!' : '1-Click Deploy'}
            </button>
          )}
        </div>
      </div>
      {msg && <div style={s.msg}>{msg}</div>}
    </div>
  )
}

export default function QuickDeploy({ ghToken, vcToken }) {
  const [repos, setRepos] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [linked, setLinked] = useState([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [r, p] = await Promise.all([
          ghToken ? getRepos(ghToken) : Promise.resolve([]),
          vcToken ? getProjects(vcToken) : Promise.resolve([]),
        ])
        setRepos(r)
        setProjects(p)
        // Auto-link repos to Vercel projects by name similarity
        const links = r.map(repo => {
          const match = p.find(proj =>
            proj.name.toLowerCase() === repo.name.toLowerCase() ||
            proj.name.toLowerCase().includes(repo.name.toLowerCase()) ||
            repo.name.toLowerCase().includes(proj.name.toLowerCase())
          )
          return { repo, vercelProject: match || null }
        })
        setLinked(links)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (ghToken || vcToken) load()
  }, [ghToken, vcToken])

  const linkedPairs = linked.filter(l => l.vercelProject)
  const unlinked = linked.filter(l => !l.vercelProject)

  if (!ghToken && !vcToken) return (
    <div style={{ padding: 20 }}>
      <div style={s.infoBox}>
        <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 10, fontSize: 14 }}>
          🚀 One-Click Deploy
        </div>
        <p>Nhập GitHub Token và Vercel Token để sử dụng tính năng này.</p>
      </div>
    </div>
  )

  return (
    <div style={s.wrap}>
      <div style={s.infoBox}>
        <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 10, fontSize: 14 }}>
          💡 Cách hoạt động
        </div>
        {[
          'Sửa code trong VSCode / Cursor / bất kỳ editor nào',
          'Nhấn "1-Click Deploy" → DevHub tự tạo commit trigger lên GitHub',
          'Vercel nhận webhook → tự động build & deploy production',
          'Xem trạng thái deploy real-time ở tab Vercel',
        ].map((step, i) => (
          <div key={i} style={s.howItem}>
            <span style={s.stepNum}>{i + 1}</span>
            <span>{step}</span>
          </div>
        ))}
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg)',
          borderRadius: 6, fontSize: 12, color: '#38e8d5' }}>
          💡 Để mở trực tiếp từ VSCode: Cài extension "DevHub" (xem README) hoặc dùng nút VSCode bên dưới
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
          Đang load...
        </div>
      ) : (
        <>
          {linkedPairs.length > 0 && (
            <>
              <div style={s.heading}>LINKED — GITHUB ↔ VERCEL ({linkedPairs.length})</div>
              {linkedPairs.map(({ repo, vercelProject }) => (
                <DeployCard key={repo.id} repo={repo} vercelProject={vercelProject}
                  ghToken={ghToken} vcToken={vcToken} />
              ))}
            </>
          )}

          {unlinked.length > 0 && (
            <>
              <div style={{ ...s.heading, marginTop: linkedPairs.length > 0 ? 16 : 0 }}>
                GITHUB ONLY ({unlinked.length})
                <button
                  style={{ background: 'none', color: 'var(--accent)', fontSize: 11,
                    marginLeft: 10, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
                  onClick={() => setShowAll(!showAll)}>
                  {showAll ? 'ẩn bớt' : 'hiện tất cả'}
                </button>
              </div>
              {(showAll ? unlinked : unlinked.slice(0, 5)).map(({ repo }) => (
                <DeployCard key={repo.id} repo={repo} vercelProject={null}
                  ghToken={ghToken} vcToken={vcToken} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}
