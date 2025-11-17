import { formatPrice } from '../utils/formatters'

const MenuItem = ({ item, quantity, onAddToCart, onUpdateQuantity }) => {
  return (
    <div className="card hover:shadow-xl transition-shadow duration-300">
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
      {quantity === 0 ? (
        <button 
          onClick={() => onAddToCart(item)}
          className="btn-primary w-full mt-4"
        >
          Add to Cart
        </button>
      ) : (
        <div className="flex items-center justify-center space-x-3 mt-4">
          <button 
            onClick={() => onUpdateQuantity(item.id, quantity - 1)}
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <span className="text-gray-700 font-bold text-lg">−</span>
          </button>
          <span className="font-semibold text-gray-900 text-lg min-w-[2rem] text-center">
            {quantity}
          </span>
          <button 
            onClick={() => onUpdateQuantity(item.id, quantity + 1)}
            className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <span className="font-bold text-lg">+</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default MenuItem

