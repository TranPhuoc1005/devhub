import { useState } from 'react'
import { Key, Eye, EyeOff, Check, ExternalLink } from 'lucide-react'
import { saveTokens } from '../store'

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'var(--bg2)', border: '1px solid var(--border2)',
    borderRadius: 16, padding: 32, width: '100%', maxWidth: 480,
    animation: 'fadeIn 0.2s ease',
  },
  label: {
    fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)',
    letterSpacing: '0.08em', marginBottom: 6, display: 'block',
  },
  inputWrap: {
    position: 'relative', marginBottom: 16,
  },
  input: {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)',
    borderRadius: 8, padding: '10px 40px 10px 12px', color: 'var(--text)',
    fontSize: 13, fontFamily: 'var(--font-mono)', outline: 'none',
  },
  eye: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', color: 'var(--muted)', padding: 0,
    display: 'flex', alignItems: 'center',
  },
  row: { display: 'flex', gap: 10, marginTop: 8 },
  btn: {
    flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 14,
    fontWeight: 600, fontFamily: 'var(--font-sans)',
  },
  save: { background: 'var(--accent)', color: '#fff' },
  cancel: { background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)' },
  link: {
    fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center',
    gap: 4, marginTop: 4, background: 'none', fontFamily: 'var(--font-sans)',
  },
  section: { marginBottom: 24 },
  title: { fontSize: 18, fontWeight: 600, marginBottom: 4 },
  sub: { fontSize: 13, color: 'var(--muted)', marginBottom: 24 },
  divider: { borderTop: '1px solid var(--border)', margin: '20px 0' },
}

export default function Settings({ tokens, onClose, onSave }) {
  const [gh, setGh] = useState(tokens.github)
  const [vc, setVc] = useState(tokens.vercel)
  const [showGh, setShowGh] = useState(false)
  const [showVc, setShowVc] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    saveTokens({ github: gh, vercel: vc })
    onSave({ github: gh, vercel: vc })
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 800)
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Key size={18} color="var(--accent)" />
          <span style={s.title}>API Tokens</span>
        </div>
        <p style={s.sub}>Tokens được lưu local, không gửi đi đâu ngoài GitHub/Vercel API.</p>

        <div style={s.section}>
          <label style={s.label}>GITHUB_TOKEN</label>
          <div style={s.inputWrap}>
            <input
              style={s.input}
              type={showGh ? 'text' : 'password'}
              value={gh}
              onChange={e => setGh(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            />
            <button style={s.eye} onClick={() => setShowGh(!showGh)}>
              {showGh ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <button style={s.link} onClick={() => window.open('https://github.com/settings/tokens/new?scopes=repo,read:user', '_blank')}>
            <ExternalLink size={10} /> Tạo token tại github.com
          </button>
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>
            (cần scopes: repo, read:user)
          </span>
        </div>

        <div style={s.divider} />

        <div style={s.section}>
          <label style={s.label}>VERCEL_TOKEN</label>
          <div style={s.inputWrap}>
            <input
              style={s.input}
              type={showVc ? 'text' : 'password'}
              value={vc}
              onChange={e => setVc(e.target.value)}
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
            />
            <button style={s.eye} onClick={() => setShowVc(!showVc)}>
              {showVc ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <button style={s.link} onClick={() => window.open('https://vercel.com/account/tokens', '_blank')}>
            <ExternalLink size={10} /> Tạo token tại vercel.com
          </button>
        </div>

        <div style={s.row}>
          <button style={{ ...s.btn, ...s.cancel }} onClick={onClose}>Hủy</button>
          <button style={{ ...s.btn, ...s.save, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={handleSave}>
            {saved ? <><Check size={14} /> Đã lưu!</> : 'Lưu tokens'}
          </button>
        </div>
      </div>
    </div>
  )
}
