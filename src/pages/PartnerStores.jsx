
import React, { useEffect, useRef, useState } from 'react';
import BottomSheet from '../components/BottomSheet';

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

// 🔥 API 호출 함수들
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'; // 환경변수 또는 기본값

// 지도용 마커 데이터 가져오기
async function fetchMapMarkers(region = '', category = '', limit = 500) {
    try {
        const params = new URLSearchParams();
        if (region) params.append('region', region);
        if (category) params.append('category', category);
        if (limit) params.append('limit', limit.toString());

        const response = await fetch(`${API_BASE_URL}/api/merchants/map/?${params}`);
        if (!response.ok) throw new Error('Failed to fetch markers');

        const data = await response.json();
        return data.markers || [];
    } catch (error) {
        console.error('Error fetching markers:', error);
        return [];
    }
}

// 상점 목록 데이터 가져오기 (바텀시트용)
async function fetchMerchantsList(page = 1, pageSize = 20, region = '', category = '', search = '') {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
        });

        if (region) params.append('region', region);
        if (category) params.append('category', category);
        if (search) params.append('search', search);

        const response = await fetch(`${API_BASE_URL}/api/merchants/list/?${params}`);
        if (!response.ok) throw new Error('Failed to fetch merchants');

        const data = await response.json();
        return {
            merchants: data.merchants || [],
            pagination: data.pagination || {},
        };
    } catch (error) {
        console.error('Error fetching merchants:', error);
        return { merchants: [], pagination: {} };
    }
}

