import React from 'react';
import BottomTap from '../components/BottomTap';
import BeforeIcon from '../assets/Previous.png';
import { useNavigate } from 'react-router-dom';
import MoneyIcon from '../assets/Money.png';
const PointHistory = () => {
    const navigate = useNavigate();
    return (
        // 화면 높이 기준 세로 레이아웃 + 모바일 폭 제한
        <div className="container-mobile mx-auto w-full max-w-[420px] min-h-[100dvh] flex flex-col bg-zinc-100 py-6">
            {/* 헤더: 아이콘(좌) + 중앙 타이틀 + 투명 스페이서(우) */}
            <div className="pt-[40px] mb-6 px-4">
                <div className="grid grid-cols-[auto_1fr_auto] items-center">
                    <img src={BeforeIcon} alt="before" className="w-[12px] h-[15px]" onClick={() => navigate(-1)} />
                    <h1 className="text-center text-[23px] font-bold">적립 / 사용 내역</h1>
                    <span className="w-4 h-4 invisible" aria-hidden="true" />
                </div>
            </div>

            {/* 초록 카드 */}
            <div className="bg-green-500 text-white rounded-2xl w-[318px] h-[112px] mx-auto flex items-center justify-between px-6 mb-6 relative overflow-hidden">
                <img src={MoneyIcon} alt="" className="absolute bottom-1 left-4 w-[120px] h-[90px] opacity-80" />

                <div className="flex items-baseline justify-center h-full flex-col gap-2 relative">
                    <span className="font-semibold">나의 지역화폐 현황</span>
                    <span className="text-xl font-extrabold">2,500원</span>
                </div>
            </div>

            {/* 내용 시트 */}
            <div className="bg-white rounded-t-[28px] mt-[50px] w-full flex-1 overflow-hidden">
                <div className="px-5 pt-6 pb-[72px] overflow-y-auto">
                    {/* 월 선택 영역 */}
                    <div className="flex items-center gap-2 text-xl font-bold mb-4">
                        <span>8월</span>
                        <span className="text-zinc-500 text-base">▼</span>
                    </div>

                    {/* 8월 10일 그룹 */}
                    <div className="px-5">
                        <div className="text-zinc-400 text-sm mb-2">8월 10일</div>
                        <div className="flex items-center justify-between py-2">
                            <div className="text-[16px]">1시간 뒤 출발 (12:35)</div>
                            <div className="font-extrabold">+100원</div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div className="text-[16px]">45분 뒤 출발 (21:35)</div>
                            <div className="font-extrabold">+80원</div>
                        </div>

                        <hr className="my-4 border-zinc-200" />

                        {/* 8월 01일 그룹 */}
                        <div className="text-zinc-400 text-sm mb-2">8월 01일</div>
                        <div className="flex items-center justify-between py-2">
                            <div className="text-[16px]">1시간 뒤 출발 (12:35)</div>
                            <div className="font-extrabold">+100원</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 고정 하단 탭 */}
            <BottomTap />
        </div>
    );
};

export default PointHistory;
