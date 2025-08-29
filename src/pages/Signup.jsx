import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/userApi';
import Phrase from '../assets/Phrase.png';
const Signup = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async () => {
        // 오류 상태 초기화
        setErrors({});
        setGeneralError('');

        // 클라이언트 측 기본 검증
        if (password !== confirmPassword) {
            setGeneralError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            // 주소 입력 단계에서 마저 회원가입을 완료하기 위해 임시 데이터 저장 후 이동
            localStorage.setItem(
                'pendingSignup',
                JSON.stringify({
                    email,
                    username: username || email.split('@')[0],
                    password,
                    password_confirm: confirmPassword,
                })
            );
            navigate('/onboarding/address');
            return;
        } catch (e) {
            console.error('Signup error:', e); // 디버깅용
            setGeneralError('회원가입 중 오류가 발생했습니다.');
        }
    };

    // 기본적인 필수 필드만 체크 (서버에서 상세 검증)
    const isFormValid = email && password && confirmPassword;

    return (
        <div className="mobile-frame">
            {/* Content */}
            <div className="flex flex-col h-full px-8 pt-20">
                <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-2xl font-medium text-left mb-8 text-black">회원가입</h1>

                    <div className="space-y-4 mb-12">
                        {/* 이메일 필드 */}
                        <div>
                            <div
                                className={`bg-white border rounded-2xl px-5 py-4 ${
                                    errors.email ? 'border-red-400' : 'border-gray-300'
                                }`}
                            >
                                <input
                                    type="email"
                                    placeholder="이메일 "
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-base outline-none"
                                />
                            </div>
                            {errors.email && <div className="text-red-500 text-xs mt-1 px-2">{errors.email}</div>}
                        </div>

                        {/* 비밀번호 필드 */}
                        <div>
                            <div
                                className={`bg-white border rounded-2xl px-5 py-4 ${
                                    errors.password ? 'border-red-400' : 'border-gray-300'
                                }`}
                            >
                                <input
                                    type="password"
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-base outline-none"
                                />
                            </div>
                            {errors.password && <div className="text-red-500 text-xs mt-1 px-2">{errors.password}</div>}
                        </div>

                        {/* 비밀번호 확인 필드 */}
                        <div>
                            <div
                                className={`bg-white border rounded-2xl px-5 py-4 ${
                                    errors.password_confirm ||
                                    (confirmPassword && password && password !== confirmPassword)
                                        ? 'border-red-400'
                                        : 'border-gray-300'
                                }`}
                            >
                                <input
                                    type="password"
                                    placeholder="비밀번호 확인"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-base outline-none"
                                />
                            </div>
                            {errors.password_confirm && (
                                <div className="text-red-500 text-xs mt-1 px-2">{errors.password_confirm}</div>
                            )}
                            {/* 실시간 비밀번호 불일치 체크 */}
                            {confirmPassword &&
                                password &&
                                password !== confirmPassword &&
                                !errors.password_confirm && (
                                    <div className="text-red-500 text-xs mt-1 px-2">비밀번호가 일치하지 않습니다.</div>
                                )}
                        </div>

                        {/* 일반 오류 메시지 */}
                        {generalError && (
                            <div className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
                                {generalError}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSignup}
                        disabled={!isFormValid}
                        className={`w-full py-4 rounded-2xl text-xl font-medium mb-12 ${
                            isFormValid ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-200'
                        }`}
                    >
                        회원가입
                    </button>

                    <button onClick={() => navigate('/login')} className="text-center text-gray-500 text-sm underline">
                        계정이 있으신가요?
                    </button>
                </div>

                <div className="flex justify-center mt-[200px]">
                    <img src={Phrase} alt="슬로건 이미지" className="w-auto" />
                </div>
            </div>
        </div>
    );
};

export default Signup;
