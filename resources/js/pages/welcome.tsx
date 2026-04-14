import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Search, CheckCircle2, Clock, FileText, User as UserIcon, Shield, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard, login } from '@/routes';

interface DocumentItem {
  id: number;
  nomor_pengajuan: string;
  status_proses: 'siap_diambil' | 'proses' | 'selesai';
  catatan: string | null;
}

function TableRow({ title, status }: { title: string; status: DocumentItem['status_proses'] | string }) {
  const getStatusStyles = (s: string) => {
    switch (s) {
      case 'selesai':
        return {
          badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900',
          icon: <CheckCircle2 className="h-4 w-4 mr-1.5" />,
          label: 'Selesai'
        };
      case 'siap_diambil':
        return {
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900',
          icon: <Inbox className="h-4 w-4 mr-1.5" />,
          label: 'Siap Diambil'
        };
      default:
        return {
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900',
          icon: <Clock className="h-4 w-4 mr-1.5" />,
          label: 'Dalam Proses'
        };
    }
  };

  const style = getStatusStyles(status as string);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{title}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${style.badge}`}>
          {style.icon}
          {style.label}
        </span>
      </td>
    </tr>
  );
}

export default function Welcome({ document, search, document_rl, search_rl }: { document: DocumentItem | null; search: string | null; document_rl: DocumentItem | null; search_rl: string | null }) {
  const { data: dataK, setData: setDataK, get: getK, processing: processingK } = useForm({ nomor_pengajuan: search || '' });
  const { data: dataRL, setData: setDataRL, get: getRL, processing: processingRL } = useForm({ nomor_kutipan: search_rl || '' });
  const { auth } = usePage().props as any;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    getK('/', { preserveState: true });
  };

  const handleSearchRL = (e: React.FormEvent) => {
    e.preventDefault();
    getRL('/', { preserveState: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#09090B] font-sans selection:bg-indigo-500 selection:text-white">
      <Head title="Tracking Dokumen Pasca Lelang" />

      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Doclang Boba</span>
        </div>

        <div>
          {auth.user ? (
            <Link href={dashboard()}>
              <Button variant="outline" className="gap-2 rounded-full px-6">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href={login()}>
              <Button variant="ghost" className="gap-2 rounded-full">
                <UserIcon className="h-4 w-4" /> Login Pegawai
              </Button>
            </Link>
          )}
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center min-h-screen pt-20 pb-16 px-4">

        {/* Hero section */}
        <div className="text-center max-w-2xl w-full mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
            Pengajuan Kuitansi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">Siap Diambil</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
            Masukkan Nomor Pengajuan atau Nomor Kuitansi Anda untuk melihat status pemrosesan dokumen secara real-time.
          </p>

          <Card className="shadow-2xl shadow-indigo-500/10 border-slate-200 dark:border-slate-800 overflow-hidden rounded-2xl">
            <CardContent className="p-2">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Contoh: 123/KPHL/2026..."
                    className="h-14 pl-12 pr-4 text-lg border-0 bg-transparent ring-0 focus-visible:ring-0 shadow-none dark:text-white"
                    value={dataK.nomor_pengajuan}
                    onChange={e => setDataK('nomor_pengajuan', e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={processingK} className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-base transition-all hover:shadow-lg hover:shadow-indigo-500/30">
                  {processingK ? 'Mencari...' : 'Lacak Sekarang'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {search && (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-12 duration-500 delay-150 fill-mode-both">
            {document ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-zinc-800">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl text-indigo-600 dark:text-indigo-400">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Hasil Pencarian untuk:</p>
                    <h2 className="text-2xl font-bold font-mono">{document.nomor_pengajuan}</h2>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Jenis Dokumen</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                      <TableRow title="Status Proses Dokumen" status={document.status_proses} />
                    </tbody>
                  </table>
                </div>

                {document.catatan && (
                  <div className="mt-6 p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <p className="text-sm font-medium text-slate-500 mb-1">Catatan Petugas:</p>
                    <p className="text-slate-700 dark:text-slate-300 italic">"{document.catatan}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 shadow-xl border border-slate-100 dark:border-zinc-800 text-center">
                <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Dokumen Tidak Ditemukan</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Kami tidak menemukan pengajuan dengan nomor <span className="font-mono font-medium text-slate-900 dark:text-white">{search}</span>.
                  Pastikan penulisan nomor sudah benar.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Kutipan RL Section */}
        <section id="kutipan" className="w-full max-w-5xl mt-24 bg-slate-50 dark:bg-zinc-800 p-10 rounded-3xl shadow-xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pengajuan Kutipan RL Siap Diambil</h2>
            <p className="text-slate-600 dark:text-slate-400">Masukkan Nomor Pengajuan Kutipan RL untuk melihat status dokumen.</p>
          </div>

          <Card className="shadow-xl border rounded-2xl mb-10">
            <CardContent className="p-2">
              <form onSubmit={handleSearchRL} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Contoh: 146/K-RL/2026"
                    className="h-14 pl-12 pr-4 text-lg border-0 bg-transparent ring-0 focus-visible:ring-0 shadow-none"
                    value={dataRL.nomor_kutipan}
                    onChange={e => setDataRL('nomor_kutipan', e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={processingRL} className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                  {processingRL ? 'Mencari...' : 'Lacak RL'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {search_rl && (
            <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-12 duration-500">
              {document_rl ? (
                <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark;border-zinc-800">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl text-indigo-600 dark:text-indigo-400">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Hasil Pencarian untuk:</p>
                      <h2 className="text-2xl font-bold font-mono">{document_rl.nomor_pengajuan}</h2>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark;border-zinc-800">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Jenis Dokumen</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                        <tr>
                          <td className="px-6 py-4">Status Proses Dokumen</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                              {document_rl.status_proses === 'siap_diambil' ? 'Siap Diambil' : 'Dalam Proses'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 shadow-xl border border-slate-100 dark;border-zinc-800 text-center w-full max-w-3xl">
                  <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                    <Search className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Dokumen Tidak Ditemukan</h3>
                  <p className="text-slate-500">Nomor pengajuan {search_rl} tidak terdaftar.</p>
                </div>
              )}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

