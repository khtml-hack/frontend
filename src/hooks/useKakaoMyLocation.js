import { useCallback, useRef, useState } from 'react';

// 파란점 SVG (데이터 URI)
const MYLOC_SVG =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18">
      <circle cx="9" cy="9" r="6" fill="#1a73e8"/>
      <circle cx="9" cy="9" r="8.5" fill="none" stroke="white" stroke-width="3"/>
    </svg>`
    );

/**
 * Kakao 지도 위에 "현위치 커서(파란 점 + 정확도 원)"를 관리하는 훅
 * @param {React.MutableRefObject<kakao.maps.Map|null>} mapRef - Kakao Map을 담은 ref
 * @param {{highAccuracy?: boolean, keepOverlaysOnStop?: boolean}} opts
 */
export function useKakaoMyLocation(mapRef, opts = {}) {
    const { highAccuracy = true, keepOverlaysOnStop = true } = opts;

    const markerRef = useRef(null);
    const circleRef = useRef(null);
    const watchIdRef = useRef(null);
    const posRef = useRef(null);

    const [locating, setLocating] = useState(false);

    const ensureOverlays = useCallback(() => {
        const kakao = window.kakao;
        const map = mapRef.current;
        if (!kakao || !map) return;

        if (!markerRef.current) {
            const img = new kakao.maps.MarkerImage(MYLOC_SVG, new kakao.maps.Size(18, 18), {
                offset: new kakao.maps.Point(9, 9),
            });
            markerRef.current = new kakao.maps.Marker({ image: img, zIndex: 999, clickable: false });
            markerRef.current.setMap(map);
        }
    }, [mapRef]);

    const update = useCallback(
        (lat, lng, accuracy) => {
            const kakao = window.kakao;
            const map = mapRef.current;
            if (!kakao || !map) return;

            ensureOverlays();

            const ll = new kakao.maps.LatLng(lat, lng);

            if (markerRef.current) markerRef.current.setPosition(ll);

            if (circleRef.current) {
                circleRef.current.setMap(null);
                circleRef.current = null;
            }
            const radius = Math.max(Number(accuracy) || 50, 30); // m
            circleRef.current = new kakao.maps.Circle({
                center: ll,
                radius,
                strokeWeight: 1,
                strokeColor: '#1a73e8',
                strokeOpacity: 0.6,
                strokeStyle: 'solid',
                fillColor: '#1a73e8',
                fillOpacity: 0.12,
                zIndex: 998,
            });
            circleRef.current.setMap(map);

            posRef.current = { lat, lng };
        },
        [mapRef, ensureOverlays]
    );

    const centerOnMe = useCallback(() => {
        const kakao = window.kakao;
        const map = mapRef.current;
        if (!kakao || !map) return;

        const pan = ({ lat, lng }) => map.panTo(new kakao.maps.LatLng(lat, lng));

        if (posRef.current) return pan(posRef.current);

        if (!('geolocation' in navigator)) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                update(latitude, longitude, accuracy);
                pan({ lat: latitude, lng: longitude });
                setLocating(false);
            },
            () => setLocating(false),
            { enableHighAccuracy: highAccuracy, timeout: 8000, maximumAge: 0 }
        );
    }, [mapRef, update, highAccuracy]);

    const start = useCallback(() => {
        if (!('geolocation' in navigator)) return;
        if (watchIdRef.current != null) return; // 중복 등록 방지

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                update(latitude, longitude, accuracy);
            },
            (err) => {
                if (err?.code !== err?.POSITION_UNAVAILABLE) {
                    // 일시 오류는 무시
                    console.warn('geolocation error:', err);
                }
            },
            { enableHighAccuracy: highAccuracy, maximumAge: 5000, timeout: 10000 }
        );
    }, [update, highAccuracy]);

    const stop = useCallback(() => {
        if (watchIdRef.current != null && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (!keepOverlaysOnStop) {
            if (markerRef.current) markerRef.current.setMap(null);
            if (circleRef.current) circleRef.current.setMap(null);
            markerRef.current = null;
            circleRef.current = null;
        }
    }, [keepOverlaysOnStop]);

    const hasPosition = useCallback(() => !!posRef.current, []);
    const getPosition = useCallback(() => posRef.current, []);

    return { start, stop, centerOnMe, locating, hasPosition, getPosition };
}
