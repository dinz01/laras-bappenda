export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
            <img
                src="/images/logo-bappenda.png"
                alt="Logo BAPPENDA"
                className="h-7 w-auto max-w-[85px] shrink-0 object-contain group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:max-w-[28px]"
            />
            <div className="flex min-w-0 flex-1 flex-col text-left group-data-[collapsible=icon]:hidden">
                <span className="text-sm leading-tight font-bold tracking-tight text-foreground">
                    LARAS
                </span>
                <span className="text-[11px] leading-tight font-normal break-words text-muted-foreground">
                    Layanan Arsip Digital
                </span>
            </div>
        </div>
    );
}
