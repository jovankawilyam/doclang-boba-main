export const dummyKutipanRL = {
  data: [
    { id: 1, nomor_pengajuan: '146/K-RL/2026', status_proses: 'proses', catatan: null },
    { id: 2, nomor_pengajuan: '147/K-RL/2026', status_proses: 'siap_diambil', catatan: 'Ambil di loket 2' },
    { id: 3, nomor_pengajuan: '148/K-RL/2026', status_proses: 'selesai', catatan: null },
    { id: 4, nomor_pengajuan: '149/K-RL/2026', status_proses: 'proses', catatan: null },
    { id: 5, nomor_pengajuan: '150/K-RL/2026', status_proses: 'siap_diambil', catatan: 'Bawa KTP' }
  ],
  total: 5,
  links: [
    { url: null, label: '&laquo; Previous', active: false },
    { url: '#1', label: '1', active: true },
    { url: '#2', label: '2', active: false },
    { url: null, label: 'Next &raquo;', active: false }
  ]
};
