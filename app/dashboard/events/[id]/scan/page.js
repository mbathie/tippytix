'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Camera, CheckCircle, XCircle, AlertTriangle, ScanLine } from 'lucide-react';

export default function ScanPage() {
  const { id } = useParams();
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    if (!scanning) return;

    let stream = null;
    let animationFrame = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          scanFrame();
        }
      } catch (err) {
        setCameraError('Unable to access camera. Please allow camera permissions or enter the code manually.');
        setScanning(false);
      }
    }

    function scanFrame() {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Use BarcodeDetector API if available
        if ('BarcodeDetector' in window) {
          const detector = new BarcodeDetector({ formats: ['qr_code'] });
          detector.detect(canvas).then(barcodes => {
            if (barcodes.length > 0) {
              handleScan(barcodes[0].rawValue);
              return;
            }
          }).catch(() => {});
        }
      }
      animationFrame = requestAnimationFrame(scanFrame);
    }

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [scanning]);

  async function handleScan(url) {
    setScanning(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }

    try {
      // Extract ticket info from QR URL
      // Format: /api/tickets/{ticketId}/verify?code={qrCode}
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/');
      const ticketIdIndex = parts.indexOf('tickets') + 1;
      const ticketId = parts[ticketIdIndex];
      const qrCode = urlObj.searchParams.get('code');

      if (!ticketId || !qrCode) {
        setResult({ valid: false, message: 'Invalid QR code format' });
        return;
      }

      const res = await fetch(`/api/tickets/${ticketId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ valid: false, message: 'Failed to verify ticket' });
    }
  }

  async function handleManualEntry(e) {
    e.preventDefault();
    if (!manualCode) return;
    // Try to parse as URL or direct code
    if (manualCode.startsWith('http')) {
      await handleScan(manualCode);
    } else {
      setResult({ valid: false, message: 'Please enter the full QR code URL' });
    }
  }

  function resetScanner() {
    setResult(null);
    setManualCode('');
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/events/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Event
        </Button>
      </div>


      {result ? (
        <Card className={result.valid ? 'border-green-500 border-2' : result.alreadyScanned ? 'border-yellow-500 border-2' : 'border-red-500 border-2'}>
          <CardContent className="py-8 text-center">
            {result.valid ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-700 mb-2">Valid Ticket!</h2>
              </>
            ) : result.alreadyScanned ? (
              <>
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-yellow-700 mb-2">Already Scanned!</h2>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-700 mb-2">Invalid Ticket</h2>
              </>
            )}
            <p className="text-gray-600 mb-4">{result.message}</p>
            {result.ticketInfo && (
              <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-1 mb-4">
                <p><strong>Name:</strong> {result.ticketInfo.customerName}</p>
                <p><strong>Ticket:</strong> {result.ticketInfo.ticketNumber}</p>
                <p><strong>Category:</strong> {result.ticketInfo.categoryName}</p>
                {result.checkedInAt && <p><strong>Scanned at:</strong> {new Date(result.checkedInAt).toLocaleString()}</p>}
              </div>
            )}
            <Button onClick={resetScanner} className="bg-violet-600 hover:bg-violet-700">
              <ScanLine className="w-4 h-4 mr-2" /> Scan Next Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" /> Camera Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scanning ? (
                <div className="relative">
                  <video ref={videoRef} className="w-full rounded-lg" playsInline />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 border-2 border-violet-500 rounded-lg pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-lg" />
                  </div>
                  <Button variant="outline" className="mt-3 w-full" onClick={() => setScanning(false)}>
                    Stop Camera
                  </Button>
                </div>
              ) : (
                <Button onClick={() => { setScanning(true); setCameraError(null); }} className="w-full bg-violet-600 hover:bg-violet-700">
                  <Camera className="w-4 h-4 mr-2" /> Start Camera
                </Button>
              )}
              {cameraError && <p className="text-sm text-red-500 mt-2">{cameraError}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualEntry} className="flex gap-2">
                <Input
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  placeholder="Paste QR code URL..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-violet-600 hover:bg-violet-700">Verify</Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
