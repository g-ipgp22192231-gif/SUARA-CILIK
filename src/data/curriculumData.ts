import { AudioClipSpec, MissionId, MissionProgress } from '../types/game';

export const SENARAI_KLIP_AUDIO_GURU: AudioClipSpec[] = [
  // MISI PERCUBAAN: DAPATKAN PAS MASUK!
  {
    id: 'percubaan_c1',
    missionId: 'percubaan',
    title: 'Cabaran 1: Pilih Objek di atas Meja',
    speaker: 'Cikgu Sara',
    script: 'Ambil buku yang berada di atas meja.',
    routeUsage: 'semua',
    contextNote: 'Murid mendengar dan memilih objek buku daripada buku, bola, dan pensel di atas meja.'
  },
  {
    id: 'percubaan_c2',
    missionId: 'percubaan',
    title: 'Cabaran 2: Arahan Dua Langkah',
    speaker: 'Cikgu Sara',
    script: 'Ambil buku yang berada di atas meja. Kemudian, berikan buku itu kepada Cikgu Sara.',
    routeUsage: 'semua',
    contextNote: 'Murid mengambil buku dahulu, kemudian bergerak ke arah Cikgu Sara mengikut urutan.'
  },
  {
    id: 'percubaan_c3',
    missionId: 'percubaan',
    title: 'Cabaran 3: Soalan Respons Lisan',
    speaker: 'Cikgu Sara',
    script: 'Apakah yang kamu bawa?',
    routeUsage: 'semua',
    contextNote: 'Murid menjawab secara lisan, contohnya: "Saya membawa buku."'
  },

  // MISI 1: JIRAN PRIHATIN (RUMAH JIRAN)
  {
    id: 'misi1_utama',
    missionId: 'misi1',
    title: 'Misi 1: Permintaan Bantuan Puan Salmah',
    speaker: 'Puan Salmah',
    script: 'Bolehkah kamu membantu saya membawa kotak ini ke dalam rumah?',
    routeUsage: 'semua',
    contextNote: 'Ujaran utama Puan Salmah di hadapan Rumah Jiran.'
  },
  {
    id: 'misi1_bimbingan_nama',
    missionId: 'misi1',
    title: 'Misi 1 (Bimbingan): Kenal Pasti Kata Nama',
    speaker: 'Guru Pembimbing',
    script: 'Pilih gambar kotak yang perlu dibawa ke dalam rumah Puan Salmah.',
    routeUsage: 'bimbingan',
    contextNote: 'Audio ringkas Laluan Bimbingan untuk mengecam kata nama "kotak" berdasarkan gambar konteks.'
  },

  // MISI 2: PESANAN PENTING (KEDAI KOMUNITI)
  {
    id: 'misi2_utama',
    missionId: 'misi2',
    title: 'Misi 2: Pesanan Encik Chong',
    speaker: 'Encik Chong',
    script: 'Tolong beritahu Puan Aisyah bahawa barang yang puan tempah sudah sampai.',
    routeUsage: 'semua',
    contextNote: 'Ujaran pesanan di Kedai Komuniti untuk disampaikan kepada Puan Aisyah.'
  },
  {
    id: 'misi2_bimbingan_nama',
    missionId: 'misi2',
    title: 'Misi 2 (Bimbingan): Kenal Pasti Penerima & Kata Nama',
    speaker: 'Encik Chong',
    script: 'Bungkusan ini untuk Puan Aisyah. Tolong pergi ke rumah Puan Aisyah.',
    routeUsage: 'bimbingan',
    contextNote: 'Audio ringkas Laluan Bimbingan untuk mengecam kata nama "bungkusan" dan "Puan Aisyah".'
  },

  // MISI 3: TAMAN KITA, TANGGUNGJAWAB KITA (TAMAN KOMUNITI)
  {
    id: 'misi3_utama',
    missionId: 'misi3',
    title: 'Misi 3: Pertanyaan Pendapat oleh Aiman',
    speaker: 'Aiman',
    script: 'Kawasan taman ini kotor selepas aktiviti semalam. Pada pendapat kamu, apakah yang patut kita lakukan?',
    routeUsage: 'semua',
    contextNote: 'Aiman meminta pendapat murid tentang tindakan membersihkan Taman Komuniti.'
  },
  {
    id: 'misi3_bimbingan_nama',
    missionId: 'misi3',
    title: 'Misi 3 (Bimbingan): Pilih Alat Pembersihan (Kata Nama)',
    speaker: 'Aiman',
    script: 'Taman ini kotor. Pilih penyapu untuk kita membersihkan taman.',
    routeUsage: 'bimbingan',
    contextNote: 'Audio ringkas Laluan Bimbingan untuk memilih kata nama "penyapu" daripada gambar konteks.'
  },

  // MISI 4: DENGAR DAN LAKSANAKAN (PUSAT GOTONG-ROYONG)
  {
    id: 'misi4_utama_1',
    missionId: 'misi4',
    title: 'Misi 4 (Bahagian 1): Arahan Penyapu & Taman Permainan',
    speaker: 'Ketua Gotong-royong',
    script: 'Ambil penyapu yang berada di sebelah pondok. Kemudian, bawa penyapu itu ke kawasan taman permainan.',
    routeUsage: 'utama',
    contextNote: 'Arahan dua langkah pertama di Pusat Gotong-royong.'
  },
  {
    id: 'misi4_utama_2',
    missionId: 'misi4',
    title: 'Misi 4 (Bahagian 2): Arahan Botol Plastik & Tong Kitar Semula',
    speaker: 'Ketua Gotong-royong',
    script: 'Kutip botol plastik berhampiran bangku. Selepas itu, masukkan botol tersebut ke dalam tong kitar semula.',
    routeUsage: 'utama',
    contextNote: 'Arahan dua langkah kedua di Pusat Gotong-royong.'
  },
  {
    id: 'misi4_bimbingan_1a',
    missionId: 'misi4',
    title: 'Misi 4 (Bimbingan Langkah 1): Ambil Penyapu',
    speaker: 'Ketua Gotong-royong',
    script: 'Ambil penyapu yang berada di sebelah pondok.',
    routeUsage: 'bimbingan',
    contextNote: 'Langkah 1 terpisah untuk Laluan Bimbingan.'
  },
  {
    id: 'misi4_bimbingan_1b',
    missionId: 'misi4',
    title: 'Misi 4 (Bimbingan Langkah 2): Bawa ke Taman Permainan',
    speaker: 'Ketua Gotong-royong',
    script: 'Bawa penyapu itu ke kawasan taman permainan.',
    routeUsage: 'bimbingan',
    contextNote: 'Langkah 2 terpisah untuk Laluan Bimbingan.'
  },
  {
    id: 'misi4_bimbingan_2a',
    missionId: 'misi4',
    title: 'Misi 4 (Bimbingan Langkah 3): Kutip Botol Plastik',
    speaker: 'Ketua Gotong-royong',
    script: 'Kutip botol plastik berhampiran bangku.',
    routeUsage: 'bimbingan',
    contextNote: 'Langkah 3 terpisah untuk Laluan Bimbingan.'
  },
  {
    id: 'misi4_bimbingan_2b',
    missionId: 'misi4',
    title: 'Misi 4 (Bimbingan Langkah 4): Masukkan ke Tong Kitar Semula',
    speaker: 'Ketua Gotong-royong',
    script: 'Masukkan botol tersebut ke dalam tong kitar semula.',
    routeUsage: 'bimbingan',
    contextNote: 'Langkah 4 terpisah untuk Laluan Bimbingan.'
  },

  // MISI 5: CABARAN WIRA KOMUNITI (BALAI KOMUNITI)
  {
    id: 'misi5_utama',
    missionId: 'misi5',
    title: 'Misi 5: Penceritaan Semula di Balai Komuniti',
    speaker: 'Tok Razak (Ketua Komuniti)',
    script: 'Tahniah kerana membantu penduduk Komuniti Harmoni! Ceritakan semula pengalaman kamu di keempat-empat lokasi tadi.',
    routeUsage: 'semua',
    contextNote: 'Ujaran Ketua Komuniti menjemput murid menceritakan pengalaman mengikut urutan.'
  },
  {
    id: 'misi5_bimbingan_1',
    missionId: 'misi5',
    title: 'Misi 5 (Bimbingan Gambar 1): Rumah Jiran',
    speaker: 'Tok Razak (Ketua Komuniti)',
    script: 'Lihat gambar pertama di Rumah Jiran. Apakah yang kamu lakukan bersama-sama Puan Salmah?',
    routeUsage: 'bimbingan',
    contextNote: 'Soalan berpandu gambar pertama untuk Laluan Bimbingan.'
  },
  {
    id: 'misi5_bimbingan_2',
    missionId: 'misi5',
    title: 'Misi 5 (Bimbingan Gambar 2): Kedai Komuniti',
    speaker: 'Tok Razak (Ketua Komuniti)',
    script: 'Lihat gambar kedua di Kedai Komuniti. Apakah pesanan yang kamu sampaikan kepada Puan Aisyah?',
    routeUsage: 'bimbingan',
    contextNote: 'Soalan berpandu gambar kedua untuk Laluan Bimbingan.'
  },
  {
    id: 'misi5_bimbingan_3',
    missionId: 'misi5',
    title: 'Misi 5 (Bimbingan Gambar 3): Taman Komuniti',
    speaker: 'Tok Razak (Ketua Komuniti)',
    script: 'Lihat gambar ketiga di Taman Komuniti. Apakah alat yang kita gunakan untuk membersihkan taman?',
    routeUsage: 'bimbingan',
    contextNote: 'Soalan berpandu gambar ketiga untuk Laluan Bimbingan.'
  },
  {
    id: 'misi5_bimbingan_4',
    missionId: 'misi5',
    title: 'Misi 5 (Bimbingan Gambar 4): Pusat Gotong-royong',
    speaker: 'Tok Razak (Ketua Komuniti)',
    script: 'Lihat gambar keempat di Pusat Gotong-royong. Ke manakah kamu memasukkan botol plastik?',
    routeUsage: 'bimbingan',
    contextNote: 'Soalan berpandu gambar keempat untuk Laluan Bimbingan.'
  }
];

