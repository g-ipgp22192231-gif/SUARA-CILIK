import React from 'react';
import { SENARAI_MISI } from '../data/curriculumData';
import { GameState, MissionId } from '../types/game';
import { BadgeEmblem } from './IllustratedCards';

interface CommunityMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onSelectMission: (missionId: MissionId) => void;
  onOpenAchievementCard: () => void;
}

export const CommunityMapModal: React.FC<CommunityMapModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onSelectMission,
  onOpenAchievementCard
}) => {
  if (!isOpen) return null;

  const missionOrder: MissionId[] = ['percubaan', 'misi1', 'misi2', 'misi3', 'misi4', 'misi5'];

  const isMissionUnlocked = (id: MissionId): boolean => {
    const idx = missionOrder.indexOf(id);
    if (idx <= 0) return true;
    const prevId = missionOrder[idx - 1];
    return gameState.missions[prevId]?.completed || false;
  };

  const totalPoints = Object.values(gameState.missions).reduce((acc, m) => acc + m.pointsAwarded, 0);
  const allCompleted = gameState.missions.misi5.completed;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="peta-komuniti-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 id="peta-komuniti-title" className="text-xl font-bold text-slate-900">
              Peta Pengembaraan Komuniti Harmoni — {gameState.pupilName}
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              Jumlah Mata Harmoni: <span className="font-mono-tabular font-bold text-emerald-700">{totalPoints} / 100</span> · Pilih lokasi yang telah dibuka untuk berkunjung.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
          >
            Tutup Peta
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SENARAI_MISI.map((meta) => {
              const prog = gameState.missions[meta.id];
              const unlocked = isMissionUnlocked(meta.id);
              const isCurrent = gameState.currentMission === meta.id;

              return (
                <div
                  key={meta.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-colors ${
                    isCurrent
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : unlocked
                      ? 'border-slate-200 bg-white'
                      : 'border-slate-200 bg-slate-100 opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          {meta.numberLabel} · {meta.locationName}
                        </p>
                        <h3 className="mt-0.5 text-base font-bold text-slate-900">
                          {meta.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-600">
                          Watak: {meta.npcName} ({meta.npcRole})
                        </p>
                      </div>
                      {meta.id !== 'percubaan' && (
                        <BadgeEmblem badgeId={meta.badgeId} earned={prog.badgeEarned} className="w-12 h-12 shrink-0" />
                      )}
                    </div>

                    <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                      {meta.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="text-xs font-medium text-slate-700">
                      {prog.completed ? (
                        <span className="text-emerald-700 font-semibold">
                          ✓ Selesai ({prog.pointsAwarded} / {meta.points} Mata)
                        </span>
                      ) : unlocked ? (
                        <span className="text-sky-700 font-semibold">● Lokasi Dibuka</span>
                      ) : (
                        <span className="text-slate-500">🔒 Selesaikan misi terdahulu</span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() => {
                        onSelectMission(meta.id);
                        onClose();
                      }}
                      className={`min-h-9 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                        unlocked
                          ? 'bg-emerald-700 text-white hover:bg-emerald-600'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isCurrent ? 'Lokasi Semasa' : prog.completed ? 'Ulang Kaji Lokasi' : 'Pergi ke Lokasi'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {allCompleted && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-base font-bold text-emerald-950">
                  Tahniah, {gameState.pupilName}! Semua 5 lokasi Komuniti Harmoni telah selesai.
                </p>
                <p className="text-xs text-emerald-800">
                  Lihat Kad Pencapaian dan lengkapkan refleksi pembelajaran kamu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAchievementCard();
                }}
                className="min-h-10 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 whitespace-nowrap"
              >
                Buka Kad Pencapaian ➔
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