// 필터 옵션 가져오기
async function fetchFilterOptions() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/merchants/filters/`);
        if (!response.ok) throw new Error('Failed to fetch filters');

        const data = await response.json();
        return {
            regions: data.regions || [],
            categories: data.categories || [],
        };
    } catch (error) {
        console.error('Error fetching filters:', error);
        return { regions: [], categories: [] };
    }
}

export default function PartnerStores() {
    const containerRef = useRef(null);
    const mapElRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]); // 🔥 마커들 관리

    const [containerReady, setContainerReady] = useState(false);
    const [merchants, setMerchants] = useState([]); // 🔥 실제 상점 데이터
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [filterOptions, setFilterOptions] = useState({ regions: [], categories: [] });

    // 컨테이너 높이 준비 체크
    useEffect(() => {
        const check = () => {
            const el = containerRef.current;
            if (el && el.clientHeight > 0) {
                setContainerReady(true);
            } else {
                requestAnimationFrame(check);
            }
        };
        check();
    }, []);

    // 🔥 필터 옵션 로드
    useEffect(() => {
        fetchFilterOptions().then(setFilterOptions);
    }, []);

    // 🔥 상점 데이터 로드
    useEffect(() => {
        const loadMerchants = async () => {
            setLoading(true);
            try {
                // 바텀시트용 리스트 데이터
                const listData = await fetchMerchantsList(1, 50, selectedRegion, selectedCategory, searchQuery);
                setMerchants(listData.merchants);

                // 지도용 마커 데이터 (더 많이)
                const markerData = await fetchMapMarkers(selectedRegion, selectedCategory, 200);

                // 기존 마커들 제거
                markersRef.current.forEach((marker) => marker.setMap(null));
                markersRef.current = [];

                // 새 마커들 추가
                if (window.kakao && mapRef.current) {
                    markerData.forEach((store) => {
                        if (store.latitude && store.longitude) {
                            const marker = new window.kakao.maps.Marker({
                                map: mapRef.current,
                                position: new window.kakao.maps.LatLng(store.latitude, store.longitude),
                                title: store.시설명 || store.name,
                            });

                            // 🔥 마커 클릭 이벤트 (선택사항)
                            window.kakao.maps.event.addListener(marker, 'click', () => {
                                // 해당 상점으로 바텀시트 스크롤하거나 상세 정보 표시
                                flyTo(store.latitude, store.longitude);
                            });

                            markersRef.current.push(marker);
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading merchants:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMerchants();
    }, [selectedRegion, selectedCategory, searchQuery]);

    // 지도 초기화
    useEffect(() => {
        if (!containerReady) return;

        loadKakaoSdk()
            .then((kakao) => {
                kakao.maps.load(() => {
                    // 기본 중심: 서울 시청
                    const center = new kakao.maps.LatLng(37.5665, 126.978);
                    const map = new kakao.maps.Map(mapElRef.current, {
                        center,
                        level: 5,
                    });
                    mapRef.current = map;

                    // 내 위치로 센터 이동
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                const ll = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                                map.setCenter(ll);
                            },
                            () => {} // 거부/오류는 무시
                        );
                    }
                });
            })
            .catch((e) => {
                console.error('Kakao SDK load error:', e);
            });

        return () => {
            // 마커들 정리
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current = [];
            mapRef.current = null;
        };
    }, [containerReady]);

    // 리스트에서 항목 클릭 시 지도 중심 이동
    const flyTo = (lat, lng) => {
        const kakao = window.kakao;
        const map = mapRef.current;
        if (!kakao || !map) return;
        const pos = new kakao.maps.LatLng(lat, lng);
        map.panTo(pos);
    };

    // 🔥 검색 핸들러
    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'blur') {
            setSearchQuery(e.target.value);
        }
    };

    return (
        <div className="mobile-frame">
            <div ref={containerRef} className="mx-auto w-full max-w-[420px] relative overflow-hidden h-[100dvh]">
                {/* 지도 캔버스 */}
                <div ref={mapElRef} className="absolute inset-0" />

                {/* 🔥 검색창 + 필터 */}
                <div className="absolute left-1/2 top-3 w-[90%] -translate-x-1/2 z-10 space-y-2">
                    <input
                        className="w-full rounded-xl bg-white/95 px-4 py-3 shadow placeholder:text-zinc-400"
                        placeholder="매장명으로 찾기"
                        onKeyDown={handleSearch}
                        onBlur={handleSearch}
                    />

                    {/* 필터 버튼들 */}
                    <div className="flex gap-2">
                        <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="px-3 py-1 bg-white/95 rounded-lg text-sm"
                        >
                            <option value="">전체 지역</option>
                            {filterOptions.regions.map((region) => (
                                <option key={region} value={region}>
                                    {region}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-1 bg-white/95 rounded-lg text-sm"
                        >
                            <option value="">전체 업종</option>
                            {filterOptions.categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 바텀시트 */}
                {containerReady && (
                    <BottomSheet
                        containerRef={containerRef}
                        snapPoints={[0.18, 0.55, 1]}
                        defaultSnap={1}
                        header={
                            <div className="flex items-center justify-between">
                                <span className="text-base font-semibold">가까운 매장</span>
                                <span className="text-sm text-zinc-500">
                                    {loading ? '로딩 중...' : `${merchants.length}개`}
                                </span>
                            </div>
                        }
                    >
                        <div className="p-4">
                            {loading ? (
                                <div className="text-center py-8 text-zinc-500">로딩 중...</div>
                            ) : merchants.length === 0 ? (
                                <div className="text-center py-8 text-zinc-500">검색 결과가 없습니다.</div>
                            ) : (
                                <ul className="divide-y">
                                    {merchants.map((store, i) => (
                                        <li key={store.id || i} className="px-4 py-3">
                                            <button
                                                onClick={() => flyTo(store.latitude, store.longitude)}
                                                className="w-full text-left"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] rounded-md bg-zinc-100 px-2 py-0.5">
                                                                {store.카테고리 || store.category}
                                                            </span>
                                                            <span className="font-semibold">
                                                                {store.시설명 || store.name}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 text-xs text-zinc-500">
                                                            {store.소재지 || store.address}
                                                        </div>
                                                        {store.전화번호 && (
                                                            <div className="mt-1 text-xs text-blue-500">
                                                                {store.전화번호}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs text-zinc-500">
                                                            {store.지역 || store.region}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </BottomSheet>
                )}

                {/* 로딩 인디케이터 */}
                {loading && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-lg z-50">
                        데이터 로딩 중...
                    </div>
                )}
            </div>

        </div>
    );
}
