'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, QrCode, Camera, Link } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function QRScanner({ onClose, onSuccess }: QRScannerProps) {
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  const stopScanner = async () => {
    try {
      if (scannerRef.current && isScanningRef.current) {
        await scannerRef.current.stop();
        isScanningRef.current = false;
      }
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }
  };

  useEffect(() => {
    const startScanner = async () => {
      if (!isScanning) return;

      try {
        scannerRef.current = new Html5Qrcode('qr-reader');
        isScanningRef.current = true;
        
        await scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            await stopScanner();
            handleQrResult(decodedText);
          },
          (errorMessage) => {
            console.log(errorMessage);
          }
        );
      } catch (err) {
        console.error(err);
        setIsScanning(false);
        setShowUrlInput(true);
        setError('Camera access failed. You can manually enter the QR code URL instead.');
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isScanning]);

  const handleQrResult = async (decodedText: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Extract token from URL
      const url = new URL(decodedText);
      const token = url.searchParams.get('token');
      
      if (!token) {
        throw new Error('Invalid QR code URL');
      }

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record attendance');
      }

      setSuccess('Attendance recorded successfully!');
      setTimeout(() => onSuccess(), 2000);
    } catch (error: any) {
      setError(error.message);
      setIsScanning(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Scan QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!isScanning ? (
            <div className="space-y-4">
              {!showUrlInput ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => setIsScanning(true)}
                    className="flex-1 bg-blue-800 hover:bg-blue-900"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Scan with Camera
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUrlInput(true)}
                    className="flex-1"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Enter URL
                  </Button>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleQrResult(qrUrl);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="qrUrl">QR Code URL</Label>
                    <Input
                      id="qrUrl"
                      value={qrUrl}
                      onChange={(e) => setQrUrl(e.target.value)}
                      required
                      placeholder="Paste QR code URL here..."
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUrlInput(false)}
                      className="flex-1"
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-800 hover:bg-blue-900"
                      disabled={loading || !qrUrl}
                    >
                      {loading ? 'Recording...' : 'Mark Attendance'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                <div id="qr-reader" className="w-full h-full">
                  <style jsx global>{`
                    #qr-reader {
                      width: 100% !important;
                      height: 100% !important;
                      min-height: 300px !important;
                    }
                    #qr-reader video {
                      width: 100% !important;
                      height: 100% !important;
                      object-fit: cover !important;
                      border-radius: 8px !important;
                    }
                  `}</style>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  await stopScanner();
                  setIsScanning(false);
                }}
                className="w-full"
                disabled={loading}
              >
                Cancel Scanning
              </Button>
            </div>
          )}

          {(error || success) && (
            <div className={`flex items-center gap-2 p-3 ${
              error 
                ? 'text-red-700 bg-red-50 border border-red-200' 
                : 'text-green-700 bg-green-50 border border-green-200'
            } rounded-md`}>
              {error ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{error || success}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
