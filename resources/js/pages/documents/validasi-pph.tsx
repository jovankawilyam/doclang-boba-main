import DocumentDashboard from './document-dashboard';

export default function ValidasiPphDashboard(props: any) {
    return (
        <DocumentDashboard
            {...props}
            config={{
                title: 'Validasi PPh',
                description: 'Kelola status validasi PPh dokumen lelang.',
                href: '/documents/validasi-pph',
                addSuffix: 'V-PPh',
                addCategory: 'validasi_pph',
                emptyLabel: 'Tidak ada data validasi PPh ditemukan.',
                accentRing: 'focus-visible:ring-emerald-500',
            }}
        />
    );
}
