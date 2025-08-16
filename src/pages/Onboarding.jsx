import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const [nickname, setNickname] = useState('김혼잡');
    const [locationPermission, setLocationPermission] = useState(false);
    const [addresses, setAddresses] = useState({
        home: null,
        work: null,
        school: null,
    });
    const navigate = useNavigate();

    const handleNextStep = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            navigate('/home');
        }
    };

    const handlePrevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const requestLocationPermission = () => {
        setLocationPermission(true);
        handleNextStep();
    };

    const getProgressWidth = () => {
        return `${(step / 4) * 100}%`;
    };

    const renderStep1 = () => (
        <div className="flex flex-col items-center justify-center h-full px-8">
            <div className="text-6xl mb-8">👋</div>
            <h1 className="text-2xl font-medium text-center mb-8 text-black leading-tight">
                반가워요!
                <br />
                제가 뭐라고 불러드리면 좋을까요?
            </h1>
            <div className="w-full mb-4">
                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="input-peak text-center"
                    placeholder="닉네임을 입력해주세요"
                />
                <button className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400">✕</button>
            </div>
            <p className="text-gray-500 text-base mb-12 text-center">* 닉네임은 나중에 바꿀 수 있어요</p>
            <button onClick={handleNextStep} disabled={!nickname} className="btn-peak w-full">
                다음
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="flex flex-col items-center justify-center h-full px-8">
            <h1 className="text-2xl font-medium text-center mb-8 text-black">위치 정보 접근 권한 동의</h1>
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                <p className="text-gray-800 text-base leading-relaxed tracking-tight">
                    Peak-down은(는) 사용자님의 현재 위치를 기반으로 최적의 출발 시간과 이동 경로를 분석합니다. 원활한
                    서비스 이용을 위해 위치 정보 접근 권한이 필요합니다.
                    <br />
                    <br />
                    정확한 서비스 제공을 위한 위치 정보 접근이 필요합니다.
                    <br />
                    AI가 이문동의 실시간 교통 상황을 분석하고, 보상을 지급하기 위해 사용됩니다.
                    <br />
                    언제든지 설정에서 권한을 철회할 수 있습니다.
                </p>
            </div>
            <button onClick={requestLocationPermission} className="btn-peak w-full">
                다음
            </button>
        </div>
    );

    const renderStep3 = () => (
        <div className="flex flex-col items-center justify-center h-full px-8">
            <h1 className="text-2xl font-medium text-center mb-8 text-black leading-tight">
                매일 다니는 경로를 등록하고
                <br />
                간편하게 시간 추천을 받아보세요!
            </h1>
            <div className="flex gap-4 mb-12">
                <div className="bg-gray-800 rounded-2xl p-6 flex-1 text-center">
                    <div className="text-2xl mb-2">🏡</div>
                    <div className="text-white text-base">집</div>
                    <div className="text-white text-sm mt-2">+ 주소 검색</div>
                </div>
                <div className="bg-gray-800 rounded-2xl p-6 flex-1 text-center">
                    <div className="text-2xl mb-2">🏫</div>
                    <div className="text-white text-base">학교</div>
                    <div className="text-white text-sm mt-2">+ 주소 검색</div>
                </div>
                <div className="bg-gray-800 rounded-2xl p-6 flex-1 text-center">
                    <div className="text-2xl mb-2">🏢</div>
                    <div className="text-white text-base">직장</div>
                    <div className="text-white text-sm mt-2">+ 주소 검색</div>
                </div>
            </div>
            <button onClick={handleNextStep} disabled={true} className="btn-peak w-full mb-4">
                다음
            </button>
            <button onClick={handleNextStep} className="text-gray-500 text-lg">
                건너뛰기 &gt;
            </button>
        </div>
    );

    const renderStep4 = () => (
        <div className="flex flex-col items-center justify-center h-full px-8">
            <h1 className="text-2xl font-medium text-center mb-6 text-black">모든 준비가 끝났어요!</h1>
            <p className="text-gray-600 text-base text-center leading-relaxed mb-12">
                {nickname}님을 위한 맞춤 설정이 완료되었습니다.
                <br />
                이제 Peak-down과 함께 막히는 길 위에서 낭비되던
                <br />
                당신의 소중한 시간을 되찾아 보세요.
            </p>
            <button onClick={() => navigate('/home')} className="btn-peak w-full">
                Peak-down 시작하기
            </button>
        </div>
    );

    return (
        <div className="mobile-frame">
            {/* Progress Line */}
            <div className="progress-line">
                <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: getProgressWidth() }}
                ></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}

                {/* Previous Step Button */}
                {step > 1 && (
                    <button onClick={handlePrevStep} className="absolute bottom-20 left-8 text-gray-500 text-lg">
                        &lt; 이전단계
                    </button>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
