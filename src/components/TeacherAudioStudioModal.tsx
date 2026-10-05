import React, { useRef, useState } from 'react';
import { SENARAI_KLIP_AUDIO_GURU, SENARAI_MISI } from '../data/curriculumData';
import {
  blobToBase64,
  deleteTeacherAudioClip,
  exportTeacherAudioPack,
  importTeacherAudioPack,
  saveTeacherAudioClip,
  validateAudioDataUrl
} from '../services/audioStorage';
import { MissionId, StoredAudioClip } from '../types/game';

interface TeacherAudioStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  storedClips: Record<string, StoredAudioClip>;
  onClipsUpdated: () => Promise<void>;
  initialMissionFilter?: MissionId | 'semua';
}

export const TeacherAudioStudioModal: React.FC<TeacherAudioStudioModalProps> = ({
  isOpen,
  onClose,
  storedClips,
  onClipsUpdated,
  initialMissionFilter = 'semua'
}) => {
  const [missionFilter, setMissionFilter] = useState<MissionId | 'semua'>(initialMissionFilter);
  const [recordingClipId, setRecordingClipId] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<{ type: 'kejayaan' | 'ralat'; text: string } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const packInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const totalClips = SENARAI_KLIP_AUDIO_GURU.length;
  const readyClipsCount = SENARAI_KLIP_AUDIO_GURU.filter((c) => Boolean(storedClips[c.id])).length;

  const filteredClips =
    missionFilter === 'semua'
      ? SENARAI_KLIP_AUDIO_GURU
      : SENARAI_KLIP_AUDIO_GURU.filter((c) => c.missionId === missionFilter);

  const stopPlayback = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    setPlayingClipId(null);
  };

  const handlePlayClip = (clipId: string) => {
    stopPlayback();
    const item = storedClips[clipId];
    if (!item) return;

    const audio = new Audio(item.base64Data);
    activeAudioRef.current = audio;
    setPlayingClipId(clipId);

    audio.onended = () => {
      setPlayingClipId(null);
    };
    audio.onerror = () => {
      setPlayingClipId(null);
      setNoticeMessage({
        type: 'ralat',
        text: 'Rakaman ini tidak dapat dimainkan. Sila rakam semula atau muat naik fail baharu.'
      });
    };
    audio.play().catch(() => {
      setPlayingClipId(null);
    });
  };

  const startRecording = async (clipId: string) => {
    stopPlayback();
    setNoticeMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setNoticeMessage({
        type: 'ralat',
        text: 'Pelayar ini tidak menyokong rakaman mikrofon secara terus. Sila gunakan butang Muat Naik Fail.'
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        try {
          const base64Data = await blobToBase64(blob);
          const check = await validateAudioDataUrl(base64Data);
          if (!check.valid) {
            setNoticeMessage({
              type: 'ralat',
              text: check.error || 'Rakaman tidak sah. Sila cuba rakam sekali lagi.'
            });
            setRecordingClipId(null);
            return;
          }

          await saveTeacherAudioClip({
            clipId,
            base64Data,
            mimeType,
            durationSec: check.durationSec,
            updatedAt: new Date().toISOString(),
            fileName: `${clipId}_rakaman_guru.webm`
          });
          await onClipsUpdated();
          setNoticeMessage({
            type: 'kejayaan',
            text: `Klip audio "${clipId}" telah disahkan boleh dimainkan dan disimpan sebagai Sedia.`
          });
        } catch {
          setNoticeMessage({
            type: 'ralat',
            text: 'Gagal menyimpan rakaman suara. Sila cuba lagi.'
          });
        }
        setRecordingClipId(null);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingClipId(clipId);
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setNoticeMessage({
        type: 'ralat',
        text: 'Kebenaran mikrofon ditolak atau mikrofon tidak ditemui. Sila benarkan akses mikrofon pada pelayar.'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileUpload = async (clipId: string, file: File | undefined) => {
    if (!file) return;
    stopPlayback();
    setNoticeMessage(null);

    try {
      const base64Data = await blobToBase64(file);
      const check = await validateAudioDataUrl(base64Data);
      if (!check.valid) {
        setNoticeMessage({
          type: 'ralat',
          text: check.error || 'Fail audio tidak dapat disahkan.'
        });
        return;
      }

      await saveTeacherAudioClip({
        clipId,
        base64Data,
        mimeType: file.type || 'audio/mpeg',
        durationSec: check.durationSec,
        updatedAt: new Date().toISOString(),
        fileName: file.name
      });
      await onClipsUpdated();
      setNoticeMessage({
        type: 'kejayaan',
        text: `Fail "${file.name}" berjaya disahkan (${check.durationSec}s) dan ditandakan Sedia.`
      });
    } catch {
      setNoticeMessage({
        type: 'ralat',
        text: 'Ralat semasa memuat naik fail audio.'
      });
    }
  };

  const handleDeleteClip = async (clipId: string) => {
    stopPlayback();
    await deleteTeacherAudioClip(clipId);
    await onClipsUpdated();
    setNoticeMessage({
      type: 'kejayaan',
      text: `Klip audio "${clipId}" telah dipadamkan.`
    });
  };

  const handleExportPack = async () => {
    try {
      const jsonStr = await exportTeacherAudioPack();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pek-audio-suaracilik-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setNoticeMessage({
        type: 'kejayaan',
        text: 'Pek Audio Guru berjaya dieksport. Anda boleh memuat naik fail ini pada peranti bilik darjah lain.'
      });
    } catch {
      setNoticeMessage({
        type: 'ralat',
        text: 'Gagal mengeksport pek audio.'
      });
    }
  };

  const handleImportPackFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const res = await importTeacherAudioPack(text);
      if (res.error) {
        setNoticeMessage({ type: 'ralat', text: res.error });
        return;
      }
      await onClipsUpdated();
      setNoticeMessage({
        type: 'kejayaan',
        text: `Berjaya mengimport dan mengesahkan ${res.importedCount} klip suara guru daripada pek audio.`
      });
    } catch {
      setNoticeMessage({
        type: 'ralat',
        text: 'Gagal membaca fail pek audio yang dipilih.'
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-audio-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 id="studio-audio-title" className="text-xl font-bold text-slate-900">
              Studio Audio Guru — Rakaman Suara Sebenar Bahasa Melayu
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              Rakam suara guru atau muat naik fail audio bagi setiap ujaran. Tiada suara sintetik atau teks-ke-pertuturan digunakan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-tabular text-sm font-semibold text-slate-800">
              Status Keseluruhan: {readyClipsCount} / {totalClips} Klip Sedia
            </span>
            <button
              type="button"
              onClick={() => {
                stopPlayback();
                stopRecording();
                onClose();
              }}
              className="min-h-10 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
            >
              Tutup Studio
            </button>
          </div>
        </div>

        {/* Toolbar: Filter & Export/Import */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-3 bg-white">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Tapis mengikut misi">
            <button
              type="button"
              onClick={() => setMissionFilter('semua')}
              className={`min-h-9 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                missionFilter === 'semua'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua ({totalClips})
            </button>
            {SENARAI_MISI.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMissionFilter(m.id)}
                className={`min-h-9 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  missionFilter === m.id
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {m.numberLabel}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPack}
              className="min-h-9 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
            >
              Eksport Pek Audio (.json)
            </button>
            <input
              ref={packInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                handleImportPackFile(e.target.files?.[0]);
                e.currentTarget.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => packInputRef.current?.click()}
              className="min-h-9 rounded-lg bg-sky-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 whitespace-nowrap"
            >
              Import Pek Audio (.json)
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {noticeMessage && (
          <div
            className={`px-6 py-2.5 text-sm font-medium border-b ${
              noticeMessage.type === 'kejayaan'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            {noticeMessage.text}
          </div>
        )}

        {/* Clips List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200 px-6 py-2">
          {filteredClips.map((clip) => {
            const saved = storedClips[clip.id];
            const isRecordingThis = recordingClipId === clip.id;
            const isPlayingThis = playingClipId === clip.id;

            return (
              <div key={clip.id} className="py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">{clip.title}</span>
                    <span aria-hidden="true">·</span>
                    <span>Watak: {clip.speaker}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Laluan:{' '}
                      {clip.routeUsage === 'semua'
                        ? 'Utama & Bimbingan'
                        : clip.routeUsage === 'utama'
                        ? 'Laluan Utama'
                        : 'Laluan Bimbingan'}
                    </span>
                    <span aria-hidden="true">·</span>
                    {saved ? (
                      <span className="font-semibold text-emerald-700">
                        ● Sedia ({saved.durationSec}s)
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-700">
                        ▲ Belum Dirakam
                      </span>
                    )}
                  </div>

                  <p className="text-base font-semibold text-slate-900 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
                    “{clip.script}”
                  </p>

                  <p className="text-xs text-slate-500">{clip.contextNote}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {isRecordingThis ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="min-h-10 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 whitespace-nowrap"
                    >
                      ■ Henti Rakam ({recordingSeconds}s)
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={Boolean(recordingClipId)}
                      onClick={() => startRecording(clip.id)}
                      className="min-h-10 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 whitespace-nowrap"
                    >
                      🎙️ {saved ? 'Rakam Semula' : 'Rakam Suara'}
                    </button>
                  )}

                  <label className="min-h-10 inline-flex items-center justify-center cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap">
                    <span>Muat Naik Fail</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        handleFileUpload(clip.id, e.target.files?.[0]);
                        e.currentTarget.value = '';
                      }}
                    />
                  </label>

                  {saved && (
                    <>
                      <button
                        type="button"
                        onClick={() => (isPlayingThis ? stopPlayback() : handlePlayClip(clip.id))}
                        className="min-h-10 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
                      >
                        {isPlayingThis ? '■ Berhenti' : '▶ Mainkan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClip(clip.id)}
                        className="min-h-10 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 whitespace-nowrap"
                      >
                        Padam
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
