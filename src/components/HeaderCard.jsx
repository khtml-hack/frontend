import React from 'react';

export default function HeaderCard({ title = 'Peak_down', minHeight = 200, children }) {
    return (
        <div className="mobile-frame">
            <div
                className="mx-auto w-full max-w-[420px] min-h-[100svh] flex flex-col bg-white text-black"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom),12px)' }}
            >
                {/* 상단 카드 */}
                <header className="p-0">
                    <div className="w-full bg-zinc-100 px-5 pt-6 pb-5" style={{ minHeight }}>
                        <h1 className="text-[clamp(22px,5vw,28px)] font-extrabold text-green-500">{title}</h1>
                    </div>
                </header>

                {/* 페이지 컨텐츠 */}
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
