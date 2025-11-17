import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'
import Header from '../components/Header'
import MenuPage from './MenuPage'
import CartPage from './CartPage'
import OrdersPage from './OrdersPage'
import OrderConfirmedPage from './OrderConfirmedPage'
import { useCart } from '../hooks/useCart'
import { useTableContext } from '../contexts/TableContext'
import { useOrders } from '../hooks/useOrders'
import { createOrder } from '../services/orderService'

// Menu items data
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

const MenuAppPage = ({ setToast: externalSetToast = null }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('menu')
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [orderId, setOrderId] = useState(null)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [orderError, setOrderError] = useState(null)
  const [orderFilter, setOrderFilter] = useState('all')
  const [toast, setToast] = useState(null)
  
  // Use external toast if provided, otherwise use internal
  const showToast = externalSetToast || setToast

  // Custom hooks
  const cart = useCart()
  const table = useTableContext()
  // Filter orders by table number for users
  const orders = useOrders(activeTab, orderFilter, showToast, table.tableNumber)

  // Redirect to scantable only if no table number exists (after loading is complete)
  useEffect(() => {
    // Wait for table loading to complete before checking
    if (!table.isLoadingTable && !table.tableNumber) {
      // No table number found - redirect to scantable
      navigate('/scantable', { replace: true })
    }
  }, [table.tableNumber, table.isLoadingTable, navigate])

  // Online/offline status
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

  // Confirm order handler
  const handleConfirmOrder = async () => {
    if (!table.tableNumber) {
      setOrderError('Table number not found. Please scan a valid QR code.')
      return
    }

    if (cart.cart.length === 0) {
      setOrderError('Your cart is empty!')
      return
    }

    setIsSubmittingOrder(true)
    setOrderError(null)

    try {
      const orderData = {
        table_number: table.tableNumber,
        items: cart.cart.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
          image: item.image
        })),
        total: cart.getTotalPrice(),
        timestamp: new Date().toISOString(),
        status: 'pending'
      }

      const data = await createOrder(orderData)
      setOrderId(data.order_id)
      setOrderConfirmed(true)
      setActiveTab('menu')
      setOrderError(null)
      showToast({ message: 'Order placed successfully!', type: 'success' })
      
      // Reset after 5 seconds
      setTimeout(() => {
        setOrderConfirmed(false)
        cart.clearCart()
        setOrderId(null)
      }, 5000)
    } catch (err) {
      const errorMsg = 'Failed to place order. Please check your connection and try again.'
      setOrderError(errorMsg)
      showToast({ message: errorMsg, type: 'error' })
      console.error('Error confirming order:', err)
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  // Show order confirmed page
  if (orderConfirmed) {
    return (
      <OrderConfirmedPage
        orderId={orderId}
        totalPrice={cart.getTotalPrice()}
        onContinueShopping={() => {
          setOrderConfirmed(false)
          cart.clearCart()
        }}
      />
    )
  }

  // Main app with menu, cart, and orders
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
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tableNumber={table.tableNumber}
        tableError={table.tableError}
        isOnline={isOnline}
        totalItems={cart.getTotalItems()}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-grow w-full">
        {activeTab === 'menu' && (
          <MenuPage
            menuItems={menuItems}
            cart={cart.cart}
            onAddToCart={cart.addToCart}
            onUpdateQuantity={cart.updateQuantity}
            getItemQuantity={cart.getItemQuantity}
          />
        )}

        {activeTab === 'cart' && (
          <CartPage
            cart={cart.cart}
            onUpdateQuantity={cart.updateQuantity}
            onRemove={cart.removeFromCart}
            onBackToMenu={() => setActiveTab('menu')}
            totalPrice={cart.getTotalPrice()}
            orderError={orderError}
            isSubmittingOrder={isSubmittingOrder}
            onConfirmOrder={handleConfirmOrder}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersPage
            orders={orders.orders}
            orderFilter={orderFilter}
            onFilterChange={setOrderFilter}
            isLoadingOrders={orders.isLoadingOrders}
            ordersError={orders.ordersError}
            onRetry={orders.silentRefresh}
            onMarkDelivered={orders.markOrderDelivered}
            tableNumber={table.tableNumber}
          />
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

export default MenuAppPage

