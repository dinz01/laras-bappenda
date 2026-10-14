import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { FlashMessages } from '@/types/global';
import { focusFirstInvalidField } from '@/utils/form-validation';

function showFlashMessages(flash?: FlashMessages | null): void {
    if (!flash) {
        return;
    }

    if (flash.success) {
        toast.success(flash.success);
    } else if (flash.error) {
        toast.error(flash.error);
    } else if (flash.warning) {
        toast.warning(flash.warning);
    } else if (flash.info) {
        toast.info(flash.info);
    } else if (flash.status) {
        toast.info(flash.status);
    }
}

export function useFlashToast(): void {
    const { flash } = usePage<{ flash?: FlashMessages }>().props;
    const initialRenderRef = useRef(true);

    // Initial page load flash message (e.g. redirect after full page reload/login)
    useEffect(() => {
        if (initialRenderRef.current) {
            initialRenderRef.current = false;
            showFlashMessages(flash);
        }
    }, [flash]);

    // Subsequent Inertia navigations and requests
    useEffect(() => {
        const removeSuccessListener = router.on('success', (event) => {
            const pageProps = event.detail.page.props as {
                flash?: FlashMessages;
            };
            showFlashMessages(pageProps?.flash);
        });

        const removeHttpExceptionListener = router.on(
            'httpException',
            (event) => {
                const status = (event as CustomEvent).detail?.status;

                if (status === 422) {
                    setTimeout(() => focusFirstInvalidField(), 50);
                }
            },
        );

        return () => {
            removeSuccessListener();
            removeHttpExceptionListener();
        };
    }, []);
}
