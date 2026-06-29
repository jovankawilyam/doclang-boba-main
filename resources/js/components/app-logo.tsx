import { useSidebar } from "@/components/ui/sidebar"

export default function AppLogo() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <>
      <div className={`flex shrink-0 items-center justify-center transition-all duration-300 ${isCollapsed ? 'hidden' : 'aspect-square size-14 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center'}`}>
        <img
          src="/images/NAGARA-DANA-RAKCA.png"
          alt="kpknl-bogor"
          className="h-10 w-10"
        />
      </div>

      <img
          src="/images/NAGARA-DANA-RAKCA.png"
          alt="kpknl-bogor"
          className={`h-10 w-10 object-contain transition-all duration-300 ${isCollapsed ? 'block mx-auto' : 'hidden'}`}
      />

      <div className={`grid flex-1 text-left text-sm transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 h-0 hidden' : 'opacity-100'}`}>
        <span className="mb-0.1 truncate leading-tight font-semibold">
          Doclang Boba
        </span>
        <span className="font-light">KPKNL Bogor</span>
      </div>
    </>
  );
}