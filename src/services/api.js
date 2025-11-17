// Dynamic API URL detection
export const getApiBaseUrl = () => {
  // Use environment variable if set (for development)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Auto-detect from current hostname (where frontend was loaded from)
  const hostname = window.location.hostname
  const protocol = window.location.protocol // http: or https:
  
  // Frontend on 9111, backend on 8000 (same hostname, different port)
  return `${protocol}//${hostname}:8000`
}

