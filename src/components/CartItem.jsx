import { formatPrice } from '../utils/formatters'

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
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
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
            <p className="text-gray-600">{formatPrice(item.price)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 ml-4">
          <button 
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <span className="text-gray-700 font-bold">−</span>
          </button>
          <span className="font-semibold text-gray-900 w-8 text-center">{item.quantity}</span>
          <button 
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <span className="font-bold">+</span>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-gray-600">Subtotal: {formatPrice(item.price * item.quantity)}</span>
        <button 
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700 font-medium text-sm"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

export default CartItem

