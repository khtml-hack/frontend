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

                // 닉네임이 있으면 저장하고 홈으로 이동
                if (res.nickname) {
                    localStorage.setItem('nickname', res.nickname);
                }
                navigate('/home');
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
            {/* Content */}
            <div className="flex flex-col h-full px-8 pt-20">
                <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-2xl font-medium text-left mb-8 text-black">로그인</h1>

                    <div className="space-y-4 mb-16">
                        <div className="bg-white border border-gray-300 rounded-2xl px-5 py-4">
                            <input
                                type="email"
                                placeholder="이메일 "
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && password && handleLogin()}
                                className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-base outline-none"
                            />
                        </div>
                        <div className="bg-white border border-gray-300 rounded-2xl px-5 py-4">
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && email && handleLogin()}
                                className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-base outline-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={isLoading || !email || !password}
                        className={`w-full py-4 rounded-2xl text-xl font-medium mb-16 ${
                            email && password ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-200'
                        } ${isLoading ? 'opacity-70' : ''}`}
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>

                    {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

                    <button onClick={() => navigate('/signup')} className="text-center text-gray-500 text-sm">
                        계정이 없으신가요?
                    </button>
                </div>

                {/* Footer */}
                <div className="pb-8 text-center">
                    <p className="text-lg font-extrabold peak-green">Peak_down</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
