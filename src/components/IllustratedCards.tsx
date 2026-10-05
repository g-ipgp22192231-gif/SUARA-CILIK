import React from 'react';

export type ContextPictureType =
  | 'buku'
  | 'bola'
  | 'pensel'
  | 'cikgu_sara'
  | 'puan_salmah'
  | 'kotak'
  | 'rumah'
  | 'kedai'
  | 'bungkusan'
  | 'puan_aisyah'
  | 'penyapu'
  | 'taman'
  | 'pondok'
  | 'taman_permainan'
  | 'bangku'
  | 'botol_plastik'
  | 'tong_kitar_semula'
  | 'balai_komuniti';

interface ContextIllustrationProps {
  type: ContextPictureType;
  className?: string;
}

export const ContextIllustration: React.FC<ContextIllustrationProps> = ({ type, className = 'w-20 h-20' }) => {
  switch (type) {
    case 'buku':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar buku">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
          <path d="M24 26 H48 V74 H24 Z" fill="#2563EB" rx="3" />
          <path d="M48 26 H76 V74 H48 Z" fill="#3B82F6" rx="3" />
          <path d="M28 30 H46 V70 H28 Z" fill="#FFFFFF" />
          <path d="M50 30 H72 V70 H50 Z" fill="#F8FAFC" />
          <line x1="32" y1="40" x2="43" y2="40" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="48" x2="43" y2="48" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <line x1="54" y1="40" x2="67" y2="40" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <line x1="54" y1="48" x2="65" y2="48" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <path d="M47 26 V76" stroke="#1D4ED8" strokeWidth="3" />
        </svg>
      );

    case 'bola':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar bola">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="2" />
          <circle cx="50" cy="50" r="24" fill="#F97316" stroke="#C2410C" strokeWidth="3" />
          <polygon points="50,38 59,45 55,56 45,56 41,45" fill="#1E293B" />
          <path d="M50 26 V38 M59 45 L72 42 M55 56 L64 68 M45 56 L36 68 M41 45 L28 42" stroke="#1E293B" strokeWidth="2.5" />
        </svg>
      );

    case 'pensel':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar pensel">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#FEF9C3" stroke="#FEF08A" strokeWidth="2" />
          <g transform="rotate(-35 50 50)">
            <rect x="43" y="24" width="14" height="42" fill="#EAB308" stroke="#CA8A04" strokeWidth="2" />
            <rect x="43" y="16" width="14" height="8" rx="2" fill="#F43F5E" stroke="#E11D48" strokeWidth="2" />
            <polygon points="43,66 57,66 50,80" fill="#FDE68A" stroke="#CA8A04" strokeWidth="2" />
            <polygon points="48,75 52,75 50,80" fill="#1E293B" />
          </g>
        </svg>
      );

    case 'cikgu_sara':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar Cikgu Sara">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="2" />
          <path d="M32 78 C32 62 68 62 68 78" fill="#059669" />
          <circle cx="50" cy="44" r="16" fill="#047857" />
          <circle cx="50" cy="45" r="11" fill="#FDE68A" />
          <circle cx="46" cy="44" r="1.8" fill="#1E293B" />
          <circle cx="54" cy="44" r="1.8" fill="#1E293B" />
          <path d="M46 50 Q50 54 54 50" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'puan_salmah':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar Puan Salmah">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#FDF2F8" stroke="#FBCFE8" strokeWidth="2" />
          <path d="M30 78 C30 62 70 62 70 78" fill="#DB2777" />
          <circle cx="50" cy="44" r="16" fill="#BE185D" />
          <circle cx="50" cy="45" r="11" fill="#FDE68A" />
          <circle cx="46" cy="44" r="1.8" fill="#1E293B" />
          <circle cx="54" cy="44" r="1.8" fill="#1E293B" />
          <path d="M46 50 Q50 53 54 50" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'kotak':
    case 'bungkusan':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar kotak bungkusan">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="2" />
          <rect x="26" y="34" width="48" height="38" rx="4" fill="#D97706" stroke="#92400E" strokeWidth="2.5" />
          <polygon points="26,34 34,24 66,24 74,34" fill="#F59E0B" stroke="#92400E" strokeWidth="2.5" />
          <rect x="46" y="24" width="8" height="48" fill="#FEF3C7" opacity="0.85" />
          <rect x="32" y="54" width="12" height="8" rx="1" fill="#FFFFFF" />
        </svg>
      );

    case 'rumah':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar Rumah Jiran">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="2" />
          <polygon points="22,46 50,24 78,46" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" />
          <rect x="28" y="46" width="44" height="30" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
          <rect x="45" y="56" width="10" height="20" fill="#92400E" />
          <rect x="33" y="52" width="8" height="8" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <rect x="59" y="52" width="8" height="8" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
        </svg>
      );

    case 'kedai':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar Kedai Komuniti">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
          <rect x="24" y="38" width="52" height="38" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
          <path d="M20 38 L28 26 H72 L80 38 Z" fill="#0284C7" />
          <rect x="30" y="50" width="22" height="16" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
          <rect x="56" y="50" width="12" height="26" fill="#0369A1" />
        </svg>
      );

    case 'puan_aisyah':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar Puan Aisyah">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#F5F3FF" stroke="#DDD6FE" strokeWidth="2" />
          <path d="M30 78 C30 62 70 62 70 78" fill="#7C3AED" />
          <circle cx="50" cy="44" r="16" fill="#6D28D9" />
          <circle cx="50" cy="45" r="11" fill="#FDE68A" />
          <circle cx="46" cy="44" r="1.8" fill="#1E293B" />
          <circle cx="54" cy="44" r="1.8" fill="#1E293B" />
          <path d="M46 50 Q50 53 54 50" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'penyapu':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar penyapu">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="2" />
          <line x1="50" y1="22" x2="50" y2="56" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
          <path d="M36 56 H64 L70 76 H30 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
          <rect x="38" y="54" width="24" height="5" rx="2" fill="#DC2626" />
          <line x1="42" y1="64" x2="40" y2="75" stroke="#B45309" strokeWidth="2" />
          <line x1="50" y1="64" x2="50" y2="75" stroke="#B45309" strokeWidth="2" />
          <line x1="58" y1="64" x2="60" y2="75" stroke="#B45309" strokeWidth="2" />
        </svg>
      );

    case 'taman':
    case 'taman_permainan':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar Taman Komuniti">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="2" />
          <rect x="20" y="64" width="60" height="14" rx="4" fill="#22C55E" />
          <rect x="32" y="48" width="6" height="18" fill="#92400E" />
          <circle cx="35" cy="38" r="14" fill="#16A34A" />
          <path d="M56 64 L64 44 L72 64" fill="none" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="52" y1="44" x2="76" y2="44" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'pondok':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar pondok">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="2" />
          <polygon points="22,44 50,24 78,44" fill="#B45309" stroke="#78350F" strokeWidth="2.5" />
          <line x1="30" y1="44" x2="30" y2="72" stroke="#92400E" strokeWidth="4" />
          <line x1="70" y1="44" x2="70" y2="72" stroke="#92400E" strokeWidth="4" />
          <rect x="24" y="68" width="52" height="6" rx="2" fill="#78350F" />
          <rect x="34" y="58" width="32" height="4" rx="1" fill="#D97706" />
        </svg>
      );

    case 'bangku':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar bangku taman">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
          <rect x="24" y="38" width="52" height="8" rx="2" fill="#D97706" stroke="#92400E" strokeWidth="2" />
          <rect x="22" y="52" width="56" height="7" rx="2" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
          <line x1="30" y1="46" x2="30" y2="72" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <line x1="70" y1="46" x2="70" y2="72" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'botol_plastik':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar botol plastik">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="2" />
          <rect x="44" y="22" width="12" height="6" rx="2" fill="#0284C7" />
          <path d="M42 28 H58 L62 38 V72 C62 75 59 77 56 77 H44 C41 77 38 75 38 72 V38 Z" fill="#7DD3FC" stroke="#0284C7" strokeWidth="2.5" />
          <rect x="38" y="46" width="24" height="12" fill="#0284C7" />
        </svg>
      );

    case 'tong_kitar_semula':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar tong kitar semula">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="2" />
          <path d="M30 34 H70 L66 76 H34 Z" fill="#059669" stroke="#065F46" strokeWidth="2.5" />
          <rect x="27" y="27" width="46" height="7" rx="3" fill="#10B981" stroke="#065F46" strokeWidth="2" />
          <circle cx="50" cy="55" r="10" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="12 6" />
        </svg>
      );

    case 'balai_komuniti':
    default:
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Gambar Balai Komuniti">
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="2" />
          <polygon points="18,44 50,22 82,44" fill="#0F766E" stroke="#115E59" strokeWidth="2.5" />
          <rect x="24" y="44" width="52" height="32" fill="#FFFFFF" stroke="#0F766E" strokeWidth="2.5" />
          <rect x="44" y="54" width="12" height="22" fill="#0F766E" />
          <circle cx="50" cy="35" r="4" fill="#FDE047" />
        </svg>
      );
  }
};

