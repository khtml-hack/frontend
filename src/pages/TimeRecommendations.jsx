import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TimeRecommendations = () => {
    const [analysisComplete, setAnalysisComplete] = useState(false);
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

        // 분석 로딩 시뮬레이션
        const timer = setTimeout(() => {
            setAnalysisComplete(true);
        }, 3000);

        return () => clearTimeout(timer);
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

    if (!analysisComplete) {
        return (
            <div className="mobile-frame">
                {/* Progress Line */}
                <div className="progress-line">
                    <div className="h-full bg-green-500 w-full"></div>
                </div>

                {/* Loading Content */}
                <div className="flex flex-col items-center justify-center h-full px-8">
                    <h1 className="text-2xl font-medium text-center mb-8 text-black">
                        {nickname}님을 위한 AI 최적 시간 분석중..
                    </h1>

                    <div className="space-y-4 text-center mb-12">
                        <p className="text-gray-700">가장 한산한 출발 시간을 예측하고 있어요.</p>
                        <p className="text-gray-400">실시간 교통량, 날씨 정보까지 꼼꼼하게 분석 중입니다.</p>
                        <p className="text-gray-400">
                            곧 최적의 출발 시간과 함께 절약되는 시간,
                            <br />
                            예상 포인트를 알려드릴게요!
                        </p>
                        <p className="text-gray-400">잠시만 기다려주세요!</p>
                    </div>
                </div>
            </div>
        );
    }

    // API 데이터를 UI 형식으로 변환
    const getRecommendationsFromAPI = () => {
        console.log('🔧 추천 데이터 생성 중:', recommendationData);

        if (!recommendationData) {
            console.log('⚠️ 추천 데이터가 없어서 fallback 사용');
            // Fallback 데이터
            return [
                {
                    id: 1,
                    title: '[AI 추천]',
                    time: '30분 뒤 출발 (10:11)',
                    arrivalTime: '10:31',
                    duration: '20분',
                    traffic: '🟢 원활',
                    savings: '8분 절약',
                    reward: '100포인트 획득',
                    priority: '최적 시간',
                    bgColor: 'bg-green-500',
                    selected: true,
                },
                {
                    id: 2,
                    title: '[AI 추천]',
                    time: '45분 뒤 출발 (10:26)',
                    arrivalTime: '10:49',
                    duration: '23분',
                    traffic: '🟠 혼잡',
                    savings: '5분 절약',
                    reward: '80원 획득',
                    priority: '2순위',
                    bgColor: 'bg-orange-400',
                },
            ];
        }

        const recommendations = [];

        // UI 필드가 있으면 사용, 없으면 직접 처리
        const uiData = recommendationData.ui;
        const current = uiData?.current;
        const options = uiData?.options || [];

        console.log('🔧 current:', current);
        console.log('🔧 options:', options);

        // 현재 시간 옵션
        if (current) {
            recommendations.push({
                id: 'current',
                title: '[현재 출발]',
                time: `지금 출발 (${current.departure_time})`,
                arrivalTime: current.arrival_time,
                duration: `${current.duration_min}분`,
                traffic: getTrafficIcon(current.congestion_level),
                savings: '0분 절약',
                reward: '0원 획득',
                priority: '현재',
                bgColor: 'bg-gray-400',
                selected: false,
                rawData: current,
            });
        }

        // API 추천 옵션들
        if (options && options.length > 0) {
            console.log('🔧 처리할 옵션들:', options);
            options.forEach((option, index) => {
                console.log(`🔧 옵션 ${index}:`, option);
                recommendations.push({
                    id: `option-${index}`,
                    title: option.title || '[AI 추천]',
                    time: option.depart_in_text || `${index * 15}분 뒤 출발`,
                    arrivalTime: calculateArrivalTime(option.optimal_departure_time, option.expected_duration_min),
                    duration: `${option.expected_duration_min || 25}분`,
                    traffic: getTrafficIcon(option.congestion_level || 2),
                    savings: `${option.time_saved_min || 5}분 절약`,
                    reward: `${option.reward_amount || 50}원 획득`,
                    priority: index === 0 ? '최적 시간' : `${index + 1}순위`,
                    bgColor: index === 0 ? 'bg-green-500' : 'bg-orange-400',
                    selected: index === 0,
                    rawData: option,
                });
            });
        } else {
            console.log('⚠️ options가 없거나 비어있음. 기본 추천 생성');
            // options가 없으면 기본 추천 생성
            recommendations.push({
                id: 'fallback-1',
                title: '[AI 추천]',
                time: '30분 뒤 출발',
                arrivalTime: '도착예정',
                duration: '25분',
                traffic: '🟢 원활',
                savings: '8분 절약',
                reward: '100원 획득',
                priority: '최적 시간',
                bgColor: 'bg-green-500',
                selected: true,
            });
        }

        return recommendations;
    };

    // 혼잡도 레벨에 따른 아이콘 반환
    const getTrafficIcon = (level) => {
        console.log('🚦 혼잡도 레벨:', level);
        if (!level || level <= 1.5) return '🟢 원활';
        if (level <= 2.5) return '🟡 보통';
        if (level <= 3.5) return '🟠 혼잡';
        return '🔴 매우혼잡';
    };

    // 출발 시간과 소요 시간으로 도착 시간 계산
    const calculateArrivalTime = (departureTime, durationMin) => {
        try {
            const [hours, minutes] = departureTime.split(':').map(Number);
            const departureDate = new Date();
            departureDate.setHours(hours, minutes, 0, 0);

            const arrivalDate = new Date(departureDate.getTime() + durationMin * 60000);
            return arrivalDate.toTimeString().slice(0, 5);
        } catch (e) {
            return '도착시간';
        }
    };

    // 현재 시간과 출발 시간의 차이를 계산하여 버튼 텍스트 생성
    const getTimeUntilDeparture = (departureTimeStr) => {
        try {
            if (departureTimeStr.includes('지금 출발')) {
                return '지금';
            }

            // "47분 뒤 출발 (15:00)" 형태에서 시간 추출
            const timeMatch = departureTimeStr.match(/\((\d{1,2}:\d{2})\)/);
            if (!timeMatch) return '1시간';

            const departureTime = timeMatch[1];
            const [depHours, depMinutes] = departureTime.split(':').map(Number);

            const now = new Date();
            const departure = new Date();
            departure.setHours(depHours, depMinutes, 0, 0);

            // 출발 시간이 다음날인 경우 처리
            if (departure < now) {
                departure.setDate(departure.getDate() + 1);
            }

            const diffMs = departure.getTime() - now.getTime();
            const diffMinutes = Math.round(diffMs / (1000 * 60));

            if (diffMinutes < 1) return '지금';
            if (diffMinutes < 60) return `${diffMinutes}분`;

            const diffHours = Math.floor(diffMinutes / 60);
            const remainingMinutes = diffMinutes % 60;

            if (remainingMinutes === 0) return `${diffHours}시간`;
            return `${diffHours}시간 ${remainingMinutes}분`;
        } catch (e) {
            console.error('시간 계산 오류:', e);
            return '1시간';
        }
    };

    const recommendations = getRecommendationsFromAPI();

    return (
        <div className="mobile-frame">
            {/* Header Background */}
            <div className="bg-gray-100 h-60 relative">
                {/* Peak Down Logo */}
                <div className="px-8 pt-8">
                    <button onClick={() => navigate(-1)} className="text-black text-lg mb-4">
                        &lt;
                    </button>
                    <h1 className="text-4xl font-extrabold peak-green tracking-tight">Peak _down</h1>
                    <div className="flex items-center justify-between mt-4">
                        <div>
                            <p className="text-black text-2xl font-semibold leading-tight">AI 최적 시간 분석 완료!</p>
                        </div>
                        <button className="p-2">🔔</button>
                    </div>
                </div>
            </div>

            {/* Route Info */}
            <div className="px-8 mt-4 mb-6">
                <div className="bg-white rounded-xl p-4 mb-6 border">
                    <div className="text-center text-gray-800 text-lg">
                        {recommendationData?.origin_address || departure} →{' '}
                        {recommendationData?.destination_address || destination}
                    </div>
                </div>
                {/* Current Status */}
                <div className="bg-gray-100 rounded-2xl p-6 mb-6">
                    <div className="text-center">
                        <h3 className="text-black font-medium mb-2">지금 출발 시</h3>
                        <p className="text-gray-700">
                            예상 소요 시간: {recommendationData?.ui?.current?.duration_min || 28}분
                        </p>
                        <p className="text-gray-700">
                            예상 혼잡도: {getTrafficIcon(recommendationData?.ui?.current?.congestion_level || 2.5)}
                        </p>
                    </div>
                </div>
                {/* Recommendations */}
                <div className="space-y-4 mb-24 pb-8">
                    {recommendations.map((rec) => (
                        <div key={rec.id} className={`${rec.bgColor} rounded-2xl p-6 text-white relative`}>
                            <div className="absolute top-4 right-4">
                                <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-medium">
                                    {rec.priority}
                                </span>
                            </div>

                            <div className="pr-16">
                                <div className="font-medium mb-2">{rec.title}</div>
                                <div className="font-medium mb-2">{rec.time}</div>
                                <div className="text-sm opacity-90 mb-1">
                                    예상 도착시간: {rec.arrivalTime} (소요시간: {rec.duration})
                                </div>
                                <div className="text-sm opacity-90 mb-1">예상 혼잡도: {rec.traffic}</div>
                                <div className="text-sm opacity-90">
                                    ✅ {rec.savings} | 💰 {rec.reward}
                                </div>
                            </div>

                            <button
                                onClick={() => handleSelectRecommendation(rec)}
                                className="absolute bottom-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-medium"
                            >
                                알림 받고
                                <br />
                                {getTimeUntilDeparture(rec.time)} 뒤
                                <br />
                                출발하기
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Navigation */}
            <nav className="sticky bottom-0 border-t bg-white">
                <ul className="flex justify-around py-3 text-[18px]">
                    <li>
                        <button className="opacity-60">결제매장</button>
                    </li>
                    <li>
                        <button className="font-semibold">홈</button>
                    </li>
                    <li>
                        <button className="opacity-60">마이페이지</button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default TimeRecommendations;
