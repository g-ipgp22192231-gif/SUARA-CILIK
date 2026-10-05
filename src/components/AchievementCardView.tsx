import React from 'react';
import { SENARAI_MISI, SENARAI_REFLEKSI_KENDIRI } from '../data/curriculumData';
import { GameState } from '../types/game';
import { BadgeEmblem } from './IllustratedCards';
import { ThreeAvatarPreview } from './ThreeAvatarPreview';

interface AchievementCardViewProps {
  gameState: GameState;
  onToggleReflection: (reflectionId: string) => void;
  onReturnToGame: () => void;
  onOpenTeacherReview: () => void;
}

export const AchievementCardView: React.FC<AchievementCardViewProps> = ({
  gameState,
  onToggleReflection,
  onReturnToGame,
  onOpenTeacherReview
}) => {
  const communityMissions = SENARAI_MISI.filter((m) => m.id !== 'percubaan');
  const totalPoints = communityMissions.reduce(
    (sum, m) => sum + (gameState.missions[m.id]?.pointsAwarded || 0),
    0
  );
  const earnedBadgesCount = communityMissions.filter(
    (m) => gameState.missions[m.id]?.badgeEarned
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Main Achievement Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-700">
              SIJIL PENGIKTIRAFAN KOMUNITI HARMONI · BAHASA MELAYU TAHUN 4
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Kad Pencapaian Wira Cilik: {gameState.pupilName}
            </h1>
            <p className="text-sm text-slate-600">
              Kelas: <span className="font-semibold text-slate-900">{gameState.pupilClass}</span>
              <span aria-hidden="true" className="mx-2">·</span>
              Laluan Akhir:{' '}
              <span className="font-semibold text-slate-900">
                {gameState.activeRoute === 'utama' ? '🌟 Laluan Utama' : '🌱 Laluan Bimbingan'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-500">Jumlah Mata Harmoni</p>
              <p className="font-mono-tabular text-3xl font-bold text-emerald-700">
                {totalPoints} / 100
              </p>
              <p className="text-xs font-medium text-slate-600">
                {earnedBadgesCount} daripada 5 Lencana · ⭐ {gameState.runnerStarsCollected || 0} Bintang Larian 3D
              </p>
            </div>
          </div>
        </div>

        {/* 3D Avatar + Badges Showcase */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 flex flex-col items-center">
            <ThreeAvatarPreview
              gender={gameState.avatar}
              selected={true}
              celebrating={true}
              reducedMotion={gameState.reducedMotion}
              lowPerformance={gameState.lowPerformance3D}
              className="w-full h-64"
            />
            <p className="mt-2 text-sm font-semibold text-slate-800">
              Syabas, {gameState.pupilName}! Kamu pendengar dan penutur yang hebat.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Koleksi Lencana Komuniti Harmoni
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {communityMissions.map((meta) => {
                const prog = gameState.missions[meta.id];
                return (
                  <div
                    key={meta.id}
                    className={`flex items-center gap-3.5 rounded-xl border p-3.5 ${
                      prog.badgeEarned
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-slate-200 bg-slate-50 opacity-75'
                    }`}
                  >
                    <BadgeEmblem
                      badgeId={meta.badgeId}
                      earned={prog.badgeEarned}
                      className="w-12 h-12 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {meta.badgeName}
                      </p>
                      <p className="text-xs text-slate-600">
                        {meta.locationName} ·{' '}
                        <span className="font-mono-tabular font-semibold text-emerald-700">
                          {prog.pointsAwarded} / {meta.points} Mata
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                        {meta.badgeDescription}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pupil Reflection Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Refleksi Pembelajaran {gameState.pupilName}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Tandakan perkara yang telah kamu pelajari sepanjang pengembaraan di Komuniti Harmoni:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SENARAI_REFLEKSI_KENDIRI.map((item) => {
            const checked = gameState.reflections.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleReflection(item.id)}
                className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-colors ${
                  checked
                    ? 'border-emerald-600 bg-emerald-50 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                    checked
                      ? 'border-emerald-700 bg-emerald-700 text-white'
                      : 'border-slate-300 bg-white text-transparent'
                  }`}
                >
                  ✓
                </span>
                <div>
                  <p className="text-xs font-semibold text-emerald-800">{item.kategori}</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900 leading-relaxed">
                    {item.pernyataan}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {gameState.reflections.length > 0 && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-medium text-emerald-950">
            Terima kasih, {gameState.pupilName}! Kamu telah memilih {gameState.reflections.length} refleksi pembelajaran. Teruskan amalan mendengar dengan teliti dan bertutur dengan sopan setiap hari!
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReturnToGame}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
          >
            ◀ Kembali ke Dunia 3D Komuniti Harmoni
          </button>
          <button
            type="button"
            onClick={onOpenTeacherReview}
            className="min-h-11 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
          >
            Buka Semakan Guru (PBD)
          </button>
        </div>
      </section>
    </div>
  );
};
