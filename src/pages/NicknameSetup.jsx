import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateNickname } from '../api/userApi';

const NicknameSetup = () => {
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleNextClick = async () => {
        if (!nickname.trim()) {
            setError('닉네임을 입력해주세요');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                navigate('/login');
                return;
            }

            const res = await updateNickname(nickname);
            console.log('닉네임 설정 응답:', res); // 디버깅용

            if (res.nickname) {
                // 성공적으로 닉네임 설정 완료
                localStorage.setItem('nickname', res.nickname);
                navigate('/home');
            } else if (res.error) {
                setError(res.error);
            } else {
                setError(res.message || '닉네임 설정에 실패했습니다.');
            }
        } catch (e) {
            console.error('닉네임 설정 오류:', e);
            setError('닉네임 설정 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
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
                    disabled={isLoading || !nickname.trim()}
                    className={`bg-gray-800 text-white rounded-full py-4 px-12 w-full text-xl ${
                        isLoading ? 'opacity-70' : ''
                    }`}
                >
                    {isLoading ? '처리중...' : '다음'}
                </button>
            </div>
        </div>
    );
};

export default NicknameSetup;
