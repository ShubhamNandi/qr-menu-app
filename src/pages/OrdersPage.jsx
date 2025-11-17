import { useEffect } from 'react'
import OrderCard from '../components/OrderCard'

const OrdersPage = ({ 
  orders, 
  orderFilter, 
  onFilterChange, 
  isLoadingOrders, 
  ordersError, 
  onRetry, 
  onMarkDelivered,
  tableNumber 
}) => {
  // Auto-refresh orders every 5 seconds (silently - no loading spinner)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (onRetry) {
        onRetry() // This is silentRefresh from useOrders hook
      }
    }, 5000) // Refresh every 5 seconds
    
    return () => clearInterval(refreshInterval)
  }, [onRetry])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {tableNumber ? `Table ${tableNumber} Orders` : 'All Orders'}
          </h2>
          {tableNumber && (
            <p className="text-sm text-gray-600 mt-1">Viewing orders for your table</p>
          )}
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              orderFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange('pending')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              orderFilter === 'pending'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => onFilterChange('ready')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              orderFilter === 'ready'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ready
          </button>
          <button
            onClick={() => onFilterChange('delivered')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
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
            onClick={onRetry}
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
            <OrderCard
              key={order.order_id}
              order={order}
              showMarkDelivered={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage

