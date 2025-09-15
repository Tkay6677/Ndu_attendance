import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret';

export async function generateQRCodeForSession(sessionId: string): Promise<string> {
  const payload = {
    sessionId,
    timestamp: Date.now(),
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
  const qrData = `${process.env.NEXTAUTH_URL}/attendance/scan?token=${token}`;
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#003366',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export function verifyQRToken(token: string): { sessionId: string; timestamp: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      sessionId: decoded.sessionId,
      timestamp: decoded.timestamp,
    };
  } catch (error) {
    console.error('Invalid QR token:', error);
    return null;
  }
}