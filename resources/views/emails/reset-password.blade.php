<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Atur Ulang Kata Sandi - LARAS BAPPENDA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0; padding: 16px 0; background-color: #ffffff;">
        <tr>
            <td align="center" style="padding: 0 12px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border-collapse: separate; border: 1px solid #e2e8f0;">
                    <!-- Header with Logo -->
                    <tr>
                        <td align="center" style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff; border-top-left-radius: 12px; border-top-right-radius: 12px;">
                            <img src="{{ $message->embed(public_path('images/logo-bappenda.png')) }}" alt="Logo BAPPENDA" style="height: 52px; width: auto; display: block; border: 0;" />
                            <h2 style="margin: 16px 0 0 0; font-size: 15px; font-weight: 700; color: #059669; letter-spacing: 0.5px; text-transform: uppercase;">Layanan Arsip Digital (LARAS)</h2>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px 36px; background-color: #ffffff;">
                            <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 17px; font-weight: 600; color: #0f172a;">
                                Yth. {{ $name }},
                            </h3>
                            <p style="margin-top: 0; margin-bottom: 20px; font-size: 14px; color: #475569; line-height: 1.6;">
                                Anda menerima email ini karena kami menerima permintaan pengaturan ulang kata sandi untuk akun <strong>{{ $username }}</strong> pada sistem <strong>LARAS BAPPENDA Kabupaten Bogor</strong>.
                            </p>

                            <p style="margin-top: 0; margin-bottom: 24px; font-size: 14px; color: #475569; line-height: 1.6;">
                                Silakan klik tombol di bawah ini untuk membuat kata sandi baru Anda:
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 28px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $resetUrl }}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 9999px; border: 1px solid #ffffff;">Atur Ulang Kata Sandi</a>
                                    </td>
                                </tr>
                            </table>

                            <div style="background-color: #f8fafc; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; border-left: 4px solid #059669;">
                                <p style="margin: 0; font-size: 13px; color: #475569;">
                                    Tautan pengaturan ulang kata sandi ini akan kedaluwarsa dalam <strong>60 menit</strong>.
                                </p>
                            </div>

                            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 20px;">
                                <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                                    <strong>Catatan Keamanan:</strong> Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini dengan aman. Kata sandi akun Anda tidak akan berubah.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 24px 32px; background-color: #ffffff; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                            <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">Badan Pengelolaan Pendapatan Daerah (Bappenda)</p>
                            <p style="margin: 0 0 8px 0;">Pemerintah Kabupaten Bogor</p>
                            <p style="margin: 0; font-size: 11px; color: #94a3b8;">&copy; {{ date('Y') }} LARAS BAPPENDA. Hak Cipta Dilindungi.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
