import React, { useEffect, useState } from 'react';
import { useKakaoMap, searchPlace, getCurrentLocation } from '../hooks/useKakaoMap';
import { useNavigate } from 'react-router-dom';
import { patchNickname } from '../api/nicknameApi';
import { logoutUser } from '../api/userApi';
import BottomTap from '../components/BottomTap';
import MoneyIcon from '../assets/Money.png';
export default function MyPage() {
    const navigate = useNavigate();
    // QR 모달
    const [qrOpen, setQrOpen] = useState(false);
    // 닉네임 상태 & 모달 상태
    const [nickname, setNickname] = useState('김원활');
    const [editOpen, setEditOpen] = useState(false);
    const [formName, setFormName] = useState(nickname);
    const [saving, setSaving] = useState(false);
    const [saveErr, setSaveErr] = useState('');
    // 로그아웃 관련 상태
    const [error, setError] = useState('');
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    // 집 주소 관리 모달 상태 및 검색 관련
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [addressSaving, setAddressSaving] = useState(false);
    const [addressError, setAddressError] = useState('');
    const kakaoMapLoaded = useKakaoMap();

    // 주소 검색
    const handlePlaceSearch = () => {
        if (!searchKeyword.trim()) return;
        if (!kakaoMapLoaded) {
            setAddressError('카카오맵을 로딩 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        setIsSearching(true);
        setSearchResults([]);
        searchPlace(searchKeyword, (results) => {
            const converted = results.map((place) => ({
                id: place.id,
                name: place.place_name,
                address: place.address_name || place.road_address_name,
                roadAddress: place.road_address_name,
                x: parseFloat(place.x),
                y: parseFloat(place.y),
            }));
            setSearchResults(converted);
            setIsSearching(false);
        });
    };

    // 현재 위치로 주소 찾기
    const handleCurrentLocation = async () => {
        try {
            setIsSearching(true);
            const loc = await getCurrentLocation();
            if (kakaoMapLoaded && window.kakao && window.kakao.maps) {
                const geocoder = new window.kakao.maps.services.Geocoder();
                geocoder.coord2Address(loc.longitude, loc.latitude, (result, status) => {
                    setIsSearching(false);
                    if (status === window.kakao.maps.services.Status.OK) {
                        const address = result[0].address;
                        setSelectedAddress({
                            id: 'current',
                            name: '현재 위치',
                            address: address.address_name,
                            roadAddress: result[0].road_address
                                ? result[0].road_address.address_name
                                : address.address_name,
                            x: loc.longitude,
                            y: loc.latitude,
                        });
                    } else {
                        setSelectedAddress({
                            id: 'current',
                            name: '현재 위치',
                            address: `위도: ${loc.latitude.toFixed(6)}, 경도: ${loc.longitude.toFixed(6)}`,
                            x: loc.longitude,
                            y: loc.latitude,
                        });
                    }
                });
            }
        } catch (e) {
            setIsSearching(false);
            setAddressError('현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
        }
    };

    // 집 주소 저장 함수 (선택된 주소)
    async function handleSaveAddress() {
        if (!selectedAddress) return;
        setAddressSaving(true);
        setAddressError('');
        try {
            const { patchUserAddress } = await import('../api/addressApi');
            const res = await patchUserAddress(selectedAddress.address);
            if (res && res.address) {
                setAddressModalOpen(false);
                setSelectedAddress(null);
                setSearchKeyword('');
                setSearchResults([]);
            } else {
                setAddressError(res?.error || '주소 저장에 실패했습니다.');
            }
        } catch (err) {
            setAddressError('네트워크 오류');
        } finally {
            setAddressSaving(false);
        }
    }

    // ESC로 모달 닫기
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setQrOpen(false);
                setEditOpen(false);
                setLogoutModalOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // 초기 닉네임 로드(선택)
    useEffect(() => {
        try {
            const n = localStorage.getItem('nickname');
            if (n) setNickname(n);
        } catch {}
    }, []);

    // 닉네임 저장
    async function handleSaveNickname() {
        const next = formName.trim();
        if (!next || next === nickname) {
            setEditOpen(false);
            return;
        }
        try {
            setSaving(true);
            setSaveErr('');

            // 필요 시 토큰 꺼내 쓰기 (없으면 undefined)
            const token = localStorage.getItem('accessToken');

            // 실제 API 호출
            const data = await patchNickname(next, token); // { nickname: "..." } 예상

            const confirmed = data?.nickname ?? next;
            setNickname(confirmed);
            try {
                localStorage.setItem('nickname', confirmed);
            } catch {}
            setEditOpen(false);
        } catch (err) {
            console.error('닉네임 저장 오류:', err);
            setSaveErr('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    }

    // 로그아웃 모달 열기
    const handleLogoutClick = () => {
        setLogoutModalOpen(true);
    };

    // 로그아웃 처리
    const handleLogout = async () => {
        setError('');
        setLogoutModalOpen(false);
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                setError('로그인 정보가 없습니다.');
                return;
            }

            await logoutUser(refreshToken);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            try {
                localStorage.removeItem('nickname');
            } catch {}
            navigate('/login');
        } catch (e) {
            console.error('로그아웃 오류:', e);
            setError('로그아웃 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="mobile-frame">
            <div className="mx-auto w-full max-w-[420px] min-h-[100svh] flex flex-col bg-white text-black relative">
                {/* 상단 카드(간단) */}
                <header className="p-7">
                    <h1 className="text-[clamp(22px,5vw,28px)] font-extrabold text-green-500">Peak_down</h1>
                </header>

                {/* 페이지 영역 */}
                <main className="flex-1 px-5 py-4">
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">마이페이지</h2>
                        <p className="text-sm text-zinc-500">
                            안녕하세요, <b>{nickname}</b> 님
                        </p>

                        {/* 내정보 리스트 */}
                        <section>
                            <h3 className="text-sm text-zinc-500">내정보</h3>
                            <ul className="mt-2 overflow-hidden rounded-xl border divide-y">
                                <li>
                                    <button
                                        className="flex w-full items-center justify-between px-4 py-3"
                                        onClick={() => {
                                            setFormName(nickname);
                                            setEditOpen(true);
                                        }}
                                    >
                                        <span>닉네임 변경</span>
                                        <span className="text-zinc-400">›</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="flex w-full items-center justify-between px-4 py-3"
                                        onClick={() => setAddressModalOpen(true)}
                                    >
                                        <span>집 주소 관리</span>
                                        <span className="text-zinc-400">›</span>
                                    </button>
                                </li>
                                {/* 집 주소 관리 모달 (카카오맵 검색) */}
                                {addressModalOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                        <div className="bg-white rounded-xl p-6 w-80 h shadow-lg">
                                            <h3 className="text-center text-lg font-semibold mb-4">집 주소 관리</h3>
                                            <div className="mb-3">
                                                <div className="bg-white border rounded-xl p-2 flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="주소로 검색"
                                                        value={searchKeyword}
                                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handlePlaceSearch()}
                                                        className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-base outline-none"
                                                        disabled={isSearching || addressSaving}
                                                    />
                                                    <button
                                                        onClick={handlePlaceSearch}
                                                        className="text-gray-700 px-2 py-1 rounded-lg bg-gray-100 w-[90px] h-[30px]"
                                                        disabled={isSearching || addressSaving}
                                                    >
                                                        검색
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={handleCurrentLocation}
                                                    className="w-full mt-3 bg-gray-800 text-white py-2 rounded-xl font-medium"
                                                    disabled={isSearching || addressSaving}
                                                >
                                                    📍 현재 위치로 찾기
                                                </button>
                                            </div>
                                            {isSearching && (
                                                <div className="text-center text-sm text-gray-500 mb-2">검색 중...</div>
                                            )}
                                            {searchResults.length > 0 && (
                                                <div className="mb-2 max-h-40 overflow-y-auto bg-white border rounded-xl">
                                                    {searchResults.map((r) => (
                                                        <div
                                                            key={r.id}
                                                            onClick={() => setSelectedAddress(r)}
                                                            className={`p-2 border-b cursor-pointer ${
                                                                selectedAddress?.id === r.id ? 'bg-gray-100' : ''
                                                            }`}
                                                        >
                                                            <div className="text-gray-900 font-medium">{r.name}</div>
                                                            <div className="text-gray-500 text-sm">{r.address}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {selectedAddress && (
                                                <div className="mb-2 p-2 bg-gray-50 border rounded-xl">
                                                    <div className="text-gray-900 font-medium mb-1">선택된 주소</div>
                                                    <div className="text-gray-700 text-sm">
                                                        {selectedAddress.address}
                                                    </div>
                                                </div>
                                            )}
                                            {addressError && (
                                                <div className="text-red-500 text-sm mb-2">{addressError}</div>
                                            )}
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    className="flex-1 py-2 rounded bg-zinc-200 text-zinc-700"
                                                    onClick={() => {
                                                        setAddressModalOpen(false);
                                                        setSelectedAddress(null);
                                                        setSearchKeyword('');
                                                        setSearchResults([]);
                                                        setAddressError('');
                                                    }}
                                                    disabled={addressSaving}
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    className="flex-1 py-2 rounded bg-green-500 text-white"
                                                    onClick={handleSaveAddress}
                                                    disabled={addressSaving || !selectedAddress}
                                                >
                                                    저장
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <li>
                                    <button
                                        className="flex w-full items-center justify-between px-4 py-3"
                                        onClick={() => navigate('/favorite-locations')}
                                    >
                                        <span>자주가는 경로 관리</span>
                                        <span className="text-zinc-400">›</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="flex w-full items-center justify-between px-4 py-3"
                                        onClick={handleLogoutClick}
                                    >
                                        <span className="text-red-500">로그아웃</span>
                                        <span className="text-zinc-400">›</span>
                                    </button>
                                </li>
                            </ul>
                            {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
                        </section>

                        <hr className="border-zinc-200" />

                        {/* 현황 섹션 */}
                        <h3 className="text-sm text-zinc-400">나의 지역화폐 현황 및 사용</h3>
                        <div className="bg-[#32B544] text-white rounded-2xl px-5 py-4 relative overflow-hidden">
                            <img
                                src={MoneyIcon}
                                alt=""
                                className="absolute bottom--1 left-0 w-[120px] h-[100px] opacity-80"
                            />
                            <div className="relative">
                                <div className="flex items-baseline justify-between">
                                    <span className="font-semibold">나의 지역화폐 현황</span>
                                    <span className="text-xl font-extrabold">2,500원</span>
                                </div>
                                <div className="mt-3 flex w-full justify-end gap-2">
                                    <button
                                        className="rounded-full border-2 border-white/80 bg-white/10  px-3 py-1 text-[15px]"
                                        onClick={() => navigate('/point-history')}
                                    >
                                        적립/사용내역
                                    </button>
                                    <button
                                        onClick={() => navigate('/stores')}
                                        className="rounded-full border-2 border-white/80 bg-white/10  px-3 py-1 text-[15px]"
                                    >
                                        사용하러 가기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* 닉네임 변경 모달 */}
                {editOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-6"
                        onClick={() => !saving && setEditOpen(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="닉네임 변경"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div
                            className="relative z-10 w-full max-w-sm rounded-2xl bg-neutral-900 text-white p-5 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 닫기 버튼 */}
                            <button
                                className="absolute right-3 top-3 text-white/80 hover:text-white"
                                onClick={() => !saving && setEditOpen(false)}
                                aria-label="닫기"
                            >
                                ×
                            </button>

                            <h3 className="text-center text-lg font-semibold">닉네임 변경하기</h3>

                            <div className="mt-4">
                                <div className="relative">
                                    <input
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                                        placeholder="닉네임"
                                        maxLength={20}
                                        autoFocus
                                        className="w-full rounded-full bg-neutral-800 px-4 py-3 pr-10 outline-none ring-1 ring-white/10 focus:ring-white/30"
                                    />
                                    {!!formName && (
                                        <button
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                                            onClick={() => setFormName('')}
                                            aria-label="지우기"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                {saveErr && <p className="mt-2 text-sm text-red-400">{saveErr}</p>}
                            </div>

                            <button
                                onClick={handleSaveNickname}
                                disabled={saving || !formName.trim()}
                                className="mt-5 w-full rounded-full bg-white text-neutral-900 py-2 disabled:opacity-60 active:scale-[.98]"
                            >
                                {saving ? '저장 중…' : '완료'}
                            </button>
                        </div>
                    </div>
                )}

                {/* 로그아웃 확인 모달 */}
                {logoutModalOpen && (
                    <div
                        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setLogoutModalOpen(false)}
                    >
                        <div
                            className="relative z-10 w-full max-w-sm rounded-2xl bg-neutral-900 text-white p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-center text-lg font-semibold mb-4">로그아웃</h3>
                            <p className="text-center text-neutral-300 mb-6">로그아웃 하시겠어요?</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setLogoutModalOpen(false)}
                                    className="flex-1 rounded-full bg-neutral-700 text-white py-3 hover:bg-neutral-600 active:scale-[.98]"
                                >
                                    아니오
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 rounded-full bg-red-500 text-white py-3 hover:bg-red-600 active:scale-[.98]"
                                >
                                    네
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 하단 탭 */}
            <div className="relative z-20">
                <BottomTap />
            </div>
        </div>
    );
}
