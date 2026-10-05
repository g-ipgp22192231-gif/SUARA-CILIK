import React, { useRef, useState } from 'react';
import { blobToBase64, savePupilRecording } from '../services/audioStorage';
import { LearningRoute, MissionId, PupilVoiceRecording } from '../types/game';

interface PupilOralResponseWidgetProps {
  pupilName: string;
  missionId: MissionId;
  route: LearningRoute;
  stepLabel: string;
  promptQuestion: string;
  scaffoldStarter?: string;
  sampleResponses: string[];
  selectedResponse: string;
  onSelectResponse: (text: string) => void;
  oralConfirmed: boolean;
  onConfirmOralResponse: (text: string) => void;
  onRecordingSaved: () => Promise<void>;
  latestRecording?: PupilVoiceRecording;
}

export const PupilOralResponseWidget: React.FC<PupilOralResponseWidgetProps> = ({
  missionId,
  stepLabel,
  promptQuestion,
  sampleResponses,
  selectedResponse,
  onSelectResponse,
  oralConfirmed,
  onConfirmOralResponse,
  onRecordingSaved,
  latestRecording
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micMessage, setMicMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startPupilRecording = async () => {
    setMicMessage(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicMessage('Mikrofon tiada. Sebut terus kepada guru.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
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
          await savePupilRecording({
            id: `${missionId}_${Date.now()}`,
            missionId,
            stepLabel,
            base64Data,
            mimeType,
            durationSec: Math.max(1, recSeconds),
            recordedAt: new Date().toISOString()
          });
          await onRecordingSaved();
          setMicMessage('✓ Suara disimpan!');
        } catch {
          setMicMessage('Cuba rakam semula.');
        }
        setIsRecording(false);
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setMicMessage('Benarkan mikrofon atau sebut kepada guru.');
    }
  };

  const stopPupilRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorder.current.stop();
    }
  };

  const togglePlayRecording = () => {
    if (!latestRecording) return;
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }
    const audio = new Audio(latestRecording.base64Data);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  };

  return (
    <div className="rounded-2xl border-2 border-emerald-400/80 bg-slate-900/90 backdrop-blur-md p-3.5 text-white shadow-lg space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs sm:text-sm font-bold text-amber-300">
          🗣️ {promptQuestion}
        </p>
        {micMessage && (
          <span className="text-xs font-bold text-emerald-300">{micMessage}</span>
        )}
      </div>

      {/* Speech Bubble Choices (Short & Clear) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sampleResponses.map((resp, idx) => {
          const isSelected = selectedResponse === resp;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectResponse(resp)}
              className={`rounded-xl border-2 px-3 py-2 text-left text-xs sm:text-sm font-bold transition-all ${
                isSelected
                  ? 'border-amber-400 bg-emerald-800/90 text-white'
                  : 'border-white/20 bg-slate-800/80 text-slate-200 hover:bg-slate-700'
              }`}
            >
              💬 “{resp}”
            </button>
          );
        })}
      </div>

      {/* Big Visual Action Buttons: Mic + Play + Confirm */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {isRecording ? (
            <button
              type="button"
              onClick={stopPupilRecording}
              className="min-h-11 rounded-xl bg-rose-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-rose-500 whitespace-nowrap"
            >
              ■ Henti ({recSeconds}s)
            </button>
          ) : (
            <button
              type="button"
              onClick={startPupilRecording}
              className="min-h-11 rounded-xl bg-sky-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-sky-500 whitespace-nowrap"
            >
              🎙️ Rakam Suara
            </button>
          )}

          {latestRecording && (
            <button
              type="button"
              onClick={togglePlayRecording}
              className="min-h-11 rounded-xl border border-white/30 bg-slate-800 px-3.5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-slate-700 whitespace-nowrap"
            >
              {isPlaying ? '■ Berhenti' : '▶ Suara Saya'}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            onConfirmOralResponse(selectedResponse || sampleResponses[0] || 'Respons lisan disahkan')
          }
          className={`min-h-11 rounded-xl px-5 py-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            oralConfirmed
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md'
          }`}
        >
          {oralConfirmed ? '✓ Sudah Sebut!' : '✓ Sahkan Sebutan (Guru)'}
        </button>
      </div>
    </div>
  );
};
