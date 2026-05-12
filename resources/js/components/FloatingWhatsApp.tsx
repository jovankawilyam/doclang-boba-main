const WHATSAPP_URL = 'https://wa.me/6282323040445';

export default function FloatingWhatsApp() {
    return (
        <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat WhatsApp"
            className="group fixed right-5 bottom-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 transition-all duration-300 ease-out hover:scale-105 hover:bg-[#1ebe5d] hover:shadow-2xl hover:shadow-[#25D366]/35 focus:ring-4 focus:ring-[#25D366]/30 focus:outline-none active:scale-95 sm:h-16 sm:w-16"
        >
            <span className="pointer-events-none absolute right-full mr-3 hidden rounded-md bg-slate-950 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
                Chat WhatsApp
            </span>
            <i className="fa-brands fa-whatsapp text-3xl transition-transform duration-300 group-hover:scale-110 sm:text-4xl" />
        </a>
    );
}
