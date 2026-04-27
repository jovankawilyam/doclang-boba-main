import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Search, CheckCircle2, Clock, FileText, Inbox } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard, login } from '@/routes';
import '@fortawesome/fontawesome-free/css/all.min.css';


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
          label: 'Selesai',
        };
      case 'siap_diambil':
        return {
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900',
          icon: <Inbox className="h-4 w-4 mr-1.5" />,
          label: 'Siap Diambil',
        };
      default:
        return {
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900',
          icon: <Clock className="h-4 w-4 mr-1.5" />,
          label: 'Dalam Proses',
        };
    }
  };

  const style = getStatusStyles(status as string);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{title}</td>
      <td className="px-6 py-4 text-sm">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${style.badge}`}>
          {style.icon}
          {style.label}
        </span>
      </td>
    </tr>
  );
}

export default function Welcome({
  document,
  search,
  document_rl,
  search_rl,
  document_validasi,
  search_validasi,
  statistics,
}: {
  document: DocumentItem | null;
  search: string | null;
  document_rl: DocumentItem | null;
  search_rl: string | null;
  document_validasi: DocumentItem | null;
  search_validasi: string | null;
  statistics: any;
}) {
  const {
    data: dataK,
    setData: setDataK,
    get: getK,
    processing: processingK,
  } = useForm({ search: search || '', category: 'kuitansi' });

  const {
    data: dataRL,
    setData: setDataRL,
    get: getRL,
    processing: processingRL,
  } = useForm({ search: search_rl || '', category: 'kutipan_rl' });

  const {
    data: dataV,
    setData: setDataV,
    get: getV,
    processing: processingV,
  } = useForm({ search: search_validasi || '', category: 'validasi_pph' });

  const { auth } = usePage().props as any;
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [open, setOpen] = useState(false);

  const images = [
    '/images/profile-1.png',
    '/images/profile-2.png',
    '/images/profile-3.png',
    '/images/profile-4.png',
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const prevSlide = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const nextSlide = () => setCurrent((c) => (c + 1) % images.length);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    getK('/', { preserveState: true,  preserveScroll: true });
  };

  const handleSearchRL = (e: React.FormEvent) => {
    e.preventDefault();
    getRL('/', { preserveState: true,  preserveScroll: true });
  };

  const handleSearchValidasi = (e: React.FormEvent) => {
    e.preventDefault();
    getV('/', { preserveState: true,  preserveScroll: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#ffffff] font-sans">
      <Head title="Tracking Dokumen Pasca Lelang" />

      <nav
        className={`sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm transition-transform duration-300 ${showNav ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-9 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/image.png" alt="Logo" className="h-15 md:h-15 w-auto object-contain" />
            <a href="#welcome"></a>
            <div className="hidden md:flex flex-col leading-tight"></div>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <a href="#kuitansi" className="text-sm text-gray-600 hover:text-indigo-600 font-extrabold">
              Kuitansi
            </a>
            <a href="#kutipan" className="text-sm text-gray-600 hover:text-indigo-600 font-extrabold">
              Kutipan RL
            </a>
            <a href="#validasiPPh" className="text-sm text-gray-600 hover:text-indigo-600 font-extrabold">
              Validasi PPh
            </a>
            <Link href="/persyaratan" className="text-sm text-gray-600 hover:text-indigo-600 font-extrabold">
              Persyaratan
            </Link>
            {auth?.user ? (
              <Link href={dashboard()}>
                <Button className="rounded-full px-5">Dashboard</Button>
              </Link>
            ) : (
              <Link href={login()}>
                <Button className="rounded-full px-5 bg-white-600 text-black">Login</Button>
              </Link>
            )}
          </div>

          <button className="md:hidden text-gray-700 text-xl" onClick={() => setOpen(!open)}>
            ☰
          </button>
        </div>

        {open && (
          <div className="md:hidden px-8 pb-4 space-y-4 bg-white border-t shadow-sm animate-in fade-in slide-in-from-top-2 duration-800">
            <div className="flex justify-between">
              <a href="#kuitansi" className="text-sm text-black mt-4">
                Kuitansi
              </a>
              <Link href="/persyaratan" className="text-sm text-gray-600 hover:text-indigo-600 font-extrabold mt-4">
                Persyaratan
              </Link>
            </div>

            <a href="#kutipan" className="block text-sm text-card">
              Kutipan RL
            </a>

            <a href="#validasiPPh" className="block text-sm text-card">
              Validasi PPh
            </a>
            {auth?.user ? (
              <Link href={dashboard()}>
                <Button className="w-full rounded-full">Dashboard</Button>
              </Link>
            ) : (
              <Link href={login()}>
                <Button className="w-full rounded-full bg-white-600 text-black">Login</Button>
              </Link>
            )}
          </div>
        )}
      </nav>


      <section className="w-full">
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <img src={images[current]} alt="slider" className="w-full h-[590px] object-cover object-[center_10%] transition-all duration-700" />
          <div className="absolute inset-0 bg-black/20" />

          <button onClick={prevSlide} className="absolute top-1/2 left-4   -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full">
            ‹
          </button>
          <button onClick={nextSlide} className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full">
            ›
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full cursor-pointer ${current === index ? 'bg-indigo-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center justify-center text-center min-h-[70vh] w-full max-w-4xl mx-auto px-4 mb-20 mt-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">

        {/* Aksen Kecil agar lebih Modern */}
        <div className="flex items-center gap-2 mb-6 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-full">
          <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
            Monitoring Layanan Pasca Lelang
          </span>
        </div>

        {/* Headline Utama dengan Gradient yang sesuai tema Navbar/Card kamu */}
        <h1 className="text-4xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-black leading-[1.1] mb-6">
          Lacak Status <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500">
            Dokumen Anda
          </span>
        </h1>

        {/* Deskripsi: Dibuat lebih ramping di mobile agar enak dibaca */}
        <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 px-2">
          Masukkan nomor pengajuan untuk memantau progres kuitansi, kutipan RL, hingga validasi PPh secara <span className="text-slate-900 dark:text-black font-semibold">real-time.</span>
        </p>



      </section>

      {/* Dashboard Statistik (Read-only) */}
      <section className="w-full max-w-100xl mx-auto px-4 md:px-8 mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 fill-mode-both">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-black tracking-tight mb-4">
            Dokumen Pasca Lelang Bogor Bageur
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold">Ringkasan statistik real-time dokumen pasca lelang.</p>
        </div>


        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Kuitansi (Biru) */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl shadow-blue-500/10 border border-blue-100 dark:border-blue-900/50 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Kuitansi</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Total Dokumen</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white">{statistics?.kuitansi?.total || 0}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-2xl text-center flex flex-col justify-center">
                    <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Proses</span>
                    <span className="text-lg font-black text-amber-700 dark:text-amber-300">{statistics?.kuitansi?.proses || 0}</span>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl text-center flex flex-col justify-center border border-blue-200 dark:border-blue-800">
                    <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Siap Diambil</span>
                    <span className="text-xl font-black text-blue-700 dark:text-blue-300">{statistics?.kuitansi?.siap_diambil || 0}</span>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-2xl text-center flex flex-col justify-center">
                    <span className="block text-[10px] font-bold text-green-600 dark:text-green-400 uppercase mb-1">Selesai</span>
                    <span className="text-lg font-black text-green-700 dark:text-green-300">{statistics?.kuitansi?.selesai || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kutipan RL (Oranye) */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl shadow-orange-500/10 border border-orange-100 dark:border-orange-900/50 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                  <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Kutipan RL</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Total Dokumen</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white">{statistics?.kutipan_rl?.total || 0}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-2xl text-center flex flex-col justify-center">
                    <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Proses</span>
                    <span className="text-lg font-black text-amber-700 dark:text-amber-300">{statistics?.kutipan_rl?.proses || 0}</span>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-2xl text-center flex flex-col justify-center border border-orange-200 dark:border-orange-800">
                    <span className="block text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase mb-1">Siap Diambil</span>
                    <span className="text-xl font-black text-orange-700 dark:text-orange-300">{statistics?.kutipan_rl?.siap_diambil || 0}</span>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-2xl text-center flex flex-col justify-center">
                    <span className="block text-[10px] font-bold text-green-600 dark:text-green-400 uppercase mb-1">Selesai</span>
                    <span className="text-lg font-black text-green-700 dark:text-green-300">{statistics?.kutipan_rl?.selesai || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Validasi PPh (Hijau) */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl shadow-green-500/10 border border-green-100 dark:border-green-900/50 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                  <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Validasi PPh</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Total Dokumen</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white">{statistics?.validasi_pph?.total || 0}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-2xl text-center flex flex-col justify-center">
                    <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Proses</span>
                    <span className="text-lg font-black text-amber-700 dark:text-amber-300">{statistics?.validasi_pph?.proses || 0}</span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl text-center flex flex-col justify-center border border-emerald-200 dark:border-emerald-800">
                    <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Siap Diambil</span>
                    <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{statistics?.validasi_pph?.siap_diambil || 0}</span>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-2xl text-center flex flex-col justify-center">
                    <span className="block text-[10px] font-bold text-green-600 dark:text-green-400 uppercase mb-1">Selesai</span>
                    <span className="text-lg font-black text-green-700 dark:text-green-300">{statistics?.validasi_pph?.selesai || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>




      {/* Kuitansi */}
      <main className="max-w-100xl mx-auto px-4 md:px-8 py-12 flex flex-col items-center">
        <section id="kuitansi" className="mt-20 scroll-mt-40 w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-10">

            <div className="flex flex-col items-center w-full">
              <div className="text-center max-w-2xl w-full mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                  Pengajuan Kuitansi <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">Siap Diambil</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
                  Masukkan Nomor Pengajuan Anda untuk melihat status pemrosesan dokumen secara real-time.
                </p>
                <Card className="shadow-2xl shadow-indigo-500/10 border-slate-200 dark:border-slate-800 overflow-hidden rounded-2xl">
                  <CardContent className="p-2">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Contoh: 123/KPHL/2026"
                          className="h-14 pl-12 pr-4 text-lg border-0 bg-transparent ring-0 focus-visible:ring-0 shadow-none dark:text-white"
                          value={dataK.search}
                          onChange={(e) => setDataK('search', e.target.value)}
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

              {search && (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-12 duration-500 delay-150 fill-mode-both">
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
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[450px] text-left text-sm">
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
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className=" flex justify-center w-full md:w-1/2">
              <img src="/images/siapwbk.png" alt="Ilustrasi" className=" object-contain drop-shadow-xl" />
            </div>
          </div>
        </section>

        {/* Kutipan RL */}
        <section id="kutipan" className="mt-20 scroll-mt-40 w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-10">
            <div className=" flex justify-center w-full md:w-1/2">
              <img src="/images/menujuwbk.png" alt="Ilustrasi" className=" object-contain drop-shadow-xl" />
            </div>

            <div className="flex flex-col items-center w-full">
              <div className="text-center max-w-2xl w-full mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                  Pengajuan Kutipan RL <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">Siap Diambil</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
                  Masukkan Nomor Pengajuan Anda untuk melihat status pemrosesan dokumen secara real-time.
                </p>
                <Card className="shadow-2xl shadow-indigo-500/10 border-slate-200 dark:border-slate-800 overflow-hidden rounded-2xl">
                  <CardContent className="p-2">
                    <form onSubmit={handleSearchRL} className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Contoh: 123/K-RL/2026"
                          className="h-14 pl-12 pr-4 text-lg border-0 bg-transparent ring-0 focus-visible:ring-0 shadow-none dark:text-white"
                          value={dataRL.search}
                          onChange={(e) => setDataRL('search', e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={processingRL} className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-base transition-all hover:shadow-lg hover:shadow-indigo-500/30">
                        {processingRL ? 'Mencari...' : 'Lacak Sekarang'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {search_rl && (
                <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-12 duration-500 delay-150 fill-mode-both">
                  {document_rl ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-zinc-800">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl text-indigo-600 dark:text-indigo-400">
                          <FileText className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Hasil Pencarian untuk:</p>
                          <h2 className="text-2xl font-bold font-mono">{document_rl.nomor_pengajuan}</h2>
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-zinc-800">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[450px] text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                              <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Jenis Dokumen</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                              <TableRow title="Status Proses Dokumen" status={document_rl.status_proses} />
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {document_rl.catatan && (
                        <div className="mt-6 p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                          <p className="text-sm font-medium text-slate-500 mb-1">Catatan Petugas:</p>
                          <p className="text-slate-700 dark:text-slate-300 italic">"{document_rl.catatan}"</p>
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
                        Kami tidak menemukan pengajuan dengan nomor <span className="font-mono font-medium text-slate-900 dark:text-white">{search_rl}</span>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Validasi PPh */}
        <section id="validasiPPh" className="mt-20 scroll-mt-40 w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-10">

            <div className="flex flex-col items-center w-full">
              <div className="text-center max-w-2xl w-full mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                  Pengajuan Validasi PPh <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">Siap Diambil</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
                  Masukkan Nomor Pengajuan Anda untuk melihat status pemrosesan dokumen secara real-time.
                </p>
                <Card className="shadow-2xl shadow-indigo-500/10 border-slate-200 dark:border-slate-800 overflow-hidden rounded-2xl">
                  <CardContent className="p-2">
                    <form onSubmit={handleSearchValidasi} className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Contoh: 123/V-PPh/2026"
                          className="h-14 pl-12 pr-4 text-lg border-0 bg-transparent ring-0 focus-visible:ring-0 shadow-none dark:text-white"
                          value={dataV.search}
                          onChange={(e) => setDataV('search', e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={processingV} className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-base transition-all hover:shadow-lg hover:shadow-indigo-500/30">
                        {processingV ? 'Mencari...' : 'Lacak Sekarang'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {search_validasi && (
                <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-12 duration-500 delay-150 fill-mode-both">
                  {document_validasi ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-zinc-800">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl text-indigo-600 dark:text-indigo-400">
                          <FileText className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Hasil Pencarian untuk:</p>
                          <h2 className="text-2xl font-bold font-mono">{document_validasi.nomor_pengajuan}</h2>
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-zinc-800">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[450px] text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                              <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Jenis Dokumen</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                              <TableRow title="Status Proses Dokumen" status={document_validasi.status_proses} />
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {document_validasi.catatan && (
                        <div className="mt-6 p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                          <p className="text-sm font-medium text-slate-500 mb-1">Catatan Petugas:</p>
                          <p className="text-slate-700 dark:text-slate-300 italic">"{document_validasi.catatan}"</p>
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
                        Kami tidak menemukan pengajuan dengan nomor <span className="font-mono font-medium text-slate-900 dark:text-white">{search_validasi}</span>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className=" flex justify-center w-full md:w-1/2">
              <img src="/images/layanan.png" alt="Ilustrasi" className=" object-contain drop-shadow-xl" />
            </div>
          </div>
        </section>

        {/* FOOTER KPKNL */}
      </main>

      {/* Hapus max-w-7xl dan mx-auto di sini supaya background biru bisa full ke samping */}
      <footer className="w-full bg-[#0F3D7A] text-white mt-24 py-9">

        {/* Bungkus konten dengan div ini agar isi tetap di tengah dan tidak melebar ke pinggir layar */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-10 items-center">

          {/* LEFT SECTION */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <img
                src="images/NAGARA-DANA-RAKCA.png"
                alt="Logo"
                className="w-16 h-16 object-contain" />
              <img
                src="images/kpknl-bogor.png"
                alt="Logo"
                className="w-16 h-16 object-contain" />

            </div>

            <div className="text-sm leading-relaxed space-y-3 ">
              <p>© 2026 KPKNL Bogor</p>
              <p>Jalan Veteran No. 45, Panaragan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16125</p>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex flex-col items-start md:items-end gap-6">
            <div className="flex flex-col items-start md:items-end">
              <p className="font-bold text-sm tracking-wider uppercase text-indigo-200/80 mb-1">
                Ikuti Kami
              </p>
              <div className="h-1 w-12 bg-cyan-400 rounded-full"></div>
            </div>

            <div className="flex gap-4">
              {[
                {
                  name: "facebook",
                  url: "https://www.facebook.com/kpknlbogor",
                  color: "hover:bg-[#1877F2]"
                },
                {
                  name: "instagram",
                  url: "https://www.instagram.com/kpknl.bogor",
                  color: "hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"
                },
                {
                  name: "tiktok",
                  url: "https://www.tiktok.com/@kpknl.bogor",
                  color: "hover:bg-black"
                },
                {
                  name: "whatsapp",
                  url: "https://wa.me/6282323040445",
                  color: "hover:bg-[#25D366]"
                },

              ].map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank" // Supaya link terbuka di tab baru
                  rel="noopener noreferrer" // Standar keamanan untuk link eksternal
                  className={`group w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 ${item.color} hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 active:scale-95`}
                >
                  <i className={`fa-brands fa-${item.name} text-xl group-hover:scale-110 transition-transform`} />
                </a>
              ))}
            </div>

            <p className="text-[10px] text-indigo-300/60 font-medium tracking-widest uppercase text-left md:text-right">
              KPKNL Bogor <br /> @kpknlbogor
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
}