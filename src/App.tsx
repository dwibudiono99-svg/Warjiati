import { useState, useEffect } from 'react';
import { AppState } from './types';
import { defaultState, presetTemplates } from './data/presets';
import { Navbar } from './components/Navbar';
import { EditorSidebar } from './components/EditorSidebar';
import { DocumentPreview } from './components/DocumentPreview';
import { PreviewControls } from './components/PreviewControls';
import { QuickSignKioskModal } from './components/QuickSignKioskModal';
import { Check, ShieldCheck, X, Globe } from 'lucide-react';

const STORAGE_KEY = 'official_report_pro_data_v2';

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults in case of missing keys
        return {
          ...defaultState,
          ...parsed,
          config: {
            ...defaultState.config,
            ...(parsed.config || {}),
          },
        };
      }
    } catch (e) {
      console.warn('Failed loading localStorage', e);
    }
    return defaultState;
  });

  const [documentRevision, setDocumentRevision] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(new Date());
  const [zoom, setZoom] = useState<number>(88);
  const [viewMode, setViewMode] = useState<'all' | 'laporan' | 'action_plan' | 'presensi'>('all');

  // Kiosk / Tablet Modal state
  const [isKioskOpen, setIsKioskOpen] = useState<boolean>(false);
  const [selectedAttendeeForSign, setSelectedAttendeeForSign] = useState<string | undefined>(undefined);

  // URL Verification banner state for traceable addresses
  const [verificationBanner, setVerificationBanner] = useState<{
    show: boolean;
    noSurat?: string;
  }>({ show: false });

  // Handle URL query parameters for easy tracing
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);

      // Tracing view parameter
      const viewParam = params.get('view');
      if (viewParam === 'presensi' || viewParam === 'laporan' || viewParam === 'action_plan' || viewParam === 'all') {
        setViewMode(viewParam);
      }

      // Tracing kiosk sign mode
      if (params.get('kiosk') === 'true' || params.get('kiosk') === '1') {
        setIsKioskOpen(true);
      }

      // Tracing document verification parameter
      if (params.get('verify') === '1' || params.get('verify') === 'true') {
        const no = params.get('no') || state.config.noSurat;
        setVerificationBanner({
          show: true,
          noSurat: decodeURIComponent(no),
        });
      }
    } catch (err) {
      console.error('Error parsing URL search params', err);
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setLastSavedTime(new Date());
    } catch (e) {
      console.error('LocalStorage save failed', e);
    }
  }, [state]);

  const handleApplyPreset = (presetKey: string) => {
    const template = presetTemplates[presetKey];
    if (!template || !template.data) return;

    const newState: AppState = {
      config: {
        ...defaultState.config,
        ...(template.data.config || {}),
      },
      notulensi: [...(template.data.notulensi || defaultState.notulensi)],
      kesimpulan: [...(template.data.kesimpulan || defaultState.kesimpulan)],
      actionPlan: [...(template.data.actionPlan || defaultState.actionPlan)],
      attendees: [...(template.data.attendees || defaultState.attendees)],
    };

    setState(newState);
    setDocumentRevision((r) => r + 1);
    setToastMessage(`✓ Template "${template.label}" berhasil diterapkan ke seluruh dokumen!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleUpdateConfig = (key: keyof AppState['config'], value: any) => {
    setState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }));
  };

  const handleUpdateNotulensi = (index: number, text: string) => {
    setState((prev) => {
      const updated = [...prev.notulensi];
      if (updated[index]) {
        updated[index] = { ...updated[index], poin: text };
      }
      return { ...prev, notulensi: updated };
    });
  };

  const handleUpdateKesimpulan = (index: number, text: string) => {
    setState((prev) => {
      const updated = [...prev.kesimpulan];
      if (updated[index]) {
        updated[index] = { ...updated[index], text };
      }
      return { ...prev, kesimpulan: updated };
    });
  };

  const handleUpdateKetentuanTindakLanjut = (index: number, text: string) => {
    setState((prev) => {
      const current = [
        ...(prev.config.ketentuanTindakLanjut || [
          'Setiap PIC wajib mengunggah bukti dukung (evidence) pelaksanaan tugas pada dashboard sistem evaluasi.',
          'Monitoring progres dilakukan secara berkala tiap hari Jumat pada akhir pekan berjalan.',
          'Kendala teknis atau pergeseran target harus dilaporkan segera kepada pimpinan rapat untuk alternatif penyesuaian.',
        ]),
      ];
      current[index] = text;
      return {
        ...prev,
        config: {
          ...prev.config,
          ketentuanTindakLanjut: current,
        },
      };
    });
  };

  const handleSaveSignature = (attendeeId: string, signatureDataUrl: string) => {
    setState((prev) => ({
      ...prev,
      attendees: prev.attendees.map((a) =>
        a.id === attendeeId
          ? {
              ...a,
              signature: signatureDataUrl,
              signedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
            }
          : a
      ),
    }));
  };

  const handleAddNewAttendeeAndSign = (
    name: string,
    role: string,
    nip: string,
    org: string,
    signature: string
  ) => {
    const newAttendee = {
      id: `att-${Date.now()}`,
      name,
      nip: nip || '-',
      role,
      organization: org || state.config.unitKerja,
      signature,
      status: 'Hadir' as const,
      signedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };

    setState((prev) => ({
      ...prev,
      attendees: [...prev.attendees, newAttendee],
    }));
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
    setDocumentRevision((r) => r + 1);
    setToastMessage('✓ Pengaturan dokumen telah dikembalikan ke format awal.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenQuickSignAttendee = (attendeeId: string) => {
    setSelectedAttendeeForSign(attendeeId);
    setIsKioskOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col antialiased relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 border border-emerald-400 animate-bounce">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        state={state}
        onImportState={(newState) => {
          setState(newState);
          setDocumentRevision((r) => r + 1);
        }}
        onResetState={handleReset}
        lastSavedTime={lastSavedTime}
      />

      {/* Official Document Verification Banner (shown when accessed via QR or verify link) */}
      {verificationBanner.show && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-4 py-3 shadow-md border-b border-emerald-500/40 animate-in slide-in-from-top duration-300">
          <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/40 text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-emerald-200">
                    Dokumen &amp; Presensi Terverifikasi Asli
                  </span>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-400/30">
                    Valid TNDE
                  </span>
                </div>
                <p className="text-slate-300 mt-0.5">
                  Naskah dengan nomor <strong className="text-white font-mono">{verificationBanner.noSurat || state.config.noSurat}</strong> terdaftar resmi pada sistem arsip <strong className="text-white">{state.config.unitKerja}</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] text-emerald-300/80 font-mono hidden md:inline">
                {state.config.kota}, {state.config.tanggalCetak || state.config.hariTanggal}
              </span>
              <button
                onClick={() => setVerificationBanner({ show: false })}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto flex flex-col md:flex-row overflow-hidden">
        {/* Left Side Control Panel */}
        <EditorSidebar
          state={state}
          onUpdateState={setState}
          onUpdateConfig={handleUpdateConfig}
          onApplyPreset={handleApplyPreset}
          onOpenKiosk={() => {
            setSelectedAttendeeForSign(undefined);
            setIsKioskOpen(true);
          }}
          onOpenQuickSignAttendee={handleOpenQuickSignAttendee}
        />

        {/* Right Side Live A4 Canvas Preview */}
        <main className="flex-1 bg-slate-200/70 p-2 sm:p-4 md:p-6 overflow-y-auto flex flex-col items-center relative h-[calc(100vh-61px)]">
          {/* Floating Controls Bar */}
          <PreviewControls
            zoom={zoom}
            onZoomChange={setZoom}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showQrCode={state.config.showQrCode}
            onToggleQrCode={() =>
              handleUpdateConfig('showQrCode', !state.config.showQrCode)
            }
            onApplyPreset={handleApplyPreset}
            activeUnitKerja={state.config.unitKerja}
          />

          {/* Document Preview Pages - key forces clean remount on preset change */}
          <DocumentPreview
            key={`doc-rev-${documentRevision}-${state.config.unitKerja}`}
            state={state}
            viewMode={viewMode}
            zoom={zoom}
            onUpdateConfig={handleUpdateConfig}
            onUpdateNotulensi={handleUpdateNotulensi}
            onUpdateKesimpulan={handleUpdateKesimpulan}
            onUpdateKetentuanTindakLanjut={handleUpdateKetentuanTindakLanjut}
            onOpenQuickSign={handleOpenQuickSignAttendee}
          />
        </main>
      </div>

      {/* Tablet Kiosk / Quick Digital Sign Modal */}
      <QuickSignKioskModal
        isOpen={isKioskOpen}
        onClose={() => {
          setIsKioskOpen(false);
          setSelectedAttendeeForSign(undefined);
        }}
        attendees={state.attendees}
        selectedAttendeeId={selectedAttendeeForSign}
        onSaveSignature={handleSaveSignature}
        onAddNewAttendeeAndSign={handleAddNewAttendeeAndSign}
      />
    </div>
  );
}
