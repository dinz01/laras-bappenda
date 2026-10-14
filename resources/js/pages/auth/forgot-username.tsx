import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/forgot-username';

export default function ForgotUsername({ status }: { status?: string }) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleOpenConfirm = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.email.trim()) {
            toast.warning('Harap isi kolom "Alamat Email" yang wajib diisi.');
            document.getElementById('email')?.focus();

            return;
        }

        setIsConfirmOpen(true);
    };

    const handleProceed = () => {
        setIsConfirmOpen(false);
        post(email.url(), {
            preserveScroll: true,
            onError: () => {
                toast.error('Gagal mengirim nama pengguna ke email.', {
                    description:
                        'Pastikan email yang Anda masukkan sudah terdaftar.',
                });
            },
        });
    };

    return (
        <>
            <Head title="Lupa Nama Pengguna" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div
                className="space-y-6 text-slate-900"
                style={{ colorScheme: 'light' }}
            >
                <form
                    onSubmit={handleOpenConfirm}
                    noValidate
                    className="grid gap-5"
                >
                    <div className="grid gap-2">
                        <Label
                            htmlFor="email"
                            className="font-medium text-slate-900"
                        >
                            Alamat Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="email"
                            autoFocus
                            required
                            placeholder="email@contoh.com"
                            className="h-10 rounded-lg border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-900 focus-visible:ring-slate-900/20"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            asChild
                            className="w-full rounded-full border-slate-300 py-6 text-base font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            <Link href={login()}>Kembali</Link>
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-full bg-slate-900 py-6 text-base font-semibold text-white hover:bg-slate-800"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Lanjutkan
                        </Button>
                    </div>
                </form>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent
                    className="border-slate-200 bg-white sm:max-w-md"
                    style={{ colorScheme: 'light' }}
                >
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-slate-900">
                            Konfirmasi Lupa Nama Pengguna
                        </DialogTitle>
                        <DialogDescription className="pt-1 text-sm text-slate-600">
                            Nama pengguna akan dikirimkan ke alamat email{' '}
                            <strong className="text-slate-900">
                                &ldquo;{data.email}&rdquo;
                            </strong>
                            . Apakah Anda yakin ingin melanjutkan?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsConfirmOpen(false)}
                            disabled={processing}
                            className="rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleProceed}
                            disabled={processing}
                            className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Lanjutkan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ForgotUsername.layout = {
    title: 'Lupa Nama Pengguna',
    description: 'Masukkan email terdaftar Anda untuk menerima nama pengguna',
};
