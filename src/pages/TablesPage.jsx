import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllTables, configureTables, getQRCodesInfo, downloadQRCode, downloadAllQRCodes } from '../services/tableService'

const TablesPage = ({ isAuthenticated, onLogout, setToast: externalSetToast }) => {
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [tables, setTables] = useState([])
  const [qrCodesInfo, setQRCodesInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [showConfigureModal, setShowConfigureModal] = useState(false)
  const [totalTablesInput, setTotalTablesInput] = useState('')
  const [copiedToken, setCopiedToken] = useState(null)
  const [copiedPin, setCopiedPin] = useState(null)
  const [copiedUrl, setCopiedUrl] = useState(null)
  
  // Use external toast if provided, otherwise use internal
  const showToast = externalSetToast || setToast

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Fetch tables and QR codes info
  const fetchTables = async () => {
    try {
      setIsLoading(true)
      const [tablesData, qrData] = await Promise.all([
        getAllTables(),
        getQRCodesInfo().catch(() => null) // Don't fail if QR codes info fails
      ])
      
      setTables(tablesData.tables || [])
      setQRCodesInfo(qrData)
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Failed to load tables'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchTables()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast && !externalSetToast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [toast, externalSetToast])

  // Handle configure tables
  const handleConfigureTables = async () => {
    const totalTables = parseInt(totalTablesInput, 10)
    
    if (isNaN(totalTables) || totalTables < 1 || totalTables > 100) {
      showToast({
        type: 'error',
        message: 'Please enter a number between 1 and 100'
      })
      return
    }

    try {
      setIsConfiguring(true)
      await configureTables(totalTables)
      showToast({
        type: 'success',
        message: `Successfully configured ${totalTables} table(s)`
      })
      setShowConfigureModal(false)
      setTotalTablesInput('')
      await fetchTables() // Refresh tables
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Failed to configure tables'
      })
    } finally {
      setIsConfiguring(false)
    }
  }

  // Copy to clipboard helper
  const copyToClipboard = async (text, type, setCopied) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
      showToast({
        type: 'success',
        message: 'Copied to clipboard!'
      })
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to copy to clipboard'
      })
    }
  }

  // Download single QR code
  const handleDownloadQRCode = async (tableNumber) => {
    try {
      await downloadQRCode(tableNumber)
      showToast({
        type: 'success',
        message: `Downloaded QR code for table ${tableNumber}`
      })
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Failed to download QR code'
      })
    }
  }

  // Download all QR codes
  const handleDownloadAllQRCodes = async () => {
    try {
      await downloadAllQRCodes()
      showToast({
        type: 'success',
        message: 'Downloaded all QR codes as ZIP file'
      })
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Failed to download QR codes'
      })
    }
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  // Create a map of table number to QR info for quick lookup
  const qrInfoMap = {}
  if (qrCodesInfo && qrCodesInfo.tables) {
    qrCodesInfo.tables.forEach(table => {
      qrInfoMap[table.table_number] = table
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && !externalSetToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`${toast.type === 'error' ? 'bg-red-500' : toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 min-w-[300px] max-w-md animate-slide-in`}>
            <div className="flex-shrink-0">
              {toast.type === 'error' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="flex-1 font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
              <p className="text-gray-600 mt-1">Create, configure, and view table codes</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setShowConfigureModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Configure Tables
          </button>
          {tables.length > 0 && (
            <button
              onClick={handleDownloadAllQRCodes}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All QR Codes
            </button>
          )}
        </div>

        {/* Statistics Card */}
        {tables.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tables Configured</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{tables.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Tables List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tables...</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🪑</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tables configured</h3>
            <p className="text-gray-600 mb-6">Get started by configuring your tables</p>
            <button
              onClick={() => setShowConfigureModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Configure Tables
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => {
              const qrInfo = qrInfoMap[table.table_number]
              return (
                <div key={table.table_number} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Table {table.table_number}</h3>
                    </div>
                    <button
                      onClick={() => handleDownloadQRCode(table.table_number)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download QR Code"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>

                  {/* Token */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 break-all">
                        {table.token}
                      </code>
                      <button
                        onClick={() => copyToClipboard(table.token, `token-${table.table_number}`, setCopiedToken)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                        title="Copy token"
                      >
                        {copiedToken === `token-${table.table_number}` ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* PIN */}
                  {qrInfo && qrInfo.pin && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-800">
                          {qrInfo.pin}
                        </code>
                        <button
                          onClick={() => copyToClipboard(qrInfo.pin, `pin-${table.table_number}`, setCopiedPin)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                          title="Copy PIN"
                        >
                          {copiedPin === `pin-${table.table_number}` ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* QR Code URL */}
                  {qrInfo && qrInfo.qr_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">QR Code URL</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 break-all">
                          {qrInfo.qr_url}
                        </code>
                        <button
                          onClick={() => copyToClipboard(qrInfo.qr_url, `url-${table.table_number}`, setCopiedUrl)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                          title="Copy URL"
                        >
                          {copiedUrl === `url-${table.table_number}` ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Configure Tables Modal */}
      {showConfigureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Configure Tables</h2>
              <button
                onClick={() => {
                  setShowConfigureModal(false)
                  setTotalTablesInput('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Enter the total number of tables you want to configure. This will generate tokens, PINs, and QR codes for all tables.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Tables (1-100)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={totalTablesInput}
                onChange={(e) => setTotalTablesInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 10"
                autoFocus
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This will replace all existing table configurations.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfigureModal(false)
                  setTotalTablesInput('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                disabled={isConfiguring}
              >
                Cancel
              </button>
              <button
                onClick={handleConfigureTables}
                disabled={isConfiguring}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConfiguring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Configuring...
                  </>
                ) : (
                  'Configure'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TablesPage

