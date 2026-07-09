import { Head, Link } from '@inertiajs/react';
import { Archive, ArrowRight, FileSearch, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';

const features = [
    {
        icon: Archive,
        title: 'Manajemen Arsip',
        description: 'Kelola seluruh arsip organisasi secara digital dengan terstruktur dan mudah ditelusuri.',
    },
    {
        icon: FileSearch,
        title: 'Mudah Ditemukan',
        description: 'Pencarian arsip yang cepat dan akurat berdasarkan berbagai kriteria klasifikasi.',
    },
    {
        icon: Shield,
        title: 'Aman & Terpercaya',
        description: 'Keamanan data terjamin dengan kontrol akses berbasis peran dan audit trail lengkap.',
    },
];

export default function Welcome() {
    return (
        <>
            <Head title="LARAS — Layanan Arsip Digital" />

            <div className="flex min-h-screen flex-col bg-background">
                {/* Header */}
                <header className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground">
                                <svg
                                    className="size-5 fill-background"
                                    viewBox="0 0 40 42"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M17.2 5.63325L8.6 0.855469L0 5.63325V32.1434L16.2 41.1434L32.4 32.1434V23.699L40 19.4767V9.85547L31.4 5.07769L22.8 9.85547V18.2999L17.2 21.411V5.63325ZM38 18.2999L32.4 21.411V15.2545L38 12.1434V18.2999ZM36.9409 10.4439L31.4 13.5221L25.8591 10.4439L31.4 7.36561L36.9409 10.4439ZM24.8 18.2999V12.1434L30.4 15.2545V21.411L24.8 18.2999ZM23.8 20.0323L29.3409 23.1105L16.2 30.411L10.6591 27.3328L23.8 20.0323ZM7.6 27.9212L15.2 32.1434V38.2999L2 30.9666V7.92116L7.6 11.0323V27.9212ZM8.6 9.29991L3.05913 6.22165L8.6 3.14339L14.1409 6.22165L8.6 9.29991ZM30.4 24.8101L17.2 32.1434V38.2999L30.4 30.9666V24.8101ZM9.6 11.0323L15.2 7.92117V22.5221L9.6 25.6333V11.0323Z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold leading-none">LARAS</p>
                                <p className="text-xs text-muted-foreground leading-none mt-0.5">
                                    Layanan Arsip Digital
                                </p>
                            </div>
                        </div>
                        <nav className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={login()}>Masuk</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="#">
                                    Ajukan Permohonan
                                </Link>
                            </Button>
                        </nav>
                    </div>
                </header>

                {/* Hero */}
                <main className="flex-1">
                    <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-32">
                        <div className="mx-auto max-w-2xl text-center">
                            {/* Badge */}
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                Sistem Pengelolaan Arsip Digital
                            </div>

                            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                                Arsip Digital{' '}
                                <span className="text-muted-foreground">
                                    yang Terkelola
                                </span>
                            </h1>
                            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                                LARAS hadir untuk membantu instansi pemerintah mengelola arsip secara
                                digital, efisien, transparan, dan sesuai regulasi kearsipan nasional.
                            </p>
                            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                                <Button size="lg" asChild>
                                    <Link href={login()}>
                                        Masuk ke Sistem
                                        <ArrowRight className="ml-2 size-4" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="#">
                                        Ajukan Permohonan Arsip
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section className="border-t border-border/60 bg-muted/20 py-16 md:py-24">
                        <div className="mx-auto max-w-6xl px-4 md:px-6">
                            <div className="mb-12 text-center">
                                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    Dirancang untuk Instansi Pemerintah
                                </h2>
                                <p className="mt-3 text-muted-foreground">
                                    Solusi pengelolaan arsip yang modern, aman, dan mudah digunakan.
                                </p>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-3">
                                {features.map((feature) => (
                                    <div
                                        key={feature.title}
                                        className="rounded-xl border border-border/60 bg-background p-6"
                                    >
                                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <feature.icon className="size-5 text-foreground" />
                                        </div>
                                        <h3 className="mb-2 text-sm font-semibold">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-border/60 py-6">
                    <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
                        <p className="text-xs text-muted-foreground">
                            © {new Date().getFullYear()} LARAS — Layanan Arsip Digital. Dikembangkan untuk
                            pelayanan kearsipan yang lebih baik.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
