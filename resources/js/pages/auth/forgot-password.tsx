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
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        username: '',
    });

    const handleOpenConfirm = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.username.trim()) {
            toast.warning('Harap isi kolom "Nama Pengguna" yang wajib diisi.');
            document.getElementById('username')?.focus();

            return;
        }

        setIsConfirmOpen(true);
    };

    const handleProceed = () => {
        setIsConfirmOpen(false);
        post(email.url(), {
            preserveScroll: true,
            onError: () => {
                toast.error('Gagal mengirim tautan reset kata sandi.', {
                    description: 'Periksa kembali nama pengguna Anda.',
                });
            },
        });
    };

    return (
        <>
            <Head title="Lupa Kata Sandi" />

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
                            htmlFor="username"
                            className="font-medium text-slate-900 dark:text-slate-900"
                        >
                            Nama Pengguna
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            onChange={(e) =>
                                setData('username', e.target.value)
                            }
                            autoComplete="username"
                            autoFocus
                            required
                            placeholder="Masukkan nama pengguna"
                            className="h-10 rounded-lg border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-900 focus-visible:ring-slate-900/20 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder:text-slate-400"
                        />
                        <InputError message={errors.username} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            asChild
                            className="w-full rounded-full border-slate-300 py-6 text-base font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-300 dark:text-slate-700 dark:hover:bg-slate-100"
                        >
                            <Link href={login()}>Kembali</Link>
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-full bg-slate-900 py-6 text-base font-semibold text-white hover:bg-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                            data-test="email-password-reset-link-button"
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
                        <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-900">
                            Konfirmasi Lupa Kata Sandi
                        </DialogTitle>
                        <DialogDescription className="pt-1 text-sm text-slate-600 dark:text-slate-600">
                            Tautan untuk mengatur ulang kata sandi akan
                            dikirimkan ke alamat email yang terdaftar pada nama
                            pengguna{' '}
                            <strong className="text-slate-900 dark:text-slate-900">
                                &ldquo;{data.username}&rdquo;
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
                            className="rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-300 dark:bg-white dark:text-slate-700 dark:hover:bg-slate-100"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleProceed}
                            disabled={processing}
                            className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
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

ForgotPassword.layout = {
    title: 'Lupa Kata Sandi',
    description:
        'Masukkan nama pengguna Anda untuk menerima tautan atur ulang kata sandi di email terdaftar',
};
