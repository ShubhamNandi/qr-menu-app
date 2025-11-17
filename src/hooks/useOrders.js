import { useState, useEffect, useRef } from 'react'
import { fetchOrders as fetchOrdersService, updateOrderStatus } from '../services/orderService'

export const useOrders = (activeTab, orderFilter, setToast, tableNumber = null) => {
  const [orders, setOrders] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState(null)
  const isInitialLoadRef = useRef(true)

  const loadOrders = async (silent = false) => {
    // Only show loading spinner on initial load, not on silent refreshes or filter changes
    const wasInitialLoad = isInitialLoadRef.current
    if (!silent && wasInitialLoad) {
      setIsLoadingOrders(true)
    }
    setOrdersError(null)
    try {
      const data = await fetchOrdersService(orderFilter, tableNumber)
      setOrders(data)
      setOrdersError(null)
      isInitialLoadRef.current = false // Mark initial load as complete
    } catch (err) {
      const errorMsg = 'Failed to load orders. Please try again.'
      setOrdersError(errorMsg)
      // Only show toast for non-silent refreshes
      if (!silent) {
        setToast({ message: errorMsg, type: 'error' })
      }
      console.error('Error fetching orders:', err)
      isInitialLoadRef.current = false
    } finally {
      // Only turn off loading spinner if we turned it on (initial load, not silent)
      if (!silent && wasInitialLoad) {
        setIsLoadingOrders(false)
      }
    }
  }

  // Fetch orders when Orders tab is active or for dashboard
  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'dashboard') {
      // Initial load shows spinner, subsequent loads (filter changes, auto-refresh) are silent
      const isFirstLoad = isInitialLoadRef.current
      loadOrders(!isFirstLoad) // silent=true after first load
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, orderFilter, tableNumber])

  const markOrderReady = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'ready')
      // Refresh orders list silently
      loadOrders(true)
      setToast({ message: 'Order marked as ready for delivery!', type: 'success' })
    } catch (err) {
      const errorMsg = 'Failed to update order status. Please try again.'
      setToast({ message: errorMsg, type: 'error' })
      console.error('Error updating order:', err)
    }
  }

  const markOrderDelivered = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'delivered')
      // Refresh orders list silently
      loadOrders(true)
      setToast({ message: 'Order marked as delivered!', type: 'success' })
    } catch (err) {
      const errorMsg = 'Failed to update order status. Please try again.'
      setToast({ message: errorMsg, type: 'error' })
      console.error('Error updating order:', err)
    }
  }

  return {
    orders,
    isLoadingOrders,
    ordersError,
    markOrderReady,
    markOrderDelivered,
    refreshOrders: loadOrders,
    silentRefresh: () => loadOrders(true)
  }
}

