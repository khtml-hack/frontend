import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/userApi';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async () => {
        setError('');
        try {
            const res = await registerUser({
                email,
                username: username || email.split('@')[0],
                password,
                password_confirm: confirmPassword,
            });

            console.log('Signup response:', res); // 디버깅용

            if (res.user) {
                // 성공 시 로그인 페이지로 이동
                navigate('/login');
            } else if (res.error) {
                // 서버에서 반환한 구체적인 오류 메시지 표시
                setError(
                    typeof res.error === 'object'
                        ? Object.values(res.error).flat().join(', ')
                        : res.error || '회원가입에 실패했습니다.'
                );
            } else {
                setError(res.message || '회원가입에 실패했습니다.');
            }
        } catch (e) {
            console.error('Signup error:', e); // 디버깅용
            setError('회원가입 중 오류가 발생했습니다.');
        }
    };

    const isFormValid = email && password && confirmPassword && password === confirmPassword;

    return (
        <div className="mobile-frame">
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
                                type="text"
                                placeholder="사용자명 (선택)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
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
        </div>
    );
};

export default Signup;
