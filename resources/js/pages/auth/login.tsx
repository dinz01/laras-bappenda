import ReCAPTCHA from 'react-google-recaptcha';
import { Form, Head, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    recaptchaSiteKey: string;
};

export default function Login({
    status,
    canResetPassword,
    recaptchaSiteKey,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const { errors: pageErrors } = usePage().props;

    useEffect(() => {
        if (pageErrors && Object.keys(pageErrors).length > 0) {
            recaptchaRef.current?.reset();
            setRecaptchaToken(null);
        }
    }, [pageErrors]);

    return (
        <>
            <Head title="Masuk" />
            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6 text-slate-900 dark:text-slate-900"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="username"
                                    className="text-base font-medium text-slate-900 dark:text-slate-900"
                                >
                                    Nama Pengguna
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    name="username"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder="Masukkan nama pengguna"
                                    className="h-10 rounded-lg border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-900 focus-visible:ring-slate-900/20 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder:text-slate-400"
                                />
                                <InputError message={errors.username} />
                                <div className="mt-1 flex justify-start">
                                    <TextLink
                                        href="/forgot-username"
                                        className="text-sm text-emerald-700/80 no-underline hover:text-emerald-800 hover:no-underline dark:text-emerald-700/80 dark:hover:text-emerald-800"
                                        tabIndex={6}
                                    >
                                        Lupa nama pengguna?
                                    </TextLink>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-base font-medium text-slate-900 dark:text-slate-900"
                                >
                                    Kata Sandi
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Masukkan kata sandi"
                                    className="h-10 rounded-lg border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-900 focus-visible:ring-slate-900/20 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder:text-slate-400"
                                />
                                <InputError message={errors.password} />

                                <div className="mt-1 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="show-password"
                                            checked={showPassword}
                                            onCheckedChange={(checked) =>
                                                setShowPassword(
                                                    checked === true,
                                                )
                                            }
                                            className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:text-white dark:border-slate-300 dark:data-[state=checked]:bg-slate-900 dark:data-[state=checked]:text-white"
                                            tabIndex={3}
                                        />
                                        <Label
                                            htmlFor="show-password"
                                            className="cursor-pointer text-sm font-normal text-slate-600 dark:text-slate-600"
                                        >
                                            Lihat kata sandi
                                        </Label>
                                    </div>

                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-sm text-emerald-700/80 no-underline hover:text-emerald-800 hover:no-underline dark:text-emerald-700/80 dark:hover:text-emerald-800"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                            </div>

                            {/* reCAPTCHA v2 */}
                            <div className="grid gap-2">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={recaptchaSiteKey}
                                    onChange={(token: string | null) =>
                                        setRecaptchaToken(token)
                                    }
                                    onExpired={() => setRecaptchaToken(null)}
                                    hl="id"
                                />
                                {/* Hidden input sends token with form */}
                                <input
                                    type="hidden"
                                    name="g-recaptcha-response"
                                    value={recaptchaToken ?? ''}
                                />
                                <InputError message={errors.recaptcha} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-1 w-full rounded-full bg-slate-900 py-6 text-base font-semibold text-white hover:bg-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                                tabIndex={6}
                                disabled={processing || !recaptchaToken}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Masuk
                            </Button>
                        </div>
                    </>
                )}
            </Form>
            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600 dark:text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'LOGIN AKUN',
    description: '',
};
