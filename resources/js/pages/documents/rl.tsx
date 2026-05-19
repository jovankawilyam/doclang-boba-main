import DocumentDashboard from './document-dashboard';

export default function RisalahLelangDashboard(props: any) {
    return (
        <DocumentDashboard
            {...props}
            config={{
                title: 'Dokumen Kutipan RL',
                description: 'Kelola status Kutipan Risalah Lelang.',
                href: '/documents/rl',
                addSuffix: 'K-RL',
                addCategory: 'risalah_lelang',
                emptyLabel: 'Tidak ada data Kutipan RL ditemukan.',
                accentRing: 'focus-visible:ring-amber-500',
            }}
        />
    );
}
