import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Globe,
  Copy,
  Check,
  QrCode,
  Share2,
  ExternalLink,
  Search,
  FileCheck2,
  PenTool,
  Download,
  X,
  MessageCircle,
  Mail,
  Send,
  Sparkles,
} from 'lucide-react';
import { AppState } from '../types';

interface ShareTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

export const ShareTraceModal: React.FC<ShareTraceModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'search_preview' | 'seo_info'>('link');
  const [selectedLinkType, setSelectedLinkType] = useState<'main' | 'presensi' | 'verifikasi'>('main');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Get current web address origin or production URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-5ur5m4o5fevdav3lg5cj67-513616529310.asia-east1.run.app';
  
  // Construct targeted URLs
  const mainUrl = baseUrl;
  const presensiUrl = `${baseUrl}?view=presensi&kiosk=true`;
  const verifikasiUrl = `${baseUrl}?verify=1&no=${encodeURIComponent(state.config.noSurat || 'OFFICIAL-DOC')}&unit=${encodeURIComponent(state.config.unitKerja || '')}`;

  const currentTargetUrl = 
    selectedLinkType === 'main' ? mainUrl :
    selectedLinkType === 'presensi' ? presensiUrl : verifikasiUrl;

  // Generate QR Code dynamically
  useEffect(() => {
    QRCode.toDataURL(currentTargetUrl, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed generating QR code', err));
  }, [currentTargetUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentTargetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_Akses_${selectedLinkType}_${state.config.kota || 'Dokumen'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: state.config.judulRapat || 'Sistem Laporan Resmi & Presensi Digital',
          text: `Akses dokumen tata naskah dinas resmi dan presensi kehadiran "${state.config.judulRapat}":`,
          url: currentTargetUrl,
        });
      } catch (err) {
        // Share cancelled or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  const waShareText = encodeURIComponent(
    `*Yth. Bapak/Ibu Peserta Rapat & Rekan Kerja*\n\nBerikut tautan alamat web resmi untuk mengakses dokumen *${state.config.judulRapat}*:\n🔗 ${currentTargetUrl}\n\n_Unit Kerja: ${state.config.unitKerja}_\n_Nomor: ${state.config.noSurat}_`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white text-slate-800 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 rounded-xl border border-blue-400/30 backdrop-blur-md">
              <Globe className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Alamat Web &amp; Akses Penelusuran
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40">
                  Terindeks &amp; Mudah Ditelusuri
                </span>
              </h3>
              <p className="text-xs text-blue-200/80">
                Bagikan alamat web aplikasi, buat barcode/QR cepat, atau cek keterlacakan di mesin pencari.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'link'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Alamat Web &amp; Tautan</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'qr'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code Pindai Cepat</span>
          </button>
          <button
            onClick={() => setActiveTab('search_preview')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'search_preview'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Pratinjau Telusur Google</span>
          </button>
          <button
            onClick={() => setActiveTab('seo_info')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'seo_info'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Keterlacakan SEO</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">

          {/* Type Selector (Tujuan Tautan) */}
          <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1 text-xs font-medium">
            <button
              onClick={() => setSelectedLinkType('main')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                selectedLinkType === 'main'
                  ? 'bg-white text-blue-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Halaman Utama</span>
            </button>
            <button
              onClick={() => setSelectedLinkType('presensi')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                selectedLinkType === 'presensi'
                  ? 'bg-white text-blue-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-blue-600" />
              <span>Kiosk Presensi Langsung</span>
            </button>
            <button
              onClick={() => setSelectedLinkType('verifikasi')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                selectedLinkType === 'verifikasi'
                  ? 'bg-white text-blue-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verifikasi Dokumen</span>
            </button>
          </div>

          {/* TAB 1: ALAMAT WEB & TAUTAN */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alamat Web Siap Dibagikan &amp; Ditelusur:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 break-all select-all focus-within:ring-2 focus-within:ring-blue-500">
                    {currentTargetUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 shadow-sm ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <a
                  href={`https://wa.me/?text=${waShareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Kirim WhatsApp</span>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(currentTargetUrl)}&text=${encodeURIComponent(state.config.judulRapat || 'Laporan Rapat Resmi')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl border border-sky-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4 text-sky-600" />
                  <span>Kirim Telegram</span>
                </a>
                <button
                  onClick={handleNativeShare}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Share2 className="w-4 h-4 text-slate-600" />
                  <span>Bagikan Lainnya</span>
                </button>
              </div>

              {/* Explanatory notes */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  Alamat Web Permanen &amp; Dapat Diakses Dari Perangkat Apapun
                </p>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Peserta, pimpinan rapat, atau pemeriksa dokumen dapat langsung membuka tautan ini dari komputer, tablet, maupun ponsel tanpa perlu menginstal aplikasi tambahan.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: QR CODE PINDAI CEPAT */}
          {activeTab === 'qr' && (
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="p-3 bg-white border-2 border-slate-300 rounded-2xl shadow-md flex-shrink-0">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code Alamat Web"
                    className="w-44 h-44 object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                    Membuat QR Code...
                  </div>
                )}
              </div>

              <div className="space-y-3 flex-1 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Pindai Langsung dengan Kamera Ponsel
                  </h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Tampilkan kode QR ini di layar proyektor ruang rapat, atau unduh gambarnya untuk disematkan pada undangan surat agar peserta rapat dapat langsung menandatangani presensi digital.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleDownloadQR}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Gambar QR (.png)</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-xl font-bold flex items-center gap-1.5 text-xs transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin Tautan'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRATINJAU TELUSUR GOOGLE (SERP) */}
          {activeTab === 'search_preview' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Berikut pratinjau tampilan alamat web ini ketika dicari atau terindeks di mesin penelusur Google:
              </p>

              {/* Google Result Mockup Card */}
              <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <div className="w-4 h-4 rounded-full bg-blue-900 text-white flex items-center justify-center text-[9px] font-bold">
                    N
                  </div>
                  <span className="text-slate-800 font-medium">Sistem Laporan Resmi &amp; Presensi Digital</span>
                  <span className="text-slate-400">›</span>
                  <span className="text-slate-500 font-mono text-[10px] truncate max-w-[200px]">
                    {baseUrl.replace('https://', '')}
                  </span>
                </div>

                <h4 className="text-base font-semibold text-blue-800 hover:underline cursor-pointer leading-snug">
                  Sistem Laporan Resmi, Notulensi &amp; Presensi Digital – Tata Naskah Dinas A4
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <span className="text-slate-400">3 Okt 2026 — </span>
                  Aplikasi pembuat <strong className="text-slate-800">laporan dinas resmi</strong>, <strong className="text-slate-800">notulensi rapat</strong>, matriks rencana tindak lanjut, dan <strong className="text-slate-800">presensi digital</strong> dengan tanda tangan elektronik siap cetak format A4.
                </p>

                <div className="pt-2 flex flex-wrap gap-2 text-[10px]">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                    Kop Surat Otomatis
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                    Tanda Tangan Elektronik
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                    Cetak Standar A4
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                    Word &amp; PDF
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KETERLACAKAN SEO & SPESIFIKASI */}
          {activeTab === 'seo_info' && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Robots.txt &amp; Sitemap XML</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Search engine crawler (Googlebot) diizinkan mengindeks seluruh halaman.
                  </p>
                </div>

                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>Schema.org JSON-LD</span>
                  </div>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Format terstruktur WebApplication &amp; WebSite untuk snippet penelusuran kaya.
                  </p>
                </div>

                <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <Check className="w-3.5 h-3.5 text-indigo-600" />
                    <span>OpenGraph &amp; Twitter Card</span>
                  </div>
                  <p className="text-[11px] text-indigo-800 mt-0.5">
                    Kartu visual otomatis saat tautan dibagikan di WhatsApp, LinkedIn, dan medsos.
                  </p>
                </div>

                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Check className="w-3.5 h-3.5 text-amber-600" />
                    <span>PWA Web Manifest</span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Memungkinkan web ditambahkan ke layar utama ponsel dan dapat dibuka cepat.
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                <span className="font-bold block text-slate-900 mb-1">
                  💡 Tips Agar Alamat Web Selalu Mudah Ditemukan Petugas:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                  <li>Bookmark alamat web ini pada browser dengan menekan <code>Ctrl + D</code> (Windows) atau <code>Cmd + D</code> (Mac).</li>
                  <li>Sematkan QR code pada lembar cetak surat undangan rapat.</li>
                  <li>Gunakan tautan verifikasi pada footer dokumen untuk pengecekan keabsahan naskah dinas.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono truncate max-w-[280px]">
            {currentTargetUrl}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Tersalin' : 'Salin Alamat'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-medium transition"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
