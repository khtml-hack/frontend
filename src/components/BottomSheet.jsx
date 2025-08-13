import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * 모바일 프레임 내부 전용 BottomSheet
 * - containerRef: 기준 컨테이너 ref (relative + h-[100svh] 권장)
 * - snapPoints: [0~1] 보이는 높이 비율 배열 (예: [0.18, 0.55, 0.9])
 * - defaultSnap: 초기 스냅 인덱스
 * - header: 상단 헤더 JSX
 */
export default function BottomSheet({
    containerRef,
    snapPoints = [0.18, 0.55, 0.9],
    defaultSnap = 1,
    header,
    className = '',
    children,
}) {
    const [y, setY] = useState(0); // translateY(px)
    const [ready, setReady] = useState(false); // 초기 높이 계산 완료 여부
    const [transitionOn, setTransitionOn] = useState(false);
    const startY = useRef(0);
    const baseY = useRef(0);
    const snapYsRef = useRef([0]);

    const getH = () => containerRef?.current?.clientHeight || window.innerHeight;

    const computeSnapYs = () => {
        const h = getH();
        return snapPoints.map((r) => Math.max(0, h - h * r)); // translateY 값
    };

    const snapToNearest = (currentY) => {
        const snapYs = snapYsRef.current;
        const target = snapYs.reduce((p, c) => (Math.abs(c - currentY) < Math.abs(p - currentY) ? c : p), snapYs[0]);
        setY(target);
    };

    // 초기: 컨테이너 높이가 준비된 뒤 계산 → 준비 끝나면 보이기
    useLayoutEffect(() => {
        // 첫 프레임에 container가 아직 없으면 다음 프레임에 재시도
        let raf;
        const init = () => {
            const el = containerRef?.current;
            if (!el || !el.clientHeight) {
                raf = requestAnimationFrame(init);
                return;
            }
            const snapYs = computeSnapYs();
            snapYsRef.current = snapYs;
            const idx = Math.min(defaultSnap, snapYs.length - 1);
            setY(snapYs[idx]);
            setReady(true); // 이제 보이기 시작
            requestAnimationFrame(() => setTransitionOn(true)); // 그 다음부터 전환 켜기
        };
        init();
        return () => raf && cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerRef, defaultSnap]);

    // 컨테이너 크기 변화 대응 (회전/주소창 변화 등)
    useEffect(() => {
        const el = containerRef?.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            const snapYs = computeSnapYs();
            snapYsRef.current = snapYs;
            snapToNearest(y);
        });
        ro.observe(el);
        return () => ro.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [y, containerRef]);

    const onStart = (e) => {
        startY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
        baseY.current = y;
        window.addEventListener('mousemove', onMove, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchend', onEnd);
    };

    const onMove = (e) => {
        if (e.cancelable) e.preventDefault();
        const curr = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const dy = curr - startY.current;
        const h = getH();
        const next = Math.min(Math.max(0, baseY.current + dy), Math.max(0, h - 80)); // 바닥 가까이까지만
        setY(next);
    };

    const onEnd = () => {
        snapToNearest(y);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchend', onEnd);
    };

    return (
        <div
            className={`absolute inset-x-0 bottom-0 z-40 rounded-t-2xl bg-white shadow-[0_-8px_24px_rgba(0,0,0,.15)] ${className}`}
            style={{
                transform: `translateY(${y}px)`,
                transition: transitionOn ? 'transform 160ms ease-out' : 'none',
                visibility: ready ? 'visible' : 'hidden', // 초기 계산 전에는 숨김 (깜빡임 방지)
            }}
            aria-hidden={!ready}
        >
            {/* 드래그 핸들 + 헤더 */}
            <div
                onMouseDown={onStart}
                onTouchStart={onStart}
                className="cursor-grab active:cursor-grabbing select-none"
            >
                <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-zinc-300" />
                <div className="px-4 py-3">{header}</div>
            </div>

            {/* 콘텐츠 스크롤 영역 */}
            <div className="max-h-[70vh] overflow-y-auto px-1 pb-4">{children}</div>
        </div>
    );
}
