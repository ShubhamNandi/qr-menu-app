import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AccessPage = ({ tableError, onStartScan, onPinSubmit, isLoadingTable, tableNumber }) => {
  const navigate = useNavigate()
  const [pinInput, setPinInput] = useState('')
  const [isValidatingPin, setIsValidatingPin] = useState(false)

  const handlePinSubmit = async () => {
    if (pinInput.length !== 4) {
      return
    }
    
    setIsValidatingPin(true)
    try {
      const success = await onPinSubmit(pinInput)
      if (success) {
        setPinInput('')
      }
    } finally {
      setIsValidatingPin(false)
    }
  }

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Access Menu</h1>
          <p className="text-lg text-gray-600 mb-6">{tableError}</p>
          
          {/* If table is validated, show button to view menu */}
          {tableNumber ? (
            <div className="mb-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-4">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-800 font-semibold">Table {tableNumber} Verified!</p>
                </div>
                <button
                  onClick={() => navigate('/menu')}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:bg-green-700 active:bg-green-800 transition-colors shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>View Menu</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Scan QR Code Option */}
              <div className="mb-6">
                <button
                  onClick={onStartScan}
                  className="w-full bg-gray-900 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:bg-gray-800 active:bg-gray-700 transition-colors shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Scan QR Code</span>
                </button>
              </div>
            </>
          )}

          {!tableNumber && (
            <>
              {/* Divider */}
              <div className="flex items-center mb-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500">OR</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Enter Table PIN Option */}
            </>
          )}

          {!tableNumber && (
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Table PIN
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="4"
                  value={pinInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setPinInput(value)
                  }}
                  placeholder="0000"
                  className="w-full px-4 py-3 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900"
                  disabled={isValidatingPin}
                />
              </div>
              <div className="mt-2 flex items-center justify-center space-x-1 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Find your table PIN below the QR code on your table</span>
              </div>
            </div>
            <button
              onClick={handlePinSubmit}
              disabled={pinInput.length !== 4 || isValidatingPin}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-colors shadow-lg ${
                pinInput.length === 4 && !isValidatingPin
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isValidatingPin ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validating...
                </span>
              ) : (
                'Submit PIN'
              )}
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccessPage

