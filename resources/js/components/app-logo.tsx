export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-14 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <img
                    src="/images/NAGARA-DANA-RAKCA.png"
                    alt="kpknl-bogor"
                    className="h-10 w-10"
                />
            </div>
            <div className="grid flex-1 text-left text-sm">
                <span className="mb-0.1 truncate leading-tight font-semibold">
                    Doclang Boba
                </span>
                <span className="font-light">KPKNL Bogor</span>
            </div>
        </>
    );
}