export interface MissionMeta {
  id: MissionId;
  numberLabel: string;
  title: string;
  locationName: string;
  npcName: string;
  npcRole: string;
  points: number;
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  standardUtama: string;
  standardBimbingan: string;
  summary: string;
}

export const SENARAI_MISI: MissionMeta[] = [
  {
    id: 'percubaan',
    numberLabel: 'Misi Percubaan',
    title: 'Dapatkan Pas Masuk!',
    locationName: 'Pondok Pendaftaran Harmoni',
    npcName: 'Cikgu Sara',
    npcRole: 'Guru Penyelaras Komuniti',
    points: 0,
    badgeId: 'pas_masuk',
    badgeName: 'Pas Masuk Komuniti Harmoni',
    badgeDescription: 'Sedia memulakan pengembaraan mendengar dan bertutur di Komuniti Harmoni.',
    standardUtama: 'SP 1.1.2: Mendengar, memahami dan memberikan respons terhadap ujaran tidak formal.',
    standardBimbingan: 'SP 1.1.1 (i): Mendengar dan memberikan respons terhadap gambar mengikut konteks (kata nama).',
    summary: 'Dengar arahan Cikgu Sara, pilih buku di atas meja, serahkan kepada Cikgu Sara, dan sebut objek yang dibawa.'
  },
  {
    id: 'misi1',
    numberLabel: 'Misi 1',
    title: 'Jiran Prihatin',
    locationName: 'Rumah Jiran',
    npcName: 'Puan Salmah',
    npcRole: 'Jiran Tetangga',
    points: 15,
    badgeId: 'lencana_jiran_prihatin',
    badgeName: 'Lencana Jiran Prihatin',
    badgeDescription: 'Prihatin dan bersopan santun membantu jiran membawa kotak ke dalam rumah.',
    standardUtama: 'SP 1.1.2: Memberikan respons sopan terhadap permintaan bantuan jiran dalam situasi tidak formal.',
    standardBimbingan: 'SP 1.1.1 (i): Mengecam kata nama "kotak" dan "rumah" serta melafazkan respons ringkas.',
    summary: 'Dengar permintaan Puan Salmah, berikan respons yang sopan, dan bantu membawa kotak ke dalam Rumah Jiran.'
  },
  {
    id: 'misi2',
    numberLabel: 'Misi 2',
    title: 'Pesanan Penting',
    locationName: 'Kedai Komuniti',
    npcName: 'Encik Chong & Puan Aisyah',
    npcRole: 'Pekedai & Penduduk Komuniti',
    points: 15,
    badgeId: 'lencana_penyampai_amanah',
    badgeName: 'Lencana Penyampai Amanah',
    badgeDescription: 'Mendengar dengan teliti dan menyampaikan pesanan dengan tepat kepada penerima.',
    standardUtama: 'SP 1.1.2: Memahami pesanan tidak formal dan menyampaikan semula maklumat kepada penerima yang betul.',
    standardBimbingan: 'SP 1.1.1 (i): Mengecam kata nama "kedai", "bungkusan", dan "Puan Aisyah" serta menyebut pesanan berpandu.',
    summary: 'Dengar pesanan Encik Chong di Kedai Komuniti, ingat penerima pesanan, bergerak ke arah Puan Aisyah, dan sampaikan pesanan secara lisan.'
  },
  {
    id: 'misi3',
    numberLabel: 'Misi 3',
    title: 'Taman Kita, Tanggungjawab Kita',
    locationName: 'Taman Komuniti',
    npcName: 'Aiman',
    npcRole: 'Rakan Sebaya Komuniti',
    points: 20,
    badgeId: 'lencana_penjaga_alam',
    badgeName: 'Lencana Penjaga Alam',
    badgeDescription: 'Memberikan pendapat yang bernas dan bekerjasama menjaga kebersihan taman.',
    standardUtama: 'SP 1.1.2: Memberikan respons berupa pendapat sendiri terhadap soalan rakan dalam situasi tidak formal.',
    standardBimbingan: 'SP 1.1.1 (i): Mengecam kata nama "penyapu" mengikut konteks kebersihan taman dan menyebut ayat mudah.',
    summary: 'Dengar pertanyaan Aiman tentang keadaan Taman Komuniti yang kotor, pilih tindakan atau alat yang sesuai, dan nyatakan pendapat secara lisan.'
  },
  {
    id: 'misi4',
    numberLabel: 'Misi 4',
    title: 'Dengar dan Laksanakan',
    locationName: 'Pusat Gotong-royong',
    npcName: 'Ketua Gotong-royong',
    npcRole: 'Penyelaras Kebersihan',
    points: 20,
    badgeId: 'lencana_rakan_kerjasama',
    badgeName: 'Lencana Rakan Kerjasama',
    badgeDescription: 'Mendengar arahan berurutan dengan teliti dan melaksanakan tugasan gotong-royong.',
    standardUtama: 'SP 1.1.2: Mendengar dan melaksanakan arahan dua langkah mengikut urutan yang betul.',
    standardBimbingan: 'SP 1.1.1 (i): Mendengar arahan langkah demi langkah dan mengecam kata nama "penyapu", "pondok", "botol plastik", dan "tong kitar semula".',
    summary: 'Dengar arahan dengan teliti, ambil penyapu di sebelah pondok ke taman permainan, dan kutip botol plastik berhampiran bangku ke dalam tong kitar semula.'
  },
  {
    id: 'misi5',
    numberLabel: 'Misi 5',
    title: 'Cabaran Wira Komuniti',
    locationName: 'Balai Komuniti',
    npcName: 'Tok Razak',
    npcRole: 'Ketua Komuniti Harmoni',
    points: 30,
    badgeId: 'lencana_wira_komuniti',
    badgeName: 'Lencana Wira Komuniti',
    badgeDescription: 'Berjaya menceritakan semula keseluruhan pengalaman membantu komuniti secara jelas dan tersusun.',
    standardUtama: 'SP 1.1.2: Menceritakan semula pengalaman secara bertatasusila menggunakan penanda wacana "Mula-mula", "Selepas itu", "Kemudian", dan "Akhir sekali".',
    standardBimbingan: 'SP 1.1.1 (i): Memberikan respons lisan berpandukan empat gambar lokasi dan kata nama mengikut urutan.',
    summary: 'Lihat imbasan empat lokasi yang telah dilawati dan ceritakan semula pengalaman kamu kepada Ketua Komuniti di Balai Komuniti.'
  }
];

