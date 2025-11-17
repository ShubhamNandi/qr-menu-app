import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export const useQRScanner = (onScanSuccess, setToast) => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState(null)
  const qrCodeScannerRef = useRef(null)
  const scannerStartedRef = useRef(false)

  const startQRScanner = () => {
    setIsScanning(true)
    setScanError(null)
  }

  const stopQRScanner = async () => {
    try {
      if (qrCodeScannerRef.current && scannerStartedRef.current) {
        // Only try to stop if scanner actually started
        await qrCodeScannerRef.current.stop().catch(() => {
          // Ignore errors when stopping (scanner might already be stopped)
        })
        await qrCodeScannerRef.current.clear().catch(() => {
          // Ignore errors when clearing
        })
        qrCodeScannerRef.current = null
        scannerStartedRef.current = false
      }
      setIsScanning(false)
      setScanError(null)
    } catch (err) {
      console.error('Error stopping QR scanner:', err)
      setIsScanning(false)
      scannerStartedRef.current = false
    }
  }

  // Start scanner after component renders (when isScanning becomes true)
  useEffect(() => {
    if (!isScanning) {
      // Reset scanner state when not scanning
      scannerStartedRef.current = false
      return
    }

    const initScanner = async () => {
      try {
        // Check if browser supports camera access
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera streaming not supported by the browser. Please use a modern browser with camera support.')
        }

        // Wait a bit for DOM to render
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const elementId = "qr-reader"
        const element = document.getElementById(elementId)
        
        if (!element) {
          throw new Error(`Element with id=${elementId} not found`)
        }
        
        const scanner = new Html5Qrcode(elementId)
        qrCodeScannerRef.current = scanner
        
        await scanner.start(
          { facingMode: "environment" }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // QR code scanned successfully
            onScanSuccess(decodedText)
            stopQRScanner()
          },
          (errorMessage) => {
            // Ignore scanning errors (they're frequent during scanning)
          }
        )
        
        // Mark scanner as successfully started
        scannerStartedRef.current = true
      } catch (err) {
        // Reset scanner state on error
        scannerStartedRef.current = false
        qrCodeScannerRef.current = null
        
        let errorMsg = 'Failed to start camera. '
        if (err.message && err.message.includes('not supported')) {
          errorMsg = err.message
        } else if (err.message && err.message.includes('permission')) {
          errorMsg = 'Camera permission denied. Please allow camera access and try again.'
        } else if (err.message && err.message.includes('not found')) {
          errorMsg = 'Camera not found. Please ensure your device has a camera.'
        } else {
          errorMsg += 'Please ensure camera permissions are granted and try again.'
        }
        
        setScanError(errorMsg)
        setIsScanning(false)
        setToast({ message: errorMsg, type: 'error' })
        console.error('Error starting QR scanner:', err)
      }
    }

    initScanner()

    // Cleanup on unmount or when isScanning changes
    return () => {
      if (qrCodeScannerRef.current && scannerStartedRef.current) {
        // Only try to stop if scanner actually started
        qrCodeScannerRef.current.stop().catch(() => {
          // Ignore errors when stopping (scanner might already be stopped)
        })
        qrCodeScannerRef.current.clear().catch(() => {
          // Ignore errors when clearing
        })
        qrCodeScannerRef.current = null
        scannerStartedRef.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning, onScanSuccess, setToast])

  return {
    isScanning,
    scanError,
    startQRScanner,
    stopQRScanner
  }
}

