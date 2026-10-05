import React, { useRef, useState } from 'react';
import { SENARAI_MISI, SENARAI_REFLEKSI_KENDIRI } from '../data/curriculumData';
import { GameState, MissionId, PupilVoiceRecording } from '../types/game';

interface TeacherReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  pupilRecordings: PupilVoiceRecording[];
  onToggleOralConfirm: (missionId: MissionId, confirmed: boolean) => void;
  onResetSession: () => void;
}

export const TeacherReviewModal: React.FC<TeacherReviewModalProps> = ({
  isOpen,
  onClose,
  gameState,
  pupilRecordings,
  onToggleOralConfirm,
  onResetSession
}) => {
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const totalPoints = Object.values(gameState.missions).reduce(
    (sum, m) => sum + m.pointsAwarded,
    0
  );
  const totalBadges = Object.values(gameState.missions).filter(
    (m) => m.missionId !== 'percubaan' && m.badgeEarned
  ).length;

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingRecordingId(null);
  };

  const playRecording = (rec: PupilVoiceRecording) => {
    stopAudio();
    const audio = new Audio(rec.base64Data);
    audioRef.current = audio;
    setPlayingRecordingId(rec.id);
    audio.onended = () => setPlayingRecordingId(null);
    audio.onerror = () => setPlayingRecordingId(null);
    audio.play().catch(() => setPlayingRecordingId(null));
  };

  const handleExportReport = () => {
    const report = {
      aplikasi: 'SUARACILIK — Semakan Pentaksiran Bilik Darjah (PBD)',
      tarikhSemakan: new Date().toISOString(),
      namaMurid: gameState.pupilName || 'Belum diisi',
      kelas: gameState.pupilClass || 'Belum diisi',
      avatar: gameState.avatar,
      laluanDicadangkan: gameState.recommendedRoute === 'utama' ? 'Laluan Utama' : 'Laluan Bimbingan',
      laluanSemasa: gameState.activeRoute === 'utama' ? 'Laluan Utama' : 'Laluan Bimbingan',
      jumlahMataHarmoni: totalPoints,
      jumlahLencana: totalBadges,
      rekodMisi: gameState.missions,
      refleksiMurid: gameState.reflections,
      notaPentaksiran:
        'Pengesahan respons lisan dilakukan secara pemerhatian dan pertimbangan profesional guru, bukan penggredan sebutan automatik.'
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekod-pbd-${(gameState.pupilName || 'murid').toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="semakan-guru-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 id="semakan-guru-title" className="text-xl font-bold text-slate-900">
              Semakan Guru — Rekod Pemerhatian & Respons Lisan Murid
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              Semakan ini membantu pertimbangan profesional guru (PBD). Sistem tidak menilai kualiti sebutan secara automatik.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportReport}
              className="min-h-10 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
            >
              Muat Turun Laporan (.json)
            </button>
            <button
              type="button"
              onClick={() => {
                stopAudio();
                onClose();
              }}
              className="min-h-10 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
            >
              Tutup Semakan
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Pupil Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-slate-200 pb-6">
            <div>
              <p className="text-xs text-slate-500">Nama Murid & Kelas</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {gameState.pupilName || 'Belum didaftarkan'} · {gameState.pupilClass || 'Tiada kelas'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Laluan Pembelajaran</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                Semasa: {gameState.activeRoute === 'utama' ? '🌟 Laluan Utama' : '🌱 Laluan Bimbingan'}
              </p>
              <p className="text-xs text-slate-500">
                Cadangan Awal: {gameState.recommendedRoute === 'utama' ? 'Laluan Utama' : 'Laluan Bimbingan'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Jumlah Mata Harmoni</p>
              <p className="mt-1 font-mono-tabular text-xl font-bold text-emerald-700">
                {totalPoints} / 100
              </p>
              <p className="text-xs font-semibold text-amber-700">
                ⭐ Bintang Larian 3D: {gameState.runnerStarsCollected || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Lencana Komuniti</p>
              <p className="mt-1 font-mono-tabular text-xl font-bold text-slate-900">
                {totalBadges} / 5 Lencana
              </p>
            </div>
          </div>

          {/* Missions Diagnostic Table */}
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              Perincian Pelaksanaan Mengikut Misi
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
                    <th className="py-3 px-4">Misi & Lokasi</th>
                    <th className="py-3 px-4">Laluan</th>
                    <th className="py-3 px-4 text-right">Cuba Dengar</th>
                    <th className="py-3 px-4 text-right">Petunjuk</th>
                    <th className="py-3 px-4">Tindakan Selesai</th>
                    <th className="py-3 px-4">Pengesahan Lisan Guru</th>
                    <th className="py-3 px-4 text-right">Mata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {SENARAI_MISI.map((meta) => {
                    const prog = gameState.missions[meta.id];
                    return (
                      <tr key={meta.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">
                            {meta.numberLabel}: {meta.title}
                          </p>
                          <p className="text-xs text-slate-500">{meta.locationName}</p>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-700">
                          {prog.routeUsed === 'utama' ? 'Laluan Utama' : 'Laluan Bimbingan'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-slate-800">
                          {prog.listenCount}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-slate-800">
                          {prog.hintsRequested}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-700">
                          {prog.actionsCompleted.length > 0
                            ? prog.actionsCompleted.join(', ')
                            : 'Belum selesai'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onToggleOralConfirm(meta.id, !prog.oralResponseConfirmed)}
                              className={`min-h-8 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                                prog.oralResponseConfirmed
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                              }`}
                            >
                              {prog.oralResponseConfirmed ? '✓ Disahkan Guru' : 'Sahkan Lisan'}
                            </button>
                          </div>
                          {prog.oralResponseText && (
                            <p className="mt-1 text-xs text-slate-600">
                              Respons: “{prog.oralResponseText}”
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-slate-900">
                          {prog.pointsAwarded} / {meta.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pupil Voice Recordings Review */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Rakaman Suara Respons Murid ({pupilRecordings.length})
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Semua rakaman suara murid disimpan secara tempatan pada peranti ini sahaja untuk semakan guru.
            </p>
            {pupilRecordings.length === 0 ? (
              <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-200">
                Tiada rakaman suara murid disimpan lagi. Murid boleh menekan butang “🎙️ Rakam Suara Saya” semasa menjawab tugasan lisan.
              </p>
            ) : (
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl">
                {pupilRecordings.map((rec) => (
                  <div key={rec.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{rec.stepLabel}</p>
                      <p className="text-xs text-slate-500">
                        Misi: {rec.missionId.toUpperCase()} · Tempoh: {rec.durationSec}s
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => (playingRecordingId === rec.id ? stopAudio() : playRecording(rec))}
                      className="min-h-9 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
                    >
                      {playingRecordingId === rec.id ? '■ Berhenti' : '▶ Dengar Rakaman Murid'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Self-Reflections Selected by Pupil */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Refleksi Kendiri Murid
            </h3>
            {gameState.reflections.length === 0 ? (
              <p className="text-sm text-slate-600">Murid belum melengkapkan bahagian refleksi kendiri.</p>
            ) : (
              <ul className="space-y-1.5 text-sm text-slate-800">
                {SENARAI_REFLEKSI_KENDIRI.filter((r) => gameState.reflections.includes(r.id)).map((r) => (
                  <li key={r.id}>
                    ✓ <span className="font-semibold">{r.kategori}:</span> {r.pernyataan}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Reset Pupil Session */}
          <div className="border-t border-slate-200 pt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Mula Sesi Murid Baharu</p>
              <p className="text-xs text-slate-500">
                Tetapkan semula kemajuan murid untuk giliran murid seterusnya. Rakaman audio guru dalam Studio Audio Guru kekal tersimpan.
              </p>
            </div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="min-h-10 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100 whitespace-nowrap"
              >
                Tetapkan Semula Sesi Murid
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetSession();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="min-h-10 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 whitespace-nowrap"
                >
                  Ya, Padam Kemajuan Murid Ini
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-10 rounded-lg bg-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-300 whitespace-nowrap"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
