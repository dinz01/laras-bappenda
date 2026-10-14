import type React from 'react';

import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const year = new Date().getFullYear();

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* Kiri: gambar + branding */}
            <div className="relative hidden overflow-hidden lg:block">
                <img
                    src="/images/gedung1-bappenda.webp"
                    alt="Gedung Bappenda Kabupaten Bogor"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Gradient gelap agar teks terbaca */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                {/* Aksen hijau sangat lembut di pojok kiri bawah */}
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />

                <div className="relative flex h-full flex-col justify-between p-10">
                    <div className="flex items-center">
                        <img
                            src="/images/logo-bappenda.png"
                            alt="Logo Bappenda Kabupaten Bogor"
                            className="h-11 w-auto object-contain drop-shadow-lg"
                        />
                    </div>

                    <div className="max-w-lg space-y-2">
                        <h2 className="text-5xl font-black tracking-tight text-[#3FA76A]">
                            LARAS
                        </h2>
                        <p className="text-lg font-semibold text-white">
                            Layanan Arsip Digital
                        </p>
                        <p className="text-base font-medium text-white/80">
                            Badan Pengelolaan Pendapatan Daerah{' '}
                            <span className="font-bold">(Bappenda)</span>{' '}
                            Kabupaten Bogor
                        </p>
                        <p className="text-sm text-white/70">
                            Platform terintegrasi untuk pengelolaan,
                            penyimpanan, pemantauan, dan layanan arsip digital
                            secara aman dan terstruktur.
                        </p>
                    </div>
                </div>
            </div>

            {/* Kanan: form login + footer — selalu light mode */}
            <div
                className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-slate-50 text-slate-900"
                style={{
                    colorScheme: 'light',
                }}
            >
                {/* Aksen hijau sangat lembut, jauh dari sudut kanan */}
                <div className="pointer-events-none absolute -top-40 right-10 h-64 w-64 rounded-full bg-emerald-200/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 left-10 h-56 w-56 rounded-full bg-emerald-100/10 blur-3xl" />

                <div className="relative flex flex-1 items-center justify-center p-6 md:p-8">
                    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-10 py-14 text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)]">
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h1 className="text-2xl font-semibold text-slate-900">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-sm text-slate-500">
                                    {description}
                                </p>
                            )}
                        </div>

                        <div className="mt-8 text-slate-900">{children}</div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="relative px-6 pb-4 text-center">
                    <p className="text-xs text-slate-500">
                        &copy; {year} Badan Pengelolaan Pendapatan Daerah
                        Kabupaten Bogor. Hak cipta dilindungi.
                    </p>
                </footer>
            </div>
        </div>
    );
}
