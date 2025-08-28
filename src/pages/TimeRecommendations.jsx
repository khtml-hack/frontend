import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TimeRecommendations = () => {
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const [recommendationData, setRecommendationData] = useState(null);
    const [nickname, setNickname] = useState('김혼잡');

    const navigate = useNavigate();

    useEffect(() => {
        // 로컬 스토리지에서 데이터 가져오기
        const savedDeparture = localStorage.getItem('departure') || '출발지';
        const savedDestination = localStorage.getItem('destination') || '도착지';
        const savedNickname = localStorage.getItem('nickname') || '김혼잡';
        const savedRecommendation = localStorage.getItem('tripRecommendation');

        setDeparture(savedDeparture);
        setDestination(savedDestination);
        setNickname(savedNickname);

        if (savedRecommendation) {
            try {
                const recommendation = JSON.parse(savedRecommendation);
                console.log('🔍 받은 추천 데이터 전체:', recommendation);
                console.log('🔍 UI 데이터:', recommendation.ui);
                console.log(
                    '🔍 출발지/도착지:',
                    recommendation.origin_address,
                    '→',
                    recommendation.destination_address
                );
                setRecommendationData(recommendation);
            } catch (e) {
                console.error('추천 데이터 파싱 오류:', e);
            }
        }
    }, []);

    useEffect(() => {
        if (recommendationData && recommendationData.ui) {
            console.log('current:', recommendationData.ui.current);
            recommendationData.ui.options?.forEach((opt, idx) => {
                console.log(`option[${idx}]:`, opt);
            });
        }
    }, [recommendationData]);

    const handleSelectRecommendation = (recommendation) => {
        // 선택된 추천과 전체 추천 데이터를 함께 전달
        const selectionData = {
            selectedRecommendation: recommendation,
            originalApiData: recommendationData,
            departure,
            destination,
        };

        navigate('/recommendation-accepted', { state: selectionData });
    };

    // 혼잡도 레벨에 따른 아이콘과 텍스트 반환
    const getTrafficInfo = (level) => {
        if (!level || level <= 1.5) return { icon: '🟢', text: '원활' };
        if (level <= 2.5) return { icon: '🟡', text: '보통' };
        if (level <= 3.5) return { icon: '🟠', text: '혼잡' };
        return { icon: '🔴', text: '매우혼잡' };
    };

    // API 데이터에서 현재 출발과 최적 시간만 추출
    const getCurrentAndOptimal = () => {
        const current = recommendationData?.ui?.current;
        const optimal = recommendationData?.ui?.options?.[0]; // 첫 번째 옵션이 최적

        const currentTraffic = getTrafficInfo(current?.congestion_level);
        const optimalTraffic = getTrafficInfo(optimal?.congestion_level);

        return {
            current: current
                ? {
                      departureTime: current.departure_time || '15:56',
                      arrivalTime: current.arrival_time || '16:16',
                      duration: current.duration_min || 20,
                      traffic: currentTraffic,
                      rawData: current,
                  }
                : null,
            optimal: optimal
                ? {
                      title: optimal.title || '최적 시간',
                      departText: optimal.depart_in_text || '19분 뒤 출발',
                      optimalTime: optimal.optimal_departure_time || '16:16',
                      arrivalTime: optimal.arrival_time || '16:33',
                      duration: optimal.expected_duration_min || 17,
                      traffic: optimalTraffic,
                      timeSaved: optimal.time_saved_min || 3,
                      reward: optimal.reward_amount || 30,
                      rawData: optimal,
                  }
                : null,
        };
    };

    const { current, optimal } = getCurrentAndOptimal();

    return (
        <div className="mobile-frame bg-white min-h-screen">
            {/* Header */}
            <div className="bg-gray-100 px-6 pt-12 pb-6">
                <button onClick={() => navigate(-1)} className="text-gray-700 text-xl mb-4">
                    &lt;
                </button>
                <h1 className="text-3xl font-bold text-green-500 mb-2">Peak_down</h1>
                <h2 className="text-xl font-semibold text-gray-800">AI 최적 시간 분석 완료!</h2>
            </div>

            {/* Route Display */}
            <div className="px-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="text-center text-gray-800 text-base">
                        {recommendationData?.origin_address || departure} →{' '}
                        {recommendationData?.destination_address || destination}
                    </div>
                </div>
            </div>

            {/* Current Departure Option */}
            <div className="px-6 mb-4">
                <div className="bg-gray-400 rounded-2xl p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold">[현재 출발]</h3>
                                <span className="bg-white text-gray-400 px-3 py-1 rounded-full text-xs font-medium">
                                    현재
                                </span>
                            </div>
                            <p className="text-base mb-2">지금 출발 ({current?.departureTime || '15:56'})</p>
                            <p className="text-sm opacity-90 mb-1">
                                예상 도착시간: {current?.arrivalTime || '16:16'} (소요시간: {current?.duration || 20}분)
                            </p>
                            <p className="text-sm opacity-90 mb-2">
                                예상 혼잡도: {current?.traffic.icon} {current?.traffic.text}
                            </p>
                            <p className="text-sm opacity-90">✅ 0분 절약 | 🎁 0원 획득</p>
                        </div>
                        <button
                            onClick={() =>
                                handleSelectRecommendation({
                                    id: 'current',
                                    rawData: current,
                                    title: '[현재 출발]',
                                    type: 'current',
                                })
                            }
                            className="bg-white text-gray-400 px-4 py-2 rounded-lg text-sm font-medium ml-4"
                        >
                            알림 받고
                            <br />
                            지금 뒤<br />
                            출발하기
                        </button>
                    </div>
                </div>
            </div>

            {/* Optimal Departure Option */}
            {optimal && (
                <div className="px-6 mb-4">
                    <div className="bg-green-500 rounded-2xl p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold">{optimal.title}</h3>
                                    <span className="bg-white text-green-500 px-3 py-1 rounded-full text-xs font-medium">
                                        최적 시간
                                    </span>
                                </div>
                                <p className="text-base mb-2">
                                    {optimal.departText} ({optimal.optimalTime})
                                </p>
                                <p className="text-sm opacity-90 mb-1">
                                    예상 도착시간: {optimal.arrivalTime} (소요시간: {optimal.duration}분)
                                </p>
                                <p className="text-sm opacity-90 mb-2">
                                    예상 혼잡도: {optimal.traffic.icon} {optimal.traffic.text}
                                </p>
                                <p className="text-sm opacity-90">
                                    ✅ {optimal.timeSaved}분 절약 | 🎁 {optimal.reward}원 획득
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    handleSelectRecommendation({
                                        id: 'optimal',
                                        rawData: optimal,
                                        title: optimal.title,
                                        type: 'optimal',
                                    })
                                }
                                className="bg-white text-green-500 px-4 py-2 rounded-lg text-sm font-medium ml-4"
                            >
                                알림 받고
                                <br />
                                19분 뒤<br />
                                출발하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t w-[393px] mx-auto">
                <ul className="flex justify-around py-4 text-lg">
                    <li>
                        <button className="text-gray-500">결제매장</button>
                    </li>
                    <li>
                        <button className="text-black font-semibold">홈</button>
                    </li>
                    <li>
                        <button className="text-gray-500">마이페이지</button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default TimeRecommendations;
