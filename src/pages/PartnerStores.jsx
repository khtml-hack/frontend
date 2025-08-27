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
    }
  `;
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

// API
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://peakdown.site').replace(/\/$/, '');

// 지도용 마커 데이터 (limit만 사용)
async function fetchMapMarkers(limit = 500) {
    try {
        const params = new URLSearchParams();
        if (limit) params.append('limit', String(limit));
        const res = await fetch(`${API_BASE_URL}/api/merchants/map/?${params}`);
        if (!res.ok) throw new Error('Failed to fetch markers');
        const data = await res.json();
        return data.markers || [];
    } catch (e) {
        console.error('Error fetching markers:', e);
        return [];
    }
}

// 상점 목록 (검색만 사용)
async function fetchMerchantsList(page = 1, pageSize = 20, search = '') {
    try {
        const params = new URLSearchParams({
            page: String(page),
            page_size: String(pageSize),
        });
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

    const inputRef = useRef(null);
    const composingRef = useRef(false); // ✅ IME 조합 상태

    const [containerReady, setContainerReady] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(true);

    const [inputValue, setInputValue] = useState(''); // ✅ 제어 인풋
    const [searchQuery, setSearchQuery] = useState(''); // 실제 검색에 쓰는 값

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

    // 지도 초기화
    useEffect(() => {
        if (!containerReady) return;

        loadKakaoSdk()
            .then((kakao) => {
                kakao.maps.load(() => {
                    const center = new kakao.maps.LatLng(37.5665, 126.978);
                    const map = new kakao.maps.Map(mapElRef.current, { center, level: 5 });
                    mapRef.current = map;

                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                const ll = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                                map.setCenter(ll);
                            },
                            () => {}
                        );
                    }
                    setMapReady(true);
                });
            })
            .catch((e) => console.error('Kakao SDK load error:', e));

        return () => {
            markersRef.current.forEach((m) => m.setMap(null));
            labelsRef.current.forEach((o) => o.setMap(null));
            markersRef.current = [];
            labelsRef.current = [];
            mapRef.current = null;
            setMapReady(false);
        };
    }, [containerReady]);

    // 데이터 로드 + 마커 & 라벨 (검색만 의존)
    useEffect(() => {
        if (!mapReady) return;

        const loadMerchants = async () => {
            setLoading(true);
            try {
                // 리스트
                const listData = await fetchMerchantsList(1, 50, searchQuery);
                setMerchants(listData.merchants);

                // 마커
                const markerData = await fetchMapMarkers(200);

                // 초기화
                markersRef.current.forEach((m) => m.setMap(null));
                labelsRef.current.forEach((o) => o.setMap(null));
                markersRef.current = [];
                labelsRef.current = [];

                const kakao = window.kakao;
                const map = mapRef.current;
                if (!kakao || !map) return;

                ensureStoreLabelStyle();

                markerData.forEach((store) => {
                    const ll = getLatLng(store);
                    if (!ll) return;
                    const name = store.시설명 || store.name || '';

                    const marker = new kakao.maps.Marker({
                        map,
                        position: new kakao.maps.LatLng(ll.lat, ll.lng),
                        title: name,
                    });
                    markersRef.current.push(marker);

                    const overlay = new kakao.maps.CustomOverlay({
                        position: new kakao.maps.LatLng(ll.lat, ll.lng),
                        content: labelContent(name),
                        xAnchor: 0.5,
                        yAnchor: 1.0,
                        zIndex: 999,
                    });
                    overlay.setMap(map);
                    labelsRef.current.push(overlay);

                    kakao.maps.event.addListener(marker, 'click', () => {
                        map.panTo(new kakao.maps.LatLng(ll.lat, ll.lng));
                    });
                });
            } catch (e) {
                console.error('Error loading merchants:', e);
            } finally {
                setLoading(false);
            }
        };

        loadMerchants();
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

    // ====== 선택한 이름으로 지도 포커싱(이동 + 말풍선) ======
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
        // 먼저 지도 포커싱 시도
        await focusStoreByName(kw);
        // 리스트 갱신
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
    const onCompositionEnd = (e) => {
        // 조합 끝나면 value 동기화 (제어 컴포넌트)
        setInputValue(e.currentTarget.value);
    };

    const pickSuggestion = async (name) => {
        setInputValue(name);
        setShowSuggest(false);
        // 지도 이동 + 강조
        await focusStoreByName(name);
        // 하단 리스트 갱신
        setSearchQuery(name);
    };

    return (
        <div className="mobile-frame">
            <div ref={containerRef} className="mx-auto w-full max-w-[420px] relative overflow-hidden h-[100dvh]">
                {/* 지도 */}
                <div ref={mapElRef} className="absolute inset-0 z-0" />

                {/* 검색 & QR */}
                <div className="absolute left-1/2 top-3 w-[90%] -translate-x-1/2 z-10 space-y-2">
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
                    <div className="fixed bottom-[56px] mx-auto z-30 w-full max-w-[420px]">
                        <BottomSheet
                            containerRef={containerRef}
                            snapPoints={[0.18, 0.55, 1]}
                            defaultSnap={1}
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
                                            const name = store.시설명 || store.name;
                                            const cate = store.카테고리 || store.category;
                                            const addr = store.소재지 || store.address;
                                            const ll = getLatLng(store);

                                            return (
                                                <li key={store.id || i} className="px-3 py-2">
                                                    <button
                                                        onClick={() => {
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
