'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface Session {
  _id: string;
  title: string;
  course: string;
  lecturer: string;
  startTime: string;
  endTime: string;
  location: string;
  qrCode: string;
  isActive: boolean;
}

interface QRCodeDisplayProps {
  session: Session;
  onClose: () => void;
}

export default function QRCodeDisplay({ session, onClose }: QRCodeDisplayProps) {
  const downloadQR = async () => {
    try {
      const link = document.createElement('a');
      link.href = session.qrCode;
      link.download = `${session.course}-${session.title}-QR.png`;
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const printQR = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${session.title}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
              }
              .header { 
                margin-bottom: 20px; 
                color: #1e40af;
              }
              .qr-container {
                margin: 20px 0;
              }
              .details {
                text-align: left;
                max-width: 400px;
                margin: 0 auto;
                border: 1px solid #e5e7eb;
                padding: 20px;
                border-radius: 8px;
              }
              .detail-item {
                margin: 10px 0;
                padding: 5px 0;
                border-bottom: 1px solid #f3f4f6;
              }
              .label {
                font-weight: bold;
                color: #374151;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Niger Delta University</h1>
              <h2>Attendance QR Code</h2>
            </div>
            <div class="qr-container">
              <img src="${session.qrCode}" alt="QR Code" style="max-width: 300px;" />
            </div>
            <div class="details">
              <div class="detail-item">
                <span class="label">Course:</span> ${session.course}
              </div>
              <div class="detail-item">
                <span class="label">Session:</span> ${session.title}
              </div>
              <div class="detail-item">
                <span class="label">Lecturer:</span> ${session.lecturer}
              </div>
              <div class="detail-item">
                <span class="label">Date:</span> ${format(new Date(session.startTime), 'MMMM dd, yyyy')}
              </div>
              <div class="detail-item">
                <span class="label">Time:</span> ${format(new Date(session.startTime), 'HH:mm')} - ${format(new Date(session.endTime), 'HH:mm')}
              </div>
              <div class="detail-item">
                <span class="label">Location:</span> ${session.location}
              </div>
            </div>
            <script>window.print(); window.onafterprint = function(){ window.close(); };</script>
          </body>
        </html>
      `);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            QR Code for {session.course}
            <Badge variant={session.isActive ? "default" : "secondary"}>
              {session.isActive ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{session.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(session.startTime), 'MMMM dd, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {format(new Date(session.startTime), 'HH:mm')} - {format(new Date(session.endTime), 'HH:mm')}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{session.location}</span>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
              <img 
                src={session.qrCode} 
                alt="QR Code" 
                className="w-64 h-64 mx-auto"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Students can scan this code to mark their attendance
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={downloadQR}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            
            <Button
              onClick={printQR}
              variant="outline"
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            
            <Button
              onClick={onClose}
              className="flex-1 bg-blue-800 hover:bg-blue-900"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}