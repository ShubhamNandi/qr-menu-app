import { formatPrice } from '../utils/formatters'
import CartItem from '../components/CartItem'

const CartPage = ({ 
  cart, 
  onUpdateQuantity, 
  onRemove, 
  onBackToMenu, 
  totalPrice, 
  orderError, 
  isSubmittingOrder, 
  onConfirmOrder 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
        <button 
          onClick={onBackToMenu}
          className="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base"
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
            onClick={onBackToMenu}
            className="btn-primary"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))}
          
          {/* Total and Confirm */}
          <div className="card bg-gray-50 border-2 border-gray-200">
            <div className="flex items-center justify-between text-lg font-semibold mb-4">
              <span className="text-gray-900">Total:</span>
              <span className="text-2xl text-gray-900">{formatPrice(totalPrice)}</span>
            </div>
            {orderError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-800 text-sm">{orderError}</p>
              </div>
            )}
            <button 
              onClick={onConfirmOrder}
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
  )
}

export default CartPage

