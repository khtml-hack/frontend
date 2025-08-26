import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function QrModal({
    open,
    onClose,
    src = '/qr.png',
    alt = '내 QR코드',
    title = '매장에서 QR로 결제하기',
    allowBackdropClose = true,
    closeIconSrc = '/X.png',
    className = '',
    backdropClassName = '',
}) {
    const labelId = typeof useId === 'function' ? useId() : 'qr-modal-title';
    const closeBtnRef = useRef(null);

    // body 스크롤 잠금 + X 버튼 포커스
    useEffect(() => {
        if (!open) return;
        document.body.classList.add('overflow-hidden');
        setTimeout(() => closeBtnRef.current?.focus(), 0);
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [open]);

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
                className={`relative z-10 w-[309px] h-[309px] rounded-2xl bg-[#363636] p-4 shadow-lg ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 상단 우측 X 아이콘 */}
                <button
                    ref={closeBtnRef}
                    type="button"
                    onClick={onClose}
                    aria-label="닫기"
                    className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-white/10 "
                >
                    <img src={closeIconSrc} alt="" className="w-[14px] h-[14px]" />
                </button>

                <h2 id={labelId} className="text-white text-[20px] text-center mt-5 mb-4 px-auto">
                    {title}
                </h2>

                <img src={src} alt={alt} className="w-[170px] h-[170px] mx-auto rounded-md" />
            </div>
        </div>,
        document.body
    );
}
