import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const [transportType, setTransportType] = useState('car');
    const [arrivalTime, setArrivalTime] = useState('');
    const [showDepartureModal, setShowDepartureModal] = useState(false);
    const navigate = useNavigate();

    const handleFindOptimalTime = () => {
        if (departure && destination) {
            navigate('/time-recommendations');
        }
    };

    const transportOptions = [
        { id: 'car', icon: '🚗', label: '자가용', active: true },
        { id: 'public', icon: '🚌', label: '대중교통', active: false },
        { id: 'bike', icon: '🚲', label: '자전거/\n전동킥보드', active: false },
    ];

    return (
        <div className="mobile-frame">
            {/* Status Bar */}
            <div className="status-bar">
                <div className="font-semibold">9:41</div>
                <div className="flex items-center gap-1">
                    <div className="w-6 h-3 border border-black rounded-sm">
                        <div className="w-5 h-2 bg-black rounded-sm m-0.5"></div>
                    </div>
                </div>
            </div>

            {/* Header Background */}
            <div className="bg-gray-100 h-72 relative">
                {/* Peak Down Logo */}
                <div className="px-8 pt-8">
                    <h1 className="text-4xl font-extrabold peak-green tracking-tight">Peak _down</h1>
                    <div className="flex items-center justify-between mt-4">
                        <div>
                            <p className="text-gray-600 text-2xl font-semibold">안녕하세요 김혼잡 님,</p>
                            <p className="text-black text-2xl font-semibold mt-2 leading-tight">
                                막히는 시간 피하고 돈 버는 시간을
                                <br />
                                찾아드릴게요.
                            </p>
                        </div>
                        <button className="p-2">🔔</button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-8 -mt-16">
                {/* Route Input */}
                <div className="bg-gray-800 rounded-xl p-4 mb-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="출발지 입력"
                                value={departure}
                                onChange={(e) => setDeparture(e.target.value)}
                                onClick={() => setShowDepartureModal(true)}
                                className="w-full bg-transparent text-white placeholder-gray-300 text-lg py-3 border-none outline-none"
                            />
                            <button className="absolute right-4 top-3 text-white">🔍</button>
                        </div>
                        <div className="h-px bg-gray-300"></div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="도착지 입력"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="w-full bg-transparent text-white placeholder-gray-300 text-lg py-3 border-none outline-none"
                            />
                            <button className="absolute right-4 top-3 text-white">🔍</button>
                        </div>
                    </div>
                </div>

                {/* Transport Type Selection */}
                <div className="flex gap-4 mb-6">
                    {transportOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setTransportType(option.id)}
                            className={`flex-1 rounded-2xl p-6 text-center ${
                                option.active ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'
                            }`}
                        >
                            <div className="text-2xl mb-2">{option.icon}</div>
                            <div className="text-lg font-medium whitespace-pre-line">{option.label}</div>
                        </button>
                    ))}
                </div>

                {/* Arrival Time Setting */}
                <button className="bg-white border border-gray-400 rounded-full px-6 py-3 mb-6 flex items-center gap-2">
                    <span>⏰</span>
                    <span className="text-gray-900">도착 희망 시간 설정</span>
                </button>

                {/* Find Optimal Time Button */}
                <button
                    onClick={handleFindOptimalTime}
                    disabled={!departure || !destination}
                    className="btn-peak w-full mb-6"
                >
                    AI 최적 시간 찾기
                </button>

                {/* Local Currency Status */}
                <div className="bg-green-500 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white text-xl font-medium">나의 지역화폐 현황</h3>
                        <span className="text-white text-xl font-medium">2,500원</span>
                    </div>
                    <button className="border-2 border-white rounded-2xl px-6 py-2">
                        <span className="text-white text-base font-medium">사용하러 가기</span>
                    </button>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-16 left-0 right-0 border-t border-gray-300 pt-4">
                <div className="flex justify-center">
                    <div className="flex gap-12">
                        <button className="text-black text-2xl font-medium underline">홈</button>
                        <button onClick={() => navigate('/stores')} className="text-black text-2xl font-medium">
                            결제매장
                        </button>
                        <button onClick={() => navigate('/mypage')} className="text-black text-2xl font-medium">
                            마이페이지
                        </button>
                    </div>
                </div>
            </div>

            {/* Home Indicator */}
            <div className="home-indicator"></div>

            {/* Departure Modal */}
            {showDepartureModal && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-2xl p-6 m-8 max-w-sm w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white text-xl font-medium">어디서 출발하시나요?</h3>
                            <button onClick={() => setShowDepartureModal(false)} className="text-white text-xl">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-600 rounded-xl p-4 flex items-center gap-3">
                                <span>🔍</span>
                                <input
                                    type="text"
                                    placeholder="송파꿈에그린"
                                    className="bg-transparent text-white flex-1 outline-none"
                                />
                            </div>

                            <div className="bg-gray-600 rounded-xl p-4 flex items-center gap-3">
                                <span>📍</span>
                                <span className="text-green-400">현재 위치로 찾기</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-6">
                            <button className="bg-gray-600 text-white px-4 py-2 rounded-xl text-sm">🏡 집</button>
                            <button className="bg-gray-600 text-white px-4 py-2 rounded-xl text-sm">🏢 직장</button>
                        </div>

                        <div className="bg-gray-700 rounded-xl p-4">
                            <div className="text-white font-medium mb-2">송파꿈에그린</div>
                            <div className="text-gray-300 text-sm mb-3">서울특별시 송파구 위례광장로 121</div>
                            <button className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm">선택</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
