import { getApiBaseUrl } from './api'

export const fetchOrders = async (filter = 'all', tableNumber = null) => {
  const apiUrl = getApiBaseUrl()
  let url = `${apiUrl}/api/qr-menu/orders`
  const params = new URLSearchParams()
  
  if (filter !== 'all') {
    params.append('status', filter)
  }
  if (tableNumber) {
    params.append('table', tableNumber)
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`
  }
  
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch orders')
  }
  
  return res.json()
}

export const createOrder = async (orderData) => {
  const apiUrl = getApiBaseUrl()
  const res = await fetch(`${apiUrl}/api/qr-menu/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })
  
  if (!res.ok) {
    throw new Error('Failed to save order')
  }
  
  return res.json()
}

export const updateOrderStatus = async (orderId, status) => {
  const apiUrl = getApiBaseUrl()
  const res = await fetch(`${apiUrl}/api/qr-menu/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  })
  
  if (!res.ok) {
    throw new Error('Failed to update order')
  }
  
  return res.json()
}

export const fetchReadyOrders = async () => {
  const apiUrl = getApiBaseUrl()
  const res = await fetch(`${apiUrl}/api/qr-menu/orders/ready`)
  if (!res.ok) {
    throw new Error('Failed to fetch ready orders')
  }
  // Returns JSON array: [{ table_number: "Table_1", order_id: "..." }, ...]
  return res.json()
}

