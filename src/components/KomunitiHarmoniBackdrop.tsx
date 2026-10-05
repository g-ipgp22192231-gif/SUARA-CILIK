import React from 'react';
import { ThemeMode } from '../types/game';

export type BackdropStyleId = 'pelangi' | 'festival_wau' | 'kampung_ceria';

interface KomunitiHarmoniBackdropProps {
  themeMode: ThemeMode;
  backdropStyle?: BackdropStyleId;
  reducedMotion?: boolean;
}

export const KomunitiHarmoniBackdrop: React.FC<KomunitiHarmoniBackdropProps> = ({
  themeMode,
  backdropStyle = 'pelangi',
  reducedMotion = false
}) => {
  const isDark = themeMode === 'gelap';

  const skyGradientClass = isDark
    ? 'bg-gradient-to-b from-[#090d1e] via-[#131c38] to-[#0f292a]'
    : backdropStyle === 'festival_wau'
    ? 'bg-gradient-to-b from-[#38bdf8] via-[#bae6fd] to-[#fef08a]'
    : backdropStyle === 'kampung_ceria'
    ? 'bg-gradient-to-b from-[#7dd3fc] via-[#e0f2fe] to-[#bbf7d0]'
    : 'bg-gradient-to-b from-[#60a5fa] via-[#bae6fd] to-[#dcfce7]';

  return (
    <div
      className={`fixed inset-0 z-0 overflow-hidden pointer-events-none select-none transition-colors duration-300 ${skyGradientClass}`}
      aria-hidden="true"
    >
      {/* Top Sky Illustration: Sun/Moon, Rainbow, Clouds, Wau Bulan & Birds */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={isDark ? '0.22' : '0.45'} />
            <stop offset="25%" stopColor="#F59E0B" stopOpacity={isDark ? '0.22' : '0.45'} />
            <stop offset="50%" stopColor="#10B981" stopOpacity={isDark ? '0.22' : '0.45'} />
            <stop offset="75%" stopColor="#3B82F6" stopOpacity={isDark ? '0.22' : '0.45'} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={isDark ? '0.22' : '0.45'} />
          </linearGradient>

          <linearGradient id="farHillLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#115e59' : '#4ade80'} />
            <stop offset="100%" stopColor={isDark ? '#064e3b' : '#16a34a'} />
          </linearGradient>

          <linearGradient id="midHillLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#065f46' : '#22c55e'} />
            <stop offset="100%" stopColor={isDark ? '#022c22' : '#15803d'} />
          </linearGradient>

          <linearGradient id="foreGroundLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#064e3b' : '#16a34a'} />
            <stop offset="100%" stopColor={isDark ? '#022c22' : '#14532d'} />
          </linearGradient>
        </defs>

        {/* Rainbow Arch in Pelangi or Festival mode */}
        {(backdropStyle === 'pelangi' || backdropStyle === 'festival_wau') && (
          <g>
            <path
              d="M -80 680 A 820 620 0 0 1 1520 680"
              fill="none"
              stroke="url(#rainbowGrad)"
              strokeWidth="38"
              strokeLinecap="round"
            />
            <path
              d="M -50 680 A 790 590 0 0 1 1490 680"
              fill="none"
              stroke="#FEF08A"
              strokeOpacity={isDark ? '0.12' : '0.35'}
              strokeWidth="14"
            />
          </g>
        )}

        {/* Sun (Mod Cerah) or Crescent Moon & Twinkling Stars (Mod Gelap) */}
        {!isDark ? (
          <g transform="translate(1260, 130)">
            <circle cx="0" cy="0" r="88" fill="#FEF08A" opacity="0.35" />
            <circle cx="0" cy="0" r="64" fill="#FDE047" opacity="0.6" />
            <circle cx="0" cy="0" r="46" fill="#FACC15" />
          </g>
        ) : (
          <g>
            {/* Starfield */}
            {[
              [120, 90, 3],
              [260, 150, 2.5],
              [420, 75, 3.5],
              [590, 130, 2],
              [760, 85, 3],
              [930, 145, 2.5],
              [1090, 70, 3.5],
              [1340, 180, 2.5],
              [180, 240, 2],
              [840, 210, 3],
              [1180, 230, 2]
            ].map(([sx, sy, sr], idx) => (
              <circle
                key={idx}
                cx={sx}
                cy={sy}
                r={sr}
                fill="#FEF08A"
                opacity={0.85}
              />
            ))}
            {/* Glowing Sparkle Stars */}
            <polygon
              points="340,95 344,106 355,110 344,114 340,125 336,114 325,110 336,106"
              fill="#FDE047"
            />
            <polygon
              points="1020,105 1024,116 1035,120 1024,124 1020,135 1016,124 1005,120 1016,116"
              fill="#38BDF8"
            />
            {/* Crescent Moon */}
            <g transform="translate(1250, 125)">
              <circle cx="0" cy="0" r="62" fill="#FEF08A" opacity="0.2" />
              <path
                d="M -10 -42 A 44 44 0 1 0 38 22 A 36 36 0 1 1 -10 -42 Z"
                fill="#FDE047"
              />
            </g>
          </g>
        )}

        {/* Fluffy Storybook Clouds */}
        <g opacity={isDark ? '0.18' : '0.88'}>
          {/* Cloud Left */}
          <g transform="translate(90, 115)">
            <rect x="0" y="22" width="150" height="42" rx="21" fill="#FFFFFF" />
            <circle cx="42" cy="26" r="28" fill="#FFFFFF" />
            <circle cx="82" cy="18" r="34" fill="#FFFFFF" />
            <circle cx="118" cy="30" r="24" fill="#FFFFFF" />
          </g>

          {/* Cloud Center-Left */}
          <g transform="translate(460, 75) scale(0.85)">
            <rect x="0" y="22" width="140" height="38" rx="19" fill="#FFFFFF" />
            <circle cx="38" cy="24" r="25" fill="#FFFFFF" />
            <circle cx="76" cy="16" r="30" fill="#FFFFFF" />
            <circle cx="110" cy="28" r="22" fill="#FFFFFF" />
          </g>

          {/* Cloud Right */}
          <g transform="translate(920, 105) scale(0.95)">
            <rect x="0" y="22" width="155" height="40" rx="20" fill="#FFFFFF" />
            <circle cx="45" cy="25" r="26" fill="#FFFFFF" />
            <circle cx="88" cy="16" r="32" fill="#FFFFFF" />
            <circle cx="124" cy="28" r="23" fill="#FFFFFF" />
          </g>
        </g>

        {/* Traditional Malaysian Wau Bulan & Colourful Kites in the Sky */}
        <g transform="translate(210, 210) rotate(-14)">
          <path
            d="M 0 -28 C 24 -18 24 12 0 24 C -24 12 -24 -18 0 -28 Z"
            fill="#F43F5E"
            stroke="#FEF08A"
            strokeWidth="2.5"
          />
          <path
            d="M -18 18 C -8 8 8 8 18 18 C 12 30 -12 30 -18 18 Z"
            fill="#FACC15"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <path
            d="M 0 28 Q -12 52 -4 75 Q 4 95 -10 115"
            fill="none"
            stroke={isDark ? '#94A3B8' : '#0284C7'}
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </g>

        {backdropStyle === 'festival_wau' && (
          <g transform="translate(1160, 250) rotate(16) scale(0.9)">
            <polygon
              points="0,-30 24,0 0,34 -24,0"
              fill="#8B5CF6"
              stroke="#FEF08A"
              strokeWidth="2.5"
            />
            <line x1="-24" y1="0" x2="24" y2="0" stroke="#FEF08A" strokeWidth="2" />
            <line x1="0" y1="-30" x2="0" y2="34" stroke="#FEF08A" strokeWidth="2" />
            <path
              d="M 0 34 Q 10 58 0 82"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3"
            />
          </g>
        )}

        {/* Distant Rolling Green Hills of Komuniti Harmoni */}
        <path
          d="M -100 690 Q 260 520 680 650 T 1540 610 L 1540 920 L -100 920 Z"
          fill="url(#farHillLight)"
        />
        <path
          d="M -100 740 Q 420 590 920 700 T 1540 690 L 1540 920 L -100 920 Z"
          fill="url(#midHillLight)"
        />
        <path
          d="M -100 810 Q 340 720 780 790 T 1540 760 L 1540 920 L -100 920 Z"
          fill="url(#foreGroundLight)"
        />

        {/* Winding Golden Community Path on the Horizon */}
        <path
          d="M 660 660 Q 750 730 690 800 T 820 910 L 940 910 Q 810 800 850 730 T 720 660 Z"
          fill={isDark ? '#334155' : '#FDE68A'}
          opacity="0.55"
        />

        {/* Left Horizon: Cute Kampung / Community Houses & Coconut Palms */}
        <g transform="translate(75, 585)">
          {/* Palm Tree */}
          <path d="M 28 95 Q 18 50 32 12" fill="none" stroke="#78350F" strokeWidth="7" strokeLinecap="round" />
          <path d="M 32 12 Q 5 5 -6 22" fill="none" stroke="#15803D" strokeWidth="6" strokeLinecap="round" />
          <path d="M 32 12 Q 15 -8 -2 -2" fill="none" stroke="#16A34A" strokeWidth="6" strokeLinecap="round" />
          <path d="M 32 12 Q 55 -6 68 12" fill="none" stroke="#16A34A" strokeWidth="6" strokeLinecap="round" />
          <path d="M 32 12 Q 60 12 64 30" fill="none" stroke="#15803D" strokeWidth="6" strokeLinecap="round" />

          {/* Colourful House 1 */}
          <rect x="65" y="45" width="74" height="52" rx="4" fill={isDark ? '#1E293B' : '#FEF3C7'} stroke="#D97706" strokeWidth="2.5" />
          <polygon points="55,45 102,14 149,45" fill="#EF4444" stroke="#B91C1C" strokeWidth="2.5" />
          <rect x="94" y="65" width="16" height="32" fill="#92400E" />
          <rect x="74" y="56" width="14" height="14" rx="2" fill={isDark ? '#FACC15' : '#38BDF8'} />
          <rect x="116" y="56" width="14" height="14" rx="2" fill={isDark ? '#FACC15' : '#38BDF8'} />
        </g>

        {/* Right Horizon: Balai Komuniti & Taman Trees */}
        <g transform="translate(1210, 565)">
          {/* Community Hall Silhouette */}
          <rect x="20" y="50" width="96" height="54" rx="4" fill={isDark ? '#1E293B' : '#FFFFFF'} stroke="#0D9488" strokeWidth="2.5" />
          <polygon points="10,50 68,16 126,50" fill="#0F766E" stroke="#115E59" strokeWidth="2.5" />
          <circle cx="68" cy="36" r="6" fill="#FACC15" />
          <rect x="58" y="68" width="20" height="36" fill="#0F766E" />
          <rect x="30" y="62" width="18" height="16" rx="2" fill={isDark ? '#FDE047' : '#BAE6FD'} />
          <rect x="88" y="62" width="18" height="16" rx="2" fill={isDark ? '#FDE047' : '#BAE6FD'} />

          {/* Round Tropical Trees */}
          <rect x="148" y="68" width="8" height="36" fill="#78350F" />
          <circle cx="152" cy="56" r="24" fill="#16A34A" />
          <circle cx="164" cy="64" r="18" fill="#22C55E" />
        </g>

        {/* Foreground Cheerful Flowers (Bunga Raya / Taman Bunga) */}
        <g transform="translate(40, 835)">
          <circle cx="20" cy="15" r="8" fill="#F43F5E" />
          <circle cx="20" cy="15" r="3" fill="#FACC15" />
          <circle cx="65" cy="25" r="7" fill="#F59E0B" />
          <circle cx="65" cy="25" r="2.5" fill="#FFFFFF" />
          <circle cx="115" cy="12" r="8" fill="#EC4899" />
          <circle cx="115" cy="12" r="3" fill="#FEF08A" />
        </g>

        <g transform="translate(1260, 825)">
          <circle cx="25" cy="20" r="8" fill="#F43F5E" />
          <circle cx="25" cy="20" r="3" fill="#FACC15" />
          <circle cx="78" cy="12" r="7" fill="#A855F7" />
          <circle cx="78" cy="12" r="2.5" fill="#FEF08A" />
          <circle cx="125" cy="24" r="8" fill="#F59E0B" />
          <circle cx="125" cy="24" r="3" fill="#FFFFFF" />
        </g>
      </svg>

      {/* Festive Top Bunting Banner (Bendera Segi Tiga Ceria Sekolah Rendah) */}
      <div className="absolute top-0 inset-x-0 h-5 flex overflow-hidden opacity-85">
        {Array.from({ length: 36 }).map((_, idx) => {
          const colors = [
            'border-t-rose-500',
            'border-t-amber-400',
            'border-t-emerald-500',
            'border-t-sky-500',
            'border-t-purple-500'
          ];
          return (
            <div
              key={idx}
              className={`w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[16px] ${
                colors[idx % colors.length]
              } shrink-0 mx-0.5 ${!reducedMotion ? 'transition-transform duration-500' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
};