export const SENARAI_REFLEKSI_KENDIRI = [
  {
    id: 'dengar_teliti',
    kategori: 'Kemahiran Mendengar',
    pernyataan: 'Saya mendengar ujaran dan arahan dengan teliti sehingga tamat sebelum memberikan respons.'
  },
  {
    id: 'faham_kata_nama',
    kategori: 'Pemahaman Konteks',
    pernyataan: 'Saya dapat mengenal pasti objek, kata nama, dan lokasi di Komuniti Harmoni dengan betul.'
  },
  {
    id: 'tutur_sopan',
    kategori: 'Kemahiran Bertutur',
    pernyataan: 'Saya bertutur dengan jelas, menggunakan ayat yang lengkap dan bahasa yang sopan.'
  },
  {
    id: 'bantu_komuniti',
    kategori: 'Nilai Murni Kemasyarakatan',
    pernyataan: 'Saya seronok membantu jiran, menyampaikan pesanan dengan amanah, dan menjaga kebersihan taman.'
  }
];

export function createInitialMissionsProgress(): Record<MissionId, MissionProgress> {
  return {
    percubaan: {
      missionId: 'percubaan',
      completed: false,
      pointsAwarded: 0,
      maxPoints: 0,
      badgeId: 'pas_masuk',
      badgeName: 'Pas Masuk Komuniti Harmoni',
      badgeEarned: false,
      routeUsed: 'utama',
      listenCount: 0,
      hintsRequested: 0,
      actionsCompleted: [],
      oralResponseConfirmed: false,
      oralResponseText: '',
      firstAttemptSuccess: true
    },
    misi1: {
      missionId: 'misi1',
      completed: false,
      pointsAwarded: 0,
      maxPoints: 15,
      badgeId: 'lencana_jiran_prihatin',
      badgeName: 'Lencana Jiran Prihatin',
      badgeEarned: false,
      routeUsed: 'utama',
      listenCount: 0,
      hintsRequested: 0,
      actionsCompleted: [],
      oralResponseConfirmed: false,
      oralResponseText: '',
      firstAttemptSuccess: true
    },
    misi2: {
      missionId: 'misi2',
      completed: false,
      pointsAwarded: 0,
      maxPoints: 15,
      badgeId: 'lencana_penyampai_amanah',
      badgeName: 'Lencana Penyampai Amanah',
      badgeEarned: false,
      routeUsed: 'utama',
      listenCount: 0,
      hintsRequested: 0,
      actionsCompleted: [],
      oralResponseConfirmed: false,
      oralResponseText: '',
      firstAttemptSuccess: true
    },
    misi3: {
      missionId: 'misi3',
      completed: false,
      pointsAwarded: 0,
      maxPoints: 20,
      badgeId: 'lencana_penjaga_alam',
      badgeName: 'Lencana Penjaga Alam',
      badgeEarned: false,
      routeUsed: 'utama',
      listenCount: 0,
      hintsRequested: 0,
      actionsCompleted: [],
      oralResponseConfirmed: false,
      oralResponseText: '',
      firstAttemptSuccess: true
    },
    misi4: {
      missionId: 'misi4',
      completed: false,
      pointsAwarded: 0,
      maxPoints: 20,
      badgeId: 'lencana_rakan_kerjasama',
      badgeName: 'Lencana Rakan Kerjasama',
      badgeEarned: false,
      routeUsed: 'utama',
      listenCount: 0,
      hintsRequested: 0,
      actionsCompleted: [],
      oralResponseConfirmed: false,
      oralResponseText: '',
      firstAttemptSuccess: true
    },
    misi5: {
      missionId: 'misi5',
      completed: false,
      pointsAwarded: 0,
      maxPoints: 30,
      badgeId: 'lencana_wira_komuniti',
      badgeName: 'Lencana Wira Komuniti',
      badgeEarned: false,
      routeUsed: 'utama',
      listenCount: 0,
      hintsRequested: 0,
      actionsCompleted: [],
      oralResponseConfirmed: false,
      oralResponseText: '',
      firstAttemptSuccess: true
    }
  };
}
