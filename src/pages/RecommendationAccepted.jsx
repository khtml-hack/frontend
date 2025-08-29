import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { startTrip, arriveTrip } from '../api/tripApi';
import {
    getCurrentLocation,
    watchLocation,
    stopWatchingLocation,
    geocodeAddress,
    hasLeftOrigin,
    hasArrivedAtDestination,
} from '../utils/locationUtils';
import KakaoMap from '../components/map/KakaoMap';
import RewardModal from '../components/reward/RewardModal';
import BottomTap from '../components/BottomTap';

const RecommendationAccepted = () => {
    console.log('🚀 RecommendationAccepted 컴포넌트 렌더링 시작');

    const [currentStep, setCurrentStep] = useState('waiting'); // waiting, monitoring, traveling, completed
    const [timeLeft, setTimeLeft] = useState(0);
    const [tripId, setTripId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rewardData, setRewardData] = useState(null);
    const [showDepartureModal, setShowDepartureModal] = useState(false);
    const [showRewardModal, setShowRewardModal] = useState(false);

    // 위치 관련 상태
    const [originLocation, setOriginLocation] = useState(null);
    const [destinationLocation, setDestinationLocation] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const watchIdRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    console.log('📍 현재 location state:', location.state);

    // state가 없을 때를 대비한 기본값 설정
    const { selectedRecommendation, originalApiData, departure, destination } = location.state || {
        selectedRecommendation: { type: 'current' },
        departure: '동대문구청',
        destination: '한국외국어대학교 서울캠퍼스',
    };

    // 데이터가 없을 때 홈으로 리다이렉트하는 대신 기본값 사용
    useEffect(() => {
        if (!location.state) {
            console.warn('페이지 state가 없습니다. 기본값을 사용합니다.');
            // navigate('/home'); // 리다이렉트 비활성화
        }
    }, [location.state, navigate]);

    // 실제 표시할 주소 계산
    const getDisplayAddresses = () => {
        // 백엔드 API 응답 우선, 그 다음 전달받은 값, 마지막으로 기본값
        const from = originalApiData?.origin_address || departure || '동대문구청';
        const to = originalApiData?.destination_address || destination || '한국외국어대학교 서울캠퍼스';

        console.log('🏷️ 표시할 주소:', { from, to });
        console.log('🏷️ API 데이터 확인:', originalApiData);
        console.log('🏷️ originLocation 상태:', originLocation);
        console.log('🏷️ destinationLocation 상태:', destinationLocation);

        return { from, to };
    };

    // 컴포넌트 마운트시 출발지/목적지 좌표 가져오기
    useEffect(() => {
        const initializeLocations = async () => {
            try {
                console.log('🔍 API 데이터:', originalApiData);
                console.log('🔍 전달받은 주소:', { departure, destination });
                console.log('🔍 Location state 전체:', location.state);

                // 🆕 새로운 API 응답 구조 확인
                console.log('🎯 백엔드 좌표 확인:');
                console.log('  - origin_location:', originalApiData?.origin_location);
                console.log('  - destination_location:', originalApiData?.destination_location);

                // 🎯 백엔드에서 위도/경도가 제공된 경우 바로 사용
                if (
                    originalApiData?.origin_location?.lat &&
                    originalApiData?.origin_location?.lng &&
                    originalApiData?.destination_location?.lat &&
                    originalApiData?.destination_location?.lng
                ) {
                    const originCoords = {
                        lat: originalApiData.origin_location.lat,
                        lng: originalApiData.origin_location.lng,
                        address: originalApiData.origin_address || departure || '출발지',
                    };

                    const destCoords = {
                        lat: originalApiData.destination_location.lat,
                        lng: originalApiData.destination_location.lng,
                        address: originalApiData.destination_address || destination || '목적지',
                    };

                    console.log('🎯 백엔드에서 좌표 제공됨! 바로 사용:', { originCoords, destCoords });

                    setOriginLocation(originCoords);
                    setDestinationLocation(destCoords);
                    setLocationError(null);

                    console.log('✅ 백엔드 좌표로 위치 초기화 완료!');
                    return;
                }

                // 🔍 백엔드에서 좌표가 없으면 주소로 geocoding 수행
                const originAddress = originalApiData?.origin_address || departure;
                const destAddress = originalApiData?.destination_address || destination;

                console.log('🔍 사용할 주소들:', { originAddress, destAddress });

                if (!originAddress || !destAddress) {
                    console.error('❌ 출발지 또는 목적지 주소가 없습니다:', { originAddress, destAddress });
                    setLocationError('출발지 또는 목적지 정보가 없습니다.');
                    return;
                }

                console.log('📍 Geocoding 시작 - 출발지:', originAddress);
                console.log('📍 Geocoding 시작 - 목적지:', destAddress);

                // 주소 정규화 함수
                const normalizeAddress = (address) => {
                    if (!address) return address;

                    // 여러 검색 패턴 시도
                    const patterns = [
                        address, // 원본 주소
                        address.replace(/청$/, ''), // "동대문구청" -> "동대문구"
                        address.replace(/서울캠퍼스$/, ''), // "한국외국어대학교 서울캠퍼스" -> "한국외국어대학교"
                        address.replace(/대학교.*$/, '대학교'), // "한국외국어대학교 서울캠퍼스" -> "한국외국어대학교"
                        `서울 ${address}`, // 서울을 앞에 붙이기
                    ];

                    return patterns;
                };

                // 스마트 geocoding 함수
                const smartGeocode = async (address, type) => {
                    const patterns = normalizeAddress(address);
                    console.log(`🔍 ${type} 주소 패턴들:`, patterns);

                    for (let i = 0; i < patterns.length; i++) {
                        const pattern = patterns[i];
                        console.log(`🔍 ${type} 시도 ${i + 1}/${patterns.length}: "${pattern}"`);

                        try {
                            const result = await geocodeAddress(pattern);
                            console.log(`✅ ${type} geocoding 성공 (패턴 ${i + 1}):`, result);
                            return result;
                        } catch (error) {
                            console.warn(`⚠️ ${type} 패턴 ${i + 1} 실패:`, error.message);
                            // 마지막 패턴이 아니면 계속 시도
                            if (i < patterns.length - 1) continue;
                            throw error; // 모든 패턴 실패시 에러 throw
                        }
                    }
                };

                // 각각 개별적으로 스마트 geocoding 시도
                let originCoords = null;
                let destCoords = null;

                // 출발지 geocoding
                try {
                    originCoords = await smartGeocode(originAddress, '출발지');
                } catch (error) {
                    console.error('❌ 출발지 geocoding 모든 패턴 실패:', error);
                    setLocationError(`출발지 주소를 찾을 수 없습니다: ${originAddress}`);
                    return;
                }

                // 목적지 geocoding
                try {
                    destCoords = await smartGeocode(destAddress, '목적지');
                } catch (error) {
                    console.error('❌ 목적지 geocoding 모든 패턴 실패:', error);
                    setLocationError(`목적지 주소를 찾을 수 없습니다: ${destAddress}`);
                    return;
                }

                console.log('📍 최종 출발지 좌표:', originCoords);
                console.log('📍 최종 목적지 좌표:', destCoords);

                setOriginLocation(originCoords);
                setDestinationLocation(destCoords);
                setLocationError(null);

                // 상태 업데이트 후 확인
                setTimeout(() => {
                    console.log('📍 State 업데이트 후 originLocation:', originCoords);
                    console.log('📍 State 업데이트 후 destinationLocation:', destCoords);
                }, 100);

                console.log('✅ 위치 초기화 완료!');

                console.log('📍 최종 출발지 좌표:', originCoords);
                console.log('📍 최종 목적지 좌표:', destCoords);

                setOriginLocation(originCoords);
                setDestinationLocation(destCoords);
                setLocationError(null);

                // 상태 업데이트 후 확인
                setTimeout(() => {
                    console.log('📍 State 업데이트 후 originLocation:', originCoords);
                    console.log('📍 State 업데이트 후 destinationLocation:', destCoords);
                }, 100);

                console.log('✅ 위치 초기화 완료!');
            } catch (error) {
                console.error('❌ 전체 위치 초기화 실패:', error);
                setLocationError(`위치 정보를 가져올 수 없습니다: ${error.message}`);
            }
        };

        initializeLocations();
    }, [departure, destination, originalApiData]);

    // 출발 시간까지 남은 시간 계산
    useEffect(() => {
        console.log('⏰ 시간 계산 시작:', selectedRecommendation);
        console.log('⏰ selectedRecommendation.type:', selectedRecommendation?.type);
        console.log('⏰ selectedRecommendation.rawData:', selectedRecommendation?.rawData);

        if (selectedRecommendation?.type === 'current') {
            setTimeLeft(0); // 현재 출발은 즉시 가능
            console.log('⏰ 현재 출발 선택 - timeLeft = 0');
        } else if (selectedRecommendation?.type === 'optimal') {
            // optimal 타입인 경우 여러 경로 시도
            let departureTimeStr = null;

            // 1. rawData에서 optimal_departure_time 찾기
            if (selectedRecommendation?.rawData?.optimal_departure_time) {
                departureTimeStr = selectedRecommendation.rawData.optimal_departure_time;
                console.log('⏰ rawData에서 출발시간 찾음:', departureTimeStr);
            }
            // 2. optimalTime 속성에서 찾기 (가공된 데이터)
            else if (selectedRecommendation?.optimalTime) {
                departureTimeStr = selectedRecommendation.optimalTime;
                console.log('⏰ optimalTime에서 출발시간 찾음:', departureTimeStr);
            }

            if (departureTimeStr) {
                const now = new Date();
                const [hours, minutes] = departureTimeStr.split(':').map(Number);
                const departureTime = new Date();
                departureTime.setHours(hours, minutes, 0, 0);

                console.log('⏰ 현재 시간:', now);
                console.log('⏰ 출발 시간:', departureTime);

                // 출발 시간이 과거라면 다음날로 설정
                if (departureTime <= now) {
                    departureTime.setDate(departureTime.getDate() + 1);
                    console.log('⏰ 출발 시간이 과거여서 다음날로 설정:', departureTime);
                }

                const timeDiff = Math.floor((departureTime - now) / 1000);
                console.log('⏰ 시간 차이 (초):', timeDiff);
                setTimeLeft(Math.max(timeDiff, 0));
            } else {
                console.log('⏰ 출발 시간을 찾을 수 없음');
                console.log('⏰ selectedRecommendation 전체 구조:', JSON.stringify(selectedRecommendation, null, 2));
            }
        } else {
            console.log('⏰ 알 수 없는 타입:', selectedRecommendation?.type);
            console.log('⏰ selectedRecommendation 전체 구조:', JSON.stringify(selectedRecommendation, null, 2));
        }
    }, [selectedRecommendation]);

    // 타이머 업데이트 (최적 시간 선택시에만)
    useEffect(() => {
        if (selectedRecommendation?.type === 'current' || currentStep !== 'waiting') {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [selectedRecommendation?.type, currentStep]);

    // 위치 감시 시작 함수
    const startLocationMonitoring = async () => {
        try {
            // 현재 위치 가져오기
            const initialLocation = await getCurrentLocation();
            setCurrentLocation(initialLocation);
            console.log('초기 위치:', initialLocation);

            // 위치 변화 감시 시작
            const watchId = watchLocation(
                (newLocation) => {
                    setCurrentLocation(newLocation);
                    console.log('새 위치:', newLocation);

                    // 출발 감지 (출발지에서 50m 이상 벗어남)
                    if (
                        currentStep === 'monitoring' &&
                        originLocation &&
                        hasLeftOrigin(newLocation.lat, newLocation.lng, originLocation.lat, originLocation.lng, 50)
                    ) {
                        console.log('출발이 감지되었습니다!');
                        setShowDepartureModal(true);
                        setCurrentStep('traveling');

                        // 여행 시작 API 호출
                        handleStartTripAPI();
                    }

                    // 도착 감지 (목적지에서 100m 이내)
                    if (
                        currentStep === 'traveling' &&
                        destinationLocation &&
                        hasArrivedAtDestination(
                            newLocation.lat,
                            newLocation.lng,
                            destinationLocation.lat,
                            destinationLocation.lng,
                            100
                        )
                    ) {
                        console.log('목적지에 도착했습니다!');
                        handleArriveTrip();
                    }
                },
                (error) => {
                    console.error('위치 감시 오류:', error);
                    setLocationError('위치 정보를 가져올 수 없습니다.');
                }
            );

            watchIdRef.current = watchId;
        } catch (error) {
            console.error('위치 감시 시작 실패:', error);
            setLocationError('위치 서비스를 시작할 수 없습니다.');
        }
    };

    // 위치 감시 중지
    const stopLocationMonitoring = () => {
        if (watchIdRef.current) {
            stopWatchingLocation(watchIdRef.current);
            watchIdRef.current = null;
        }
    };

    // 컴포넌트 언마운트시 위치 감시 중지
    useEffect(() => {
        return () => {
            stopLocationMonitoring();
        };
    }, []);

    // 여행 시작 버튼 클릭 (위치 감시 시작)
    const handleStartLocationMonitoring = async () => {
        if (!originLocation || !destinationLocation) {
            alert('출발지와 목적지 정보를 확인하는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        // 위치 서비스가 지원되지 않는 경우 데모 모드로 진행
        if (!navigator.geolocation) {
            console.warn('위치 서비스가 지원되지 않습니다. 데모 모드로 진행합니다.');
            setCurrentStep('traveling');
            handleStartTripAPI();

            // 5초 후 도착 처리 (데모용)
            setTimeout(() => {
                handleArriveTrip();
            }, 5000);
            return;
        }

        setCurrentStep('monitoring');
        await startLocationMonitoring();
    };

    // 여행 시작 API 호출
    const handleStartTripAPI = async () => {
        if (!originalApiData?.recommendation_id) {
            console.warn('추천 ID가 없습니다.');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.warn('토큰이 없습니다.');
                return;
            }

            const tripResult = await startTrip(originalApiData.recommendation_id, token);
            setTripId(tripResult.id);
            console.log('여행 시작 API 호출 성공:', tripResult);
        } catch (error) {
            console.error('여행 시작 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 여행 완료 API 호출
    const handleArriveTrip = async (id = tripId, token = localStorage.getItem('accessToken')) => {
        if (!id || !token) {
            console.warn('여행 ID 또는 토큰이 없습니다.');
            return;
        }

        try {
            const arrivalResult = await arriveTrip(id, token);
            setRewardData(arrivalResult.completion_reward);
            setCurrentStep('completed');
            setShowRewardModal(true); // 보상 모달 표시
            stopLocationMonitoring(); // 위치 감시 중지
        } catch (error) {
            console.error('도착 처리 실패:', error);
            // 에러 발생시에도 완료 화면으로 이동 (데모용)
            setCurrentStep('completed');
            setShowRewardModal(true); // 보상 모달 표시
            stopLocationMonitoring(); // 위치 감시 중지
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
    };

    // 출발 가능 여부 (현재 출발은 항상 가능, 최적 시간은 5분 전부터)
    const canDepart = selectedRecommendation?.type === 'current' || timeLeft <= 5 * 60;

    // 예상 정보 계산
    const getEstimatedInfo = () => {
        const rawData = selectedRecommendation?.rawData;

        if (selectedRecommendation?.type === 'current') {
            return {
                arrivalTime: rawData?.arrivalTime || '16:16',
                duration: rawData?.duration || 20,
                congestion: rawData?.traffic?.text || '보통',
                congestionIcon: rawData?.traffic?.icon || '🟡',
                timeSaved: 0,
                reward: 0,
            };
        } else {
            return {
                arrivalTime: rawData?.arrivalTime || '16:31',
                duration: rawData?.duration || 26,
                congestion: rawData?.traffic?.text || '원활',
                congestionIcon: rawData?.traffic?.icon || '🟢',
                timeSaved: rawData?.timeSaved || 8,
                reward: rawData?.reward || 100,
            };
        }
    };

    const estimatedInfo = getEstimatedInfo();

    // 위치 감시 중 화면 (출발 대기 중)
    if (currentStep === 'monitoring') {
        const { from, to } = getDisplayAddresses();

        return (
            <div className="mobile-frame">
                {/* Kakao Map Background */}
                <div className="h-96 relative">
                    <KakaoMap
                        originLocation={originLocation}
                        destinationLocation={destinationLocation}
                        currentLocation={currentLocation}
                        currentStep={currentStep}
                    />
                    {/* 현재 위치 표시 오버레이 */}
                    {currentLocation && (
                        <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-2 rounded-lg text-xs">
                            📍 위치: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="px-8 -mt-32 relative z-10">
                    <h1 className="text-4xl font-extrabold peak-green tracking-tight mb-4">Peak _down</h1>

                    <div className="bg-white rounded-xl p-4 mb-6">
                        <div className="text-center text-gray-800 text-lg">
                            {from} → {to}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 text-center mb-6">
                        <div className="text-4xl mb-4">📍</div>
                        <h2 className="text-xl font-medium mb-2">출발 여부를 확인 중입니다</h2>
                        <p className="text-gray-600 leading-relaxed">
                            현재 위치에서 50m 이상 이동하시면
                            <br />
                            출발이 자동으로 감지됩니다.
                        </p>
                        {locationError && <p className="text-red-500 text-sm mt-2">{locationError}</p>}
                    </div>

                    <div className="bg-gray-100 border-2 border-green-500 rounded-2xl p-4 mb-6">
                        <p className="text-gray-800 text-sm text-center">
                            예상 도착시간: {estimatedInfo.arrivalTime} (소요시간: {estimatedInfo.duration}분)
                            <br />
                            예상 혼잡도: {estimatedInfo.congestionIcon} {estimatedInfo.congestion}
                            <br />
                            {estimatedInfo.timeSaved}분 절약 | 리워드 {estimatedInfo.reward}원 적립
                        </p>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={() => {
                                stopLocationMonitoring();
                                setCurrentStep('waiting');
                            }}
                            className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            위치 감시 중지
                        </button>
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="absolute bottom-20 left-0 right-0">
                    <div className="flex justify-between px-8 mb-4">
                        <button onClick={() => navigate('/time-recommendations')} className="text-black">
                            &lt; 다시 추천받기
                        </button>
                        <button onClick={() => navigate('/home')} className="text-black">
                            취소 x
                        </button>
                    </div>
                </div>

                <BottomTap />
            </div>
        );
    }

    // 여행 완료 화면
    if (currentStep === 'completed') {
        const { from, to } = getDisplayAddresses();

        return (
            <div className="mobile-frame">
                {/* Kakao Map Background */}
                <div className="h-96 relative">
                    <KakaoMap
                        originLocation={originLocation}
                        destinationLocation={destinationLocation}
                        currentLocation={currentLocation}
                        currentStep={currentStep}
                    />
                </div>

                {/* Content */}
                <div className="px-8 -mt-32 relative z-10">
                    <h1 className="text-4xl font-extrabold peak-green tracking-tight mb-4">Peak _down</h1>

                    <div className="bg-white rounded-xl p-4 mb-6">
                        <div className="text-center text-gray-800 text-lg">
                            {from} → {to}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 text-center mb-6">
                        <h2 className="text-2xl font-medium mb-4">
                            🎉
                            <br />
                            목적지에 도착했습니다!
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            💰 {rewardData?.total_reward || estimatedInfo.reward}P 적립! 💰
                            <br />
                            <br />
                            현명한 출발 덕분에,
                            <br />
                            도시 전체의 교통 흐름이 더 원활해졌습니다
                        </p>
                    </div>

                    <div className="bg-gray-100 border-2 border-green-500 rounded-2xl p-4 mb-6">
                        <p className="text-gray-800 text-sm text-center">
                            예상 도착시간: {estimatedInfo.arrivalTime} (소요시간: {estimatedInfo.duration}분)
                            <br />
                            예상 혼잡도: {estimatedInfo.congestionIcon} {estimatedInfo.congestion}
                            <br />
                            {estimatedInfo.timeSaved}분 절약 | 리워드 {estimatedInfo.reward}원 적립
                        </p>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <button onClick={() => navigate('/home')} className="btn-peak flex-1">
                            홈으로 돌아가기
                        </button>
                        <button
                            onClick={() => navigate('/point-history')}
                            className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium"
                        >
                            포인트 내역
                        </button>
                    </div>
                </div>

                {/* 보상 모달 */}
                <RewardModal
                    isVisible={showRewardModal}
                    onClose={() => setShowRewardModal(false)}
                    rewardAmount={rewardData?.total_reward || estimatedInfo.reward}
                    timeSaved={estimatedInfo.timeSaved}
                    onConfirm={() => {
                        setShowRewardModal(false);
                        navigate('/home');
                    }}
                />

                {/* Bottom Navigation */}
                <BottomTap />
            </div>
        );
    }

    // 여행 중 화면
    if (currentStep === 'traveling') {
        const { from, to } = getDisplayAddresses();

        return (
            <div className="mobile-frame">
                {/* Kakao Map Background */}
                <div className="h-96 relative">
                    <KakaoMap
                        originLocation={originLocation}
                        destinationLocation={destinationLocation}
                        currentLocation={currentLocation}
                        currentStep={currentStep}
                    />
                </div>

                {/* Content */}
                <div className="px-8 -mt-32 relative z-10">
                    <h1 className="text-4xl font-extrabold peak-green tracking-tight mb-4">Peak _down</h1>

                    <div className="bg-gray-200 rounded-xl p-4 mb-6">
                        <div className="text-center text-gray-800 text-lg">
                            {from} → {to}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 text-center mb-6">
                        <div className="text-4xl mb-4">🚗</div>
                        <h2 className="text-xl font-medium mb-2">여행이 진행중입니다</h2>
                        <p className="text-gray-600 leading-relaxed">
                            목적지에 도착하시면 리워드 {estimatedInfo.reward}원이 적립됩니다.
                            <br />
                            안전 운행하세요!
                        </p>
                    </div>

                    <div className="bg-gray-100 border-2 border-green-500 rounded-2xl p-4 mb-6">
                        <p className="text-gray-800 text-sm text-center">
                            예상 도착시간: {estimatedInfo.arrivalTime} (소요시간: {estimatedInfo.duration}분)
                            <br />
                            예상 혼잡도: {estimatedInfo.congestionIcon} {estimatedInfo.congestion}
                            <br />
                            {estimatedInfo.timeSaved}분 절약 | 리워드 {estimatedInfo.reward}원 적립
                        </p>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={() => handleArriveTrip()}
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            도착 완료 (데모용)
                        </button>
                    </div>
                </div>

                {/* 출발 감지 모달 */}
                {showDepartureModal && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 m-8 max-w-sm w-full text-center">
                            <button
                                onClick={() => setShowDepartureModal(false)}
                                className="absolute top-4 right-4 text-gray-500 text-xl"
                            >
                                ×
                            </button>
                            <h3 className="text-2xl font-medium mb-6">출발이 감지되었습니다!</h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                목적지에 도착하시면
                                <br />
                                리워드가 적립됩니다.
                            </p>
                            <button onClick={() => setShowDepartureModal(false)} className="btn-peak w-full">
                                확인
                            </button>
                        </div>
                    </div>
                )}

                {/* Bottom Navigation */}
                <div className="absolute bottom-20 left-0 right-0">
                    <div className="flex justify-between px-8 mb-4">
                        <button onClick={() => navigate('/home')} className="text-black">
                            &lt; 홈으로
                        </button>
                        <button onClick={() => navigate('/home')} className="text-black">
                            취소 x
                        </button>
                    </div>
                </div>

                <BottomTap />
            </div>
        );
    }

    // 대기 화면 (출발 전)
    const { from, to } = getDisplayAddresses();

    return (
        <div className="mobile-frame">
            {/* Header Background */}
            <div className="bg-gray-100 h-72 relative">
                <div className="px-8 pt-8">
                    <button onClick={() => navigate(-1)} className="text-gray-700 text-xl mb-4">
                        &lt;
                    </button>
                    <h1 className="text-4xl font-extrabold peak-green tracking-tight">Peak _down</h1>
                    <div className="mt-4">
                        <p className="text-black text-2xl font-semibold leading-tight">
                            {canDepart
                                ? `지금 출발하면 ${estimatedInfo.timeSaved}분을 아낄 수 있어요!`
                                : '탁월한 선택이에요! 가장 여유로운 길이 열릴 때까지 잠시만 기다려주세요.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-8 -mt-16">
                <div className="bg-white rounded-xl p-4 mb-6">
                    <div className="text-center text-gray-800 text-lg">
                        {from} → {to}
                    </div>
                </div>

                {/* 선택된 추천 정보 표시 */}
                <div className="bg-white rounded-2xl p-4 mb-6">
                    <h3 className="text-lg font-semibold mb-2">{selectedRecommendation?.title || '선택된 추천'}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                        {selectedRecommendation?.type === 'current'
                            ? '지금 바로 출발하여 현재 교통상황으로 이동합니다.'
                            : `${selectedRecommendation?.rawData?.optimalTime}에 출발하여 최적의 교통상황으로 이동합니다.`}
                    </p>
                    <div className="text-sm text-gray-500">
                        예상 소요시간: {estimatedInfo.duration}분 | 혼잡도: {estimatedInfo.congestionIcon}{' '}
                        {estimatedInfo.congestion} | 리워드: {estimatedInfo.reward}P
                    </div>
                </div>

                {/* 타이머 (최적 시간인 경우에만) */}
                {selectedRecommendation?.type !== 'current' && (
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-medium mb-2">출발까지 남은 시간</h3>
                        <div className="text-4xl font-medium tracking-wider text-green-500">{formatTime(timeLeft)}</div>
                        {!canDepart && (
                            <p className="text-gray-500 text-sm mt-4">*5분 전부터 출발하기 버튼이 활성화됩니다.</p>
                        )}
                    </div>
                )}

                {/* 출발 버튼 */}
                {canDepart ? (
                    <button
                        onClick={handleStartLocationMonitoring}
                        className="btn-peak w-full mb-4"
                        disabled={loading || !originLocation || !destinationLocation}
                    >
                        {loading
                            ? '준비 중...'
                            : !originLocation || !destinationLocation
                            ? '위치 정보 로딩 중...'
                            : selectedRecommendation?.type === 'current'
                            ? '지금 바로 출발하기'
                            : '최적 시간에 출발하기'}
                    </button>
                ) : (
                    <div className="bg-gray-100 border-2 border-green-500 rounded-2xl p-4 mb-4">
                        <p className="text-gray-800 text-sm text-center">
                            예상 도착시간: {estimatedInfo.arrivalTime} (소요시간: {estimatedInfo.duration}분)
                            <br />
                            예상 혼잡도: {estimatedInfo.congestionIcon} {estimatedInfo.congestion}
                            <br />
                            {estimatedInfo.timeSaved}분 절약 | {estimatedInfo.reward}포인트 획득
                        </p>
                    </div>
                )}

                {canDepart && (
                    <div className="mb-6">
                        <p className="text-gray-600 text-sm text-center mb-2">
                            *출발 버튼을 누른 후 50m 이상 이동하시면 출발이 감지됩니다.
                        </p>
                        {(!originLocation || !destinationLocation) && (
                            <p className="text-blue-500 text-sm text-center">📍 위치 정보를 가져오는 중입니다...</p>
                        )}
                        {locationError && <p className="text-red-500 text-sm text-center">⚠️ {locationError}</p>}
                    </div>
                )}

                {/* 제휴 상점 추천 (대기 시간이 있을 때) */}
                {!canDepart && (
                    <div className="bg-white border-2 border-green-500 rounded-2xl p-4 mb-6">
                        <p className="text-black text-sm mb-4">
                            ✨ 도로 위에서 낭비할 뻔한 시간을 아끼셨네요!
                            <br />
                            가까운 제휴 상점에 방문해보는 건 어떠세요?
                        </p>
                        <button
                            onClick={() => navigate('/partner-stores')}
                            className="bg-gray-800 text-white px-6 py-2 rounded-full text-sm"
                        >
                            제휴 상점 보기
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-20 left-0 right-0">
                <div className="flex justify-between px-8 mb-4">
                    <button onClick={() => navigate('/time-recommendations')} className="text-black">
                        &lt; 다시 추천받기
                    </button>
                    <button onClick={() => navigate('/home')} className="text-black">
                        취소 x
                    </button>
                </div>
            </div>

            <BottomTap />
        </div>
    );
};

console.log('✅ RecommendationAccepted 컴포넌트 정의 완료');

export default RecommendationAccepted;
