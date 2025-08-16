import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="mobile-frame">
            {/* Content */}
            <div className="flex flex-col items-center justify-center h-full px-8">
                <h1 className="text-6xl font-extrabold peak-green tracking-tight mb-16 text-center leading-tight">
                    Peak _<br />
                    down
                </h1>

                <div className="space-y-4 w-full max-w-xs">
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-gray-800 text-white rounded-2xl py-4 px-8 w-full text-xl font-medium"
                    >
                        로그인
                    </button>
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-gray-800 text-white rounded-2xl py-4 px-8 w-full text-xl font-medium"
                    >
                        회원가입
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-lg font-extrabold peak-green">Peak down</p>
            </div>
        </div>
    );
};

export default Welcome;
