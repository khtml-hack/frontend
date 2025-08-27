import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKakaoMap, searchPlace, getCurrentLocation } from '../hooks/useKakaoMap';
import { createRoute } from '../api/routeApi';

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const [nickname, setNickname] = useState('김혼잡');
    const [locationPermission, setLocationPermission] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedPlaceType, setSelectedPlaceType] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [addresses, setAddresses] = useState({
        집: null,
        학교: null,
        직장: null,
    });
    const [selectedRoutes, setSelectedRoutes] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const navigate = useNavigate();
    const kakaoMapLoaded = useKakaoMap();

    // 카카오맵 로딩 상태 디버깅
    useEffect(() => {
        console.log('카카오맵 로드 상태:', kakaoMapLoaded);
        console.log('window.kakao 존재:', !!window.kakao);
        console.log('window.kakao.maps 존재:', !!(window.kakao && window.kakao.maps));
        console.log(
            'window.kakao.maps.services 존재:',
            !!(window.kakao && window.kakao.maps && window.kakao.maps.services)
        );
        console.log('API 키:', import.meta.env.VITE_KAKAO_MAP_API_KEY ? '설정됨' : '설정안됨');
    }, [kakaoMapLoaded]);

    const handleNextStep = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            navigate('/login');
        }
    };

    const handlePrevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const requestLocationPermission = () => {
        setShowLocationModal(true);
    };

    const handleLocationAllow = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('위치 권한 허용:', position.coords);
                    setLocationPermission(true);
                    setShowLocationModal(false);
                    handleNextStep();
                },
                (error) => {
                    console.error('위치 권한 오류:', error);
                    alert('위치 서비스를 사용할 수 없습니다. 브라우저 설정에서 위치 권한을 허용해주세요.');
                    setShowLocationModal(false);
                    setLocationPermission(false);
                }
            );
        } else {
            alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
            setShowLocationModal(false);
            setLocationPermission(false);
        }
    };

    const handleLocationDeny = () => {
        setShowLocationModal(false);
        setLocationPermission(false);
    };

    const getProgressWidth = () => {
        return `${(step / 4) * 100}%`;
    };

    const handleRouteToggle = (routeType) => {
        // 이미 등록된 경로인지 확인
        const isAlreadyRegistered = addresses[routeType] !== null;

        if (isAlreadyRegistered) {
            // 이미 등록된 경우 선택 해제
            setSelectedRoutes((prev) => prev.filter((type) => type !== routeType));
            setAddresses((prev) => ({ ...prev, [routeType]: null }));
        } else {
            // 새로운 등록인 경우 주소 등록 모달 열기
            setSelectedPlaceType(routeType);
            setShowAddressModal(true);
        }
    };

    const handleAddressModalClose = () => {
        setShowAddressModal(false);
        setSelectedPlaceType('');
        setSearchKeyword('');
        setSearchResults([]);
        setSelectedAddress(null);
    };

    const handlePlaceSearch = () => {
        console.log('검색 시작 - 키워드:', searchKeyword);
        console.log('카카오맵 로드됨:', kakaoMapLoaded);

        if (!searchKeyword.trim()) {
            console.log('검색어가 없음');
            return;
        }

        if (!kakaoMapLoaded) {
            console.log('카카오맵이 아직 로드되지 않음');
            alert('카카오맵을 로딩 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        setIsSearching(true);
        setSearchResults([]);

        console.log('카카오맵 API 검색 호출');
        searchPlace(
            searchKeyword,
            (results) => {
                console.log('검색 결과:', results);
                // 카카오맵 API 결과를 우리 형식에 맞게 변환
                const convertedResults = results.map((place) => ({
                    id: place.id,
                    name: place.place_name,
                    address: place.address_name,
                    roadAddress: place.road_address_name,
                    x: parseFloat(place.x), // 경도
                    y: parseFloat(place.y), // 위도
                    categoryName: place.category_name,
                    phone: place.phone,
                    placeUrl: place.place_url,
                }));
                console.log('변환된 결과:', convertedResults);
                setSearchResults(convertedResults);
                setIsSearching(false);
            },
            userLocation
        );
    };

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        setSearchResults([]);
        setSearchKeyword('');
    };

    const handleAddressRegister = async () => {
        if (!selectedAddress || !selectedPlaceType) {
            return;
        }

        try {
            setIsSearching(true);
            const token = localStorage.getItem('accessToken');

            // 백엔드 API 형식에 맞게 데이터 구성
            const routeData = {
                route_type: selectedPlaceType,
                address: selectedAddress.address,
                lat: Math.round(parseFloat(selectedAddress.y) * 1000000) / 1000000, // 소수점 6자리로 제한
                lng: Math.round(parseFloat(selectedAddress.x) * 1000000) / 1000000, // 소수점 6자리로 제한
            };

            console.log('등록할 경로 데이터:', routeData);

            if (token) {
                try {
                    // 백엔드에 저장
                    const savedRoute = await createRoute(routeData, token);
                    console.log('경로 저장 성공:', savedRoute);

                    // 저장된 정보로 로컬 상태 업데이트
                    const savedAddress = {
                        ...selectedAddress,
                        backendId: savedRoute.id,
                    };

                    setAddresses((prev) => ({ ...prev, [selectedPlaceType]: savedAddress }));
                } catch (apiError) {
                    console.error('백엔드 저장 오류:', apiError);
                    // 백엔드 저장 실패해도 로컬에는 저장
                    setAddresses((prev) => ({ ...prev, [selectedPlaceType]: selectedAddress }));
                    alert('서버 저장에 실패했지만 로컬에 임시 저장되었습니다.');
                }
            } else {
                // 토큰이 없으면 로컬에만 저장
                console.log('토큰이 없어 로컬에만 저장합니다.');
                setAddresses((prev) => ({ ...prev, [selectedPlaceType]: selectedAddress }));
            }

            // selectedRoutes에 추가
            setSelectedRoutes((prev) => {
                if (!prev.includes(selectedPlaceType)) {
                    return [...prev, selectedPlaceType];
                }
                return prev;
            });

            handleAddressModalClose();
        } catch (error) {
            console.error('주소 등록 오류:', error);
            alert('주소 등록 중 오류가 발생했습니다.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleCurrentLocation = async () => {
        try {
            setIsSearching(true);
            const location = await getCurrentLocation();
            setUserLocation(location);

            // 현재 위치 좌표를 주소로 변환 (역지오코딩)
            if (kakaoMapLoaded && window.kakao && window.kakao.maps) {
                const geocoder = new window.kakao.maps.services.Geocoder();

                geocoder.coord2Address(location.longitude, location.latitude, (result, status) => {
                    setIsSearching(false);
                    if (status === window.kakao.maps.services.Status.OK) {
                        const address = result[0].address;
                        const currentLocationData = {
                            id: 'current',
                            name: '현재 위치',
                            address: address.address_name,
                            roadAddress: result[0].road_address
                                ? result[0].road_address.address_name
                                : address.address_name,
                            x: location.longitude,
                            y: location.latitude,
                        };
                        setSelectedAddress(currentLocationData);
                    } else {
                        const currentLocationData = {
                            id: 'current',
                            name: '현재 위치',
                            address: `위도: ${location.latitude.toFixed(6)}, 경도: ${location.longitude.toFixed(6)}`,
                            x: location.longitude,
                            y: location.latitude,
                        };
                        setSelectedAddress(currentLocationData);
                    }
                });
            }
        } catch (error) {
            setIsSearching(false);
            console.error('현재 위치 가져오기 오류:', error);
            alert('현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
        }
    };

    const renderStep1 = () => (
        <div className="flex flex-col items-center justify-center h-full px-8 pt-20">
            <div className="text-6xl mb-8">👋</div>
            <h1 className="text-2xl font-medium text-center mb-8 text-black leading-tight">
                반가워요!
                <br />
                제가 뭐라고 불러드리면 좋을까요?
            </h1>
            <div className="w-full mb-4 relative text-[#7D7D7D]">
                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="input-peak text-left"
                    placeholder="닉네임을 입력해주세요"
                />
                <button className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400">✕</button>
            </div>
            <p className="text-gray-500 text-base mb-12 text-center">* 닉네임은 나중에 바꿀 수 있어요</p>
            <button onClick={handleNextStep} disabled={!nickname} className="btn-peak w-full ">
                다음
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="flex flex-col h-full px-8 relative">
            {/* Main Content */}
            <div
                className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 pt-20 ${
                    showLocationModal ? 'blur-sm' : ''
                }`}
            >
                <h1 className="text-2xl font-medium text-center mb-8 text-black">위치 정보 접근 권한 동의</h1>
                <div className="bg-white border rounded-xl p-6 mb-16 w-full" style={{ borderColor: '#c8c8c8' }}>
                    <p
                        className="text-base"
                        style={{
                            color: '#181818',
                            letterSpacing: '-0.8px',
                            lineHeight: '19.09375px',
                            fontWeight: 300,
                        }}
                    >
                        Peak-down은(는) 사용자님의 현재 위치를 기반으로 최적의 출발 시간과 이동 경로를 분석합니다.
                        <br />
                        원활한 서비스 이용을 위해 위치 정보 접근 권한이 필요합니다.
                        <br />
                        정확한 서비스 제공을 위한 위치 정보 접근이 필요합니다.
                        <br />
                        AI가 이문동의 실시간 교통 상황을 분석하고, 보상을 지급하기 위해 사용됩니다.
                        <br />
                        언제든지 설정에서 권한을 철회할 수 있습니다.
                    </p>
                </div>
            </div>

            {/* Bottom Section */}
            <div className={`pb-8 transition-all duration-300 ${showLocationModal ? 'blur-sm' : ''}`}>
                {/* Previous Step Button */}
                <div className="flex justify-start mb-4">
                    <button
                        onClick={handlePrevStep}
                        className="text-lg"
                        style={{
                            color: '#7d7d7d',
                            fontFamily: 'Pretendard',
                            fontWeight: 400,
                            fontSize: '17px',
                        }}
                    >
                        &lt; 이전단계
                    </button>
                </div>

                {/* Next Button */}
                <button
                    onClick={requestLocationPermission}
                    className="w-full text-white py-4 rounded-2xl text-xl font-medium"
                    style={{
                        backgroundColor: '#363636',
                    }}
                >
                    다음
                </button>
            </div>

            {/* Location Permission Modal */}
            {showLocationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-auto shadow-2xl">
                        {/* Map Icon */}
                        <div className="flex justify-center mb-6">
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center relative"
                                style={{ backgroundColor: '#E8F4FD' }}
                            >
                                {/* Map background */}
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center relative overflow-hidden"
                                    style={{ backgroundColor: '#007AFF' }}
                                >
                                    {/* Map grid pattern */}
                                    <div className="absolute inset-0 opacity-20">
                                        <div className="grid grid-cols-3 grid-rows-3 h-full w-full">
                                            {[...Array(9)].map((_, i) => (
                                                <div key={i} className="border border-white"></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Location pin */}
                                    <div className="relative z-10">
                                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mb-1">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        </div>
                                        <div className="w-1 h-2 bg-white mx-auto"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-medium text-center mb-3 text-black leading-tight px-4">
                            "peak-down.co.kr"이(가) 사용자의 위치 정보를 사용하려고 합니다.
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed px-2">
                            귀하의 위치는 지도에 표시되고 경로, 이동 시간 및 주변 검색에 사용됩니다.
                        </p>

                        {/* Buttons */}
                        <div className="space-y-2">
                            <button
                                onClick={handleLocationAllow}
                                className="w-full py-3 rounded-xl font-medium text-white transition-all duration-200"
                                style={{
                                    backgroundColor: '#007AFF',
                                    fontSize: '16px',
                                }}
                            >
                                위치 허용
                            </button>
                            <button
                                onClick={handleLocationDeny}
                                className="w-full py-3 rounded-xl font-medium text-black transition-all duration-200"
                                style={{
                                    backgroundColor: '#F2F2F7',
                                    fontSize: '16px',
                                }}
                            >
                                허용 안함
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div className="flex flex-col items-center justify-center h-full px-8 pt-20">
            <h1 className="text-2xl font-medium text-center mb-12 text-black leading-tight">
                매일 다니는 경로를 등록하고
                <br />
                간편하게 시간 추천을 받아보세요!
            </h1>
            <div className="flex gap-2 mb-20 w-full">
                <button
                    onClick={() => handleRouteToggle('집')}
                    className={`rounded-2xl py-6 px-4 flex-1 text-center transition-all duration-200 ${
                        addresses.집 !== null ? 'bg-green-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                >
                    <div className="text-2xl mb-2">🏡</div>
                    <div className="text-sm">집</div>
                    <div className="text-xs mt-2 leading-tight">
                        {addresses.집 !== null ? '등록 완료!' : '+ 주소 검색'}
                    </div>
                </button>
                <button
                    onClick={() => handleRouteToggle('학교')}
                    className={`rounded-2xl py-6 px-4 flex-1 text-center transition-all duration-200 ${
                        addresses.학교 !== null ? 'bg-green-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                >
                    <div className="text-2xl mb-2">🏫</div>
                    <div className="text-sm">학교</div>
                    <div className="text-xs mt-2 leading-tight">
                        {addresses.학교 !== null ? '등록 완료!' : '+ 주소 검색'}
                    </div>
                </button>
                <button
                    onClick={() => handleRouteToggle('직장')}
                    className={`rounded-2xl py-6 px-4 flex-1 text-center transition-all duration-200 ${
                        addresses.직장 !== null ? 'bg-green-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                >
                    <div className="text-2xl mb-2">🏢</div>
                    <div className="text-sm">직장</div>
                    <div className="text-xs mt-2 leading-tight">
                        {addresses.직장 !== null ? '등록 완료!' : '+ 주소 검색'}
                    </div>
                </button>
            </div>

            {/* Bottom Navigation */}
            <div className="w-full">
                {/* Previous and Skip buttons */}
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={handlePrevStep}
                        className="text-gray-500 text-lg"
                        style={{
                            color: '#7d7d7d',
                            fontFamily: 'Pretendard',
                            fontWeight: 400,
                            fontSize: '17px',
                        }}
                    >
                        &lt; 이전단계
                    </button>
                    <button
                        onClick={handleNextStep}
                        className="text-gray-500 text-lg"
                        style={{
                            color: '#7d7d7d',
                            fontFamily: 'Pretendard',
                            fontWeight: 400,
                            fontSize: '17px',
                        }}
                    >
                        건너뛰기 &gt;
                    </button>
                </div>

                {/* Next button */}
                <button
                    onClick={handleNextStep}
                    disabled={selectedRoutes.length === 0}
                    className={`w-full py-4 rounded-2xl text-xl font-medium transition-all duration-200 ${
                        selectedRoutes.length > 0
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    다음
                </button>
            </div>

            {/* Address Registration Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white text-lg font-medium">{selectedPlaceType} 주소 등록</h3>
                            <button onClick={handleAddressModalClose} className="text-white text-xl">
                                ✕
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="mb-4">
                            <div className="bg-gray-700 rounded-xl p-4 flex items-center gap-3 mb-3">
                                <svg width="17" height="18" viewBox="0 0 17 18" fill="none">
                                    <path
                                        d="M7.5 13.5C10.8137 13.5 13.5 10.8137 13.5 7.5C13.5 4.18629 10.8137 1.5 7.5 1.5C4.18629 1.5 1.5 4.18629 1.5 7.5C1.5 10.8137 4.18629 13.5 7.5 13.5Z"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M16.5 16.5L12.5 12.5"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="주소로 검색"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handlePlaceSearch()}
                                    className="bg-transparent text-white flex-1 outline-none placeholder-gray-400"
                                />
                            </div>

                            <button
                                onClick={handleCurrentLocation}
                                className="w-full bg-gray-700 text-green-400 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                            >
                                📍 현재 위치로 찾기
                            </button>
                        </div>

                        {/* Selected Address Display */}
                        {selectedAddress && (
                            <div className="mb-4 p-4 bg-gray-700 rounded-xl">
                                <h4 className="text-white font-medium mb-1">{selectedAddress.name}</h4>
                                <p className="text-gray-300 text-sm">{selectedAddress.address}</p>
                            </div>
                        )}

                        {/* Loading State */}
                        {isSearching && (
                            <div className="mb-4 text-center py-4">
                                <div className="inline-block mx-auto animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-400 mb-2"></div>
                                <p className="text-gray-400 text-sm">검색 중...</p>
                            </div>
                        )}

                        {/* Search Results */}
                        {!isSearching && searchResults.length > 0 && (
                            <div className="mb-4 max-h-48 overflow-y-auto">
                                {searchResults.map((result) => (
                                    <div
                                        key={result.id}
                                        onClick={() => handleAddressSelect(result)}
                                        className="p-3 border-b border-gray-600 hover:bg-gray-700 cursor-pointer"
                                    >
                                        <div className="text-white font-medium">{result.name}</div>
                                        <div className="text-gray-300 text-sm">{result.address}</div>
                                        {result.roadAddress && result.roadAddress !== result.address && (
                                            <div className="text-gray-400 text-xs">{result.roadAddress}</div>
                                        )}
                                        <button className="text-gray-400 text-xs mt-1 px-3 py-1 bg-gray-600 rounded-full">
                                            선택
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* No Results */}
                        {!isSearching && searchKeyword.trim() && searchResults.length === 0 && (
                            <div className="mb-4 text-center py-4">
                                <p className="text-gray-400 text-sm">검색 결과가 없습니다.</p>
                                <p className="text-gray-500 text-xs">다른 키워드로 검색해보세요.</p>
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={selectedAddress ? handleAddressRegister : handlePlaceSearch}
                            disabled={isSearching || (!selectedAddress && !searchKeyword.trim()) || !kakaoMapLoaded}
                            className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                                isSearching
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : selectedAddress
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : searchKeyword.trim() && kakaoMapLoaded
                                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {isSearching
                                ? '처리 중...'
                                : selectedAddress
                                ? '등록하기'
                                : kakaoMapLoaded
                                ? '검색하기'
                                : '카카오맵 로딩 중...'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep4 = () => (
        <div className="flex flex-col items-center justify-center h-full px-8 pt-20">
            <h1 className="text-2xl font-medium text-center mb-8 text-black">모든 준비가 끝났어요!</h1>
            <p
                className="text-gray-500 text-base text-center leading-relaxed mb-28"
                style={{ fontSize: '15px', lineHeight: '24px' }}
            >
                {nickname}님을 위한 맞춤 설정이 완료되었습니다.
                <br />
                Peak-down과 함께 막히는 길 위,
                <br />
                잃었던 시간을 되찾아보세요.
            </p>
            <button
                onClick={() => navigate('/login')}
                className="w-full py-4 rounded-2xl text-xl font-medium"
                style={{ backgroundColor: '#363636', color: '#ffffff' }}
            >
                Peak-down 시작하기
            </button>
        </div>
    );

    return (
        <div className="mobile-frame">
            {/* Progress Line */}
            <div className="progress-line">
                <div
                    className="h-full transition-all duration-300"
                    style={{
                        width: getProgressWidth(),
                        backgroundColor: '#32b544',
                    }}
                ></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}

                {/* Previous Step Button - Only show for steps other than 2, 3, and 4 */}
                {step > 1 && step !== 2 && step !== 3 && step !== 4 && (
                    <button
                        onClick={handlePrevStep}
                        className="absolute left-8 text-lg"
                        style={{
                            bottom: '60px',
                            color: '#7d7d7d',
                            fontFamily: 'Pretendard',
                            fontWeight: 400,
                            fontSize: '17px',
                        }}
                    >
                        &lt; 이전단계
                    </button>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
