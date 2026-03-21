import QRCode from 'qrcode';

/**
 * Generate a QR code as a data URL (server-side, no canvas/DOM needed).
 */
export async function generateQRCodeDataUrl(url, { width = 400, margin = 4 } = {}) {
  return QRCode.toDataURL(url, {
    width,
    margin,
    errorCorrectionLevel: 'H',
  });
}

/**
 * Client-side QR code generation with logo overlay.
 */
export async function generateQRCodeWithLogo(url, { width = 400, margin = 6 } = {}) {
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, url, {
    width,
    margin,
    errorCorrectionLevel: 'H',
  });

  const ctx = canvas.getContext('2d');

  const logo = new Image();
  logo.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    logo.onload = resolve;
    logo.onerror = reject;
    logo.src = '/android-chrome-192x192.png';
  });

  const logoSize = width * 0.2;
  const x = (canvas.width - logoSize) / 2;
  const y = (canvas.height - logoSize) / 2;

  const padding = logoSize * 0.15;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2, 6);
  ctx.fill();

  ctx.drawImage(logo, x, y, logoSize, logoSize);

  return canvas.toDataURL('image/png');
}
