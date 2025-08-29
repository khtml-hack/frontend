import React from 'react';
import { useNavigate } from 'react-router-dom';
import PeakDownLogo from '../assets/PeakDown.png';
const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="mobile-frame">
            {/* Content */}
            <div className="flex flex-col items-center justify-center h-full px-auto mt-[250px]">
                <div className="flex-1 flex flex-col items-center justify-center">
                    {{ PeakDownLogo } && <img src={PeakDownLogo} alt="PeakDown Logo" className="w-35 h-37 mb-8" />}
                    <div className="flex flex-col items-center space-y-4 ">
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-[#363636] text-white rounded-2xl py-2.5 px-10 w-[164px] text-xl font-medium"
                        >
                            로그인
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-[#363636] text-white rounded-2xl py-2.5 px-10 w-[164px] text-xl font-medium text-center"
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
