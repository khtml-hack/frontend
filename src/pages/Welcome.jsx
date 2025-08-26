import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="mobile-frame">
            {/* Content */}
            <div className="flex flex-col items-center justify-center h-full px-8 pt-20">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h1 className="text-5xl font-extrabold peak-green tracking-tight mb-32 text-left leading-tight">
                        Peak _<br />
                        down
                    </h1>

                    <div className="space-y-4 w-42">
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-gray-700 text-white rounded-2xl py-3 px-12 w-full text-xl font-medium"
                        >
                            로그인
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-gray-700 text-white rounded-2xl py-3 px-12 w-full text-xl font-medium"
                        >
                            회원가입
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Welcome;
