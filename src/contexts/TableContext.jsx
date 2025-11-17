import { createContext, useContext, useState, useEffect } from 'react'
import { validateTableToken, validateTablePin } from '../services/tableService'

const TableContext = createContext(null)

export const useTableContext = () => {
  const context = useContext(TableContext)
  if (!context) {
    throw new Error('useTableContext must be used within TableProvider')
  }
  return context
}

export const TableProvider = ({ children, setToast }) => {
  const [tableNumber, setTableNumber] = useState(null)
  const [tableToken, setTableToken] = useState(null)
  const [tableError, setTableError] = useState(null)
  const [isLoadingTable, setIsLoadingTable] = useState(false)

  // Extract token from URL and fetch table number (runs immediately on mount)
  useEffect(() => {
    // Only process token if we don't already have a table number
    if (tableNumber) {
      return
    }

    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('t')
    
    // Remove token from URL IMMEDIATELY (synchronous, before any state updates)
    if (token) {
      const currentPath = window.location.pathname
      window.history.replaceState({}, '', currentPath)
    }
    
    if (token) {
      setTableToken(token)
      setIsLoadingTable(true)
      setTableError(null)
      
      validateTableToken(token)
        .then(data => {
          setTableNumber(data.table_number)
          setTableError(null)
          setIsLoadingTable(false)
        })
        .catch(err => {
          const errorMsg = 'Invalid QR code. Please scan a valid QR code to access the menu.'
          setTableError(errorMsg)
          setIsLoadingTable(false)
          setToast({ message: errorMsg, type: 'error' })
          console.error('Error fetching table number:', err)
        })
    } else {
      // No token - show access page
      if (!tableNumber) {
        setTableError('Please scan the QR code to access the menu')
      }
      setIsLoadingTable(false)
    }
  }, [setToast, tableNumber])

  const handlePinSubmit = async (pin) => {
    if (pin.length !== 4) {
      setToast({ message: 'Please enter a 4-digit PIN', type: 'error' })
      return false
    }

    setIsLoadingTable(true)
    setTableError(null)

    try {
      const data = await validateTablePin(pin)
      setTableNumber(data.table_number)
      setTableError(null)
      setToast({ message: 'Table PIN validated successfully! Welcome to the menu!', type: 'success' })
      return true
    } catch (err) {
      let errorMsg = 'Unable to validate PIN. Please try again.'
      
      if (err.message === 'PIN_NOT_FOUND') {
        errorMsg = 'Invalid PIN. Please check the 4-digit PIN below the QR code on your table and try again.'
      } else if (err.message === 'SERVER_ERROR') {
        errorMsg = 'Server error. Please try again in a moment.'
      } else if (err.message === 'NETWORK_ERROR' || err.message.includes('Failed to fetch')) {
        errorMsg = 'Network error. Please check your connection and try again.'
      } else if (err.message && err.message.includes('CORS')) {
        errorMsg = 'Connection error. Please check your network settings.'
      }
      
      setTableError(errorMsg)
      setToast({ message: errorMsg, type: 'error' })
      console.error('Error validating PIN:', err)
      return false
    } finally {
      setIsLoadingTable(false)
    }
  }

  const handleScannedToken = (token) => {
    // Extract token from URL if it's a full URL, or use token directly
    let extractedToken = token
    try {
      const url = new URL(token)
      const params = new URLSearchParams(url.search)
      extractedToken = params.get('t') || token
    } catch {
      // Not a URL, use token as-is
      extractedToken = token
    }

    if (extractedToken) {
      setTableToken(extractedToken)
      setIsLoadingTable(true)
      setTableError(null)
      
      validateTableToken(extractedToken)
        .then(data => {
          setTableNumber(data.table_number)
          setTableError(null)
          setIsLoadingTable(false)
          setToast({ message: 'QR code validated successfully!', type: 'success' })
        })
        .catch(err => {
          const errorMsg = 'Invalid QR code. Please scan a valid QR code to access the menu.'
          setTableError(errorMsg)
          setIsLoadingTable(false)
          setToast({ message: errorMsg, type: 'error' })
          console.error('Error fetching table number:', err)
        })
    }
  }

  return (
    <TableContext.Provider
      value={{
        tableNumber,
        tableToken,
        tableError,
        isLoadingTable,
        handlePinSubmit,
        handleScannedToken
      }}
    >
      {children}
    </TableContext.Provider>
  )
}

