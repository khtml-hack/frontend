import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { startTrip, arriveTrip } from '../api/tripApi';

const RecommendationAccepted = () => {
    const [currentStep, setCurrentStep] = useState('waiting'); // waiting, traveling, completed
    const [timeLeft, setTimeLeft] = useState(0);
    const [tripId, setTripId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rewardData, setRewardData] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const { selectedRecommendation, originalApiData, departure, destination } = location.state || {};

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

    // 여행 시작 API 호출
    const handleStartTrip = async () => {
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
            setCurrentStep('traveling');

            // 데모용: 5초 후 자동으로 도착 처리
            setTimeout(() => {
                handleArriveTrip(tripResult.id, token);
            }, 5000);
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
        } catch (error) {
            console.error('도착 처리 실패:', error);
            // 에러 발생시에도 완료 화면으로 이동 (데모용)
            setCurrentStep('completed');
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

    // 여행 완료 화면
    if (currentStep === 'completed') {
        return (
            <div className="mobile-frame">
                {/* Map Background */}
                <div className="h-96 bg-gray-200 relative">
                    <div className="absolute inset-0 bg-gray-300 opacity-50"></div>
                </div>

                {/* Content */}
                <div className="px-8 -mt-32 relative z-10">
                    <h1 className="text-4xl font-extrabold peak-green tracking-tight mb-4">Peak _down</h1>

                    <div className="bg-white rounded-xl p-4 mb-6">
                        <div className="text-center text-gray-800 text-lg">
                            {departure || '출발지'} → {destination || '도착지'}
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

                {/* Bottom Navigation */}
                <div className="absolute bottom-20 left-0 right-0">
                    <div className="border-t border-gray-300 pt-4">
                        <div className="flex justify-center">
                            <div className="flex gap-12">
                                <button onClick={() => navigate('/home')} className="text-black text-2xl font-medium">
                                    홈
                                </button>
                                <button
                                    onClick={() => navigate('/partner-stores')}
                                    className="text-black text-2xl font-medium"
                                >
                                    결제매장
                                </button>
                                <button
                                    onClick={() => navigate('/my-page')}
                                    className="text-black text-2xl font-medium"
                                >
                                    마이페이지
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 여행 중 화면
    if (currentStep === 'traveling') {
        return (
            <div className="mobile-frame">
                {/* Map Background */}
                <div className="h-96 bg-gray-200 relative">
                    <div className="absolute inset-0 bg-gray-300 opacity-50"></div>
                </div>

                {/* Content */}
                <div className="px-8 -mt-32 relative z-10">
                    <h1 className="text-4xl font-extrabold peak-green tracking-tight mb-4">Peak _down</h1>

                    <div className="bg-gray-200 rounded-xl p-4 mb-6">
                        <div className="text-center text-gray-800 text-lg">
                            {departure || '출발지'} → {destination || '도착지'}
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
                    <div className="border-t border-gray-300 pt-4">
                        <div className="flex justify-center">
                            <div className="flex gap-12">
                                <button onClick={() => navigate('/home')} className="text-black text-2xl font-medium">
                                    홈
                                </button>
                                <button
                                    onClick={() => navigate('/partner-stores')}
                                    className="text-black text-2xl font-medium"
                                >
                                    결제매장
                                </button>
                                <button
                                    onClick={() => navigate('/my-page')}
                                    className="text-black text-2xl font-medium"
                                >
                                    마이페이지
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 대기 화면 (출발 전)
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
                        {departure || '출발지'} → {destination || '도착지'}
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
                    <button onClick={handleStartTrip} className="btn-peak w-full mb-4" disabled={loading}>
                        {loading
                            ? '출발 처리 중...'
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
                    <p className="text-gray-600 text-sm text-center mb-6">*목적지에 도착 후 리워드가 적립됩니다.</p>
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
                <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-center">
                        <div className="flex gap-12">
                            <button onClick={() => navigate('/home')} className="text-black text-2xl font-medium">
                                홈
                            </button>
                            <button
                                onClick={() => navigate('/partner-stores')}
                                className="text-black text-2xl font-medium"
                            >
                                결제매장
                            </button>
                            <button onClick={() => navigate('/my-page')} className="text-black text-2xl font-medium">
                                마이페이지
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendationAccepted;
