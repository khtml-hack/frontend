import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const RecommendationAccepted = () => {
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30분 in seconds
    const [departureDetected, setDepartureDetected] = useState(false);
    const [arrivalDetected, setArrivalDetected] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const recommendation = location.state?.recommendation;

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        // 5분 후 출발 감지 시뮬레이션
        const departureTimer = setTimeout(() => {
            setDepartureDetected(true);
        }, 5000);

        return () => clearTimeout(departureTimer);
    }, []);

    useEffect(() => {
        // 출발 감지 후 10초 뒤 도착 감지 시뮬레이션
        if (departureDetected) {
            const arrivalTimer = setTimeout(() => {
                setArrivalDetected(true);
            }, 10000);

            return () => clearTimeout(arrivalTimer);
        }
    }, [departureDetected]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
    };

    const canDepart = timeLeft <= 5 * 60; // 5분 전부터 출발 가능

    if (arrivalDetected) {
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
                        <div className="text-center text-gray-800 text-lg">한국외국어대학교 → 강남역</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 text-center mb-6">
                        <h2 className="text-2xl font-medium mb-4">
                            🎉
                            <br />
                            목적지에 도착했습니다 !
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            💰 100P 적립! 💰
                            <br />
                            <br />
                            김혼잡 님의 현명한 출발 덕분에,
                            <br />
                            도시 전체의 교통 흐름이 더 원활해졌습니다
                        </p>
                    </div>

                    <div className="bg-gray-100 border-2 border-green-500 rounded-2xl p-4 mb-6">
                        <p className="text-gray-800 text-sm text-center">
                            예상 도착시간: 10:31 (소요시간: 20분)
                            <br />
                            예상 혼잡도: 🟢 원활
                            <br />
                            8분 절약 | 리워드 100원 적립
                        </p>
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="absolute bottom-20 left-0 right-0">
                    <div className="flex justify-between px-8 mb-4">
                        <button className="text-black">&lt; 다시 분석하기</button>
                        <button className="text-black">그만 두기 x</button>
                    </div>
                    <div className="border-t border-gray-300 pt-4">
                        <div className="flex justify-center">
                            <div className="flex gap-12">
                                <button className="text-black text-2xl font-medium">홈</button>
                                <button className="text-black text-2xl font-medium">결제매장</button>
                                <button className="text-black text-2xl font-medium">마이페이지</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (departureDetected) {
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
                        <div className="text-center text-gray-800 text-lg">한국외국어대학교 → 강남역</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 text-center mb-6">
                        <p className="text-black text-lg leading-relaxed">
                            도착 여부를 확인 중입니다 . .<br />
                            목적지에 도착하시면 리워드 100원이 적립됩니다.
                        </p>
                    </div>

                    <div className="bg-gray-100 border-2 border-green-500 rounded-2xl p-4 mb-6">
                        <p className="text-gray-800 text-sm text-center">
                            예상 도착시간: 10:31 (소요시간: 20분)
                            <br />
                            예상 혼잡도: 🟢 원활
                            <br />
                            8분 절약 | 리워드 100원 적립
                        </p>
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="absolute bottom-20 left-0 right-0">
                    <div className="flex justify-between px-8 mb-4">
                        <button className="text-black">&lt; 다시 분석하기</button>
                        <button className="text-black">그만 두기 x</button>
                    </div>
                    <div className="border-t border-gray-300 pt-4">
                        <div className="flex justify-center">
                            <div className="flex gap-12">
                                <button className="text-black text-2xl font-medium">홈</button>
                                <button className="text-black text-2xl font-medium">결제매장</button>
                                <button className="text-black text-2xl font-medium">마이페이지</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Departure Detection Modal */}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 m-8 max-w-sm w-full text-center">
                        <button className="absolute top-4 right-4 text-gray-500 text-xl">×</button>
                        <h3 className="text-2xl font-medium mb-6">출발이 감지되었습니다!</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            목적지에 도착하시면
                            <br />
                            리워드가 적립됩니다.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mobile-frame">
            {/* Header Background */}
            <div className="bg-gray-100 h-72 relative">
                <div className="px-8 pt-8">
                    <h1 className="text-4xl font-extrabold peak-green tracking-tight">Peak _down</h1>
                    <div className="mt-4">
                        <p className="text-black text-2xl font-semibold leading-tight">
                            {canDepart
                                ? '지금 출발하면 8분을 아낄 수 있어요!'
                                : '탁월한 선택이에요! 가장 여유로운 길이 열릴 때까지 잠시만 기다려주세요.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-8 -mt-16">
                <div className="bg-white rounded-xl p-4 mb-6">
                    <div className="text-center text-gray-800 text-lg">한국외국어대학교 → 강남역</div>
                </div>

                {canDepart && <p className="text-2xl font-semibold text-center mb-6">오전 10:11에 출발하세요</p>}

                {/* Timer */}
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-medium mb-2">출발까지 남은 시간</h3>
                    <div className="text-5xl font-medium tracking-wider">{formatTime(timeLeft)}</div>
                    {!canDepart && (
                        <p className="text-gray-500 text-sm mt-4">*5분 전부터 출발하기 버튼이 활성화 됩니다.</p>
                    )}
                </div>

                {/* Departure Button */}
                {canDepart ? (
                    <button onClick={() => setDepartureDetected(true)} className="btn-peak w-full mb-4">
                        지금 바로 출발하기
                    </button>
                ) : (
                    <div className="bg-gray-100 border-2 border-green-500 rounded-2xl p-4 mb-4">
                        <p className="text-gray-800 text-sm text-center">
                            예상 도착시간: 10:31 (소요시간: 20분)
                            <br />
                            예상 혼잡도: 🟢 원활
                            <br />
                            8분 절약 | 100포인트 획득
                        </p>
                    </div>
                )}

                {canDepart && (
                    <p className="text-gray-600 text-sm text-center mb-6">*목적지에 도착 후 리워드가 적립됩니다.</p>
                )}

                {/* Store Recommendation */}
                {!canDepart && (
                    <div className="bg-white border-2 border-green-500 rounded-2xl p-4 mb-6">
                        <p className="text-black text-sm mb-4">
                            ✨ 도로 위에서 낭비할 뻔한 시간을 아끼셨네요!
                            <br />
                            가까운 '최씨네 커피공방' 상점에 방문해보는거 어때요?
                        </p>
                        <button className="bg-gray-800 text-white px-6 py-2 rounded-full text-sm">
                            가게 위치 보기 (지도)
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-20 left-0 right-0">
                <div className="flex justify-between px-8 mb-4">
                    <button className="text-black">&lt; 다시 추천받기</button>
                    <button className="text-black">그만 두기 x</button>
                </div>
                <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-center">
                        <div className="flex gap-12">
                            <button className="text-black text-2xl font-medium">홈</button>
                            <button className="text-black text-2xl font-medium">결제매장</button>
                            <button className="text-black text-2xl font-medium">마이페이지</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendationAccepted;
