import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiBaseUrl } from '../services/api'

// Fallback dummy data generator (used if API fails)
const generateDummyData = () => {
  // Generate hourly orders data for the last 24 hours
  const hourlyOrders = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    orders: Math.floor(Math.random() * 20) + 5,
  }))

  // Generate daily trips for the last 7 days
  const dailyTrips = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      trips: Math.floor(Math.random() * 50) + 20,
    }
  })

  // Generate error logs
  const errorTypes = [
    { type: 'Emergency Break Occurrence', severity: 'high', count: Math.floor(Math.random() * 5) },
    { type: 'Break Engage & Disengaged', severity: 'medium', count: Math.floor(Math.random() * 10) + 2 },
    { type: 'Goal Fail', severity: 'high', count: Math.floor(Math.random() * 8) + 1 },
    { type: 'Mission Fail', severity: 'high', count: Math.floor(Math.random() * 6) + 1 },
    { type: 'Battery Hit 20% Threshold', severity: 'medium', count: Math.floor(Math.random() * 15) + 5 },
    { type: 'Navigation Timeout', severity: 'low', count: Math.floor(Math.random() * 20) + 10 },
    { type: 'Sensor Error', severity: 'medium', count: Math.floor(Math.random() * 12) + 3 },
  ]

  return {
    ordersPerHour: Math.floor(Math.random() * 15) + 8,
    tripsPerDay: Math.floor(Math.random() * 50) + 30,
    robotUtilization: Math.floor(Math.random() * 30) + 60, // 60-90%
    successRate: Math.floor(Math.random() * 10) + 88, // 88-98%
    distanceCovered: (Math.random() * 50 + 100).toFixed(2), // km
    avgRobotSpeed: (Math.random() * 0.5 + 1.2).toFixed(2), // m/s
    peakBusyHour: hourlyOrders.reduce((max, item) => item.orders > max.orders ? item : max, hourlyOrders[0]).hour,
    hourlyOrders,
    dailyTrips,
    errorLogs: errorTypes.filter(e => e.count > 0).map(error => ({
      ...error,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    })),
  }
}

const RoboLogsPage = ({ isAuthenticated, onLogout, setToast: externalSetToast }) => {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useDummyData, setUseDummyData] = useState(false)

  // Fetch data from API
  const fetchRobotLogsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const apiBaseUrl = getApiBaseUrl()
      const response = await fetch(`${apiBaseUrl}/api/qr-menu/admin/robot-logs/dashboard`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const apiData = await response.json()
      
      // Transform API data to match frontend format
      const transformedData = {
        ordersPerHour: apiData.ordersPerHour || 0,
        tripsPerDay: apiData.tripsPerDay || 0,
        robotUtilization: apiData.robotUtilization || 0,
        successRate: apiData.successRate || 0,
        distanceCovered: apiData.distanceCovered || 0,
        avgRobotSpeed: apiData.avgRobotSpeed || 0,
        peakBusyHour: apiData.peakBusyHour || 0,
        hourlyOrders: apiData.hourlyOrders || [],
        dailyTrips: apiData.dailyTrips || [],
        errorLogs: apiData.errorLogs || [],
      }
      
      setData(transformedData)
      setUseDummyData(false)
    } catch (err) {
      console.error('Error fetching robot logs data:', err)
      setError(err.message)
      // Fallback to dummy data if API fails
      setData(generateDummyData())
      setUseDummyData(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (!isAuthenticated) return
    fetchRobotLogsData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return

    const refreshInterval = setInterval(() => {
      fetchRobotLogsData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(refreshInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  // Show loading state
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading robot logs data...</p>
        </div>
      </div>
    )
  }

  // Use data or fallback to empty state
  const displayData = data || generateDummyData()

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTime = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${period}`
  }

  // Find max value for chart scaling
  const maxOrders = Math.max(...displayData.hourlyOrders.map(h => h.orders), 1)
  const maxTrips = Math.max(...displayData.dailyTrips.map(d => d.trips), 1)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Robot Logs Dashboard</h1>
                <p className="text-gray-600 mt-1">Monitor robot performance and metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                  <span className="text-sm">Refreshing...</span>
                </div>
              )}
              {useDummyData && (
                <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Using demo data</span>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>API Error</span>
                </div>
              )}
              <button
                onClick={fetchRobotLogsData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                disabled={isLoading}
              >
                Refresh
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
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Orders Per Hour */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Current</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Orders Per Hour</p>
            <p className="text-3xl font-bold text-gray-900">{displayData.ordersPerHour}</p>
            <p className="text-xs text-gray-500 mt-2">Average across all robots</p>
          </div>

          {/* Trips Per Day */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Today</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Trips Per Day</p>
            <p className="text-3xl font-bold text-gray-900">{displayData.tripsPerDay}</p>
            <p className="text-xs text-gray-500 mt-2">Total completed trips</p>
          </div>

          {/* Robot Utilization */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Avg</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Robot Utilization</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{displayData.robotUtilization}%</p>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${displayData.robotUtilization}%` }}
              ></div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Overall</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Success Rate</p>
            <p className="text-3xl font-bold text-gray-900">{displayData.successRate}%</p>
            <p className="text-xs text-gray-500 mt-2">Mission completion rate</p>
          </div>
        </div>

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Distance Covered */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Distance Covered</p>
            <p className="text-2xl font-bold text-gray-900">{displayData.distanceCovered} km</p>
            <p className="text-xs text-gray-500 mt-2">Total distance today</p>
          </div>

          {/* Average Robot Speed */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Avg Robot Speed</p>
            <p className="text-2xl font-bold text-gray-900">{displayData.avgRobotSpeed} m/s</p>
            <p className="text-xs text-gray-500 mt-2">Average speed</p>
          </div>

          {/* Peak Busy Hour */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Peak Busy Hour</p>
            <p className="text-2xl font-bold text-gray-900">{formatTime(displayData.peakBusyHour)}</p>
            <p className="text-xs text-gray-500 mt-2">Highest activity period</p>
          </div>

          {/* Total Errors */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Errors</p>
            <p className="text-2xl font-bold text-gray-900">{displayData.errorLogs.reduce((sum, e) => sum + e.count, 0)}</p>
            <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Orders Per Hour Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Per Hour (Last 24 Hours)</h3>
            <div className="h-64 flex items-end justify-between gap-1">
              {displayData.hourlyOrders.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end" style={{ height: '200px' }}>
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer group relative"
                      style={{ height: `${(item.orders / maxOrders) * 100}%` }}
                      title={`${formatTime(item.hour)}: ${item.orders} orders`}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {item.orders} orders
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
                    {item.hour % 6 === 0 ? formatTime(item.hour) : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trips Per Day Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trips Per Day (Last 7 Days)</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {displayData.dailyTrips.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end" style={{ height: '200px' }}>
                    <div
                      className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer group relative"
                      style={{ height: `${(item.trips / maxTrips) * 100}%` }}
                      title={`${item.date}: ${item.trips} trips`}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {item.trips} trips
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error/Fault Logs Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Error & Fault Logs</h3>
              <p className="text-sm text-gray-600 mt-1">Recent system errors and warnings</p>
            </div>
            <button
              onClick={fetchRobotLogsData}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>

          {displayData.errorLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Errors</h3>
              <p className="text-gray-600">All systems operating normally</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Error Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Severity</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Count</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Occurrence</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.errorLogs.map((error, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-900">{error.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(error.severity)}`}>
                          {error.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900">{error.count}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">
                          {new Date(error.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default RoboLogsPage

