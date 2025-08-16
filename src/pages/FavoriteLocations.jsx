import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKakaoMap, searchPlace, getCurrentLocation } from '../hooks/useKakaoMap';
import { getRoutes, createRoute, deleteRoute } from '../api/routeApi';

const FavoriteLocations = () => {
    const navigate = useNavigate();
    const [favoriteLocations, setFavoriteLocations] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const kakaoMapLoaded = useKakaoMap();

    // 즐겨찾기 위치 로드
    useEffect(() => {
        loadFavoriteLocations();

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

    // 백엔드에서 즐겨찾기 위치 로드
    const loadFavoriteLocations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            if (!token) {
                // 토큰이 없으면 로컬 스토리지에서 로드
                const saved = localStorage.getItem('favoriteLocations');
                if (saved) {
                    setFavoriteLocations(JSON.parse(saved));
                }
                return;
            }

            const routes = await getRoutes(token);

            // API 응답을 기존 형식에 맞게 변환
            const convertedRoutes = routes.map((route) => ({
                id: route.id,
                name: route.route_type,
                placeName: route.address,
                address: route.address,
                roadAddress: route.address,
                x: route.lng,
                y: route.lat,
                backendId: route.id, // 백엔드 ID 저장
            }));

            setFavoriteLocations(convertedRoutes);

            // 로컬 스토리지에도 백업 저장
            localStorage.setItem('favoriteLocations', JSON.stringify(convertedRoutes));
        } catch (error) {
            console.error('즐겨찾기 위치 로드 오류:', error);
            setError('저장된 경로를 불러오는데 실패했습니다.');

            // 백엔드 오류 시 로컬 스토리지에서 로드
            const saved = localStorage.getItem('favoriteLocations');
            if (saved) {
                try {
                    setFavoriteLocations(JSON.parse(saved));
                } catch (e) {
                    console.error('로컬 스토리지 로드 오류:', e);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // 즐겨찾기 위치 저장 (삭제)
    const saveFavoriteLocations = (locations) => {
        try {
            localStorage.setItem('favoriteLocations', JSON.stringify(locations));
            setFavoriteLocations(locations);
        } catch (e) {
            console.error('즐겨찾기 위치 저장 오류:', e);
        }
    };

    // 장소 검색
    const handlePlaceSearch = () => {
        if (!searchKeyword.trim() || !kakaoMapLoaded) return;

        setIsSearching(true);
        setSearchResults([]);

        searchPlace(
            searchKeyword,
            (results) => {
                setSearchResults(results);
                setIsSearching(false);
            },
            userLocation
        ); // 현재 위치를 전달하여 거리순 정렬
    };

    // 장소 선택
    const handleSelectPlace = (place) => {
        setSelectedLocation(place);
        setSearchKeyword('');
        setSearchResults([]);
    };

    // 즐겨찾기 위치 추가
    const handleAddFavorite = async () => {
        if (!newLocationName.trim() || !selectedLocation) return;

        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('accessToken');

            // 좌표 값 검증 및 정밀도 조정
            const lat = parseFloat(selectedLocation.y);
            const lng = parseFloat(selectedLocation.x);

            if (isNaN(lat) || isNaN(lng)) {
                throw new Error('유효하지 않은 좌표 정보입니다.');
            }

            // 좌표값을 소수점 6자리로 반올림 (GPS 정밀도 약 0.1미터, 9자리 제한 준수)
            const roundedLat = Number(lat.toFixed(6));
            const roundedLng = Number(lng.toFixed(6));

            // 백엔드 API 형식에 맞게 데이터 구성
            const routeData = {
                route_type: newLocationName.trim(),
                address: selectedLocation.place_name || selectedLocation.address_name || '주소 정보 없음',
                lat: roundedLat,
                lng: roundedLng,
            };

            console.log('Sending route data:', routeData);
            console.log('Original coordinates:', { lat, lng });
            console.log('Rounded coordinates:', { lat: roundedLat, lng: roundedLng });

            if (token) {
                // 토큰이 있으면 백엔드에 저장
                const savedRoute = await createRoute(routeData, token);

                // 새로운 즐겨찾기 위치 객체 생성
                const newFavorite = {
                    id: savedRoute.id,
                    name: savedRoute.route_type,
                    placeName: savedRoute.address,
                    address: savedRoute.address,
                    roadAddress: savedRoute.address,
                    x: savedRoute.lng,
                    y: savedRoute.lat,
                    backendId: savedRoute.id,
                };

                const updated = [...favoriteLocations, newFavorite];
                setFavoriteLocations(updated);

                // 로컬 스토리지에도 백업
                localStorage.setItem('favoriteLocations', JSON.stringify(updated));
            } else {
                throw new Error('로그인이 필요합니다.');
            }

            // 초기화
            setNewLocationName('');
            setSelectedLocation(null);
            setShowAddModal(false);
        } catch (error) {
            console.error('즐겨찾기 위치 추가 오류:', error);
            setError(error.message || '경로 저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // 즐겨찾기 위치 삭제
    const handleDeleteFavorite = async (id) => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('accessToken');

            // 삭제할 위치 찾기
            const locationToDelete = favoriteLocations.find((loc) => loc.id === id);

            if (token && locationToDelete?.backendId) {
                // 백엔드에서 삭제
                await deleteRoute(locationToDelete.backendId, token);
            }

            // 로컬 상태에서 삭제
            const updated = favoriteLocations.filter((loc) => loc.id !== id);
            setFavoriteLocations(updated);

            // 로컬 스토리지 업데이트
            localStorage.setItem('favoriteLocations', JSON.stringify(updated));
        } catch (error) {
            console.error('즐겨찾기 위치 삭제 오류:', error);
            setError('경로 삭제에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // 현재 위치 가져오기
    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    if (kakaoMapLoaded && window.kakao && window.kakao.maps) {
                        const geocoder = new window.kakao.maps.services.Geocoder();
                        geocoder.coord2Address(longitude, latitude, (result, status) => {
                            if (status === window.kakao.maps.services.Status.OK) {
                                const address = result[0].address;
                                const currentLocation = {
                                    place_name: address.address_name || '현재 위치',
                                    address_name: address.address_name,
                                    road_address_name: address.road_address_name,
                                    x: longitude,
                                    y: latitude,
                                };
                                handleSelectPlace(currentLocation);
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
            <div className="mx-auto w-full max-w-[420px] min-h-[100svh] flex flex-col bg-white text-black">
                {/* Header */}
                <header className="flex items-center justify-between p-5 border-b">
                    <button onClick={() => navigate(-1)} className="text-gray-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M15 18L9 12L15 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <h1 className="text-lg font-semibold">자주가는 경로 관리</h1>
                    <button onClick={() => setShowAddModal(true)} className="text-purple-600 font-medium">
                        추가
                    </button>
                </header>

                {/* Content */}
                <main className="flex-1 p-5">
                    {/* 에러 메시지 */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                            {error}
                            <button
                                onClick={() => setError('')}
                                className="float-right text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* 로딩 상태 */}
                    {loading && (
                        <div className="text-center py-8">
                            <div className="inline-block mx-auto animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mb-2"></div>
                            <p className="text-gray-500 text-sm">처리 중...</p>
                        </div>
                    )}

                    {favoriteLocations.length === 0 && !loading ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📍</div>
                            <h3 className="text-lg font-medium mb-2">자주 가는 장소가 없습니다</h3>
                            <p className="text-gray-500 mb-6">집, 회사, 학교 등 자주 가는 장소를 등록해보세요.</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                disabled={loading}
                                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50"
                            >
                                첫 번째 장소 추가하기
                            </button>
                        </div>
                    ) : favoriteLocations.length > 0 ? (
                        <div className="space-y-3">
                            {favoriteLocations.map((location) => (
                                <div key={location.id} className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1">{location.name}</h3>
                                            <p className="text-gray-700 text-sm mb-1">{location.placeName}</p>
                                            <p className="text-gray-500 text-xs">{location.address}</p>
                                            {location.roadAddress && (
                                                <p className="text-gray-400 text-xs">{location.roadAddress}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteFavorite(location.id)}
                                            className="text-red-500 p-2"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M3 6H5H21"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </main>

                {/* Add Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                        <div
                            className="bg-white w-full max-w-[420px] mx-auto rounded-t-2xl p-6"
                            style={{ maxHeight: '80vh', overflowY: 'auto' }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">자주 가는 장소 추가</h3>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setNewLocationName('');
                                        setSelectedLocation(null);
                                        setSearchKeyword('');
                                        setSearchResults([]);
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
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M6 6L18 18"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* 이름 입력 */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">장소 이름</label>
                                    <input
                                        type="text"
                                        placeholder="예: 집, 회사, 학교"
                                        value={newLocationName}
                                        onChange={(e) => setNewLocationName(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
                                    />
                                </div>

                                {/* 위치 검색 */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">위치 검색</label>
                                    <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3 mb-3">
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
                                        <input
                                            type="text"
                                            placeholder="주소나 장소명 검색"
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

                                    <div className="flex gap-2 mb-4">
                                        <button
                                            onClick={handlePlaceSearch}
                                            disabled={!searchKeyword.trim() || !kakaoMapLoaded || isSearching}
                                            className={`flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center ${
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
                                        <button
                                            onClick={handleUseCurrentLocation}
                                            className="px-4 py-2.5 border border-purple-600 text-purple-600 rounded-xl font-medium text-sm"
                                        >
                                            현재 위치
                                        </button>
                                    </div>

                                    {/* 선택된 위치 표시 */}
                                    {selectedLocation && (
                                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4">
                                            <h4 className="font-medium text-purple-800 mb-1">선택된 위치</h4>
                                            <p className="text-purple-700 text-sm">{selectedLocation.place_name}</p>
                                            <p className="text-purple-600 text-xs">{selectedLocation.address_name}</p>
                                        </div>
                                    )}

                                    {/* 검색 결과 */}
                                    {isSearching ? (
                                        <div className="py-8 text-center">
                                            <div className="inline-block mx-auto animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mb-2"></div>
                                            <p className="text-gray-500 text-sm">장소를 검색하고 있습니다...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {searchResults.length > 0 && (
                                                <div className="max-h-[30vh] overflow-y-auto">
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
                                            )}

                                            {searchKeyword.trim() && searchResults.length === 0 && !isSearching && (
                                                <div className="text-center py-6">
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

                                {/* 저장 버튼 */}
                                <button
                                    onClick={handleAddFavorite}
                                    disabled={!newLocationName.trim() || !selectedLocation || loading}
                                    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center ${
                                        newLocationName.trim() && selectedLocation && !loading
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-200 text-gray-400'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                                            저장 중...
                                        </>
                                    ) : (
                                        '저장하기'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoriteLocations;
