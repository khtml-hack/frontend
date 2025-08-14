import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/userApi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // 로그인 페이지 접근 시 이전 토큰 삭제 (테스트 목적)
    useEffect(() => {
        // 로그인 테스트를 위해 토큰 삭제
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }, []);

    const handleLogin = async () => {
        setError('');

        // 이메일, 비밀번호 간단한 유효성 검사
        if (!email.trim()) {
            setError('이메일을 입력해주세요.');
            return;
        }

        if (!password.trim()) {
            setError('비밀번호를 입력해주세요.');
            return;
        }

        try {
            setIsLoading(true);
            const res = await loginUser({ email, password });
            console.log('로그인 응답:', res); // 디버깅용

            if (res.access) {
                // 토큰 저장 (localStorage)
                localStorage.setItem('accessToken', res.access);
                localStorage.setItem('refreshToken', res.refresh);

                // 첫 로그인인 경우 닉네임 설정 페이지로 이동
                if (!res.nickname || res.nickname === '' || res.nickname_required) {
                    navigate('/nickname-setup');
                } else {
                    // 닉네임이 이미 설정되어 있으면 홈 페이지로 이동
                    localStorage.setItem('nickname', res.nickname);
                    navigate('/home');
                }
            } else if (res.error) {
                setError(res.error);
            } else {
                setError(res.message || '로그인에 실패했습니다.');
            }
        } catch (e) {
            console.error('로그인 오류:', e);
            setError('로그인 중 오류가 발생했습니다.');
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
            <div className="flex flex-col h-full px-8">
                <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-2xl font-medium text-center mb-12 text-black">로그인</h1>
                    <div className="space-y-4 mb-8">
                        <div className="bg-white border border-gray-300 rounded-2xl p-4">
                            <input
                                type="email"
                                placeholder="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && password && handleLogin()}
                                className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-lg outline-none"
                            />
                        </div>
                        <div className="bg-white border border-gray-300 rounded-2xl p-4">
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && email && handleLogin()}
                                className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-lg outline-none"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleLogin}
                        disabled={isLoading || !email || !password}
                        className={`btn-peak w-full mb-6 ${isLoading ? 'opacity-70' : ''}`}
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                    {error && <div className="text-red-500 text-sm text-center mb-2">{error}</div>}
                    {/* 테스트 용도: 로컬 스토리지 확인 */}
                    <button
                        onClick={() => {
                            const token = localStorage.getItem('accessToken');
                            setError(token ? '토큰이 있습니다: ' + token.substring(0, 10) + '...' : '토큰이 없습니다');
                        }}
                        className="text-xs text-gray-400 underline mb-2"
                    >
                        토큰 확인
                    </button>{' '}
                    <button
                        onClick={() => navigate('/signup')}
                        className="text-center text-gray-500 text-base underline"
                    >
                        계정이 없으신가요?
                    </button>
                </div>

                {/* Footer */}
                <div className="pb-8 text-center">
                    <p className="text-lg font-extrabold peak-green">Peak down</p>
                </div>
            </div>

            {/* Home Indicator */}
            <div className="home-indicator"></div>
        </div>
    );
};

export default Login;
