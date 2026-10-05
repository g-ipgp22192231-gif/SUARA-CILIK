export type AvatarGender = 'lelaki' | 'perempuan';

export type LearningRoute = 'utama' | 'bimbingan';

export type MissionId =
  | 'percubaan'
  | 'misi1'
  | 'misi2'
  | 'misi3'
  | 'misi4'
  | 'misi5';

export type MovementPace = 'perlahan' | 'sederhana' | 'pantas';

export type FontSizeScale = 'kecil' | 'sederhana' | 'besar' | 'sangat_besar';

export type ThemeMode = 'cerah' | 'gelap';

export interface AudioClipSpec {
  id: string;
  missionId: MissionId;
  title: string;
  speaker: string;
  script: string;
  routeUsage: 'semua' | 'utama' | 'bimbingan';
  contextNote: string;
}

export interface StoredAudioClip {
  clipId: string;
  base64Data: string;
  mimeType: string;
  durationSec: number;
  updatedAt: string;
  fileName?: string;
}

export interface PupilVoiceRecording {
  id: string;
  missionId: MissionId;
  stepLabel: string;
  base64Data: string;
  mimeType: string;
  durationSec: number;
  recordedAt: string;
}

export interface MissionProgress {
  missionId: MissionId;
  completed: boolean;
  pointsAwarded: number;
  maxPoints: number;
  badgeId: string;
  badgeName: string;
  badgeEarned: boolean;
  routeUsed: LearningRoute;
  listenCount: number;
  hintsRequested: number;
  actionsCompleted: string[];
  oralResponseConfirmed: boolean;
  oralResponseText: string;
  firstAttemptSuccess: boolean;
}

export interface GameState {
  pupilName: string;
  pupilClass: string;
  avatar: AvatarGender;
  onboardingComplete: boolean;
  trialCompleted: boolean;
  recommendedRoute: LearningRoute;
  activeRoute: LearningRoute;
  currentMission: MissionId;
  isTravelling: boolean;
  travelProgress: number;
  pace: MovementPace;
  fontSizeScale: FontSizeScale;
  themeMode: ThemeMode;
  runnerStarsCollected: number;
  reducedMotion: boolean;
  lowPerformance3D: boolean;
  missions: Record<MissionId, MissionProgress>;
  reflections: string[];
}
