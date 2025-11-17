import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

// Dynamic API URL detection
const getApiBaseUrl = () => {
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

// Toast notification component
const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000) // Auto-close after 5 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'
  const icon = type === 'error' ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ) : type === 'success' ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center space-x-3 min-w-[300px] max-w-md animate-slide-in`}>
      <div className="flex-shrink-0">
        {icon}
      </div>
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('menu')
  const [cart, setCart] = useState([])
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [tableNumber, setTableNumber] = useState(null)
  const [tableToken, setTableToken] = useState(null)
  const [tableError, setTableError] = useState(null)
  const [isLoadingTable, setIsLoadingTable] = useState(false)
  const [orders, setOrders] = useState([])
  const [orderFilter, setOrderFilter] = useState('all') // all, pending, delivered
  const [orderId, setOrderId] = useState(null)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [orderError, setOrderError] = useState(null)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState(null)
  const qrCodeScannerRef = useRef(null)
  const [toast, setToast] = useState(null)

  // Extract token from URL and fetch table number (runs immediately on mount)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('t')
    
    // Remove token from URL IMMEDIATELY (synchronous, before any state updates)
    if (token) {
      window.history.replaceState({}, '', window.location.pathname)
    }
    
    if (token) {
      setTableToken(token)
      setIsLoadingTable(true)
      setTableError(null)
      
      // Fetch table number from API
      const apiUrl = getApiBaseUrl()
      fetch(`${apiUrl}/api/qr-menu/table/${token}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Invalid token')
          }
          return res.json()
        })
        .then(data => {
          setTableNumber(data.table_number)
          setTableError(null)
          setIsLoadingTable(false)
        })
        .catch(err => {
          const errorMsg = 'Invalid QR code. Please scan a valid QR code to access the menu.'
          setTableError(errorMsg)
          setIsLoadingTable(false)
          setToast({ message: errorMsg, type: 'error' })
          console.error('Error fetching table number:', err)
        })
    } else {
      // No token - app always starts with QR code scanning
      setTableError('Please scan the QR code to access the menu')
      setIsLoadingTable(false)
    }
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const fetchOrders = async () => {
    setIsLoadingOrders(true)
    setOrdersError(null)
    try {
      const apiUrl = getApiBaseUrl()
      let url = `${apiUrl}/api/qr-menu/orders`
      if (orderFilter !== 'all') {
        url += `?status=${orderFilter}`
      }
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
        setOrdersError(null)
      } else {
        throw new Error('Failed to fetch orders')
      }
    } catch (err) {
      const errorMsg = 'Failed to load orders. Please try again.'
      setOrdersError(errorMsg)
      setToast({ message: errorMsg, type: 'error' })
      console.error('Error fetching orders:', err)
    } finally {
      setIsLoadingOrders(false)
    }
  }

  // Fetch orders when Orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab, orderFilter])

  const menuItems = [
    {
      id: 1,
      name: 'Margherita Pizza',
      description: 'Fresh mozzarella, tomato sauce, basil',
      price: 1499,
      category: 'Pizza',
      image: '🍕'
    },
    {
      id: 2,
      name: 'Caesar Salad',
      description: 'Romaine lettuce, parmesan, croutons',
      price: 999,
      category: 'Salads',
      image: '🥗'
    },
    {
      id: 3,
      name: 'Pasta Carbonara',
      description: 'Eggs, cheese, pancetta, black pepper',
      price: 1299,
      category: 'Pasta',
      image: '🍝'
    },
    {
      id: 4,
      name: 'Tiramisu',
      description: 'Coffee-flavored Italian dessert',
      price: 699,
      category: 'Desserts',
      image: '🍰'
    },
    {
      id: 5,
      name: 'Bhel Puri',
      description: 'Crispy puffed rice with tangy tamarind chutney, onions, and sev',
      price: 149,
      category: 'Street Food',
      image: '/bhelpuri.jpeg'
    }
  ]

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const getItemQuantity = (itemId) => {
    const cartItem = cart.find(item => item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.id !== id))
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  // Helper function to format prices in INR
  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`
  }

  const confirmOrder = async () => {
    if (!tableNumber) {
      setOrderError('Table number not found. Please scan a valid QR code.')
      return
    }

    if (cart.length === 0) {
      setOrderError('Your cart is empty!')
      return
    }

    setIsSubmittingOrder(true)
    setOrderError(null)

    try {
      const orderData = {
        table_number: tableNumber,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
          image: item.image
        })),
        total: getTotalPrice(),
        timestamp: new Date().toISOString(),
        status: 'pending'
      }

      const apiUrl = getApiBaseUrl()
      const res = await fetch(`${apiUrl}/api/qr-menu/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (res.ok) {
        const data = await res.json()
        setOrderId(data.order_id)
        setOrderConfirmed(true)
        setActiveTab('menu')
        setOrderError(null)
        setToast({ message: 'Order placed successfully!', type: 'success' })
        // Reset after 5 seconds
        setTimeout(() => {
          setOrderConfirmed(false)
          setCart([])
          setOrderId(null)
        }, 5000)
      } else {
        throw new Error('Failed to save order')
      }
    } catch (err) {
      const errorMsg = 'Failed to place order. Please check your connection and try again.'
      setOrderError(errorMsg)
      setToast({ message: errorMsg, type: 'error' })
      console.error('Error confirming order:', err)
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const markOrderDelivered = async (orderId) => {
    try {
      const apiUrl = getApiBaseUrl()
      const res = await fetch(`${apiUrl}/api/qr-menu/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'delivered' })
      })

      if (res.ok) {
        // Refresh orders list
        fetchOrders()
        setToast({ message: 'Order marked as delivered!', type: 'success' })
      } else {
        throw new Error('Failed to update order')
      }
    } catch (err) {
      const errorMsg = 'Failed to update order status. Please try again.'
      setToast({ message: errorMsg, type: 'error' })
      console.error('Error updating order:', err)
    }
  }

  const startQRScanner = () => {
    setIsScanning(true)
    setScanError(null)
  }

  // Start scanner after component renders (when isScanning becomes true)
  useEffect(() => {
    if (!isScanning) return

    const initScanner = async () => {
      try {
        // Wait a bit for DOM to render
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const elementId = "qr-reader"
        const element = document.getElementById(elementId)
        
        if (!element) {
          throw new Error(`Element with id=${elementId} not found`)
        }
        
        const scanner = new Html5Qrcode(elementId)
        qrCodeScannerRef.current = scanner
        
        await scanner.start(
          { facingMode: "environment" }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // QR code scanned successfully
            handleScannedToken(decodedText)
            stopQRScanner()
          },
          (errorMessage) => {
            // Ignore scanning errors (they're frequent during scanning)
          }
        )
      } catch (err) {
        const errorMsg = 'Failed to start camera. Please ensure camera permissions are granted.'
        setScanError(errorMsg)
        setIsScanning(false)
        setToast({ message: errorMsg, type: 'error' })
        console.error('Error starting QR scanner:', err)
      }
    }

    initScanner()

    // Cleanup on unmount or when isScanning changes
    return () => {
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.stop().catch(() => {})
        qrCodeScannerRef.current.clear().catch(() => {})
        qrCodeScannerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning])

  const stopQRScanner = async () => {
    try {
      if (qrCodeScannerRef.current) {
        await qrCodeScannerRef.current.stop()
        await qrCodeScannerRef.current.clear()
        qrCodeScannerRef.current = null
      }
      setIsScanning(false)
      setScanError(null)
    } catch (err) {
      console.error('Error stopping QR scanner:', err)
      setIsScanning(false)
    }
  }

  const handleScannedToken = (token) => {
    // Extract token from URL if it's a full URL, or use token directly
    let extractedToken = token
    try {
      const url = new URL(token)
      const params = new URLSearchParams(url.search)
      extractedToken = params.get('t') || token
    } catch {
      // Not a URL, use token as-is
      extractedToken = token
    }

    if (extractedToken) {
      setTableToken(extractedToken)
      setIsLoadingTable(true)
      setTableError(null)
      
      // Fetch table number from API
      const apiUrl = getApiBaseUrl()
      fetch(`${apiUrl}/api/qr-menu/table/${extractedToken}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Invalid token')
          }
          return res.json()
        })
        .then(data => {
          setTableNumber(data.table_number)
          setTableError(null)
          setIsLoadingTable(false)
          setToast({ message: 'QR code validated successfully!', type: 'success' })
        })
        .catch(err => {
          const errorMsg = 'Invalid QR code. Please scan a valid QR code to access the menu.'
          setTableError(errorMsg)
          setIsLoadingTable(false)
          setToast({ message: errorMsg, type: 'error' })
          console.error('Error fetching table number:', err)
        })
    }
  }


  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-green-800 mb-2">Order Confirmed!</h1>
            <p className="text-lg text-green-700">Thank you for your order</p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-green-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Order Details</h2>
            
            {/* Preparation Time */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-700">Preparation Time</span>
              </div>
              <span className="text-lg font-semibold text-orange-600">10-15 min</span>
            </div>

            {/* Order Number */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-gray-700">Order Number</span>
              </div>
              <span className="text-lg font-semibold text-blue-600">#{orderId ? orderId.substring(0, 8) : 'N/A'}</span>
            </div>

            {/* Total Amount */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-gray-700">Total Amount</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{formatPrice(getTotalPrice())}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-3">
            <button 
              onClick={() => {
                setOrderConfirmed(false)
                setCart([])
              }}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:bg-green-700 active:bg-green-800 transition-colors shadow-lg"
            >
              Continue Shopping
            </button>
            <p className="text-sm text-green-600">
              You'll receive a confirmation email shortly
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show QR code error screen if no table number and not loading
  if (!tableNumber && !isLoadingTable && tableError && !isScanning) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">QR Code Required</h1>
            <p className="text-lg text-gray-600 mb-2">{tableError}</p>
            <p className="text-sm text-gray-500 mb-6">Scan the QR code on your table to access the menu</p>
            <button
              onClick={startQRScanner}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:bg-gray-800 active:bg-gray-700 transition-colors shadow-lg flex items-center justify-center space-x-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Scan QR Code</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show QR scanner screen
  if (isScanning) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Scan QR Code</h1>
            <p className="text-gray-300">Point your camera at the QR code on your table</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 mb-4">
            <div id="qr-reader" className="w-full"></div>
          </div>

          {scanError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <p className="text-red-800 text-sm">{scanError}</p>
            </div>
          )}

          <button
            onClick={stopQRScanner}
            className="w-full bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Show loading screen while validating QR code
  if (isLoadingTable) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Validating QR Code...</h1>
            <p className="text-gray-600">Please wait while we verify your table</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {!isOnline && (
            <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
              <span className="text-sm text-yellow-800 font-medium">You're offline - App works without internet!</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QSR Express Menu</h1>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-gray-600">Please select the items you want to order!</p>
                {tableNumber && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    Table {tableNumber}
                  </span>
                )}
              </div>
              {tableError && (
                <p className="text-red-600 text-sm mt-1">{tableError}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'menu' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Menu
              </button>
              <button 
                onClick={() => setActiveTab('cart')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
                  activeTab === 'cart' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cart
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'orders' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Orders
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-grow">
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Our Menu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="card hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">
                      {item.image.startsWith('/') ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        item.image
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <span className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</span>
                      </div>
                      <p className="text-gray-600 mt-1">{item.description}</p>
                      <span className="inline-block bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full mt-2">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  {getItemQuantity(item.id) === 0 ? (
                    <button 
                      onClick={() => addToCart(item)}
                      className="btn-primary w-full mt-4"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center justify-center space-x-3 mt-4">
                      <button 
                        onClick={() => updateQuantity(item.id, getItemQuantity(item.id) - 1)}
                        className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <span className="text-gray-700 font-bold text-lg">−</span>
                      </button>
                      <span className="font-semibold text-gray-900 text-lg min-w-[2rem] text-center">
                        {getItemQuantity(item.id)}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, getItemQuantity(item.id) + 1)}
                        className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                      >
                        <span className="font-bold text-lg">+</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
              <button 
                onClick={() => setActiveTab('menu')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Back to Menu
              </button>
            </div>
            
            {cart.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-4">Add some delicious items from our menu!</p>
                <button 
                  onClick={() => setActiveTab('menu')}
                  className="btn-primary"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {item.image.startsWith('/') ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            item.image
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-gray-600">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <span className="text-gray-700 font-bold">−</span>
                        </button>
                        <span className="font-semibold text-gray-900 w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                        >
                          <span className="font-bold">+</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-gray-600">Subtotal: {formatPrice(item.price * item.quantity)}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Total and Confirm */}
                <div className="card bg-gray-50 border-2 border-gray-200">
                  <div className="flex items-center justify-between text-lg font-semibold mb-4">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-2xl text-gray-900">{formatPrice(getTotalPrice())}</span>
                  </div>
                  {orderError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      <p className="text-red-800 text-sm">{orderError}</p>
                    </div>
                  )}
                  <button 
                    onClick={confirmOrder}
                    disabled={isSubmittingOrder}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-colors ${
                      isSubmittingOrder
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                    }`}
                  >
                    {isSubmittingOrder ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Placing Order...
                      </span>
                    ) : (
                      'Confirm Order'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-gray-900">All Orders</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    orderFilter === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setOrderFilter('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    orderFilter === 'pending'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setOrderFilter('delivered')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    orderFilter === 'delivered'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Delivered
                </button>
              </div>
            </div>

            {ordersError && (
              <div className="card bg-red-50 border border-red-200">
                <p className="text-red-800">{ordersError}</p>
                <button
                  onClick={fetchOrders}
                  className="mt-3 text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {isLoadingOrders ? (
              <div className="card text-center py-12">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">Orders will appear here once customers place them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.order_id} className="card">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Table {order.table_number}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'pending'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(order.timestamp).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Order ID: {order.order_id.substring(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{formatPrice(order.total)}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Items:</h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">
                              {item.name} × {item.quantity}
                            </span>
                            <span className="text-gray-600">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.status === 'pending' && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => markOrderDelivered(order.order_id)}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          Mark as Delivered
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 sm:py-6 md:py-8 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <p className="text-gray-400 text-sm sm:text-base">© 2025 QR Menu App. All rights reserved.</p>
          <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">Scan the QR code to access this menu on your device</p>
        </div>
      </footer>
    </div>
  )
}

export default App
