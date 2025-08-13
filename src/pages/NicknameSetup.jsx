import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NicknameSetup = () => {
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // API에서 가져온 함수들
    const { updateNickname } = require('../api/userApi');

    const handleNextClick = async () => {
        if (!nickname.trim()) {
            setError('닉네임을 입력해주세요');
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                navigate('/login');
                return;
            }

            const res = await updateNickname(nickname);
            if (res.nickname) {
                // 성공적으로 닉네임 설정 완료
                navigate('/onboarding');
            } else {
                setError(res.message || '닉네임 설정에 실패했습니다.');
            }
        } catch (e) {
            setError('닉네임 설정 중 오류가 발생했습니다.');
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

            {/* Content */}
            <div className="flex flex-col items-center justify-center h-full px-8">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-6">👋</div>
                    <h1 className="text-3xl font-bold mb-4">반가워요!</h1>
                    <p className="text-xl">제가 뭐라고 불러드리면 좋을까요?</p>
                </div>

                <div className="w-full mb-8">
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="김혼잡"
                        className="w-full p-4 border border-gray-300 rounded-full text-center text-xl"
                    />
                    <p className="text-center text-gray-500 mt-2 text-sm">* 닉네임은 나중에 바꿀 수 있어요</p>
                    {error && <p className="text-center text-red-500 mt-2">{error}</p>}
                </div>

                <button
                    onClick={handleNextClick}
                    className="bg-gray-800 text-white rounded-full py-4 px-12 w-full text-xl"
                >
                    다음
                </button>
            </div>
        </div>
    );
};

export default NicknameSetup;
