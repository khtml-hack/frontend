import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function QrModal({
    open,
    onClose,
    src = '/qr.png',
    alt = '내 QR코드',
    title = '내 QR코드',
    closeText = '닫기',
    allowBackdropClose = true,
    escToClose = true,
    className = '',
    backdropClassName = '',
}) {
    const labelId = typeof useId === 'function' ? useId() : 'qr-modal-title';
    const closeBtnRef = useRef(null);

    // ESC로 닫기 + body 스크롤 잠금 + 버튼 포커스
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => escToClose && e.key === 'Escape' && onClose?.();
        document.addEventListener('keydown', onKey);
        document.body.classList.add('overflow-hidden');
        // 약간의 지연 후 포커스
        setTimeout(() => closeBtnRef.current?.focus(), 0);

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.classList.remove('overflow-hidden');
        };
    }, [open, escToClose, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelId}
            onClick={allowBackdropClose ? onClose : undefined}
        >
            <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${backdropClassName}`} />
            <div
                className={`relative z-10 w-full max-w-xs rounded-2xl bg-white p-4 shadow-lg ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id={labelId} className="sr-only">
                    {title}
                </h2>
                <img src={src} alt={alt} className="w-full h-auto rounded-md" />
                <button
                    ref={closeBtnRef}
                    onClick={onClose}
                    className="mt-4 w-full rounded-xl bg-green-600 py-2 text-white active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-green-600/40"
                >
                    {closeText}
                </button>
            </div>
        </div>,
        document.body
    );
}
