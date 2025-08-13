import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/userApi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError('');
        try {
            const res = await loginUser({ email, password });
            if (res.access) {
                // 토큰 저장 (localStorage)
                localStorage.setItem('accessToken', res.access);
                localStorage.setItem('refreshToken', res.refresh);
                navigate('/onboarding');
            } else {
                setError(res.message || '로그인에 실패했습니다.');
            }
        } catch (e) {
            setError('로그인 중 오류가 발생했습니다.');
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
                                className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-lg outline-none"
                            />
                        </div>
                        <div className="bg-white border border-gray-300 rounded-2xl p-4">
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-lg outline-none"
                            />
                        </div>
                    </div>

                    <button onClick={handleLogin} disabled={!email || !password} className="btn-peak w-full mb-6">
                        로그인
                    </button>
                    {error && <div className="text-red-500 text-sm text-center mb-2">{error}</div>}

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
