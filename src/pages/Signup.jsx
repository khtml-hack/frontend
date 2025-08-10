import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = () => {
        // 회원가입 로직 처리
        navigate('/onboarding');
    };

    const isFormValid = email && password && confirmPassword && password === confirmPassword;

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
                    <h1 className="text-2xl font-medium text-center mb-12 text-black">회원가입</h1>

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
                        <div className="bg-white border border-gray-300 rounded-2xl p-4">
                            <input
                                type="password"
                                placeholder="비밀번호 확인"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-lg outline-none"
                            />
                        </div>
                    </div>

                    <button onClick={handleSignup} disabled={!isFormValid} className="btn-peak w-full mb-6">
                        회원가입
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="text-center text-gray-500 text-base underline"
                    >
                        계정이 있으신가요?
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

export default Signup;
