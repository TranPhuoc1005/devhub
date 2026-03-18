const VC = 'https://api.vercel.com'

export const vcFetch = async (path, token, options = {}) => {
  const res = await fetch(`${VC}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Vercel API error ${res.status}`)
  }
  return res.json()
}

export const getProjects = async (token) => {
  const data = await vcFetch('/v9/projects?limit=100', token)
  return data.projects || []
}

export const getDeployments = async (token, projectId) => {
  const data = await vcFetch(`/v6/deployments?projectId=${projectId}&limit=10`, token)
  return data.deployments || []
}

export const getAllDeployments = async (token) => {
  const data = await vcFetch('/v6/deployments?limit=20', token)
  return data.deployments || []
}

export const triggerDeploy = async (token, projectName) => {
  // Create a new deployment via Vercel API
  return vcFetch('/v13/deployments', token, {
    method: 'POST',
    body: JSON.stringify({
      name: projectName,
      target: 'production',
    }),
  })
}

export const cancelDeployment = async (token, deploymentId) => {
  return vcFetch(`/v12/deployments/${deploymentId}/cancel`, token, {
    method: 'PATCH',
  })
}

export const getDeploymentStatus = (state) => {
  const map = {
    READY: { label: 'Ready', color: '#22d374' },
    ERROR: { label: 'Error', color: '#f75a5a' },
    BUILDING: { label: 'Building', color: '#f7a934' },
    QUEUED: { label: 'Queued', color: '#6b6b80' },
    CANCELED: { label: 'Canceled', color: '#6b6b80' },
    INITIALIZING: { label: 'Init', color: '#38e8d5' },
  }
  return map[state] || { label: state, color: '#6b6b80' }
}
