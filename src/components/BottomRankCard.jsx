import React, { useEffect, useState } from 'react';

const BASE_URL = 'https://peakdown.site/api';

const getInitialName = () => {
    try {
        const me = JSON.parse(localStorage.getItem('me') || '{}');
        return me.nickname || '김원활';
    } catch {
        return '김원활';
    }
};
const getInitialArea = () => {
    try {
        const me = JSON.parse(localStorage.getItem('me') || '{}');
        return me.zone_name || 'B구역';
    } catch {
        return 'B구역';
    }
};

export default function BottomRankCard({
    name: nameProp = getInitialName(),
    area: areaProp = getInitialArea(),
    rankText = '개인 4,111등',
    sumText = '누적 3,800원',
    emoji = '🦊',
    wrapperClass = '',
}) {
    const [name, setName] = useState(nameProp);
    const [area, setArea] = useState(areaProp);

    useEffect(() => {
        const ctrl = new AbortController();
        const token = localStorage.getItem('accessToken');

        (async () => {
            try {
                const res = await fetch(`${BASE_URL}/users/me/`, {
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    signal: ctrl.signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                if (data?.nickname) setName(data.nickname);
                if (data?.zone_name) setArea(data.zone_name);
                localStorage.setItem('me', JSON.stringify(data));
            } catch (e) {
                if (e.name !== 'AbortError') console.warn('users/me 실패:', e);
            }
        })();

        return () => ctrl.abort();
    }, []);

    return (
        <div
            className={`fixed left-1/2 -translate-x-1/2 z-50
                  bottom-[max(16px,env(safe-area-inset-bottom))]
                  w-[calc(100%-32px)] max-w-[420px] ${wrapperClass}`}
        >
            <div className="rounded-[24px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 p-4 min-h-[90px]">
                <div className="flex items-center gap-3">
                    <div className="grid place-items-center h-12 w-12 rounded-full bg-orange-100 text-xl">
                        <span>{emoji}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                            <span className="font-medium">{name}</span>
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5">{area}</span>
                        </div>
                        <div className="mt-0.5 text-[18px] font-extrabold truncate">{rankText}</div>
                    </div>

                    <span className="shrink-0 rounded-xl bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-700">
                        {sumText}
                    </span>
                </div>
            </div>
        </div>
    );
}
