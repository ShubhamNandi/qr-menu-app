const Header = ({ activeTab, setActiveTab, tableNumber, tableError, isOnline, totalItems }) => {
  return (
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">QSR Express Menu</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-sm sm:text-base text-gray-600">Please select the items you want to order!</p>
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
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('menu')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                activeTab === 'menu' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Menu
            </button>
            <button 
              onClick={() => setActiveTab('cart')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors relative text-sm sm:text-base ${
                activeTab === 'cart' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
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
  )
}

export default Header

