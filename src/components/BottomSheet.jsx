import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

export default function BottomSheet({
    containerRef,

    snapPoints = [0.08, 0.5, 0.8],
    defaultSnap = 1,

    minVisiblePx = 80,
    header,
    className = '',
    children,
}) {
    const [y, setY] = useState(0);
    const [ready, setReady] = useState(false);
    const [transitionOn, setTransitionOn] = useState(false);

    const startY = useRef(0);
    const baseY = useRef(0);
    const snapYsRef = useRef([0]);

    const lastMoveRef = useRef({ t: 0, y: 0 });
    const vYRef = useRef(0);

    const headerDragRef = useRef(null);

    const getH = () => containerRef?.current?.clientHeight || window.innerHeight;

    // visible 높이값을 px로 변환
    const toVisiblePx = (v, h) => {
        if (typeof v === 'number') {
            if (v >= 2) return v; //  px 로 해석
            if (v >= 0 && v <= 1) return v * h; // 비율
        }
        return Math.max(0, 0.18 * h); // fallback 18%
    };

    // snap → translateY(px) 로 변환
    const computeSnapYs = () => {
        const h = getH();
        return snapPoints.map((sp) => {
            const vis = toVisiblePx(sp, h);
            return Math.max(0, h - vis);
        });
    };

    const clampIndex = (i) => {
        const last = snapYsRef.current.length - 1;
        return Math.max(0, Math.min(i, last));
    };

    const nearestIndexByY = (currY) => {
        const arr = snapYsRef.current;
        let idx = 0,
            best = Infinity;
        for (let i = 0; i < arr.length; i++) {
            const d = Math.abs(arr[i] - currY);
            if (d < best) {
                best = d;
                idx = i;
            }
        }
        return idx;
    };

    const goToIndex = (i) => setY(snapYsRef.current[clampIndex(i)]);
    const snapToNearest = (currY) => goToIndex(nearestIndexByY(currY));

    const onHeaderClick = () => {
        const idx = nearestIndexByY(y);
        if (idx > 0) goToIndex(idx - 1);
        else goToIndex(Math.min(1, snapYsRef.current.length - 1));
    };

    // 초기 배치
    useLayoutEffect(() => {
        let raf;
        const init = () => {
            const el = containerRef?.current;
            if (!el || !el.clientHeight) {
                raf = requestAnimationFrame(init);
                return;
            }
            snapYsRef.current = computeSnapYs();
            const idx = Math.min(defaultSnap, snapYsRef.current.length - 2);
            setY(snapYsRef.current[idx]);
            setReady(true);
            requestAnimationFrame(() => setTransitionOn(true));
        };
        init();
        return () => raf && cancelAnimationFrame(raf);
    }, [containerRef, defaultSnap, snapPoints]);

    // 리사이즈 대응
    useEffect(() => {
        const el = containerRef?.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            snapYsRef.current = computeSnapYs();
            snapToNearest(y);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [containerRef, y, snapPoints]);

    // 드래그
    const onStart = (e) => {
        if (e.currentTarget !== headerDragRef.current) return;
        const pointY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        startY.current = pointY;
        baseY.current = y;

        const now = performance.now();
        lastMoveRef.current = { t: now, y: pointY };
        vYRef.current = 0;

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
        const maxY = Math.max(0, h - Math.max(0, minVisiblePx)); // ← 하한선을 prop으로
        const next = Math.min(Math.max(0, baseY.current + dy), maxY);
        setY(next);

        const now = performance.now();
        const dt = Math.max(1, now - lastMoveRef.current.t);
        vYRef.current = (curr - lastMoveRef.current.y) / dt;
        lastMoveRef.current = { t: now, y: curr };
    };

    const onEnd = () => {
        const FLICK_V = 0.6;
        let idx = nearestIndexByY(y);
        if (Math.abs(vYRef.current) > FLICK_V) {
            idx = clampIndex(idx + (vYRef.current < 0 ? -1 : 1));
        }
        goToIndex(idx);

        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchend', onEnd);
    };

    const contentMaxH = 'calc(100dvh - 140px)';

    return (
        <div
            className={`absolute bottom-0 z-40 w-[393px] rounded-t-2xl bg-white shadow-[0_-8px_24px_rgba(0,0,0,.15)] ${className}`}
            style={{
                transform: `translateY(${y}px)`,
                transition: transitionOn ? 'transform 160ms ease-out' : 'none',
                visibility: ready ? 'visible' : 'hidden',
                willChange: 'transform',
            }}
            aria-hidden={!ready}
        >
            <div
                ref={headerDragRef}
                onMouseDown={onStart}
                onTouchStart={onStart}
                onClick={onHeaderClick}
                className="select-none cursor-grab active:cursor-grabbing"
                role="button"
                aria-label="시트 드래그/토글"
            >
                <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-zinc-300" />
                <div className="px-4 py-3">{header}</div>
            </div>

            <div className="overflow-y-auto px-1 pb-4" style={{ maxHeight: contentMaxH }}>
                {children}
            </div>
        </div>
    );
}
