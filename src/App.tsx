import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AchievementCardView } from './components/AchievementCardView';
import { CommunityMapModal } from './components/CommunityMapModal';
import {
  BadgeEmblem,
  ContextIllustration,
  ContextPictureType
} from './components/IllustratedCards';
import { Komuniti3DViewport, SceneHotspot } from './components/Komuniti3DViewport';
import {
  BackdropStyleId,
  KomunitiHarmoniBackdrop
} from './components/KomunitiHarmoniBackdrop';
import { PupilOralResponseWidget } from './components/PupilOralResponseWidget';
import { TeacherAudioStudioModal } from './components/TeacherAudioStudioModal';
import { TeacherReviewModal } from './components/TeacherReviewModal';
import { ThreeAvatarPreview } from './components/ThreeAvatarPreview';
import {
  createInitialMissionsProgress,
  SENARAI_KLIP_AUDIO_GURU,
  SENARAI_MISI
} from './data/curriculumData';
import {
  clearAllPupilRecordings,
  getAllPupilRecordings,
  getAllTeacherAudioClips
} from './services/audioStorage';
import {
  AvatarGender,
  FontSizeScale,
  GameState,
  LearningRoute,
  MissionId,
  MovementPace,
  PupilVoiceRecording,
  StoredAudioClip
} from './types/game';

const STORAGE_KEY_GAMESTATE = 'suaracilik_gamestate_v1';

const SASARAN_BINTANG_MISI: Record<MissionId, number> = {
  percubaan: 25,
  misi1: 30,
  misi2: 35,
  misi3: 40,
  misi4: 45,
  misi5: 50
};

