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

// Admin table management functions
export const getAllTables = async () => {
  const apiUrl = getApiBaseUrl()
  const res = await fetch(`${apiUrl}/api/qr-menu/admin/tables`)
  
  if (!res.ok) {
    throw new Error('Failed to fetch tables')
  }
  
  return res.json()
}

export const configureTables = async (totalTables) => {
  const apiUrl = getApiBaseUrl()
  const res = await fetch(`${apiUrl}/api/qr-menu/admin/tables/configure`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ total_tables: totalTables }),
  })
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to configure tables' }))
    throw new Error(error.detail || 'Failed to configure tables')
  }
  
  return res.json()
}

export const getQRCodesInfo = async () => {
  const apiUrl = getApiBaseUrl()
  const res = await fetch(`${apiUrl}/api/qr-menu/admin/qr-codes/info`)
  
  if (!res.ok) {
    throw new Error('Failed to fetch QR codes info')
  }
  
  return res.json()
}

export const downloadQRCode = async (tableNumber) => {
  const apiUrl = getApiBaseUrl()
  const res = await fetch(`${apiUrl}/api/qr-menu/admin/qr-code/${tableNumber}`)
  
  if (!res.ok) {
    throw new Error('Failed to download QR code')
  }
  
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `table_${tableNumber}_qr_code.png`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export const downloadAllQRCodes = async () => {
  const apiUrl = getApiBaseUrl()
  const res = await fetch(`${apiUrl}/api/qr-menu/admin/qr-codes/all`)
  
  if (!res.ok) {
    throw new Error('Failed to download QR codes')
  }
  
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'all_table_qr_codes.zip'
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

