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
        const from = originalApiData?.origin_address || departure || '동대문구청';
        const to = originalApiData?.destination_address || destination || '한국외국어대학교 서울캠퍼스';
        return { from, to };
    };

    // 주소별 fallback 좌표 매핑
    const getLocationFallback = (address) => {
        const addressLower = address.toLowerCase();
        
        // 한국외국어대학교
        if (addressLower.includes('한국외국어대학교') || addressLower.includes('서울캠퍼스') || addressLower.includes('한국외대')) {
            return {
                lat: 37.5959,
                lng: 127.0587,
                address: '한국외국어대학교 서울캠퍼스',
            };
        }
        
        // 동대문구청
        if (addressLower.includes('동대문구청') || addressLower.includes('동대문')) {
            return {
                lat: 37.5745,
                lng: 127.0399,
                address: '동대문구청',
            };
        }
        
        // 강남역
        if (addressLower.includes('강남역') || addressLower.includes('강남')) {
            return {
                lat: 37.4979,
                lng: 127.0276,
                address: '강남역',
            };
        }
        
        // 홍대입구역
        if (addressLower.includes('홍대') || addressLower.includes('홍익대')) {
            return {
                lat: 37.5563,
                lng: 126.9222,
                address: '홍대입구역',
            };
        }
        
        // 명동
        if (addressLower.includes('명동')) {
            return {
                lat: 37.5636,
                lng: 126.9826,
                address: '명동',
            };
        }
        
        // 서울역
        if (addressLower.includes('서울역')) {
            return {
                lat: 37.5547,
                lng: 126.9706,
                address: '서울역',
            };
        }
        
        // 기본값 (서울 중심가)
        console.warn('알 수 없는 주소, 기본 좌표 사용:', address);
        return {
            lat: 37.5665,
            lng: 126.978,
            address: address,
        };
    };

    // 컴포넌트 마운트시 출발지/목적지 좌표 가져오기
    useEffect(() => {
        const initializeLocations = async () => {
            try {
                // 우선순위: API 응답 주소 > 전달받은 주소 > 기본값
                const originAddress = originalApiData?.origin_address || departure || '동대문구청';
                const destAddress =
                    originalApiData?.destination_address || destination || '한국외국어대학교 서울캠퍼스';

                console.log('🔍 사용할 주소들:', { originAddress, destAddress });
                console.log('🔍 API 데이터:', originalApiData);
                console.log('🔍 전달받은 주소:', { departure, destination });

                // 출발지와 목적지의 좌표를 가져옴
                const [originCoords, destCoords] = await Promise.all([
                    geocodeAddress(originAddress).catch(() => {
                        console.log('📍 출발지 geocoding 실패, fallback 사용:', originAddress);
                        // 다양한 주소에 대한 fallback 좌표
                        return getLocationFallback(originAddress);
                    }),
                    geocodeAddress(destAddress).catch(() => {
                        console.log('📍 목적지 geocoding 실패, fallback 사용:', destAddress);
                        // 다양한 주소에 대한 fallback 좌표
                        return getLocationFallback(destAddress);
                    }),
                ]);

                console.log('📍 최종 출발지 좌표:', originCoords);
                console.log('📍 최종 목적지 좌표:', destCoords);

                setOriginLocation(originCoords);
                setDestinationLocation(destCoords);

                // 상태 업데이트 후 확인
                setTimeout(() => {
                    console.log('📍 State 업데이트 후 originLocation:', originCoords);
                    console.log('📍 State 업데이트 후 destinationLocation:', destCoords);
                }, 100);

                console.log('출발지 좌표:', originCoords);
                console.log('목적지 좌표:', destCoords);
            } catch (error) {
                console.error('주소 좌표 변환 실패:', error);
                // 완전 실패시에도 주소별 fallback 사용
                const originAddress = originalApiData?.origin_address || departure || '동대문구청';
                const destAddress = originalApiData?.destination_address || destination || '한국외국어대학교 서울캠퍼스';
                
                const fallbackOrigin = getLocationFallback(originAddress);
                const fallbackDest = getLocationFallback(destAddress);

                console.log('📍 Complete Fallback 좌표 사용:', { fallbackOrigin, fallbackDest });

                setOriginLocation(fallbackOrigin);
                setDestinationLocation(fallbackDest);
                setLocationError('주소 검색에 실패하여 기본 위치를 사용합니다.');
            }
        };

        initializeLocations();
    }, [departure, destination, originalApiData]);

    // 출발 시간까지 남은 시간 계산
    useEffect(() => {
        if (selectedRecommendation?.type === 'current') {
            setTimeLeft(0); // 현재 출발은 즉시 가능
        } else if (selectedRecommendation?.rawData?.optimal_departure_time) {
            const now = new Date();
            const [hours, minutes] = selectedRecommendation.rawData.optimal_departure_time.split(':').map(Number);
            const departureTime = new Date();
            departureTime.setHours(hours, minutes, 0, 0);

            // 출발 시간이 과거라면 다음날로 설정
            if (departureTime <= now) {
                departureTime.setDate(departureTime.getDate() + 1);
            }

            const timeDiff = Math.floor((departureTime - now) / 1000);
            setTimeLeft(Math.max(timeDiff, 0));
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
