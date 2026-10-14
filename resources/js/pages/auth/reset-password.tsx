import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
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
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
    status?: string;
};

export default function ResetPassword({
    token,
    email,
    passwordRules,
    status,
}: Props) {
    const [isSuccessOpen, setIsSuccessOpen] = useState(Boolean(status));

    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.password.trim()) {
            toast.warning(
                'Harap isi kolom "Kata Sandi Baru" yang wajib diisi.',
            );
            document.getElementById('password')?.focus();

            return;
        }

        if (!data.password_confirmation.trim()) {
            toast.warning(
                'Harap isi kolom "Konfirmasi Kata Sandi" yang wajib diisi.',
            );
            document.getElementById('password_confirmation')?.focus();

            return;
        }

        if (data.password !== data.password_confirmation) {
            toast.error(
                'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.',
            );
            document.getElementById('password_confirmation')?.focus();

            return;
        }

        post(update.url(), {
            onSuccess: () => {
                reset('password', 'password_confirmation');
                setIsSuccessOpen(true);
                toast.success('Kata sandi berhasil diatur ulang.');
            },
            onError: () => {
                toast.error('Gagal mengatur ulang kata sandi.', {
                    description: 'Periksa kembali persyaratan kata sandi.',
                });
            },
        });
    };

    return (
        <>
            <Head title="Atur Ulang Kata Sandi" />

            <div
                className="grid gap-6 text-slate-900"
                style={{ colorScheme: 'light' }}
            >
                <form onSubmit={handleSubmit} noValidate className="grid gap-5">
                    <div className="grid gap-2">
                        <Label
                            htmlFor="email"
                            className="font-medium text-slate-900"
                        >
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            className="mt-1 block w-full border-slate-300 bg-slate-50 text-slate-900"
                            readOnly
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="password"
                            className="font-medium text-slate-900"
                        >
                            Kata Sandi Baru
                        </Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            autoComplete="new-password"
                            className="mt-1 block w-full border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                            autoFocus
                            placeholder="Kata sandi baru"
                            passwordrules={passwordRules}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="password_confirmation"
                            className="font-medium text-slate-900"
                        >
                            Konfirmasi Kata Sandi
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            autoComplete="new-password"
                            className="mt-1 block w-full border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                            placeholder="Ulangi kata sandi baru"
                            passwordrules={passwordRules}
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full rounded-full bg-slate-900 py-6 text-base font-semibold text-white hover:bg-slate-800"
                        disabled={processing}
                        data-test="reset-password-button"
                    >
                        {processing && <Spinner className="mr-2" />}
                        Atur Ulang Kata Sandi
                    </Button>
                </form>
            </div>

            {/* Success Dialog */}
            <Dialog
                open={isSuccessOpen}
                onOpenChange={(open) => {
                    // Prevent closing dialog without navigating to login
                    if (!open) {
                        window.location.href = login.url();
                    }
                }}
            >
                <DialogContent
                    className="border-slate-200 bg-white sm:max-w-md [&>button]:hidden"
                    style={{ colorScheme: 'light' }}
                >
                    <DialogHeader className="items-center text-center">
                        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <DialogTitle className="text-lg font-bold text-slate-900">
                            Kata Sandi Berhasil Diperbarui
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-center text-sm text-slate-600">
                            Kata sandi akun Anda telah berhasil diatur ulang.
                            Silakan masuk kembali menggunakan kata sandi baru
                            Anda.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 sm:justify-center">
                        <Button
                            asChild
                            className="w-full rounded-full bg-black py-6 text-base font-semibold text-white hover:bg-slate-900"
                        >
                            <Link href={login()}>Masuk ke Akun</Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ResetPassword.layout = {
    title: 'Atur Ulang Kata Sandi',
    description: 'Masukkan kata sandi baru Anda di bawah ini',
};
