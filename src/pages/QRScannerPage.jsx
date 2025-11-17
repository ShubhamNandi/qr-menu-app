const QRScannerPage = ({ scanError, onStop }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Scan QR Code</h1>
          <p className="text-gray-300">Point your camera at the QR code on your table</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 mb-4">
          <div id="qr-reader" className="w-full"></div>
        </div>

        {scanError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <p className="text-red-800 text-sm">{scanError}</p>
          </div>
        )}

        <button
          onClick={onStop}
          className="w-full bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default QRScannerPage

