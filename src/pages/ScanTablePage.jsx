import { useState } from 'react'
import AccessPage from './AccessPage'
import QRScannerPage from './QRScannerPage'
import { useTableContext } from '../contexts/TableContext'
import { useQRScanner } from '../hooks/useQRScanner'

const ScanTablePage = ({ setToast }) => {
  const table = useTableContext()
  const qrScanner = useQRScanner(table.handleScannedToken, setToast)

  // Handle PIN submit
  const handlePinSubmit = async (pin) => {
    return await table.handlePinSubmit(pin)
  }

  // Show QR scanner page
  if (qrScanner.isScanning) {
    return (
      <QRScannerPage
        scanError={qrScanner.scanError}
        onStop={qrScanner.stopQRScanner}
      />
    )
  }

  // Show loading screen while validating QR code
  if (table.isLoadingTable) {
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

  // Always show access page on /scantable (even if table is validated)
  // Users can navigate to /menu to see the menu
  return (
    <AccessPage
      tableError={table.tableError || 'Please scan the QR code to access the menu'}
      onStartScan={qrScanner.startQRScanner}
      onPinSubmit={handlePinSubmit}
      isLoadingTable={table.isLoadingTable}
      tableNumber={table.tableNumber}
    />
  )
}

export default ScanTablePage

