import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';

const Home = () => {
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const [showDepartureModal, setShowDepartureModal] = useState(false);
    const [nickname, setNickname] = useState('김혼잡');
    const navigate = useNavigate();

    // 로컬 스토리지에서 닉네임 가져오기
    useEffect(() => {
        const savedNickname = localStorage.getItem('nickname');
        if (savedNickname) {
            setNickname(savedNickname);
        }
    }, []);

    const handleFindOptimalTime = () => {
        if (departure && destination) {
            navigate('/time-recommendations');
        }
    };

    return (
        <div className="mobile-frame">
            <div
                className="mx-auto w-full max-w-[420px] min-h-[100svh] flex flex-col bg-white text-black relative"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom),12px)' }}
            >
                {/* Header with green title */}
                <header className="p-7">
                    <h1 className="text-[clamp(22px,5vw,28px)] font-extrabold text-green-500">Peak_down</h1>
                </header>

                {/* Main Content */}
                <main className="flex-1 px-5">
                    <div className="mb-6 text-center">
                        <p className="text-gray-700 mb-1">안녕하세요 {nickname} 님,</p>
                        <p className="text-black font-medium text-lg leading-snug">
                            막히는 시간 피하고 돈 버는 시간을
                            <br />
                            찾아드릴게요.
                        </p>
                    </div>

                    {/* Search Inputs */}
                    <div className="space-y-2 mb-4">
                        <div className="rounded-xl overflow-hidden border border-purple-200">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="출발지 입력"
                                    value={departure}
                                    onChange={(e) => setDeparture(e.target.value)}
                                    onClick={() => setShowDepartureModal(true)}
                                    className="w-full bg-transparent text-gray-800 placeholder-gray-500 text-sm py-3.5 px-4 border-none outline-none"
                                    readOnly
                                />
                                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                                            stroke="#AAAAAA"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M19 19L14.65 14.65"
                                            stroke="#AAAAAA"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="rounded-xl overflow-hidden border border-purple-200">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="도착지 입력"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    onClick={() => setShowDepartureModal(true)}
                                    className="w-full bg-transparent text-gray-800 placeholder-gray-500 text-sm py-3.5 px-4 border-none outline-none"
                                    readOnly
                                />
                                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                                            stroke="#AAAAAA"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M19 19L14.65 14.65"
                                            stroke="#AAAAAA"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Find Optimal Time Button */}
                    <div className="mb-8">
                        <button
                            onClick={handleFindOptimalTime}
                            className="w-full py-3.5 bg-gray-300 text-gray-600 rounded-xl font-medium text-base"
                        >
                            AI 최적 시간 찾기
                        </button>
                    </div>

                    {/* Regional Currency Info Card */}
                    <div className="mt-6">
                        <h3 className="text-sm text-zinc-400 mb-2">나의 지역화폐 현황 및 사용</h3>
                        <div className="bg-green-500 text-white rounded-2xl p-5">
                            <div className="flex items-baseline justify-between">
                                <span className="font-semibold">나의 지역화폐 현황</span>
                                <span className="text-xl font-extrabold">2,500원</span>
                            </div>
                            <div className="mt-4 flex gap-2 justify-end">
                                <button className="rounded-full border border-white/80 bg-white/10 px-4 py-1.5 text-sm">
                                    적립/사용내역
                                </button>
                                <button className="rounded-full border border-white/80 bg-white/10 px-4 py-1.5 text-sm">
                                    사용하러 가기
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* 하단 탭 */}
                <nav className="sticky bottom-0 border-t bg-white">
                    <ul className="flex justify-around py-3 text-[18px]">
                        <li>
                            <NavLink
                                to="/stores"
                                className={({ isActive }) => (isActive ? 'font-semibold' : 'opacity-60')}
                            >
                                결제매장
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/home"
                                className={({ isActive }) => (isActive ? 'font-semibold' : 'opacity-60')}
                            >
                                홈
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/mypage"
                                className={({ isActive }) => (isActive ? 'font-semibold' : 'opacity-60')}
                            >
                                마이페이지
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                {/* Departure Modal */}
                {showDepartureModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                        <div className="bg-white w-full max-w-[420px] mx-auto rounded-t-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-gray-800 text-lg font-medium">어디서 출발하시나요?</h3>
                                <button onClick={() => setShowDepartureModal(false)} className="text-gray-500">
                                    <svg
                                        width="24"
                                        height="24"
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
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                                    <span>
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
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="출발지 검색"
                                        className="bg-transparent text-gray-800 flex-1 outline-none"
                                    />
                                </div>

                                <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                                    <span className="text-purple-600">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M10 10C11.3807 10 12.5 8.88071 12.5 7.5C12.5 6.11929 11.3807 5 10 5C8.61929 5 7.5 6.11929 7.5 7.5C7.5 8.88071 8.61929 10 10 10Z"
                                                stroke="#7C3AED"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M10 18.3333C14.1667 14.1667 18.3333 11.0811 18.3333 7.5C18.3333 3.91883 14.6421 1 10 1C5.35786 1 1.66667 3.91883 1.66667 7.5C1.66667 11.0811 5.83333 14.1667 10 18.3333Z"
                                                stroke="#7C3AED"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                    <span className="text-purple-600 font-medium">현재 위치로 찾기</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
