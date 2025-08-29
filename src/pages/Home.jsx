import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useKakaoMap, searchPlace, getCurrentLocation } from '../hooks/useKakaoMap';
import { getTripRecommendation } from '../api/tripApi';
import BottomTap from '../components/BottomTap';
import TimeSettingModal from '../components/TimeSettingModal';
import MoneyIcon from '../assets/Money.png';
const Home = () => {
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const [showDepartureModal, setShowDepartureModal] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [arrivalTime, setArrivalTime] = useState('');
    const [nickname, setNickname] = useState('김혼잡');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchType, setSearchType] = useState('departure'); // 'departure' or 'destination'
    const [favoriteLocations, setFavoriteLocations] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const kakaoMapLoaded = useKakaoMap();
    const navigate = useNavigate();

    // 로컬 스토리지에서 닉네임, 위치 정보, 즐겨찾기 위치 가져오기
    useEffect(() => {
        const savedNickname = localStorage.getItem('nickname');
        if (savedNickname) {
            setNickname(savedNickname);
        }

        // 온보딩을 완료한 사용자만 저장된 출발지/도착지 로드
        const onboardingCompleted = localStorage.getItem('onboardingCompleted');
        if (onboardingCompleted === 'true') {
            const savedDeparture = localStorage.getItem('departure');
            if (savedDeparture) {
                setDeparture(savedDeparture);
            }

            const savedDestination = localStorage.getItem('destination');
            if (savedDestination) {
                setDestination(savedDestination);
            }
        }

        // 저장된 도착 시간 로드
        const savedArrivalTime = localStorage.getItem('arrivalTime');
        if (savedArrivalTime) {
            console.log('💾 저장된 도착 시간 로드됨:', savedArrivalTime);
            setArrivalTime(savedArrivalTime);
        }

        const savedFavorites = localStorage.getItem('favoriteLocations');
        if (savedFavorites) {
            try {
                setFavoriteLocations(JSON.parse(savedFavorites));
            } catch (e) {
                console.error('즐겨찾기 위치 로드 오류:', e);
            }
        }

        // 현재 위치 가져오기
        getCurrentLocation()
            .then((location) => {
                setUserLocation(location);
                console.log('현재 위치 획득:', location);
            })
            .catch((error) => {
                console.log('현재 위치 획득 실패:', error);
                // 위치 권한이 없어도 앱은 정상 작동
            });
    }, []);

    const handleTimeSet = (time) => {
        console.log('🕐 시간 설정됨:', time);
        setArrivalTime(time);
        localStorage.setItem('arrivalTime', time);
    };

    const formatTimeForDisplay = (time) => {
        if (!time) return '';
        return time; // 'hour:minute' 형식 그대로 반환
    };

    const formatTimeForAPI = (time) => {
        if (!time) return null;

        console.log('🔄 시간 변환 시작:', time);

        // arrive_by 필드는 오늘 날짜의 특정 시간을 ISO 8601 형식으로 전송
        const today = new Date();
        const [hour, minute] = time.split(':');
        const arrivalDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            parseInt(hour),
            parseInt(minute),
            0,
            0
        );

        // ISO 8601 형식으로 반환 (예: "2024-12-25T14:30:00.000Z")
        const isoString = arrivalDate.toISOString();
        console.log('📅 ISO 8601 형식으로 변환됨:', isoString);
        return isoString;
    };

    const handleFindOptimalTime = async () => {
        console.log('🔍 AI 최적시간 찾기 시작:', {
            departure,
            destination,
            arrivalTime,
            hasArrivalTime: !!arrivalTime,
        });

        if (!departure || !destination) {
            // 입력이 부족할 경우 모달을 표시
            if (!departure) {
                setSearchType('departure');
                setShowDepartureModal(true);
            } else if (!destination) {
                setSearchType('destination');
                setShowDepartureModal(true);
            }
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/login');
                return;
            }

            // 출발지와 도착지 정보를 로컬 스토리지에 저장
            localStorage.setItem('departure', departure);
            localStorage.setItem('destination', destination);

            // arrivalTime이 없으면 기본값(현재 시간 + 1시간) 사용
            let finalArrivalTime = arrivalTime;
            if (!finalArrivalTime) {
                const now = new Date();
                now.setHours(now.getHours() + 1);
                const hour = String(now.getHours()).padStart(2, '0');
                const minute = String(now.getMinutes()).padStart(2, '0');
                finalArrivalTime = `${hour}:${minute}`;
            }
            const arriveByTime = formatTimeForAPI(finalArrivalTime);
            console.log('🚀 API 호출 전 최종 데이터:', {
                departure,
                destination,
                arrivalTime,
                finalArrivalTime,
                arriveByTime,
                hasArrivalTime: !!arrivalTime,
            });

            const recommendation = await getTripRecommendation(
                departure,
                destination,
                '110000', // 서울 지역 코드 (기본값)
                arriveByTime,
                token
            );

            // 추천 결과를 로컬 스토리지에 저장하여 다음 페이지에서 사용
            localStorage.setItem('tripRecommendation', JSON.stringify(recommendation));

            // 시간 추천 페이지로 이동
            navigate('/time-recommendations');
        } catch (error) {
            console.error('AI 추천 요청 실패:', error);
            setError('AI 추천 요청에 실패했습니다. 다시 시도해주세요.');

            // 에러가 발생해도 기존 페이지로 이동 (fallback)
            localStorage.setItem('departure', departure);
            localStorage.setItem('destination', destination);
            navigate('/time-recommendations');
        } finally {
            setIsLoading(false);
        }
    };

    // 장소 검색 함수
    const handlePlaceSearch = () => {
        if (!searchKeyword.trim() || !kakaoMapLoaded) return;

        setIsSearching(true);
        setSearchResults([]); // 검색 시작 시 이전 결과 초기화

        searchPlace(
            searchKeyword,
            (results) => {
                setSearchResults(results);
                setIsSearching(false);
            },
            userLocation
        ); // 현재 위치를 전달하여 거리순 정렬
    };

    // 장소 선택 함수
    const handleSelectPlace = (place) => {
        if (searchType === 'departure') {
            setDeparture(place.place_name);
        } else {
            setDestination(place.place_name);
        }
        setShowDepartureModal(false);
        setSearchKeyword('');
        setSearchResults([]);
    };

    // 즐겨찾기 위치 선택 함수
    const handleSelectFavorite = (favorite) => {
        if (searchType === 'departure') {
            setDeparture(favorite.placeName);
        } else {
            setDestination(favorite.placeName);
        }
        setShowDepartureModal(false);
        setSearchKeyword('');
        setSearchResults([]);
    };

    // 현재 위치 사용 함수
    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // 좌표를 주소로 변환 (카카오맵 API 사용)
                    if (kakaoMapLoaded && window.kakao && window.kakao.maps) {
                        const geocoder = new window.kakao.maps.services.Geocoder();
                        geocoder.coord2Address(longitude, latitude, (result, status) => {
                            if (status === window.kakao.maps.services.Status.OK) {
                                const address = result[0].address;
                                const addressName = address.address_name || '현재 위치';
                                if (searchType === 'departure') {
                                    setDeparture(addressName);
                                } else {
                                    setDestination(addressName);
                                }
                                setShowDepartureModal(false);
                            } else {
                                alert('현재 위치를 가져오는데 실패했습니다.');
                            }
                        });
                    }
                },
                (error) => {
                    console.error('위치 정보 가져오기 오류:', error);
                    alert('위치 정보를 가져올 수 없습니다.');
                }
            );
        } else {
            alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
        }
    };

    return (
        <div className="mobile-frame">
            <div
                className="mx-auto w-full max-w-[420px] min-h-[100svh] flex flex-col bg-white text-black relative"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom),12px)' }}
            >
                {/* Header with green title */}
                <header className="px-7 pt-12 pb-4">
                    <h1 className="text-[32px] font-extrabold text-[#40d854] tracking-[-1.28px] leading-[45px]">
                        Peak_down
                    </h1>
                </header>

                {/* Main Content */}
                <main className="flex-1 px-7 pb-8">
                    {/* User Greeting */}
                    <div className="mb-6">
                        <p className="text-[#707070] text-[22px] font-semibold leading-[45px] mb-2">
                            안녕하세요 {nickname} 님,
                        </p>
                        <p className="text-[#1b1b1b] font-semibold text-[25px] leading-[30px] tracking-[-1px]">
                            막히는 시간 피하고 돈 버는 시간을
                            <br />
                            찾아드릴게요.
                        </p>
                    </div>

                    {/* Time Setting Info */}
                    <div className="mb-4">
                        <p
                            className="text-[#8f8f8f] text-[14px] font-light leading-[35px] tracking-[-0.56px] cursor-pointer hover:text-[#40d854] transition-colors hover:underline"
                            onClick={() => setShowTimeModal(true)}
                        >
                            이 시간까지는 도착해야해요! {arrivalTime && `(${formatTimeForDisplay(arrivalTime)})`}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[#ebebeb] mb-4"></div>

                    {/* Search Inputs - Frame 116 Style */}
                    <div className="mb-6">
                        <div
                            className="w-full bg-white rounded-[10px] relative"
                            style={{
                                border: '1px solid ',
                                borderImage: 'linear-gradient(90deg, rgba(87, 72, 255, 0.56) 0%, #40d854 100%) 1',
                                minHeight: '91px',
                            }}
                        >
                            {/* 출발지 입력 - Frame 117 */}
                            <div
                                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                                onClick={() => {
                                    setSearchType('departure');
                                    setShowDepartureModal(true);
                                }}
                            >
                                <span
                                    className={`text-[16px] font-medium leading-[35px] tracking-[-0.64px] ${
                                        departure ? 'text-[#323232]' : 'text-[#8f8f8f]'
                                    }`}
                                >
                                    {departure || '출발지 입력'}
                                </span>
                                <svg width="17" height="18" viewBox="0 0 17 18" fill="none">
                                    <path
                                        d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                                        stroke="#AAAAAA"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M19 19L14.65 14.65"
                                        stroke="#AAAAAA"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            {/* 구분선 */}
                            <div className="h-px bg-gradient-to-r from-[rgba(87,72,255,0.56)] to-[#40d854] mx-4"></div>

                            {/* 도착지 입력 - Frame 118 */}
                            <div
                                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                                onClick={() => {
                                    setSearchType('destination');
                                    setShowDepartureModal(true);
                                }}
                            >
                                <span
                                    className={`text-[16px] font-medium leading-[35px] tracking-[-0.64px] ${
                                        destination ? 'text-[#323232]' : 'text-[#8f8f8f]'
                                    }`}
                                >
                                    {destination || '도착지 입력'}
                                </span>
                                <svg width="17" height="18" viewBox="0 0 17 18" fill="none">
                                    <path
                                        d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                                        stroke="#AAAAAA"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M19 19L14.65 14.65"
                                        stroke="#AAAAAA"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                            {error}
                            <button
                                onClick={() => setError('')}
                                className="float-right text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Find Optimal Time Button */}
                    <div className="mb-6">
                        <button
                            onClick={handleFindOptimalTime}
                            disabled={!departure || !destination || isLoading}
                            className={`w-full py-[13px] rounded-[15px] font-medium text-[22px] transition-all duration-200 flex items-center justify-center text-white ${
                                departure && destination && !isLoading
                                    ? 'bg-gradient-to-r from-[#5748ff8f] to-[#40d854]'
                                    : 'bg-gradient-to-r from-[#5748ff8f] to-[#40d854]'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    AI 분석 중...
                                </>
                            ) : (
                                ' AI 최적 시간 찾기'
                            )}
                        </button>
                    </div>

                    {/* Regional Currency Info Card */}
                    <div className="mb-6">
                        <div className="bg-[#32B544] text-white rounded-2xl px-5 py-4 relative overflow-hidden">
                            <img
                                src={MoneyIcon}
                                alt=""
                                className="absolute bottom--1 left-0 w-[110] h-[60] opacity-80"
                            />

                            <div className="relative">
                                <div className="flex items-baseline justify-between">
                                    <span className="font-semibold">나의 지역화폐 현황</span>
                                    <span className="text-xl font-extrabold">2,500원</span>
                                </div>
                                <div className="mt-3 flex w-full justify-end  gap-2">
                                    <button
                                        className="rounded-full border-2 border-white/80 bg-white/10 px-3 py-1 text-[15px]"
                                        onClick={() => navigate('/point-history')}
                                    >
                                        적립/사용내역
                                    </button>
                                    <button
                                        onClick={() => navigate('/stores')}
                                        className="rounded-full border-2 border-white/80 bg-white/10 px-3 py-1 text-[15px]"
                                    >
                                        사용하러 가기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advertisement Image */}
                    <div>
                        <img src="/광고.png" alt="광고" className="w-full mb-[40px]" />
                    </div>
                </main>

                {/* 하단 탭 */}
                <BottomTap />

                {/* Departure Modal */}
                {showDepartureModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                        <div
                            className="bg-white w-full max-w-[420px] mx-auto rounded-t-2xl p-6"
                            style={{ maxHeight: '80vh', overflowY: 'auto' }}
                        >
                            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white py-2">
                                <h3 className="text-gray-800 text-lg font-medium">
                                    {searchType === 'departure' ? '어디서 출발하시나요?' : '어디로 가시나요?'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowDepartureModal(false);
                                        setSearchKeyword('');
                                        setSearchResults([]);
                                        setIsSearching(false);
                                    }}
                                    className="text-gray-500"
                                >
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M18 6L6 18"
                                            stroke="#666666"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M6 6L18 18"
                                            stroke="#666666"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                                    <span>
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                                                stroke="#CCCCCC"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M19 19L14.5 14.5"
                                                stroke="#CCCCCC"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        placeholder={searchType === 'departure' ? '출발지 검색' : '도착지 검색'}
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handlePlaceSearch();
                                            }
                                        }}
                                        className="bg-transparent text-gray-800 flex-1 outline-none"
                                    />
                                    {searchKeyword && (
                                        <button onClick={() => setSearchKeyword('')} className="text-gray-500">
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M18 6L6 18"
                                                    stroke="#666666"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M6 6L18 18"
                                                    stroke="#666666"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={handlePlaceSearch}
                                    disabled={!searchKeyword.trim() || !kakaoMapLoaded || isSearching}
                                    className={`w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center ${
                                        searchKeyword.trim() && kakaoMapLoaded && !isSearching
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-200 text-gray-400'
                                    }`}
                                >
                                    {isSearching ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            검색 중...
                                        </>
                                    ) : (
                                        '검색하기'
                                    )}
                                </button>

                                <div
                                    className="border border-gray-200 rounded-xl p-4 flex items-center gap-3"
                                    onClick={handleUseCurrentLocation}
                                >
                                    <span className="text-purple-600">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M10 10C11.3807 10 12.5 8.88071 12.5 7.5C12.5 6.11929 11.3807 5 10 5C8.61929 5 7.5 6.11929 7.5 7.5C7.5 8.88071 8.61929 10 10 10Z"
                                                stroke="#7C3AED"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M10 18.3333C14.1667 14.1667 18.3333 11.0811 18.3333 7.5C18.3333 3.91883 14.6421 1 10 1C5.35786 1 1.66667 3.91883 1.66667 7.5C1.66667 11.0811 5.83333 14.1667 10 18.3333Z"
                                                stroke="#7C3AED"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                    <span className="text-purple-600 font-medium">현재 위치로 찾기</span>
                                </div>

                                {/* 즐겨찾기 위치 목록 */}
                                {favoriteLocations.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-gray-500 text-sm mb-2 flex items-center gap-2">
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                    fill="#FFA500"
                                                    stroke="#FFA500"
                                                    strokeWidth="1"
                                                />
                                            </svg>
                                            자주 가는 장소
                                        </h4>
                                        <div className="space-y-2">
                                            {favoriteLocations.map((favorite) => (
                                                <div
                                                    key={favorite.id}
                                                    className="border border-gray-200 rounded-xl p-3 hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => handleSelectFavorite(favorite)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                                            <span className="text-orange-600 text-sm font-medium">
                                                                {favorite.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-800 text-sm">
                                                                {favorite.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {favorite.placeName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 검색 결과 목록 */}
                                {isSearching ? (
                                    <div className="py-8 text-center">
                                        <div className="inline-block mx-auto animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mb-2"></div>
                                        <p className="text-gray-500 text-sm">장소를 검색하고 있습니다...</p>
                                    </div>
                                ) : (
                                    <>
                                        {searchResults.length > 0 && (
                                            <div className="mt-3">
                                                <h4 className="text-gray-500 text-sm mb-2">검색 결과</h4>
                                                <div className="max-h-[40vh] overflow-y-auto">
                                                    {searchResults.map((place, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                                            onClick={() => handleSelectPlace(place)}
                                                        >
                                                            <div className="font-medium text-gray-800 mb-0.5">
                                                                {place.place_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {place.address_name}
                                                            </div>
                                                            {place.road_address_name && (
                                                                <div className="text-xs text-gray-400">
                                                                    {place.road_address_name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {searchKeyword.trim() && searchResults.length === 0 && !isSearching && (
                                            <div className="text-center py-6 mt-3">
                                                <svg
                                                    className="mx-auto h-12 w-12 text-gray-300"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <p className="text-gray-500 mt-2">검색 결과가 없습니다.</p>
                                                <p className="text-gray-400 text-sm">다른 키워드로 검색해보세요.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Time Setting Modal */}
            <TimeSettingModal
                isOpen={showTimeModal}
                onClose={() => setShowTimeModal(false)}
                onTimeSet={handleTimeSet}
                initialTime={arrivalTime || '12:00'}
            />
        </div>
    );
};

export default Home;
