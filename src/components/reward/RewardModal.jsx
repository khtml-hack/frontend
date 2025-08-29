import React from 'react';

const RewardModal = ({ isVisible, onClose, rewardAmount = 100, timeSaved = 8, onConfirm }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 m-8 max-w-sm w-full text-center animate-pulse">
                {/* 닫기 버튼 */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 text-xl">
                    ×
                </button>

                {/* 메인 아이콘과 제목 */}
                <div className="mb-6">
                    <div className="text-6xl mb-4">🏆</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">목적지에 도착했습니다!</h2>
                    <div className="text-3xl font-bold text-green-500 mb-2">💰 {rewardAmount}P 적립! 💰</div>
                </div>

                {/* 상세 정보 */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                            <span>절약한 시간:</span>
                            <span className="font-medium">{timeSaved}분</span>
                        </div>
                        <div className="flex justify-between">
                            <span>기본 보상:</span>
                            <span className="font-medium">{Math.floor(rewardAmount * 0.7)}P</span>
                        </div>
                        <div className="flex justify-between">
                            <span>시간 절약 보너스:</span>
                            <span className="font-medium text-green-600">+{Math.floor(rewardAmount * 0.3)}P</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-bold">
                            <span>총 적립:</span>
                            <span className="text-green-600">{rewardAmount}P</span>
                        </div>
                    </div>
                </div>

                {/* 메시지 */}
                <div className="text-gray-600 text-sm mb-6 leading-relaxed">
                    김혼잡 님의 현명한 출발 덕분에,
                    <br />
                    도시 전체의 교통 흐름이 더 원활해졌습니다! 👏
                </div>

                {/* 확인 버튼 */}
                <button onClick={onConfirm} className="btn-peak w-full text-lg font-semibold">
                    확인
                </button>

                {/* 추가 액션 버튼들 */}
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={() => {
                            /* 포인트 내역 보기 */
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium"
                    >
                        포인트 내역
                    </button>
                    <button
                        onClick={() => {
                            /* SNS 공유하기 */
                        }}
                        className="flex-1 bg-green-100 text-green-700 py-2 px-4 rounded-lg text-sm font-medium"
                    >
                        공유하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RewardModal;