export const BadgeEmblem: React.FC<{ badgeId: string; earned: boolean; className?: string }> = ({
  badgeId,
  earned,
  className = 'w-14 h-14'
}) => {
  const colorMap: Record<string, { bg: string; stroke: string; accent: string }> = {
    lencana_jiran_prihatin: { bg: '#FEF3C7', stroke: '#D97706', accent: '#B45309' },
    lencana_penyampai_amanah: { bg: '#E0F2FE', stroke: '#0284C7', accent: '#0369A1' },
    lencana_penjaga_alam: { bg: '#DCFCE7', stroke: '#16A34A', accent: '#15803D' },
    lencana_rakan_kerjasama: { bg: '#F3E8FF', stroke: '#9333EA', accent: '#7E22CE' },
    lencana_wira_komuniti: { bg: '#FFE4E6', stroke: '#E11D48', accent: '#BE123C' }
  };

  const palette = earned
    ? colorMap[badgeId] || { bg: '#ECFDF5', stroke: '#059669', accent: '#047857' }
    : { bg: '#F1F5F9', stroke: '#94A3B8', accent: '#64748B' };

  return (
    <svg viewBox="0 0 80 80" className={className} role="img" aria-label={badgeId}>
      <polygon
        points="40,6 68,20 68,52 40,74 12,52 12,20"
        fill={palette.bg}
        stroke={palette.stroke}
        strokeWidth="4"
      />
      <polygon
        points="40,16 45,30 60,30 48,39 52,53 40,44 28,53 32,39 20,30 35,30"
        fill={palette.accent}
        opacity={earned ? 1 : 0.35}
      />
    </svg>
  );
};
