import { formatPrice } from '../utils/formatters'

const OrderConfirmedPage = ({ orderId, totalPrice, onContinueShopping }) => {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-green-800 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-green-700">Thank you for your order</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 border border-green-100">
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
            <span className="text-2xl font-bold text-green-600">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-3">
          <button 
            onClick={onContinueShopping}
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

export default OrderConfirmedPage