function getInitialGameState(): GameState {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_GAMESTATE);
      if (raw) {
        const parsed = JSON.parse(raw) as GameState;
        if (parsed && parsed.missions && parsed.missions.percubaan) {
          return {
            ...parsed,
            fontSizeScale: parsed.fontSizeScale || 'sederhana',
            themeMode: parsed.themeMode || 'cerah',
            runnerStarsCollected:
              typeof parsed.runnerStarsCollected === 'number'
                ? parsed.runnerStarsCollected
                : 0
          };
        }
      }
    } catch {
      // ignore corrupted storage
    }
  }
  return {
    pupilName: '',
    pupilClass: '',
    avatar: 'lelaki',
    onboardingComplete: false,
    trialCompleted: false,
    recommendedRoute: 'utama',
    activeRoute: 'utama',
    currentMission: 'percubaan',
    isTravelling: false,
    travelProgress: 0,
    pace: 'sederhana',
    fontSizeScale: 'sederhana',
    themeMode: 'cerah',
    runnerStarsCollected: 0,
    reducedMotion: false,
    lowPerformance3D: false,
    missions: createInitialMissionsProgress(),
    reflections: []
  };
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState);
  const [storedAudioClips, setStoredAudioClips] = useState<Record<string, StoredAudioClip>>({});
  const [pupilRecordings, setPupilRecordings] = useState<PupilVoiceRecording[]>([]);

  // Active view & modals
  const [activeScreen, setActiveScreen] = useState<'permainan' | 'pencapaian'>('permainan');
  const [backdropStyle, setBackdropStyle] = useState<BackdropStyleId>('pelangi');
  const [isAudioStudioOpen, setIsAudioStudioOpen] = useState(false);
  const [studioFilterMission, setStudioFilterMission] = useState<MissionId | 'semua'>('semua');
  const [isTeacherReviewOpen, setIsTeacherReviewOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [minimizeHudCard, setMinimizeHudCard] = useState(false);

  // Audio playback state
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [missingClipNoticeId, setMissingClipNoticeId] = useState<string | null>(null);
  const [hasListenedInCurrentStep, setHasListenedInCurrentStep] = useState(false);
  const [showHintForCurrentMission, setShowHintForCurrentMission] = useState(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Short visual feedback toast inside 3D HUD
  const [feedbackBanner, setFeedbackBanner] = useState<{
    tone: 'positif' | 'bimbingan' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Per-mission interactive state
  const [trialStage, setTrialStage] = useState<1 | 2 | 3 | 4>(1);
  const [trialC2BookTaken, setTrialC2BookTaken] = useState(false);
  const [trialOralSelection, setTrialOralSelection] = useState('Saya membawa buku.');

  // Sub-panel toggle for Misi 1, 2, 3, 5 ('aksi' = 3D & Gambar, 'lisan' = Sebut Jawapan)
  const [missionSubTab, setMissionSubTab] = useState<'aksi' | 'lisan'>('aksi');

  // Mission 1 state
  const [m1NounIdentified, setM1NounIdentified] = useState(false);
  const [m1BoxTaken, setM1BoxTaken] = useState(false);
  const [m1BoxDelivered, setM1BoxDelivered] = useState(false);
  const [m1OralSelection, setM1OralSelection] = useState(
    'Boleh, Puan Salmah. Saya bantu bawa kotak ini.'
  );

  // Mission 2 state
  const [m2RecipientChosen, setM2RecipientChosen] = useState(false);
  const [m2ArrivedAtAisyah, setM2ArrivedAtAisyah] = useState(false);
  const [m2OralSelection, setM2OralSelection] = useState(
    'Puan Aisyah, barang tempahan puan sudah sampai di kedai.'
  );

  // Mission 3 state
  const [m3ToolSelected, setM3ToolSelected] = useState(false);
  const [m3OralSelection, setM3OralSelection] = useState(
    'Kita patut menyapu sampah dan membersihkan taman ini bersama-sama.'
  );

  // Mission 4 state
  const [m4Step, setM4Step] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Mission 5 state
  const [m5StoryStep, setM5StoryStep] = useState<1 | 2 | 3 | 4>(1);
  const [m5CompletedSteps, setM5CompletedSteps] = useState<number[]>([]);
  const [m5OralSelection, setM5OralSelection] = useState(
    'Mula-mula saya bantu Puan Salmah. Selepas itu saya beritahu Puan Aisyah. Kemudian saya sapu taman bersama Aiman. Akhir sekali saya kitar semula botol.'
  );

  // Sync PPKI Font Scale & Dark/Light Mode to document root
  useEffect(() => {
    const htmlEl = document.documentElement;
    htmlEl.setAttribute('data-font-scale', gameState.fontSizeScale || 'sederhana');
    if (gameState.themeMode === 'gelap') {
      htmlEl.classList.add('theme-gelap');
    } else {
      htmlEl.classList.remove('theme-gelap');
    }
  }, [gameState.fontSizeScale, gameState.themeMode]);

  // Persist gameState to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_GAMESTATE, JSON.stringify(gameState));
    } catch {
      // ignore storage errors
    }
  }, [gameState]);

  const refreshAudioClips = useCallback(async () => {
    const clips = await getAllTeacherAudioClips();
    setStoredAudioClips(clips);
  }, []);

  const refreshPupilRecordings = useCallback(async () => {
    const recs = await getAllPupilRecordings();
    setPupilRecordings(recs);
  }, []);

  useEffect(() => {
    refreshAudioClips();
    refreshPupilRecordings();
  }, [refreshAudioClips, refreshPupilRecordings]);

  const stopCurrentAudio = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    setPlayingClipId(null);
  }, []);

  // Play a specific Teacher Audio Clip (NEVER use TTS fallback)
  const playTeacherClip = (clipId: string) => {
    stopCurrentAudio();
    setMissingClipNoticeId(null);

    setGameState((prev) => {
      const m = prev.missions[prev.currentMission];
      return {
        ...prev,
        missions: {
          ...prev.missions,
          [prev.currentMission]: {
            ...m,
            listenCount: m.listenCount + 1
          }
        }
      };
    });

    setHasListenedInCurrentStep(true);

    const stored = storedAudioClips[clipId];
    if (!stored) {
      setMissingClipNoticeId(clipId);
      return;
    }

    const audio = new Audio(stored.base64Data);
    activeAudioRef.current = audio;
    setPlayingClipId(clipId);

    audio.onended = () => {
      setPlayingClipId(null);
    };
    audio.onerror = () => {
      setPlayingClipId(null);
      setMissingClipNoticeId(clipId);
    };

    audio.play().catch(() => {
      setPlayingClipId(null);
      setMissingClipNoticeId(clipId);
    });
  };

  const requestHint = () => {
    setShowHintForCurrentMission((prev) => !prev);
    setGameState((prev) => {
      const m = prev.missions[prev.currentMission];
      return {
        ...prev,
        missions: {
          ...prev.missions,
          [prev.currentMission]: {
            ...m,
            hintsRequested: m.hintsRequested + 1
          }
        }
      };
    });
  };

  const recordActionCompleted = (missionId: MissionId, actionLabel: string) => {
    setGameState((prev) => {
      const m = prev.missions[missionId];
      const exists = m.actionsCompleted.includes(actionLabel);
      return {
        ...prev,
        missions: {
          ...prev.missions,
          [missionId]: {
            ...m,
            actionsCompleted: exists ? m.actionsCompleted : [...m.actionsCompleted, actionLabel]
          }
        }
      };
    });
  };

  const markFirstAttemptMisstep = (missionId: MissionId) => {
    setGameState((prev) => ({
      ...prev,
      missions: {
        ...prev.missions,
        [missionId]: {
          ...prev.missions[missionId],
          firstAttemptSuccess: false
        }
      }
    }));
  };

  const completeMission = (missionId: MissionId, oralText?: string) => {
    const meta = SENARAI_MISI.find((m) => m.id === missionId);
    if (!meta) return;

    setGameState((prev) => {
      const currentProg = prev.missions[missionId];
      return {
        ...prev,
        trialCompleted: missionId === 'percubaan' ? true : prev.trialCompleted,
        missions: {
          ...prev.missions,
          [missionId]: {
            ...currentProg,
            completed: true,
            pointsAwarded: meta.points,
            badgeEarned: true,
            routeUsed: prev.activeRoute,
            oralResponseConfirmed: true,
            oralResponseText: oralText || currentProg.oralResponseText
          }
        }
      };
    });
  };

  const navigateToMission = (targetMission: MissionId, withTravelJourney = true) => {
    stopCurrentAudio();
    setMissingClipNoticeId(null);
    setHasListenedInCurrentStep(false);
    setShowHintForCurrentMission(false);
    setFeedbackBanner(null);
    setMissionSubTab('aksi');
    setMinimizeHudCard(false);

    setGameState((prev) => ({
      ...prev,
      currentMission: targetMission,
      isTravelling: withTravelJourney,
      travelProgress: withTravelJourney ? 0 : 100
    }));
    setActiveScreen('permainan');
  };

  const handleStartTravelRun = useCallback(() => {
    setFeedbackBanner(null);
    setGameState((prev) => ({
      ...prev,
      isTravelling: true,
      travelProgress: 0
    }));
  }, []);

  const handleFinishTravel = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isTravelling: false,
      travelProgress: 100
    }));
  }, []);

  const handleCollectRunnerStar = useCallback((amount: number) => {
    setGameState((prev) => ({
      ...prev,
      runnerStarsCollected: (prev.runnerStarsCollected || 0) + amount
    }));
  }, []);

  // Determine held item for 3D avatar
  const getCurrentHeldItem = (): 'tiada' | 'buku' | 'kotak' | 'bungkusan' | 'penyapu' | 'botol' => {
    if (gameState.currentMission === 'percubaan' && trialC2BookTaken && trialStage === 2) {
      return 'buku';
    }
    if (gameState.currentMission === 'misi1' && m1BoxTaken && !m1BoxDelivered) {
      return 'kotak';
    }
    if (gameState.currentMission === 'misi2' && m2RecipientChosen && !m2ArrivedAtAisyah) {
      return 'bungkusan';
    }
    if (gameState.currentMission === 'misi3' && m3ToolSelected) {
      return 'penyapu';
    }
    if (gameState.currentMission === 'misi4') {
      if (m4Step === 2) return 'penyapu';
      if (m4Step === 4) return 'botol';
    }
    return 'tiada';
  };

  // Build 3D hotspots for current mission (short, primary-school friendly labels)
  const getSceneHotspots = (): SceneHotspot[] => {
    const mId = gameState.currentMission;
    if (mId === 'percubaan') {
      return [
        {
          id: 'buku',
          label: '📕 Buku',
          position: [-2.3, 0.96, -0.8],
          completed: (trialStage === 2 && trialC2BookTaken) || trialStage >= 3,
          activeHighlight: trialStage === 1 || (trialStage === 2 && !trialC2BookTaken)
        },
        {
          id: 'bola',
          label: '⚽ Bola',
          position: [-1.3, 1.18, -0.8]
        },
        {
          id: 'pensel',
          label: '✏️ Pensel',
          position: [-0.3, 0.96, -0.8]
        },
        {
          id: 'cikgu_sara',
          label: '👩‍🏫 Cikgu Sara',
          position: [2.4, 0, -1.1],
          completed: trialStage >= 3,
          activeHighlight: trialStage === 2 && trialC2BookTaken
        }
      ];
    }

    if (mId === 'misi1') {
      return [
        {
          id: 'kotak',
          label: '📦 1. Kotak',
          position: [-2.3, 0, -0.4],
          completed: m1BoxTaken,
          activeHighlight: !m1BoxTaken
        },
        {
          id: 'rumah_jiran',
          label: '🏠 2. Rumah Jiran',
          position: [2.1, 0, -2.2],
          completed: m1BoxDelivered,
          activeHighlight: m1BoxTaken && !m1BoxDelivered
        },
        {
          id: 'puan_salmah',
          label: '👵 Puan Salmah',
          position: [-0.6, 0, -1.4],
          completed: m1BoxDelivered
        }
      ];
    }

    if (mId === 'misi2') {
      return [
        {
          id: 'bungkusan',
          label: '🎁 1. Bungkusan',
          position: [-1.3, 0, -0.7],
          completed: m2RecipientChosen,
          activeHighlight: !m2RecipientChosen
        },
        {
          id: 'puan_aisyah',
          label: '👩 2. Puan Aisyah',
          position: [2.4, 0, -0.6],
          completed: m2ArrivedAtAisyah,
          activeHighlight: m2RecipientChosen && !m2ArrivedAtAisyah
        },
        {
          id: 'encik_chong',
          label: '👨 Encik Chong',
          position: [-2.4, 0, -0.6],
          completed: m2RecipientChosen
        }
      ];
    }

    if (mId === 'misi3') {
      return [
        {
          id: 'penyapu',
          label: '🧹 Penyapu',
          position: [-2.4, 0, -0.5],
          completed: m3ToolSelected,
          activeHighlight: !m3ToolSelected
        },
        {
          id: 'bola',
          label: '⚽ Bola',
          position: [0, 0.32, 0.2]
        },
        {
          id: 'buku',
          label: '📕 Buku',
          position: [2.3, 0.1, -0.5]
        },
        {
          id: 'aiman',
          label: '👦 Aiman',
          position: [0, 0, -1.5],
          completed: m3ToolSelected
        }
      ];
    }

    if (mId === 'misi4') {
      return [
        {
          id: 'pondok_penyapu',
          label: '🧹 1. Penyapu',
          position: [-2.3, 0, -0.9],
          completed: m4Step > 1,
          activeHighlight: m4Step === 1
        },
        {
          id: 'taman_permainan',
          label: '🛝 2. Taman',
          position: [-0.6, 0, -1.6],
          completed: m4Step > 2,
          activeHighlight: m4Step === 2
        },
        {
          id: 'bangku_botol',
          label: '🍾 3. Botol',
          position: [1.3, 0, -0.5],
          completed: m4Step > 3,
          activeHighlight: m4Step === 3
        },
        {
          id: 'tong_kitar_semula',
          label: '♻️ 4. Tong Kitar Semula',
          position: [3.1, 0, -1.0],
          completed: m4Step > 4,
          activeHighlight: m4Step === 4
        }
      ];
    }

    return [
      {
        id: 'stesen_1',
        label: '🏠 1. Rumah',
        position: [-3.2, 0.9, -0.8],
        completed: m5CompletedSteps.includes(1),
        activeHighlight: m5StoryStep === 1
      },
      {
        id: 'stesen_2',
        label: '🏪 2. Kedai',
        position: [-1.5, 0.9, -0.8],
        completed: m5CompletedSteps.includes(2),
        activeHighlight: m5StoryStep === 2
      },
      {
        id: 'stesen_3',
        label: '🌳 3. Taman',
        position: [1.5, 0.9, -0.8],
        completed: m5CompletedSteps.includes(3),
        activeHighlight: m5StoryStep === 3
      },
      {
        id: 'stesen_4',
        label: '♻️ 4. Gotong-royong',
        position: [3.2, 0.9, -0.8],
        completed: m5CompletedSteps.includes(4),
        activeHighlight: m5StoryStep === 4
      }
    ];
  };

  // Handle 3D Hotspot or Object Selection across all missions (Concise messages!)
  const handleHotspotInteraction = (hotspotId: string) => {
    const name = gameState.pupilName || 'Wira';
    const mId = gameState.currentMission;

    // MISI PERCUBAAN
    if (mId === 'percubaan') {
      if (trialStage === 1) {
        if (hotspotId === 'buku') {
          recordActionCompleted('percubaan', 'Cabaran 1: Pilih buku di atas meja');
          setFeedbackBanner({
            tone: 'positif',
            title: '🎉 Betul! Itu buku.',
            message: `Bagus, ${name}! Masuk ke Cabaran 2.`
          });
          setTrialStage(2);
          setHasListenedInCurrentStep(false);
        } else {
          markFirstAttemptMisstep('percubaan');
          const chosenLabel = hotspotId === 'bola' ? 'bola' : 'pensel';
          setFeedbackBanner({
            tone: 'bimbingan',
            title: `🤔 Itu ${chosenLabel}.`,
            message: 'Dengar semula arahan dan pilih buku.'
          });
        }
        return;
      }

      if (trialStage === 2) {
        if (hotspotId === 'buku') {
          setTrialC2BookTaken(true);
          recordActionCompleted('percubaan', 'Cabaran 2a: Ambil buku');
          setFeedbackBanner({
            tone: 'info',
            title: '📕 Buku diambil!',
            message: 'Sekarang klik Cikgu Sara.'
          });
        } else if (hotspotId === 'cikgu_sara') {
          if (!trialC2BookTaken) {
            markFirstAttemptMisstep('percubaan');
            setFeedbackBanner({
              tone: 'bimbingan',
              title: '☝️ Ambil buku dahulu!',
              message: 'Klik buku di meja, kemudian berikan kepada Cikgu Sara.'
            });
          } else {
            recordActionCompleted('percubaan', 'Cabaran 2b: Serahkan buku kepada Cikgu Sara');
            setFeedbackBanner({
              tone: 'positif',
              title: '🌟 Syabas! Dua langkah selesai.',
              message: 'Sekarang jawab soalan Cikgu Sara.'
            });
            setTrialStage(3);
            setHasListenedInCurrentStep(false);
          }
        } else {
          markFirstAttemptMisstep('percubaan');
          setFeedbackBanner({
            tone: 'bimbingan',
            title: '🤔 Cuba lagi!',
            message: 'Ambil buku dahulu.'
          });
        }
        return;
      }
    }

    // MISI 1: JIRAN PRIHATIN
    if (mId === 'misi1') {
      if (hotspotId === 'kotak') {
        setM1NounIdentified(true);
        setM1BoxTaken(true);
        recordActionCompleted('misi1', 'Mengambil kotak Puan Salmah');
        setFeedbackBanner({
          tone: 'positif',
          title: '📦 Kotak diambil!',
          message: 'Sekarang klik Rumah Jiran.'
        });
      } else if (hotspotId === 'rumah_jiran') {
        if (!m1BoxTaken) {
          markFirstAttemptMisstep('misi1');
          setFeedbackBanner({
            tone: 'bimbingan',
            title: '📦 Ambil kotak dahulu!',
            message: 'Klik kotak Puan Salmah dahulu.'
          });
        } else {
          setM1BoxDelivered(true);
          recordActionCompleted('misi1', 'Membawa kotak ke dalam Rumah Jiran');
          setMissionSubTab('lisan');
          setFeedbackBanner({
            tone: 'positif',
            title: '🏠 Kotak sampai di rumah!',
            message: 'Sekarang sebut jawapan sopan kepada Puan Salmah.'
          });
        }
      } else if (hotspotId === 'puan_salmah') {
        setFeedbackBanner({
          tone: 'info',
          title: '👵 Puan Salmah',
          message: 'Klik 1. Kotak ➔ 2. Rumah Jiran.'
        });
      }
      return;
    }

    // MISI 2: PESANAN PENTING
    if (mId === 'misi2') {
      if (hotspotId === 'bungkusan' || hotspotId === 'encik_chong') {
        setM2RecipientChosen(true);
        recordActionCompleted('misi2', 'Mengenal pasti bungkusan di Kedai Komuniti');
        setFeedbackBanner({
          tone: 'info',
          title: '🎁 Bungkusan dilihat!',
          message: 'Sekarang klik Puan Aisyah.'
        });
      } else if (hotspotId === 'puan_aisyah') {
        setM2RecipientChosen(true);
        setM2ArrivedAtAisyah(true);
        recordActionCompleted('misi2', 'Bergerak menemui Puan Aisyah');
        setMissionSubTab('lisan');
        setFeedbackBanner({
          tone: 'positif',
          title: '👩 Jumpa Puan Aisyah!',
          message: 'Sekarang sebut pesanan Encik Chong.'
        });
      }
      return;
    }

    // MISI 3: TAMAN KITA, TANGGUNGJAWAB KITA
    if (mId === 'misi3') {
      if (hotspotId === 'penyapu') {
        setM3ToolSelected(true);
        recordActionCompleted('misi3', 'Memilih penyapu dan membersihkan Taman Komuniti');
        setMissionSubTab('lisan');
        setFeedbackBanner({
          tone: 'positif',
          title: '🧹 Penyapu dipilih!',
          message: 'Taman sudah bersih! Sekarang sebut pendapat kamu.'
        });
      } else if (hotspotId === 'bola' || hotspotId === 'buku') {
        markFirstAttemptMisstep('misi3');
        const label = hotspotId === 'bola' ? 'bola' : 'buku';
        setFeedbackBanner({
          tone: 'bimbingan',
          title: `🤔 Itu ${label}.`,
          message: 'Pilih penyapu untuk bersihkan taman.'
        });
      } else if (hotspotId === 'aiman') {
        setFeedbackBanner({
          tone: 'info',
          title: '👦 Aiman',
          message: 'Pilih penyapu untuk bersihkan taman.'
        });
      }
      return;
    }

    // MISI 4: DENGAR DAN LAKSANAKAN (PUSAT GOTONG-ROYONG)
    if (mId === 'misi4') {
      if (m4Step === 1) {
        if (hotspotId === 'pondok_penyapu') {
          setM4Step(2);
          recordActionCompleted('misi4', 'Langkah 1: Ambil penyapu di sebelah pondok');
          setFeedbackBanner({
            tone: 'positif',
            title: '✓ 1. Penyapu diambil!',
            message: 'Seterusnya: Klik 2. Taman Permainan.'
          });
        } else {
          markFirstAttemptMisstep('misi4');
          setFeedbackBanner({
            tone: 'bimbingan',
            title: '☝️ Langkah 1 dahulu!',
            message: 'Klik 1. Penyapu di sebelah pondok.'
          });
        }
        return;
      }

      if (m4Step === 2) {
        if (hotspotId === 'taman_permainan') {
          setM4Step(3);
          recordActionCompleted('misi4', 'Langkah 2: Bawa penyapu ke kawasan taman permainan');
          setFeedbackBanner({
            tone: 'positif',
            title: '✓ 2. Taman disapu!',
            message: 'Seterusnya: Klik 3. Botol di bangku.'
          });
        } else {
          markFirstAttemptMisstep('misi4');
          setFeedbackBanner({
            tone: 'bimbingan',
            title: '☝️ Langkah 2 dahulu!',
            message: 'Bawa penyapu ke 2. Taman Permainan.'
          });
        }
        return;
      }

      if (m4Step === 3) {
        if (hotspotId === 'bangku_botol') {
          setM4Step(4);
          recordActionCompleted('misi4', 'Langkah 3: Kutip botol plastik berhampiran bangku');
          setFeedbackBanner({
            tone: 'positif',
            title: '✓ 3. Botol dikutip!',
            message: 'Akhir sekali: Klik 4. Tong Kitar Semula.'
          });
        } else {
          markFirstAttemptMisstep('misi4');
          setFeedbackBanner({
            tone: 'bimbingan',
            title: '☝️ Langkah 3 dahulu!',
            message: 'Klik 3. Botol plastik di bangku.'
          });
        }
        return;
      }

      if (m4Step === 4) {
        if (hotspotId === 'tong_kitar_semula') {
          setM4Step(5);
          recordActionCompleted('misi4', 'Langkah 4: Masukkan botol ke dalam tong kitar semula');
          completeMission('misi4', 'Melaksanakan kesemua arahan gotong-royong mengikut urutan.');
          setFeedbackBanner({
            tone: 'positif',
            title: '🏆 Lencana Rakan Kerjasama (+20 Mata)!',
            message: `Syabas, ${name}! Semua 4 langkah selesai.`
          });
        } else {
          markFirstAttemptMisstep('misi4');
          setFeedbackBanner({
            tone: 'bimbingan',
            title: '♻️ Masukkan ke dalam tong!',
            message: 'Klik 4. Tong Kitar Semula.'
          });
        }
        return;
      }
    }

    // MISI 5: CABARAN WIRA KOMUNITI
    if (mId === 'misi5') {
      if (hotspotId.startsWith('stesen_')) {
        const num = Number(hotspotId.replace('stesen_', '')) as 1 | 2 | 3 | 4;
        setM5StoryStep(num);
        const nextCompleted = m5CompletedSteps.includes(num)
          ? m5CompletedSteps
          : [...m5CompletedSteps, num];
        setM5CompletedSteps(nextCompleted);
        recordActionCompleted('misi5', `Imbasan Lokasi ${num}`);
        if (nextCompleted.length >= 4 && gameState.activeRoute === 'utama') {
          setMissionSubTab('lisan');
        }
      }
    }
  };

  // Complete Trial Mission and calculate diagnostic recommendation
  const handleFinishTrialDiagnostic = (oralText: string) => {
    const trialProg = gameState.missions.percubaan;
    const neededSupport =
      trialProg.hintsRequested > 0 || !trialProg.firstAttemptSuccess;
    const recommended: LearningRoute = neededSupport ? 'bimbingan' : 'utama';

    recordActionCompleted('percubaan', 'Cabaran 3: Menjawab soalan lisan Cikgu Sara');
    setGameState((prev) => ({
      ...prev,
      trialCompleted: true,
      recommendedRoute: recommended,
      activeRoute: recommended,
      missions: {
        ...prev.missions,
        percubaan: {
          ...prev.missions.percubaan,
          completed: true,
          badgeEarned: true,
          oralResponseConfirmed: true,
          oralResponseText: oralText
        }
      }
    }));
    setTrialStage(4);
    setFeedbackBanner({
      tone: 'positif',
      title: '🎫 Pas Masuk Diperoleh!',
      message: `Tahniah, ${gameState.pupilName}! Jom mula Misi 1.`
    });
  };

  const totalPoints = Object.values(gameState.missions).reduce(
    (sum, m) => sum + m.pointsAwarded,
    0
  );
  const totalBadges = Object.values(gameState.missions).filter(
    (m) => m.missionId !== 'percubaan' && m.badgeEarned
  ).length;
  const readyClipsCount = SENARAI_KLIP_AUDIO_GURU.filter((c) => Boolean(storedAudioClips[c.id])).length;
  const currentMissionMeta =
    SENARAI_MISI.find((m) => m.id === gameState.currentMission) || SENARAI_MISI[0];
  const currentMissionProg = gameState.missions[gameState.currentMission];

  const handleResetPupilSession = async () => {
    stopCurrentAudio();
    await clearAllPupilRecordings();
    await refreshPupilRecordings();
    const fresh: GameState = {
      pupilName: '',
      pupilClass: '',
      avatar: 'lelaki',
      onboardingComplete: false,
      trialCompleted: false,
      recommendedRoute: 'utama',
      activeRoute: 'utama',
      currentMission: 'percubaan',
      isTravelling: false,
      travelProgress: 0,
      pace: 'sederhana',
      fontSizeScale: gameState.fontSizeScale,
      themeMode: gameState.themeMode,
      runnerStarsCollected: 0,
      reducedMotion: false,
      lowPerformance3D: false,
      missions: createInitialMissionsProgress(),
      reflections: []
    };
    setGameState(fresh);
    setTrialStage(1);
    setTrialC2BookTaken(false);
    setM1NounIdentified(false);
    setM1BoxTaken(false);
    setM1BoxDelivered(false);
    setM2RecipientChosen(false);
    setM2ArrivedAtAisyah(false);
    setM3ToolSelected(false);
    setM4Step(1);
    setM5StoryStep(1);
    setM5CompletedSteps([]);
    setFeedbackBanner(null);
    setActiveScreen('permainan');
  };

  const fontOptions: { id: FontSizeScale; label: string }[] = [
    { id: 'kecil', label: 'A-' },
    { id: 'sederhana', label: 'A' },
    { id: 'besar', label: 'A+' },
    { id: 'sangat_besar', label: 'A++' }
  ];

  // Helper to play primary audio clip for current mission/step
  const playCurrentPrimaryAudio = () => {
    const mId = gameState.currentMission;
    if (mId === 'percubaan') {
      if (trialStage === 1) playTeacherClip('percubaan_c1');
      else if (trialStage === 2) playTeacherClip('percubaan_c2');
      else playTeacherClip('percubaan_c3');
      return;
    }
    if (mId === 'misi1') {
      playTeacherClip('misi1_utama');
      return;
    }
    if (mId === 'misi2') {
      playTeacherClip('misi2_utama');
      return;
    }
    if (mId === 'misi3') {
      playTeacherClip('misi3_utama');
      return;
    }
    if (mId === 'misi4') {
      if (gameState.activeRoute === 'bimbingan') {
        const mapStepClip: Record<number, string> = {
          1: 'misi4_bimbingan_1a',
          2: 'misi4_bimbingan_1b',
          3: 'misi4_bimbingan_2a',
          4: 'misi4_bimbingan_2b',
          5: 'misi4_bimbingan_2b'
        };
        playTeacherClip(mapStepClip[m4Step] || 'misi4_bimbingan_1a');
      } else {
        playTeacherClip(m4Step <= 2 ? 'misi4_utama_1' : 'misi4_utama_2');
      }
      return;
    }
    if (mId === 'misi5') {
      if (gameState.activeRoute === 'bimbingan') {
        playTeacherClip(`misi5_bimbingan_${m5StoryStep}`);
      } else {
        playTeacherClip('misi5_utama');
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col text-slate-900">
      {/* Latar Belakang Ilustrasi Ceria Komuniti Harmoni */}
      <KomunitiHarmoniBackdrop
        themeMode={gameState.themeMode}
        backdropStyle={backdropStyle}
        reducedMotion={gameState.reducedMotion}
      />

      {/* Top Bar: Clean & Visual for Primary Pupils */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 sm:px-6 py-2.5 shadow-2xs">
        <a
          href="#utama"
          onClick={(e) => {
            e.preventDefault();
            setActiveScreen('permainan');
          }}
          className="text-lg sm:text-xl font-bold tracking-tight text-emerald-800 font-display whitespace-nowrap shrink-0"
        >
          SUARACILIK 3D
        </a>

        <nav className="hidden md:flex items-center gap-5 text-sm font-bold text-slate-700" aria-label="Navigasi Utama">
          <button
            type="button"
            onClick={() => setActiveScreen('permainan')}
            className={`hover:text-emerald-800 transition-colors whitespace-nowrap ${
              activeScreen === 'permainan' ? 'text-emerald-800 underline underline-offset-4' : ''
            }`}
          >
            🎮 Main 3D
          </button>
          <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            className="hover:text-emerald-800 transition-colors whitespace-nowrap"
          >
            🗺️ Peta
          </button>
          <button
            type="button"
            onClick={() => setActiveScreen('pencapaian')}
            className={`hover:text-emerald-800 transition-colors whitespace-nowrap ${
              activeScreen === 'pencapaian' ? 'text-emerald-800 underline underline-offset-4' : ''
            }`}
          >
            🏆 Pencapaian ({totalPoints})
          </button>
          <button
            type="button"
            onClick={() => {
              setStudioFilterMission('semua');
              setIsAudioStudioOpen(true);
            }}
            className="hover:text-emerald-800 transition-colors whitespace-nowrap"
          >
            🎙️ Audio Guru ({readyClipsCount}/{SENARAI_KLIP_AUDIO_GURU.length})
          </button>
          <button
            type="button"
            onClick={() => setIsTeacherReviewOpen(true)}
            className="hover:text-emerald-800 transition-colors whitespace-nowrap"
          >
            📋 Semakan Guru
          </button>
        </nav>

        <div className="flex items-center gap-1.5">
          {fontOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setGameState((prev) => ({ ...prev, fontSizeScale: opt.id }))}
              className={`min-h-8 rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
                gameState.fontSizeScale === opt.id
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={`Saiz Tulisan ${opt.label}`}
            >
              {opt.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              setGameState((prev) => ({
                ...prev,
                themeMode: prev.themeMode === 'cerah' ? 'gelap' : 'cerah'
              }))
            }
            className="min-h-8 rounded-lg border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-slate-200 whitespace-nowrap"
          >
            {gameState.themeMode === 'cerah' ? '🌙' : '☀️'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStudioFilterMission(gameState.currentMission);
              setIsAudioStudioOpen(true);
            }}
            className="min-h-8 rounded-lg bg-emerald-700 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-600 whitespace-nowrap"
          >
            🎙️ Guru
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="utama" className="relative z-10 flex-1">
        {!gameState.onboardingComplete ? (
          /* =============================================================
             KID-FRIENDLY, LOW-TEXT ONBOARDING SCREEN
             ============================================================= */
          <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
            {/* Compact Teacher Audio Bar */}
            <div className="rounded-2xl border border-amber-300 bg-amber-50/95 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-amber-950">
                👩‍🏫 Guru: <span className="font-mono-tabular">{readyClipsCount}/{SENARAI_KLIP_AUDIO_GURU.length}</span> audio sedia
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStudioFilterMission('semua');
                    setIsAudioStudioOpen(true);
                  }}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 font-bold text-white hover:bg-amber-500"
                >
                  🎙️ Rakam Suara Guru
                </button>
                <button
                  type="button"
                  onClick={() => setIsTeacherReviewOpen(true)}
                  className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-bold text-amber-950 hover:bg-amber-100"
                >
                  📋 Semakan
                </button>
              </div>
            </div>

            {/* Visual Welcome Card */}
            <div className="rounded-3xl border-2 border-emerald-200 bg-white/95 backdrop-blur-xs p-5 sm:p-7 shadow-lg space-y-5">
              <div className="text-center space-y-1">
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  🎮 PERMAINAN 3D BAHASA MELAYU TAHUN 4
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Jom Masuk ke Komuniti Harmoni!
                </h1>
              </div>

              {/* Step 1 & 2: Short Icon Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="input-nama-murid" className="block text-sm font-bold text-slate-900 mb-1">
                    1. ✏️ Nama Kamu:
                  </label>
                  <input
                    id="input-nama-murid"
                    type="text"
                    value={gameState.pupilName}
                    onChange={(e) =>
                      setGameState((prev) => ({ ...prev, pupilName: e.target.value }))
                    }
                    placeholder="Contoh: Amirul / Aina"
                    className="w-full min-h-12 rounded-2xl border-2 border-slate-300 bg-slate-50 px-4 py-2.5 text-base font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="input-kelas-murid" className="block text-sm font-bold text-slate-900 mb-1">
                    2. 🏫 Kelas Kamu:
                  </label>
                  <input
                    id="input-kelas-murid"
                    type="text"
                    value={gameState.pupilClass}
                    onChange={(e) =>
                      setGameState((prev) => ({ ...prev, pupilClass: e.target.value }))
                    }
                    placeholder="Contoh: 4 Harmoni"
                    className="w-full min-h-12 rounded-2xl border-2 border-slate-300 bg-slate-50 px-4 py-2.5 text-base font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 3: 3D Avatar Cards */}
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-900">
                  3. 🧒 Pilih Watak 3D:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(['lelaki', 'perempuan'] as AvatarGender[]).map((gender) => {
                    const isSelected = gameState.avatar === gender;
                    return (
                      <div
                        key={gender}
                        onClick={() => setGameState((prev) => ({ ...prev, avatar: gender }))}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setGameState((prev) => ({ ...prev, avatar: gender }));
                          }
                        }}
                        className={`cursor-pointer rounded-2xl border-2 p-3.5 transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <ThreeAvatarPreview
                          gender={gender}
                          selected={isSelected}
                          reducedMotion={gameState.reducedMotion}
                          lowPerformance={gameState.lowPerformance3D}
                          className="w-full h-48"
                        />
                        <div className="mt-2.5 flex items-center justify-between">
                          <p className="text-base font-bold text-slate-900">
                            {gender === 'lelaki' ? '👦 Wira Lelaki' : '👧 Wira Perempuan'}
                          </p>
                          <span
                            className={`rounded-xl px-3 py-1 text-xs font-bold ${
                              isSelected
                                ? 'bg-emerald-700 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isSelected ? '✓ Dipilih' : 'Pilih'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Big Start Game Button */}
              <button
                type="button"
                onClick={() => {
                  const cleanName = gameState.pupilName.trim() || 'Wira Harmoni';
                  const cleanClass = gameState.pupilClass.trim() || '4 Harmoni';
                  setGameState((prev) => ({
                    ...prev,
                    pupilName: cleanName,
                    pupilClass: cleanClass,
                    onboardingComplete: true,
                    currentMission: 'percubaan',
                    isTravelling: true,
                    travelProgress: 0
                  }));
                }}
                className="min-h-14 w-full rounded-2xl bg-emerald-600 px-6 py-3.5 text-lg font-bold text-white hover:bg-emerald-500 shadow-lg transition-all"
              >
                🚀 Mula Larian 3D Sekarang! ➔
              </button>
            </div>
          </div>
        ) : activeScreen === 'pencapaian' ? (
          <AchievementCardView
            gameState={gameState}
            onToggleReflection={(refId) => {
              setGameState((prev) => {
                const exists = prev.reflections.includes(refId);
                return {
                  ...prev,
                  reflections: exists
                    ? prev.reflections.filter((r) => r !== refId)
                    : [...prev.reflections, refId]
                };
              });
            }}
            onReturnToGame={() => setActiveScreen('permainan')}
            onOpenTeacherReview={() => setIsTeacherReviewOpen(true)}
          />
        ) : (
          /* =============================================================
             FULL-SCREEN 3D EDUCATIONAL GAME STAGE (MINIMAL WORDS, BIG 3D!)
             ============================================================= */
          <div className="mx-auto max-w-[1440px] px-3 sm:px-5 py-3 space-y-2.5">
            {/* Compact Top Status & Mission Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xs px-3.5 py-2 shadow-2xs">
              {/* Pupil & Score Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
                <span className="rounded-xl bg-emerald-50 px-2.5 py-1 text-emerald-900 border border-emerald-200">
                  👋 {gameState.pupilName}
                </span>
                <span className="rounded-xl bg-amber-50 px-2.5 py-1 text-amber-900 border border-amber-200 font-mono-tabular">
                  🏆 {totalPoints}/100
                </span>
                <span className="rounded-xl bg-sky-50 px-2.5 py-1 text-sky-900 border border-sky-200 font-mono-tabular">
                  🏅 {totalBadges}/5
                </span>
              </div>

              {/* Compact Mission Stepper */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {SENARAI_MISI.map((m, idx) => {
                  const prog = gameState.missions[m.id];
                  const isCurrent = gameState.currentMission === m.id;
                  const prevCompleted =
                    idx === 0 || gameState.missions[SENARAI_MISI[idx - 1].id]?.completed;
                  const shortLabels: Record<MissionId, string> = {
                    percubaan: '🎫 Pondok',
                    misi1: '1. 🏠 Rumah',
                    misi2: '2. 🏪 Kedai',
                    misi3: '3. 🌳 Taman',
                    misi4: '4. 🧹 Gotong-royong',
                    misi5: '5. 🏛️ Balai'
                  };

                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!prevCompleted && !prog.completed && !isCurrent}
                      onClick={() => navigateToMission(m.id, true)}
                      className={`min-h-8 rounded-xl border px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                        isCurrent
                          ? 'border-emerald-700 bg-emerald-700 text-white'
                          : prog.completed
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                          : prevCompleted
                          ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                          : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {prog.completed ? '✓ ' : ''}
                      {shortLabels[m.id]}
                    </button>
                  );
                })}
              </div>

              {/* Route Switcher & Background Theme */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center rounded-xl bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setGameState((prev) => ({ ...prev, activeRoute: 'utama' }))
                    }
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap ${
                      gameState.activeRoute === 'utama'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    🌟 Utama
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setGameState((prev) => ({ ...prev, activeRoute: 'bimbingan' }))
                    }
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap ${
                      gameState.activeRoute === 'bimbingan'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    🌱 Bimbingan
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setBackdropStyle((prev) =>
                      prev === 'pelangi'
                        ? 'festival_wau'
                        : prev === 'festival_wau'
                        ? 'kampung_ceria'
                        : 'pelangi'
                    )
                  }
                  className="min-h-8 rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-slate-50"
                  title="Tukar Suasana Latar"
                >
                  {backdropStyle === 'pelangi'
                    ? '🌈'
                    : backdropStyle === 'festival_wau'
                    ? '🪁'
                    : '🌿'}
                </button>
              </div>
            </div>

            {/* FULL-WIDTH 3D GAME VIEWPORT WITH INTEGRATED MISSION HUD */}
            <Komuniti3DViewport
              avatar={gameState.avatar}
              missionId={gameState.currentMission}
              route={gameState.activeRoute}
              isTravelling={gameState.isTravelling}
              targetRunStars={SASARAN_BINTANG_MISI[gameState.currentMission]}
              onStartTravelRun={handleStartTravelRun}
              onFinishTravel={handleFinishTravel}
              pace={gameState.pace}
              onChangePace={(newPace) =>
                setGameState((prev) => ({ ...prev, pace: newPace }))
              }
              runnerStarsCollected={gameState.runnerStarsCollected || 0}
              onCollectRunnerStar={handleCollectRunnerStar}
              reducedMotion={gameState.reducedMotion}
              lowPerformance={gameState.lowPerformance3D}
              heldItem={getCurrentHeldItem()}
              hotspots={getSceneHotspots()}
              onInteractHotspot={handleHotspotInteraction}
              destinationName={currentMissionMeta.locationName}
              statusBannerText={`${currentMissionMeta.numberLabel} · ${currentMissionMeta.npcName}`}
            >
              {/* =========================================================
                  TOP FLOATING HUD INSIDE 3D SCREEN:
                  Big "🔊 Dengar Arahan" Button + Short Prompt + Feedback
                 ========================================================= */}
              <div className="flex flex-col gap-2 pointer-events-none">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Left: Audio & Hint Control Pill */}
                  <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-2xl bg-slate-900/90 backdrop-blur-md p-2 text-white border border-white/15 shadow-xl">
                    <button
                      type="button"
                      onClick={playCurrentPrimaryAudio}
                      className="min-h-11 rounded-xl bg-emerald-500 px-4 py-2 text-sm sm:text-base font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all whitespace-nowrap shadow-md"
                    >
                      {playingClipId
                        ? '🔊 Sedang Bunyi...'
                        : hasListenedInCurrentStep
                        ? '🔊 Dengar Semula'
                        : '🔊 Dengar Arahan'}
                    </button>

                    {gameState.activeRoute === 'bimbingan' &&
                      gameState.currentMission !== 'percubaan' &&
                      gameState.currentMission !== 'misi4' &&
                      gameState.currentMission !== 'misi5' && (
                        <button
                          type="button"
                          onClick={() =>
                            playTeacherClip(`${gameState.currentMission}_bimbingan_nama`)
                          }
                          className="min-h-11 rounded-xl bg-amber-400 px-3 py-2 text-xs sm:text-sm font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap"
                        >
                          🔊 Kata Nama
                        </button>
                      )}

                    <button
                      type="button"
                      onClick={requestHint}
                      className={`min-h-11 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
                        showHintForCurrentMission
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-white/15'
                      }`}
                    >
                      💡 Petunjuk
                    </button>
                  </div>

                  {/* Right: Mode Toggle (3D Action vs Oral Speech) & Minimize HUD */}
                  <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md p-1.5 text-white border border-white/15 shadow-xl">
                    {['misi1', 'misi2', 'misi3', 'misi5'].includes(
                      gameState.currentMission
                    ) && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setMissionSubTab('aksi');
                            setMinimizeHudCard(false);
                          }}
                          className={`min-h-9 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                            missionSubTab === 'aksi' && !minimizeHudCard
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          👆 1. Pilih 3D
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMissionSubTab('lisan');
                            setMinimizeHudCard(false);
                          }}
                          className={`min-h-9 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                            missionSubTab === 'lisan' && !minimizeHudCard
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          🗣️ 2. Sebut
                        </button>
                      </>
                    )}

                    {currentMissionMeta.id !== 'percubaan' && (
                      <BadgeEmblem
                        badgeId={currentMissionMeta.badgeId}
                        earned={currentMissionProg.badgeEarned}
                        className="w-8 h-8 shrink-0"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => setMinimizeHudCard((v) => !v)}
                      className="min-h-9 rounded-xl bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-200 hover:bg-slate-700"
                      title="Sembunyi atau Papar Kad Misi"
                    >
                      {minimizeHudCard ? '🔼 Kad' : '🔽 Skrin Penuh'}
                    </button>
                  </div>
                </div>

                {/* Missing Teacher Audio Compact Notice */}
                {missingClipNoticeId && (
                  <div className="pointer-events-auto self-start max-w-xl rounded-2xl border-2 border-amber-400 bg-slate-900/95 px-4 py-2.5 text-white shadow-xl flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs">
                      <p className="font-bold text-amber-300">
                        🎙️ Audio Guru Belum Dirakam ({missingClipNoticeId})
                      </p>
                      <p className="text-slate-200 mt-0.5">
                        “{SENARAI_KLIP_AUDIO_GURU.find((c) => c.id === missingClipNoticeId)?.script}”
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStudioFilterMission(gameState.currentMission);
                        setIsAudioStudioOpen(true);
                      }}
                      className="rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap"
                    >
                      Rakam Sekarang
                    </button>
                  </div>
                )}

                {/* Short Feedback Toast inside 3D Viewport */}
                {feedbackBanner && (
                  <div
                    role="status"
                    className={`pointer-events-auto self-start max-w-lg rounded-2xl border-2 px-4 py-2 shadow-xl flex items-center justify-between gap-3 ${
                      feedbackBanner.tone === 'positif'
                        ? 'border-emerald-400 bg-emerald-950/90 text-white'
                        : feedbackBanner.tone === 'bimbingan'
                        ? 'border-amber-400 bg-amber-950/90 text-white'
                        : 'border-sky-400 bg-sky-950/90 text-white'
                    }`}
                  >
                    <div className="text-xs sm:text-sm">
                      <span className="font-bold">{feedbackBanner.title}</span>{' '}
                      <span className="text-slate-200">{feedbackBanner.message}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFeedbackBanner(null)}
                      className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-bold text-white hover:bg-white/20"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* =========================================================
                  BOTTOM FLOATING HUD INSIDE 3D SCREEN:
                  Visual Picture Cards & Oral Response Speech Bubble
                 ========================================================= */}
              {!minimizeHudCard && (
                <div className="pointer-events-auto w-full max-w-3xl mx-auto">
                  {/* MISI PERCUBAAN HUD */}
                  {gameState.currentMission === 'percubaan' && (
                    <div className="rounded-2xl border border-white/20 bg-slate-900/90 backdrop-blur-md p-3 text-white shadow-2xl space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span
                            className={`rounded-lg px-2.5 py-1 ${
                              trialStage === 1
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-emerald-800 text-emerald-200'
                            }`}
                          >
                            1. Pilih Buku
                          </span>
                          <span
                            className={`rounded-lg px-2.5 py-1 ${
                              trialStage === 2
                                ? 'bg-amber-400 text-slate-950'
                                : trialStage > 2
                                ? 'bg-emerald-800 text-emerald-200'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            2. Bagi Cikgu
                          </span>
                          <span
                            className={`rounded-lg px-2.5 py-1 ${
                              trialStage === 3
                                ? 'bg-amber-400 text-slate-950'
                                : trialStage > 3
                                ? 'bg-emerald-800 text-emerald-200'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            3. Sebut
                          </span>
                        </div>
                        {showHintForCurrentMission && (
                          <span className="text-xs font-bold text-amber-300">
                            💡 Pilih 📕 buku & serahkan kepada 👩‍🏫 Cikgu Sara
                          </span>
                        )}
                      </div>

                      {trialStage === 1 && (
                        <div className="grid grid-cols-3 gap-2.5">
                          {(
                            [
                              { id: 'buku', label: 'buku', pic: 'buku' },
                              { id: 'bola', label: 'bola', pic: 'bola' },
                              { id: 'pensel', label: 'pensel', pic: 'pensel' }
                            ] as { id: string; label: string; pic: ContextPictureType }[]
                          ).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleHotspotInteraction(item.id)}
                              className="flex items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-slate-800/90 p-2.5 hover:border-amber-400 hover:bg-slate-800 transition-all"
                            >
                              <ContextIllustration type={item.pic} className="w-11 h-11 shrink-0" />
                              <span className="text-sm font-bold text-white">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {trialStage === 2 && (
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleHotspotInteraction('buku')}
                            className={`flex items-center justify-center gap-2.5 rounded-xl border-2 p-2.5 font-bold text-sm transition-all ${
                              trialC2BookTaken
                                ? 'border-emerald-400 bg-emerald-900/70 text-emerald-200'
                                : 'border-amber-400 bg-slate-800 text-white'
                            }`}
                          >
                            <ContextIllustration type="buku" className="w-11 h-11 shrink-0" />
                            <span>{trialC2BookTaken ? '✓ 1. Buku Diambil' : '1. Ambil Buku'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleHotspotInteraction('cikgu_sara')}
                            className={`flex items-center justify-center gap-2.5 rounded-xl border-2 p-2.5 font-bold text-sm transition-all ${
                              trialC2BookTaken
                                ? 'border-amber-400 bg-slate-800 text-white'
                                : 'border-white/15 bg-slate-800/60 text-slate-300'
                            }`}
                          >
                            <ContextIllustration type="cikgu_sara" className="w-11 h-11 shrink-0" />
                            <span>2. Beri Cikgu Sara</span>
                          </button>
                        </div>
                      )}

                      {trialStage === 3 && (
                        <PupilOralResponseWidget
                          pupilName={gameState.pupilName}
                          missionId="percubaan"
                          route={gameState.activeRoute}
                          stepLabel="Cabaran 3: Sebut Objek"
                          promptQuestion="Apakah yang kamu bawa?"
                          sampleResponses={[
                            'Saya membawa buku.',
                            'Ini buku untuk Cikgu Sara.'
                          ]}
                          selectedResponse={trialOralSelection}
                          onSelectResponse={setTrialOralSelection}
                          oralConfirmed={currentMissionProg.oralResponseConfirmed}
                          onConfirmOralResponse={(txt) => handleFinishTrialDiagnostic(txt)}
                          onRecordingSaved={refreshPupilRecordings}
                          latestRecording={pupilRecordings.find((r) => r.missionId === 'percubaan')}
                        />
                      )}

                      {trialStage === 4 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-emerald-300">
                              🎫 Pas Masuk Sedia!
                            </span>
                            <span className="text-xs text-slate-300">
                              Cadangan: {gameState.recommendedRoute === 'utama' ? '🌟 Utama' : '🌱 Bimbingan'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigateToMission('misi1', true)}
                            className="min-h-11 rounded-xl bg-amber-400 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300 shadow-md"
                          >
                            🏃 Lari ke Misi 1: Rumah Jiran ➔
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MISI 1: RUMAH JIRAN HUD */}
                  {gameState.currentMission === 'misi1' && (
                    <div className="space-y-2">
                      {missionSubTab === 'aksi' ? (
                        <div className="rounded-2xl border border-white/20 bg-slate-900/90 backdrop-blur-md p-3 text-white shadow-2xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-amber-300">
                              👵 Bantu Puan Salmah: Klik 1. Kotak ➔ 2. Rumah
                            </span>
                            <button
                              type="button"
                              onClick={() => setMissionSubTab('lisan')}
                              className="text-emerald-300 underline"
                            >
                              🗣️ Pergi Sebut ➔
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleHotspotInteraction('kotak')}
                              className={`flex items-center justify-center gap-2 rounded-xl border-2 p-2 text-xs sm:text-sm font-bold ${
                                m1BoxTaken
                                  ? 'border-emerald-400 bg-emerald-900/70 text-emerald-200'
                                  : 'border-amber-400 bg-slate-800 text-white'
                              }`}
                            >
                              <ContextIllustration type="kotak" className="w-11 h-11 shrink-0" />
                              <span>{m1BoxTaken ? '✓ 1. Kotak' : '1. Kotak'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleHotspotInteraction('rumah_jiran')}
                              className={`flex items-center justify-center gap-2 rounded-xl border-2 p-2 text-xs sm:text-sm font-bold ${
                                m1BoxDelivered
                                  ? 'border-emerald-400 bg-emerald-900/70 text-emerald-200'
                                  : m1BoxTaken
                                  ? 'border-amber-400 bg-slate-800 text-white'
                                  : 'border-white/15 bg-slate-800/70 text-slate-300'
                              }`}
                            >
                              <ContextIllustration type="rumah" className="w-11 h-11 shrink-0" />
                              <span>{m1BoxDelivered ? '✓ 2. Rumah' : '2. Rumah'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setMissionSubTab('lisan')}
                              className="flex items-center justify-center gap-2 rounded-xl border-2 border-white/15 bg-slate-800/80 p-2 text-xs sm:text-sm font-bold text-amber-300 hover:border-amber-400"
                            >
                              <ContextIllustration type="puan_salmah" className="w-11 h-11 shrink-0" />
                              <span>3. Sebut 🗣️</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <PupilOralResponseWidget
                          pupilName={gameState.pupilName}
                          missionId="misi1"
                          route={gameState.activeRoute}
                          stepLabel="Misi 1: Respons Sopan"
                          promptQuestion="Jawab dengan sopan kepada Puan Salmah:"
                          sampleResponses={
                            gameState.activeRoute === 'bimbingan'
                              ? [
                                  'Saya bantu Puan Salmah.',
                                  'Saya bawa kotak ke rumah.'
                                ]
                              : [
                                  'Boleh, Puan Salmah. Saya bantu bawa kotak ini.',
                                  'Mari saya bawakan kotak ini masuk ke rumah.'
                                ]
                          }
                          selectedResponse={m1OralSelection}
                          onSelectResponse={setM1OralSelection}
                          oralConfirmed={currentMissionProg.oralResponseConfirmed}
                          onConfirmOralResponse={(txt) => {
                            setM1BoxTaken(true);
                            setM1BoxDelivered(true);
                            recordActionCompleted('misi1', 'Memberikan respons lisan sopan kepada Puan Salmah');
                            completeMission('misi1', txt);
                            setFeedbackBanner({
                              tone: 'positif',
                              title: '🏆 Lencana Jiran Prihatin (+15 Mata)!',
                              message: 'Misi 1 selesai!'
                            });
                          }}
                          onRecordingSaved={refreshPupilRecordings}
                          latestRecording={pupilRecordings.find((r) => r.missionId === 'misi1')}
                        />
                      )}

                      {currentMissionProg.completed && (
                        <button
                          type="button"
                          onClick={() => navigateToMission('misi2', true)}
                          className="min-h-11 w-full rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300 shadow-lg"
                        >
                          🏃 Lari Kutip Bintang ke Misi 2: Kedai Komuniti ➔
                        </button>
                      )}
                    </div>
                  )}

                  {/* MISI 2: KEDAI KOMUNITI HUD */}
                  {gameState.currentMission === 'misi2' && (
                    <div className="space-y-2">
                      {missionSubTab === 'aksi' ? (
                        <div className="rounded-2xl border border-white/20 bg-slate-900/90 backdrop-blur-md p-3 text-white shadow-2xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-amber-300">
                              🏪 Siapakah penerima bungkusan Encik Chong?
                            </span>
                            <button
                              type="button"
                              onClick={() => setMissionSubTab('lisan')}
                              className="text-emerald-300 underline"
                            >
                              🗣️ Pergi Sebut ➔
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleHotspotInteraction('bungkusan')}
                              className={`flex items-center justify-center gap-2 rounded-xl border-2 p-2 text-xs sm:text-sm font-bold ${
                                m2RecipientChosen
                                  ? 'border-emerald-400 bg-emerald-900/70 text-emerald-200'
                                  : 'border-amber-400 bg-slate-800 text-white'
                              }`}
                            >
                              <ContextIllustration type="bungkusan" className="w-11 h-11 shrink-0" />
                              <span>1. Bungkusan</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleHotspotInteraction('puan_aisyah')}
                              className={`flex items-center justify-center gap-2 rounded-xl border-2 p-2 text-xs sm:text-sm font-bold ${
                                m2ArrivedAtAisyah
                                  ? 'border-emerald-400 bg-emerald-900/70 text-emerald-200'
                                  : 'border-amber-400 bg-slate-800 text-white'
                              }`}
                            >
                              <ContextIllustration type="puan_aisyah" className="w-11 h-11 shrink-0" />
                              <span>✓ Puan Aisyah</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                markFirstAttemptMisstep('misi2');
                                setFeedbackBanner({
                                  tone: 'bimbingan',
                                  title: '🤔 Bukan Puan Salmah!',
                                  message: 'Pesanan ini untuk Puan Aisyah.'
                                });
                              }}
                              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-800/70 p-2 text-xs sm:text-sm font-bold text-slate-300"
                            >
                              <ContextIllustration type="puan_salmah" className="w-11 h-11 shrink-0" />
                              <span>Puan Salmah</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <PupilOralResponseWidget
                          pupilName={gameState.pupilName}
                          missionId="misi2"
                          route={gameState.activeRoute}
                          stepLabel="Misi 2: Pesanan Puan Aisyah"
                          promptQuestion="Beritahu pesanan Encik Chong kepada Puan Aisyah:"
                          sampleResponses={
                            gameState.activeRoute === 'bimbingan'
                              ? [
                                  'Barang Puan Aisyah sudah sampai.',
                                  'Bungkusan puan ada di kedai.'
                                ]
                              : [
                                  'Puan Aisyah, barang tempahan puan sudah sampai di kedai.',
                                  'Encik Chong beritahu bungkusan Puan Aisyah sudah sampai.'
                                ]
                          }
                          selectedResponse={m2OralSelection}
                          onSelectResponse={setM2OralSelection}
                          oralConfirmed={currentMissionProg.oralResponseConfirmed}
                          onConfirmOralResponse={(txt) => {
                            setM2RecipientChosen(true);
                            setM2ArrivedAtAisyah(true);
                            recordActionCompleted('misi2', 'Menyampaikan pesanan secara lisan kepada Puan Aisyah');
                            completeMission('misi2', txt);
                            setFeedbackBanner({
                              tone: 'positif',
                              title: '🏆 Lencana Penyampai Amanah (+15 Mata)!',
                              message: 'Misi 2 selesai!'
                            });
                          }}
                          onRecordingSaved={refreshPupilRecordings}
                          latestRecording={pupilRecordings.find((r) => r.missionId === 'misi2')}
                        />
                      )}

                      {currentMissionProg.completed && (
                        <button
                          type="button"
                          onClick={() => navigateToMission('misi3', true)}
                          className="min-h-11 w-full rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300 shadow-lg"
                        >
                          🏃 Lari Kutip Bintang ke Misi 3: Taman Komuniti ➔
                        </button>
                      )}
                    </div>
                  )}

                  {/* MISI 3: TAMAN KOMUNITI HUD */}
                  {gameState.currentMission === 'misi3' && (
                    <div className="space-y-2">
                      {missionSubTab === 'aksi' ? (
                        <div className="rounded-2xl border border-white/20 bg-slate-900/90 backdrop-blur-md p-3 text-white shadow-2xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-amber-300">
                              🌳 Pilih alat untuk bersihkan taman bersama Aiman:
                            </span>
                            <button
                              type="button"
                              onClick={() => setMissionSubTab('lisan')}
                              className="text-emerald-300 underline"
                            >
                              🗣️ Pergi Sebut ➔
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2.5">
                            {(
                              [
                                { id: 'penyapu', label: 'penyapu', pic: 'penyapu' },
                                { id: 'bola', label: 'bola', pic: 'bola' },
                                { id: 'buku', label: 'buku', pic: 'buku' }
                              ] as { id: string; label: string; pic: ContextPictureType }[]
                            ).map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleHotspotInteraction(item.id)}
                                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-2 text-xs sm:text-sm font-bold ${
                                  item.id === 'penyapu' && m3ToolSelected
                                    ? 'border-emerald-400 bg-emerald-900/70 text-emerald-200'
                                    : 'border-white/15 bg-slate-800 text-white hover:border-amber-400'
                                }`}
                              >
                                <ContextIllustration type={item.pic} className="w-11 h-11 shrink-0" />
                                <span>
                                  {item.id === 'penyapu' && m3ToolSelected ? '✓ penyapu' : item.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <PupilOralResponseWidget
                          pupilName={gameState.pupilName}
                          missionId="misi3"
                          route={gameState.activeRoute}
                          stepLabel="Misi 3: Pendapat Kebersihan Taman"
                          promptQuestion="Apakah yang patut kita buat di taman ini?"
                          sampleResponses={
                            gameState.activeRoute === 'bimbingan'
                              ? [
                                  'Kita membersihkan taman.',
                                  'Kita menyapu sampah guna penyapu.'
                                ]
                              : [
                                  'Kita patut menyapu sampah dan membersihkan taman ini bersama-sama.',
                                  'Pada pendapat saya, kita perlu menjaga kebersihan taman.'
                                ]
                          }
                          selectedResponse={m3OralSelection}
                          onSelectResponse={setM3OralSelection}
                          oralConfirmed={currentMissionProg.oralResponseConfirmed}
                          onConfirmOralResponse={(txt) => {
                            setM3ToolSelected(true);
                            recordActionCompleted('misi3', 'Memberikan pendapat lisan kepada Aiman');
                            completeMission('misi3', txt);
                            setFeedbackBanner({
                              tone: 'positif',
                              title: '🏆 Lencana Penjaga Alam (+20 Mata)!',
                              message: 'Misi 3 selesai!'
                            });
                          }}
                          onRecordingSaved={refreshPupilRecordings}
                          latestRecording={pupilRecordings.find((r) => r.missionId === 'misi3')}
                        />
                      )}

                      {currentMissionProg.completed && (
                        <button
                          type="button"
                          onClick={() => navigateToMission('misi4', true)}
                          className="min-h-11 w-full rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300 shadow-lg"
                        >
                          🏃 Lari Kutip Bintang ke Misi 4: Pusat Gotong-royong ➔
                        </button>
                      )}
                    </div>
                  )}

                  {/* MISI 4: PUSAT GOTONG-ROYONG HUD (4 Visual Steps) */}
                  {gameState.currentMission === 'misi4' && (
                    <div className="rounded-2xl border border-white/20 bg-slate-900/90 backdrop-blur-md p-3 text-white shadow-2xl space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                        <span className="text-amber-300">
                          🧹 Ikut Urutan 1 ➔ 2 ➔ 3 ➔ 4:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => playTeacherClip('misi4_utama_1')}
                            className="rounded-lg bg-emerald-700 px-2.5 py-1 text-white hover:bg-emerald-600"
                          >
                            🔊 Arahan 1 (Langkah 1-2)
                          </button>
                          <button
                            type="button"
                            onClick={() => playTeacherClip('misi4_utama_2')}
                            className="rounded-lg bg-sky-700 px-2.5 py-1 text-white hover:bg-sky-600"
                          >
                            🔊 Arahan 2 (Langkah 3-4)
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          {
                            step: 1,
                            id: 'pondok_penyapu',
                            label: '1. Penyapu',
                            pic: 'penyapu' as ContextPictureType
                          },
                          {
                            step: 2,
                            id: 'taman_permainan',
                            label: '2. Taman',
                            pic: 'taman_permainan' as ContextPictureType
                          },
                          {
                            step: 3,
                            id: 'bangku_botol',
                            label: '3. Botol',
                            pic: 'botol_plastik' as ContextPictureType
                          },
                          {
                            step: 4,
                            id: 'tong_kitar_semula',
                            label: '4. Tong Kitar',
                            pic: 'tong_kitar_semula' as ContextPictureType
                          }
                        ].map((item) => {
                          const done = m4Step > item.step;
                          const current = m4Step === item.step;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleHotspotInteraction(item.id)}
                              className={`flex flex-col items-center rounded-xl border-2 p-2 text-xs font-bold transition-all ${
                                done
                                  ? 'border-emerald-400 bg-emerald-900/70 text-emerald-200'
                                  : current
                                  ? 'border-amber-400 bg-slate-800 text-white'
                                  : 'border-white/10 bg-slate-800/60 text-slate-400'
                              }`}
                            >
                              <ContextIllustration type={item.pic} className="w-10 h-10" />
                              <span className="mt-1">
                                {done ? `✓ ${item.label}` : item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {currentMissionProg.completed && (
                        <button
                          type="button"
                          onClick={() => navigateToMission('misi5', true)}
                          className="min-h-11 w-full rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300 shadow-lg"
                        >
                          🏃 Lari Kutip Bintang ke Misi 5: Balai Komuniti ➔
                        </button>
                      )}
                    </div>
                  )}

                  {/* MISI 5: BALAI KOMUNITI HUD */}
                  {gameState.currentMission === 'misi5' && (
                    <div className="space-y-2">
                      {missionSubTab === 'aksi' ? (
                        <div className="rounded-2xl border border-white/20 bg-slate-900/90 backdrop-blur-md p-3 text-white shadow-2xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-amber-300">
                              🏛️ Klik 4 gambar cerita komuniti kamu:
                            </span>
                            <button
                              type="button"
                              onClick={() => setMissionSubTab('lisan')}
                              className="text-emerald-300 underline"
                            >
                              🗣️ Ceritakan Semula ➔
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              {
                                num: 1,
                                tag: '1. Mula-mula',
                                title: 'Rumah',
                                pic: 'kotak' as ContextPictureType,
                                clip: 'misi5_bimbingan_1'
                              },
                              {
                                num: 2,
                                tag: '2. Selepas itu',
                                title: 'Kedai',
                                pic: 'bungkusan' as ContextPictureType,
                                clip: 'misi5_bimbingan_2'
                              },
                              {
                                num: 3,
                                tag: '3. Kemudian',
                                title: 'Taman',
                                pic: 'penyapu' as ContextPictureType,
                                clip: 'misi5_bimbingan_3'
                              },
                              {
                                num: 4,
                                tag: '4. Akhir sekali',
                                title: 'Gotong-royong',
                                pic: 'tong_kitar_semula' as ContextPictureType,
                                clip: 'misi5_bimbingan_4'
                              }
                            ].map((st) => {
                              const done = m5CompletedSteps.includes(st.num);
                              return (
                                <button
                                  key={st.num}
                                  type="button"
                                  onClick={() => {
                                    handleHotspotInteraction(`stesen_${st.num}`);
                                    if (gameState.activeRoute === 'bimbingan') {
                                      playTeacherClip(st.clip);
                                    }
                                  }}
                                  className={`flex flex-col items-center rounded-xl border-2 p-2 text-xs font-bold transition-all ${
                                    done
                                      ? 'border-emerald-400 bg-emerald-900/70 text-white'
                                      : 'border-white/15 bg-slate-800 text-white hover:border-amber-400'
                                  }`}
                                >
                                  <ContextIllustration type={st.pic} className="w-10 h-10" />
                                  <span className="mt-1 text-[11px] text-amber-300">{st.tag}</span>
                                  <span>{done ? `✓ ${st.title}` : st.title}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <PupilOralResponseWidget
                          pupilName={gameState.pupilName}
                          missionId="misi5"
                          route={gameState.activeRoute}
                          stepLabel="Misi 5: Cerita Wira Komuniti"
                          promptQuestion="Ceritakan pengalaman kamu kepada Tok Razak:"
                          sampleResponses={
                            gameState.activeRoute === 'bimbingan'
                              ? [
                                  'Saya bawa kotak, sampaikan pesanan, sapu taman, dan kitar semula botol.',
                                  'Saya membantu Puan Salmah, Puan Aisyah, dan Aiman di komuniti.'
                                ]
                              : [
                                  'Mula-mula saya bantu Puan Salmah. Selepas itu saya beritahu Puan Aisyah. Kemudian saya sapu taman bersama Aiman. Akhir sekali saya kitar semula botol.',
                                  'Saya gembira dapat membantu jiran dan menjaga kebersihan Komuniti Harmoni.'
                                ]
                          }
                          selectedResponse={m5OralSelection}
                          onSelectResponse={setM5OralSelection}
                          oralConfirmed={currentMissionProg.oralResponseConfirmed}
                          onConfirmOralResponse={(txt) => {
                            recordActionCompleted('misi5', 'Menceritakan semula pengalaman di 4 lokasi komuniti');
                            completeMission('misi5', txt);
                            setFeedbackBanner({
                              tone: 'positif',
                              title: '🏆 Lencana Wira Komuniti (+30 Mata)!',
                              message: 'Semua misi tamat! Buka Kad Pencapaian.'
                            });
                          }}
                          onRecordingSaved={refreshPupilRecordings}
                          latestRecording={pupilRecordings.find((r) => r.missionId === 'misi5')}
                        />
                      )}

                      {currentMissionProg.completed && (
                        <button
                          type="button"
                          onClick={() => setActiveScreen('pencapaian')}
                          className="min-h-12 w-full rounded-xl bg-emerald-500 px-5 py-2.5 text-base font-bold text-slate-950 hover:bg-emerald-400 shadow-xl"
                        >
                          🏆 Lihat Kad Pencapaian & Lencana Kamu! ➔
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Komuniti3DViewport>
          </div>
        )}
      </main>

      {/* Modals */}
      <TeacherAudioStudioModal
        isOpen={isAudioStudioOpen}
        onClose={() => setIsAudioStudioOpen(false)}
        storedClips={storedAudioClips}
        onClipsUpdated={refreshAudioClips}
        initialMissionFilter={studioFilterMission}
      />

      <TeacherReviewModal
        isOpen={isTeacherReviewOpen}
        onClose={() => setIsTeacherReviewOpen(false)}
        gameState={gameState}
        pupilRecordings={pupilRecordings}
        onToggleOralConfirm={(mId, confirmed) => {
          const meta = SENARAI_MISI.find((m) => m.id === mId);
          setGameState((prev) => ({
            ...prev,
            missions: {
              ...prev.missions,
              [mId]: {
                ...prev.missions[mId],
                oralResponseConfirmed: confirmed,
                completed: confirmed ? true : prev.missions[mId].completed,
                pointsAwarded: confirmed && meta ? meta.points : prev.missions[mId].pointsAwarded,
                badgeEarned: confirmed ? true : prev.missions[mId].badgeEarned
              }
            }
          }));
        }}
        onResetSession={handleResetPupilSession}
      />

      <CommunityMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        gameState={gameState}
        onSelectMission={(mId) => navigateToMission(mId, true)}
        onOpenAchievementCard={() => setActiveScreen('pencapaian')}
      />
    </div>
  );
}
