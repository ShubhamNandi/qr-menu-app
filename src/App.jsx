import { useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('menu')
  const [cart, setCart] = useState([])
  const [orderConfirmed, setOrderConfirmed] = useState(false)

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

  const confirmOrder = () => {
    setOrderConfirmed(true)
    setActiveTab('menu')
    // Reset after 5 seconds
    setTimeout(() => {
      setOrderConfirmed(false)
      setCart([])
    }, 5000)
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
              <span className="text-lg font-semibold text-blue-600">#{Math.floor(Math.random() * 10000) + 1000}</span>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QSR Express Menu</h1>
              <p className="text-gray-600 mt-1">Please select the items you want to order!</p>
            </div>
            <div className="flex items-center space-x-4">
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Our Menu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="card hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{item.image}</div>
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
                  <button 
                    onClick={() => addToCart(item)}
                    className="btn-primary w-full mt-4"
                  >
                    Add to Cart
                  </button>
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
                        <div className="text-3xl">{item.image}</div>
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
                  <button 
                    onClick={confirmOrder}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-green-700 active:bg-green-800 transition-colors"
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 QR Menu App. All rights reserved.</p>
          <p className="text-gray-500 mt-2">Scan the QR code to access this menu on your device</p>
        </div>
      </footer>
    </div>
  )
}

export default App
