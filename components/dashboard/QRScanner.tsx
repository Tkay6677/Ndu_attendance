'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, QrCode, Camera, Link } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

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
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        },
        false
      );
      
      scannerRef.current.render(
        (decodedText) => {
          handleQrResult(decodedText);
          if (scannerRef.current) {
            scannerRef.current.clear();
          }
        },
        (error) => {
          console.log(error);
          // Ignore errors during scanning
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
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
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                <div id="qr-reader" className="w-full h-full"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsScanning(false);
                  if (scannerRef.current) {
                    scannerRef.current.clear();
                  }
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
