import DocumentDashboard from './document-dashboard';

export default function KuitansiDashboard(props: any) {
    return (
        <DocumentDashboard
            {...props}
            config={{
                title: 'Dokumen Kuitansi',
                description: 'Kelola status Kuitansi Pasca Lelang.',
                href: '/documents/kuitansi',
                addSuffix: 'KPHL',
                addCategory: 'kuitansi',
                emptyLabel: 'Tidak ada data kuitansi ditemukan.',
                accentRing: 'focus-visible:ring-blue-500',
            }}
        />
    );
}
