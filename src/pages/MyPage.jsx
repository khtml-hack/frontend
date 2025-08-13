import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/userApi';

const MyPage = () => {
    const [showNicknameEdit, setShowNicknameEdit] = useState(false);
    const [nickname, setNickname] = useState('김혼잡');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const menuItems = [
        { id: 'info', label: '내정보', icon: '💬' },
        { id: 'nickname', label: '닉네임 변경', icon: '✏️' },
        { id: 'routes', label: '자주가는 경로 관리', icon: '🗺️' },
        { id: 'logout', label: '로그아웃', icon: '🚪' },
    ];

    const handleNicknameUpdate = () => {
        setShowNicknameEdit(false);
    };

    const handleLogout = async () => {
        setError('');
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                setError('로그인 정보가 없습니다.');
                return;
            }
            const res = await logoutUser(refreshToken);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            navigate('/login');
        } catch (e) {
            setError('로그아웃 중 오류가 발생했습니다.');
        }
    };

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
                <div className="px-8 pt-8">
                    <h1 className="text-4xl font-extrabold peak-green tracking-tight">Peak _down</h1>
                </div>
            </div>

            {/* Content */}
            <div className="px-8 -mt-16">
                {/* QR Code Section */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-medium text-black mb-6">제휴매장에서 지역화폐로 결제하기</h2>

                    <div className="bg-gray-200 rounded-2xl p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                            <div className="w-12 h-12 bg-white rounded-sm grid grid-cols-4 gap-px p-1">
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-white rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-white rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-white rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-white rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-white rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Local Currency Status */}
                <div className="bg-green-500 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white text-xl font-medium">나의 지역화폐 현황</h3>
                        <span className="text-white text-xl font-medium">2,500원</span>
                    </div>
                    <button onClick={() => navigate('/stores')} className="border-2 border-white rounded-2xl px-6 py-2">
                        <span className="text-white text-base font-medium">결제매장 확인하러 가기</span>
                    </button>
                </div>

                {/* Menu Items */}
                <div className="space-y-1 mb-6">
                    <p className="text-gray-500 text-lg mb-4">내정보</p>

                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'nickname') {
                                    setShowNicknameEdit(true);
                                } else if (item.id === 'logout') {
                                    handleLogout();
                                }
                            }}
                            className="w-full text-left py-3 text-black text-lg"
                        >
                            {item.label}
                        </button>
                    ))}
                    {error && <div className="text-red-500 text-sm text-center mb-2">{error}</div>}
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-16 left-0 right-0 border-t border-gray-300 pt-4">
                <div className="flex justify-center">
                    <div className="flex gap-12">
                        <button onClick={() => navigate('/home')} className="text-black text-2xl font-medium">
                            홈
                        </button>
                        <button onClick={() => navigate('/stores')} className="text-black text-2xl font-medium">
                            결제매장
                        </button>
                        <button className="text-black text-2xl font-medium underline">마이페이지</button>
                    </div>
                </div>
            </div>

            {/* Home Indicator */}
            <div className="home-indicator"></div>

            {/* Nickname Edit Modal */}
            {showNicknameEdit && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 m-8 max-w-sm w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-black text-xl font-medium">닉네임 변경</h3>
                            <button onClick={() => setShowNicknameEdit(false)} className="text-black text-xl">
                                ✕
                            </button>
                        </div>

                        <div className="mb-6">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full p-4 border border-gray-300 rounded-xl text-center text-lg"
                                placeholder="닉네임을 입력해주세요"
                            />
                        </div>

                        <button
                            onClick={handleNicknameUpdate}
                            className="bg-white border border-gray-300 rounded-full px-6 py-2 text-black font-medium"
                        >
                            완료
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPage;
