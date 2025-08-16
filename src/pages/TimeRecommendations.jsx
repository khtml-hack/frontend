import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TimeRecommendations = () => {
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // 로컬 스토리지에서 출발지와 도착지 정보 가져오기
        const savedDeparture = localStorage.getItem('departure') || '출발지';
        const savedDestination = localStorage.getItem('destination') || '도착지';
        setDeparture(savedDeparture);
        setDestination(savedDestination);

        // 분석 로딩 시뮬레이션
        const timer = setTimeout(() => {
            setAnalysisComplete(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleSelectRecommendation = (recommendation) => {
        navigate('/recommendation-accepted', { state: { recommendation } });
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
                        김혼잡님을 위한 ai 최적 시간 분석중..
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

    const recommendations = [
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
        {
            id: 3,
            title: '[AI 추천]',
            time: '1시간 뒤 출발 (10:41)',
            arrivalTime: '11:01',
            duration: '20분',
            traffic: '🟢 원활',
            savings: '8분 절약',
            reward: '100포인트 획득',
            priority: '3순위',
            bgColor: 'bg-orange-400',
        },
    ];

    return (
        <div className="mobile-frame">
            {/* Header Background */}
            <div className="bg-gray-100 h-72 relative">
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
            <div className="px-8 -mt-16 mb-6">
                <div className="bg-white rounded-xl p-4 mb-6 border">
                    <div className="text-center text-gray-800 text-lg">
                        {departure} → {destination}
                    </div>
                </div>{' '}
                {/* Current Status */}
                <div className="bg-gray-100 rounded-2xl p-6 mb-6">
                    <div className="text-center">
                        <h3 className="text-black font-medium mb-2">지금 출발 시</h3>
                        <p className="text-gray-700">예상 소요 시간: 28분</p>
                        <p className="text-gray-700">예상 혼잡도: 🟠 혼잡</p>
                    </div>
                </div>
                {/* Recommendations */}
                <div className="space-y-4 mb-6">
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
                                {rec.time.includes('30분') ? '30분' : rec.time.includes('45분') ? '45분' : '1시간'} 뒤
                                <br />
                                출발하기
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-16 left-0 right-0 border-t border-gray-300 pt-4">
                <div className="flex justify-center">
                    <div className="flex gap-12">
                        <button className="text-black text-2xl font-medium">홈</button>
                        <button className="text-black text-2xl font-medium">결제매장</button>
                        <button className="text-black text-2xl font-medium">마이페이지</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeRecommendations;
