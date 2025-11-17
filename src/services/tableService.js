import { getApiBaseUrl } from './api'

export const validateTableToken = async (token) => {
  const apiUrl = getApiBaseUrl()
  const res = await fetch(`${apiUrl}/api/qr-menu/table/${token}`)
  
  if (!res.ok) {
    throw new Error('Invalid token')
  }
  
  return res.json()
}

export const validateTablePin = async (pin) => {
  const apiUrl = getApiBaseUrl()
  const res = await fetch(`${apiUrl}/api/qr-menu/table/pin/${pin}`)
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('PIN_NOT_FOUND')
    } else if (res.status >= 500) {
      throw new Error('SERVER_ERROR')
    } else {
      throw new Error('NETWORK_ERROR')
    }
  }
  
  return res.json()
}

