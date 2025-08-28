import React, { useEffect, useRef, useState } from 'react';
import BottomSheet from '../components/BottomSheet';
import BottomTap from '../components/BottomTap';
import QrModal from '../components/QrModal';
import SearchIcon from '../assets/Search.png';
import QRIcon from '../assets/Union.png';

// 카카오 SDK 동적 로더
function loadKakaoSdk() {
    const ex = window.kakao && window.kakao.maps;
    if (ex) return Promise.resolve(window.kakao);

    return new Promise((resolve, reject) => {
        if (document.getElementById('kakao-sdk')) {
            const wait = () => {
                if (window.kakao && window.kakao.maps) resolve(window.kakao);
                else requestAnimationFrame(wait);
            };
            wait();
            return;
        }
        const script = document.createElement('script');
        script.id = 'kakao-sdk';
        script.async = true;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false`;
        script.onload = () => {
            if (!window.kakao) return reject(new Error('Kakao SDK not found'));
            resolve(window.kakao);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ====== 라벨 스타일 & 유틸 ======
const LABEL_STYLE_ID = 'store-label-style';
function ensureStoreLabelStyle() {
    if (document.getElementById(LABEL_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = LABEL_STYLE_ID;
    style.textContent = `
    .store-label{
      position: relative;
      left: 0; top: 0;
      transform: translate(-50%, -34px);
      white-space: nowrap;
      font-size: 12px; line-height: 1;
      color: #1f2937;
      background: #fff;
      border: 1px solid rgba(0,0,0,.15);
      padding: 4px 6px;
      border-radius: 10px;
      box-shadow: 0 1px 2px rgba(0,0,0,.08);
      pointer-events: none;
    }`;
    document.head.appendChild(style);
}
function escapeHtml(s = '') {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function labelContent(name) {
    return `<div class="store-label">${escapeHtml(name)}</div>`;
}

// === 현재 위치 마커 이미지 (public/current.png 사용)
function getMyLocMarkerImage(kakao, size = 30) {
    const url = '/current.png';
    const imgSize = new kakao.maps.Size(size, size);
    const offset = new kakao.maps.Point(size / 2, size / 2);
    return new kakao.maps.MarkerImage(url, imgSize, { offset });
}

// API
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://peakdown.site').replace(/\/$/, '');

// 상점 목록 (검색 자동완성만 사용)
async function fetchMerchantsList(page = 1, pageSize = 20, search = '') {
    try {
        const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
        if (search) params.append('search', search);
        const res = await fetch(`${API_BASE_URL}/api/merchants/list/?${params}`);
        if (!res.ok) throw new Error('Failed to fetch merchants');
        const data = await res.json();
        return { merchants: data.merchants || [], pagination: data.pagination || {} };
    } catch (e) {
        console.error('Error fetching merchants:', e);
        return { merchants: [], pagination: {} };
    }
}

// === nearby API ===
async function fetchNearbyMerchants({ lat, lng, radius_m = 1500, limit = 50, search = '' }) {
    try {
        const params = new URLSearchParams({
            lat: String(lat),
            lng: String(lng),
            radius_m: String(radius_m),
            limit: String(limit),
        });
        if (search) params.append('search', search);

        const res = await fetch(`${API_BASE_URL}/api/merchants/nearby/?${params}`);
        if (!res.ok) throw new Error('Failed to fetch nearby merchants');
        const data = await res.json();
        return { merchants: data.merchants || [], search_info: data.search_info || null };
    } catch (e) {
        console.error('Error fetching nearby merchants:', e);
        return { merchants: [], search_info: null };
    }
}

function formatDistance(m) {
    if (m == null) return '';
    return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};
function getLatLng(store) {
    const lat = store.latitude ?? store.lat ?? store.y ?? store.위도 ?? store.Latitude ?? null;
    const lng = store.longitude ?? store.lng ?? store.x ?? store.경도 ?? store.Longitude ?? null;
    const plat = toNum(lat);
    const plng = toNum(lng);
    if (plat == null || plng == null) return null;
    return { lat: plat, lng: plng };
}

// ====== 하이라이트 유틸 (자동완성 드롭다운에서 매칭 텍스트 강조) ======
function escapeRegExp(s = '') {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function highlightMatch(text, keyword) {
    if (!keyword) return escapeHtml(text);
    const re = new RegExp(escapeRegExp(keyword), 'gi');
    return escapeHtml(text).replace(re, (m) => `<mark class="bg-yellow-200">${escapeHtml(m)}</mark>`);
}

export default function PartnerStores() {
    const containerRef = useRef(null);
    const mapElRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const labelsRef = useRef([]);

    // ✅ 현재 위치 관련 ref (Marker로 변경)
    const myLocMarkerRef = useRef(null);
    const myAccCircleRef = useRef(null);
    const geoWatchRef = useRef(null);

    const inputRef = useRef(null);

    const [containerReady, setContainerReady] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(true);

    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // 자동완성 상태
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggest, setShowSuggest] = useState(false);

    const [qrOpen, setQrOpen] = useState(false);

    // 컨테이너 준비
    useEffect(() => {
        const check = () => {
            const el = containerRef.current;
            if (el && el.clientHeight > 0) setContainerReady(true);
            else requestAnimationFrame(check);
        };
        check();
    }, []);

    // 지도 초기화 (+ 현재 위치 마커)
    useEffect(() => {
        if (!containerReady) return;

        loadKakaoSdk()
            .then((kakao) => {
                kakao.maps.load(() => {
                    const center = new kakao.maps.LatLng(37.5665, 126.978);
                    const map = new kakao.maps.Map(mapElRef.current, { center, level: 5 });
                    mapRef.current = map;

                    // 현재 위치 업데이트 함수 (Marker + Circle)
                    const updateMyLocation = (lat, lng, accuracy) => {
                        const pos = new kakao.maps.LatLng(lat, lng);

                        // 현재 위치 마커 (public/current.png)
                        if (!myLocMarkerRef.current) {
                            myLocMarkerRef.current = new kakao.maps.Marker({
                                position: pos,
                                image: getMyLocMarkerImage(kakao, 28),
                                zIndex: 2000,
                            });
                            myLocMarkerRef.current.setMap(map);
                        } else {
                            myLocMarkerRef.current.setPosition(pos);
                        }

                        // 정확도 원
                        const radius = Math.max(accuracy || 50, 30);
                        if (!myAccCircleRef.current) {
                            myAccCircleRef.current = new kakao.maps.Circle({
                                center: pos,
                                radius,
                                strokeWeight: 1,
                                strokeColor: '#3b82f6',
                                strokeOpacity: 0.6,
                                strokeStyle: 'shortdash',
                                fillColor: '#3b82f6',
                                fillOpacity: 0.12,
                                zIndex: 1500,
                            });
                            myAccCircleRef.current.setMap(map);
                        } else {
                            myAccCircleRef.current.setPosition(pos);
                            myAccCircleRef.current.setRadius(radius);
                        }
                    };

                    // 최초 1회 현재 위치
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                const { latitude, longitude, accuracy } = pos.coords;
                                const ll = new kakao.maps.LatLng(latitude, longitude);
                                map.setCenter(ll);
                                updateMyLocation(latitude, longitude, accuracy);
                            },
                            () => {},
                            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
                        );

                        // 지속 추적
                        geoWatchRef.current = navigator.geolocation.watchPosition(
                            (pos) => {
                                const { latitude, longitude, accuracy } = pos.coords;
                                updateMyLocation(latitude, longitude, accuracy);
                            },
                            () => {},
                            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
                        );
                    }

                    setMapReady(true);
                });
            })
            .catch((e) => console.error('Kakao SDK load error:', e));

        return () => {
            // 마커/라벨 정리
            markersRef.current.forEach((m) => m.setMap(null));
            labelsRef.current.forEach((o) => o.setMap(null));
            markersRef.current = [];
            labelsRef.current = [];

            // 현재 위치 마커/원 정리
            if (myLocMarkerRef.current) {
                myLocMarkerRef.current.setMap(null);
                myLocMarkerRef.current = null;
            }
            if (myAccCircleRef.current) {
                myAccCircleRef.current.setMap(null);
                myAccCircleRef.current = null;
            }
            // geolocation watch 해제
            if (geoWatchRef.current != null) {
                navigator.geolocation.clearWatch(geoWatchRef.current);
                geoWatchRef.current = null;
            }

            mapRef.current = null;
            setMapReady(false);
        };
    }, [containerReady]);

    // 지도 중심 기준으로 /nearby 호출 + 마커/라벨 동기화
    useEffect(() => {
        if (!mapReady) return;
        const kakao = window.kakao;
        const map = mapRef.current;
        if (!kakao || !map) return;

        let canceled = false;
        let idleTimer = null;

        const renderMarkers = (list) => {
            // 초기화
            markersRef.current.forEach((m) => m.setMap(null));
            labelsRef.current.forEach((o) => o.setMap(null));
            markersRef.current = [];
            labelsRef.current = [];

            ensureStoreLabelStyle();

            list.forEach((store) => {
                const ll = getLatLng(store);
                const name = store.name || store.시설명 || '';
                if (!ll) return;

                const pos = new kakao.maps.LatLng(ll.lat, ll.lng);

                const marker = new kakao.maps.Marker({ map, position: pos, title: name });
                markersRef.current.push(marker);

                const overlay = new kakao.maps.CustomOverlay({
                    position: pos,
                    content: labelContent(name),
                    xAnchor: 0.5,
                    yAnchor: 1.0,
                    zIndex: 999,
                });
                overlay.setMap(map);
                labelsRef.current.push(overlay);

                kakao.maps.event.addListener(marker, 'click', () => map.panTo(pos));
            });
        };

        const loadNearby = async () => {
            try {
                setLoading(true);
                const c = map.getCenter();
                const { merchants } = await fetchNearbyMerchants({
                    lat: c.getLat(),
                    lng: c.getLng(),
                    radius_m: 1500,
                    limit: 50,
                    search: searchQuery, // 서버가 search 지원 안 하면 무시됨
                });
                if (canceled) return;
                setMerchants(merchants);
                renderMarkers(merchants);
            } finally {
                if (!canceled) setLoading(false);
            }
        };

        const handleIdle = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(loadNearby, 250); // 디바운스
        };

        kakao.maps.event.addListener(map, 'idle', handleIdle);
        loadNearby(); // 초기 1회

        return () => {
            canceled = true;
            clearTimeout(idleTimer);
            try {
                kakao.maps.event.removeListener(map, 'idle', handleIdle);
            } catch {}
            markersRef.current.forEach((m) => m.setMap(null));
            labelsRef.current.forEach((o) => o.setMap(null));
            markersRef.current = [];
            labelsRef.current = [];
        };
    }, [mapReady, searchQuery]);

    // ====== 자동완성: 인풋 변경을 디바운스해서 후보 조회 ======
    useEffect(() => {
        const kw = inputValue.trim();
        if (!kw) {
            setSuggestions([]);
            return;
        }
        const t = setTimeout(async () => {
            const { merchants } = await fetchMerchantsList(1, 10, kw);
            const names = merchants.map((m) => m.시설명 || m.name).filter(Boolean);
            const uniq = Array.from(new Set(names)).slice(0, 8);
            setSuggestions(uniq);
            setShowSuggest(true);
        }, 220);
        return () => clearTimeout(t);
    }, [inputValue]);

    // ====== 선택한 이름으로 지도 포커싱(이동) ======
    const focusStoreByName = async (name) => {
        try {
            const { merchants } = await fetchMerchantsList(1, 5, name);
            if (!merchants || merchants.length === 0) return false;

            const candidate = merchants.find((m) => (m.시설명 || m.name) === name) || merchants[0];

            const ll = getLatLng(candidate);
            if (!ll) return false;

            const kakao = window.kakao;
            const map = mapRef.current;
            if (!kakao || !map) return false;

            const pos = new kakao.maps.LatLng(ll.lat, ll.lng);
            map.panTo(pos);
            if (map.getLevel() > 4) map.setLevel(4);

            return true;
        } catch {
            return false;
        }
    };

    // ====== 핸들러 ======
    const flyTo = (lat, lng) => {
        const kakao = window.kakao;
        const map = mapRef.current;
        if (!kakao || !map) return;
        map.panTo(new kakao.maps.LatLng(lat, lng));
    };

    const runSearch = async () => {
        const kw = inputValue.trim();
        if (!kw) return;
        await focusStoreByName(kw);
        setSearchQuery(kw);
        setShowSuggest(false);
    };

    const onKeyDown = (e) => {
        if (e.nativeEvent.isComposing) return; // ✅ 한글 조합 중 Enter 무시
        if (e.key === 'Enter') {
            e.preventDefault();
            runSearch();
            e.currentTarget.blur();
        }
    };

    const onChange = (e) => setInputValue(e.target.value);
    const onCompositionStart = () => {};
    const onCompositionEnd = (e) => setInputValue(e.currentTarget.value);

    const pickSuggestion = async (name) => {
        setInputValue(name);
        setShowSuggest(false);
        await focusStoreByName(name);
        setSearchQuery(name);
    };

    return (
        <div className="mobile-frame">
            <div ref={containerRef} className="mx-auto w-full max-w-[420px] relative overflow-hidden h-[100dvh]">
                {/* 지도 */}
                <div ref={mapElRef} className="absolute inset-0 z-0" />

                {/* 검색 & QR */}
                <div className="absolute left-1/2 top-3 w-[90%] -translate-x-1/2 z-40 space-y-2">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            className="w-full rounded-xl bg-white/95 px-4 py-3 pr-10 shadow placeholder:text-zinc-400"
                            placeholder="매장명으로 찾기"
                            value={inputValue}
                            onChange={onChange}
                            onKeyDown={onKeyDown}
                            onCompositionStart={onCompositionStart}
                            onCompositionEnd={onCompositionEnd}
                            onFocus={() => {
                                if (suggestions.length) setShowSuggest(true);
                            }}
                            onBlur={() => {
                                setTimeout(() => setShowSuggest(false), 120);
                            }}
                        />
                        <button
                            type="button"
                            onClick={runSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full hover:bg-zinc-100 active:scale-[.98] transition"
                            aria-label="검색"
                            title="검색"
                        >
                            <img src={SearchIcon} alt="" className="h-5 w-5 opacity-70" />
                        </button>

                        {/* 자동완성 드롭다운 */}
                        {showSuggest && suggestions.length > 0 && (
                            <ul className="absolute left-0 right-0 mt-1 rounded-xl bg-white/95 shadow-lg ring-1 ring-black/5 max-h-60 overflow-auto z-20">
                                {suggestions.map((s, i) => (
                                    <li key={`${s}-${i}`} className="border-b last:border-b-0 border-zinc-100">
                                        <button
                                            type="button"
                                            onClick={() => pickSuggestion(s)}
                                            className="w-full text-left px-3 py-2 hover:bg-zinc-100"
                                            dangerouslySetInnerHTML={{ __html: highlightMatch(s, inputValue.trim()) }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button
                        onClick={() => setQrOpen(true)}
                        className="absolute left-0 top-[54px] flex items-center gap-2 rounded-[15px] bg-[#32B544] w-[200px] h-[40px] pl-3 text-white shadow-lg active:scale-[.98]"
                    >
                        <img src={QRIcon} alt="" className="h-4 w-4 opacity-90" />
                        <span className="text-[15px] font-semibold">매장에서 QR로 결제하기</span>
                    </button>
                </div>

                {/* 바텀시트 */}
                {containerReady && (
                    <div className="fixed bottom-[56px] mx-auto z-30 w-full max-w-[420px] h-[calc(100dvh-56px)]pointer-events-none">
                        <BottomSheet
                            className="pointer-events-auto"
                            containerRef={containerRef}
                            snapPoints={[0.18, 0.4, 0.55, 1]}
                            defaultSnap={1} //
                            header={
                                <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-base font-semibold">가까운 매장</span>
                                </div>
                            }
                        >
                            <div className="px-3 pt-1 pb-2 -mt-1">
                                {loading ? (
                                    <div className="text-center py-6 text-zinc-500">로딩 중...</div>
                                ) : merchants.length === 0 ? (
                                    <div className="text-center py-6 text-zinc-500">검색 결과가 없습니다.</div>
                                ) : (
                                    <ul className="divide-y divide-zinc-100">
                                        {merchants.map((store, i) => {
                                            const name = store.name || store.시설명;
                                            const cate = store.category || store.카테고리;
                                            const addr = store.address || store.소재지;

                                            return (
                                                <li key={store.id || i} className="px-3 py-2">
                                                    <button
                                                        onClick={() => {
                                                            const ll = getLatLng(store);
                                                            if (ll) flyTo(ll.lat, ll.lng);
                                                        }}
                                                        className="w-full text-left"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="flex flex-col items-start gap-0.5">
                                                                    <span className="text-[11px] rounded-md bg-zinc-100 px-2 py-0.5">
                                                                        {cate}
                                                                    </span>
                                                                    <span className="font-semibold leading-tight">
                                                                        {name}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-0.5 text-xs text-zinc-500">
                                                                    {addr}
                                                                </div>
                                                            </div>

                                                            {/* 거리 뱃지 */}
                                                            {typeof store.distance_m === 'number' && (
                                                                <span className="ml-2 shrink-0 text-[11px] rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">
                                                                    {formatDistance(store.distance_m)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </BottomSheet>
                    </div>
                )}

                {/* 로딩 인디케이터 */}
                {loading && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-lg z-50">
                        데이터 로딩 중...
                    </div>
                )}
            </div>

            {/* 하단 탭 & QR 모달 */}
            <BottomTap />
            <QrModal open={qrOpen} onClose={() => setQrOpen(false)} src="/qr.png" />
        </div>
    );
}
