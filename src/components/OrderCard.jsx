import { formatPrice } from '../utils/formatters'

const OrderCard = ({ order, onMarkReady, onMarkDelivered, showMarkDelivered = false }) => {
  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Table {order.table_number}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'pending'
                  ? 'bg-orange-100 text-orange-800'
                  : order.status === 'ready'
                  ? 'bg-yellow-100 text-yellow-800'
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
        <div className="text-left sm:text-right">
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

      {/* Admin: Ready to Deliver button for pending orders */}
      {order.status === 'pending' && showMarkDelivered && onMarkReady && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onMarkReady(order.order_id)}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Ready to Deliver
          </button>
        </div>
      )}

      {/* Admin: Show "Robot on the way" message for ready orders */}
      {order.status === 'ready' && showMarkDelivered && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-semibold">
              Robot on the way to Table_{order.table_number}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderCard

