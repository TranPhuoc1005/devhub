import { useState, useEffect } from 'react'
import { Github, Triangle, Zap, Settings as SettingsIcon, User, ChevronRight } from 'lucide-react'
import { getTokens } from './store'
import { getUser } from './github'
import GithubPanel from './components/GithubPanel'
import VercelPanel from './components/VercelPanel'
import QuickDeploy from './components/QuickDeploy'
import Settings from './components/Settings'

const TABS = [
  { id: 'deploy', label: '1-Click Deploy', icon: Zap },
  { id: 'github', label: 'GitHub Repos', icon: Github },
  { id: 'vercel', label: 'Vercel Projects', icon: Triangle },
]

export default function App() {
  const [tab, setTab] = useState('deploy')
  const [tokens, setTokens] = useState(getTokens)
  const [showSettings, setShowSettings] = useState(false)
  const [ghUser, setGhUser] = useState(null)

  useEffect(() => {
    if (!tokens.github) { setGhUser(null); return }
    getUser(tokens.github).then(setGhUser).catch(() => setGhUser(null))
  }, [tokens.github])

  // Show settings on first load if no tokens
  useEffect(() => {
    if (!tokens.github && !tokens.vercel) setShowSettings(true)
  }, [])

  const hasTokens = tokens.github || tokens.vercel

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 20px', height: 52,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Github size={16} color="var(--text)" />
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>+</span>
            <Triangle size={14} color="#000" fill="#000" style={{
              background: '#fff', borderRadius: 3, padding: 2,
            }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
            Dev<span style={{ color: 'var(--accent)' }}>Hub</span>
          </span>
        </div>

        {/* Tabs */}
        <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                background: tab === id ? 'var(--bg3)' : 'none',
                color: tab === id ? 'var(--text)' : 'var(--muted)',
                border: tab === id ? '1px solid var(--border2)' : '1px solid transparent',
                transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
              }}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        {/* Right side: user + settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {ghUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={ghUser.avatar_url} alt={ghUser.login}
                style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border2)' }} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{ghUser.login}</span>
            </div>
          )}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 6, fontSize: 12,
              background: !hasTokens ? 'var(--accent)' : 'var(--bg3)',
              color: !hasTokens ? '#fff' : 'var(--muted)',
              border: !hasTokens ? 'none' : '1px solid var(--border)',
              fontFamily: 'var(--font-sans)', fontWeight: !hasTokens ? 600 : 400,
            }}>
            <SettingsIcon size={13} />
            {!hasTokens ? 'Setup Tokens' : 'Tokens'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {!hasTokens ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40,
          }}>
            <div style={{ fontSize: 40 }}>🚀</div>
            <div style={{ fontWeight: 700, fontSize: 22 }}>Chào mừng đến DevHub</div>
            <div style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', maxWidth: 420, lineHeight: 1.7 }}>
              Quản lý GitHub repos và Vercel deployments từ một nơi duy nhất.
              Deploy bằng một click duy nhất.
            </div>
            <button
              onClick={() => setShowSettings(true)}
              style={{
                padding: '12px 28px', borderRadius: 10, background: 'var(--accent)',
                color: '#fff', fontSize: 15, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: 'var(--font-sans)', marginTop: 8,
              }}>
              <SettingsIcon size={16} /> Cài đặt API Tokens <ChevronRight size={16} />
            </button>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.8, textAlign: 'center' }}>
              Cần: <span style={{ color: 'var(--accent2)' }}>GitHub Personal Access Token</span>
              {' '}(scopes: repo, read:user)<br />
              Cần: <span style={{ color: 'var(--cyan)' }}>Vercel Access Token</span>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {tab === 'deploy' && <QuickDeploy ghToken={tokens.github} vcToken={tokens.vercel} />}
            {tab === 'github' && <GithubPanel token={tokens.github} />}
            {tab === 'vercel' && <VercelPanel token={tokens.vercel} />}
          </div>
        )}
      </main>

      {/* Settings modal */}
      {showSettings && (
        <Settings
          tokens={tokens}
          onClose={() => setShowSettings(false)}
          onSave={(newTokens) => setTokens(newTokens)}
        />
      )}
    </div>
  )
}
