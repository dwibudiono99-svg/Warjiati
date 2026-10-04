import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface VerificationBadgeProps {
  noSurat: string;
  pimpinan: string;
  kota: string;
  tanggal: string;
  compact?: boolean;
}

export const DocumentVerificationBadge: React.FC<VerificationBadgeProps> = ({
  noSurat,
  pimpinan,
  kota,
  tanggal,
  compact = false,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-5ur5m4o5fevdav3lg5cj67-513616529310.asia-east1.run.app';
    const verifyUrl = `${origin}/?verify=1&no=${encodeURIComponent(noSurat)}`;

    QRCode.toDataURL(verifyUrl, {
      width: compact ? 70 : 85,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Error generating verification QR', err));
  }, [noSurat, compact]);

  return (
    <div className={`flex items-center gap-2 border border-slate-300 rounded p-1.5 bg-slate-50/80 ${compact ? 'text-[7.5pt]' : 'text-[8pt]'} font-sans`}>
      <div className="flex-shrink-0 bg-white p-0.5 border border-slate-200 rounded shadow-xs">
        {qrCodeUrl ? (
          <img
            src={qrCodeUrl}
            alt="QR Verifikasi Dokumen & TNDE"
            className={compact ? 'w-9 h-9 object-contain' : 'w-10 h-10 object-contain'}
          />
        ) : (
          <div className={`${compact ? 'w-9 h-9' : 'w-10 h-10'} bg-slate-200 animate-pulse rounded`} />
        )}
      </div>

      <div className="leading-tight text-slate-700">
        <div className="flex items-center gap-1 font-bold text-blue-900">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          <span>Verifikasi TNDE &amp; Presensi Digital</span>
        </div>
        <p className="m-0 text-[7pt] text-slate-500 font-mono">No: {noSurat}</p>
        <p className="m-0 text-[7pt] text-slate-600">Disahkan: {pimpinan} ({kota}, {tanggal})</p>
        <p className="m-0 text-[6.5pt] text-blue-700/80 font-mono">Pindai QR untuk telusuri arsip naskah web</p>
      </div>
    </div>
  );
};

