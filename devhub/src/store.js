// Simple token store using localStorage
export const getTokens = () => ({
  github: localStorage.getItem('gh_token') || '',
  vercel: localStorage.getItem('vc_token') || '',
})

export const saveTokens = ({ github, vercel }) => {
  if (github !== undefined) localStorage.setItem('gh_token', github)
  if (vercel !== undefined) localStorage.setItem('vc_token', vercel)
}

export const clearTokens = () => {
  localStorage.removeItem('gh_token')
  localStorage.removeItem('vc_token')
}
